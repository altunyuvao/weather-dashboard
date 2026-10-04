// localStorage erişimi gizli sekme, kota dolması veya bozuk JSON gibi durumlarda hata
// fırlatabilir. Bu yardımcılar hataları yutar; uygulama hiçbir durumda çökmez.

const PREFIX = 'weather-dashboard:'

export const STORAGE_KEYS = {
  recentCities: 'recent-cities',
  favoriteCities: 'favorite-cities',
  temperatureUnit: 'temperature-unit',
  forecastRange: 'forecast-range',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/**
 * Kayıtlı değeri okur. `parse` değeri doğrular ve gerekirse eski formattan dönüştürür;
 * null dönerse (veya okuma hata verirse) `fallback` kullanılır.
 */
export function readStorage<T>(
  key: StorageKey,
  fallback: T,
  parse: (value: unknown) => T | null,
): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return parse(JSON.parse(raw) as unknown) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: StorageKey, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Kaydedilemezse veri yalnızca bu oturum boyunca bellekte kalır.
  }
}
