import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useGroupFilter } from '../../contexts/GroupFilterContext';
import { useGroups } from '../../hooks/useGroups';
import { useBirthdays } from '../../hooks/useBirthdays';
import { LogOut, FolderTree, Filter, Settings, ChevronDown, ChevronUp, Menu, Calculator, Bell, User } from 'lucide-react';
import { useTranslatedRootGroupName } from '../../utils/groupNameTranslator';
import { TenantSettings } from '../settings/TenantSettings';
import { GuestActivityModal } from '../modals/GuestActivityModal';
import { useLayoutContext } from '../../contexts/LayoutContext';
import { useGuestNotifications } from '../../contexts/GuestNotificationsContext';
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext';
import { CurrentDateDisplay } from '../common/CurrentDateDisplay';
import { GroupsPanel } from '../groups/GroupsPanel';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { Logo } from '../common/Logo';
import { useFocusTrap, useFocusReturn } from '../../hooks/useAccessibility';

export const Header: React.FC = () => {
  const { openAboutModal } = useLayoutContext();
  const { isNew } = useGuestNotifications();
  const { needsCalendarSetup, isInitializing } = useGoogleCalendar();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuestActivity, setShowGuestActivity] = useState(false);
  const [showGroupsPanel, setShowGroupsPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { selectedGroupIds, toggleGroupFilter, clearGroupFilters } = useGroupFilter();
  const { data: allGroups = [] } = useGroups();
  const { data: birthdays = [] } = useBirthdays();
  const filterRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);

  // Accessibility: Focus management for mobile menu
  const mobileMenuFocusRef = useFocusTrap(mobileMenuOpen, () => setMobileMenuOpen(false));
  useFocusReturn(mobileMenuOpen);

  // toggleLanguage removed - now using LanguageSwitcher component

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowGroupFilter(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      const clickedInDesktopMenu = userMenuRef.current?.contains(event.target as Node);
      const clickedInMobileMenu = mobileUserMenuRef.current?.contains(event.target as Node);
      if (!clickedInDesktopMenu && !clickedInMobileMenu) {
        setShowUserMenu(false);
      }
    }

    // Handle Escape key for non-trapped menus (filter, userMenu)
    // Note: mobileMenu uses useFocusTrap which handles Escape internally
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation(); // Prevent bubbling to parent components
        if (showUserMenu) setShowUserMenu(false);
        if (showGroupFilter) setShowGroupFilter(false);
      }
    }

    if (showGroupFilter || mobileMenuOpen || showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Only add Escape listener for non-trapped menus
    if (showUserMenu || showGroupFilter) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showGroupFilter, mobileMenuOpen, showUserMenu]);

  // Check if we're on a public page (terms, privacy) without user
  const isPublicPage = !user && (location.pathname === '/terms' || location.pathname === '/privacy');

  const countsByGroup = useMemo(() => {
    if (isPublicPage) return new Map<string, number>();
    const map = new Map<string, number>();
    birthdays.forEach((birthday) => {
      const groupIds = birthday.group_ids || (birthday.group_id ? [birthday.group_id] : []);
      groupIds.forEach((groupId) => {
        map.set(groupId, (map.get(groupId) ?? 0) + 1);
      });
    });
    return map;
  }, [birthdays, isPublicPage]);

  // Count guest-added birthdays for notification badge (only new ones)
  const guestBirthdaysCount = useMemo(() => {
    return birthdays.filter(b => b.created_by_guest === true && isNew(b.created_at)).length;
  }, [birthdays, isNew]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // If public page, show minimal header
  if (isPublicPage) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="flex flex-col items-start transition-opacity hover:opacity-80 -ms-1 pe-6"
                aria-label={t('common.home', 'HebBirthday.app - Home')}
              >
                <h1>
                  <Logo variant="app-header" />
                </h1>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 ms-auto">
                <LanguageSwitcher className="md:hidden" />
                <button
                  onClick={openAboutModal}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={t('common.menu')}
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 gap-1 sm:gap-4">
          {/* שמאל - כותרת ומידע */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-start transition-opacity hover:opacity-80 -ms-1 pe-2 sm:pe-6"
              aria-label={t('common.home', 'HebBirthday.app - Home')}
            >
              <h1>
                <Logo variant="app-header" />
              </h1>
            </button>
          </div>

          <div className="flex-1 flex justify-center min-w-0 mt-2">
            <CurrentDateDisplay />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 ms-auto md:hidden">
              {/* החלפת שפה + המבורגר - צמודים */}
              <div className="flex items-center gap-0.5 ps-1">
                <LanguageSwitcher variant="minimal" />
                <button
                  onClick={openAboutModal}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                  aria-label={t('common.menu')}
                >
                  <Menu className="w-5 h-5" />
                  {(needsCalendarSetup || isInitializing) && (
                    <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse ${
                      isInitializing ? 'bg-gray-300' : 'bg-amber-400'
                    }`}></span>
                  )}
                </button>
              </div>
              {/* אווטאר - שמאל */}
              {user && (
                <div className="relative" ref={mobileUserMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                    aria-label={t('common.userMenu', 'User menu')}
                  >
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.display_name || 'User'}
                        className="w-7 h-7 rounded-full object-cover border-2 border-gray-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>

                  {/* User Dropdown Menu - Mobile */}
                  {showUserMenu && (
                    <ul className="absolute top-full mt-2 end-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 min-w-[200px]" role="menu">
                      {/* פרטי משתמש */}
                      <li className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {user.photo_url ? (
                            <img
                              src={user.photo_url}
                              alt={user.display_name || 'User'}
                              className="w-9 h-9 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.display_name || t('common.user', 'משתמש')}
                            </p>
                            <p className="text-xs text-gray-500 truncate pointer-events-none select-none cursor-default">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </li>

                      {/* פעולות */}
                      <li role="none">
                        <button
                          onClick={() => {
                            setShowSettings(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors relative"
                          role="menuitem"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>{t('tenant.settings')}</span>
                          {(needsCalendarSetup || isInitializing) && (
                            <span className={`mr-auto w-2 h-2 rounded-full animate-pulse ${
                              isInitializing ? 'bg-gray-300' : 'bg-amber-400'
                            }`}></span>
                          )}
                        </button>
                      </li>

                      {/* מפריד */}
                      <li role="separator" aria-hidden="true" className="border-t border-gray-100 my-1"></li>

                      {/* התנתקות */}
                      <li role="none">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleSignOut();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('auth.signOut')}</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* תפריט ביניים (Tablet/Small Laptop) */}
            <div className="hidden sm:flex md:hidden relative" ref={mobileMenuRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                aria-expanded={mobileMenuOpen}
                aria-label={t('common.menu')}
              >
                <span className="text-sm font-medium text-gray-700">
                  {t('common.menu')}
                </span>
                {mobileMenuOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown Menu */}
              {mobileMenuOpen && (
                <ul ref={mobileMenuFocusRef as any} className="absolute top-full mt-2 end-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 w-64" role="menu">
                  {user && (
                    <li className="px-4 py-2 border-b border-gray-200 mb-2">
                      <span className="text-sm font-semibold text-gray-700 block truncate">
                        {user.display_name || user.email}
                      </span>
                    </li>
                  )}

                  {user && location.pathname === '/' && (
                    <li className="relative px-2">
                      <button
                        onClick={() => setShowGroupFilter(!showGroupFilter)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${selectedGroupIds.length > 0
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          <span>{t('groups.filterByGroup')}</span>
                        </div>
                        {selectedGroupIds.length > 0 ? (
                          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            {selectedGroupIds.length}
                          </span>
                        ) : (
                          <ChevronDown className={`w-3 h-3 transition-transform ${showGroupFilter ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {showGroupFilter && (
                        <div className="mt-1 pl-4 border-l-2 border-gray-100 ml-2">
                          <GroupFilterDropdown
                            allGroups={allGroups}
                            selectedGroupIds={selectedGroupIds}
                            toggleGroupFilter={toggleGroupFilter}
                            clearGroupFilters={clearGroupFilters}
                            countsByGroup={countsByGroup}
                            onClose={() => setShowGroupFilter(false)}
                            isMobile={true}
                          />
                        </div>
                      )}
                    </li>
                  )}

                  {user && (
                    <li role="none">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowGroupsPanel(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        <FolderTree className="w-4 h-4" />
                        <span>{t('groups.manageGroups')}</span>
                      </button>
                    </li>
                  )}

                  {user && (
                    <li role="none">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (location.pathname === '/gelt') {
                            navigate('/');
                          } else {
                            navigate('/gelt');
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${location.pathname === '/gelt'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        role="menuitem"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>{t('gelt.title')}</span>
                      </button>
                    </li>
                  )}

                  {user && (
                    <>
                      <li role="separator" aria-hidden="true" className="h-px bg-gray-100 my-1 mx-2"></li>
                      <li role="none">
                        <button
                          onClick={() => {
                            setShowGuestActivity(true);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm text-gray-700 hover:bg-gray-50 relative"
                          role="menuitem"
                        >
                          <Bell className="w-4 h-4" />
                          <span>{t('dashboard.guestNotifications', 'התראות אורחים')}</span>
                          {guestBirthdaysCount > 0 && (
                            <span className="mr-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                              {guestBirthdaysCount}
                            </span>
                          )}
                        </button>
                      </li>
                      <li role="none">
                        <button
                          onClick={() => {
                            setShowSettings(true);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm text-gray-700 hover:bg-gray-50 relative"
                          role="menuitem"
                        >
                          <Settings className="w-4 h-4" />
                          <span>{t('tenant.settings')}</span>
                          {(needsCalendarSetup || isInitializing) && (
                            <span className={`mr-auto w-2 h-2 rounded-full animate-pulse ${
                              isInitializing ? 'bg-gray-300' : 'bg-amber-400'
                            }`}></span>
                          )}
                        </button>
                      </li>
                      <li role="none">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm text-red-600 hover:bg-red-50"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('auth.signOut')}</span>
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2">
              {/* כפתור החלפת שפה - דסקטופ */}
              <LanguageSwitcher />

              {/* התראות אורחים - בצד ימין */}
              {user && (
              <button
                onClick={() => setShowGuestActivity(true)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('dashboard.guestNotifications', 'התראות אורחים')}
              >
                <Bell className="w-5 h-5" />
                {guestBirthdaysCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              )}

              {/* תפריט המבורגר - צמוד לאווטאר */}
              <button
                onClick={openAboutModal}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('common.menu')}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* תפריט משתמש עם אווטאר - בצד שמאל */}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                    aria-label={t('common.userMenu', 'User menu')}
                  >
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.display_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <ul className="absolute top-full mt-2 end-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 min-w-[220px]" role="menu">
                      {/* פרטי משתמש */}
                      <li className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {user.photo_url ? (
                            <img
                              src={user.photo_url}
                              alt={user.display_name || 'User'}
                              className="w-10 h-10 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.display_name || t('common.user', 'משתמש')}
                            </p>
                            <p className="text-xs text-gray-500 truncate pointer-events-none select-none cursor-default">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </li>

                      {/* פעולות */}
                      <li role="none">
                        <button
                          onClick={() => {
                            setShowSettings(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors relative"
                          role="menuitem"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>{t('tenant.settings')}</span>
                          {(needsCalendarSetup || isInitializing) && (
                            <span className={`mr-auto w-2 h-2 rounded-full animate-pulse ${
                              isInitializing ? 'bg-gray-300' : 'bg-amber-400'
                            }`}></span>
                          )}
                        </button>
                      </li>

                      {/* מפריד */}
                      <li role="separator" aria-hidden="true" className="border-t border-gray-100 my-1"></li>

                      {/* התנתקות */}
                      <li role="none">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleSignOut();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('auth.signOut')}</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSettings && <TenantSettings onClose={() => setShowSettings(false)} />}
      {showGuestActivity && (
        <GuestActivityModal
          isOpen={showGuestActivity}
          onClose={() => setShowGuestActivity(false)}
          birthdays={birthdays}
        />
      )}
      {showGroupsPanel && (
        <GroupsPanel
          isModal={true}
          onClose={() => setShowGroupsPanel(false)}
        />
      )}
    </header>
  );
};

interface GroupFilterDropdownProps {
  allGroups: any[];
  selectedGroupIds: string[];
  toggleGroupFilter: (id: string) => void;
  clearGroupFilters: () => void;
  countsByGroup: Map<string, number>;
  onClose: () => void;
  isMobile?: boolean;
}

const GroupFilterDropdown: React.FC<GroupFilterDropdownProps> = ({
  allGroups,
  selectedGroupIds,
  toggleGroupFilter,
  clearGroupFilters,
  countsByGroup,
  onClose,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const rootGroups = allGroups.filter(g => g.is_root);
  const childGroups = allGroups.filter(g => !g.is_root);

  const RootGroupLabel: React.FC<{ root: any }> = ({ root }) => {
    const translatedName = useTranslatedRootGroupName(root);
    return <span className="text-xs font-semibold text-gray-500 uppercase">{translatedName}</span>;
  };

  const containerClasses = isMobile
    ? "relative w-full bg-gray-50 rounded-lg mt-1"
    : "absolute top-full mt-2 start-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[280px] max-h-[400px] overflow-y-auto";

  return (
    <div className={containerClasses}>
      {!isMobile && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {t('groups.filterByGroup')}
          </span>
          {selectedGroupIds.length > 0 && (
            <button
              onClick={() => {
                clearGroupFilters();
                onClose();
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('common.clear', 'נקה הכל')}
            </button>
          )}
        </div>
      )}

      <ul className="py-2" aria-label={t('groups.filterByGroup')} role="menu">
        {rootGroups.map((root) => {
          const children = childGroups.filter(c => c.parent_id === root.id);
          if (children.length === 0) return null;

          return (
            <li key={root.id} className="mb-2" role="none">
              <div className="px-4 py-1 flex items-center gap-2" role="presentation">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: root.color }}
                />
                <RootGroupLabel root={root} />
              </div>
              {children.map((group) => {
                const count = countsByGroup.get(group.id) ?? 0;
                return (
                  <button
                    key={group.id}
                    onClick={() => toggleGroupFilter(group.id)}
                    className={`w-full px-6 py-2 text-start hover:bg-gray-50 flex items-center justify-between ${selectedGroupIds.includes(group.id) ? 'bg-blue-50' : ''
                      }`}
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">{group.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        ({count})
                      </span>
                    </div>
                    {selectedGroupIds.includes(group.id) && (
                      <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
