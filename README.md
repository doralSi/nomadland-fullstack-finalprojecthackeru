# 🌍 NomadLand - פלטפורמת מפות ואירועים לנוודים דיגיטליים

## תיאור הפרויקט

NomadLand היא פלטפורמה אינטראקטיבית המיועדת לנוודים דיגיטליים, מטיילים ואנשים המחפשים המלצות על מקומות שונים בעולם. המערכת מאפשרת למשתמשים לשתף נקודות עניין, להוסיף ביקורות, ליצור מפות אישיות ולהתעדכן באירועים מקומיים באזורים שונים.

---

## 🎯 מטרת הפרויקט

הפרויקט נבנה כחלק מקורס פיתוח Full Stack ומטרתו ליצור אפליקציה מלאה הכוללת:
- ניהול משתמשים והרשאות
- ממשק ניהול תוכן (Admin Panel)
- מערכת CRUD מלאה
- אינטגרציה עם מסד נתונים MongoDB
- ממשק משתמש רספונסיבי ומודרני

---

## 🚀 טכנולוגיות בשימוש

### צד לקוח (Client)
- **React 19** - ספריית JavaScript לבניית ממשק משתמש
- **React Router DOM** - ניווט בין דפים
- **Material-UI (MUI)** - ספריית קומפוננטות עיצוב
- **Leaflet / React Leaflet** - מפות אינטראקטיביות
- **Axios** - קריאות HTTP לשרת
- **React Toastify** - התראות למשתמש
- **Vite** - כלי build מהיר

### צד שרת (Server)
- **Node.js** - סביבת ריצה ל-JavaScript
- **Express** - framework לבניית API
- **MongoDB + Mongoose** - מסד נתונים ו-ODM
- **JWT (jsonwebtoken)** - אימות והרשאות
- **Bcrypt** - הצפנת סיסמאות
- **Joi** - ולידציות צד שרת
- **Multer + Cloudinary** - העלאת תמונות
- **Morgan** - לוגר HTTP
- **Express Rate Limit** - הגנה מפני DDoS
- **Nodemailer** - שליחת מיילים
- **Google OAuth** - התחברות דרך Google

---

## 📋 תכולת הפרויקט

### דפים עיקריים

1. **דף בית (Home/GlobalMap)**
   - מפה גלובלית עם כל נקודות העניין
   - סינון לפי קטגוריות ואזורים
   - חיפוש נקודות

2. **דפי אזור (Region Pages)**
   - מידע על כל אזור
   - מפה עם נקודות באזור
   - אירועים באזור
   - ביקורות

3. **דף התחברות והרשמה**
   - טפסים עם ולידציות
   - התחברות דרך Google OAuth
   - שחזור סיסמה

4. **פרופיל משתמש**
   - עריכת פרטים אישיים
   - תמונת פרופיל
   - נקודות מועדפות

5. **מפות אישיות (Personal Maps)**
   - יצירת מפות פרטיות
   - הוספת נקודות למפה
   - שיתוף או שמירה פרטית

6. **אירועים (Events)**
   - צפייה באירועים
   - יצירת אירועים חדשים
   - לוח שנה אינטראקטיבי
   - הרשמה לאירועים

7. **פאנל ניהול (Admin Dashboard)**
   - ניהול משתמשים
   - אישור/דחיית נקודות
   - אישור/דחיית אירועים
   - סטטיסטיקות

8. **דף אודות**
   - מידע על הפרויקט
   - הסבר על השימוש

9. **מדיניות פרטיות**

### פיצ'רים מרכזיים

#### מערכת הרשאות
- **משתמש רגיל (User)**: צפייה, הוספה לנקודות מועדפות, יצירת מפות אישיות
- **Map Ranger**: יכולת להוסיף נקודות ואירועים (טעונים אישור)
- **Admin**: ניהול מלא - אישור תוכן, ניהול משתמשים, מחיקה ועריכה

#### CRUD Operations
- **Points (נקודות)**: יצירה, קריאה, עדכון, מחיקה
- **Events (אירועים)**: יצירה, קריאה, עדכון, מחיקה
- **Personal Maps**: יצירה, קריאה, עדכון, מחיקה
- **Reviews (ביקורות)**: הוספה, קריאה, מחיקה

#### מערכת מועדפים
- שמירת נקודות למועדפים
- דף מרוכז של כל המועדפים
- סנכרון בין מכשירים

#### אבטחה ומגבלות
- Rate Limiting - הגבלת 100 בקשות ל-15 דקות
- Rate Limiting מחמיר יותר על נתיבי התחברות
- הצפנת סיסמאות עם bcrypt
- JWT tokens עם תוקף מוגבל
- ולידציות קפדניות (Regex לסיסמאות)

#### רב-לשוניות
- תמיכה בעברית ואנגלית
- ממשק להחלפת שפה

---

## 📦 התקנה והרצה

### דרישות מקדימות
- Node.js (גרסה 16 ומעלה)
- MongoDB (מקומי או Atlas)
- חשבון Cloudinary (להעלאת תמונות)

### שלב 1: שכפול הפרויקט
```bash
git clone https://github.com/doralSi/nomadland-fullstack-finalprojecthackeru.git
cd nomadland-fullstack-finalprojecthackeru
```

### שלב 2: התקנת תלויות

#### שורש הפרויקט
```bash
npm install
```

#### צד שרת
```bash
cd server
npm install
```

#### צד לקוח
```bash
cd client
npm install
```

### שלב 3: הגדרת משתני סביבה

#### Server (.env)
צור קובץ `.env` בתיקיית `server` עם התוכן הבא:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

#### Client (.env)
צור קובץ `.env` בתיקיית `client` עם התוכן הבא:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### שלב 4: הרצת הפרויקט

#### אופציה 1: הרצה נפרדת

**צד שרת:**
```bash
cd server
npm run dev
```
השרת ירוץ על http://localhost:5000

**צד לקוח:**
```bash
cd client
npm run dev
```
הלקוח ירוץ על http://localhost:5173

#### אופציה 2: הרצה משורש הפרויקט
```bash
npm run dev
```
(פקודה זו תריץ גם שרת וגם לקוח במקביל)

---

## 👥 משתמשי דמו

לצורך בדיקת הפרויקט, ניתן להשתמש במשתמשים הבאים:

### משתמש רגיל (User)
- **אימייל:** normaluser@ex.com
- **סיסמה:** normal!USER1234
- **הרשאות:** צפייה, מועדפים, מפות אישיות

### Map Ranger
- **אימייל:** rangeruser@ex.com
- **סיסמה:** userRA!1234
- **הרשאות:** הוספת נקודות ואירועים (טעון אישור Admin)

### Admin
- **אימייל:** admin@example.com
- **סיסמה:** admin123
- **הרשאות:** ניהול מלא של המערכת

> **הערה:** אם המשתמשים לא קיימים במסד הנתונים, ניתן ליצור אותם דרך דף ההרשמה או להשתמש בסקריפטים של יצירת Admin.

---

## 🗂️ מבנה הפרויקט

```
nomadland-fullstack-finalproject/
│
├── client/                      # צד לקוח (React)
│   ├── public/                  # קבצים סטטיים
│   ├── src/
│   │   ├── api/                 # פונקציות קריאה ל-API
│   │   ├── components/          # קומפוננטות React
│   │   ├── context/             # Context API (ניהול state גלובלי)
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # דפים (routes)
│   │   ├── styles/              # קבצי CSS
│   │   ├── utils/               # פונקציות עזר
│   │   ├── constants/           # קבועים
│   │   ├── App.jsx              # קומפוננטת ראשית
│   │   └── main.jsx             # נקודת כניסה
│   ├── .env                     # משתני סביבה
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # צד שרת (Node.js)
│   ├── config/                  # הגדרות (DB connection)
│   ├── controllers/             # לוגיקה עסקית
│   ├── middleware/              # middleware (auth, validation)
│   ├── models/                  # מודלים של MongoDB
│   ├── routes/                  # נתיבי API
│   ├── services/                # שירותים (Cloudinary, Email)
│   ├── utils/                   # פונקציות עזר
│   ├── .env                     # משתני סביבה
│   ├── server.js                # נקודת כניסה
│   └── package.json
│
├── .gitignore
├── package.json                 # סקריפטים משותפים
└── README.md                    # מסמך זה
```

---

## 🔑 API Endpoints מרכזיים

### Authentication
- `POST /api/auth/register` - הרשמה
- `POST /api/auth/login` - התחברות
- `POST /api/auth/google` - התחברות Google
- `POST /api/auth/forgot-password` - שחזור סיסמה
- `POST /api/auth/reset-password/:token` - איפוס סיסמה

### Users
- `GET /api/users/profile` - פרטי משתמש מחובר
- `PUT /api/users/profile` - עדכון פרופיל
- `GET /api/users` - רשימת משתמשים (Admin)
- `PUT /api/users/:id/role` - עדכון הרשאות (Admin)

### Points
- `GET /api/points` - כל הנקודות
- `GET /api/points/:id` - נקודה ספציפית
- `POST /api/points` - יצירת נקודה (Map Ranger)
- `PUT /api/points/:id` - עדכון נקודה
- `DELETE /api/points/:id` - מחיקת נקודה
- `POST /api/points/:id/favorite` - הוספה למועדפים

### Events
- `GET /api/events` - כל האירועים
- `GET /api/events/:id` - אירוע ספציפי
- `POST /api/events` - יצירת אירוע (Map Ranger)
- `PUT /api/events/:id` - עדכון אירוע
- `DELETE /api/events/:id` - מחיקת אירוע

### Personal Maps
- `GET /api/personal-maps` - המפות שלי
- `POST /api/personal-maps` - יצירת מפה
- `PUT /api/personal-maps/:id` - עדכון מפה
- `DELETE /api/personal-maps/:id` - מחיקת מפה

### Reviews
- `GET /api/reviews/point/:pointId` - ביקורות לנקודה
- `POST /api/reviews` - הוספת ביקורת
- `DELETE /api/reviews/:id` - מחיקת ביקורת

### Regions
- `GET /api/regions` - כל האזורים
- `GET /api/regions/:slug` - אזור לפי slug

### Admin
- `GET /api/admin/pending-points` - נקודות ממתינות לאישור
- `PUT /api/admin/points/:id/approve` - אישור נקודה
- `PUT /api/admin/points/:id/reject` - דחיית נקודה
- `GET /api/admin/statistics` - סטטיסטיקות

---

## 🎨 עיצוב ו-UX

- **רספונסיבי**: התאמה מלאה למובייל, טאבלט ודסקטופ
- **Material-UI**: ממשק נקי ומודרני
- **Leaflet Maps**: מפות אינטראקטיביות עם markers מותאמים
- **נגישות**: תמיכה ב-alt text לתמונות, contrast טוב
- **Toasts**: הודעות ברורות על פעולות (הצלחה/כישלון)

---

## 🔒 אבטחה

1. **הצפנת סיסמאות**: שימוש ב-bcrypt
2. **JWT Tokens**: אימות מאובטח
3. **Rate Limiting**: הגנה מפני מתקפות
4. **Validation**: ולידציות קפדניות עם Joi וצד לקוח
5. **CORS**: הגדרות מותאמות
6. **Protected Routes**: בדיקת הרשאות בכל route רגיש

---

## 📝 דרישות פרויקט שהושלמו

### דרישות צד לקוח ✅
- [x] שימוש ב-React
- [x] עיצוב רספונסיבי עם CSS
- [x] Navbar דינמי ו-Footer
- [x] דף כניסה עם תוכן מתאים
- [x] טפסים עם ולידציות (Regex לסיסמאות)
- [x] הרשמה והתחברות
- [x] JWT tokens ב-localStorage
- [x] CRUD operations
- [x] מערכת מועדפים
- [x] דף פרטי תוכן
- [x] שדה חיפוש
- [x] הרשאות (User, Map Ranger, Admin)
- [x] קריאות HTTP עם Axios
- [x] Try/Catch בקריאות אסינכרוניות
- [x] ארכיטקטורה מסודרת
- [x] Console נקי משגיאות
- [x] סינון תוכן
- [x] מצבי תצוגה שונים

### דרישות צד שרת ✅
- [x] package.json עם nodemon ב-devDependencies
- [x] REST API עם Express
- [x] אותנטיקציה (JWT)
- [x] אותוריזציה (הרשאות)
- [x] MongoDB כמסד נתונים
- [x] ולידציות עם Joi
- [x] Routes & Models מחולקים
- [x] Logger (Morgan)

### בונוסים שהוספו 🌟
- [x] Logout אוטומטי אחרי 4 שעות
- [x] Rate Limiting
- [x] ניהול משתמשים (Admin)
- [x] ניהול מועדפים
- [x] תמונת פרופיל
- [x] שחזור סיסמה דרך אימייל
- [x] Google OAuth
- [x] רב-לשוניות
- [x] מערכת Reviews
- [x] מערכת Events
- [x] מפות אישיות

---

## 🤝 תרומה ופיתוח עתידי

רעיונות לפיתוח עתידי:
- הוספת צ'אט בין משתמשים
- התראות Push
- אפליקציית מובייל נטיבית
- אינטגרציה עם API של Booking.com
- המלצות מבוססות AI
- שיתוף למדיה חברתית

---

## 📧 יצירת קשר

- **מפתח**: Doral Sinai
- **GitHub**: [doralSi](https://github.com/doralSi)
- **Repository**: [nomadland-fullstack-finalprojecthackeru](https://github.com/doralSi/nomadland-fullstack-finalprojecthackeru)

---

## 📄 רישיון

פרויקט זה נוצר כחלק מקורס פיתוח Full Stack ומיועד למטרות לימודיות בלבד.

---

**נבנה עם ❤️ על ידי Doral Sinai | 2024**
