import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();


  const handleFeedback = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSf4M-3ytbYRAOIh9B7Bavgaw2WyGgDFP3PT7zgTmTMnUFXMrg/viewform', '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm" role="list">
            <li>
              <Link
                to="/terms"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t('footer.termsOfUse', 'תנאי שימוש')}
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t('footer.privacyPolicy', 'מדיניות פרטיות')}
              </Link>
            </li>
            <li>
              <Link
                to="/accessibility"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t('footer.accessibility', 'הצהרת נגישות')}
              </Link>
            </li>
            <li>
              <button
                onClick={handleFeedback}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                aria-label={t('footer.feedbackOpenNewWindow')}
              >
                <MessageSquare className="w-4 h-4" />
                {t('footer.feedback', 'משוב')}
              </button>
            </li>
          </ul>
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} HebBirthday.App. {t('footer.allRightsReserved', 'כל הזכויות שמורות')}
          </div>
        </div>
      </div>
    </footer>
  );
};

