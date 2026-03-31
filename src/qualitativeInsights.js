const TRIVIAL_RESPONSES = new Set([
  '',
  'no',
  'none',
  'nil',
  'nothing',
  'nothing specific',
  'na',
  'n/a',
  '-',
  '--',
])

const THEME_RULES = {
  pace: ['pace', 'fast', 'slow', 'speed', 'quicker', 'slower', 'too much time'],
  clarity: ['clear', 'clarity', 'confusing', 'understand', 'understanding', 'explain', 'explained', 'lecture'],
  materials: ['notes', 'slides', 'material', 'materials', 'textbook', 'text book', 'study material'],
  examples: ['example', 'examples', 'numerical', 'numericals', 'demonstration', 'demo'],
  difficulty: ['difficult', 'difficulty', 'hard', 'complex', 'tough', 'broad syllabus', 'syllabus is hard'],
  engagement: ['interesting', 'boring', 'interactive', 'engaging', 'attention', 'focus'],
  support: ['doubt', 'doubts', 'help', 'support', 'guidance', 'ask questions'],
  practice: ['practice', 'revision', 'assignment', 'questions', 'exercise', 'exercises', 'project', 'projects'],
  workload: ['workload', 'overwhelming', 'too much', 'heavy', 'burden', 'broad syllabus', 'syllabus'],
  positive_experience: ['good', 'great', 'helpful', 'excellent', 'interesting', 'comfortable', 'well', 'very good'],
}

const POSITIVE_WORDS = [
  'good', 'great', 'helpful', 'clear', 'interesting', 'comfortable', 'nice', 'excellent', 'well', 'useful',
]

const NEGATIVE_WORDS = [
  'hard', 'difficult', 'confusing', 'fast', 'slow', 'unclear', 'overwhelming', 'too much', 'poor', 'bad', 'doubt',
]

const HIGH_SEVERITY_WORDS = [
  'extremely', 'very confusing', 'overwhelming', 'impossible', 'too difficult', 'serious', 'unable',
]

export const QUALITATIVE_THEME_LABELS = {
  pace: 'Pace',
  clarity: 'Clarity',
  materials: 'Materials',
  examples: 'Examples',
  difficulty: 'Difficulty',
  engagement: 'Engagement',
  support: 'Support',
  practice: 'Practice',
  workload: 'Workload',
  positive_experience: 'Positive experience',
  other: 'Other',
}

export const QUALITATIVE_SOURCE_LABELS = {
  difficulty: 'Finding difficult',
  improvement: 'Suggested improvement',
  concerns: 'Concern',
  impression: 'First impression',
  helpers: 'Would help',
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function hasPhrase(text, phrase) {
  return text.split(' ').length === 0
    ? false
    : text.match(new RegExp(`(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`)) !== null
}

function countMatches(text, words) {
  return words.reduce((count, word) => count + (hasPhrase(text, word) ? 1 : 0), 0)
}

export function analyzeResponse(text) {
  const normalized = normalizeText(text ?? '')
  if (TRIVIAL_RESPONSES.has(normalized)) return null

  const themes = Object.entries(THEME_RULES)
    .filter(([, words]) => words.some((word) => hasPhrase(normalized, word)))
    .map(([key]) => key)

  const positiveHits = countMatches(normalized, POSITIVE_WORDS)
  const negativeHits = countMatches(normalized, NEGATIVE_WORDS)

  let sentiment = 'neutral'
  if (negativeHits > positiveHits) sentiment = 'negative'
  if (positiveHits > negativeHits) sentiment = 'positive'

  let severity = null
  if (sentiment === 'negative') {
    const highSeverityHits = countMatches(normalized, HIGH_SEVERITY_WORDS)
    severity = highSeverityHits > 0 || negativeHits >= 3 ? 'high' : 'medium'
  }

  return {
    sentiment,
    severity,
    themes: themes.length ? themes : ['other'],
  }
}

export function buildQualitativeInsights(students) {
  const responses = []
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
  const themeCounts = Object.keys(QUALITATIVE_THEME_LABELS).reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

  students.forEach((student) => {
    Object.keys(QUALITATIVE_SOURCE_LABELS).forEach((sourceField) => {
      const originalText = student[sourceField]
      const analysis = analyzeResponse(originalText)

      if (!analysis) return

      const response = {
        originalText,
        sourceField,
        sourceLabel: QUALITATIVE_SOURCE_LABELS[sourceField],
        studentName: student.name,
        reg: student.reg,
        themes: analysis.themes,
        sentiment: analysis.sentiment,
        severity: analysis.severity,
      }

      responses.push(response)
      sentimentCounts[analysis.sentiment] += 1
      analysis.themes.forEach((theme) => {
        themeCounts[theme] += 1
      })
    })
  })

  const topThemes = Object.entries(themeCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      key,
      label: QUALITATIVE_THEME_LABELS[key],
      count,
    }))

  return {
    responses,
    sentimentCounts,
    themeCounts,
    topThemes,
    negativeResponses: responses.filter((response) => response.sentiment === 'negative'),
    positiveResponses: responses.filter((response) => response.sentiment === 'positive'),
  }
}
