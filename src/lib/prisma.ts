import type { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  __rongwangPrisma?: PrismaClient;
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrisma(): PrismaClient | null {
  if (!hasDatabaseUrl()) {
    return null;
  }

  if (!globalForPrisma.__rongwangPrisma) {
    // Lazy init keeps build-time evaluation safe when env vars are absent.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client") as { PrismaClient: new () => PrismaClient };
    globalForPrisma.__rongwangPrisma = new PrismaClient();
  }

  return globalForPrisma.__rongwangPrisma;
}
