import React, { useState, useMemo } from 'react'
import Disclaimer from './components/Disclaimer'
import InputForm from './components/InputForm'
import Results from './components/Results'
import ScenariosTable from './components/ScenariosTable'
import ScenariosChart from './components/ScenariosChart'
import Limitations from './components/Limitations'
import ExportButton from './components/ExportButton'
import { calcAll, calcScenarios } from './utils/calc'
import type { FormInputs, CalcResult, ScenarioRow } from './types'

const CURRENT_YEAR = new Date().getFullYear()

const DEFAULT_FORM: FormInputs = {
  currentAge: 45,
  startYear: CURRENT_YEAR - 20,
  eligibleYears: 20,
  population: 'חוד',
  determiningWage: 25000,
  currentBalance: 600000,
  monthlyContribution: 4000,
  annualReturn: 0.04,
  conversionFactor: 200,
  hasWithdrawals: false,
  withdrawalsAmount: 0,
  plannedRetirementAge: 50,
  showScenarios: false,
}

export default function App() {
  const [accepted, setAccepted] = useState(false)
  const [form, setForm] = useState<FormInputs>(DEFAULT_FORM)
  const [result, setResult] = useState<CalcResult | null>(null)
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([])

  const autoEligibleYears = useMemo(
    () => Math.max(0, CURRENT_YEAR - form.startYear),
    [form.startYear],
  )

  const handleCalc = () => {
    const r = calcAll({
      currentAge: form.currentAge,
      eligibleYears: form.eligibleYears,
      determiningWage: form.determiningWage,
      currentBalance: form.currentBalance,
      monthlyContribution: form.monthlyContribution,
      annualReturn: form.annualReturn,
      conversionFactor: form.conversionFactor,
      hasWithdrawals: form.hasWithdrawals,
      withdrawalsAmount: form.withdrawalsAmount,
      plannedRetirementAge: form.plannedRetirementAge,
    })
    setResult(r)

    if (form.showScenarios) {
      const s = calcScenarios({
        currentAge: form.currentAge,
        population: form.population,
        eligibleYears: form.eligibleYears,
        determiningWage: form.determiningWage,
        currentBalance: form.currentBalance,
        monthlyContribution: form.monthlyContribution,
        annualReturn: form.annualReturn,
        conversionFactor: form.conversionFactor,
        hasWithdrawals: form.hasWithdrawals,
        withdrawalsAmount: form.withdrawalsAmount,
      })
      setScenarios(s)
    } else {
      setScenarios([])
    }
  }

  const handleReset = () => {
    setForm(DEFAULT_FORM)
    setResult(null)
    setScenarios([])
  }

  if (!accepted) {
    return <Disclaimer onAccept={() => setAccepted(true)} />
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.appTitle}>מחשבון קצבת גישור – הערכה</h1>
          <p style={styles.appSubtitle}>לעובדי ביטחון (שב"כ) | חישוב בדפדפן בלבד, ללא שמירת נתונים</p>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.layout}>
          {/* טופס קלט */}
          <div style={styles.left}>
            <InputForm
              values={form}
              onChange={setForm}
              onCalc={handleCalc}
              onReset={handleReset}
              autoEligibleYears={autoEligibleYears}
            />
            <Limitations />
          </div>

          {/* תוצאות */}
          <div style={styles.right}>
            {result ? (
              <>
                <div style={styles.resultsCard}>
                  <div style={styles.resultHeader}>
                    <h2 style={styles.resultsTitle}>תוצאות החישוב</h2>
                    <ExportButton inputs={form} result={result} scenarios={scenarios} />
                  </div>
                  <Results result={result} inputs={form} />
                </div>

                {form.showScenarios && scenarios.length > 0 && (
                  <>
                    <ScenariosChart rows={scenarios} />
                    <ScenariosTable rows={scenarios} plannedAge={form.plannedRetirementAge} />
                  </>
                )}
              </>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📊</div>
                <p style={styles.emptyText}>מלא/י את הנתונים ולחץ/י על "חשב" לקבלת הערכה</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>כלי הערכה בלבד | אינו ייעוץ פנסיוני או משפטי | {new Date().getFullYear()}</p>
        <button onClick={() => setAccepted(false)} style={styles.disclaimerBtn}>
          צפה בגילוי הנאות
        </button>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    direction: 'rtl',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    color: '#fff',
    padding: '20px 24px',
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 800,
  },
  appSubtitle: {
    fontSize: 13,
    opacity: 0.8,
    marginTop: 4,
  },
  main: {
    flex: 1,
    padding: '24px 20px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '420px 1fr',
    gap: 24,
    alignItems: 'start',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  resultsCard: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: '2px solid #e2e8f0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e3a5f',
  },
  emptyState: {
    background: '#fff',
    borderRadius: 16,
    padding: 48,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 1.6,
  },
  footer: {
    background: '#f1f5f9',
    borderTop: '1px solid #e2e8f0',
    padding: '14px 24px',
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  disclaimerBtn: {
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    fontSize: 12,
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: 'inherit',
    padding: 0,
  },
}
