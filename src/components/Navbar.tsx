import type { ReactNode } from 'react'
import type { CityLocation, TemperatureUnit } from '../types/weather'
import FavoritesMenu from './FavoritesMenu'
import UnitToggle from './UnitToggle'
import WeatherIcon from './WeatherIcon'

interface NavbarProps {
  /** Logodaki ikon temaya uysun diye: gündüz güneş, gece ay. */
  isDay?: boolean
  unit: TemperatureUnit
  onUnitChange: (unit: TemperatureUnit) => void
  favorites: CityLocation[]
  activeLocation?: CityLocation
  onSelectFavorite: (city: CityLocation) => void
  onRemoveFavorite: (city: CityLocation) => void
  /** Ortadaki alan (arama çubuğu). */
  children?: ReactNode
}

function Navbar({
  isDay = false,
  unit,
  onUnitChange,
  favorites,
  activeLocation,
  onSelectFavorite,
  onRemoveFavorite,
  children,
}: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <p className="navbar__brand">
          <WeatherIcon condition="partly-cloudy" isDay={isDay} size={28} />
          <span>Hava Durumu</span>
        </p>

        <div className="navbar__search">{children}</div>

        <div className="navbar__actions">
          <UnitToggle unit={unit} onChange={onUnitChange} />
          <FavoritesMenu
            favorites={favorites}
            activeLocation={activeLocation}
            onSelect={onSelectFavorite}
            onRemove={onRemoveFavorite}
          />
        </div>
      </div>
    </header>
  )
}

export default Navbar
