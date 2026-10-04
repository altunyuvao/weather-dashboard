import { getAtmosphere } from '../utils/weatherCodes'

interface WeatherAtmosphereProps {
  /** Open-Meteo WMO hava kodu (`weather.current.weatherCode`) */
  weatherCode: number
}

/**
 * Hava durumuna göre çok hafif arka plan animasyonu: çisenti, yağmur, kar ve seyrek şimşek.
 * İçeriğin arkasında, tıklamaları engellemeden durur. Her katman tek bir eleman; parçacıklar
 * CSS gradyanlarıyla çizilip yalnızca transform ile kaydırılır. Hareket azaltma tercihinde gizlenir.
 */
function WeatherAtmosphere({ weatherCode }: WeatherAtmosphereProps) {
  // Her render'da koddan yeniden hesaplanır; şehir/konum/favori değişince kendiliğinden güncellenir.
  const atmosphere = getAtmosphere(weatherCode)

  if (atmosphere === 'none') return null

  return (
    // key: tür değişince katman yeniden oluşur ve yumuşakça belirir.
    <div
      key={atmosphere}
      className={`atmosphere atmosphere--${atmosphere}`}
      data-weather-code={weatherCode}
      aria-hidden="true"
    >
      {atmosphere === 'snow' ? (
        <>
          <div className="atmosphere__layer atmosphere__snow atmosphere__snow--far" />
          <div className="atmosphere__layer atmosphere__snow atmosphere__snow--near" />
        </>
      ) : (
        <>
          {/* Çisentide yalnızca uzak (soluk) katman; yağmur ve fırtınada iki katman. */}
          <div className="atmosphere__layer atmosphere__rain atmosphere__rain--far" />
          {atmosphere !== 'drizzle' && (
            <div className="atmosphere__layer atmosphere__rain atmosphere__rain--near" />
          )}
        </>
      )}
      {atmosphere === 'storm' && <div className="atmosphere__flash" />}
    </div>
  )
}

export default WeatherAtmosphere
