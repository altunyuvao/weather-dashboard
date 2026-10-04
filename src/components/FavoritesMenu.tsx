import { useEffect, useId, useRef, useState } from 'react'
import type { FocusEvent } from 'react'
import type { CityLocation } from '../types/weather'
import { getLocationLabel, isSamePlace } from '../utils/locationLabel'
import Icon from './Icon'

interface FavoritesMenuProps {
  favorites: CityLocation[]
  /** Gösterilen yer; listede aynı yer vurgulanır. */
  activeLocation?: CityLocation
  onSelect: (city: CityLocation) => void
  onRemove: (city: CityLocation) => void
}

/** Navbar'daki yıldız: favori şehirleri açılır bir panelde listeler. */
function FavoritesMenu({ favorites, activeLocation, onSelect, onRemove }: FavoritesMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const close = () => setIsOpen(false)

  // Panel açıkken: dışarı tıklayınca veya Escape'e basınca kapat.
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Klavyeyle (Tab) panelin dışına çıkılırsa kapat.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && !event.currentTarget.contains(next)) close()
  }

  const handleSelect = (city: CityLocation) => {
    onSelect(city)
    close()
    triggerRef.current?.focus()
  }

  const handleRemove = (city: CityLocation) => {
    onRemove(city)
    // Silinen buton DOM'dan kalkacağı için odağı tetikleyici butona taşı; panel açık kalır.
    triggerRef.current?.focus()
  }

  const count = favorites.length
  const triggerLabel = count > 0 ? `Favori şehirler (${count})` : 'Favori şehirler'

  return (
    <div className="favorites-menu" ref={containerRef} onBlur={handleBlur}>
      <button
        ref={triggerRef}
        type="button"
        className={isOpen ? 'icon-button favorites-menu__trigger is-open' : 'icon-button favorites-menu__trigger'}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={triggerLabel}
        title={triggerLabel}
      >
        <Icon name="star" size={18} filled={count > 0} />
        {count > 0 && (
          <span className="favorites-menu__badge" aria-hidden="true">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div id={panelId} className="favorites-menu__panel" role="region" aria-label="Favori şehirler">
          <p className="favorites-menu__title">Favori Şehirler</p>

          {count === 0 ? (
            <p className="favorites-menu__empty">Henüz favori şehir yok</p>
          ) : (
            <ul className="favorites-menu__list">
              {favorites.map((city) => {
                const isActive = !!activeLocation && isSamePlace(city, activeLocation)
                // Menüde iki satır yeter: başlık + alt satır (ör. "Merkez, Elazığ" ya da "Türkiye").
                const label = getLocationLabel(city)
                return (
                  <li
                    key={city.id}
                    className={isActive ? 'favorites-menu__item is-active' : 'favorites-menu__item'}
                  >
                    <button
                      type="button"
                      className="favorites-menu__select"
                      onClick={() => handleSelect(city)}
                      aria-current={isActive ? 'true' : undefined}
                      title={`${label.title} hava durumunu göster`}
                    >
                      <span className="favorites-menu__name">{label.title}</span>
                      {label.subtitle && (
                        <span className="favorites-menu__country">{label.subtitle}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="favorites-menu__remove"
                      onClick={() => handleRemove(city)}
                      aria-label={`${label.title}: favorilerden çıkar`}
                      title={`${label.title}: favorilerden çıkar`}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default FavoritesMenu
