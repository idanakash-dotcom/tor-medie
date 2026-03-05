import React from 'react'
import type { CalcResult, FormInputs, ScenarioRow } from '../types'
import { fmtILS, fmtPct } from '../utils/calc'

interface Props {
  inputs: FormInputs
  result: CalcResult
  scenarios: ScenarioRow[]
}

function buildCSV(inputs: FormInputs, result: CalcResult, scenarios: ScenarioRow[]): string {
  const lines: string[] = []
  lines.push('מחשבון קצבת גישור – הערכה (MVP)')
  lines.push('')
  lines.push('נתוני קלט')
  lines.push(`גיל היום,${inputs.currentAge}`)
  lines.push(`גיל פרישה מתוכנן,${inputs.plannedRetirementAge}`)
  lines.push(`שנות העסקה מזכה,${inputs.eligibleYears}`)
  lines.push(`אוכלוסייה,${inputs.population}`)
  lines.push(`שכר קובע חודשי,${inputs.determiningWage}`)
  lines.push(`יתרה צבורה היום,${inputs.currentBalance}`)
  lines.push(`הפקדה חודשית כוללת,${inputs.monthlyContribution}`)
  lines.push(`תשואה ריאלית שנתית,${fmtPct(inputs.annualReturn)}`)
  lines.push(`מקדם קצבה,${inputs.conversionFactor}`)
  lines.push('')
  lines.push('תוצאות')
  lines.push(`קצבת גישור חודשית משוערת,${fmtILS(result.bridgePension)}`)
  lines.push(`קצבה מהצבירה בגיל 67,${fmtILS(result.pensionAt67)}`)
  lines.push(`קצבה תקציבית רעיונית,${fmtILS(result.budgetPension)}`)
  lines.push(`אחוז צבירה,${fmtPct(result.accrualRate)}`)
  lines.push(`יתרה בעת פרישה,${fmtILS(result.balanceAtRetirement)}`)
  lines.push(`יתרה בגיל 67,${fmtILS(result.balanceAt67)}`)
  lines.push(`גורם מגביל,${result.limitingFactor}`)

  if (scenarios.length > 0) {
    lines.push('')
    lines.push('תרחישים')
    lines.push('גיל פרישה,שנים עד 67,יתרה בפרישה,יתרה בגיל 67,קצבה בגיל 67,קצבה תקציבית,קצבת גישור,מגביל')
    scenarios.forEach(r => {
      lines.push([
        r.retirementAge,
        r.yearsTo67,
        Math.round(r.balanceAtRetirement),
        Math.round(r.balanceAt67),
        Math.round(r.pensionAt67),
        Math.round(r.budgetPension),
        Math.round(r.bridgePension),
        r.limitingFactor,
      ].join(','))
    })
  }

  lines.push('')
  lines.push('הערה: זהו כלי הערכה בלבד ואינו ייעוץ פנסיוני או משפטי.')
  return lines.join('\n')
}

export default function ExportButton({ inputs, result, scenarios }: Props) {
  const handleExport = () => {
    const csv = buildCSV(inputs, result, scenarios)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `קצבת-גישור-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} style={styles.btn}>
      ⬇ ייצא CSV
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    background: '#f1f5f9',
    color: '#1e293b',
    border: '1.5px solid #cbd5e1',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}
