import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ForceEnglishProps {
  children: React.ReactNode;
}

export const ForceEnglish: React.FC<ForceEnglishProps> = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Force language to English when this component mounts
    i18n.changeLanguage('en');
  }, [i18n]);

  return <>{children}</>;
};