import test from "node:test";
import assert from "node:assert/strict";
import {
  getCurrentUserFromRequest,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/auth/user-service";
import {
  getIdentityHashSalt,
  hashProviderSubject,
  USER_SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { resetMemoryStore } from "@/lib/data/memory-store";

async function withMemoryAuth<T>(fn: () => Promise<T>) {
  const previous = {
    databaseUrl: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    memoryAuth: process.env.RW_ENABLE_MEMORY_AUTH,
    salt: process.env.AUTH_ID_HASH_SALT,
    nodeEnv: process.env.NODE_ENV,
  };
  const restore = (key: string, value: string | undefined) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  };

  delete process.env.DATABASE_URL;
  delete process.env.DIRECT_URL;
  process.env.RW_ENABLE_MEMORY_AUTH = "true";
  process.env.AUTH_ID_HASH_SALT = "unit-test-identity-salt";
  resetMemoryStore();

  try {
    return await fn();
  } finally {
    restore("DATABASE_URL", previous.databaseUrl);
    restore("DIRECT_URL", previous.directUrl);
    restore("RW_ENABLE_MEMORY_AUTH", previous.memoryAuth);
    restore("AUTH_ID_HASH_SALT", previous.salt);
    restore("NODE_ENV", previous.nodeEnv);
    resetMemoryStore();
  }
}

test("email signup creates an opaque session and me lookup without leaking raw provider ids", async () => {
  await withMemoryAuth(async () => {
    const signup = await signUpWithEmail("User@Example.com", "password-123", {
      ipHash: "ip",
      userAgent: "node-test",
    });

    assert.equal(signup.ok, true);
    assert.ok(signup.data?.token);
    assert.equal(signup.data?.user.email, "user@example.com");
    assert.deepEqual(signup.data?.user.identityProviders, ["email"]);

    const subjectHash = hashProviderSubject("email", "user@example.com");
    assert.equal(typeof subjectHash, "string");
    assert.equal(subjectHash?.includes("user@example.com"), false);

    const request = new Request("http://localhost/api/auth/me", {
      headers: {
        cookie: `${USER_SESSION_COOKIE_NAME}=${encodeURIComponent(signup.data?.token ?? "")}`,
      },
    });
    const currentUser = await getCurrentUserFromRequest(request);
    assert.equal(currentUser?.id, signup.data?.user.id);
  });
});

test("email signin rejects the wrong password and accepts the right password", async () => {
  await withMemoryAuth(async () => {
    await signUpWithEmail("login@example.com", "password-123");

    const rejected = await signInWithEmail("login@example.com", "wrong-password");
    assert.equal(rejected.ok, false);
    assert.equal(rejected.status, 401);

    const accepted = await signInWithEmail("login@example.com", "password-123");
    assert.equal(accepted.ok, true);
    assert.ok(accepted.data?.token);
  });
});

test("production identity hashing fails closed when AUTH_ID_HASH_SALT is missing", () => {
  const previousSalt = process.env.AUTH_ID_HASH_SALT;
  delete process.env.AUTH_ID_HASH_SALT;

  try {
    assert.equal(getIdentityHashSalt("production"), null);
  } finally {
    if (previousSalt === undefined) {
      delete process.env.AUTH_ID_HASH_SALT;
    } else {
      process.env.AUTH_ID_HASH_SALT = previousSalt;
    }
  }
});
