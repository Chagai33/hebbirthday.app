import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
    className?: string;
    variant?: 'default' | 'minimal';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    className = '',
    variant = 'default'
}) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        let newLang: string;
        if (i18n.language === 'he') {
            newLang = 'en';
        } else if (i18n.language === 'en') {
            newLang = 'es';
        } else {
            newLang = 'he';
        }
        i18n.changeLanguage(newLang);
        document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    const getLabel = () => {
        switch (i18n.language) {
            case 'he': return 'EN';
            case 'en': return 'ES';
            default: return 'HE';
        }
    };

    const getTitle = () => {
        switch (i18n.language) {
            case 'he': return 'English';
            case 'en': return 'Español';
            default: return 'עברית';
        }
    };

    const baseClasses = "text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border-0";
    const paddingClasses = variant === 'minimal' ? "px-1 py-1.5" : "px-3 py-1.5";

    return (
        <button
            onClick={toggleLanguage}
            className={`${baseClasses} ${paddingClasses} ${className}`}
            title={getTitle()}
            type="button"
        >
            {getLabel()}
        </button>
    );
};
