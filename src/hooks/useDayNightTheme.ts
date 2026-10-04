import { useEffect } from 'react'

type Theme = 'day' | 'night'

/**
 * Sayfanın gündüz/gece temasını gösterilen şehrin Open-Meteo `is_day` verisine göre
 * <html data-theme="..."> olarak uygular (kullanıcının bilgisayar saatine göre değil).
 * Renkler ve geçişler index.css'teki değişkenlerle yönetilir.
 *
 * `isDay` henüz yoksa (ilk yükleme) mevcut tema korunur; varsayılan index.html'deki "night".
 */
export function useDayNightTheme(isDay: boolean | undefined): void {
  useEffect(() => {
    if (isDay === undefined) return
    const theme: Theme = isDay ? 'day' : 'night'
    document.documentElement.dataset.theme = theme
  }, [isDay])
}
