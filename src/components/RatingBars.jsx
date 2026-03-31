import { useEffect, useRef, useState } from 'react'
import styles from './RatingBars.module.css'

function getColor(avg) {
  if (avg >= 4) return 'var(--success)'
  if (avg >= 3) return 'var(--accent)'
  return 'var(--danger)'
}

export default function RatingBars({ ratings }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div className={styles.card} ref={ref}>
      <div className={styles.sectionTitle}>Rating breakdown</div>
      <div className={styles.bars}>
        {ratings.map((r, i) => {
          const pct = (r.avg / 5) * 100
          const color = getColor(r.avg)
          return (
            <div key={r.key} className={styles.row} style={{ animationDelay: `${i * 80}ms` }}>
              <div className={styles.labelWrap}>
                <span className={styles.label}>{r.label}</span>
                <span className={styles.valBadge} style={{ color }}>
                  {r.avg.toFixed(1)}<span className={styles.max}>/5</span>
                </span>
              </div>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{
                    width: animated ? `${pct}%` : '0%',
                    background: color,
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
                {[1,2,3,4,5].map(n => (
                  <div key={n} className={styles.tick} style={{ left: `${(n/5)*100}%` }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
