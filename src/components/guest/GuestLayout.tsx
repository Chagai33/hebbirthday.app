import React, { useState } from 'react';
import { Gift, Globe, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const GuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const currentLangLabel = i18n.language === 'en' ? 'עברית' : 'English';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white shadow-sm py-4 px-6 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-600 cursor-pointer" onClick={() => navigate('/portal')}>
            <Gift className="w-8 h-8" />
            <span className="text-xl font-bold">{t('guest.portalTitle', 'Wishlist Portal')}</span>
            </div>

            <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {currentLangLabel}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/terms')}>
                    {t('footer.termsOfUse')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/privacy')}>
                    {t('footer.privacyPolicy')}
                </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg md:hidden z-50">
                <div className="p-4 space-y-2">
                    <button 
                        onClick={() => {
                            toggleLanguage();
                            setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        <Globe className="w-5 h-5" />
                        <span>{currentLangLabel}</span>
                    </button>
                    <button 
                        onClick={() => {
                            navigate('/terms');
                            setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-start"
                    >
                        <span>{t('footer.termsOfUse')}</span>
                    </button>
                    <button 
                        onClick={() => {
                            navigate('/privacy');
                            setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-start"
                    >
                        <span>{t('footer.privacyPolicy')}</span>
                    </button>
                </div>
            </div>
        )}
      </header>
      
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-md mx-auto w-full">
          {children}
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} HebBirthday
      </footer>
    </div>
  );
};
