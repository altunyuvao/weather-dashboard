import type { DailyForecast, ForecastRange, TemperatureUnit } from '../types/weather'
import { FORECAST_RANGES } from '../utils/forecastRange'
import ForecastCard from './ForecastCard'

interface ForecastListProps {
  forecasts: DailyForecast[]
  unit: TemperatureUnit
  /** Seçili görünüm: 7 ya da 15 günlük */
  range: ForecastRange
  onRangeChange: (range: ForecastRange) => void
  /** 15 günlük veri yükleniyor; bu sırada mevcut liste soluk gösterilir. */
  isLoading?: boolean
  /** Türkçe uyarı, ör. 15 günlük veri alınamadıysa */
  notice?: string | null
}

function ForecastList({
  forecasts,
  unit,
  range,
  onRangeChange,
  isLoading = false,
  notice,
}: ForecastListProps) {
  // Sıcaklık çubukları listedeki tüm günlere göre ölçeklenir (°C üzerinden; birimden bağımsız).
  const weekMin = Math.min(...forecasts.map((day) => day.low))
  const weekMax = Math.max(...forecasts.map((day) => day.high))

  return (
    <section className="glass panel">
      <div className="section__header">
        <h2 className="section__title">Günlük Tahmin</h2>
        <div className="range-toggle" role="group" aria-label="Tahmin süresi">
          {FORECAST_RANGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={value === range ? 'range-toggle__button is-active' : 'range-toggle__button'}
              aria-pressed={value === range}
              onClick={() => onRangeChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="forecast__status" role="status">
          <span className="spinner" aria-hidden="true" />
          15 günlük tahmin yükleniyor…
        </p>
      )}
      {notice && (
        <p className="forecast__status forecast__status--notice" role="status">
          {notice}
        </p>
      )}

      {forecasts.length === 0 ? (
        <p className="empty-text">Veri yok</p>
      ) : (
        <ul className={isLoading ? 'forecast is-loading' : 'forecast'}>
          {forecasts.map((forecast) => (
            <ForecastCard
              key={forecast.date}
              forecast={forecast}
              unit={unit}
              weekMin={weekMin}
              weekMax={weekMax}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ForecastList
