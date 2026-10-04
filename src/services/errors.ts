import type { WeatherErrorInfo, WeatherErrorKind } from '../types/weather'

/** Servislerin fırlattığı, kullanıcıya gösterilebilir hata. */
export class WeatherError extends Error {
  readonly kind: WeatherErrorKind

  constructor(kind: WeatherErrorKind, message: string) {
    super(message)
    this.name = 'WeatherError'
    this.kind = kind
  }
}

const ERROR_TITLES: Record<WeatherErrorKind, string> = {
  'not-found': 'Şehir bulunamadı',
  network: 'Bağlantı sorunu',
  server: 'Hava durumu servisine ulaşılamadı',
  'location-denied': 'Konum izni verilmedi',
  'location-unsupported': 'Konum kullanılamıyor',
  'location-unavailable': 'Konum alınamadı',
}

/** Her türlü hatayı arayüzde gösterilecek Türkçe başlık ve mesaja çevirir. */
export function toErrorInfo(error: unknown): WeatherErrorInfo {
  if (error instanceof WeatherError) {
    return { kind: error.kind, title: ERROR_TITLES[error.kind], message: error.message }
  }
  // Beklenmeyen (ör. eksik/bozuk API yanıtı) hatalarda teknik mesajı kullanıcıya göstermiyoruz.
  return {
    kind: 'server',
    title: ERROR_TITLES.server,
    message: 'Beklenmeyen bir sorun oluştu. Lütfen biraz sonra tekrar deneyin.',
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function createAbortError(): DOMException {
  return new DOMException('İstek iptal edildi.', 'AbortError')
}
