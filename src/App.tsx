import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import CurrentWeatherCard from './components/CurrentWeatherCard'
import ForecastList from './components/ForecastList'
import { ErrorMessage, LoadingMessage } from './components/StatusMessage'
import CityChipList from './components/CityChipList'
import WeatherDetails from './components/WeatherDetails'
import HourlyForecast from './components/HourlyForecast'
import WeatherAtmosphere from './components/WeatherAtmosphere'
import { useWeather } from './hooks/useWeather'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDayNightTheme } from './hooks/useDayNightTheme'
import { useDailyForecast } from './hooks/useDailyForecast'
import { STORAGE_KEYS } from './utils/storage'
import { addToRecent, addUnique, containsPlace, parseStoredCityList, removePlace } from './utils/cityList'
import { parseTemperatureUnit } from './utils/temperature'
import { DEFAULT_FORECAST_RANGE, parseForecastRange } from './utils/forecastRange'
import type { CityLocation, ForecastRange, TemperatureUnit, WeatherData } from './types/weather'

const DEFAULT_CITY = 'Elazığ'
const MAX_RECENT_CITIES = 5

function App() {
  const { weather, isLoading, error, isLocating, loadWeather, loadCurrentLocation } =
    useWeather(DEFAULT_CITY)
  const [recentCities, setRecentCities] = useLocalStorage<CityLocation[]>(
    STORAGE_KEYS.recentCities,
    [],
    parseStoredCityList,
  )
  const [favoriteCities, setFavoriteCities] = useLocalStorage<CityLocation[]>(
    STORAGE_KEYS.favoriteCities,
    [],
    parseStoredCityList,
  )
  const [unit, setUnit] = useLocalStorage<TemperatureUnit>(
    STORAGE_KEYS.temperatureUnit,
    'C',
    parseTemperatureUnit,
  )
  // Günlük tahmin görünümü (7/15 gün); son seçim sayfa yenilense de korunur.
  const [forecastRange, setForecastRange] = useLocalStorage<ForecastRange>(
    STORAGE_KEYS.forecastRange,
    DEFAULT_FORECAST_RANGE,
    parseForecastRange,
  )
  const dailyForecast = useDailyForecast(weather, forecastRange)

  // Yalnızca kullanıcının başlattığı ve başarılı olan yüklemeler son aramalara eklenir.
  const rememberCity = (data: WeatherData) => {
    setRecentCities((list) => addToRecent(list, data.location, MAX_RECENT_CITIES))
  }

  const handleSelectCity = (query: string | CityLocation) => loadWeather(query, rememberCity)
  // Konumdan bulunan şehir de normal bir arama gibi son aramalara eklenir.
  const handleLocate = () => loadCurrentLocation(rememberCity)

  // Tema gösterilen şehrin gün/gece durumunu izler; arka plan yenilemesinde de güncellenir.
  const isDay = weather?.current.isDay
  useDayNightTheme(isDay)

  const currentLocation = weather?.location
  // Aynı yer farklı kimlikle kayıtlıysa da (ör. eski kayıt) favori sayılır.
  const isFavorite = !!currentLocation && containsPlace(favoriteCities, currentLocation)

  // Şehir adının yanındaki yıldız: gösterilen şehri favorilere ekler/çıkarır.
  const toggleFavorite = () => {
    if (!currentLocation) return
    setFavoriteCities((list) =>
      isFavorite ? removePlace(list, currentLocation) : addUnique(list, currentLocation),
    )
  }

  const removeFavorite = (city: CityLocation) => {
    setFavoriteCities((list) => removePlace(list, city))
  }

  return (
    <>
      {/* Arka plan animasyonu doğrudan Open-Meteo hava kodundan; şehir/konum değişince ve
          arka plan yenilemesinde kendiliğinden güncellenir. */}
      {weather && <WeatherAtmosphere weatherCode={weather.current.weatherCode} />}
      <Navbar
        isDay={isDay ?? false}
        unit={unit}
        onUnitChange={setUnit}
        favorites={favoriteCities}
        activeLocation={currentLocation}
        onSelectFavorite={handleSelectCity}
        onRemoveFavorite={removeFavorite}
      >
        <SearchBar
          onSearch={handleSelectCity}
          onLocate={handleLocate}
          isLoading={isLoading}
          isLocating={isLocating}
        />
      </Navbar>

      <main className="container page">
        <h1 className="sr-only">Hava Durumu</h1>

        <CityChipList
          title="Son Aramalar"
          icon="clock"
          cities={recentCities}
          activeLocation={currentLocation}
          onSelect={handleSelectCity}
        />

        {isLoading && (
          <LoadingMessage message={isLocating ? 'Konumunuz bulunuyor…' : undefined} />
        )}
        {error && <ErrorMessage error={error} />}

        {weather && (
          <div className={isLoading ? 'weather is-loading' : 'weather'}>
            <CurrentWeatherCard
              location={weather.location}
              weather={weather.current}
              today={weather.forecast[0]}
              unit={unit}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
            <HourlyForecast hours={weather.hourly} unit={unit} />
            <ForecastList
              forecasts={dailyForecast.days}
              unit={unit}
              range={forecastRange}
              onRangeChange={setForecastRange}
              isLoading={dailyForecast.isLoading}
              notice={dailyForecast.notice}
            />
            <WeatherDetails details={weather.details} />
            {weather.location.attribution && (
              <p className="attribution">{weather.location.attribution}</p>
            )}
          </div>
        )}
      </main>
    </>
  )
}

export default App
