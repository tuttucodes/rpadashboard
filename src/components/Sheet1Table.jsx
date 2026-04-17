import styles from './Sheet1Table.module.css'

export default function Sheet1Table({ headers, rows, hasError }) {
  if (!rows?.length) {
    return (
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>Sheet1 Data (Columns B, C, D)</h3>
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
        <h3 className={styles.title}>Sheet1 Data (Columns B, C, D)</h3>
        <span className={styles.badge}>{rows.length} rows</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>{headers?.colB || 'Column B'}</th>
              <th>{headers?.colC || 'Column C'}</th>
              <th>{headers?.colD || 'Column D'}</th>
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
