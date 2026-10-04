import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import Icon from './Icon'

interface SearchBarProps {
  onSearch: (city: string) => void
  /** "Konumumu kullan" butonuna basılınca çağrılır; verilmezse buton gösterilmez. */
  onLocate?: () => void
  isLoading?: boolean
  /** Konum isteği sürüyor: spinner "Ara" yerine konum butonunda gösterilir. */
  isLocating?: boolean
}

function SearchBar({ onSearch, onLocate, isLoading = false, isLocating = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const inputId = useId()
  const isSearching = isLoading && !isLocating
  const buttonText = isSearching ? 'Aranıyor…' : 'Ara'
  const locateLabel = isLocating ? 'Konumunuz bulunuyor…' : 'Konumumu kullan'

  // Form submit olduğu için Enter tuşu da aramayı tetikler.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const city = query.trim()
    if (city) onSearch(city)
  }

  return (
    <form className="search" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor={inputId}>
        Şehir adı
      </label>
      <Icon name="search" size={18} className="search__icon" />
      <input
        id={inputId}
        className="search__input"
        type="text"
        placeholder="Şehir ara"
        autoComplete="off"
        enterKeyHint="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {onLocate && (
        <button
          className={isLocating ? 'search__locate is-loading' : 'search__locate'}
          type="button"
          onClick={onLocate}
          // Yalnızca konum isteği sürerken kilitli. Başka bir yükleme (ör. açılıştaki varsayılan
          // şehir) sürerken basılırsa o istek iptal edilir ve konum kullanılır.
          disabled={isLocating}
          aria-label={locateLabel}
          title={locateLabel}
        >
          {isLocating ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <Icon name="locate" size={18} />
          )}
        </button>
      )}
      <button
        className={isSearching ? 'search__button is-loading' : 'search__button'}
        type="submit"
        disabled={isLoading || !query.trim()}
        aria-label={buttonText}
        title="Şehrin hava durumunu ara"
      >
        {isSearching && <span className="spinner" aria-hidden="true" />}
        <span className="search__button-text">{buttonText}</span>
      </button>
    </form>
  )
}

export default SearchBar
