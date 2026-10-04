import type { CityLocation } from '../types/weather'

/** Hiçbir yer adı bulunamadığında başlık olarak kullanılır. */
export const FALLBACK_PLACE_NAME = 'Konumum'

/** Ekranda gösterilecek satırlar. Boş satır yoktur; olmayan satır `undefined` kalır. */
export interface LocationLabel {
  /** Ana başlık, ör. "İzzetpaşa Mahallesi" */
  title: string
  /** Alt satır, ör. "Merkez, Elazığ" */
  subtitle?: string
  /** Son satır, ör. "Türkiye" */
  detail?: string
}

/** Karşılaştırma anahtarı: büyük/küçük harf, şapka ve boşluk farkını yok sayar ("İzzet Paşa" = "İzzetpaşa"). */
export function normalizeName(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '')
}

export function sameName(a: string | undefined, b: string | undefined): boolean {
  return !!a && !!b && normalizeName(a) === normalizeName(b)
}

/** Dolu ve birbirinin tekrarı olmayan parçaları birleştirir; `exclude` ile aynı olanlar atlanır. */
function joinParts(parts: (string | undefined)[], exclude: (string | undefined)[] = []) {
  const unique: string[] = []
  for (const raw of parts) {
    const part = raw?.trim()
    if (!part) continue
    if ([...unique, ...exclude].some((other) => sameName(part, other))) continue
    unique.push(part)
  }
  return unique.length > 0 ? unique.join(', ') : undefined
}

/**
 * Gösterim standardı:
 *   Konum, mahalle var:  "İzzetpaşa Mahallesi" / "Merkez, Elazığ" / "Türkiye"
 *   Konum, ilçe var:     "Kadıköy" / "İstanbul" / "Türkiye"
 *   Konum, yalnız şehir: "Elazığ" / "Türkiye"
 *   Manuel arama:        "Kadıköy" / "İstanbul" / "Türkiye"  (bölge şehirle aynıysa: "Elazığ" / "Türkiye")
 * Tekrarlar atlanır ("Elazığ, Elazığ" olmaz); alt satır yoksa ülke alt satıra çıkar.
 */
export function getLocationLabel(location: CityLocation): LocationLabel {
  const title = location.displayName.trim() || FALLBACK_PLACE_NAME
  const subtitle =
    location.source === 'location'
      ? joinParts([location.district, location.city], [title])
      : joinParts([location.region], [title])
  const country = joinParts([location.country], [title, subtitle])

  return subtitle ? { title, subtitle, detail: country } : { title, subtitle: country }
}

/** Tek satırlık tam ad (ipuçları ve erişilebilirlik etiketleri için), ör. "Caferağa Mahallesi, Kadıköy, İstanbul, Türkiye". */
export function getFullLocationName(location: CityLocation): string {
  const { title, subtitle, detail } = getLocationLabel(location)
  return [title, subtitle, detail].filter(Boolean).join(', ')
}

/** Son aramalardaki kısa ad: "Caferağa Mahallesi" → "Caferağa Mah." */
export function getShortLocationName(location: CityLocation): string {
  return getLocationLabel(location).title.replace(/\s+Mahallesi$/u, ' Mah.')
}

/** İki koordinat arasındaki kuş uçuşu mesafe (km, haversine). */
function distanceKm(a: CityLocation, b: CityLocation): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** Aynı adlı iki kayıt bu mesafeden yakınsa aynı yer sayılır (ör. aramadan ve konumdan gelen "Elazığ"). */
const SAME_PLACE_MAX_KM = 5

/**
 * Aynı yer mi? Kimlik aynıysa ya da başlıkları aynı ve birbirine çok yakınlarsa.
 * Aynı isimli ama uzak yerler (ör. iki farklı "Cumhuriyet Mahallesi") ayrı kalır.
 */
export function isSamePlace(a: CityLocation, b: CityLocation): boolean {
  if (a.id === b.id) return true
  return sameName(a.displayName, b.displayName) && distanceKm(a, b) <= SAME_PLACE_MAX_KM
}
