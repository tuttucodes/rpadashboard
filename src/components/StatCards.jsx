import styles from './StatCards.module.css'

function getSentiment(score) {
  if (score >= 4) return { label: 'Positive trend', color: 'var(--success)' }
  if (score >= 3) return { label: 'Mixed feedback', color: 'var(--accent)' }
  return { label: 'Needs attention', color: 'var(--danger)' }
}

export default function StatCards({ data, usingFallback }) {
  const { overallAvg, students, ratings } = data
  const sent = getSentiment(overallAvg)
  const highestRating = ratings.reduce((a, b) => a.avg > b.avg ? a : b)
  const lowestRating = ratings.reduce((a, b) => a.avg < b.avg ? a : b)

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.label}>Responses captured</div>
        <div className={styles.value}>{students.length}</div>
        <div className={styles.sub}>{usingFallback ? 'sample mode' : 'live from Google Sheets'}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Overall average</div>
        <div className={styles.value}>{overallAvg}<span className={styles.unit}>/5</span></div>
        <div className={styles.sub} style={{ color: sent.color }}>{sent.label}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Strongest area</div>
        <div className={styles.valueSmall}>{highestRating.avg}</div>
        <div className={styles.sub}>{highestRating.label}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Lowest scoring area</div>
        <div className={styles.valueSmall}>{lowestRating.avg}</div>
        <div className={styles.sub}>{lowestRating.label}</div>
      </div>
    </div>
  )
}
