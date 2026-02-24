import { useState } from 'react'
import './ArticleCard.css'

// Assign each article a grid pattern for an editorial feel
const LAYOUTS = [
  { cols: 7, featured: true },   // wide + featured
  { cols: 5, featured: false },
  { cols: 4, featured: false },
  { cols: 4, featured: false },
  { cols: 4, featured: false },
  { cols: 6, featured: false },
  { cols: 6, featured: false },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ArticleCard({ article, index }) {
  const [hovered, setHovered] = useState(false)
  const layout = LAYOUTS[index % LAYOUTS.length]

  return (
    <article
      className={`card ${layout.featured ? 'card--featured' : ''}`}
      style={{ '--cols': layout.cols }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="card-inner">
        <div className="card-meta">
          <span className="card-index">
            {String(article.id).padStart(2, '0')}
          </span>
          <span className="card-date">{formatDate(article.publishedAt)}</span>
        </div>

        <div className="card-body">
          <h2 className="card-title">{article.title}</h2>
          {article.description && (
            <p className="card-description">{article.description}</p>
          )}
        </div>

        <div className="card-footer">
          <span className="card-slug">/{article.slug}</span>
          <span className={`card-arrow ${hovered ? 'card-arrow--active' : ''}`}>
            →
          </span>
        </div>
      </div>
    </article>
  )
}
