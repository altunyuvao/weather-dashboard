import type { CityLocation } from '../types/weather'
import { getFullLocationName, getShortLocationName, isSamePlace } from '../utils/locationLabel'
import Icon from './Icon'
import type { IconName } from './Icon'

interface CityChipListProps {
  title: string
  icon: IconName
  cities: CityLocation[]
  /** Gösterilen yer; listede aynı yer vurgulanır. */
  activeLocation?: CityLocation
  onSelect: (city: CityLocation) => void
}

function CityChipList({ title, icon, cities, activeLocation, onSelect }: CityChipListProps) {
  if (cities.length === 0) return null

  return (
    <section className="chips" aria-label={title}>
      <h2 className="chips__title">
        <Icon name={icon} size={14} />
        {title}
      </h2>
      <ul className="chips__list">
        {cities.map((city) => {
          const isActive = !!activeLocation && isSamePlace(city, activeLocation)
          const fullName = getFullLocationName(city)

          return (
            <li key={city.id} className={isActive ? 'chip is-active' : 'chip'}>
              <button
                type="button"
                className="chip__select"
                onClick={() => onSelect(city)}
                aria-current={isActive ? 'true' : undefined}
                title={`${fullName} hava durumunu göster`}
              >
                {getShortLocationName(city)}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default CityChipList
