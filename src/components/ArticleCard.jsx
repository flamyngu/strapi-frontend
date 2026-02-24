import { useState } from 'react'
import './ArticleCard.css'

const STRAPI_URL = 'http://localhost:1337'

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

function getThumbnailUrl(article) {
  const imageField = article.cover || article.image || article.thumbnail
  
  if (!imageField) return null
  
  const imageData = imageField.data ? imageField.data : imageField
  const formats = Array.isArray(imageData) ? imageData[0]?.attributes?.formats : imageData?.attributes?.formats
  const url = Array.isArray(imageData) ? imageData[0]?.attributes?.url : imageData?.attributes?.url
  
  if (!formats && !url) return null
  
  // Prefer thumbnail or small format for cards
  const imageUrl = formats?.thumbnail?.url || formats?.small?.url || formats?.medium?.url || url
  
  return imageUrl ? `${STRAPI_URL}${imageUrl}` : null
}

export default function ArticleCard({ article, index, onClick }) {
  const [hovered, setHovered] = useState(false)
  const layout = LAYOUTS[index % LAYOUTS.length]
  const thumbnailUrl = getThumbnailUrl(article)

  return (
    <article
      className={`card ${layout.featured ? 'card--featured' : ''}`}
      style={{ '--cols': layout.cols }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="card-inner">
        <div className="card-meta">
          <span className="card-index">
            {String(article.id).padStart(2, '0')}
          </span>
          <span className="card-date">{formatDate(article.publishedAt)}</span>
        </div>

        <div className="card-body">
          {thumbnailUrl && (
            <div className="card-thumbnail">
              <img src={thumbnailUrl} alt={article.title} />
            </div>
          )}
          
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
