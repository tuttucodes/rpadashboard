import styles from './Header.module.css'

function formatTime(date) {
  return date
    ? date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'
}

export default function Header({ onRefresh, loading, refreshing, lastUpdated, hasError, staleData }) {
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
          <p className={styles.eyebrow}>Project by Rohan, Dhaanya & Rahul</p>
          <h1 className={styles.title}>RPA Course Feedback</h1>
          <div className={styles.metaText}>
            <span>Under faculty Dr Umesh K</span>
            <span>VIT Chennai</span>
          </div>
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
            <span className={styles.chip}>Robot Process Automation</span>
            <span className={styles.chip}>Google Forms dashboard</span>
          </div>
        </div>
      </div>
    </header>
  )
}
