import type { ForecastRange } from '../types/weather'

/** Günlük tahmin sekmeleri (sırasıyla gösterilir). Varsayılan 7 günlük. */
export const FORECAST_RANGES: { value: ForecastRange; label: string }[] = [
  { value: 7, label: '7 Günlük' },
  { value: 15, label: '15 Günlük' },
]

export const DEFAULT_FORECAST_RANGE: ForecastRange = 7

/** localStorage'daki seçimi okur; geçersizse null (varsayılan kullanılır). */
export function parseForecastRange(value: unknown): ForecastRange | null {
  return value === 7 || value === 15 ? value : null
}
