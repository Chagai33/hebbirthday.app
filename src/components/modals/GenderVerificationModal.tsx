import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Users } from 'lucide-react';
import { Gender } from '../../types';
import { useFocusTrap, useFocusReturn } from '../../hooks/useAccessibility';

interface GenderVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (gender: Gender) => void;
}

export const GenderVerificationModal: React.FC<GenderVerificationModalProps> = ({
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
      <div ref={modalFocusRef} className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-6" role="dialog" aria-modal="true" aria-labelledby="gender-modal-title">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 id="gender-modal-title" className="text-xl font-bold text-gray-900">
              {t('modals.genderVerification.title')}
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

        <p className="text-gray-600 mb-6">
          {t('modals.genderVerification.message')}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onConfirm('male')}
            className="w-full px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 font-medium transition-colors text-start"
          >
            {t('common.male')}
          </button>
          <button
            onClick={() => onConfirm('female')}
            className="w-full px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 font-medium transition-colors text-start"
          >
            {t('common.female')}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};
