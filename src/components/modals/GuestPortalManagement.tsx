import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Gift, Link as LinkIcon, MessageCircle, ChevronDown, ChevronUp, Users, Check } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useGroups, useUpdateGroup } from '../../hooks/useGroups';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../common/Toast';
import { FloatingBackButton } from '../common/FloatingBackButton';
import { logger } from '../../utils/logger';

interface GuestPortalManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestPortalManagement: React.FC<GuestPortalManagementProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isHebrew = i18n.language === 'he';
  const { currentTenant, updateTenant } = useTenant();
  const { data: groups = [] } = useGroups();
  const updateGroup = useUpdateGroup();
  const { toasts, hideToast, success, error } = useToast();

  const [isGuestPortalEnabled, setIsGuestPortalEnabled] = useState(
    currentTenant?.is_guest_portal_enabled ?? true
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showGroupExceptions, setShowGroupExceptions] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Generate portal URL
  const portalUrl = currentTenant 
    ? `${window.location.origin}/portal`
    : '';

  const handleSave = async () => {
    if (!currentTenant) return;

    setIsSaving(true);
    try {
      await updateTenant(currentTenant.id, {
        is_guest_portal_enabled: isGuestPortalEnabled,
      });
      success(t('messages.tenantUpdated'));
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      error(t('common.error'));
      logger.error('Error updating tenant settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGroupToggle = async (groupId: string, currentValue: boolean | undefined) => {
    const newValue = currentValue === false ? true : false;
    
    try {
      await updateGroup.mutateAsync({
        groupId: groupId,
        data: { is_guest_portal_enabled: newValue }
      });
    } catch (err) {
      logger.error('Error updating group portal access:', err);
      error(t('common.error'));
    }
  };

  const getMessage = () => {
    return isHebrew
      ? `שלום! 👋\n\nאשמח אם תוכל/י לעדכן את רשימת המשאלות שלך לקראת יום ההולדת.\n\nניתן לגשת לפורטל דרך הקישור הזה:\n${portalUrl}\n\nתודה! 🎁`
      : `Hi! 👋\n\nI'd appreciate it if you could update your wishlist for your upcoming birthday.\n\nYou can access the portal through this link:\n${portalUrl}\n\nThank you! 🎁`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopiedLink(true);
      success(t('guestPortal.linkCopied', 'הקישור הועתק!'));
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      error(t('common.error'));
      logger.error('Error copying link:', err);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(getMessage());
      setCopiedMessage(true);
      success(t('guestPortal.messageCopied', 'ההודעה הועתקה!'));
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (err) {
      error(t('common.error'));
      logger.error('Error copying message:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getMessage())}`;
    window.open(whatsappUrl, '_blank');
  };

  // Sort groups: Parents first, then alphabetically
  const sortedGroups = [...groups].sort((a, b) => {
    if (!a.parent_id && b.parent_id) return -1;
    if (a.parent_id && !b.parent_id) return 1;
    return a.name.localeCompare(b.name);
  });

  if (!isOpen || !currentTenant) return null;

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
          className="bg-white rounded-2xl shadow-2xl max-w-sm sm:max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t('guestPortal.title', 'פורטל מתנות לאורחים')}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">{currentTenant.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Description */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-900">
                {t('guestPortal.description', 'שתף את הקישור עם בני משפחה וחברים כדי לאפשר להם לנהל את רשימות המשאלות שלהם לקראת ימי ההולדת.')}
              </p>
            </div>

            {/* Share Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">
                {t('guestPortal.shareLink', 'שיתוף הקישור')}
              </h3>
              
              {/* Link Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">{t('guestPortal.portalLink', 'קישור לפורטל')}:</p>
                <p className="text-sm text-gray-700 break-all font-mono" dir="ltr">{portalUrl}</p>
              </div>

              {/* Action Icons */}
              <div className="flex items-center justify-center gap-3">
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    copiedLink
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                  }`}
                  title={t('guestPortal.copyLink', 'העתק קישור')}
                >
                  {copiedLink ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <LinkIcon className="w-6 h-6" />
                  )}
                  <span className="text-xs font-medium">
                    {copiedLink ? t('common.copied', 'הועתק') : t('guestPortal.copyLink', 'קישור')}
                  </span>
                </button>

                {/* Copy Message */}
                <button
                  onClick={handleCopyMessage}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    copiedMessage
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
                  }`}
                  title={t('guestPortal.copyMessage', 'העתק הודעה')}
                >
                  {copiedMessage ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <MessageCircle className="w-6 h-6" />
                  )}
                  <span className="text-xs font-medium">
                    {copiedMessage ? t('common.copied', 'הועתק') : t('guestPortal.copyMessage', 'הודעה')}
                  </span>
                </button>

                {/* WhatsApp Share */}
                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition-all"
                  title={t('guestPortal.shareWhatsApp', 'שתף בוואטסאפ')}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-xs font-medium">{t('guestPortal.whatsapp', 'וואטסאפ')}</span>
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                {t('guestPortal.shareHint', 'הקישור כולל הודעה מוכנה עם הסבר קצר')}
              </p>
            </div>

            {/* Portal Access Settings */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('guestPortal.accessSettings', 'הגדרות גישה לפורטל')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('guestPortal.accessDescription', 'אפשר לאורחים לגשת ולנהל את המשאלות שלהם דרך הפורטל הציבורי.')}
                  </p>
                </div>
                <button
                  onClick={() => setIsGuestPortalEnabled(!isGuestPortalEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isGuestPortalEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isGuestPortalEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Group-level Exceptions */}
              {isGuestPortalEnabled && groups.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowGroupExceptions(!showGroupExceptions)}
                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('guestPortal.groupPermissions', 'ניהול הרשאות לפי קבוצות')}
                    </span>
                    {showGroupExceptions ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showGroupExceptions && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {sortedGroups.map((group) => {
                        const isEnabled = group.is_guest_portal_enabled !== false;
                        return (
                          <div
                            key={group.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: group.color || '#999' }}
                              />
                              <span className="text-sm text-gray-700 truncate">
                                {group.name}
                              </span>
                            </div>
                            <button
                              onClick={() => handleGroupToggle(group.id, group.is_guest_portal_enabled)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  isEnabled ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('common.saving', 'שומר...')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{t('common.saveChanges', 'שמור שינויים')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

