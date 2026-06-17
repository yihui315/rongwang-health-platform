"use client";

import { useEffect, useRef } from "react";
import { trackAnalyticsEvent, type AnalyticsEvent } from "@/lib/analytics";

export function useTrackOnce(
  event: AnalyticsEvent | (() => AnalyticsEvent),
  key = "default",
) {
  const trackedKeysRef = useRef(new Set<string>());
  const eventRef = useRef(event);
  eventRef.current = event;

  useEffect(() => {
    if (trackedKeysRef.current.has(key)) {
      return;
    }

    trackedKeysRef.current.add(key);
    const currentEvent = eventRef.current;
    trackAnalyticsEvent(
      typeof currentEvent === "function" ? currentEvent() : currentEvent,
    );
  }, [key]);
}
