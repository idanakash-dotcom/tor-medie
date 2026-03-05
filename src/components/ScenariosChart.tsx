import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { ScenarioRow } from '../types'

interface Props {
  rows: ScenarioRow[]
}

const fmtK = (v: number) => `₪${Math.round(v / 1000)}K`

export default function ScenariosChart({ rows }: Props) {
  const data = rows.map(r => ({
    גיל: r.retirementAge,
    'קצבה בגיל 67': Math.round(r.pensionAt67),
    'קצבת גישור': Math.round(r.bridgePension),
  }))

  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>גרף: קצבה לפי גיל פרישה</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="גיל"
            label={{ value: 'גיל פרישה', position: 'insideBottom', offset: -2 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={fmtK}
            tick={{ fontSize: 12 }}
            width={55}
          />
          <Tooltip
            formatter={(v: number) => `₪${v.toLocaleString('he-IL')}`}
            labelFormatter={(l) => `גיל פרישה: ${l}`}
          />
          <Legend verticalAlign="top" />
          <Line
            type="monotone"
            dataKey="קצבה בגיל 67"
            stroke="#059669"
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#059669' }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="קצבת גישור"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#2563eb' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p style={styles.note}>
        קצבה בגיל 67 = מהצבירה | קצבת גישור = min(תקציבית, צוברת) — ממגיל הפרישה עד 67
      </p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e3a5f',
    marginBottom: 16,
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
}
