import React from 'react'
import type { FormInputs, Population } from '../types'
import Tooltip from './Tooltip'

interface Props {
  values: FormInputs
  onChange: (v: FormInputs) => void
  onCalc: () => void
  onReset: () => void
  autoEligibleYears: number
}

const POPULATIONS: Population[] = ['חוד', 'מינהלה', 'מודיעין ואבטחה', 'טכנולוגיה']

export default function InputForm({ values, onChange, onCalc, onReset, autoEligibleYears }: Props) {
  const set = <K extends keyof FormInputs>(k: K) => (v: FormInputs[K]) =>
    onChange({ ...values, [k]: v })

  const setN = <K extends keyof FormInputs>(k: K) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [k]: parseFloat(e.target.value) || 0 })

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>נתוני החישוב</h2>

      <div style={styles.grid}>
        {/* גיל ותחילת עבודה */}
        <div style={styles.group}>
          <label style={styles.label}>גיל היום</label>
          <input
            type="number"
            min={20}
            max={70}
            value={values.currentAge}
            onChange={setN('currentAge')}
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>שנת תחילת עבודה/שירות</label>
          <input
            type="number"
            min={1970}
            max={new Date().getFullYear()}
            value={values.startYear}
            onChange={e => {
              const y = parseInt(e.target.value) || values.startYear
              const auto = Math.max(0, new Date().getFullYear() - y)
              onChange({ ...values, startYear: y, eligibleYears: auto })
            }}
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>
            שנות העסקה מזכה
            <Tooltip text={`מחושב אוטומטית: ${new Date().getFullYear()} - שנת תחילה = ${autoEligibleYears}\nניתן לערוך ידנית`} />
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={values.eligibleYears}
            onChange={setN('eligibleYears')}
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>אוכלוסייה</label>
          <select
            value={values.population}
            onChange={e => set('population')(e.target.value as Population)}
            style={styles.input}
          >
            {POPULATIONS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>
            שכר קובע חודשי בפרישה (₪)
            <Tooltip text="השכר הקובע לחישוב קצבה – אינו בהכרח שכר ברוטו. נקבע לפי כללי הארגון. הכניסו הערכה." />
          </label>
          <input
            type="number"
            min={0}
            value={values.determiningWage}
            onChange={setN('determiningWage')}
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>גיל פרישה מתוכנן</label>
          <input
            type="number"
            min={40}
            max={67}
            value={values.plannedRetirementAge}
            onChange={setN('plannedRetirementAge')}
            style={styles.input}
          />
        </div>

        {/* קרן פנסיה */}
        <div style={styles.groupFull}>
          <h3 style={styles.subTitle}>נתוני קרן פנסיה / חיסכון</h3>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>יתרה צבורה היום (₪)</label>
          <input
            type="number"
            min={0}
            value={values.currentBalance}
            onChange={setN('currentBalance')}
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>
            הפקדה חודשית כוללת (עובד+מעסיק) (₪)
            <Tooltip text="סך ההפקדות החודשיות לקרן הפנסיה (חלק עובד + חלק מעסיק). ניתן לבדוק בתלוש או דו״ח קרן." />
          </label>
          <input
            type="number"
            min={0}
            value={values.monthlyContribution}
            onChange={setN('monthlyContribution')}
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>
            תשואה ריאלית שנתית
            <Tooltip text="ברירת מחדל: 4% ריאלי (אקטוארי). ניתן לשנות לפי הערכה אישית. תשואה ריאלית = אחרי ניכוי אינפלציה." />
          </label>
          <div style={styles.returnRow}>
            <select
              value={values.annualReturn === 0.04 ? 'default' : 'custom'}
              onChange={e => {
                if (e.target.value === 'default') set('annualReturn')(0.04)
              }}
              style={{ ...styles.input, flex: '0 0 auto', width: 160 }}
            >
              <option value="default">ברירת מחדל (4%)</option>
              <option value="custom">מותאם אישית</option>
            </select>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={values.annualReturn * 100}
              onChange={e => set('annualReturn')(parseFloat(e.target.value) / 100)}
              style={styles.slider}
            />
            <span style={styles.returnLabel}>{(values.annualReturn * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>
            מקדם קצבה (לגיל 67)
            <Tooltip text="מקדם המרה של היתרה הצבורה לקצבה חודשית. ברירת מחדל: 200. הערכה בלבד; בפועל תלוי תקנון הקרן, גיל ומסלול." />
          </label>
          <input
            type="number"
            min={100}
            max={400}
            value={values.conversionFactor}
            onChange={setN('conversionFactor')}
            style={styles.input}
          />
        </div>

        {/* משיכות */}
        <div style={styles.groupFull}>
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={values.hasWithdrawals}
              onChange={e => set('hasWithdrawals')(e.target.checked)}
              style={styles.checkbox}
            />
            <span>ביצעתי/אתכנן משיכות מהקרן לפני גיל 67?</span>
          </label>
        </div>

        {values.hasWithdrawals && (
          <div style={styles.group}>
            <label style={styles.label}>סכום משיכות מצטבר (₪)</label>
            <input
              type="number"
              min={0}
              value={values.withdrawalsAmount}
              onChange={setN('withdrawalsAmount')}
              style={styles.input}
            />
          </div>
        )}

        {/* תרחישים */}
        <div style={styles.groupFull}>
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={values.showScenarios}
              onChange={e => set('showScenarios')(e.target.checked)}
              style={styles.checkbox}
            />
            <span>הצג השוואת תרחישים (מספר גילי פרישה)</span>
          </label>
        </div>
      </div>

      <div style={styles.btnRow}>
        <button onClick={onCalc} style={styles.btnCalc}>חשב →</button>
        <button onClick={onReset} style={styles.btnReset}>איפוס</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e3a5f',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '2px solid #e2e8f0',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#475569',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 16,
    marginTop: 4,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px 24px',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  groupFull: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    padding: '9px 12px',
    borderRadius: 8,
    border: '1.5px solid #cbd5e1',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    color: '#1e293b',
    background: '#f8fafc',
    width: '100%',
    transition: 'border-color 0.15s',
  },
  returnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  slider: {
    flex: 1,
    accentColor: '#2563eb',
  },
  returnLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#2563eb',
    minWidth: 38,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: '#1e293b',
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: 'pointer',
    accentColor: '#2563eb',
    flexShrink: 0,
  },
  btnRow: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  },
  btnCalc: {
    flex: 1,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '13px 20px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnReset: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1.5px solid #cbd5e1',
    borderRadius: 10,
    padding: '13px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}
