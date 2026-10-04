import type { WeatherCondition } from '../types/weather'

interface WeatherCodeInfo {
  description: string
  condition: WeatherCondition
}

// WMO hava durumu kodları: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { description: 'Güneşli', condition: 'sunny' },
  1: { description: 'Az Bulutlu', condition: 'sunny' },
  2: { description: 'Parçalı Bulutlu', condition: 'partly-cloudy' },
  3: { description: 'Bulutlu', condition: 'cloudy' },
  45: { description: 'Sisli', condition: 'foggy' },
  48: { description: 'Kırağılı Sis', condition: 'foggy' },
  51: { description: 'Hafif Çisenti', condition: 'rainy' },
  53: { description: 'Çisenti', condition: 'rainy' },
  55: { description: 'Yoğun Çisenti', condition: 'rainy' },
  56: { description: 'Dondurucu Çisenti', condition: 'rainy' },
  57: { description: 'Yoğun Dondurucu Çisenti', condition: 'rainy' },
  61: { description: 'Hafif Yağmurlu', condition: 'rainy' },
  63: { description: 'Yağmurlu', condition: 'rainy' },
  65: { description: 'Şiddetli Yağmurlu', condition: 'rainy' },
  66: { description: 'Dondurucu Yağmur', condition: 'rainy' },
  67: { description: 'Şiddetli Dondurucu Yağmur', condition: 'rainy' },
  71: { description: 'Hafif Kar Yağışlı', condition: 'snowy' },
  73: { description: 'Kar Yağışlı', condition: 'snowy' },
  75: { description: 'Yoğun Kar Yağışlı', condition: 'snowy' },
  77: { description: 'Kar Taneleri', condition: 'snowy' },
  80: { description: 'Hafif Sağanak', condition: 'rainy' },
  81: { description: 'Sağanak Yağışlı', condition: 'rainy' },
  82: { description: 'Şiddetli Sağanak', condition: 'rainy' },
  85: { description: 'Hafif Kar Sağanağı', condition: 'snowy' },
  86: { description: 'Yoğun Kar Sağanağı', condition: 'snowy' },
  95: { description: 'Gök Gürültülü Fırtına', condition: 'stormy' },
  96: { description: 'Dolu ile Fırtına', condition: 'stormy' },
  99: { description: 'Şiddetli Dolu ile Fırtına', condition: 'stormy' },
}

const UNKNOWN: WeatherCodeInfo = { description: 'Bilinmiyor', condition: 'cloudy' }

export function getWeatherInfo(code: number, isDay = true): WeatherCodeInfo {
  const info = WEATHER_CODES[code] ?? UNKNOWN
  // Gece açık hava için "Güneşli" yerine "Açık" diyoruz.
  if (!isDay && code === 0) return { ...info, description: 'Açık' }
  return info
}

/** Arka plandaki hafif hava animasyonu türü. */
export type Atmosphere = 'drizzle' | 'rain' | 'snow' | 'storm' | 'none'

// Open-Meteo WMO hava kodları → animasyon. Listede olmayan kodlar (0–3 açık/bulutlu,
// 45/48 sis vb.) animasyonsuzdur.
const ATMOSPHERE_BY_CODE: Record<number, Atmosphere> = {
  // Çisenti ve donan çisenti
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'drizzle',
  57: 'drizzle',
  // Yağmur, donan yağmur ve sağanak
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'rain',
  67: 'rain',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  // Kar ve kar sağanağı
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  85: 'snow',
  86: 'snow',
  // Gök gürültülü fırtına
  95: 'storm',
  96: 'storm',
  99: 'storm',
}

/** Animasyon türünü ekrandaki metinden değil, doğrudan Open-Meteo hava kodundan seçer. */
export function getAtmosphere(code: number): Atmosphere {
  return ATMOSPHERE_BY_CODE[code] ?? 'none'
}
