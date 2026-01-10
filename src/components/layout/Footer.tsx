import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { DeveloperCredit } from '../common/DeveloperCredit';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const { t } = useTranslation();

  const handleFeedback = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSf4M-3ytbYRAOIh9B7Bavgaw2WyGgDFP3PT7zgTmTMnUFXMrg/viewform', '_blank', 'noopener,noreferrer');
  };

  if (variant === 'minimal') {
    return (
      <footer className="w-full py-6 text-center mt-auto" role="contentinfo">
        <nav className="flex justify-center items-center gap-2" aria-label="Legal links">
          <Link
            to="/privacy"
            className="text-xs text-gray-600 hover:text-gray-900 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded"
          >
            {t('footer.privacyPolicy', 'מדיניות פרטיות')}
          </Link>

          <span aria-hidden="true" className="text-gray-400 select-none">•</span>

          <Link
            to="/terms"
            className="text-xs text-gray-600 hover:text-gray-900 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded"
          >
            {t('footer.termsOfUse', 'תנאי שימוש')}
          </Link>

          <span aria-hidden="true" className="text-gray-400 select-none">•</span>

          <Link
            to="/accessibility"
            className="text-xs text-gray-600 hover:text-gray-900 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded"
          >
            {t('footer.accessibility', 'הצהרת נגישות')}
          </Link>
        </nav>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm" role="list">
            <li>
              <Link
                to="/terms"
                className="text-gray-800 hover:text-gray-900 transition-colors"
              >
                {t('footer.termsOfUse', 'תנאי שימוש')}
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="text-gray-800 hover:text-gray-900 transition-colors"
              >
                {t('footer.privacyPolicy', 'מדיניות פרטיות')}
              </Link>
            </li>
            <li>
              <Link
                to="/accessibility"
                className="text-gray-800 hover:text-gray-900 transition-colors"
              >
                {t('footer.accessibility', 'הצהרת נגישות')}
              </Link>
            </li>
            <li>
              <button
                onClick={handleFeedback}
                className="text-gray-800 hover:text-gray-900 transition-colors flex items-center gap-1"
                aria-label={t('footer.feedbackOpenNewWindow')}
              >
                <MessageSquare className="w-4 h-4" />
                {t('footer.feedback', 'משוב')}
              </button>
            </li>
          </ul>
          <DeveloperCredit />
          <div className="text-xs text-gray-800">
            © {new Date().getFullYear()} HebBirthday.App. {t('footer.allRightsReserved', 'כל הזכויות שמורות')}
          </div>
        </div>
      </div>
    </footer>
  );
};

