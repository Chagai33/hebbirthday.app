import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Child, AgeGroup } from '../../types/gelt';
import { X, Edit2, Check, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useFocusTrap } from '../../hooks/useAccessibility';

interface GeltGroupChildrenModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: AgeGroup;
  children: Child[];
  includedChildren: Set<string>;
  onUpdateChild: (child: Child) => void;
  onToggleInclude: (childId: string, include: boolean) => void;
  onRemoveChild: (childId: string) => void;
}

export const GeltGroupChildrenModal: React.FC<GeltGroupChildrenModalProps> = ({
  isOpen,
  onClose,
  group,
  children,
  includedChildren,
  onUpdateChild,
  onToggleInclude,
  onRemoveChild,
}) => {
  const { t } = useTranslation();
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editAge, setEditAge] = useState<string>('');

  // Focus trap for modal
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  // Filter children for this age group (only included children)
  const groupChildren = children.filter(
    (child) =>
      includedChildren.has(child.id) &&
      child.age >= group.minAge &&
      child.age <= group.maxAge
  );

  const handleStartEdit = (child: Child) => {
    setEditingChildId(child.id);
    setEditAge(child.age.toString());
  };

  const handleSaveEdit = (child: Child) => {
    const newAge = parseInt(editAge, 10);
    if (!isNaN(newAge) && newAge >= 0 && newAge <= 120) {
      onUpdateChild({ ...child, age: newAge });
      setEditingChildId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingChildId(null);
    setEditAge('');
  };

  const handleRemove = (childId: string) => {
    if (window.confirm(t('gelt.confirmRemoveChild'))) {
      onRemoveChild(childId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={focusTrapRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-in relative max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-children-title"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 id="group-children-title" className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
            {t('gelt.childrenInGroup')}: {group.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-h-[44px]"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {groupChildren.length === 0 ? (
            <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
              {t('gelt.noChildrenInGroup')}
            </div>
          ) : (
            <ul className="space-y-2" role="list">
              {groupChildren.map((child) => (
                <li key={child.id}>
                  <div
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={includedChildren.has(child.id)}
                      onChange={(e) => onToggleInclude(child.id, e.target.checked)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                      aria-label={includedChildren.has(child.id) ? t('gelt.excludeChild', { name: child.firstName }) : t('gelt.includeChild', { name: child.firstName })}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                        {child.firstName} {child.lastName}
                      </div>
                      {editingChildId === child.id ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                          <input
                            type="number"
                            value={editAge}
                            onChange={(e) => setEditAge(e.target.value)}
                            min="0"
                            max="120"
                            className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                            aria-label={t('gelt.editAgeFor', { name: child.firstName })}
                          />
                          <button
                            onClick={() => handleSaveEdit(child)}
                            className="p-2 text-green-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors min-h-[44px]"
                            aria-label={t('gelt.saveAge')}
                          >
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
                            aria-label={t('gelt.cancelEdit')}
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] sm:text-xs text-gray-600">
                            {t('gelt.age')}: <span className="font-medium">{child.age}</span>
                          </span>
                          {child.originalAge !== undefined && (
                            <span className="text-[10px] sm:text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded font-medium">
                              {t('gelt.originalAge')}: {child.originalAge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editingChildId !== child.id && (
                      <>
                        <button
                          onClick={() => handleStartEdit(child)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px]"
                          aria-label={t('gelt.editAgeFor', { name: child.firstName })}
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleRemove(child.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
                          aria-label={t('gelt.removeChild')}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} size="sm">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
};
