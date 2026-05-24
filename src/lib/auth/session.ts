export const WORKSPACE_SESSION_COOKIE = 'rongwang_workspace_session';

export type WorkspaceSession = {
  email: string;
  role: 'workspace_admin';
  iat: number;
  exp: number;
};

const LOCAL_DEV_SECRET = 'rongwang-local-dev-session-secret-do-not-use-in-production';
const DEFAULT_SESSION_TTL_DAYS = 7;

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required for workspace authentication`);
  }

  return value;
}

function getSessionSecret(): string {
  const secret = process.env.APP_SECRET?.trim() || process.env.JWT_SECRET?.trim();

  if (!secret) {
    if (isProductionRuntime()) {
      throw new Error('APP_SECRET or JWT_SECRET is required for workspace authentication');
    }

    return LOCAL_DEV_SECRET;
  }

  if (isProductionRuntime() && secret.includes('replace-with')) {
    throw new Error('APP_SECRET/JWT_SECRET must be changed before production');
  }

  return secret;
}

export function getWorkspaceAdminEmail(): string {
  const email = process.env.WORKSPACE_ADMIN_EMAIL?.trim() || (isProductionRuntime() ? '' : 'admin@example.com');

  if (!email) {
    return getRequiredEnv('WORKSPACE_ADMIN_EMAIL');
  }

  return email.toLowerCase();
}

function getWorkspaceAdminPassword(): string {
  const password =
    process.env.WORKSPACE_ADMIN_PASSWORD?.trim() || (isProductionRuntime() ? '' : 'change-me-before-production');

  if (!password) {
    return getRequiredEnv('WORKSPACE_ADMIN_PASSWORD');
  }

  if (isProductionRuntime() && password === 'change-me-before-production') {
    throw new Error('WORKSPACE_ADMIN_PASSWORD must be changed before production');
  }

  return password;
}

export function getWorkspaceSessionTtlSeconds(): number {
  const days = Number(process.env.WORKSPACE_SESSION_TTL_DAYS || DEFAULT_SESSION_TTL_DAYS);
  const safeDays = Number.isFinite(days) && days > 0 ? Math.min(days, 30) : DEFAULT_SESSION_TTL_DAYS;
  return Math.round(safeDays * 24 * 60 * 60);
}

export function getWorkspaceSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProductionRuntime(),
    path: '/',
    maxAge: getWorkspaceSessionTtlSeconds(),
  };
}

export function getExpiredWorkspaceSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProductionRuntime(),
    path: '/',
    maxAge: 0,
  };
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeJson(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T {
  const decoded = new TextDecoder().decode(base64UrlToBytes(value));
  return JSON.parse(decoded) as T;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

export async function createWorkspaceSessionToken(email: string, nowMs = Date.now()): Promise<string> {
  const nowSeconds = Math.floor(nowMs / 1000);
  const payload: WorkspaceSession = {
    email: email.trim().toLowerCase(),
    role: 'workspace_admin',
    iat: nowSeconds,
    exp: nowSeconds + getWorkspaceSessionTtlSeconds(),
  };
  const encodedPayload = encodeJson(payload);
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyWorkspaceSessionToken(
  token: string | null | undefined,
  nowMs = Date.now()
): Promise<WorkspaceSession | null> {
  if (!token) return null;

  const [encodedPayload, signature, extra] = token.split('.');
  if (!encodedPayload || !signature || extra) return null;

  try {
    const expectedSignature = await sign(encodedPayload);
    if (!safeEqual(signature, expectedSignature)) return null;

    const session = decodeJson<WorkspaceSession>(encodedPayload);
    const nowSeconds = Math.floor(nowMs / 1000);

    if (session.role !== 'workspace_admin') return null;
    if (!session.email || typeof session.email !== 'string') return null;
    if (!Number.isFinite(session.iat) || !Number.isFinite(session.exp)) return null;
    if (session.exp <= nowSeconds) return null;

    return session;
  } catch {
    return null;
  }
}

function parseCookieHeader(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  for (const cookie of cookieHeader.split(';')) {
    const [rawKey, ...rawValue] = cookie.trim().split('=');
    if (rawKey === name) {
      return rawValue.join('=');
    }
  }

  return undefined;
}

export async function getWorkspaceSessionFromRequest(
  request: Pick<Request, 'headers'>
): Promise<WorkspaceSession | null> {
  const token = parseCookieHeader(request.headers.get('cookie'), WORKSPACE_SESSION_COOKIE);
  return verifyWorkspaceSessionToken(token);
}

export function authenticateWorkspaceAdmin(input: { email: string; password: string }): boolean {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  return email === getWorkspaceAdminEmail() && password === getWorkspaceAdminPassword();
}

export function normalizeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/workspace';
  if (value.startsWith('/api/')) return '/workspace';

  return value;
}
