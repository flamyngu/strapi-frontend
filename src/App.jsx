import { useState, useEffect } from 'react'
import ArticleCard from './components/ArticleCard'
import ArticleDetail from './components/ArticleDetail'
import Header from './components/Header'
import './App.css'

const STRAPI_URL = 'http://localhost:1337'

export default function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        // Populate 'cover' image field (adjust field name if different in your Strapi)
        const res = await fetch(`${STRAPI_URL}/api/articles?populate=*`)
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
                  onClick={() => setSelectedArticle(article)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedArticle && (
        <ArticleDetail 
          article={selectedArticle}
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
