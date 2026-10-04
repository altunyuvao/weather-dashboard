import type {
  BigDataCloudReverseResponse,
  CityLocation,
  Coordinates,
  NominatimReverseResponse,
  PlaceParts,
} from '../types/weather'
import { formatCountry } from '../utils/country'
import { FALLBACK_PLACE_NAME, normalizeName, sameName } from '../utils/locationLabel'
import { isAbortError } from './errors'
import { fetchJson } from './http'

// Open-Meteo'da ters coğrafi kodlama (koordinat → adres) yok.
// Asıl kaynak OpenStreetMap Nominatim: Türkiye'de mahalle (suburb) ve ilçe (town) bilgisi ayrıntılı.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
// Yedek: Nominatim'e ulaşılamazsa anahtarsız BigDataCloud istemci uç noktası.
const BIGDATACLOUD_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'
/** OpenStreetMap verisi gösterildiğinde atıf zorunlu (ODbL). */
const OSM_ATTRIBUTION = 'Konum verisi © OpenStreetMap katkıcıları'

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Verilen adlardan, `exclude` içindekilerle aynı olmayan ilk dolu adı seçer. */
function pick(candidates: (string | undefined)[], exclude: (string | undefined)[] = []) {
  return candidates
    .map(clean)
    .find((name) => name !== undefined && !exclude.some((other) => sameName(name, other)))
}

/** OSM merkez ilçeleri "Elâzığ Merkez" olarak adlandırıyor; şehir adı zaten yazıldığı için "Merkez" yeter. */
function shortenDistrict(district: string | undefined, city: string | undefined) {
  const match = district?.match(/^(.+?)\s+merkez$/iu)
  return match && sameName(match[1], city) ? 'Merkez' : district
}

function hasPlaceName(parts: PlaceParts): boolean {
  return !!(parts.neighbourhood || parts.district || parts.city)
}

function fromNominatim(data: NominatimReverseResponse): PlaceParts {
  const a = data.address
  if (!a) return {}
  // Türkiye'de province = il; diğer ülkelerde çoğunlukla city dolu.
  const city = pick([a.province, a.city, a.town, a.state, a.municipality])
  const district = shortenDistrict(
    pick([a.town, a.city_district, a.district, a.county, a.city, a.municipality], [city]),
    city,
  )
  // Türkiye'de suburb resmi mahalle adıdır ("Caferağa Mahallesi"); kırsalda village (köy).
  const neighbourhood = pick([a.suburb, a.neighbourhood, a.quarter, a.village, a.hamlet], [
    district,
    city,
  ])
  return { neighbourhood, district, city, country: clean(formatCountry(a.country_code, a.country)) }
}

function fromBigDataCloud(data: BigDataCloudReverseResponse): PlaceParts {
  const admin = [...(data.localityInfo?.administrative ?? [])].sort(
    (x, y) => (x.order ?? 0) - (y.order ?? 0),
  )
  const atLevel = (min: number, max: number) =>
    admin.filter(
      (item) => item.adminLevel !== undefined && item.adminLevel >= min && item.adminLevel <= max,
    )
  const namesAtLevel = (min: number, max: number) => atLevel(min, max).map((item) => item.name)
  // BigDataCloud mahalleleri "Caferağa" diye veriyor; açıklaması "...'de mahalle" ise OSM'deki
  // gibi "Caferağa Mahallesi" yazıyoruz.
  const neighbourhoodNames = atLevel(8, 10).map((item) =>
    item.name && /mahalle$/iu.test(item.description ?? '') && !/mahallesi$/iu.test(item.name)
      ? `${item.name} Mahallesi`
      : item.name,
  )

  // Türkiye'de idari seviye 4 = il, 6 = ilçe, 8 = mahalle.
  const city = pick([...namesAtLevel(4, 4), data.city, data.principalSubdivision])
  const district = pick(namesAtLevel(5, 7), [city])
  const neighbourhood = pick(neighbourhoodNames, [district, city])
  return {
    neighbourhood,
    district,
    city,
    country: clean(formatCountry(data.countryCode, data.countryName)),
  }
}

/** Servisi çağırır; iptal dışındaki her hatada boş sonuç döner (konum özelliği yine çalışır). */
async function tryReverse<T>(
  url: string,
  map: (data: T) => PlaceParts,
  signal?: AbortSignal,
): Promise<PlaceParts> {
  try {
    return map(await fetchJson<T>(url, signal))
  } catch (error) {
    if (isAbortError(error)) throw error
    return {}
  }
}

/**
 * Yer adlarını kaydedilecek konuma çevirir. Başlık önceliği: mahalle → ilçe → şehir → "Konumum".
 * Ekrandaki satırlar bu alanlardan `utils/locationLabel` ile üretilir.
 */
function toPlaceLocation(
  parts: PlaceParts,
  coords: Coordinates,
  attribution?: string,
): CityLocation {
  const { neighbourhood, district, city, country = '' } = parts

  return {
    // Aynı mahalle tekrar bulunduğunda (hangi servisten gelirse gelsin) aynı kimlik oluşsun ki
    // son aramalarda çoğalmasın. "Mahallesi" eki kimliğe dahil edilmez.
    id: hasPlaceName(parts)
      ? `place:${[country, city, district, neighbourhood]
          .map((part) => normalizeName(part ?? '').replace(/mahallesi$/u, ''))
          .join('|')}`
      : `${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`,
    source: 'location',
    displayName: neighbourhood ?? district ?? city ?? FALLBACK_PLACE_NAME,
    ...(neighbourhood && { neighbourhood }),
    ...(district && { district }),
    ...(city && { city }),
    country,
    // Hava durumu şehir merkezine değil, kullanıcının gerçek koordinatına göre alınır.
    latitude: coords.latitude,
    longitude: coords.longitude,
    ...(attribution && { attribution }),
  }
}

/** Koordinatları mümkün olan en ayrıntılı yer adına çevirir (mahalle, ilçe, şehir, ülke). */
export async function reverseGeocode(
  coords: Coordinates,
  signal?: AbortSignal,
): Promise<CityLocation> {
  const nominatimParams = new URLSearchParams({
    format: 'jsonv2',
    lat: String(coords.latitude),
    lon: String(coords.longitude),
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'tr',
  })
  const osm = await tryReverse(`${NOMINATIM_URL}?${nominatimParams}`, fromNominatim, signal)
  if (hasPlaceName(osm)) return toPlaceLocation(osm, coords, OSM_ATTRIBUTION)

  const bigDataCloudParams = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    localityLanguage: 'tr',
  })
  const bdc = await tryReverse(`${BIGDATACLOUD_URL}?${bigDataCloudParams}`, fromBigDataCloud, signal)
  if (hasPlaceName(bdc)) return toPlaceLocation(bdc, coords)

  // Yer adı yok: "Konumum" + (biliniyorsa) ülke.
  return toPlaceLocation({ country: osm.country ?? bdc.country }, coords)
}
