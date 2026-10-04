import type { TemperatureUnit } from '../types/weather'

/** °C değerini seçilen birime çevirip tam sayıya yuvarlar. */
export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  const value = unit === 'F' ? (celsius * 9) / 5 + 32 : celsius
  // -0 yerine 0 gösterilsin.
  return Math.round(value) || 0
}

/** Ör. "18°C"; `withUnit` false ise "18°". */
export function formatTemperature(celsius: number, unit: TemperatureUnit, withUnit = true): string {
  return `${convertTemperature(celsius, unit)}°${withUnit ? unit : ''}`
}

export function parseTemperatureUnit(value: unknown): TemperatureUnit | null {
  return value === 'C' || value === 'F' ? value : null
}
