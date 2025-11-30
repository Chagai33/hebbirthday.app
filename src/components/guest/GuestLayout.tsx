import React, { useState, useEffect, useRef } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const GuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const currentLangLabel = i18n.language === 'en' ? 'עברית' : 'English';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white shadow-sm py-4 px-6 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-start transition-opacity hover:opacity-80 -ms-1 pe-6"
            >
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none relative inline-flex items-baseline" dir="ltr">
                <span className="text-[#8e24aa]">Heb</span>
                <span className="text-[#304FFE]">Birthday</span>
                <span className="text-gray-400 text-sm sm:text-base ml-[1px]">.app</span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium -mt-0.5">
                {t('app.taglinePart1')} <span className="text-[#8e24aa]">{t('app.taglineHebrew')}</span> {t('app.taglineOr')} <span className="text-[#304FFE]">{t('app.taglineGregorian')}</span>
              </span>
            </button>

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
                ref={buttonRef}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div 
                ref={menuRef}
                className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg md:hidden z-50"
            >
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
