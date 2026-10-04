import type { WeatherDetails as WeatherDetailsData } from '../types/weather'
import type { IconName } from './Icon'
import InfoTile from './InfoTile'

interface WeatherDetailsProps {
  details: WeatherDetailsData
}

interface DetailItem {
  icon: IconName
  label: string
  value: string | null
  hint?: string
}

/** Türkçe ondalık ayıracıyla yazar, ör. 5.5 → "5,5". */
const formatNumber = (value: number) => value.toLocaleString('tr-TR')

function WeatherDetails({ details }: WeatherDetailsProps) {
  const { precipitationProbability, pressure, visibility, windDirection, uvIndex, uvIndexMax } =
    details

  const items: DetailItem[] = [
    {
      icon: 'umbrella',
      label: 'Yağış Olasılığı',
      value: precipitationProbability === null ? null : `%${precipitationProbability}`,
    },
    {
      icon: 'gauge',
      label: 'Basınç',
      value: pressure === null ? null : `${pressure} hPa`,
    },
    {
      icon: 'eye',
      label: 'Görüş Mesafesi',
      value: visibility === null ? null : `${formatNumber(visibility)} km`,
    },
    {
      icon: 'sun',
      label: 'UV İndeksi',
      value: uvIndex === null ? null : `${formatNumber(uvIndex.value)} · ${uvIndex.level}`,
      hint: uvIndexMax
        ? `Bugün en yüksek ${formatNumber(uvIndexMax.value)} (${uvIndexMax.level})`
        : undefined,
    },
    { icon: 'sunrise', label: 'Gün Doğumu', value: details.sunrise },
    { icon: 'sunset', label: 'Gün Batımı', value: details.sunset },
    {
      icon: 'compass',
      label: 'Rüzgar Yönü',
      value: windDirection?.label ?? null,
      hint: windDirection ? `${windDirection.degrees}°` : undefined,
    },
  ]

  return (
    <section className="section">
      <h2 className="section__title">Hava Detayları</h2>
      <dl className="details-grid">
        {items.map((item) => (
          <InfoTile key={item.label} {...item} />
        ))}
      </dl>
    </section>
  )
}

export default WeatherDetails
