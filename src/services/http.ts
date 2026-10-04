import { WeatherError, isAbortError } from './errors'

/** JSON getirir; ağ/sunucu hatalarını Türkçe mesajlı `WeatherError`'a çevirir, iptali olduğu gibi iletir. */
export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    // İptal edilen istekleri olduğu gibi ilet; diğer ağ hatalarını anlaşılır hataya çevir.
    if (isAbortError(error)) throw error
    throw new WeatherError('network', 'İnternet bağlantınızı kontrol edip tekrar deneyin.')
  }

  if (!response.ok) {
    throw new WeatherError(
      'server',
      'Hava durumu verisi şu anda alınamıyor. Lütfen birkaç dakika sonra tekrar deneyin.',
    )
  }

  try {
    return (await response.json()) as T
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new WeatherError('server', 'Hava durumu servisinden geçersiz bir yanıt alındı.')
  }
}
