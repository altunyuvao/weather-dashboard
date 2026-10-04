import type {
  CityLocation,
  DailyForecast,
  DailyForecastResponse,
  ForecastResponse,
  GeocodingResponse,
  GeocodingResult,
  HourlyForecast,
  UvIndex,
  WeatherData,
  WeatherDetails,
  WindDirection,
} from '../types/weather'
import { formatCountry } from '../utils/country'
import { sameName } from '../utils/locationLabel'
import { getWeatherInfo } from '../utils/weatherCodes'
import { WeatherError } from './errors'
import { getCurrentPosition } from './geolocation'
import { fetchJson } from './http'
import { reverseGeocode } from './reverseGeocoding'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
/** Ana istekte gelen gün sayısı; varsayılan "7 Günlük" görünüm bu veriyi kullanır. */
const FORECAST_DAYS = 7
/** Open-Meteo forecast_days için izin verilen en büyük değer. */
const MAX_FORECAST_DAYS = 16
const HOURLY_FORECAST_COUNT = 12

async function geocodeCity(city: string, signal?: AbortSignal): Promise<CityLocation> {
  const params = new URLSearchParams({ name: city, count: '10', language: 'tr', format: 'json' })
  const data = await fetchJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`, signal)

  // Open-Meteo bazen alternatif adla eşleşen başka bir yeri öne koyuyor (ör. "Kadıköy" → "Babadağ").
  // Adı aranan metinle birebir aynı olan ilk sonucu tercih ediyoruz; yoksa ilk sonuç.
  const results = data.results ?? []
  const result = results.find((item) => sameName(item.name, city)) ?? results[0]
  if (!result) {
    throw new WeatherError(
      'not-found',
      `“${city}” adında bir şehir bulamadık. Yazımı kontrol edip tekrar deneyin.`,
    )
  }
  return toCityLocation(result)
}

async function fetchForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
      'is_day',
      'precipitation_probability',
      'pressure_msl',
      'visibility',
      'uv_index',
    ].join(','),
    hourly: 'temperature_2m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS),
  })
  return fetchJson<ForecastResponse>(`${FORECAST_URL}?${params}`, signal)
}

const dayFormatter = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' })
const shortDateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })

function formatDay(isoDate: string, index: number): string {
  if (index === 0) return 'Bugün'
  // Saat ekleyerek tarihin UTC olarak yorumlanıp bir gün kaymasını önlüyoruz.
  return dayFormatter.format(new Date(`${isoDate}T12:00:00`))
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Günlük veriyi eşler. Sıcaklığı veya hava kodu eksik günler uydurulmaz, atlanır. */
function mapDailyForecast(daily: ForecastResponse['daily']): DailyForecast[] {
  return daily.time.flatMap((date, index) => {
    const code = daily.weather_code[index]
    const high = daily.temperature_2m_max[index]
    const low = daily.temperature_2m_min[index]
    if (!isNumber(code) || !isNumber(high) || !isNumber(low)) return []

    const info = getWeatherInfo(code)
    return [
      {
        date,
        day: formatDay(date, index),
        // Saat ekleyerek tarihin UTC olarak yorumlanıp bir gün kaymasını önlüyoruz.
        dateLabel: shortDateFormatter.format(new Date(`${date}T12:00:00`)),
        condition: info.condition,
        description: info.description,
        high,
        low,
      },
    ]
  })
}

/** "2026-10-03T06:20" → "06:20". Saat zaten konumun yerel saati olduğu için Date'e çevirmiyoruz. */
function formatTime(isoDateTime: string | null | undefined): string | null {
  const match = isoDateTime ? /T(\d{2}:\d{2})/.exec(isoDateTime) : null
  return match ? match[1] : null
}

const WIND_DIRECTIONS = [
  'Kuzey',
  'Kuzeydoğu',
  'Doğu',
  'Güneydoğu',
  'Güney',
  'Güneybatı',
  'Batı',
  'Kuzeybatı',
]

/** Rüzgarın estiği yönü (meteorolojik derece) 8 ana yönden birine çevirir. */
function toWindDirection(degrees: number | null | undefined): WindDirection | null {
  if (!isNumber(degrees)) return null
  const normalized = ((degrees % 360) + 360) % 360
  return {
    degrees: Math.round(normalized),
    label: WIND_DIRECTIONS[Math.round(normalized / 45) % WIND_DIRECTIONS.length],
  }
}

/** WHO UV indeksi seviyeleri. */
function toUvIndex(value: number | null | undefined): UvIndex | null {
  if (!isNumber(value)) return null
  const rounded = Math.round(value * 10) / 10
  let level = 'Aşırı'
  if (rounded < 3) level = 'Düşük'
  else if (rounded < 6) level = 'Orta'
  else if (rounded < 8) level = 'Yüksek'
  else if (rounded < 11) level = 'Çok Yüksek'
  return { value: rounded, level }
}

function mapDetails(forecast: ForecastResponse): WeatherDetails {
  const { current, daily } = forecast
  const visibility = current.visibility

  return {
    precipitationProbability: isNumber(current.precipitation_probability)
      ? Math.round(current.precipitation_probability)
      : null,
    pressure: isNumber(current.pressure_msl) ? Math.round(current.pressure_msl) : null,
    // Metre → km; 10 km altında bir ondalık basamak yeterli.
    visibility: isNumber(visibility)
      ? visibility < 10000
        ? Math.round(visibility / 100) / 10
        : Math.round(visibility / 1000)
      : null,
    sunrise: formatTime(daily.sunrise?.[0]),
    sunset: formatTime(daily.sunset?.[0]),
    uvIndex: toUvIndex(current.uv_index),
    uvIndexMax: toUvIndex(daily.uv_index_max?.[0]),
    windDirection: toWindDirection(current.wind_direction_10m),
  }
}

/** Mevcut saatten başlayarak önümüzdeki saatleri döndürür. */
function mapHourlyForecast(forecast: ForecastResponse): HourlyForecast[] {
  const hourly = forecast.hourly
  if (!hourly?.time?.length) return []

  // Saatlik zamanlar ve current.time aynı yerel saat diliminde; ISO metinleri doğrudan karşılaştırılabilir.
  const currentHour = forecast.current.time.slice(0, 13)
  const start = hourly.time.findIndex((time) => time.slice(0, 13) >= currentHour)
  if (start === -1) return []

  return hourly.time.slice(start, start + HOURLY_FORECAST_COUNT).map((time, offset) => {
    const index = start + offset
    const temperature = hourly.temperature_2m?.[index]
    const isDay = hourly.is_day?.[index] !== 0
    const info = getWeatherInfo(hourly.weather_code?.[index] ?? -1, isDay)
    return {
      time,
      hour: offset === 0 ? 'Şimdi' : (formatTime(time) ?? ''),
      temperature: isNumber(temperature) ? temperature : null,
      condition: info.condition,
      description: info.description,
      isDay,
    }
  })
}

function toCityLocation(result: GeocodingResult): CityLocation {
  return {
    // Aynı şehrin listelerde tekrar etmemesi için kalıcı bir kimlik kullanıyoruz.
    id: result.id !== undefined
      ? String(result.id)
      : `${result.latitude.toFixed(2)},${result.longitude.toFixed(2)}`,
    source: 'search',
    displayName: result.name,
    city: result.name,
    ...(result.admin1 && { region: result.admin1 }),
    country: formatCountry(result.country_code, result.country),
    latitude: result.latitude,
    longitude: result.longitude,
  }
}

/** Koordinatları bilinen bir şehrin hava durumunu getirir (son aramalar / favoriler için). */
export async function getWeatherByLocation(
  location: CityLocation,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const forecast = await fetchForecast(location.latitude, location.longitude, signal)
  const isDay = forecast.current.is_day !== 0
  const currentInfo = getWeatherInfo(forecast.current.weather_code, isDay)

  return {
    location,
    current: {
      temperature: forecast.current.temperature_2m,
      feelsLike: forecast.current.apparent_temperature,
      condition: currentInfo.condition,
      weatherCode: forecast.current.weather_code,
      description: currentInfo.description,
      humidity: Math.round(forecast.current.relative_humidity_2m),
      windSpeed: Math.round(forecast.current.wind_speed_10m),
      isDay,
    },
    details: mapDetails(forecast),
    hourly: mapHourlyForecast(forecast),
    forecast: mapDailyForecast(forecast.daily),
  }
}

export async function getWeatherByCity(city: string, signal?: AbortSignal): Promise<WeatherData> {
  const location = await geocodeCity(city, signal)
  return getWeatherByLocation(location, signal)
}

/** Tarayıcıdan kullanıcının konumunu alır ve oradaki hava durumunu getirir ("Konumumu kullan"). */
export async function getWeatherForCurrentPosition(signal?: AbortSignal): Promise<WeatherData> {
  const coords = await getCurrentPosition(signal)
  const location = await reverseGeocode(coords, signal)
  return getWeatherByLocation(location, signal)
}

/**
 * Yalnızca günlük tahmini getirir ("15 Günlük" görünüm için). Open-Meteo `forecast_days`
 * parametresine istenen gün sayısı gönderilir; dönen gün sayısı daha az olabilir.
 */
export async function getDailyForecast(
  location: CityLocation,
  days: number,
  signal?: AbortSignal,
): Promise<DailyForecast[]> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: String(Math.min(days, MAX_FORECAST_DAYS)),
  })
  const data = await fetchJson<DailyForecastResponse>(`${FORECAST_URL}?${params}`, signal)
  return mapDailyForecast(data.daily)
}
