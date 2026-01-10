import React, { useState, useMemo, useRef } from 'react';
import { X, Gift, Calculator, Bell, BookOpen, Users, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGuestNotifications } from '../../contexts/GuestNotificationsContext';
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext';
import { useBirthdays } from '../../hooks/useBirthdays';
import { FloatingBackButton } from '../common/FloatingBackButton';
import { TenantSettings } from '../settings/TenantSettings';
import { Logo } from '../common/Logo';
import { InfoModal } from './InfoModal';
import { GuestActivityModal } from './GuestActivityModal';
import { GoogleCalendarModal } from './GoogleCalendarModal';
import { GuestPortalManagement } from './GuestPortalManagement';
import { GroupsPanel } from '../groups/GroupsPanel';
import { useFocusTrap, useFocusReturn } from '../../hooks/useAccessibility';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isNew } = useGuestNotifications();
  const { needsCalendarSetup } = useGoogleCalendar();
  const { data: birthdays = [] } = useBirthdays();
  const [showSettings, setShowSettings] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showGuestActivity, setShowGuestActivity] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showGuestPortalManagement, setShowGuestPortalManagement] = useState(false);
  const [showGroupsPanel, setShowGroupsPanel] = useState(false);

  // Handle Space key for Link components
  const handleSpaceKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).click();
    }
  };

  // Refs for buttons that open nested modals  
  const quickGuideButtonRef = useRef<HTMLButtonElement>(null);
  const guestActivityButtonRef = useRef<HTMLButtonElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  // Accessibility: Focus management
  const modalFocusRef = useFocusTrap(isOpen, onClose);
  useFocusReturn(isOpen); // Will work correctly with the improved hook

  // Count guest-added birthdays for notification badge
  const guestBirthdaysCount = useMemo(() => {
    return birthdays.filter(b =>
      Boolean(b.created_by_guest) === true &&
      b.created_at &&
      isNew(b.created_at)
    ).length;
  }, [birthdays, isNew]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div ref={modalFocusRef} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[calc(100vh-2rem)] animate-slide-in relative flex flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="about-modal-title">
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-3 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 pb-0">
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-2">
              <div id="about-modal-title">
                <Logo variant="app-header" />
              </div>
              <p className="text-sm text-gray-500">
                {t('common.developedBy')} <a
                  href="https://www.linkedin.com/in/chagai-yechiel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {i18n.language === 'he' ? 'חגי יחיאל' : 'Chagai Yechiel'}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <ul className="flex flex-col gap-2 pt-4 border-t border-gray-100" role="list">
            {/* ניהול קבוצות */}
            {user && (
              <li>
                <button
                  onClick={() => {
                    setShowGroupsPanel(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-start focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label={t('groups.manageGroups')}
                >
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">{t('groups.manageGroups')}</span>
                </button>
              </li>
            )}

            {/* התראות אורחים */}
            {user && (
              <li>
                <button
                  ref={guestActivityButtonRef}
                  onClick={() => {
                    setShowGuestActivity(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-start relative focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label={t('dashboard.guestNotifications')}
                >
                  <Bell className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">{t('dashboard.guestNotifications')}</span>
                  {guestBirthdaysCount > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {guestBirthdaysCount}
                    </span>
                  )}
                </button>
              </li>
            )}

            {/* חיבור ליומן גוגל */}
            {user && (
              <li>
                <button
                  ref={calendarButtonRef}
                  onClick={() => setShowCalendarModal(true)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-start relative focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label={t('googleCalendar.connect')}
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">{t('googleCalendar.connect')}</span>
                  {needsCalendarSetup && (
                    <span className="mr-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                  )}
                </button>
              </li>
            )}

            {/* פורטל המתנות */}
            {user && (
              <li>
                <button
                  onClick={() => {
                    setShowGuestPortalManagement(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-start focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label={t('guestPortal.manage')}
                >
                  <Gift className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">{t('guestPortal.manage')}</span>
                </button>
              </li>
            )}

            {/* דמי חנוכה/פורים */}
            {user && (
              <li>
                <Link
                  to="/gelt"
                  onClick={onClose}
                  onKeyDown={handleSpaceKey}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label={t('gelt.title')}
                >
                  <Calculator className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">{t('gelt.title')}</span>
                </Link>
              </li>
            )}

            {/* Divider לפני המדריכים */}
            <li><div className="h-px bg-gray-100 my-2" /></li>

            {/* מדריך מקוצר */}
            <li>
              <button
                ref={quickGuideButtonRef}
                onClick={() => setShowInfoModal(true)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-start focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label={t('common.quickGuide')}
              >
                <BookOpen className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium">{t('common.quickGuide')}</span>
              </button>
            </li>

            {/* המדריך המלא */}
            <li>
              <Link
                to="/guide"
                onClick={onClose}
                onKeyDown={handleSpaceKey}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label={t('common.fullGuide')}
              >
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">{t('common.fullGuide')}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs text-gray-500 mb-3">
            <Link
              to="/terms"
              onClick={onClose}
              onKeyDown={handleSpaceKey}
              className="hover:text-gray-700 transition-colors"
            >
              {t('footer.termsOfUse')}
            </Link>
            <span>•</span>
            <Link
              to="/privacy"
              onClick={onClose}
              onKeyDown={handleSpaceKey}
              className="hover:text-gray-700 transition-colors"
            >
              {t('footer.privacyPolicy')}
            </Link>
            <span>•</span>
            <Link
              to="/accessibility"
              onClick={onClose}
              onKeyDown={handleSpaceKey}
              className="hover:text-gray-700 transition-colors"
            >
              {t('footer.accessibility', 'הצהרת נגישות')}
            </Link>
            <span>•</span>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf4M-3ytbYRAOIh9B7Bavgaw2WyGgDFP3PT7zgTmTMnUFXMrg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              {t('footer.feedback')}
            </a>
          </div>
          <div className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} All rights reserved
          </div>
        </div>
      </div>
      <FloatingBackButton onClick={onClose} position="bottom-left" />
      {showSettings && (
        <div onClick={(e) => e.stopPropagation()}>
          <TenantSettings onClose={() => {
            setShowSettings(false);
            onClose(); // Close the parent modal as well to return to main screen
          }} />
        </div>
      )}
      <InfoModal 
        isOpen={showInfoModal} 
        onClose={() => {
          setShowInfoModal(false);
          // The useFocusReturn hook in InfoModal will handle focus return to the button
        }} 
      />
      <GuestActivityModal 
        isOpen={showGuestActivity} 
        onClose={() => {
          setShowGuestActivity(false);
        }}
        birthdays={birthdays}
      />
      <GoogleCalendarModal 
        isOpen={showCalendarModal} 
        onClose={() => {
          setShowCalendarModal(false);
        }}
      />
      {showGuestPortalManagement && (
        <div onClick={(e) => e.stopPropagation()}>
          <GuestPortalManagement
            isOpen={showGuestPortalManagement}
            onClose={() => {
              setShowGuestPortalManagement(false);
            }}
          />
        </div>
      )}
      {showGroupsPanel && (
        <div onClick={(e) => e.stopPropagation()}>
          <GroupsPanel
            isModal={true}
            onClose={() => {
              setShowGroupsPanel(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
