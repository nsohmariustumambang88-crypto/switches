"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Reads a browser-only value (storage, media queries) without a hydration
 * mismatch: the server snapshot renders first, then the client value.
 */
export function useBrowserValue<T>(read: () => T, server: T) {
  return useSyncExternalStore(noop, read, () => server);
}

export function readStorage(kind: "local" | "session", key: string) {
  try {
    return (kind === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
