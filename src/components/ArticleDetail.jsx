import { useEffect } from 'react'
import './ArticleDetail.css'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function ArticleDetail({ article, onClose }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevent body scroll when detail is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-container" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>

        <article className="detail-article">
          <header className="detail-header">
            <div className="detail-meta">
              <span className="detail-id">#{String(article.id).padStart(2, '0')}</span>
              <span className="detail-date">{formatDate(article.publishedAt)}</span>
            </div>

            <h1 className="detail-title">{article.title}</h1>

            {article.slug && (
              <p className="detail-slug">/{article.slug}</p>
            )}
          </header>

          <div className="detail-body">
            {article.description && (
              <div className="detail-description">
                <p>{article.description}</p>
              </div>
            )}

            <div className="detail-content">
              <p className="detail-placeholder">
                Der vollständige Artikel-Inhalt würde hier angezeigt werden. 
                In Strapi kannst du ein zusätzliches Feld wie <code>content</code> (Rich Text) 
                hinzufügen, um längere Texte zu speichern.
              </p>
            </div>

            <div className="detail-info">
              <div className="detail-info-item">
                <span className="detail-info-label">Erstellt</span>
                <span className="detail-info-value">{formatDate(article.createdAt)}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Aktualisiert</span>
                <span className="detail-info-value">{formatDate(article.updatedAt)}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Document ID</span>
                <span className="detail-info-value detail-info-value--mono">{article.documentId}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
