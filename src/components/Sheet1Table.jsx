import styles from './Sheet1Table.module.css'

export default function Sheet1Table({ headers, rows, hasError }) {
  const labels = {
    colB: headers?.colB || 'Average',
    colC: headers?.colC || 'Efficiency',
    colD: headers?.colD || 'Difficulty',
  }

  if (!rows?.length) {
    return (
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>Performance Highlights</h3>
          {hasError ? <span className={styles.badgeError}>Live fetch failed</span> : null}
        </div>
        <p className={styles.emptyText}>
          {hasError
            ? 'Could not load Sheet1 data right now. The dashboard will retry on refresh.'
            : 'No rows found in Sheet1 for columns B-D.'}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Performance Highlights</h3>
        <span className={styles.badge}>{rows.length} rows</span>
      </div>

      {rows.length === 1 ? (
        <div className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>{labels.colB}</div>
            <div className={styles.metricValue}>{rows[0].colB || '—'}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>{labels.colC}</div>
            <div className={styles.metricValue}>{rows[0].colC || '—'}</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>{labels.colD}</div>
            <div className={styles.metricValue}>{rows[0].colD || '—'}</div>
          </div>
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>{labels.colB}</th>
              <th>{labels.colC}</th>
              <th>{labels.colD}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.colB || '—'}</td>
                <td>{row.colC || '—'}</td>
                <td>{row.colD || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
