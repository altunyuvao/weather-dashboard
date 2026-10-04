import type { TemperatureUnit } from '../types/weather'

interface UnitToggleProps {
  unit: TemperatureUnit
  onChange: (unit: TemperatureUnit) => void
}

const UNITS: { value: TemperatureUnit; label: string }[] = [
  { value: 'C', label: 'Santigrat' },
  { value: 'F', label: 'Fahrenhayt' },
]

function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div className="unit-toggle" role="group" aria-label="Sıcaklık birimi">
      {UNITS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={value === unit ? 'unit-toggle__button is-active' : 'unit-toggle__button'}
          aria-pressed={value === unit}
          aria-label={label}
          title={`${label} (°${value})`}
          onClick={() => onChange(value)}
        >
          °{value}
        </button>
      ))}
    </div>
  )
}

export default UnitToggle
