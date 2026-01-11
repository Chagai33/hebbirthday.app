import React from 'react';
import { Footer } from '../layout/Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-4 overflow-y-auto">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-50 focus:p-2 focus:bg-white focus:text-blue-600 focus:shadow-lg focus:rounded-lg">דלג לתוכן העיקרי</a>

      <main id="main-content" className="flex-1 flex items-center justify-center w-full">
        <div className="md:max-w-4xl max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 relative">
          {children}
        </div>
      </main>
      <Footer variant="minimal" />
    </div>
  );
};