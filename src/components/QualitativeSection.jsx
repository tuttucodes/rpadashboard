import { useState } from 'react'
import styles from './QualitativeSection.module.css'
import { QUALITATIVE_THEME_LABELS } from '../qualitativeInsights'

const SENTIMENT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'negative', label: 'Negative' },
  { key: 'neutral', label: 'Neutral' },
  { key: 'positive', label: 'Positive' },
]

const SENTIMENT_STYLES = {
  positive: { color: 'var(--success)', background: 'rgba(46,111,86,0.12)' },
  neutral: { color: 'var(--text-soft)', background: 'rgba(92,75,58,0.1)' },
  negative: { color: 'var(--danger)', background: 'rgba(177,95,90,0.12)' },
}

export default function QualitativeSection({ insights }) {
  const [themeFilter, setThemeFilter] = useState('all')
  const [sentimentFilter, setSentimentFilter] = useState('all')

  const filteredResponses = insights.responses.filter((response) => {
    const matchesTheme = themeFilter === 'all' || response.themes.includes(themeFilter)
    const matchesSentiment = sentimentFilter === 'all' || response.sentiment === sentimentFilter
    return matchesTheme && matchesSentiment
  })

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>Qualitative insights</div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Positive</span>
          <strong className={styles.summaryValue}>{insights.sentimentCounts.positive}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Neutral</span>
          <strong className={styles.summaryValue}>{insights.sentimentCounts.neutral}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Negative</span>
          <strong className={styles.summaryValue}>{insights.sentimentCounts.negative}</strong>
        </div>
      </div>

      <div className={styles.insightsPanel}>
        <div className={styles.panelHead}>
          <div>
            <h3 className={styles.panelTitle}>Theme signals</h3>
            <p className={styles.panelText}>Rule-based analysis of text responses from the form.</p>
          </div>
        </div>

        <div className={styles.themeList}>
          {insights.topThemes.map((theme) => (
            <button
              key={theme.key}
              className={`${styles.themeChip} ${themeFilter === theme.key ? styles.themeChipActive : ''}`}
              onClick={() => setThemeFilter(themeFilter === theme.key ? 'all' : theme.key)}
            >
              <span>{theme.label}</span>
              <span className={styles.themeCount}>{theme.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.sentimentFilters}>
          {SENTIMENT_FILTERS.map((filter) => (
            <button
              key={filter.key}
              className={`${styles.sentimentFilter} ${sentimentFilter === filter.key ? styles.sentimentFilterActive : ''}`}
              onClick={() => setSentimentFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className={styles.analysisList}>
          {filteredResponses.length === 0 ? (
            <p className={styles.empty}>No analyzed responses match the current filters.</p>
          ) : (
            filteredResponses.map((response, index) => (
              <article key={`${response.studentName}-${response.sourceField}-${index}`} className={styles.analysisCard}>
                <div className={styles.analysisTop}>
                  <div className={styles.analysisTags}>
                    <span className={styles.sourceTag}>{response.sourceLabel}</span>
                    <span className={styles.sentimentTag} style={SENTIMENT_STYLES[response.sentiment]}>
                      {response.sentiment}
                    </span>
                    {response.severity && (
                      <span className={styles.severityTag}>{response.severity} priority</span>
                    )}
                  </div>
                  <div className={styles.analysisMeta}>
                    <span>{response.studentName}</span>
                    {response.reg && response.reg !== '—' && <span className={styles.reg}>{response.reg}</span>}
                  </div>
                </div>

                <p className={styles.responseText}>{response.originalText}</p>

                <div className={styles.inlineThemes}>
                  {response.themes.map((theme) => (
                    <span key={theme} className={styles.inlineTheme}>
                      {QUALITATIVE_THEME_LABELS[theme]}
                    </span>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
