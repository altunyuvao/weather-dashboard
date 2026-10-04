export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'foggy'
  | 'rainy'
  | 'snowy'
  | 'stormy'

export type TemperatureUnit = 'C' | 'F'

/** Yerin nereden geldiği: manuel şehir araması mı, "Konumumu kullan" mı. */
export type LocationSource = 'search' | 'location'

/**
 * Konumu belirlenmiş yer; son aramalar ve favoriler bu yapıda saklanır.
 * Ekrandaki başlık/alt satırlar bu alanlardan `utils/locationLabel` ile üretilir.
 * Kayıtlı yer her zaman koordinatlarıyla açılır; tekrar metin araması yapılmaz.
 */
export interface CityLocation {
  id: string
  source: LocationSource
  /** Ana başlık. Konumda mahalle → ilçe → şehir; aramada şehir adı. Hiçbir zaman boş değil. */
  displayName: string
  /** Mahalle / köy (yalnızca konum sonuçlarında) */
  neighbourhood?: string
  /** İlçe (yalnızca konum sonuçlarında) */
  district?: string
  /** Şehir / il */
  city?: string
  /** Aramada il/bölge (Open-Meteo admin1), ör. "Kadıköy" araması için "İstanbul" */
  region?: string
  /** Boş olabilir; arayüzde boşsa gösterilmez. */
  country: string
  /** Konum sonuçlarında kullanıcının gerçek koordinatı, aramada şehrin koordinatı */
  latitude: number
  longitude: number
  /** Konum verisinin kaynağı için gösterilmesi gereken atıf, ör. OpenStreetMap. */
  attribution?: string
}

/** Sıcaklıklar her zaman °C olarak tutulur; birim dönüşümü gösterim sırasında yapılır. */
export interface CurrentWeather {
  temperature: number
  feelsLike: number
  condition: WeatherCondition
  /** Open-Meteo WMO hava kodu; arka plan animasyonu buna göre seçilir. */
  weatherCode: number
  description: string
  humidity: number
  windSpeed: number
  isDay: boolean
}

export interface HourlyForecast {
  /** Konumun yerel saatiyle ISO zaman damgası, ör. "2026-10-03T21:00" */
  time: string
  /** Gösterime hazır saat, ör. "21:00" */
  hour: string
  /** °C; API değer döndürmezse null */
  temperature: number | null
  condition: WeatherCondition
  description: string
  isDay: boolean
}

export interface WindDirection {
  degrees: number
  /** Ör. "Kuzeydoğu" */
  label: string
}

export interface UvIndex {
  value: number
  /** Ör. "Orta" */
  level: string
}

/** Hava detayları. Alınamayan her değer null olur ve arayüzde "Veri yok" gösterilir. */
export interface WeatherDetails {
  precipitationProbability: number | null
  /** hPa (deniz seviyesi) */
  pressure: number | null
  /** km */
  visibility: number | null
  /** "06:20" biçiminde, konumun yerel saati */
  sunrise: string | null
  sunset: string | null
  uvIndex: UvIndex | null
  uvIndexMax: UvIndex | null
  windDirection: WindDirection | null
}

/** Günlük tahmin görünümü: kaç günlük liste gösterilir. */
export type ForecastRange = 7 | 15

export interface DailyForecast {
  date: string
  /** "Bugün" ya da gün adı, ör. "Pazartesi" */
  day: string
  /** Kısa tarih, ör. "6 Eki" (15 günde gün adları tekrar ettiği için) */
  dateLabel: string
  condition: WeatherCondition
  description: string
  high: number
  low: number
}

export interface WeatherData {
  location: CityLocation
  current: CurrentWeather
  details: WeatherDetails
  hourly: HourlyForecast[]
  forecast: DailyForecast[]
}

export type WeatherErrorKind =
  | 'not-found'
  | 'network'
  | 'server'
  /** Kullanıcı konum iznini reddetti. */
  | 'location-denied'
  /** Tarayıcı konum özelliğini desteklemiyor (veya sayfa güvenli bağlantıda değil). */
  | 'location-unsupported'
  /** Konum belirlenemedi ya da zaman aşımına uğradı. */
  | 'location-unavailable'

/** Tarayıcının Geolocation API'sinden alınan konum. */
export interface Coordinates {
  latitude: number
  longitude: number
}

/** Arayüzde gösterilecek hata bilgisi. */
export interface WeatherErrorInfo {
  kind: WeatherErrorKind
  title: string
  message: string
}

/* Open-Meteo API yanıt tipleri */

export interface GeocodingResult {
  id?: number
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
  /** İl / eyalet */
  admin1?: string
}

export interface GeocodingResponse {
  results?: GeocodingResult[]
}

/** Ters coğrafi kodlamadan çıkarılan, en ayrıntılıdan en genele yer adları. */
export interface PlaceParts {
  /** Mahalle / semt / köy */
  neighbourhood?: string
  /** İlçe */
  district?: string
  /** Şehir / il */
  city?: string
  country?: string
}

/** OpenStreetMap Nominatim /reverse yanıtı (koordinat → adres); yalnızca kullanılan alanlar. */
export interface NominatimReverseResponse {
  error?: string
  address?: {
    neighbourhood?: string
    quarter?: string
    suburb?: string
    village?: string
    hamlet?: string
    town?: string
    city_district?: string
    district?: string
    county?: string
    city?: string
    municipality?: string
    province?: string
    state?: string
    country?: string
    country_code?: string
  }
}

/** BigDataCloud ters coğrafi kodlama yanıtı (yedek servis); yalnızca kullanılan alanlar. */
export interface BigDataCloudReverseResponse {
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
  countryCode?: string
  localityInfo?: {
    administrative?: { name?: string; description?: string; adminLevel?: number; order?: number }[]
  }
}

// Open-Meteo bazı değerleri null döndürebilir; yeni alanlar bu yüzden null/opsiyonel tanımlı.
export interface ForecastResponse {
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    is_day?: number | null
    precipitation_probability?: number | null
    pressure_msl?: number | null
    visibility?: number | null
    uv_index?: number | null
    wind_direction_10m?: number | null
  }
  hourly?: {
    time: string[]
    temperature_2m?: (number | null)[]
    weather_code?: (number | null)[]
    is_day?: (number | null)[]
  }
  daily: {
    time: string[]
    // Uzak günlerde değer gelmeyebilir; eşleme sırasında eksik günler atlanır.
    weather_code: (number | null)[]
    temperature_2m_max: (number | null)[]
    temperature_2m_min: (number | null)[]
    sunrise?: (string | null)[]
    sunset?: (string | null)[]
    uv_index_max?: (number | null)[]
  }
}

/** Yalnızca günlük alanlarla yapılan tahmin isteğinin yanıtı (7/15 günlük liste). */
export interface DailyForecastResponse {
  daily: ForecastResponse['daily']
}
