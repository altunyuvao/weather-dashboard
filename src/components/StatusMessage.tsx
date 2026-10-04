import type { WeatherErrorInfo } from '../types/weather'
import Icon from './Icon'

interface LoadingMessageProps {
  message?: string
}

export function LoadingMessage({ message = 'Hava durumu yükleniyor…' }: LoadingMessageProps) {
  return (
    <div className="status status--loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

interface ErrorMessageProps {
  error: WeatherErrorInfo
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  // "Şehir bulunamadı" ve konum hataları kullanıcının düzeltebileceği durumlar;
  // bağlantı/servis hatalarından farklı renkte gösterilir.
  const isLocationError = error.kind.startsWith('location-')
  const isWarning = error.kind === 'not-found' || isLocationError
  const icon = isLocationError ? 'pin' : error.kind === 'not-found' ? 'search' : 'alert'

  return (
    <div className={`glass status status--${isWarning ? 'warning' : 'error'}`} role="alert">
      <span className="status__icon">
        <Icon name={icon} size={20} />
      </span>
      <div className="status__text">
        <p className="status__title">{error.title}</p>
        <p>{error.message}</p>
      </div>
    </div>
  )
}
