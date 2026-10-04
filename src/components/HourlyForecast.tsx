import type { HourlyForecast as HourlyForecastItem, TemperatureUnit } from '../types/weather'
import { formatTemperature } from '../utils/temperature'
import WeatherIcon from './WeatherIcon'

interface HourlyForecastProps {
  hours: HourlyForecastItem[]
  unit: TemperatureUnit
}

function HourlyForecast({ hours, unit }: HourlyForecastProps) {
  return (
    <section className="glass panel">
      <div className="section__header">
        <h2 className="section__title">Saatlik Tahmin</h2>
        {hours.length > 0 && <p className="section__caption">Önümüzdeki {hours.length} saat</p>}
      </div>

      {hours.length === 0 ? (
        <p className="empty-text">Veri yok</p>
      ) : (
        // tabIndex: kaydırılabilir listeye klavyeyle odaklanıp ok tuşlarıyla kaydırılabilsin.
        <ul className="hourly" tabIndex={0} aria-label={`Önümüzdeki ${hours.length} saat`}>
          {hours.map((hour, index) => (
            <li
              key={hour.time}
              className={index === 0 ? 'hourly__item is-now' : 'hourly__item'}
              title={hour.description}
            >
              <span className="hourly__time">{hour.hour}</span>
              <WeatherIcon condition={hour.condition} isDay={hour.isDay} size={40} />
              <span className="sr-only">{hour.description}</span>
              <span className="hourly__temp">
                {hour.temperature === null ? (
                  <>
                    <span aria-hidden="true">–</span>
                    <span className="sr-only">Veri yok</span>
                  </>
                ) : (
                  formatTemperature(hour.temperature, unit, false)
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default HourlyForecast
