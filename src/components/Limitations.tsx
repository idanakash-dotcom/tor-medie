import React from 'react'

export default function Limitations() {
  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>⚙️ מגבלות החישוב (MVP)</h3>
      <ul style={styles.list}>
        <li>לא כולל מדרגות גיל מינימלי לפי שנת פרישה (2028, 2031 וכו') — TODO לשדרוג עתידי</li>
        <li>לא כולל כללי שיוך מורכבים לפי תפ"מ / חוד / תוספת ראשונה חלק ב'</li>
        <li>לא כולל צו מקצועות, תנאי פיטורים, חריגים רפואיים, או מקרי חזרה לארגון</li>
        <li>משיכות מקרן מטופלות כהפחתה פשוטה מהיתרה (MVP בלבד) — אינו משקף פגיעה בצבירת זכויות</li>
        <li>לא כולל הגדלות קצבה בגין שירות מיוחד, תוספות מיוחדות, או מקדמי כושר עבודה</li>
        <li>החישוב מניח תשואה קבועה ואחידה לאורך כל התקופה (לא מדגם סטוכסטי)</li>
        <li>קצבת הגישור מוצגת כסכום ברוטו — יש לקחת בחשבון ניכויי מס ובריאות לפי החוק</li>
      </ul>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 12,
    padding: '18px 22px',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#92400e',
    marginBottom: 12,
  },
  list: {
    paddingRight: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    fontSize: 12.5,
    color: '#78350f',
    lineHeight: 1.6,
  },
}
