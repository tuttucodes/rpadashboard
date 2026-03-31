import styles from './Header.module.css'

function formatTime(date) {
  return date
    ? date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'
}

export default function Header({ onRefresh, loading, refreshing, lastUpdated, autoRefreshMs, hasError, staleData }) {
  const autoRefreshSeconds = Math.round(autoRefreshMs / 1000)
  const statusLabel = loading
    ? 'Loading live data'
    : refreshing
      ? 'Refreshing'
      : staleData
        ? 'Showing last live snapshot'
        : 'Live data active'

  return (
    <header className={styles.header}>
      <div className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>RPA Course Feedback</p>
          <h1 className={styles.title}>A calmer view of what students are saying.</h1>
          <p className={styles.subtitle}>
            Live course feedback from Google Sheets, refreshed automatically and kept on screen even when the source is temporarily unavailable.
          </p>
        </div>
        <div className={styles.panel}>
          <div className={styles.statusRow}>
            <div className={styles.statusBlock}>
              <span className={`${styles.dot} ${(loading || refreshing) ? styles.dotPulse : ''} ${hasError ? styles.dotWarning : ''}`} />
              <div>
                <div className={styles.statusLabel}>{statusLabel}</div>
                <div className={styles.statusMeta}>Updated {formatTime(lastUpdated)}</div>
              </div>
            </div>
            <button className={styles.refreshBtn} onClick={onRefresh} disabled={loading || refreshing}>
              Refresh now
            </button>
          </div>
          <div className={styles.rule} />
          <div className={styles.chips}>
            <span className={styles.chip}>Auto refresh every {autoRefreshSeconds}s</span>
            <span className={styles.chip}>Faculty: Dr Umesh K</span>
            <span className={styles.chip}>Course: Robot Process Automation</span>
          </div>
        </div>
      </div>
    </header>
  )
}
