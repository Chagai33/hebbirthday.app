# 📋 מפת שימושים בפוטר (Footer) - HebBirthday

## 📍 סקירה כללית

בפרויקט HebBirthday קיימים **שני רכיבי Footer** שונים:
- **Footer מרכזי** (`src/components/layout/Footer.tsx`) - הרכיב הרשמי והנוכחי
- **Footer ישן** (`src/components/common/Footer.tsx`) - רכיב ישן שאינו בשימוש

ה-Footer המרכזי תומך בשתי וריאציות: `default` ו-`minimal`.

---

## 🎯 Footer מרכזי (`src/components/layout/Footer.tsx`)

### ממשק API
```typescript
interface FooterProps {
  variant?: 'default' | 'minimal';  // ברירת מחדל: 'default'
}
```

### וריאציות

#### 🔸 `variant="default"` (ברירת מחדל)
**תיאור:** Footer מלא עם רקע לבן, גבול עליון, וכפתור משוב
**כולל:**
- קישורים: תנאי שימוש, מדיניות פרטיות, הצהרת נגישות, משוב
- טקסט זכויות יוצרים: `© 2026 HebBirthday.App. כל הזכויות שמורות`
- עיצוב: `bg-white border-t border-gray-200 mt-auto`

#### 🔸 `variant="minimal"`
**תיאור:** Footer נקי ומזערי לאזורי אימות ואורחים
**כולל:**
- קישורים בלבד: מדיניות פרטיות, תנאי שימוש, הצהרת נגישות
- ללא טקסט זכויות יוצרים
- עיצוב: `w-full py-6 text-center mt-auto`
- נגישות מלאה: focus rings, aria-label, מפרידים עם `aria-hidden`

---

## 📂 קבצים המשתמשים ב-Footer

### ✅ משתמשים ב-Footer מרכזי (`../layout/Footer`)

#### 🔐 דפי אימות (Authentication Pages)
```typescript
// src/components/auth/Login.tsx
import { Footer } from '../layout/Footer';
// שימוש: <Footer variant="minimal" />
```

```typescript
// src/components/auth/Register.tsx
import { Footer } from '../layout/Footer';
// שימוש: <Footer variant="minimal" />
```

```typescript
// src/components/auth/ResetPassword.tsx
import { Footer } from '../layout/Footer';
// שימוש: <Footer variant="minimal" />
```

#### 🎁 קומפוננטות אורחים (Guest Components)
```typescript
// src/components/guest/GuestAccessPage.tsx (פורטל הוספת רשומות)
import { Footer } from '../layout/Footer';
// שימוש: <Footer variant="minimal" /> (2 מופעים)
```

```typescript
// src/components/guest/GuestLayout.tsx (Layout לפורטל מתנות)
import { Footer } from '../layout/Footer';
// שימוש: <Footer variant="minimal" />
```

### ⚠️ עדיין משתמש ב-Footer ישן (`../common/Footer`)

#### 📖 דפי מדריך (Guide Pages)
```typescript
// src/components/pages/UserGuide.tsx
import { Footer } from '../common/Footer';
// שימוש: <Footer /> (ללא variant - משתמש בברירת המחדל)
```

---

## 🔍 הערות ושימושים אחרים

### 💬 קבצים עם הערות Footer (אינם משתמשים ברכיב)
הקבצים הבאים מכילים רק הערות קוד על Footer, אך אינם משתמשים בפועל ברכיב:

```typescript
// src/components/modals/TextImportModal.tsx
{/* Footer */}

// src/components/modals/ShareGroupModal.tsx
{/* Footer */}

// src/components/modals/GuestActivityModal.tsx
{/* Footer */}

// src/components/modals/BirthdayQuickActionsModal.tsx
{/* Footer Actions */}

// src/components/modals/AboutModal.tsx
{/* Footer - Fixed */}
```

### 📋 Footer ישן (`src/components/common/Footer.tsx`)
**סטטוס:** ❌ **לא בשימוש** (רק UserGuide.tsx עדיין משתמש בו)
**כולל:** טקסט זכויות יוצרים "© 2026 HebBirthday" (ללא .App)

---

## 🔧 משימות תחזוקה

### ✅ הושלמו
- [x] איחוד כל דפי האימות והאורחים ל-Footer מרכזי
- [x] הסרת טקסט זכויות יוצרים מדפי אורחים
- [x] הטמעת variant="minimal" לכולם
- [x] נגישות מלאה (focus rings, aria-labels)

### 🔄 ממתינות
- [ ] החלפת UserGuide.tsx ל-Footer מרכזי (`variant="default"`)
- [ ] מחיקת `src/components/common/Footer.tsx` לאחר ההחלפה

---

## 🎨 עיצוב וסגנון

### Footer מינימליסטי (דפי אימות ואורחים)
```css
.w-full.py-6.text-center.mt-auto
```
- רקע שקוף
- מרווח אנכי: `py-6`
- יישור מרכזי
- ממוקם בתחתית הקונטיינר

### Footer רגיל (דפי תוכן)
```css
.bg-white.border-t.border-gray-200.mt-auto
```
- רקע לבן
- גבול עליון אפור
- כולל כפתור משוב וטקסט זכויות

---

## 📊 סיכום שימושים

| קטגוריה | מספר קבצים | Footer Type | Variant |
|----------|-------------|-------------|---------|
| דפי אימות | 3 | מרכזי | minimal |
| קומפוננטות אורחים | 2 | מרכזי | minimal |
| דפי מדריך | 1 | ישן | - |
| מודלים עם הערות | 5 | - | - |

**סה"כ:** 5 קבצים משתמשים ב-Footer מרכזי, 1 משתמש בישן

---

## 📝 הערות למפתחים

1. **אל תשתמש ב-Footer הישן** מ-`../common/Footer`
2. **השתמש תמיד ב-Footer המרכזי** מ-`../layout/Footer`
3. **דפי אימות ואורחים:** `variant="minimal"`
4. **דפי תוכן:** `variant="default"` (או השמט - ברירת מחדל)
5. **נגישות:** כל ה-variants נגישים עם focus rings ו-aria-labels

---

*נכתב ב: $(date)*
*עודכן לאחרונה: $(date)*