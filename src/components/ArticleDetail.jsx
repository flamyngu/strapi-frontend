import { useEffect } from 'react'
import './ArticleDetail.css'

const STRAPI_URL = 'http://localhost:1337'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getImageUrl(article) {
  // Check multiple possible image field names
  const imageField = article.cover || article.image || article.thumbnail
  
  if (!imageField) return null
  
  // Handle both formats: direct object or nested data array
  const imageData = imageField.data ? imageField.data : imageField
  const formats = Array.isArray(imageData) ? imageData[0]?.attributes?.formats : imageData?.attributes?.formats
  const url = Array.isArray(imageData) ? imageData[0]?.attributes?.url : imageData?.attributes?.url
  
  if (!formats && !url) return null
  
  // Prefer large format, fallback to medium, small, or original
  const imageUrl = formats?.large?.url || formats?.medium?.url || formats?.small?.url || url
  
  return imageUrl ? `${STRAPI_URL}${imageUrl}` : null
}

// Simple markdown parser (handles basic markdown from Strapi)
function markdownToHtml(markdown) {
  if (!markdown) return ''
  
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>')
    // Lists
    .replace(/<p>- (.+?)<\/p>/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  return html
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

  const imageUrl = getImageUrl(article)

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

          {imageUrl && (
            <div className="detail-image-wrapper">
              <img 
                src={imageUrl} 
                alt={article.title}
                className="detail-image"
              />
            </div>
          )}

          <div className="detail-body">
            {article.description && (
              <div className="detail-description">
                <p>{article.description}</p>
              </div>
            )}

            {article.blocks && article.blocks.length > 0 && (
              <div className="detail-content">
                {article.blocks.map((block, index) => {
                  if (block.__component === 'shared.rich-text') {
                    return (
                      <div key={index} className="content-richtext">
                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(block.body) }} />
                      </div>
                    )
                  }
                  
                  if (block.__component === 'shared.quote') {
                    return (
                      <blockquote key={index} className="content-quote">
                        <p className="quote-body">{block.body}</p>
                        {block.title && <cite className="quote-author">— {block.title}</cite>}
                      </blockquote>
                    )
                  }
                  
                  if (block.__component === 'shared.media') {
                    return (
                      <div key={index} className="content-media">
                        <p className="media-placeholder">
                          [Media Block #{block.id}]
                        </p>
                      </div>
                    )
                  }
                  
                  if (block.__component === 'shared.slider') {
                    return (
                      <div key={index} className="content-slider">
                        <p className="slider-placeholder">
                          [Slider Block #{block.id}]
                        </p>
                      </div>
                    )
                  }
                  
                  return null
                })}
              </div>
            )}

            <div className="detail-info">
              <div className="detail-info-item">
                <span className="detail-info-label">Autor</span>
                <span className="detail-info-value">
                  {article.author?.name || 'Unbekannt'}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Kategorie</span>
                <span className="detail-info-value">
                  {article.category?.name || '—'}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Erstellt</span>
                <span className="detail-info-value">{formatDate(article.createdAt)}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Aktualisiert</span>
                <span className="detail-info-value">{formatDate(article.updatedAt)}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
