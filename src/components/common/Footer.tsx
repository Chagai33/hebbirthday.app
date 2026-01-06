import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DeveloperCredit } from './DeveloperCredit';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
            <Link
              to="/terms"
              className="text-gray-600 hover:text-indigo-600 transition-colors whitespace-nowrap"
            >
              {t('footer.termsOfUse', 'תנאי שימוש')}
            </Link>
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-indigo-600 transition-colors whitespace-nowrap"
            >
              {t('footer.privacyPolicy', 'מדיניות פרטיות')}
            </Link>
            <Link
              to="/accessibility"
              className="text-gray-600 hover:text-indigo-600 transition-colors whitespace-nowrap"
            >
              {t('footer.accessibility', 'הצהרת נגישות')}
            </Link>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf4M-3ytbYRAOIh9B7Bavgaw2WyGgDFP3PT7zgTmTMnUFXMrg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-indigo-600 transition-colors whitespace-nowrap"
            >
              {t('footer.feedback', 'משוב')}
            </a>
          </div>

          {/* Developer Credit */}
          <DeveloperCredit />

          {/* Copyright */}
          <div className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} HebBirthday
          </div>
        </div>
      </div>
    </footer>
  );
};

