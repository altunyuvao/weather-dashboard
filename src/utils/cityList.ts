import type { CityLocation, LocationSource } from '../types/weather'
import { FALLBACK_PLACE_NAME, isSamePlace } from './locationLabel'

/** Yeri listenin başına ekler; aynı yer zaten varsa eski kaydı kaldırır ve listeyi `max` ile sınırlar. */
export function addToRecent(list: CityLocation[], city: CityLocation, max: number): CityLocation[] {
  return [city, ...list.filter((item) => !isSamePlace(item, city))].slice(0, max)
}

/** Yeri listenin sonuna ekler; aynı yer zaten varsa listeyi olduğu gibi döndürür. */
export function addUnique(list: CityLocation[], city: CityLocation): CityLocation[] {
  return list.some((item) => isSamePlace(item, city)) ? list : [...list, city]
}

/** Verilen yerle aynı olan tüm kayıtları çıkarır. */
export function removePlace(list: CityLocation[], city: CityLocation): CityLocation[] {
  return list.filter((item) => !isSamePlace(item, city))
}

export function containsPlace(list: CityLocation[], city: CityLocation): boolean {
  return list.some((item) => isSamePlace(item, city))
}

/* --------------------------------------------------------------------------
   localStorage'dan okuma + eski formatı dönüştürme
   -------------------------------------------------------------------------- */

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function coordinate(value: unknown, limit: number): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit
    ? value
    : undefined
}

/**
 * Eski format (v1): { id, name, country, latitude, longitude, area?, attribution? }
 *   - Aramadan gelenlerde `id` Open-Meteo'nun sayısal kimliği.
 *   - Konumdan gelenlerde `id` "place:..." ya da "enlem,boylam"; `area` "İlçe, Şehir" veya "Şehir".
 * Buradan yapılandırılmış alanlar (mahalle/ilçe/şehir) olabildiğince geri çıkarılır.
 */
function fromLegacy(raw: Record<string, unknown>, id: string, name: string) {
  const isLocation = id.startsWith('place:') || /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(id)
  if (!isLocation) {
    return { source: 'search' as LocationSource, displayName: name, city: name }
  }
  const area = text(raw.area)?.split(',').map((part) => part.trim()).filter(Boolean) ?? []
  if (area.length >= 2) {
    return {
      source: 'location' as LocationSource,
      displayName: name,
      neighbourhood: name,
      district: area[0],
      city: area[1],
    }
  }
  if (area.length === 1) {
    return { source: 'location' as LocationSource, displayName: name, district: name, city: area[0] }
  }
  return {
    source: 'location' as LocationSource,
    displayName: name,
    city: name === FALLBACK_PLACE_NAME ? undefined : name,
  }
}

/**
 * Kayıtlı tek bir yeri okur. Yeni formatı doğrudan, eski formatı dönüştürerek kabul eder;
 * eksik/bozuk kayıtlar için null döner (uygulama çökmez, o kayıt atlanır).
 */
function parseStoredCity(value: unknown): CityLocation | null {
  if (typeof value !== 'object' || value === null) return null
  const raw = value as Record<string, unknown>

  const id = text(raw.id)
  const latitude = coordinate(raw.latitude, 90)
  const longitude = coordinate(raw.longitude, 180)
  if (!id || latitude === undefined || longitude === undefined) return null

  const common = {
    id,
    country: text(raw.country) ?? '',
    latitude,
    longitude,
    ...(text(raw.attribution) && { attribution: text(raw.attribution) }),
  }

  // Yeni format
  const displayName = text(raw.displayName)
  if (displayName) {
    const source: LocationSource = raw.source === 'location' ? 'location' : 'search'
    const optional = (key: 'neighbourhood' | 'district' | 'city' | 'region') =>
      text(raw[key]) ? { [key]: text(raw[key]) } : {}
    return {
      ...common,
      source,
      displayName,
      ...optional('neighbourhood'),
      ...optional('district'),
      ...optional('city'),
      ...optional('region'),
    }
  }

  // Eski format
  const name = text(raw.name)
  if (!name) return null
  return { ...common, ...fromLegacy(raw, id, name) }
}

/** Kayıtlı listeyi okur: geçersiz kayıtları atlar, eski kayıtları yeni formata çevirir, tekrarları ayıklar. */
export function parseStoredCityList(value: unknown): CityLocation[] | null {
  if (!Array.isArray(value)) return null
  return value
    .map(parseStoredCity)
    .reduce<CityLocation[]>((list, city) => (city ? addUnique(list, city) : list), [])
}
