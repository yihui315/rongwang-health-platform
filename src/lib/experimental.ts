const STORAGE_KEY = "rongwang_experimental_mode";

/** Check if experimental mode is enabled (client-side only). */
export function isExperimentalEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "on";
}

/** Enable experimental mode. */
export function enableExperimental(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "on");
  window.dispatchEvent(new Event("experimental-change"));
}

/** Disable experimental mode. */
export function disableExperimental(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("experimental-change"));
}

/** Toggle experimental mode and return the new state. */
export function toggleExperimental(): boolean {
  const next = !isExperimentalEnabled();
  if (next) {
    enableExperimental();
  } else {
    disableExperimental();
  }
  return next;
}
