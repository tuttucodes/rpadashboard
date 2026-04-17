import { useEffect, useState, useCallback, useRef } from 'react'
import {
  fetchSheetData,
  fetchSheet1BCD,
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
import Sheet1Table from './components/Sheet1Table'
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
  const [sheet1Data, setSheet1Data] = useState({ headers: null, rows: [] })
  const [sheet1Error, setSheet1Error] = useState(null)
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
      const [rows, sheet1] = await Promise.all([fetchSheetData(), fetchSheet1BCD()])
      setData(processData(rows))
      setSheet1Data(sheet1)
      setSheet1Error(null)
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

      try {
        const sheet1 = await fetchSheet1BCD()
        setSheet1Data(sheet1)
        setSheet1Error(null)
      } catch (sheetErr) {
        setSheet1Error(sheetErr.message)
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
            <QualitativeSection students={data.students} insights={data.qualitativeInsights} />
            <RespondentTable students={data.students} />
            <Sheet1Table headers={sheet1Data.headers} rows={sheet1Data.rows} hasError={Boolean(sheet1Error)} />
          </>
        ) : null}

        <Footer />
      </div>
    </div>
  )
}
