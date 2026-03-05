import React from 'react'
import type { ScenarioRow } from '../types'
import { fmtILS } from '../utils/calc'

interface Props {
  rows: ScenarioRow[]
  plannedAge: number
}

export default function ScenariosTable({ rows, plannedAge }: Props) {
  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>השוואת תרחישי גיל פרישה</h3>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>גיל פרישה</th>
              <th style={styles.th}>שנים עד 67</th>
              <th style={styles.th}>יתרה בפרישה</th>
              <th style={styles.th}>יתרה בגיל 67</th>
              <th style={styles.th}>קצבה בגיל 67</th>
              <th style={styles.th}>קצבה תקציבית</th>
              <th style={styles.th}>קצבת גישור</th>
              <th style={styles.th}>מגביל</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const isSelected = row.retirementAge === plannedAge
              return (
                <tr key={row.retirementAge} style={isSelected ? styles.selectedRow : {}}>
                  <td style={{ ...styles.td, fontWeight: 700, color: isSelected ? '#2563eb' : undefined }}>
                    {row.retirementAge}
                    {isSelected && <span style={styles.selectedBadge}> ★</span>}
                  </td>
                  <td style={styles.td}>{row.yearsTo67}</td>
                  <td style={styles.td}>{fmtILS(row.balanceAtRetirement)}</td>
                  <td style={styles.td}>{fmtILS(row.balanceAt67)}</td>
                  <td style={styles.tdGreen}>{fmtILS(row.pensionAt67)}</td>
                  <td style={styles.td}>{fmtILS(row.budgetPension)}</td>
                  <td style={styles.tdBlue}>{fmtILS(row.bridgePension)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: row.limitingFactor === 'תקציבית' ? '#fee2e2' : '#fef3c7',
                      color: row.limitingFactor === 'תקציבית' ? '#991b1b' : '#92400e',
                    }}>
                      {row.limitingFactor}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={styles.note}>
        ★ = גיל הפרישה המתוכנן שלך | הטבלה מציגה גילאים מהמינימום לפי אוכלוסייה ואילך
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
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13.5,
  },
  th: {
    background: '#f1f5f9',
    padding: '10px 12px',
    textAlign: 'right',
    fontWeight: 600,
    color: '#475569',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  tdGreen: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#059669',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  tdBlue: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#2563eb',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  selectedRow: {
    background: '#eff6ff',
  },
  selectedBadge: {
    color: '#2563eb',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 11.5,
    fontWeight: 600,
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
}
