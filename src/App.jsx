import { useEffect, useState, useCallback, useRef } from 'react'
import {
  fetchSheetData,
  processData,
  FALLBACK_ROWS,
  loadCachedRows,
  saveCachedRows,
} from './data'
import Header from './components/Header'
import StatCards from './components/StatCards'
import RatingBars from './components/RatingBars'
import ChartsRow from './components/ChartsRow'
import QualitativeSection from './components/QualitativeSection'
import RespondentTable from './components/RespondentTable'
import Footer from './components/Footer'
import styles from './App.module.css'

const AUTO_REFRESH_MS = 30000

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [staleData, setStaleData] = useState(false)
  const dataRef = useRef(null)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  const load = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const rows = await fetchSheetData()
      setData(processData(rows))
      setLastUpdated(new Date())
      setError(null)
      setStaleData(false)
      setUsingFallback(false)
      saveCachedRows(rows)
    } catch (e) {
      const cached = loadCachedRows()

      setError(e.message)

      if (!dataRef.current) {
        if (cached?.rows?.length) {
          setData(processData(cached.rows))
          setLastUpdated(cached.fetchedAt)
          setUsingFallback(false)
          setStaleData(true)
        } else {
          setData(processData(FALLBACK_ROWS))
          setLastUpdated(new Date())
          setUsingFallback(true)
          setStaleData(false)
        }
      } else {
        setStaleData(true)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const cached = loadCachedRows()

    if (cached?.rows?.length) {
      setData(processData(cached.rows))
      setLastUpdated(cached.fetchedAt)
      setLoading(false)
    }

    load()
  }, [load])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      load({ silent: true })
    }, AUTO_REFRESH_MS)

    return () => window.clearInterval(intervalId)
  }, [load])

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Header
          onRefresh={() => load()}
          loading={loading}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          autoRefreshMs={AUTO_REFRESH_MS}
          hasError={Boolean(error)}
          staleData={staleData}
        />

        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorIcon}>!</span>
            <div>
              <strong>Live refresh failed.</strong>
              {' '}
              {usingFallback
                ? 'The dashboard is showing sample data until the sheet becomes reachable.'
                : 'Your last successful live snapshot is still visible, and the dashboard will keep retrying automatically.'}
            </div>
          </div>
        )}

        {loading && !data ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading feedback data...</p>
          </div>
        ) : data ? (
          <>
            <StatCards data={data} usingFallback={usingFallback} />
            <RatingBars ratings={data.ratings} />
            <ChartsRow data={data} />
            <QualitativeSection students={data.students} />
            <RespondentTable students={data.students} />
          </>
        ) : null}

        <Footer />
      </div>
    </div>
  )
}
