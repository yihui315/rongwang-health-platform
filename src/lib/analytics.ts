export function track(event: string, payload?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    console.log("[analytics]", event, payload ?? {});
  }
}
