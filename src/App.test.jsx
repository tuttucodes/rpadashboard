import { render, screen, waitFor, act } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const { fetchSheetData, processData } = vi.hoisted(() => ({
  fetchSheetData: vi.fn(),
  processData: vi.fn((rows) => ({
    overallAvg: 4.2,
    ratings: [
      { key: 'clarity', label: 'Clarity', short: 'Clarity', avg: 4.5 },
      { key: 'pace', label: 'Pace', short: 'Pace', avg: 3.9 },
    ],
    students: rows.map((row, index) => ({
      index: index + 1,
      name: row.name ?? `Student ${index + 1}`,
      reg: row.reg ?? '—',
      avg: row.avg ?? 4.2,
      impression: row.impression ?? '',
    })),
    radarData: [],
    qualitativeInsights: {
      responses: rows.map((row) => ({
        originalText: row.impression ?? '',
        sourceField: 'impression',
        sourceLabel: 'First impression',
        studentName: row.name ?? 'Student 1',
        reg: row.reg ?? '—',
        themes: ['positive_experience'],
        sentiment: 'positive',
        severity: null,
      })),
      sentimentCounts: { positive: rows.length, neutral: 0, negative: 0 },
      topThemes: [{ key: 'positive_experience', label: 'Positive experience', count: rows.length }],
    },
  })),
}))

vi.mock('./data', () => ({
  FALLBACK_ROWS: [{ name: 'Fallback Student' }],
  fetchSheetData,
  processData,
  loadCachedRows: vi.fn(() => null),
  saveCachedRows: vi.fn(),
}))

vi.mock('./components/Header', () => ({
  default: ({ lastUpdated }) => <div>Header {lastUpdated ? 'ready' : 'empty'}</div>,
}))

vi.mock('./components/StatCards', () => ({
  default: ({ data, usingFallback }) => (
    <div>
      Students: {data.students.length} / Mode: {usingFallback ? 'fallback' : 'live'}
    </div>
  ),
}))

vi.mock('./components/RatingBars', () => ({
  default: () => <div>Rating bars</div>,
}))

vi.mock('./components/ChartsRow', () => ({
  default: () => <div>Charts</div>,
}))

vi.mock('./components/QualitativeSection', () => ({
  default: ({ insights }) => <div>Qualitative {insights.responses.length}</div>,
}))

vi.mock('./components/RespondentTable', () => ({
  default: () => <div>Respondents</div>,
}))

vi.mock('./components/Footer', () => ({
  default: () => <div>Footer</div>,
}))

describe('App auto refresh', () => {
  let intervalCallback

  beforeEach(() => {
    fetchSheetData.mockReset()
    processData.mockClear()
    window.localStorage.clear()
    intervalCallback = null

    vi.spyOn(window, 'setInterval').mockImplementation((callback) => {
      intervalCallback = callback
      return 1
    })

    vi.spyOn(window, 'clearInterval').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps the last live data visible when an auto refresh fails', async () => {
    fetchSheetData
      .mockResolvedValueOnce([{ name: 'Asha' }])
      .mockRejectedValueOnce(new Error('network down'))

    await act(async () => {
      render(<App />)
    })

    await act(async () => {})

    expect(screen.getByText('Students: 1 / Mode: live')).toBeInTheDocument()
    expect(screen.queryByText(/sample mode/i)).not.toBeInTheDocument()

    await act(async () => {
      await intervalCallback()
    })

    await waitFor(() => {
      expect(screen.getByText(/last successful live snapshot/i)).toBeInTheDocument()
    })

    expect(screen.getByText('Students: 1 / Mode: live')).toBeInTheDocument()
    expect(fetchSheetData).toHaveBeenCalledTimes(2)
  })
})
