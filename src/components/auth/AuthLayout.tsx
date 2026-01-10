import React from 'react';
import { Footer } from '../layout/Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-4 overflow-y-auto">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 relative">
          {children}
        </div>
      </div>
      <Footer variant="minimal" />
    </div>
  );
};