export function logInfo(message: string, payload?: unknown) {
  console.info(`[INFO] ${message}`, payload ?? '');
}

export function logError(message: string, payload?: unknown) {
  console.error(`[ERROR] ${message}`, payload ?? '');
}
