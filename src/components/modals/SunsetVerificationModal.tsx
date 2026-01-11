import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sunset } from 'lucide-react';
import { useFocusTrap, useFocusReturn } from '../../hooks/useAccessibility';

interface SunsetVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (afterSunset: boolean) => void;
}

export const SunsetVerificationModal: React.FC<SunsetVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  // Accessibility: Focus management
  const modalFocusRef = useFocusTrap(isOpen, onClose);
  useFocusReturn(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalFocusRef} className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-6" role="dialog" aria-modal="true" aria-labelledby="sunset-modal-title">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Sunset className="w-6 h-6 text-orange-600" />
            </div>
            <h2 id="sunset-modal-title" className="text-xl font-bold text-gray-900">
              {t('modals.sunsetVerification.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-2">
          {t('modals.sunsetVerification.message')}
        </p>

        <p className="text-sm text-gray-500 mb-6">
          {t('modals.sunsetVerification.explanation')}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(false)}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            {t('common.no')}
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            {t('common.yes')}
          </button>
        </div>
      </div>
    </div>
  );
};
