import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts'
import styles from './ChartsRow.module.css'

const STUDENT_COLORS = ['#5f6f52', '#a26f39', '#6f8c8d', '#7c5c48', '#b15f5a', '#809671']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: p.fill || p.color }} />
          <span>{p.name}: </span>
          <strong>{p.value}/5</strong>
        </div>
      ))}
    </div>
  )
}

export default function ChartsRow({ data }) {
  const { radarData, students, ratings } = data
  const studentNames = students.map(s => s.name)

  const barColor = (avg) => {
    if (avg >= 4) return '#2e6f56'
    if (avg >= 3) return '#a26f39'
    return '#b15f5a'
  }

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.sectionTitle}>Per-student view</div>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="rgba(92, 75, 58, 0.12)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#5f544c', fontSize: 11, fontFamily: 'Manrope' }} />
            <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fill: '#85756b', fontSize: 9 }} />
            {studentNames.map((name, i) => (
              <Radar
                key={name}
                name={name}
                dataKey={name}
                stroke={STUDENT_COLORS[i % STUDENT_COLORS.length]}
                fill={STUDENT_COLORS[i % STUDENT_COLORS.length]}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'Manrope', color: '#5f544c', paddingTop: 12 }}
              iconSize={8}
              iconType="circle"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Metric averages</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ratings} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(92, 75, 58, 0.08)" vertical={false} />
            <XAxis
              dataKey="short"
              tick={{ fill: '#5f544c', fontSize: 11, fontFamily: 'Manrope' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              domain={[0, 5]} tickCount={6}
              tick={{ fill: '#85756b', fontSize: 10 }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload
                return (
                  <div className={styles.tooltip}>
                    <div className={styles.tooltipLabel}>{r.label}</div>
                    <div className={styles.tooltipRow}>
                      <span className={styles.tooltipDot} style={{ background: barColor(r.avg) }} />
                      <strong>{r.avg}/5</strong>
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {ratings.map((r, i) => (
                <Cell key={i} fill={barColor(r.avg)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
