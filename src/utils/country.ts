const regionNames = new Intl.DisplayNames('tr', { type: 'region' })

/**
 * Ülke adını Türkçe ve kısa haliyle döndürür. API'ler "Türkiye Cumhuriyeti" gibi uzun
 * resmi adlar döndürebiliyor; ülke kodu varsa ondan üretilen ad tercih edilir.
 */
export function formatCountry(countryCode?: string, fallbackName?: string): string {
  if (countryCode) {
    try {
      return regionNames.of(countryCode.toUpperCase()) ?? fallbackName ?? ''
    } catch {
      // Geçersiz ülke kodu: API'nin döndürdüğü ada geri dön.
    }
  }
  return fallbackName ?? ''
}
