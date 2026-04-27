export type AttributionContext = {
  sessionId?: string;
  ref?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
};

function parseCookieString(cookieString: string) {
  return cookieString
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}

function parseUtmCookie(value: string | undefined): AttributionContext["utm"] {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      source: typeof parsed.source === "string" ? parsed.source : undefined,
      medium: typeof parsed.medium === "string" ? parsed.medium : undefined,
      campaign: typeof parsed.campaign === "string" ? parsed.campaign : undefined,
    };
  } catch {
    return undefined;
  }
}

export function readAttributionCookies(cookieString: string): AttributionContext {
  const cookies = parseCookieString(cookieString);
  return {
    sessionId: cookies.rw_session,
    ref: cookies.rw_ref,
    utm: parseUtmCookie(cookies.rw_utm),
  };
}
