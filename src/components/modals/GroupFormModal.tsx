import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateGroup, useUpdateGroup } from '../../hooks/useGroups';
import { useToast } from '../../hooks/useToast';
import { Group } from '../../types';
import { Globe, X } from 'lucide-react';
import { useFocusTrap, useFocusReturn } from '../../hooks/useAccessibility';
import { getTranslatedGroupName } from '../../utils/groupNameTranslator';

const GROUP_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
];

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup?: Group | null;
  parentId?: string;
  allGroups?: Group[];
}

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  editingGroup,
  parentId,
  allGroups = [],
}) => {
  // Accessibility: Focus management - must be called before all other hooks
  const modalFocusRef = useFocusTrap(isOpen, onClose);
  useFocusReturn(isOpen);

  const { t } = useTranslation();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const { success, error } = useToast();

  // Pre-compute parent group info for conditional rendering
  const parentGroup = parentId ? allGroups.find(g => g.id === parentId) : null;
  const parentGroupName = parentGroup ? getTranslatedGroupName(parentGroup, t) : '';
  const isParentPortalDisabled = parentGroup ? parentGroup.is_guest_portal_enabled === false : false;

  const [formData, setFormData] = useState<{
    name: string;
    color: string;
    calendarPreference?: 'gregorian' | 'hebrew' | 'both';
    isGuestPortalEnabled: boolean;
  }>({
    name: '',
    color: GROUP_COLORS[0],
    calendarPreference: 'both',
    isGuestPortalEnabled: true,
  });

  // Initialize form data when modal opens or editing group changes
  useEffect(() => {
    if (isOpen) {
      if (editingGroup) {
        setFormData({
          name: editingGroup.name,
          color: editingGroup.color,
          calendarPreference: editingGroup.calendar_preference || 'both',
          isGuestPortalEnabled: editingGroup.is_guest_portal_enabled ?? true,
        });
      } else {
        setFormData({
          name: '',
          color: GROUP_COLORS[0],
          calendarPreference: 'both',
          isGuestPortalEnabled: true,
        });
      }
    }
  }, [isOpen, editingGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingGroup) {
        await updateGroup.mutateAsync({
          groupId: editingGroup.id,
          data: {
            ...formData,
            is_guest_portal_enabled: formData.isGuestPortalEnabled,
          },
        });
        success(t('groups.groupUpdated'));
      } else if (parentId) {
        await createGroup.mutateAsync({
          name: formData.name,
          parentId: parentId,
          color: formData.color,
          calendarPreference: formData.calendarPreference,
          is_guest_portal_enabled: formData.isGuestPortalEnabled,
        });
        success(t('groups.groupCreated'));
      }
      onClose();
    } catch (err) {
      error(t('common.error'));
      console.error('Error saving group:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div
        ref={modalFocusRef}
        className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[calc(100vh-2rem)] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-form-title"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3
            id="group-form-title"
            className="text-base sm:text-lg md:text-xl font-bold text-gray-900"
          >
            {editingGroup ? t('groups.editGroup') : t('groups.addGroup')}
          </h3>
          <button
            onClick={onClose}
            className="p-3 sm:p-3 text-gray-500 hover:text-gray-600 rounded-lg transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              {t('groups.groupName')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('groups.groupName')}
              required
              autoFocus
              aria-describedby="group-name-description"
            />
            <p id="group-name-description" className="sr-only">
              {t('groups.groupNameDescription', 'Enter a name for the group')}
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              {t('groups.groupColor')}
            </label>
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-full aspect-square rounded-md sm:rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`${t('groups.groupColor')}: ${color}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              {t('birthday.calendarPreference')}
            </label>
            <select
              value={formData.calendarPreference}
              onChange={(e) => setFormData({ ...formData, calendarPreference: e.target.value as 'gregorian' | 'hebrew' | 'both' })}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-describedby="calendar-preference-description"
            >
              <option value="both">{t('birthday.both')}</option>
              <option value="gregorian">{t('birthday.gregorianOnly')}</option>
              <option value="hebrew">{t('birthday.hebrewOnly')}</option>
            </select>
            <p id="calendar-preference-description" className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {t('groups.preferenceExplanation')}
            </p>
          </div>

          {/* Guest Portal Toggle */}
          <div className={`flex items-start gap-3 border rounded-lg p-3 ${
            isParentPortalDisabled ? "bg-amber-50 border-amber-200" : "bg-purple-50 border-purple-100"
          }`}>
              <div className={`mt-0.5 ${
                isParentPortalDisabled ? "text-amber-600" : "text-purple-600"
              }`}>
                  <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1">
                  <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-900">
                          {t('groups.guestPortalAccess', 'Guest Portal Access')}
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={formData.isGuestPortalEnabled}
                              onChange={(e) => setFormData({ ...formData, isGuestPortalEnabled: e.target.checked })}
                              aria-describedby="guest-portal-description"
                          />
                              <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                            isParentPortalDisabled ? "peer-focus:ring-amber-300 peer-checked:bg-amber-500" : "peer-focus:ring-purple-300 peer-checked:bg-purple-600"
                          }`}></div>
                      </label>
                  </div>

                  {/* Description / Warning */}
                  {isParentPortalDisabled ? (
                    <p id="guest-portal-description" className="text-xs text-amber-700 mt-1 font-medium">
                      ⚠️ גישה חסומה: קבוצת האב ({parentGroupName}) חוסמת גישה לפורטל. הפעלת המתג תהיה אפקטיבית רק כשהאב יופעל.
                    </p>
                  ) : (
                    <p id="guest-portal-description" className="text-xs text-gray-500 mt-1">
                      {t('groups.guestPortalDescription', 'Allow access to birthdays in this group via the guest portal.')}
                    </p>
                  )}
              </div>
          </div>

          <div className="flex gap-2 sm:gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={createGroup.isPending || updateGroup.isPending}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createGroup.isPending || updateGroup.isPending
                ? t('common.loading')
                : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
