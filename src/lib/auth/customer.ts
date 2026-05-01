import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  getCustomerLoginPath,
  getCookieValue,
} from "./customer-shared";

export interface CustomerSession {
  accessToken: string;
  user: {
    id?: string;
    email?: string;
  };
}

function normalizeSupabaseUser(value: unknown): CustomerSession["user"] | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const user = value as Record<string, unknown>;
  return {
    id: typeof user.id === "string" ? user.id : undefined,
    email: typeof user.email === "string" ? user.email : undefined,
  };
}

export async function validateCustomerAccessToken(
  accessToken: string | undefined,
): Promise<CustomerSession | null> {
  if (!accessToken) {
    return null;
  }

  const supabase = getSupabaseServer();
  if (supabase.isStub || !supabase.auth?.getUser) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error) {
      return null;
    }

    const user = normalizeSupabaseUser(data?.user);
    if (!user) {
      return null;
    }

    return {
      accessToken,
      user,
    };
  } catch {
    return null;
  }
}

export async function getCustomerSessionFromCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  return validateCustomerAccessToken(accessToken);
}

export async function getCustomerSessionFromRequest(request: Request) {
  const accessToken = getCookieValue(
    request.headers.get("cookie"),
    CUSTOMER_SESSION_COOKIE_NAME,
  );

  return validateCustomerAccessToken(accessToken);
}

export async function requireCustomerSession(nextPath = "/dashboard") {
  const session = await getCustomerSessionFromCookies();
  if (!session) {
    redirect(getCustomerLoginPath(nextPath));
  }

  return session;
}
