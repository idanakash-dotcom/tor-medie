# 🍽️ תור מדיח

אפליקציית Web לניהול תור לסידור המדיח בין ליאם ושי-יה.

---

## ✨ פיצ'רים

- 🔄 **סנכרון בזמן אמת** – שינוי על מכשיר אחד מתעדכן מיד על כולם
- 👆 **החלקה לאישור** – מניעת לחיצות שגויות
- 🎊 **קונפטי** אחרי "סידרתי"
- ↩️ **ביטול פעולה** תוך 2 דקות
- 📜 **היסטוריה** עם פילטר לפי ילד
- 🏆 **ניקוד שבועי** (ניתן להפעיל/לכבות)
- 🔐 **ניהול הורה** עם PIN
- 📱 **PWA** – ניתן להוסיף למסך הבית

---

## 🚀 הגדרה – שלב אחר שלב

### שלב 1 – Supabase (בסיס נתונים בענן)

1. היכנס ל-[supabase.com](https://supabase.com) ופתח חשבון חינמי
2. לחץ **"New Project"** → תן שם (לדוגמה: `tor-medie`) → בחר סיסמה → לחץ **Create**
3. המתן ~2 דקות עד שהפרויקט מוכן
4. לחץ **SQL Editor** (בסרגל הצד השמאלי)
5. לחץ **"New query"** → הדבק את כל התוכן מקובץ `supabase-schema.sql` → לחץ **Run**
6. תראה ✅ "Success" – הטבלאות נוצרו
7. לחץ **Project Settings** (גלגל שיניים למטה בצד) → **API**
8. העתק:
   - **Project URL** – נראה כך: `https://abcdefgh.supabase.co`
   - **anon public** key – מחרוזת ארוכה שמתחילה ב-`eyJ...`

### שלב 2 – הורדת הקוד ו-Dependencies

```bash
# 1. הורד את תיקיית הפרויקט (tor-medie) למחשב שלך
# 2. פתח טרמינל בתוך התיקייה

npm install
```

### שלב 3 – הגדרת משתני סביבה

1. צור קובץ `.env` בתיקיית הפרויקט (ליד package.json):

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. החלף את הערכים בערכים שהעתקת מ-Supabase (שלב 1)

### שלב 4 – הרצה מקומית (אופציונלי)

```bash
npm run dev
# פתח: http://localhost:5173
```

---

## 🌐 פריסה ל-Vercel (קישור קבוע לכולם)

### אפשרות א׳ – דרך GitHub (מומלץ)

1. היכנס ל-[github.com](https://github.com) → צור Repository חדש → `tor-medie`
2. העלה את כל קבצי הפרויקט (ללא תיקיית `node_modules` וללא קובץ `.env`!)
3. היכנס ל-[vercel.com](https://vercel.com) → **"Add New Project"**
4. חבר את חשבון GitHub → בחר את ה-Repository
5. **חשוב!** לפני לחיצת Deploy, לחץ **"Environment Variables"** והוסף:
   - `VITE_SUPABASE_URL` = הכתובת שלך
   - `VITE_SUPABASE_ANON_KEY` = ה-Key שלך
6. לחץ **Deploy** → קבל קישור כמו: `https://tor-medie.vercel.app`

### אפשרות ב׳ – Vercel CLI

```bash
npm install -g vercel
vercel

# כשישאל על env vars – הוסף את שני הערכים
```

---

## 📱 התקנה כ-PWA (Add to Home Screen)

### iPhone:
1. פתח את הקישור ב-Safari
2. לחץ על כפתור השיתוף (□↑)
3. בחר **"הוסף למסך הבית"**
4. האפליקציה תיפתח כמו אפליקציה רגילה ✅

### Android:
1. פתח ב-Chrome
2. לחץ על 3 הנקודות → **"הוסף למסך הבית"**

---

## 🔐 PIN ברירת מחדל

**`1234`** – ניתן לשנות ממסך הניהול של ההורה.

---

## 📁 מבנה הפרויקט

```
tor-medie/
├── src/
│   ├── main.jsx        # Entry point
│   ├── App.jsx         # כל הלוגיקה והתצוגה
│   └── supabase.js     # חיבור ל-Supabase
├── public/
│   └── manifest.json   # PWA manifest
├── index.html
├── vite.config.js
├── package.json
├── .env.example        # תבנית למשתני סביבה
├── supabase-schema.sql # SQL ליצירת טבלאות
└── README.md
```

---

## 🗄️ מבנה הנתונים

### טבלת `app_state` (שורה אחת)
| עמודה | תיאור |
|-------|--------|
| `current_turn` | `liam` או `shaiya` |
| `updated_at` | זמן עדכון אחרון |
| `scoring_enabled` | האם ניקוד פעיל |
| `liam_points` | נקודות שבועיות לליאם |
| `shaiya_points` | נקודות שבועיות לשי-יה |
| `admin_pin` | PIN הורה |

### טבלת `actions_log`
| עמודה | תיאור |
|-------|--------|
| `type` | `completed / skip / reset / override` |
| `actor` | `liam / shaiya / admin` |
| `timestamp` | זמן הפעולה |
| `note` | הערה (למשל סיבת דילוג) |
