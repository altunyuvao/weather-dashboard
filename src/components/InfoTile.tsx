import Icon from './Icon'
import type { IconName } from './Icon'

interface InfoTileProps {
  icon: IconName
  label: string
  /** null ise "Veri yok" gösterilir. */
  value: string | null
  hint?: string
}

/** İkon + etiket + değerden oluşan küçük bilgi kutusu. Bir <dl> içinde kullanılır. */
function InfoTile({ icon, label, value, hint }: InfoTileProps) {
  return (
    <div className="glass info-tile">
      <dt className="info-tile__label">
        <span className="info-tile__icon">
          <Icon name={icon} size={16} />
        </span>
        {label}
      </dt>
      <dd className={value === null ? 'info-tile__value is-empty' : 'info-tile__value'}>
        {value ?? 'Veri yok'}
      </dd>
      {value !== null && hint && <dd className="info-tile__hint">{hint}</dd>}
    </div>
  )
}

export default InfoTile
