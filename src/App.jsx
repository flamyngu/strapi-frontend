import { useState, useEffect } from 'react'
import ArticleCard from './components/ArticleCard'
import ArticleDetail from './components/ArticleDetail'
import Header from './components/Header'
import './App.css'

const STRAPI_URL = 'http://localhost:1337'

const LIST_QUERY =
  'populate[cover]=true' +
  '&populate[author]=true' +
  '&populate[category]=true' +
  '&populate[pdfs][populate][0]=file'

// Strapi 5 Dynamic Zone: "populate[blocks][on][shared.media][populate][0]=file"
// loads each component type explicitly — avoids the 500 from generic populate
const detailQuery = (documentId) => {
  const base = `${STRAPI_URL}/api/articles/${documentId}`
  const params = [
    'populate[cover]=true',
    'populate[author]=true',
    'populate[category]=true',
    'populate[pdfs][populate][0]=file',
    // Dynamic zone: explicit per-component populate
    'populate[blocks][on][shared.media][populate][0]=file',
    'populate[blocks][on][shared.quote][populate]=*',
    'populate[blocks][on][shared.rich-text][populate]=*',
    'populate[blocks][on][shared.slider][populate]=*',
  ].join('&')
  return `${base}?${params}`
}

export default function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${STRAPI_URL}/api/articles?${LIST_QUERY}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const json = await res.json()
        setArticles(json.data || [])
        setMeta(json.meta || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const handleArticleClick = async (article) => {
    setSelectedArticle(article)
    setDetailLoading(true)
    try {
      const res = await fetch(detailQuery(article.documentId))
      if (res.ok) {
        const json = await res.json()
        if (json.data) setSelectedArticle(json.data)
      } else {
        // Log for debugging
        const err = await res.json()
        console.warn('Detail fetch failed:', err)
      }
    } catch (e) {
      console.warn('Detail fetch error:', e)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="app">
      <Header total={meta?.pagination?.total} />

      <main className="main">
        {loading && (
          <div className="status-container">
            <div className="loading-pulse">
              <span className="loading-bar" />
              <span className="loading-bar" />
              <span className="loading-bar" />
            </div>
            <p className="status-text">Lade Artikel…</p>
          </div>
        )}

        {error && (
          <div className="status-container">
            <div className="error-box">
              <span className="error-label">Fehler</span>
              <p className="error-message">{error}</p>
              <p className="error-hint">
                Läuft Strapi auf <code>http://localhost:1337</code>?
              </p>
            </div>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="status-container">
            <p className="status-text">Keine Artikel gefunden.</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <>
            <div className="issue-line">
              <span className="issue-tag">AUSGABE</span>
              <span className="issue-divider" />
              <span className="issue-count">{articles.length} Artikel</span>
            </div>

            <div className="articles-grid">
              {articles.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={i}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          loading={detailLoading}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">Strapi CMS</span>
          <span className="footer-sep">·</span>
          <span className="footer-info">
            {meta ? `${meta.pagination.total} Artikel gesamt` : ''}
          </span>
        </div>
      </footer>
    </div>
  )
}
