type MemoryRecord = Record<string, unknown>;

export interface RongwangMemoryStore {
  accounts: Map<string, MemoryRecord>;
  identities: Map<string, MemoryRecord>;
  sessions: Map<string, MemoryRecord>;
  consultations: Map<string, MemoryRecord>;
  healthProfiles: Map<string, MemoryRecord>;
  assessmentReports: Map<string, MemoryRecord>;
}

const globalForMemory = globalThis as typeof globalThis & {
  __rongwangMemoryStore?: RongwangMemoryStore;
};

export function isMemoryStoreEnabled() {
  return process.env.RW_ENABLE_MEMORY_AUTH === "true" || process.env.RW_ENABLE_MEMORY_DB === "true";
}

export function getMemoryStore() {
  if (!globalForMemory.__rongwangMemoryStore) {
    globalForMemory.__rongwangMemoryStore = {
      accounts: new Map(),
      identities: new Map(),
      sessions: new Map(),
      consultations: new Map(),
      healthProfiles: new Map(),
      assessmentReports: new Map(),
    };
  }

  return globalForMemory.__rongwangMemoryStore;
}

export function resetMemoryStore() {
  globalForMemory.__rongwangMemoryStore = undefined;
}
