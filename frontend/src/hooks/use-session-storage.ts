"use client";

import { useState, useCallback } from "react";

const memoryStore = new Map<string, string>();
let warnedOnce = false;

function canUseSessionStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_probe__";
    window.sessionStorage.setItem(testKey, "1");
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch (err) {
    if (!warnedOnce) {
      console.warn(
        "[safeStorage] sessionStorage is unavailable or blocked (e.g., strict private browsing). Degrading to in-memory fallback.",
        err
      );
      warnedOnce = true;
    }
    return false;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      if (canUseSessionStorage()) {
        return window.sessionStorage.getItem(key);
      }
    } catch (err) {
      console.warn(`[safeStorage] Read failed for key "${key}":`, err);
    }
    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      if (canUseSessionStorage()) {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch (err) {
      console.warn(`[safeStorage] Write failed for key "${key}":`, err);
    }
    memoryStore.set(key, value);
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      if (canUseSessionStorage()) {
        window.sessionStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[safeStorage] Removal failed for key "${key}":`, err);
    }
    memoryStore.delete(key);
  },

  getJSON<T>(key: string): T | null {
    const raw = safeStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJSON<T>(key: string, value: T): void {
    try {
      safeStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[safeStorage] JSON serialization failed for key "${key}":`, err);
    }
  },
};

/**
 * React hook for safe, defensive sessionStorage synchronization with zero cascading renders.
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (val: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const cached = safeStorage.getJSON<T>(key);
    return cached !== null ? cached : initialValue;
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const resolved = value instanceof Function ? value(prev) : value;
        safeStorage.setJSON(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    safeStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
