import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { InfoPageLayout } from '../layout/InfoPageLayout';
import { Footer } from '../layout/Footer';
import { Button } from '../common/Button';
import {
  Calendar,
  Users,
  Gift,
  Calculator,
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHebrew = i18n.language === 'he';

  const handlePrimaryAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleSecondaryAction = () => {
    if (!user) {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      title: t('landing.features.syncTitle', 'סנכרון ליומן Google'),
      description: t('landing.features.syncDesc', 'יצירת יומן ייעודי לימי הולדת עבריים ולועזיים, מתעדכן ל-10 שנים קדימה.')
    },
    {
      icon: <Calculator className="w-6 h-6 text-orange-600" />,
      title: t('landing.features.geltTitle', 'מחשבון דמי חנוכה'),
      description: t('landing.features.geltDesc', 'ניהול תקציב חכם וחלוקה לקבוצות גיל לילדים והנכדים.')
    },
    {
      icon: <Gift className="w-6 h-6 text-pink-600" />,
      title: t('landing.features.wishlistTitle', 'רשימות משאלות'),
      description: t('landing.features.wishlistDesc', 'ניהול רשימת משאלות ללא צורך בהתחברות למערכת.')
    }
  ];

  return (
    <InfoPageLayout>
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            {/* Hero Section */}
            <section className="text-center mb-12 sm:mb-16">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-8 sm:p-12 mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {t('landing.hero.title', 'ניהול ימי הולדת - חכם, פשוט, מסונכרן')}
                </h1>
                <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                  {t('landing.hero.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button
                    size="lg"
                    onClick={handlePrimaryAction}
                    className="w-full sm:w-auto"
                  >
                    {user
                      ? t('landing.hero.ctaDashboard', 'מעבר ללוח הבקרה')
                      : t('landing.hero.ctaLogin', 'התחברות')
                    }
                  </Button>

                  {!user && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={handleSecondaryAction}
                      className="w-full sm:w-auto"
                    >
                      {t('landing.hero.ctaRegister', 'הרשמה בחינם')}
                    </Button>
                  )}
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                {t('landing.features.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-4 mx-auto">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Transparency Section */}
            <section className="mb-12 sm:mb-16">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                      {t('landing.transparency.title', 'הפרטיות שלך מעל הכל')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {t('landing.transparency.desc', 'אנו מבקשים גישה ליומן Google אך ורק כדי ליצור ולנהל את יומן ימי ההולדת עבורך. המידע נשמר בשרתים מאובטחים ואינו מועבר לשום גורם צד שלישי.')}
                    </p>

                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {t('landing.transparency.guaranteeTitle', 'הבטחת הפרטיות שלך')}
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{t('landing.transparency.guarantee1', 'יומן ייעודי ומופרד - לא ניגע ביומן האישי שלך')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{t('landing.transparency.guarantee2', 'גישה מוגבלת ליצירת אירועי ימי הולדת בלבד')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{t('landing.transparency.guarantee3', 'אפשרות למחוק את היומן בכל עת')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Hidden/Subtle English Description for Google Verification */}
            <div className="mt-8 pt-8 border-t border-gray-50 text-center">
               <p className="text-[10px] text-gray-300 leading-tight max-w-2xl mx-auto select-none">
                 HebBirthday is a calendar synchronization app. It allows users to sync Hebrew and Gregorian birthdays to a dedicated Google Calendar.
               </p>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-0">
            <Footer variant="default" />
          </div>
        </main>
      </div>
    </InfoPageLayout>
  );
};