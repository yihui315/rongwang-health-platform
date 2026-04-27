type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, boolean | number | string | null | undefined>;

function write(level: LogLevel, event: string, fields: LogFields = {}) {
  const payload = {
    event,
    service: "rongwang-health-platform",
    timestamp: new Date().toISOString(),
    ...fields,
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

export function logApiEvent(event: string, fields: LogFields = {}) {
  write("info", event, fields);
}

export function logApiWarning(event: string, fields: LogFields = {}) {
  write("warn", event, fields);
}

export function logApiError(event: string, fields: LogFields = {}) {
  write("error", event, fields);
}

