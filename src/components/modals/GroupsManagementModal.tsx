import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Users } from 'lucide-react';
import { GroupsPanel } from '../groups/GroupsPanel';
import { FloatingBackButton } from '../common/FloatingBackButton';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../common/Toast';

interface GroupsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupsManagementModal: React.FC<GroupsManagementModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isHebrew = i18n.language === 'he';
  const { toasts, hideToast } = useToast();

  if (!isOpen) return null;

  return (
    <>
      <Toast toasts={toasts} onDismiss={hideToast} />
      <FloatingBackButton
        onClick={onClose}
        position={isHebrew ? 'bottom-left' : 'bottom-right'}
        className="z-[60]"
      />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-sm sm:max-w-2xl md:max-w-4xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t('groups.manageGroups')}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">{t('groups.manageDescription')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <GroupsPanel isModal={true} />
        </div>
      </div>
    </>
  );
};
