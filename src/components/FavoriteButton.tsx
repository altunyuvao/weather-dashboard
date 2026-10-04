import Icon from './Icon'

interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  /** Etikette kullanılır, ör. "Ankara: favorilere ekle". */
  cityName?: string
}

function FavoriteButton({ isFavorite, onToggle, cityName }: FavoriteButtonProps) {
  const action = isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'
  const label = cityName ? `${cityName}: ${action.toLocaleLowerCase('tr-TR')}` : action

  return (
    <button
      type="button"
      className={isFavorite ? 'icon-button favorite-button is-active' : 'icon-button favorite-button'}
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
    >
      <Icon name="star" size={18} filled={isFavorite} />
    </button>
  )
}

export default FavoriteButton
