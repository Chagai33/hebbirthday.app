import React from 'react';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { CurrentDateDisplay } from '../common/CurrentDateDisplay';
import { Logo } from '../common/Logo';
import { Footer } from '../layout/Footer';

export const GuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // toggleLanguage removed - using LanguageSwitcher

  // currentLangLabel removed - using LanguageSwitcher

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo variant="app-header" linkToHome={true} />

          <div className="flex-1 flex justify-center min-w-0 mt-2">
            <CurrentDateDisplay />
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" variant="minimal" />
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-md mx-auto w-full">
          {children}
        </div>
      </main>

      <Footer variant="minimal" className="mt-auto" />
    </div>
  );
};
