import type {
  CityLocation,
  CurrentWeather,
  DailyForecast,
  TemperatureUnit,
} from '../types/weather'
import { getLocationLabel } from '../utils/locationLabel'
import { convertTemperature, formatTemperature } from '../utils/temperature'
import FavoriteButton from './FavoriteButton'
import Icon from './Icon'
import InfoTile from './InfoTile'
import WeatherIcon from './WeatherIcon'

interface CurrentWeatherCardProps {
  location: CityLocation
  weather: CurrentWeather
  /** Bugünün tahmini; varsa en yüksek/en düşük sıcaklık gösterilir. */
  today?: DailyForecast
  unit: TemperatureUnit
  isFavorite: boolean
  onToggleFavorite: () => void
}

function CurrentWeatherCard({
  location,
  weather,
  today,
  unit,
  isFavorite,
  onToggleFavorite,
}: CurrentWeatherCardProps) {
  const label = getLocationLabel(location)

  return (
    <section className="hero" aria-label={`${label.title} hava durumu`}>
      <div className="hero__info">
        <div className="hero__location">
          <Icon name="pin" size={18} />
          <h2 className="hero__city">{label.title}</h2>
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
            cityName={label.title}
          />
        </div>
        {/* Üç satırlıysa ör. "Merkez, Elazığ" vurgulu, "Türkiye" soluk; iki satırlıysa alt satır soluk. */}
        {label.subtitle && (
          <p className={label.detail ? 'hero__area' : 'hero__country'}>{label.subtitle}</p>
        )}
        {label.detail && <p className="hero__country">{label.detail}</p>}

        <p className="hero__temp">
          {convertTemperature(weather.temperature, unit)}
          <span className="hero__unit">°{unit}</span>
        </p>
        <p className="hero__description">{weather.description}</p>
        {today && (
          <p className="hero__range">
            En yüksek {formatTemperature(today.high, unit, false)}
            <span aria-hidden="true"> · </span>
            En düşük {formatTemperature(today.low, unit, false)}
          </p>
        )}
      </div>

      <div className="hero__art">
        <WeatherIcon condition={weather.condition} isDay={weather.isDay} size={220} />
      </div>

      <dl className="hero__stats">
        <InfoTile
          icon="thermometer"
          label="Hissedilen"
          value={formatTemperature(weather.feelsLike, unit)}
        />
        <InfoTile icon="droplet" label="Nem" value={`%${weather.humidity}`} />
        <InfoTile icon="wind" label="Rüzgar" value={`${weather.windSpeed} km/sa`} />
      </dl>
    </section>
  )
}

export default CurrentWeatherCard
