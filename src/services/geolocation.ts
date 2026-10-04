import type { Coordinates } from '../types/weather'
import { WeatherError, createAbortError } from './errors'

const POSITION_OPTIONS: PositionOptions = {
  // Şehir düzeyinde konum yeterli; yüksek doğruluk hem yavaş hem pil tüketir.
  enableHighAccuracy: false,
  timeout: 15_000,
  // Önbellekteki eski konumu kullanma; kullanıcı butona her bastığında güncel konum alınır.
  maximumAge: 0,
}

/** Gösterilen şehir konum hatasında değişmez; kullanıcı bunu bilsin. */
const KEEPS_CITY = 'Gösterilen şehir değişmedi.'

function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  )
}

function createUnavailableError(): WeatherError {
  return new WeatherError(
    'location-unavailable',
    `Konumunuz belirlenemedi. Cihazınızda konum servislerinin açık olduğundan emin olup tekrar deneyin. ${KEEPS_CITY}`,
  )
}

function toLocationError(error: GeolocationPositionError): WeatherError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new WeatherError(
        'location-denied',
        `Konumunuzu kullanabilmemiz için tarayıcı ayarlarından bu siteye konum izni verin. Dilerseniz şehir adıyla da arama yapabilirsiniz. ${KEEPS_CITY}`,
      )
    case error.TIMEOUT:
      return new WeatherError(
        'location-unavailable',
        `Konumunuz zamanında alınamadı. Lütfen tekrar deneyin ya da şehir adıyla arayın. ${KEEPS_CITY}`,
      )
    default:
      return createUnavailableError()
  }
}

/**
 * Tarayıcının Geolocation API'si ile kullanıcının konumunu alır.
 * Tüm hatalar Türkçe mesajlı `WeatherError`'a çevrilir; `signal` iptal edilirse AbortError fırlatır.
 */
export function getCurrentPosition(signal?: AbortSignal): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext) {
      reject(
        new WeatherError(
          'location-unsupported',
          `Konum özelliği yalnızca güvenli (https) bağlantılarda kullanılabilir. Şehir adıyla arama yapabilirsiniz. ${KEEPS_CITY}`,
        ),
      )
      return
    }
    if (!('geolocation' in navigator)) {
      reject(
        new WeatherError(
          'location-unsupported',
          `Tarayıcınız konum özelliğini desteklemiyor. Şehir adıyla arama yapabilirsiniz. ${KEEPS_CITY}`,
        ),
      )
      return
    }
    if (signal?.aborted) {
      reject(createAbortError())
      return
    }

    // Geolocation isteği iptal edilemiyor; iptal edildiyse gelen sonucu yok sayıyoruz.
    const handleAbort = () => reject(createAbortError())
    signal?.addEventListener('abort', handleAbort, { once: true })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        signal?.removeEventListener('abort', handleAbort)
        const { latitude, longitude } = position.coords
        if (!isValidCoordinates(latitude, longitude)) {
          reject(createUnavailableError())
          return
        }
        resolve({ latitude, longitude })
      },
      (error) => {
        signal?.removeEventListener('abort', handleAbort)
        reject(toLocationError(error))
      },
      POSITION_OPTIONS,
    )
  })
}
