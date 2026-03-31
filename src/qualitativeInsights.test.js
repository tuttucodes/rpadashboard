import { describe, expect, it } from 'vitest'
import {
  analyzeResponse,
  buildQualitativeInsights,
  getFilteredResponses,
  getThemeSummary,
  QUALITATIVE_THEME_LABELS,
} from './qualitativeInsights'

describe('analyzeResponse', () => {
  it('matches multiple themes in a single response', () => {
    const result = analyzeResponse('The pace is too fast and I need more practice examples.')

    expect(result.themes).toEqual(['pace', 'examples', 'practice'])
    expect(result.sentiment).toBe('negative')
    expect(result.severity).toBe('medium')
  })

  it('classifies positive responses', () => {
    const result = analyzeResponse('The notes are very helpful and the teaching is clear.')

    expect(result.themes).toEqual(['clarity', 'materials', 'positive_experience'])
    expect(result.sentiment).toBe('positive')
    expect(result.severity).toBeNull()
  })

  it('ignores empty and trivial responses', () => {
    expect(analyzeResponse('')).toBeNull()
    expect(analyzeResponse('no')).toBeNull()
    expect(analyzeResponse(' nothing specific ')).toBeNull()
  })

  it('assigns high severity for strong negative language', () => {
    const result = analyzeResponse('The workload is overwhelming and the lectures are extremely confusing.')

    expect(result.sentiment).toBe('negative')
    expect(result.severity).toBe('high')
    expect(result.themes).toEqual(['clarity', 'workload'])
  })
})

describe('buildQualitativeInsights', () => {
  it('builds aggregates and groups analyzed responses', () => {
    const students = [
      {
        name: 'Rohan',
        reg: '23BRS1025',
        difficulty: 'The pace is too fast',
        improvement: 'More examples would help',
        concerns: '',
        impression: 'Good and clear start',
        helpers: 'Practice questions',
      },
    ]

    const result = buildQualitativeInsights(students)

    expect(result.responses).toHaveLength(4)
    expect(result.sentimentCounts).toEqual({
      positive: 1,
      neutral: 2,
      negative: 1,
    })
    expect(result.themeCounts.pace).toBe(1)
    expect(result.themeCounts.examples).toBe(1)
    expect(result.topThemes[0]).toEqual({
      key: 'pace',
      label: QUALITATIVE_THEME_LABELS.pace,
      count: 1,
    })
    expect(result.negativeResponses).toHaveLength(1)
    expect(result.positiveResponses).toHaveLength(1)
  })
})

describe('insight filtering helpers', () => {
  const insights = {
    responses: [
      { sentiment: 'positive', themes: ['practice', 'positive_experience'] },
      { sentiment: 'positive', themes: ['examples'] },
      { sentiment: 'negative', themes: ['practice', 'pace'] },
    ],
  }

  it('limits visible themes to the active sentiment filter', () => {
    const filteredResponses = getFilteredResponses(insights.responses, {
      themeFilter: 'all',
      sentimentFilter: 'positive',
    })

    expect(filteredResponses).toHaveLength(2)
    expect(getThemeSummary(filteredResponses)[0]).toEqual({
      key: 'examples',
      label: QUALITATIVE_THEME_LABELS.examples,
      count: 1,
    })
    expect(getThemeSummary(filteredResponses)).toContainEqual({
      key: 'practice',
      label: QUALITATIVE_THEME_LABELS.practice,
      count: 1,
    })
  })

  it('returns no responses when theme and sentiment do not overlap', () => {
    const filteredResponses = getFilteredResponses(insights.responses, {
      themeFilter: 'pace',
      sentimentFilter: 'positive',
    })

    expect(filteredResponses).toEqual([])
  })
})
