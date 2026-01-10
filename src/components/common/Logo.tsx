import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export type LogoVariant = 'auth' | 'guest-sticky' | 'guest-hero' | 'app-header';

interface LogoProps {
  variant?: LogoVariant;
  showTagline?: boolean;
  className?: string;
  linkToHome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'auth',
  showTagline = true,
  className = '',
  linkToHome = false
}) => {
  const { t } = useTranslation();

  // הגדרת הסגנונות המדויקים מתוך הקוד הקיים
  const styles = {
    auth: {
      // מקור: src/components/auth/Login.tsx
      wrapper: "text-3xl sm:text-4xl font-black tracking-tight leading-none relative inline-flex items-baseline",
      dotApp: "text-gray-500 text-xl ml-[1px] absolute left-full bottom-1",
      tagline: "text-sm text-gray-600 font-medium mt-1"
    },
    'guest-sticky': {
      // מקור: src/components/guest/GuestAccessPage.tsx (Sticky Header)
      wrapper: "text-xl sm:text-2xl font-black tracking-tight leading-none inline-flex items-baseline",
      dotApp: "text-gray-500 text-sm sm:text-base ml-[1px]",
      tagline: "text-[10px] sm:text-xs text-gray-600 text-center -mt-1"
    },
    'guest-hero': {
      // מקור: src/components/guest/GuestAccessPage.tsx (Loading State)
      wrapper: "text-5xl font-black tracking-tight leading-none relative inline-flex items-baseline",
      dotApp: "text-gray-500 text-xl ml-[2px]",
      tagline: "text-base text-gray-600 font-medium mt-3"
    },
    'app-header': {
      // מקור: src/components/layout/Header.tsx
      // שים לב: ב-Header זה h1 ולפעמים div, כאן נשתמש ב-div גנרי והעוטף יקבע
      wrapper: "text-xl sm:text-2xl font-black tracking-tight leading-none relative inline-flex items-baseline",
      dotApp: "text-gray-600 text-sm sm:text-base ml-[1px]", // צבע שונה מעט ב-Header
      tagline: "text-[10px] sm:text-xs text-gray-600 font-medium -mt-0.5"
    }
  };

  const currentStyle = styles[variant];

  const LogoContent = (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={currentStyle.wrapper} dir="ltr">
        <span className="text-[#8e24aa]">Heb</span>
        <span className="text-[#304FFE]">Birthday</span>
        <span className={currentStyle.dotApp}>.app</span>
      </div>

      {showTagline && (
        <span className={currentStyle.tagline}>
          {t('app.taglinePart1', 'לא שוכחים אף תאריך -')}{' '}
          <span className="text-[#8e24aa]">{t('app.taglineHebrew', 'עברי')}</span>{' '}
          {t('app.taglineOr', 'או')}{' '}
          <span className="text-[#304FFE]">{t('app.taglineGregorian', 'לועזי')}</span>
        </span>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link
        to="/"
        className="hover:opacity-80 transition-opacity flex-shrink min-w-0"
        aria-label="HebBirthday Home"
      >
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
};