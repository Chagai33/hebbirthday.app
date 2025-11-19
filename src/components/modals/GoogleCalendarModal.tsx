import React from 'react';
import { X } from 'lucide-react';
import { GoogleCalendarButton } from '../calendar/GoogleCalendarButton';
import { useTranslation } from 'react-i18next';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t('googleCalendar.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600 text-center">
            {t('googleCalendar.modalDescription')}
          </p>
          <div className="w-full flex justify-center">
             <GoogleCalendarButton />
          </div>
        </div>
      </div>
    </div>
  );
};

