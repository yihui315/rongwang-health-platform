import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getMemoryStore, isMemoryStoreEnabled } from "@/lib/data/memory-store";
import {
  createSessionToken,
  getClientIp,
  getIdentityHashSalt,
  getUserAgent,
  hashIp,
  hashPassword,
  hashProviderSubject,
  hashSessionToken,
  normalizeEmail,
  readCookieFromRequest,
  USER_SESSION_COOKIE_NAME,
  USER_SESSION_MAX_AGE_SECONDS,
  verifyPassword,
} from "@/lib/auth/session";

export type IdentityProvider =
  | "email"
  | "wechat_open"
  | "wechat_miniprogram"
  | "wechat_official_account";

export interface UserSummary {
  id: string;
  displayName: string | null;
  email: string | null;
  status: string;
  identityProviders: string[];
  createdAt: string;
}

export interface AuthSessionResult {
  user: UserSummary;
  token: string;
  expiresAt: Date;
}

export interface AuthServiceResult<T> {
  ok: boolean;
  status: number;
  error?: string;
  data?: T;
}

interface RequestMeta {
  ipHash?: string | null;
  userAgent?: string | null;
}

interface WechatIdentityInput {
  provider: Extract<IdentityProvider, "wechat_open" | "wechat_miniprogram" | "wechat_official_account">;
  providerSubject: string;
  unionId?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  metadata?: Record<string, unknown>;
  requestMeta?: RequestMeta;
}

type WechatSessionData = AuthSessionResult & {
  linkedByUnionId: boolean;
  hasUnionId: boolean;
};

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function nowIso() {
  return new Date().toISOString();
}

function providerSubjectKey(provider: string, subjectHash: string) {
  return `${provider}:${subjectHash}`;
}

function serviceUnavailable(): AuthServiceResult<never> {
  return {
    ok: false,
    status: 503,
    error: "auth_database_not_configured",
  };
}

function hashUnavailable(): AuthServiceResult<never> {
  return {
    ok: false,
    status: 503,
    error: "auth_identity_hash_salt_missing",
  };
}

function readRequestMeta(request: Request): RequestMeta {
  return {
    ipHash: hashIp(getClientIp(request)),
    userAgent: getUserAgent(request),
  };
}

function withWechatSessionData(
  session: AuthServiceResult<AuthSessionResult>,
  linkedByUnionId: boolean,
  hasUnionId: boolean,
): AuthServiceResult<WechatSessionData> {
  if (!session.ok || !session.data) {
    return {
      ok: false,
      status: session.status,
      error: session.error,
    };
  }

  return {
    ...session,
    data: {
      ...session.data,
      linkedByUnionId,
      hasUnionId,
    },
  };
}

function mapUserSummary(row: {
  id: string;
  displayName?: string | null;
  email?: string | null;
  status?: string | null;
  createdAt?: Date | string | null;
  identities?: Array<{ provider?: string | null }>;
}): UserSummary {
  return {
    id: row.id,
    displayName: row.displayName ?? null,
    email: row.email ?? null,
    status: row.status ?? "active",
    identityProviders: Array.from(
      new Set((row.identities ?? []).map((identity) => identity.provider).filter(Boolean) as string[]),
    ),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt ?? nowIso()),
  };
}

function memoryUserSummary(accountId: string): UserSummary | null {
  const store = getMemoryStore();
  const account = store.accounts.get(accountId);
  if (!account) {
    return null;
  }

  const identities = Array.from(store.identities.values())
    .filter((identity) => identity.userAccountId === accountId)
    .map((identity) => ({ provider: String(identity.provider ?? "") }));

  return mapUserSummary({
    id: String(account.id),
    displayName: typeof account.displayName === "string" ? account.displayName : null,
    email: typeof account.email === "string" ? account.email : null,
    status: typeof account.status === "string" ? account.status : "active",
    createdAt: typeof account.createdAt === "string" ? account.createdAt : nowIso(),
    identities,
  });
}

async function createSession(
  userAccountId: string,
  requestMeta: RequestMeta = {},
): Promise<AuthServiceResult<AuthSessionResult>> {
  const token = createSessionToken();
  const sessionTokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + USER_SESSION_MAX_AGE_SECONDS * 1000);
  const prisma = getPrisma();

  if (prisma) {
    try {
      const row = await prisma.userAuthSession.create({
        data: {
          userAccountId,
          sessionTokenHash,
          ipHash: requestMeta.ipHash ?? null,
          userAgent: requestMeta.userAgent ?? null,
          expiresAt,
        },
        include: {
          userAccount: {
            include: { identities: true },
          },
        },
      });

      return {
        ok: true,
        status: 200,
        data: {
          user: mapUserSummary(row.userAccount),
          token,
          expiresAt,
        },
      };
    } catch {
      return serviceUnavailable();
    }
  }

  if (!isMemoryStoreEnabled()) {
    return serviceUnavailable();
  }

  const user = memoryUserSummary(userAccountId);
  if (!user) {
    return { ok: false, status: 404, error: "user_not_found" };
  }

  const store = getMemoryStore();
  const id = `sess_${store.sessions.size + 1}`;
  store.sessions.set(sessionTokenHash, {
    id,
    userAccountId,
    sessionTokenHash,
    ipHash: requestMeta.ipHash ?? null,
    userAgent: requestMeta.userAgent ?? null,
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
    createdAt: nowIso(),
  });

  return { ok: true, status: 200, data: { user, token, expiresAt } };
}

export async function signUpWithEmail(
  emailInput: string,
  password: string,
  requestMeta: RequestMeta = {},
): Promise<AuthServiceResult<AuthSessionResult>> {
  if (!getIdentityHashSalt()) {
    return hashUnavailable();
  }

  const email = normalizeEmail(emailInput);
  const providerSubjectHash = hashProviderSubject("email", email);
  if (!providerSubjectHash) {
    return hashUnavailable();
  }

  const credentialHash = hashPassword(password);
  const displayName = email.split("@")[0] || "Rongwang user";
  const prisma = getPrisma();

  if (prisma) {
    try {
      const existing = await prisma.userIdentity.findUnique({
        where: {
          provider_providerSubjectHash: {
            provider: "email",
            providerSubjectHash,
          },
        },
      });

      if (existing) {
        return { ok: false, status: 409, error: "email_already_registered" };
      }

      const account = await prisma.userAccount.create({
        data: {
          displayName,
          email,
          identities: {
            create: {
              provider: "email",
              providerSubjectHash,
              credentialHash,
              displayName,
              metadata: toJson({ emailVerified: false }),
            },
          },
        },
      });

      return createSession(account.id, requestMeta);
    } catch {
      return { ok: false, status: 409, error: "email_already_registered" };
    }
  }

  if (!isMemoryStoreEnabled()) {
    return serviceUnavailable();
  }

  const store = getMemoryStore();
  const key = providerSubjectKey("email", providerSubjectHash);
  if (store.identities.has(key)) {
    return { ok: false, status: 409, error: "email_already_registered" };
  }

  const accountId = `user_${store.accounts.size + 1}`;
  store.accounts.set(accountId, {
    id: accountId,
    displayName,
    email,
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  store.identities.set(key, {
    id: `identity_${store.identities.size + 1}`,
    userAccountId: accountId,
    provider: "email",
    providerSubjectHash,
    credentialHash,
    displayName,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  return createSession(accountId, requestMeta);
}

export async function signInWithEmail(
  emailInput: string,
  password: string,
  requestMeta: RequestMeta = {},
): Promise<AuthServiceResult<AuthSessionResult>> {
  const email = normalizeEmail(emailInput);
  const providerSubjectHash = hashProviderSubject("email", email);
  if (!providerSubjectHash) {
    return hashUnavailable();
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const identity = await prisma.userIdentity.findUnique({
        where: {
          provider_providerSubjectHash: {
            provider: "email",
            providerSubjectHash,
          },
        },
      });

      if (!identity || !verifyPassword(password, identity.credentialHash)) {
        return { ok: false, status: 401, error: "invalid_credentials" };
      }

      await prisma.userIdentity.update({
        where: { id: identity.id },
        data: { lastSeenAt: new Date() },
      });

      return createSession(identity.userAccountId, requestMeta);
    } catch {
      return serviceUnavailable();
    }
  }

  if (!isMemoryStoreEnabled()) {
    return serviceUnavailable();
  }

  const store = getMemoryStore();
  const identity = store.identities.get(providerSubjectKey("email", providerSubjectHash));
  if (!identity || !verifyPassword(password, String(identity.credentialHash ?? ""))) {
    return { ok: false, status: 401, error: "invalid_credentials" };
  }

  identity.lastSeenAt = nowIso();
  return createSession(String(identity.userAccountId), requestMeta);
}

export async function upsertWechatIdentity(
  input: WechatIdentityInput,
): Promise<AuthServiceResult<WechatSessionData>> {
  const providerSubjectHash = hashProviderSubject(input.provider, input.providerSubject);
  const unionIdHash = input.unionId ? hashProviderSubject("wechat_union", input.unionId) : null;

  if (!providerSubjectHash || (input.unionId && !unionIdHash)) {
    return hashUnavailable();
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const existing = await prisma.userIdentity.findUnique({
        where: {
          provider_providerSubjectHash: {
            provider: input.provider,
            providerSubjectHash,
          },
        },
      });

      if (existing) {
        await prisma.userIdentity.update({
          where: { id: existing.id },
          data: {
            unionIdHash,
            displayName: input.displayName ?? undefined,
            avatarUrl: input.avatarUrl ?? undefined,
            metadata: input.metadata ? toJson(input.metadata) : undefined,
            lastSeenAt: new Date(),
          },
        });
        const session = await createSession(existing.userAccountId, input.requestMeta);
        return withWechatSessionData(session, false, Boolean(unionIdHash));
      }

      const unionAccount = unionIdHash
        ? await prisma.userAccount.findFirst({
            where: { identities: { some: { unionIdHash } } },
          })
        : null;

      const account = unionAccount
        ? await prisma.userAccount.update({
            where: { id: unionAccount.id },
            data: {
              displayName: unionAccount.displayName ?? input.displayName ?? undefined,
              identities: {
                create: {
                  provider: input.provider,
                  providerSubjectHash,
                  unionIdHash,
                  displayName: input.displayName ?? null,
                  avatarUrl: input.avatarUrl ?? null,
                  metadata: input.metadata ? toJson(input.metadata) : undefined,
                  lastSeenAt: new Date(),
                },
              },
            },
          })
        : await prisma.userAccount.create({
            data: {
              displayName: input.displayName ?? "WeChat user",
              identities: {
                create: {
                  provider: input.provider,
                  providerSubjectHash,
                  unionIdHash,
                  displayName: input.displayName ?? null,
                  avatarUrl: input.avatarUrl ?? null,
                  metadata: input.metadata ? toJson(input.metadata) : undefined,
                  lastSeenAt: new Date(),
                },
              },
            },
          });

      const session = await createSession(account.id, input.requestMeta);
      return withWechatSessionData(session, Boolean(unionAccount), Boolean(unionIdHash));
    } catch {
      return serviceUnavailable();
    }
  }

  if (!isMemoryStoreEnabled()) {
    return serviceUnavailable();
  }

  const store = getMemoryStore();
  const key = providerSubjectKey(input.provider, providerSubjectHash);
  const existing = store.identities.get(key);
  if (existing) {
    existing.lastSeenAt = nowIso();
    existing.unionIdHash = unionIdHash;
    existing.displayName = input.displayName ?? existing.displayName;
    const session = await createSession(String(existing.userAccountId), input.requestMeta);
    return withWechatSessionData(session, false, Boolean(unionIdHash));
  }

  const unionIdentity = unionIdHash
    ? Array.from(store.identities.values()).find((identity) => identity.unionIdHash === unionIdHash)
    : undefined;
  const accountId = unionIdentity ? String(unionIdentity.userAccountId) : `user_${store.accounts.size + 1}`;

  if (!unionIdentity) {
    store.accounts.set(accountId, {
      id: accountId,
      displayName: input.displayName ?? "WeChat user",
      email: null,
      status: "active",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  store.identities.set(key, {
    id: `identity_${store.identities.size + 1}`,
    userAccountId: accountId,
    provider: input.provider,
    providerSubjectHash,
    unionIdHash,
    displayName: input.displayName ?? null,
    avatarUrl: input.avatarUrl ?? null,
    metadata: input.metadata ?? null,
    lastSeenAt: nowIso(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  const session = await createSession(accountId, input.requestMeta);
  return withWechatSessionData(session, Boolean(unionIdentity), Boolean(unionIdHash));
}

export async function getCurrentUserFromRequest(request: Request): Promise<UserSummary | null> {
  const token = readCookieFromRequest(request, USER_SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }

  const sessionTokenHash = hashSessionToken(decodeURIComponent(token));
  const prisma = getPrisma();

  if (prisma) {
    try {
      const session = await prisma.userAuthSession.findUnique({
        where: { sessionTokenHash },
        include: {
          userAccount: {
            include: { identities: true },
          },
        },
      });

      if (!session || session.revokedAt || session.expiresAt <= new Date()) {
        return null;
      }

      return mapUserSummary(session.userAccount);
    } catch {
      return null;
    }
  }

  if (!isMemoryStoreEnabled()) {
    return null;
  }

  const session = getMemoryStore().sessions.get(sessionTokenHash);
  if (
    !session ||
    session.revokedAt ||
    new Date(String(session.expiresAt)) <= new Date()
  ) {
    return null;
  }

  return memoryUserSummary(String(session.userAccountId));
}

export async function revokeSessionFromRequest(request: Request) {
  const token = readCookieFromRequest(request, USER_SESSION_COOKIE_NAME);
  if (!token) {
    return;
  }

  const sessionTokenHash = hashSessionToken(decodeURIComponent(token));
  const prisma = getPrisma();

  if (prisma) {
    try {
      await prisma.userAuthSession.updateMany({
        where: { sessionTokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Logout remains best-effort.
    }
    return;
  }

  if (isMemoryStoreEnabled()) {
    const session = getMemoryStore().sessions.get(sessionTokenHash);
    if (session) {
      session.revokedAt = nowIso();
    }
  }
}

export function requestMetaFromRequest(request: Request) {
  return readRequestMeta(request);
}
