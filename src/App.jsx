import { useState, useEffect } from 'react'
import ArticleCard from './components/ArticleCard'
import ArticleDetail from './components/ArticleDetail'
import Header from './components/Header'
import './App.css'

const STRAPI_URL = 'http://localhost:1337'

// List query: cover + author + category + pdfs work fine.
// blocks (Dynamic Zone) causes 500 with populate — loaded separately on detail open.
const LIST_QUERY =
  'populate[cover]=true' +
  '&populate[author]=true' +
  '&populate[category]=true' +
  '&populate[pdfs][populate][0]=file'

// Detail query for a single article by documentId — loads blocks separately
const detailQuery = (documentId) =>
  `${STRAPI_URL}/api/articles/${documentId}?populate[blocks][populate][0]=file&populate[pdfs][populate][0]=file&populate[cover]=true&populate[author]=true&populate[category]=true`

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
    // Optimistically show article immediately, then enrich with blocks
    setSelectedArticle(article)
    setDetailLoading(true)
    try {
      const res = await fetch(detailQuery(article.documentId))
      if (res.ok) {
        const json = await res.json()
        if (json.data) setSelectedArticle(json.data)
      }
    } catch (e) {
      // silently fail — article still shows without blocks
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
