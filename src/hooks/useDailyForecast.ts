import { useEffect, useState } from 'react'
import { isAbortError } from '../services/errors'
import { getDailyForecast } from '../services/weatherService'
import type { DailyForecast, ForecastRange, WeatherData } from '../types/weather'

interface DailyForecastResult {
  /** Gösterilecek günler. 15 günlük veri yüklenirken/alınamazsa 7 günlük veri gösterilir. */
  days: DailyForecast[]
  isLoading: boolean
  /** Kullanıcıya gösterilecek Türkçe uyarı (veri alınamadı ya da istenenden az gün geldi). */
  notice: string | null
}

/** 15 günlük isteğin sonucu; hangi hava verisi için alındığını da tutar. */
interface ExtendedResult {
  forWeather: WeatherData
  days: DailyForecast[] | null
}

/**
 * Seçili görünüme göre günlük tahmin listesini verir.
 * - 7 günlük: ana hava isteğindeki 7 gün kullanılır (ek istek yok).
 * - 15 günlük: Open-Meteo'dan `forecast_days=15` ile ayrıca istenir. Sonuç gösterilen hava
 *   verisine bağlıdır; şehir/konum değişince ya da arka plan yenilemesinde yeniden alınır,
 *   7 ↔ 15 arasında gidip gelmek tekrar istek atmaz.
 */
export function useDailyForecast(
  weather: WeatherData | null,
  range: ForecastRange,
): DailyForecastResult {
  const [extended, setExtended] = useState<ExtendedResult | null>(null)
  const isCurrent = !!weather && extended?.forWeather === weather

  useEffect(() => {
    if (range !== 15 || !weather || isCurrent) return
    const controller = new AbortController()

    getDailyForecast(weather.location, range, controller.signal)
      .then((days) => setExtended({ forWeather: weather, days }))
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) return
        setExtended({ forWeather: weather, days: null })
      })

    return () => controller.abort()
  }, [weather, range, isCurrent])

  const shortDays = weather?.forecast ?? []
  if (range === 7) return { days: shortDays, isLoading: false, notice: null }
  if (!isCurrent || !extended) return { days: shortDays, isLoading: true, notice: null }

  if (!extended.days || extended.days.length === 0) {
    return {
      days: shortDays,
      isLoading: false,
      notice: '15 günlük tahmin şu anda alınamıyor. Bunun yerine 7 günlük tahmin gösteriliyor.',
    }
  }
  if (extended.days.length < range) {
    return {
      days: extended.days,
      isLoading: false,
      notice: `Open-Meteo bu konum için şu anda yalnızca ${extended.days.length} günlük tahmin sağlıyor.`,
    }
  }
  return { days: extended.days, isLoading: false, notice: null }
}
