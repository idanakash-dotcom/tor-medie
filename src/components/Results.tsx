import React from 'react'
import type { CalcResult, FormInputs } from '../types'
import { fmtILS, fmtPct, MIN_RETIREMENT_AGE } from '../utils/calc'

interface Props {
  result: CalcResult
  inputs: FormInputs
}

export default function Results({ result, inputs }: Props) {
  const minAge = MIN_RETIREMENT_AGE[inputs.population]
  const ageTooLow = inputs.plannedRetirementAge < minAge
  const vetTooLow = inputs.eligibleYears < 15

  return (
    <div style={styles.wrap}>
      {/* אזהרות זכאות */}
      {(ageTooLow || vetTooLow) && (
        <div style={styles.warnings}>
          {ageTooLow && (
            <div style={styles.warning}>
              ⚠️ גיל הפרישה המתוכנן ({inputs.plannedRetirementAge}) נמוך מגיל המינימלי
              לאוכלוסיית "<strong>{inputs.population}</strong>" ({minAge}).
              ייתכן שהזכאות לקצבת גישור טרם בשלה.
            </div>
          )}
          {vetTooLow && (
            <div style={styles.warning}>
              ⚠️ שנות ההעסקה המזכה ({inputs.eligibleYears}) פחות מ-15 שנים.
              לפי הטיוטה, לרוב נדרש ותק של 15+ שנים לפרישה מ-2024 ואילך.
            </div>
          )}
          <div style={styles.warningNote}>
            הערה: האפליקציה אינה בודקת תנאי פיטורים, צו מקצועות, חריגים וכו' — נדרש אימות מול גורם מוסמך.
          </div>
        </div>
      )}

      {/* כרטיסי תוצאה עיקריים */}
      <div style={styles.mainCards}>
        <div style={{ ...styles.resultCard, ...styles.cardBridge }}>
          <div style={styles.cardLabel}>קצבת גישור חודשית משוערת</div>
          <div style={styles.cardValue}>{fmtILS(result.bridgePension)}</div>
          <div style={styles.cardSub}>מגיל {inputs.plannedRetirementAge} עד 67 (בקירוב)</div>
          <div style={styles.limitBadge}>
            מוגבל על ידי הקצבה ה<strong>{result.limitingFactor}</strong>
          </div>
        </div>

        <div style={{ ...styles.resultCard, ...styles.cardAt67 }}>
          <div style={styles.cardLabel}>קצבה חודשית מהצבירה בגיל 67</div>
          <div style={styles.cardValue}>{fmtILS(result.pensionAt67)}</div>
          <div style={styles.cardSub}>מהיתרה הצבורה בגיל 67</div>
        </div>
      </div>

      {/* פירוט שני רכיבים */}
      <div style={styles.detailCards}>
        <div style={styles.detailCard}>
          <div style={styles.detailTitle}>קצבה תקציבית רעיונית</div>
          <div style={styles.detailValue}>{fmtILS(result.budgetPension)}</div>
          <div style={styles.detailDesc}>
            {fmtPct(result.accrualRate)} × {fmtILS(inputs.determiningWage)} שכר קובע
          </div>
        </div>
        <div style={styles.detailCard}>
          <div style={styles.detailTitle}>קצבה צוברת רעיונית בגיל 67</div>
          <div style={styles.detailValue}>{fmtILS(result.pensionAt67)}</div>
          <div style={styles.detailDesc}>
            {fmtILS(result.balanceAt67)} ÷ {inputs.conversionFactor} (מקדם)
          </div>
        </div>
      </div>

      {/* איך חישבנו */}
      <CalcTransparency result={result} inputs={inputs} />
    </div>
  )
}

function CalcTransparency({ result, inputs }: { result: CalcResult; inputs: FormInputs }) {
  return (
    <details style={styles.details}>
      <summary style={styles.summary}>📊 איך חישבנו?</summary>
      <div style={styles.calcBody}>
        <Row label="תשואה ריאלית שנתית (r)" val={fmtPct(inputs.annualReturn)} />
        <Row label="שנות ותק מזכות" val={`${inputs.eligibleYears} שנים`} />
        <Row label="אחוז צבירה" val={`${fmtPct(result.accrualRate)} (min(70%, 2% × ${inputs.eligibleYears}))`} />
        <Row label="שכר קובע" val={fmtILS(inputs.determiningWage)} />
        <Row label="קצבה תקציבית רעיונית" val={`${fmtILS(inputs.determiningWage)} × ${fmtPct(result.accrualRate)} = ${fmtILS(result.budgetPension)}`} />
        <hr style={styles.hr} />
        <Row label="שנים עד פרישה" val={`${result.yearsUntilRetirement.toFixed(1)}`} />
        <Row label="יתרה בעת הפרישה" val={fmtILS(result.balanceAtRetirement)} />
        {inputs.hasWithdrawals && inputs.withdrawalsAmount > 0 && (
          <Row label="בניכוי משיכות" val={`${fmtILS(inputs.withdrawalsAmount)} (MVP: הפחתה פשוטה)`} />
        )}
        <Row label="שנים עד גיל 67 מפרישה" val={`${result.yearsTo67}`} />
        <Row label="יתרה צבורה בגיל 67" val={fmtILS(result.balanceAt67)} />
        <Row label="מקדם קצבה" val={`${inputs.conversionFactor}`} />
        <Row label="קצבה מהצבירה בגיל 67" val={`${fmtILS(result.balanceAt67)} ÷ ${inputs.conversionFactor} = ${fmtILS(result.pensionAt67)}`} />
        <hr style={styles.hr} />
        <Row
          label="הקצבה המגבילה (הנמוכה)"
          val={`${result.limitingFactor} (${fmtILS(result.bridgePension)})`}
          highlight
        />
        <div style={styles.formula}>
          <strong>נוסחת קצבת גישור:</strong> min(קצבה תקציבית, קצבה מהצבירה 67) = {fmtILS(result.bridgePension)}
        </div>
      </div>
    </details>
  )
}

function Row({ label, val, highlight }: { label: string; val: string; highlight?: boolean }) {
  return (
    <div style={{ ...rowStyles.row, ...(highlight ? rowStyles.highlight : {}) }}>
      <span style={rowStyles.label}>{label}</span>
      <span style={rowStyles.val}>{val}</span>
    </div>
  )
}

const rowStyles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 6,
    fontSize: 13,
  },
  label: {
    color: '#475569',
    flex: 1,
  },
  val: {
    color: '#1e293b',
    fontWeight: 600,
    textAlign: 'left',
  },
  highlight: {
    background: '#eff6ff',
    color: '#1d4ed8',
  },
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  warnings: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  warning: {
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13.5,
    color: '#9a3412',
    lineHeight: 1.6,
  },
  warningNote: {
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '8px 14px',
    fontSize: 12.5,
    color: '#475569',
    fontStyle: 'italic',
  },
  mainCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  resultCard: {
    borderRadius: 14,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  cardBridge: {
    background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
    color: '#fff',
  },
  cardAt67: {
    background: 'linear-gradient(135deg, #065f46, #059669)',
    color: '#fff',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 600,
    opacity: 0.9,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 900,
    letterSpacing: '-1px',
  },
  cardSub: {
    fontSize: 12,
    opacity: 0.8,
  },
  limitBadge: {
    marginTop: 6,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 12,
    display: 'inline-block',
    width: 'fit-content',
  },
  detailCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
  },
  detailCard: {
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12,
    padding: '16px 18px',
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: 4,
  },
  detailDesc: {
    fontSize: 12,
    color: '#94a3b8',
  },
  details: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  summary: {
    padding: '14px 18px',
    fontSize: 14,
    fontWeight: 600,
    color: '#1e3a5f',
    cursor: 'pointer',
    userSelect: 'none',
    listStyle: 'none',
  },
  calcBody: {
    padding: '12px 18px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    borderTop: '1px solid #e2e8f0',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '6px 0',
  },
  formula: {
    marginTop: 10,
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 1.6,
  },
}
