import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoPageLayout } from '../layout/InfoPageLayout';

export const Accessibility: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isHebrew = i18n.language === 'he';

  return (
    <InfoPageLayout>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          {t('accessibility.title', 'הצהרת נגישות - HebBirthday.App')}
        </h1>
        
        <p className="text-sm text-gray-600 mb-8">
          {t('accessibility.lastUpdated', 'תאריך עדכון אחרון')}: {new Date().toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-sm max-w-none space-y-6" dir={isHebrew ? 'rtl' : 'ltr'}>
          <section>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('accessibility.intro', 'אנו ב-HebBirthday רואים חשיבות עליונה בהנגשת שירותינו לכלל האוכלוסייה, לרבות אנשים עם מוגבלויות. אנו פועלים מתוך אמונה כי לכל אדם מגיעה הזכות ליהנות מחוויית גלישה שוויונית, נוחה ועצמאית.')}
            </p>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('accessibility.level.title', 'רמת הנגישות')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('accessibility.level.text', 'האתר מונגש בהתאם להנחיות הנגישות בתקן הישראלי 5568 ("קווים מנחים לנגישות תכנים באינטרנט") ברמה AA, וזאת בהתאם להנחיות הבינלאומיות של מסמך WCAG 2.2.')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('accessibility.adjustments.title', 'התאמות שבוצעו')}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>{t('accessibility.adjustments.keyboard', 'ניווט מקלדת:')}</strong> {t('accessibility.adjustments.keyboardDesc', 'האתר תומך באופן מלא בניווט באמצעות המקלדת בלבד (שימוש במקשי Tab, Enter ו-Esc).')}</li>
              <li><strong>{t('accessibility.adjustments.skiplink', 'קישור דילוג:')}</strong> {t('accessibility.adjustments.skiplinkDesc', 'הוטמע קישור "דלג לתוכן" המאפשר דילוג על תפריטי הניווט ישירות לתוכן המרכזי.')}</li>
              <li><strong>{t('accessibility.adjustments.focus', 'ניהול פוקוס:')}</strong> {t('accessibility.adjustments.focusDesc', 'מיושמת "מלכודת פוקוס" במודלים ובתפריטים כדי למנוע אובדן התמצאות.')}</li>
              <li><strong>{t('accessibility.adjustments.screenreader', 'תמיכה בקוראי מסך:')}</strong> {t('accessibility.adjustments.screenreaderDesc', 'שימוש ב-Semantic HTML ובתגיות ARIA להקראה נכונה של תכנים, טפסים ושגיאות.')}</li>
              <li><strong>{t('accessibility.adjustments.contrast', 'ניגודיות:')}</strong> {t('accessibility.adjustments.contrastDesc', 'הקפדה על יחס ניגודיות העומד בתקן לקריאות מקסימלית.')}</li>
              <li><strong>{t('accessibility.adjustments.languages', 'שפות:')}</strong> {t('accessibility.adjustments.languagesDesc', 'האתר תומך ב-RTL (עברית) ובשפות נוספות עם עדכון דינמי של שפת המסמך.')}</li>
            </ul>
          </section>

          <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('accessibility.limitations.title', 'סייגי נגישות')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('accessibility.limitations.text', 'למרות מאמצינו להנגיש את כלל דפי האתר, ייתכן שיתגלו חלקים שטרם הונגשו במלואם (למשל רכיבים המוטמעים מצד שלישי). אם נתקלתם בבעיה, נשמח אם תדווחו לנו.')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('accessibility.standards.title', 'תקנים ושיטות נגישות')}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>{t('accessibility.standards.wcag', 'תאימות ל-WCAG 2.2 רמה AA')}</li>
              <li>{t('accessibility.standards.keyboard', 'ניווט מקלדת מלא')}</li>
              <li>{t('accessibility.standards.screenreader', 'תמיכה בקוראי מסך')}</li>
              <li>{t('accessibility.standards.contrast', 'ניגודיות צבעים מיטבית')}</li>
              <li>{t('accessibility.standards.focus', 'אינדיקציות פוקוס ברורות')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('accessibility.coordinator.title', 'פרטי רכז נגישות')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {t('accessibility.coordinator.intro', 'לכל שאלה, בקשה או דיווח על תקלה, ניתן לפנות לרכז הנגישות:')}
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>{t('accessibility.coordinator.name', 'שם:')}</strong>{' '}
                {t('accessibility.coordinator.nameValue', 'חגי יחיאל')}
              </p>
              <p className="text-gray-700">
                <strong>{t('accessibility.coordinator.email', 'אימייל:')}</strong>{' '}
                <a href="mailto:hebbirthday@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                  hebbirthday@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('accessibility.contact.title', 'דרכי יצירת קשר נוספות')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('accessibility.contact.text', 'אם נתקלת בבעיית נגישות או יש לך הצעות לשיפור, נשמח לשמוע ממך:')}
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <strong>{t('accessibility.contact.email', 'דוא"ל')}:</strong>{' '}
                <a href="mailto:hebbirthday@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                  hebbirthday@gmail.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>{t('accessibility.contact.form', 'טופס משוב')}:</strong>{' '}
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf4M-3ytbYRAOIh9B7Bavgaw2WyGgDFP3PT7zgTmTMnUFXMrg/viewform" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {t('accessibility.contact.formLink', 'שלח משוב')}
                </a>
              </p>
            </div>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('accessibility.ongoing.title', 'שיפור מתמיד')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('accessibility.ongoing.text', 'אנו משקיעים מאמצים מתמידים לשיפור הנגישות של האפליקציה ולוודא שהיא עומדת בתקנים העדכניים ביותר. אנו מבצעים בדיקות נגישות שוטפות ומיישמים משוב ממשתמשים כדי להבטיח חוויית שימוש מיטבית לכולם.')}
            </p>
          </section>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <strong>{t('accessibility.updateDate', 'תאריך עדכון ההצהרה:')}</strong> {t('accessibility.updateDateValue', 'דצמבר 2025')}
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
};

