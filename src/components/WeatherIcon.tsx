import type { WeatherCondition } from '../types/weather'

interface WeatherIconProps {
  condition: WeatherCondition
  size?: number
  /** Open-Meteo'nun is_day bilgisi. Gece ise güneş yerine ay ve gece bulut tonları kullanılır. */
  isDay?: boolean
}

const sun = (
  <g>
    <circle cx="24" cy="24" r="9" fill="#FDB813" />
    <g stroke="#FDB813" strokeWidth="3" strokeLinecap="round">
      <line x1="24" y1="4" x2="24" y2="9" />
      <line x1="24" y1="39" x2="24" y2="44" />
      <line x1="4" y1="24" x2="9" y2="24" />
      <line x1="39" y1="24" x2="44" y2="24" />
      <line x1="9.9" y1="9.9" x2="13.4" y2="13.4" />
      <line x1="34.6" y1="34.6" x2="38.1" y2="38.1" />
      <line x1="9.9" y1="38.1" x2="13.4" y2="34.6" />
      <line x1="34.6" y1="13.4" x2="38.1" y2="9.9" />
    </g>
  </g>
)

const moon = <path d="M28 8a16 16 0 1 0 12 26A13 13 0 0 1 28 8z" fill="#F5D76E" />

const cloudPath = 'M14 40h22a8 8 0 0 0 0-16 11 11 0 0 0-21-2 9 9 0 0 0-1 18z'

const PALETTES = {
  day: { cloud: '#EEF4FB', cloudBack: '#B8C9DE', outline: '#B8C9DE', rainCloud: '#D5E0EE' },
  night: { cloud: '#CDD1E8', cloudBack: '#8E94BA', outline: '#9DA3C6', rainCloud: '#B4BAD8' },
}

// Bulutların arkasından görünen küçük güneş/ay (kapalı ve yağışlı havada).
const PEEK_TRANSFORM = 'translate(21 -3) scale(0.6)'
// Yağışlı ikonlarda bulut, damlalara yer açmak için yukarı kaydırılır.
const RAISED = 'translate(0 -8)'

function WeatherIcon({ condition, size = 48, isDay = true }: WeatherIconProps) {
  const celestial = isDay ? sun : moon
  const palette = isDay ? PALETTES.day : PALETTES.night
  const peek = <g transform={PEEK_TRANSFORM}>{celestial}</g>

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {condition === 'sunny' && celestial}

      {condition === 'partly-cloudy' && (
        <>
          <g transform="translate(-4 -6) scale(0.85)">{celestial}</g>
          <path d={cloudPath} fill={palette.cloud} stroke={palette.outline} strokeWidth="1.5" />
        </>
      )}

      {condition === 'cloudy' && (
        <>
          {peek}
          <path d={cloudPath} transform="translate(8 -6) scale(0.8)" fill={palette.cloudBack} />
          <path d={cloudPath} fill={palette.cloud} stroke={palette.outline} strokeWidth="1.5" />
        </>
      )}

      {condition === 'foggy' && (
        <>
          <path
            d={cloudPath}
            transform={RAISED}
            fill={palette.cloud}
            stroke={palette.outline}
            strokeWidth="1.5"
          />
          <g stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round">
            <line x1="8" y1="37" x2="40" y2="37" />
            <line x1="12" y1="43" x2="36" y2="43" />
          </g>
        </>
      )}

      {condition === 'snowy' && (
        <>
          {peek}
          <path
            d={cloudPath}
            transform={RAISED}
            fill={palette.cloud}
            stroke={palette.outline}
            strokeWidth="1.5"
          />
          <g fill="#93C5FD">
            <circle cx="16" cy="39" r="2.2" />
            <circle cx="24" cy="43" r="2.2" />
            <circle cx="32" cy="39" r="2.2" />
          </g>
        </>
      )}

      {condition === 'rainy' && (
        <>
          {peek}
          <path
            d={cloudPath}
            transform={RAISED}
            fill={palette.rainCloud}
            stroke={palette.outline}
            strokeWidth="1.5"
          />
          <g stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round">
            <line x1="17" y1="37" x2="15" y2="43" />
            <line x1="25" y1="37" x2="23" y2="43" />
            <line x1="33" y1="37" x2="31" y2="43" />
          </g>
        </>
      )}

      {condition === 'stormy' && (
        <>
          <path
            d={cloudPath}
            transform={RAISED}
            fill={isDay ? '#94A3B8' : '#6E7397'}
            stroke={isDay ? '#64748B' : '#565B80'}
            strokeWidth="1.5"
          />
          <path d="M25 33l-5 7h5l-3 7 8-10h-5l3-4z" fill="#FDB813" />
        </>
      )}
    </svg>
  )
}

export default WeatherIcon
