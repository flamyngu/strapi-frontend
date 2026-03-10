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
  const imageField = article.cover || article.image || article.thumbnail
  if (!imageField) return null
  const formats = imageField.formats
  const url = imageField.url
  if (!formats && !url) return null
  const imageUrl = formats?.large?.url || formats?.medium?.url || formats?.small?.url || url
  return imageUrl ? `${STRAPI_URL}${imageUrl}` : null
}

function getMediaBlockImageUrl(block) {
  // shared.media block: block.file holds the media object
  const file = block.file
  if (!file) return null
  const formats = file.formats
  const url = file.url
  if (!formats && !url) return null
  const imageUrl = formats?.large?.url || formats?.medium?.url || formats?.small?.url || url
  return imageUrl ? `${STRAPI_URL}${imageUrl}` : null
}

function getPdfUrl(pdf) {
  if (!pdf?.file?.url) return null
  return `${STRAPI_URL}${pdf.file.url}`
}

/**
 * Parse inline references like <ref>1</ref> and return segments.
 * Returns an array of { type: 'text'|'ref', value } objects.
 */
function parseRefs(text) {
  if (!text) return []
  const parts = []
  const regex = /<ref>(\d+)<\/ref>/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'ref', value: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }
  return parts
}

function TextWithRefs({ text }) {
  const parts = parseRefs(text)
  return (
    <>
      {parts.map((part, i) =>
        part.type === 'ref' ? (
          <sup key={i}>
            <a className="ref-marker" href={`#ref-${part.value}`}>
              [{part.value}]
            </a>
          </sup>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </>
  )
}

// Simple markdown parser
function markdownToHtml(markdown) {
  if (!markdown) return ''
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>')
    .replace(/<p>- (.+?)<\/p>/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  return html
}

/**
 * Collect all references from abstract + rich-text blocks.
 * Returns a Map<refNumber, occurrenceIndex> for deduplication.
 */
function collectRefs(article) {
  // We just display them in order of appearance; user defines meaning via content.
  // Return a sorted unique list of ref numbers found in abstract + rich-text blocks.
  const found = new Set()
  const scan = (text) => {
    if (!text) return
    const regex = /<ref>(\d+)<\/ref>/g
    let m
    while ((m = regex.exec(text)) !== null) found.add(m[1])
  }
  scan(article.abstract)
  ;(article.blocks || []).forEach((b) => {
    if (b.__component === 'shared.rich-text') scan(b.body)
  })
  return [...found].sort((a, b) => Number(a) - Number(b))
}

export default function ArticleDetail({ article, onClose, loading = false }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const imageUrl = getImageUrl(article)
  const refNumbers = collectRefs(article)

  // Separate media blocks from other blocks for the "2 extra images" section
  const mediaBlocks = (article.blocks || []).filter(
    (b) => b.__component === 'shared.media'
  )
  const otherBlocks = (article.blocks || []).filter(
    (b) => b.__component !== 'shared.media'
  )
  // Show first 2 media blocks as featured images
  const extraImages = mediaBlocks.slice(0, 2)

  const pdfs = article.pdfs || []

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-container" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose} aria-label="Schließen">✕</button>

        {loading && (
          <div className="detail-blocks-loading">
            <span className="detail-blocks-loading-bar" />
            <span className="detail-blocks-loading-bar" />
            <span className="detail-blocks-loading-bar" />
            <span className="detail-blocks-loading-text">Lade Inhalt…</span>
          </div>
        )}

        <article className="detail-article">

          {/* ── Header ── */}
          <header className="detail-header">
            <div className="detail-meta">
              <span className="detail-id">#{String(article.id).padStart(2, '0')}</span>
              <span className="detail-date">{formatDate(article.publishedAt)}</span>
              {article.category?.name && (
                <span className="detail-category">{article.category.name}</span>
              )}
            </div>

            <h1 className="detail-title">{article.title}</h1>

            {article.subtitle && (
              <p className="detail-subtitle">{article.subtitle}</p>
            )}

            {article.slug && (
              <p className="detail-slug">/{article.slug}</p>
            )}
          </header>

          {/* ── Cover Image ── */}
          {imageUrl && (
            <div className="detail-image-wrapper">
              <img src={imageUrl} alt={article.title} className="detail-image" />
            </div>
          )}

          <div className="detail-body">

            {/* ── Description (lead) ── */}
            {article.description && (
              <div className="detail-description">
                <p>{article.description}</p>
              </div>
            )}

            {/* ── Abstract / Zusammenfassung ── */}
            {article.abstract && (
              <section className="detail-abstract">
                <h2 className="detail-section-label">Zusammenfassung</h2>
                <p className="detail-abstract-text">
                  <TextWithRefs text={article.abstract} />
                </p>
              </section>
            )}

            {/* ── Extra Images (2 media blocks with captions) ── */}
            {extraImages.length > 0 && (
              <section className="detail-gallery">
                <h2 className="detail-section-label">Bilder</h2>
                <div className={`detail-gallery-grid detail-gallery-grid--${extraImages.length}`}>
                  {extraImages.map((block, i) => {
                    const url = getMediaBlockImageUrl(block)
                    const caption = block.caption || block.file?.caption || null
                    return (
                      <figure key={i} className="detail-figure">
                        {url ? (
                          <img src={url} alt={caption || `Bild ${i + 1}`} className="detail-figure-img" />
                        ) : (
                          <div className="detail-figure-placeholder">
                            <span>Bild nicht verfügbar</span>
                          </div>
                        )}
                        {caption && (
                          <figcaption className="detail-figure-caption">
                            {caption}
                          </figcaption>
                        )}
                      </figure>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ── Main Content Blocks (quotes + rich-text) ── */}
            {otherBlocks.length > 0 && (
              <div className="detail-content">
                {otherBlocks.map((block, index) => {
                  if (block.__component === 'shared.rich-text') {
                    // Parse refs inline via dangerouslySetInnerHTML is tricky;
                    // convert <ref>N</ref> to superscript anchors first
                    const withRefLinks = (block.body || '').replace(
                      /<ref>(\d+)<\/ref>/g,
                      '<sup><a class="ref-marker" href="#ref-$1">[$1]</a></sup>'
                    )
                    return (
                      <div key={index} className="content-richtext">
                        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(withRefLinks) }} />
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

                  if (block.__component === 'shared.slider') {
                    return (
                      <div key={index} className="content-slider">
                        <p className="slider-placeholder">[Slider Block #{block.id}]</p>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            )}

            {/* ── References ── */}
            {refNumbers.length > 0 && (
              <section className="detail-references">
                <h2 className="detail-section-label">Quellen</h2>
                <ol className="references-list">
                  {refNumbers.map((num) => (
                    <li key={num} id={`ref-${num}`} className="reference-item">
                      <span className="reference-num">[{num}]</span>
                      <span className="reference-placeholder">
                        Quelle {num} – Bitte Quellenangabe im CMS hinterlegen.
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* ── PDF Downloads ── */}
            {pdfs.length > 0 && (
              <section className="detail-pdfs">
                <h2 className="detail-section-label">Dokumente</h2>
                <ul className="pdf-list">
                  {pdfs.map((pdf, i) => {
                    const url = getPdfUrl(pdf)
                    return (
                      <li key={pdf.id || i} className="pdf-item">
                        <span className="pdf-icon" aria-hidden="true">↓</span>
                        {url ? (
                          <a
                            href={url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-link"
                          >
                            {pdf.title || `Dokument ${i + 1}`}
                            <span className="pdf-ext">PDF</span>
                          </a>
                        ) : (
                          <span className="pdf-link pdf-link--unavailable">
                            {pdf.title || `Dokument ${i + 1}`}
                            <span className="pdf-ext pdf-ext--na">nicht verfügbar</span>
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {/* ── Info Grid ── */}
            <div className="detail-info">
              <div className="detail-info-item">
                <span className="detail-info-label">Autor</span>
                <span className="detail-info-value">{article.author?.name || 'Unbekannt'}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Kategorie</span>
                <span className="detail-info-value">{article.category?.name || '—'}</span>
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
