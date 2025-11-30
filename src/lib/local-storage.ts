/**
 * Utility functions for localStorage operations with type safety
 */

/**
 * Get an item from localStorage
 * @param key - The storage key
 * @returns The parsed value or null if not found
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set an item in localStorage
 * @param key - The storage key
 * @param value - The value to store (will be JSON stringified)
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/**
 * Remove an item from localStorage
 * @param key - The storage key
 */
export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
}

/**
 * Check if an item exists in localStorage
 * @param key - The storage key
 * @returns True if the item exists, false otherwise
 */
export function hasStorageItem(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(key) !== null;
}

/**
 * Clear all items from localStorage
 */
export function clearStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}


