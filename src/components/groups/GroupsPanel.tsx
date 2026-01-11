import { logger } from "../../utils/logger";
import { Fragment, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useNavigate } from 'react-router-dom';
import { useGroups, useDeleteGroup, useInitializeRootGroups } from '../../hooks/useGroups';
import { useBirthdays } from '../../hooks/useBirthdays';
import { groupService } from '../../services/group.service';
import { Layout } from '../layout/Layout';
import { Group, GroupType } from '../../types';
import { Plus, Edit, Trash2, X, ArrowRight, ArrowLeft, Share2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { DeleteGroupModal } from '../modals/DeleteGroupModal';
import { ShareGroupModal } from '../modals/ShareGroupModal';
import { GroupFormModal } from '../modals/GroupFormModal';
import { useTranslatedRootGroupName } from '../../utils/groupNameTranslator';
import { FloatingBackButton } from '../common/FloatingBackButton';
import { useFocusTrap, useFocusReturn } from '../../hooks/useAccessibility';

interface RootGroupButtonProps {
  rootGroup: Group;
  isActive: boolean;
  childGroupsCount: number;
  onClick: () => void;
  t: TFunction;
}

const RootGroupButton: React.FC<RootGroupButtonProps> = ({ rootGroup, isActive, childGroupsCount, onClick, t }) => {
  const translatedName = useTranslatedRootGroupName(rootGroup);
  
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-0.5 p-3 sm:p-3 rounded-lg border-2 transition-all shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        isActive
          ? 'border-transparent text-white shadow-md scale-105'
          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white/80 backdrop-blur-sm'
      }`}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${rootGroup.color}, ${rootGroup.color}e6)`
          : `${rootGroup.color}10`,
      }}
      aria-label={`${translatedName} (${childGroupsCount} ${t('groups.subgroups', 'subgroups')})`}
    >
      <div 
        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
          isActive ? 'bg-white/20' : 'bg-white'
        }`}
        style={isActive ? {} : { backgroundColor: `${rootGroup.color}20` }}
      >
        <div
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
          style={{ backgroundColor: rootGroup.color }}
        />
      </div>
      <span className={`font-semibold text-[10px] sm:text-xs text-center leading-tight ${isActive ? 'text-white' : 'text-gray-900'}`}>
        {translatedName}
      </span>
      <span className={`text-[7px] sm:text-[8px] ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
        ({childGroupsCount})
      </span>
    </button>
  );
};

interface GroupsPanelProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const GroupsPanel: React.FC<GroupsPanelProps> = ({ isModal = false, onClose }) => {
  // Accessibility: Focus management for modal - must be called before all other hooks
  const modalFocusRef = useFocusTrap(isModal, onClose || (() => {}));
  useFocusReturn(isModal);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: allGroups = [], isLoading } = useGroups();
  const { data: birthdays = [], isLoading: isBirthdaysLoading } = useBirthdays();
  const deleteGroup = useDeleteGroup();
  const initializeRootGroups = useInitializeRootGroups();
  const { success, error } = useToast();

  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<{ id: string; name: string; tenant_id: string } | null>(null);
  const [sharingGroup, setSharingGroup] = useState<Group | null>(null);
  const [deleteRecordCount, setDeleteRecordCount] = useState(0);

  const rootGroups = useMemo(() => {
    const order: Record<GroupType, number> = {
      family: 0,
      friends: 1,
      work: 2,
    };

    return allGroups
      .filter(group => group.is_root)
      .sort((a, b) => {
        const orderA = a.type ? order[a.type] ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
        const orderB = b.type ? order[b.type] ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return a.name.localeCompare(b.name);
      });
  }, [allGroups]);

  const childGroupsMap = useMemo(() => {
    const map = new Map<string, Group[]>();
    allGroups
      .filter(group => !group.is_root && group.parent_id)
      .forEach(group => {
        const parentId = group.parent_id as string;
        const list = map.get(parentId) ?? [];
        list.push(group);
        map.set(parentId, list);
      });

    for (const [parentId, groups] of map.entries()) {
      groups.sort((a, b) => a.name.localeCompare(b.name));
      map.set(parentId, groups);
    }

    return map;
  }, [allGroups]);

  const countsByGroup = useMemo(() => {
    const map = new Map<string, number>();
    birthdays.forEach((birthday) => {
      const groupIds = birthday.group_ids || (birthday.group_id ? [birthday.group_id] : []);
      groupIds.forEach((groupId) => {
        map.set(groupId, (map.get(groupId) ?? 0) + 1);
      });
    });
    return map;
  }, [birthdays]);

  useEffect(() => {
    if (!activeRootId && rootGroups.length > 0) {
      const defaultGroup =
        rootGroups.find(group => group.type === 'family') ??
        rootGroups[0];
      setActiveRootId(defaultGroup.id);
      return;
    }

    if (activeRootId && rootGroups.length > 0) {
      const exists = rootGroups.some(group => group.id === activeRootId);
      if (!exists) {
        const fallbackGroup =
          rootGroups.find(group => group.type === 'family') ??
          rootGroups[0];
        setActiveRootId(fallbackGroup.id);
      }
    }
  }, [rootGroups, activeRootId]);

  useEffect(() => {
    if (rootGroups.length === 0 && allGroups.length === 0 && !isLoading && !initializeRootGroups.isPending) {
      initializeRootGroups.mutate('he');
    }
  }, [rootGroups.length, allGroups.length, isLoading, initializeRootGroups]);

  const handleOpenForm = (parentId: string, group?: Group) => {
    setEditingGroup(group || null);
    setSelectedParentId(parentId);
  };

  const handleCloseForm = () => {
    setEditingGroup(null);
    setSelectedParentId(null);
  };

  const handleDeleteClick = async (group: Group) => {
    try {
      const count = await groupService.getGroupBirthdaysCount(group.id, group.tenant_id);
      setDeleteRecordCount(count);
      setDeletingGroup({ id: group.id, name: group.name, tenant_id: group.tenant_id });
    } catch (err) {
      error(t('common.error'));
      logger.error('Error getting birthdays count:', err);
    }
  };

  const handleDeleteConfirm = async (deleteBirthdays: boolean) => {
    if (!deletingGroup) return;

    try {
      await deleteGroup.mutateAsync({
        groupId: deletingGroup.id,
        tenantId: deletingGroup.tenant_id,
        deleteBirthdays,
      });
      success(t('groups.groupDeleted'));
      setDeletingGroup(null);
    } catch (err) {
      error(t('common.error'));
      logger.error('Error deleting group:', err);
    }
  };

  if (isLoading) {
    if (isModal) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const content = (
    <div className={`space-y-1.5 sm:space-y-2.5 ${isModal ? 'pb-4' : 'pb-24 sm:pb-0'}`}>
      {!isModal && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">{t('groups.manageGroups')}</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{t('groups.manageDescription')}</p>
          </div>
          {/* Desktop Back Button */}
          <button
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors shadow-sm flex-shrink-0"
          >
            {i18n.language === 'he' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            <span className="hidden sm:inline">{t('common.back')}</span>
          </button>
        </div>
      )}

      {/* Mobile Floating Back Button - Only if not modal */}
      {!isModal && (
        <FloatingBackButton 
          onClick={() => navigate('/')} 
          position="bottom-left"
        />
      )}

      {rootGroups.length > 0 ? (
          <Fragment>
            {/* קבוצות העל - Grid responsive עם מספר עמודות משתנה לפי גודל המסך */}
            <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 sm:gap-2" role="list">
              {rootGroups.map((rootGroup) => {
                const isActive = rootGroup.id === activeRootId;
                const childGroups = childGroupsMap.get(rootGroup.id) ?? [];
                return (
                  <li key={rootGroup.id}>
                    <RootGroupButton
                      rootGroup={rootGroup}
                      isActive={isActive}
                      childGroupsCount={childGroups.length}
                      onClick={() => setActiveRootId(rootGroup.id)}
                      t={t}
                    />
                  </li>
                );
              })}
            </ul>

            {activeRootId && (
              <>
                <CategorySection
                  key={activeRootId}
                  rootGroup={rootGroups.find(group => group.id === activeRootId)!}
                  childGroups={childGroupsMap.get(activeRootId) ?? []}
                  isLoading={isLoading}
                  isCountsLoading={isBirthdaysLoading}
                  countsByGroup={countsByGroup}
                  onAddGroup={() => handleOpenForm(activeRootId)}
                  onEditGroup={(group) => handleOpenForm(activeRootId, group)}
                  onDeleteGroup={handleDeleteClick}
                  onShareGroup={(group) => setSharingGroup(group)}
                />
                
                {/* כפתור הוספה במובייל - FloatingDock style */}
                <div className="fixed bottom-6 right-6 z-40 sm:hidden">
                  <button
                    onClick={() => handleOpenForm(activeRootId)}
                    className="p-4 bg-white/80 backdrop-blur-md border border-white/30 rounded-full shadow-xl hover:bg-white/90 transition-all active:scale-95 ring-1 ring-black/5"
                    style={{ 
                      backgroundColor: rootGroups.find(g => g.id === activeRootId)?.color + 'CC' || 'rgba(59, 130, 246, 0.8)',
                      borderColor: rootGroups.find(g => g.id === activeRootId)?.color || '#3b82f6'
                    }}
                    aria-label={t('groups.addGroup')}
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </div>
              </>
            )}
          </Fragment>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 sm:p-8 text-center text-gray-600">
            <p className="text-sm sm:text-base">{t('groups.noRootGroups')}</p>
          </div>
        )}

        <GroupFormModal
          isOpen={!!(editingGroup !== null || selectedParentId)}
          onClose={handleCloseForm}
          editingGroup={editingGroup}
          parentId={selectedParentId || undefined}
          allGroups={allGroups}
        />

        <DeleteGroupModal
          isOpen={!!deletingGroup}
          onClose={() => setDeletingGroup(null)}
          onConfirm={handleDeleteConfirm}
          groupName={deletingGroup?.name || ''}
          recordCount={deleteRecordCount}
        />

        {sharingGroup && (
          <ShareGroupModal
            group={sharingGroup}
            onClose={() => setSharingGroup(null)}
          />
        )}
    </div>
  );

  if (isModal) {
    return (
      <>
        <FloatingBackButton
          onClick={onClose || (() => {})}
          position={i18n.language === 'he' ? 'bottom-left' : 'bottom-right'}
          className="z-[60]"
        />
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
          <div
            ref={modalFocusRef}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="groups-panel-title"
          >
            <div className="sticky top-0 bg-white z-10 px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 id="groups-panel-title" className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('groups.manageGroups')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-600 transition-colors p-3 hover:bg-gray-100 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-3 sm:p-6">
              {content}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <Layout>
      {content}
    </Layout>
  );
};

interface CategorySectionProps {
  rootGroup: Group;
  childGroups: Group[];
  isLoading: boolean;
  isCountsLoading: boolean;
  countsByGroup: Map<string, number>;
  onAddGroup: () => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (group: Group) => void;
  onShareGroup: (group: Group) => void;
}

const CategorySection = ({
  rootGroup,
  childGroups,
  isLoading,
  isCountsLoading,
  countsByGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onShareGroup,
}: CategorySectionProps) => {
  const { t } = useTranslation();
  const translatedRootName = useTranslatedRootGroupName(rootGroup);
  const totalRecords = childGroups.reduce((sum, group) => {
    return sum + (countsByGroup.get(group.id) ?? 0);
  }, 0);

  return (
    <div 
      className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
      style={{
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: rootGroup.color,
        background: `linear-gradient(to bottom, ${rootGroup.color}08, ${rootGroup.color}03, transparent)`
      }}
    >
      <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0" style={{ borderColor: `${rootGroup.color}40` }}>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${rootGroup.color}20` }}
          >
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
              style={{ backgroundColor: rootGroup.color }}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{translatedRootName}</h3>
            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
              {isCountsLoading ? t('common.loading') : `${t('groups.totalRecords')}: (${totalRecords})`}
            </span>
          </div>
        </div>
        <button
          onClick={onAddGroup}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm flex-shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label={t('groups.addGroup')}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
          <span className="hidden sm:inline">{t('groups.addGroup')}</span>
          <span className="sm:hidden">{t('groups.addGroup').split(' ')[0]}</span>
        </button>
      </div>

      <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-b from-gray-50 to-white space-y-2.5 sm:space-y-3">
        {isLoading || isCountsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: rootGroup.color }}></div>
          </div>
        ) : childGroups.length === 0 ? (
          <div className="text-center py-6 sm:py-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2" role="status">
              {t('groups.noGroups', { category: translatedRootName })}
            </p>
            <button
              onClick={onAddGroup}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm font-medium transition-all hover:scale-105 shadow-sm"
              style={{ backgroundColor: rootGroup.color }}
            >
              {t('groups.addGroup')}
            </button>
          </div>
        ) : (
          <ul className="grid gap-2 sm:gap-3 md:gap-4" role="list">
            {childGroups.map((group) => {
              const groupCount = countsByGroup.get(group.id) ?? 0;
              return (
              <li key={group.id}>
                <div
                  className="bg-white rounded-lg sm:rounded-xl py-2.5 px-3 sm:py-4 sm:px-4 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-0.5 group"
                  style={{
                    borderRightColor: group.color,
                    borderRightWidth: '3px'
                  }}
                >
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className="w-4 h-4 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${group.color}20` }}
                    >
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{group.name}</span>
                  </div>
                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg whitespace-nowrap">
                    {isCountsLoading ? t('common.loading') : `(${groupCount})`}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onShareGroup(group)}
                      className="p-3.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                      aria-label={t('groups.shareGroup', { name: group.name })}
                    >
                      <Share2 className="w-4 h-4 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => onEditGroup(group)}
                      className="p-3.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      aria-label={t('groups.editGroup', { name: group.name })}
                    >
                      <Edit className="w-4 h-4 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteGroup(group)}
                      className="p-3.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      aria-label={`${t('common.delete')} ${group.name}`}
                    >
                      <Trash2 className="w-4 h-4 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  </div>
                </div>
                </div>
              </li>
            );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
