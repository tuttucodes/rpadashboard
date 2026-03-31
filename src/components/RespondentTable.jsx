import styles from './RespondentTable.module.css'

function getSentiment(avg) {
  if (avg >= 4) return { label: 'Good', color: '#2e6f56', bg: 'rgba(46,111,86,0.12)' }
  if (avg >= 3) return { label: 'Average', color: '#a26f39', bg: 'rgba(162,111,57,0.12)' }
  return { label: 'Low', color: '#b15f5a', bg: 'rgba(177,95,90,0.12)' }
}

function ScoreBar({ value }) {
  const pct = (value / 5) * 100
  const color = value >= 4 ? '#2e6f56' : value >= 3 ? '#a26f39' : '#b15f5a'
  return (
    <div className={styles.miniBarWrap}>
      <div className={styles.miniBar}>
        <div className={styles.miniFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.miniVal} style={{ color }}>{value.toFixed(1)}</span>
    </div>
  )
}

export default function RespondentTable({ students }) {
  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>Respondent overview</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Reg. No</th>
              <th>Avg Score</th>
              <th>Sentiment</th>
              <th>First Impression</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => {
              const sent = getSentiment(s.avg)
              return (
                <tr key={i}>
                  <td className={styles.idx}>{s.index}</td>
                  <td className={styles.name}>{s.name}</td>
                  <td className={styles.reg}>{s.reg}</td>
                  <td><ScoreBar value={s.avg} /></td>
                  <td>
                    <span className={styles.pill} style={{ color: sent.color, background: sent.bg }}>
                      {sent.label}
                    </span>
                  </td>
                  <td className={styles.impression}>{s.impression || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
