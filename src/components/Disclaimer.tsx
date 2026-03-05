import React, { useState } from 'react'

interface Props {
  onAccept: () => void
}

export default function Disclaimer({ onAccept }: Props) {
  const [checked, setChecked] = useState(false)

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.icon}>⚠️</span>
          <h1 style={styles.title}>מחשבון קצבת גישור – הערכה</h1>
          <p style={styles.subtitle}>לעובדי ביטחון (שב"כ) – שיטת חישוב חדשה</p>
        </div>

        <div style={styles.body}>
          <h2 style={styles.disclaimerTitle}>הצהרת גילוי נאות – חובה לקרוא</h2>

          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>כלי הערכה בלבד.</strong> אינו ייעוץ פנסיוני, משפטי, כלכלי, ואינו מחליף נתונים רשמיים
              מהארגון, מינהלת הגמלאות, קרן הפנסיה, או יועץ מוסמך.
            </li>
            <li style={styles.listItem}>
              <strong>מבוסס על טיוטת תקנות ועל נתוני המשתמש בלבד.</strong> החישובים מבוססים על הנחות
              ותמצית עקרונות מטיוטת התקנות (קצבת גישור לעובדי ביטחון חדשים בשב"כ). התקנות הסופיות
              והפרשנות המוסמכת עשויות להשתנות.
            </li>
            <li style={styles.listItem}>
              <strong>גורמים מוסמכים בלבד קובעים:</strong> "שכר קובע", זכאות, שנות "העסקה מזכה",
              שיוך אוכלוסייה, סיבת סיום העסקה, ותנאים מיוחדים.
            </li>
            <li style={styles.listItem}>
              <strong>אין אחריות.</strong> אין אחריות לנזק, הפסד כספי, או כל תוצאה אחרת כתוצאה
              משימוש במחשבון זה.
            </li>
            <li style={styles.listItem}>
              <strong>מגבלות MVP:</strong> לא כולל מדרגות גיל לפי שנת פרישה (2028/2031 וכו'),
              צו מקצועות, חריגים רפואיים, כללי שיוך מורכבים, ועוד.
            </li>
          </ul>
        </div>

        <div style={styles.footer}>
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              style={styles.checkbox}
            />
            <span>קראתי והבנתי את הגילוי הנאות לעיל, ומאשר/ת שימוש בכלי הערכה זה בלבד</span>
          </label>

          <button
            onClick={onAccept}
            disabled={!checked}
            style={{ ...styles.btn, ...(checked ? {} : styles.btnDisabled) }}
          >
            המשך לחישוב →
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    maxWidth: 640,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    color: '#fff',
    padding: '32px 32px 24px',
    borderRadius: '16px 16px 0 0',
    textAlign: 'center',
  },
  icon: {
    fontSize: 40,
    display: 'block',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.85,
  },
  body: {
    padding: '24px 32px',
    borderBottom: '1px solid #e2e8f0',
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#dc2626',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  listItem: {
    fontSize: 13.5,
    lineHeight: 1.7,
    color: '#334155',
    background: '#f8fafc',
    borderRadius: 8,
    padding: '10px 14px',
    borderRight: '3px solid #f59e0b',
  },
  footer: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1.6,
    color: '#1e293b',
    fontWeight: 500,
  },
  checkbox: {
    width: 18,
    height: 18,
    marginTop: 2,
    flexShrink: 0,
    cursor: 'pointer',
    accentColor: '#2563eb',
  },
  btn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '14px 28px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
    width: '100%',
  },
  btnDisabled: {
    background: '#94a3b8',
    cursor: 'not-allowed',
  },
}
