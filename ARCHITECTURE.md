# 🏗️ HebBirthday - Architecture & Components

## 🎯 Frontend Architecture

### Core Components Structure

#### 🔐 Authentication Layer (`src/components/auth/`)

**AuthLayout** - מעטפת אחידה לכל דפי האימות
- מנהל עיצוב Card (bg-white, shadow-xl, rounded-2xl)
- רוחב קבוע: max-w-lg (512px)
- ריפוד פנימי: p-6
- כולל Footer מובנה (variant="minimal")

**Authentication Pages:**
- `Login.tsx` - דף התחברות עם Google/Email
- `Register.tsx` - דף הרשמה עם טופס הרשמה מלא
- `ResetPassword.tsx` - איפוס סיסמה עם אימות קוד

**Supporting Components:**
- `ForgotPasswordModal.tsx` - מודל לשכחת סיסמה

#### 🎨 Common Components (`src/components/common/`)

**Logo** - רכיב מרכזי עם Variants מותאמים לכל שימוש
- `auth` - לדפי אימות (גודל בינוני עם טגליין)
- `guest-sticky` - להאדר דביק אורחים (גודל קטן)
- `guest-hero` - לעמוד נחיתה (גודל גדול)
- `app-header` - להאדר האפליקציה (גודל בינוני ללא טגליין)

**Footer** - ניהול קישורים משפטיים ונגישות
- `variant="default"` - Footer מלא עם רקע לבן, גבול עליון וכפתור משוב
- `variant="minimal"` - Footer נקי לדפי אימות ואורחים (רק קישורים משפטיים)
- תמיכה מלאה בנגישות (role="contentinfo", aria-labels, focus rings)

**Additional Common Components:**
- `LanguageSwitcher.tsx` - החלפת שפה
- `DeveloperCredit.tsx` - קרדיט למפתח
- `Toast.tsx` - התראות למשתמש
- `ProtectedRoute.tsx` - הגנה על נתיבים

#### 🏠 Main Pages (`src/components/`)

**Dashboard (`Dashboard.tsx`)**
- עמוד הבית הראשי עם סיכום פעילות

**Birthdays Management (`birthdays/`)**
- `BirthdayList.tsx` - רשימת ימי ההולדת
- `BirthdayForm.tsx` - טופס הוספת/עריכת ימי הולדת
- `GroupFilterMultiSelect.tsx` - סינון לפי קבוצות
- `SyncStatusButton.tsx` - סטטוס סנכרון ליומן
- `WhatsAppCopyButton.tsx` - העתקת רשימה לוואטסאפ

**Groups Management (`groups/`)**
- `GroupsPanel.tsx` - פאנל ניהול קבוצות
- `GroupFilterDropdown.tsx` - דרופדאון סינון קבוצות

**Google Calendar Integration (`calendar/`)**
- `GoogleCalendarButton.tsx` - התחברות ליומן
- `GoogleCalendarStatus.tsx` - סטטוס חיבור
- `SyncHistoryModal.tsx` - היסטוריית סנכרונים

**Gelt Calculator (`gelt/`)**
- `GeltPage.tsx` - עמוד מחשבון דמי חנוכה/פורים
- `GeltChildrenList.tsx` - רשימת ילדים
- `GeltCalculationResults.tsx` - תוצאות חישוב
- `GeltBudgetConfig.tsx` - הגדרות תקציב

**Guest Portal (`guest/`)**
- `GuestAccessPage.tsx` - עמוד נחיתה לאורחים
- `GuestLayout.tsx` - מעטפת אורחים (דומה ל-AuthLayout)
- `GuestPortal.tsx` - פורטל מתנות אורחים
- `GuestWishlistManager.tsx` - ניהול רשימת משאלות

#### 🎭 Modals (`src/components/modals/`)

**Core Modals:**
- `AboutModal.tsx` - מידע על האפליקציה
- `ShareGroupModal.tsx` - שיתוף קבוצות
- `GoogleCalendarModal.tsx` - הגדרות יומן

**Management Modals:**
- `GroupFormModal.tsx` - יצירה/עריכת קבוצות
- `BirthdayQuickActionsModal.tsx` - פעולות מהירות לימי הולדת
- `GuestActivityModal.tsx` - פעילות אורחים

**Import/Export Modals:**
- `TextImportModal.tsx` - ייבוא טקסט
- `CSVImportPreviewModal.tsx` - תצוגה מקדימה לייבוא CSV

#### 📄 Static Pages (`src/components/pages/`)

**Legal Pages:**
- `TermsOfUse.tsx` - תנאי שימוש
- `PrivacyPolicy.tsx` - מדיניות פרטיות
- `Accessibility.tsx` - הצהרת נגישות

**Help Pages:**
- `UserGuide.tsx` - מדריך למשתמש

#### 🎨 Layout Components (`src/components/layout/`)

**Main Layout:**
- `Layout.tsx` - מעטפת ראשית של האפליקציה
- `Header.tsx` - האדר עליון
- `Footer.tsx` - פוטר (כאמור לעיל)

**UI Components:**
- `FloatingActionButton.tsx` - כפתור פעולה צף
- `FloatingDock.tsx` - דוק צף
- `InfoPageLayout.tsx` - מעטפת עמודי מידע

### 🏛️ Application Architecture

#### State Management

**React Context Providers:**
- `AuthContext.tsx` - ניהול אימות משתמשים
- `ToastContext.tsx` - ניהול התראות
- `TenantContext.tsx` - הגדרות טננט
- `GoogleCalendarContext.tsx` - חיבור ליומן
- `GroupFilterContext.tsx` - סינון קבוצות
- `GuestNotificationsContext.tsx` - התראות אורחים
- `LayoutContext.tsx` - הגדרות פריסה

#### Services Layer (`src/services/`)

**Core Services:**
- `auth.service.ts` - שירותי אימות
- `birthday.service.ts` - ניהול ימי הולדת
- `group.service.ts` - ניהול קבוצות
- `googleCalendar.service.ts` - אינטגרציה עם Google Calendar

**Supporting Services:**
- `analytics.service.ts` - מעקב אנליטיקה
- `guest.service.ts` - שירותי אורחים
- `tenant.service.ts` - הגדרות טננט
- `wishlist.service.ts` - ניהול רשימות משאלות

#### Utilities & Helpers (`src/utils/`)

**Data Processing:**
- `csvExport.ts` - ייצוא ל-CSV
- `csvValidation.ts` - ולידציה של CSV
- `textParser.ts` - פירוק טקסט

**Date & Hebrew Calendar:**
- `dateUtils.ts` - עזרים לתאריכים
- `googleCalendar.ts` - עזרים ליומן

**Gelt Calculator:**
- `geltCalculations.ts` - חישובי דמי חנוכה/פורים
- `geltConstants.ts` - קבועים למחשבון

#### Custom Hooks (`src/hooks/`)

**Data Hooks:**
- `useBirthdays.ts` - ניהול ימי הולדת
- `useGroups.ts` - ניהול קבוצות
- `useGelt.ts` - מחשבון דמי חנוכה/פורים

**UI Hooks:**
- `useToast.ts` - התראות
- `useAccessibility.ts` - נגישות

### 📊 Data Flow

```
User Input → Components → Services → Firebase/Firestore → Components → UI Updates

Authentication Flow:
Login/Register → AuthContext → auth.service → Firebase Auth → AuthContext → Protected Routes

Birthday Management:
Form Input → BirthdayForm → birthday.service → Firestore → BirthdayList → UI

Calendar Sync:
GoogleCalendarButton → googleCalendar.service → Google APIs → Sync Status → UI
```

### 🎨 Design System

#### Colors
- Primary: `#8e24aa` (סגול)
- Secondary: `#304FFE` (כחול)
- Accent: `#FF6D00` (כתום)

#### Typography
- Font: System fonts with Hebrew support
- Sizes: Responsive scaling (sm/md/lg/xl)

#### Spacing
- Container: max-w-7xl (1280px)
- Cards: max-w-lg (512px) for auth, flexible for content
- Padding: p-6 for cards, p-4 for containers

### 🔒 Security & Privacy

#### Authentication
- Firebase Auth with Email/Password & Google OAuth
- Protected routes with role-based access
- Guest access with limited permissions

#### Data Protection
- Firestore security rules
- Client-side validation
- Privacy-compliant data handling

### 🚀 Performance Optimizations

#### Code Splitting
- Lazy loading for routes and heavy components
- Dynamic imports for optional features

#### Caching
- React Query for server state caching
- Firebase offline persistence

#### Bundle Optimization
- Tree shaking for unused dependencies
- Compressed assets and images

---

## 📋 Component Usage Guidelines

### When to Use AuthLayout
- All authentication pages (Login, Register, ResetPassword)
- Pages requiring minimal footer
- Consistent card-based design

### When to Use Logo Variants
- `auth`: Authentication pages
- `guest-hero`: Landing pages
- `guest-sticky`: Fixed headers
- `app-header`: Main app navigation

### When to Use Footer Variants
- `minimal`: Auth pages, guest portals
- `default`: Main app content, help pages

---

**Last Updated:** January 2026
**Version:** 3.0.0