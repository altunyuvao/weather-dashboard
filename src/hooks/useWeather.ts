import { useCallback, useEffect, useRef, useState } from 'react'
import { toErrorInfo } from '../services/errors'
import {
  getWeatherByCity,
  getWeatherByLocation,
  getWeatherForCurrentPosition,
} from '../services/weatherService'
import type { CityLocation, WeatherData, WeatherErrorInfo } from '../types/weather'

type WeatherQuery = string | CityLocation
type WeatherLoader = (signal: AbortSignal) => Promise<WeatherData>
type SuccessHandler = (data: WeatherData) => void

/** Gösterilen veri bu süreden eskiyse arka planda sessizce yenilenir. */
const REFRESH_INTERVAL_MS = 15 * 60 * 1000
/** Verinin eskiyip eskimediği bu aralıkla kontrol edilir. */
const STALE_CHECK_INTERVAL_MS = 60 * 1000

interface UseWeatherResult {
  weather: WeatherData | null
  isLoading: boolean
  error: WeatherErrorInfo | null
  /** "Konumumu kullan" isteği sürüyor (konum alınıyor veya o konumun verisi yükleniyor). */
  isLocating: boolean
  /** Şehir adı ile arar ya da kayıtlı bir konumu yükler. Başarılı olursa `onSuccess` çağrılır. */
  loadWeather: (query: WeatherQuery, onSuccess?: SuccessHandler) => void
  /** Tarayıcıdan kullanıcının konumunu alıp oranın hava durumunu yükler. */
  loadCurrentLocation: (onSuccess?: SuccessHandler) => void
}

function toLoader(query: WeatherQuery): WeatherLoader {
  return (signal) =>
    typeof query === 'string' ? getWeatherByCity(query, signal) : getWeatherByLocation(query, signal)
}

export function useWeather(defaultCity: string): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  // İlk açılışta varsayılan şehir yükleneceği için true başlıyor.
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<WeatherErrorInfo | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Arka plan yenilemesi için: gösterilen şehir, son başarılı yükleme zamanı ve devam eden istek.
  const locationRef = useRef<CityLocation | null>(null)
  const updatedAtRef = useRef(0)
  const isBusyRef = useRef(false)

  const applyWeather = useCallback((data: WeatherData) => {
    setWeather(data)
    locationRef.current = data.location
    updatedAtRef.current = Date.now()
  }, [])

  const fetchWeather = useCallback(
    (loader: WeatherLoader, onSuccess?: SuccessHandler) => {
      // Önceki istek hâlâ sürüyorsa iptal et; eski yanıt yenisinin üzerine yazmasın.
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      isBusyRef.current = true

      loader(controller.signal)
        .then((data) => {
          applyWeather(data)
          setError(null)
          onSuccess?.(data)
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          setError(toErrorInfo(err))
        })
        .finally(() => {
          if (controller.signal.aborted) return
          setIsLoading(false)
          setIsLocating(false)
          isBusyRef.current = false
        })
    },
    [applyWeather],
  )

  const loadWeather = useCallback(
    (query: WeatherQuery, onSuccess?: SuccessHandler) => {
      setIsLoading(true)
      setIsLocating(false)
      setError(null)
      fetchWeather(toLoader(query), onSuccess)
    },
    [fetchWeather],
  )

  const loadCurrentLocation = useCallback(
    (onSuccess?: SuccessHandler) => {
      setIsLoading(true)
      setIsLocating(true)
      setError(null)
      fetchWeather(getWeatherForCurrentPosition, onSuccess)
    },
    [fetchWeather],
  )

  /**
   * Veri eskidiyse mevcut şehri sessizce yeniler (yükleniyor/hata göstermeden).
   * Böylece sayfa açık kalsa bile ör. sabah olduğunda ay ikonu güneşe döner ve
   * saatlik tahmin "Şimdi"den itibaren güncel kalır.
   */
  const refreshIfStale = useCallback(() => {
    const location = locationRef.current
    if (!location || isBusyRef.current || document.hidden) return
    if (Date.now() - updatedAtRef.current < REFRESH_INTERVAL_MS) return

    const controller = new AbortController()
    abortRef.current = controller
    isBusyRef.current = true

    getWeatherByLocation(location, controller.signal)
      .then(applyWeather)
      .catch(() => {
        // Sessiz yenileme başarısız olursa mevcut veri kalır; bir sonraki kontrolde tekrar denenir.
      })
      .finally(() => {
        if (!controller.signal.aborted) isBusyRef.current = false
      })
  }, [applyWeather])

  useEffect(() => {
    fetchWeather(toLoader(defaultCity))
    return () => abortRef.current?.abort()
  }, [fetchWeather, defaultCity])

  useEffect(() => {
    const intervalId = window.setInterval(refreshIfStale, STALE_CHECK_INTERVAL_MS)
    // Sekmeye geri dönüldüğünde (ör. bilgisayar uykudan uyanınca) hemen kontrol et.
    document.addEventListener('visibilitychange', refreshIfStale)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshIfStale)
    }
  }, [refreshIfStale])

  return { weather, isLoading, error, isLocating, loadWeather, loadCurrentLocation }
}
