import { useState } from 'react'
import styles from './QualitativeSection.module.css'

const TABS = [
  { key: 'difficulty', label: 'Difficulties', accent: '#E24B4A' },
  { key: 'improvement', label: 'Improvements', accent: '#0ABFBC' },
  { key: 'impression', label: 'Impressions', accent: '#FF6B35' },
  { key: 'concerns', label: 'Concerns', accent: '#BA7517' },
  { key: 'helpers', label: 'Would Help', accent: '#3B6D11' },
]

function isEmpty(val) {
  return !val || val.toLowerCase() === 'no' || val.trim() === ''
}

export default function QualitativeSection({ students }) {
  const [active, setActive] = useState('difficulty')
  const tab = TABS.find(t => t.key === active)

  const items = students
    .map(s => ({ name: s.name, reg: s.reg, text: s[active] }))
    .filter(i => !isEmpty(i.text))

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>Student Responses</div>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${active === t.key ? styles.tabActive : ''}`}
            style={active === t.key ? { borderColor: t.accent, color: t.accent } : {}}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {items.length === 0 ? (
          <p className={styles.empty}>No responses for this category.</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className={styles.responseCard} style={{ borderLeftColor: tab.accent }}>
              <p className={styles.responseText}>{item.text}</p>
              <div className={styles.responseMeta}>
                <span>{item.name}</span>
                {item.reg && item.reg !== '—' && (
                  <span className={styles.reg}>{item.reg}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
