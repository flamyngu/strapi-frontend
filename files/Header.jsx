import './Header.css'

export default function Header({ total }) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="header">
      <div className="header-topbar">
        <span className="header-date">{dateStr}</span>
        {total != null && (
          <span className="header-total">{total} Artikel verfügbar</span>
        )}
      </div>

      <div className="header-main">
        <div className="header-rule" />
        <div className="header-title-wrap">
          <span className="header-eyebrow">Strapi</span>
          <h1 className="header-title">Artikel<span className="header-title-accent">.</span></h1>
          <p className="header-sub">Das aktuelle Archiv aller Beiträge</p>
        </div>
        <div className="header-rule header-rule--bottom" />
      </div>
    </header>
  )
}
