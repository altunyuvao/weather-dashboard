import type { CSSProperties } from 'react'
import type { DailyForecast, TemperatureUnit } from '../types/weather'
import { formatTemperature } from '../utils/temperature'
import WeatherIcon from './WeatherIcon'

interface ForecastCardProps {
  forecast: DailyForecast
  unit: TemperatureUnit
  weekMin: number
  weekMax: number
}

function ForecastCard({ forecast, unit, weekMin, weekMax }: ForecastCardProps) {
  // Günün sıcaklık aralığını listedeki tüm günlerin (7/15) aralığı içinde konumlandır.
  const span = weekMax - weekMin || 1
  const rangeStyle = {
    '--range-start': `${((forecast.low - weekMin) / span) * 100}%`,
    '--range-end': `${((weekMax - forecast.high) / span) * 100}%`,
  } as CSSProperties

  return (
    <li className="forecast__item">
      <div className="forecast__day-block">
        <p className="forecast__day">
          <span className="forecast__day-name">{forecast.day}</span>
          <span className="forecast__date">{forecast.dateLabel}</span>
        </p>
        <p className="forecast__description">{forecast.description}</p>
      </div>
      <WeatherIcon condition={forecast.condition} size={44} />
      <div className="forecast__temps">
        <span className="forecast__low" title="En düşük">
          {formatTemperature(forecast.low, unit, false)}
        </span>
        <span className="forecast__bar" style={rangeStyle} aria-hidden="true" />
        <span className="forecast__high" title="En yüksek">
          {formatTemperature(forecast.high, unit, false)}
        </span>
      </div>
    </li>
  )
}

export default ForecastCard
