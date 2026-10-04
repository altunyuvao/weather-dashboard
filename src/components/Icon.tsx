import type { ReactNode } from 'react'

export type IconName =
  | 'search'
  | 'star'
  | 'clock'
  | 'pin'
  | 'thermometer'
  | 'droplet'
  | 'wind'
  | 'umbrella'
  | 'gauge'
  | 'eye'
  | 'sun'
  | 'sunrise'
  | 'sunset'
  | 'compass'
  | 'alert'
  | 'locate'

interface IconProps {
  name: IconName
  size?: number
  /** Yalnızca 'star' için: içi dolu çizilir. */
  filled?: boolean
  className?: string
}

// Tüm ikonlar 24x24 alanda, currentColor ile çizgi (stroke) olarak çizilir.
const PATHS: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  thermometer: (
    <>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z" />
      <path d="M12 9v7" />
    </>
  ),
  droplet: <path d="M12 3.5c3.5 4.2 6 7.5 6 10.5a6 6 0 0 1-12 0c0-3 2.5-6.3 6-10.5z" />,
  wind: (
    <>
      <path d="M3 8.5h10.5a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3 12.5h15.5a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M3 16.5h7" />
    </>
  ),
  umbrella: (
    <>
      <path d="M3 12a9 9 0 0 1 18 0z" />
      <path d="M12 12v6.5a2 2 0 0 1-4 0" />
    </>
  ),
  gauge: (
    <>
      <path d="M4.5 17a8.5 8.5 0 1 1 15 0" />
      <path d="M12 14l3.5-4" />
      <circle cx="12" cy="14" r="1" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  sunrise: (
    <>
      <path d="M17 18a5 5 0 0 0-10 0" />
      <path d="M12 3v6M9 6l3-3 3 3" />
      <path d="M2.5 21.5h19M4.5 12.5l1.4 1.4M19.5 12.5l-1.4 1.4M2.5 18h2M19.5 18h2" />
    </>
  ),
  sunset: (
    <>
      <path d="M17 18a5 5 0 0 0-10 0" />
      <path d="M12 9V3M9 6l3 3 3-3" />
      <path d="M2.5 21.5h19M4.5 12.5l1.4 1.4M19.5 12.5l-1.4 1.4M2.5 18h2M19.5 18h2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.8 9.2l-1.9 4.7-4.7 1.9 1.9-4.7z" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V13M12 16.5v.01" />
    </>
  ),
  // Nişangah: "Konumumu kullan"
  locate: (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
    </>
  ),
}

function Icon({ name, size = 20, filled = false, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

export default Icon
