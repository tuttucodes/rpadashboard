import Papa from 'papaparse'
import { buildQualitativeInsights } from './qualitativeInsights'

export const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRGT5Vgo1O48TlJE5xJgr1rv0OIdTdUtzTz1VWzf1AeD7L9qr_0bStrHLS7NBfbmWPMDHjZ5NSrmo1s/pub?gid=1133882812&single=true&output=csv'
export const DASHBOARD_CACHE_KEY = 'rpa-dashboard-live-cache'

export const RATING_KEYS = [
  { key: 'How clearly are the course objectives explained?', label: 'Objectives Clarity', short: 'Clarity' },
  { key: 'How understandable are the initial lectures?', label: 'Lecture Understandability', short: 'Lectures' },
  { key: 'Is the pace of teaching appropriate?', label: 'Teaching Pace', short: 'Pace' },
  { key: 'Are the study materials (notes/slides) helpful so far?', label: 'Study Materials', short: 'Materials' },
  { key: 'How comfortable are you asking doubts?', label: 'Asking Doubts', short: 'Doubts' },
]

export const QUALITATIVE_KEYS = {
  difficulty: 'What is one thing you are finding difficult in this course?',
  improvement: 'What do you think can be improved in the way the course is being taught?',
  concerns: 'Are there any concerns about teaching speed, clarity, or materials?',
  impression: 'What is your first impression of this course?',
  helpers: 'What would help you learn better in the coming weeks?',
  name: 'Enter your name',
  reg: 'Enter your register number',
}

export async function fetchSheetData() {
  const res = await fetch(CSV_URL + `&t=${Date.now()}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

export function saveCachedRows(rows, fetchedAt = new Date().toISOString()) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    DASHBOARD_CACHE_KEY,
    JSON.stringify({
      rows,
      fetchedAt,
    }),
  )
}

export function loadCachedRows() {
  if (typeof window === 'undefined') return null

  const cached = window.localStorage.getItem(DASHBOARD_CACHE_KEY)
  if (!cached) return null

  try {
    const parsed = JSON.parse(cached)
    if (!Array.isArray(parsed?.rows)) return null

    return {
      rows: parsed.rows,
      fetchedAt: parsed.fetchedAt ? new Date(parsed.fetchedAt) : null,
    }
  } catch {
    return null
  }
}

export function processData(rows) {
  const ratings = RATING_KEYS.map(({ key, label, short }) => {
    const vals = rows
      .map(r => parseFloat(r[key]))
      .filter(v => !isNaN(v))
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    return { key, label, short, avg: +avg.toFixed(2), vals }
  })

  const overallAvg = +(ratings.reduce((a, r) => a + r.avg, 0) / ratings.length).toFixed(2)

  const students = rows.map((row, i) => {
    const scores = RATING_KEYS.map(({ key }) => parseFloat(row[key])).filter(v => !isNaN(v))
    const avg = scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0
    return {
      index: i + 1,
      name: row[QUALITATIVE_KEYS.name]?.trim() || `Student ${i + 1}`,
      reg: row[QUALITATIVE_KEYS.reg]?.trim() || '—',
      avg,
      scores: RATING_KEYS.map(({ key, short }) => ({ subject: short, value: parseFloat(row[key]) || 0 })),
      difficulty: row[QUALITATIVE_KEYS.difficulty]?.trim() || '',
      improvement: row[QUALITATIVE_KEYS.improvement]?.trim() || '',
      concerns: row[QUALITATIVE_KEYS.concerns]?.trim() || '',
      impression: row[QUALITATIVE_KEYS.impression]?.trim() || '',
      helpers: row[QUALITATIVE_KEYS.helpers]?.trim() || '',
    }
  })

  const radarData = RATING_KEYS.map(({ short, key }) => {
    const entry = { subject: short }
    rows.forEach((row, i) => {
      const name = row[QUALITATIVE_KEYS.name]?.trim() || `Student ${i + 1}`
      entry[name] = parseFloat(row[key]) || 0
    })
    return entry
  })

  const qualitativeInsights = buildQualitativeInsights(students)

  return { ratings, overallAvg, students, radarData, qualitativeInsights }
}

export const FALLBACK_ROWS = [
  { 'How clearly are the course objectives explained?': '3', 'How understandable are the initial lectures?': '3', 'Is the pace of teaching appropriate?': '4', 'Are the study materials (notes/slides) helpful so far?': '3', 'How comfortable are you asking doubts?': '5', 'What is one thing you are finding difficult in this course?': 'Textbooks are really hard', 'What do you think can be improved in the way the course is being taught?': 'Give more projects', 'Are there any concerns about teaching speed, clarity, or materials?': '', 'What is your first impression of this course?': 'Good', 'What would help you learn better in the coming weeks?': 'Practice', 'Enter your name': 'Student 1', 'Enter your register number': '' },
  { 'How clearly are the course objectives explained?': '5', 'How understandable are the initial lectures?': '4', 'Is the pace of teaching appropriate?': '3', 'Are the study materials (notes/slides) helpful so far?': '4', 'How comfortable are you asking doubts?': '5', 'What is one thing you are finding difficult in this course?': 'Syllabus is very broad', 'What do you think can be improved in the way the course is being taught?': 'Syllabus could be reduced', 'Are there any concerns about teaching speed, clarity, or materials?': 'Teaching speed is a bit too fast', 'What is your first impression of this course?': 'Really good', 'What would help you learn better in the coming weeks?': 'Revision and more practice questions', 'Enter your name': 'Student 2', 'Enter your register number': '' },
  { 'How clearly are the course objectives explained?': '4', 'How understandable are the initial lectures?': '4', 'Is the pace of teaching appropriate?': '2', 'Are the study materials (notes/slides) helpful so far?': '3', 'How comfortable are you asking doubts?': '5', 'What is one thing you are finding difficult in this course?': 'Syllabus is hard', 'What do you think can be improved in the way the course is being taught?': 'Give more projects', 'Are there any concerns about teaching speed, clarity, or materials?': '', 'What is your first impression of this course?': 'Very good', 'What would help you learn better in the coming weeks?': 'Read textbook', 'Enter your name': 'Rohan', 'Enter your register number': '23BRS1025' },
  { 'How clearly are the course objectives explained?': '4', 'How understandable are the initial lectures?': '3', 'Is the pace of teaching appropriate?': '4', 'Are the study materials (notes/slides) helpful so far?': '2', 'How comfortable are you asking doubts?': '3', 'What is one thing you are finding difficult in this course?': 'Solving numericals related to topics', 'What do you think can be improved in the way the course is being taught?': 'Solve more examples in class', 'Are there any concerns about teaching speed, clarity, or materials?': 'Teacher is a bit fast', 'What is your first impression of this course?': 'Hard but interesting', 'What would help you learn better in the coming weeks?': 'Slower pace and more solved examples', 'Enter your name': 'Dhaanya Nair', 'Enter your register number': '23BRS1081' },
]
