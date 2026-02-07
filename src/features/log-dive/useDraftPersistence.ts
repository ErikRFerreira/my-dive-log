import { useCallback, useEffect, useRef } from 'react';

interface UseDraftPersistenceOptions<T> {
  key: string;
  data: T;
  enabled: boolean;
  debounceMs?: number;
}

/**
 * Custom hook for persisting draft data to localStorage with debouncing.
 * 
 * Features:
 * - Debounced writes to prevent excessive localStorage operations
 * - Automatic flush on unmount to ensure data is saved
 * - Enable/disable control to prevent persisting during initialization
 * 
 * @param key - localStorage key for the draft
 * @param data - Current form data to persist
 * @param enabled - Whether persistence is active (false during initial restore)
 * @param debounceMs - Delay before writing to localStorage (default: 400ms)
 */
export function useDraftPersistence<T>({
  key,
  data,
  enabled,
  debounceMs = 400,
}: UseDraftPersistenceOptions<T>) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<T>(data);

  // Keep latest data in ref for flush
  latestDataRef.current = data;

  /**
   * Immediately saves the latest draft to localStorage.
   */
  const flushDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!latestDataRef.current) return;
    window.localStorage.setItem(key, JSON.stringify(latestDataRef.current));
  }, [key]);

  /**
   * Schedules a draft save after debounce delay.
   * Resets timer if called again within the delay period.
   */
  const scheduleSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      flushDraft();
    }, debounceMs);
  }, [flushDraft, debounceMs]);

  /**
   * Auto-save data when it changes (if enabled).
   */
  useEffect(() => {
    if (!enabled) return;
    scheduleSave();
  }, [data, enabled, scheduleSave]);

  /**
   * Flush on unmount to ensure data is saved.
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      flushDraft();
    };
  }, [flushDraft]);

  /**
   * Loads draft from localStorage.
   */
  const loadDraft = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      window.localStorage.removeItem(key);
      return null;
    }
  }, [key]);

  /**
   * Clears draft from localStorage.
   */
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  }, [key]);

  return {
    loadDraft,
    clearDraft,
    flushDraft,
  };
}
