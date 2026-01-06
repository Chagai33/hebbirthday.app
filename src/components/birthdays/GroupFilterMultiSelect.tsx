import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GroupFilterOption {
  id: string;
  name: string;
  color?: string;
  isUnassigned?: boolean;
}

interface GroupFilterMultiSelectProps {
  groups: GroupFilterOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  placeholder?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  className?: string;
}

export const GroupFilterMultiSelect: React.FC<GroupFilterMultiSelectProps> = ({
  groups,
  selectedIds,
  onChange,
  label,
  placeholder,
  showClearButton = true,
  onClear,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const defaultPlaceholder = placeholder || t('groups.selectGroups', 'בחר קבוצות');
  const displayLabel = label || t('groups.filterByGroup', 'סנן לפי קבוצה');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation in listbox
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys if focus is within the listbox or on the trigger button
      const isInListbox = listboxRef.current?.contains(document.activeElement as Node);
      const isOnButton = containerRef.current?.querySelector('button')?.contains(document.activeElement as Node);

      if (!isInListbox && !isOnButton) return;
      if (!listboxRef.current) return;

      const focusableItems = listboxRef.current.querySelectorAll('[role="option"]:not([aria-disabled="true"])');
      const currentIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
          setFocusedIndex(nextIndex);
          (focusableItems[nextIndex] as HTMLElement)?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
          setFocusedIndex(prevIndex);
          (focusableItems[prevIndex] as HTMLElement)?.focus();
          break;
        }
        case 'Home': {
          e.preventDefault();
          setFocusedIndex(0);
          (focusableItems[0] as HTMLElement)?.focus();
          break;
        }
        case 'End': {
          e.preventDefault();
          const lastIndex = focusableItems.length - 1;
          setFocusedIndex(lastIndex);
          (focusableItems[lastIndex] as HTMLElement)?.focus();
          break;
        }
        case 'Escape': {
          // Only close dropdown, don't propagate to parent modal
          if (isInListbox || isOnButton) {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(false);
            // Return focus to trigger button
            const button = containerRef.current?.querySelector('button');
            button?.focus();
          }
          break;
        }
        case 'Tab': {
          // Close dropdown and allow Tab to continue naturally
          if (isInListbox) {
            setIsOpen(false);
            // Don't preventDefault - let Tab move to next field
          }
          break;
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex]);

  const toggleSelection = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];
    onChange(newSelection);
  };

  const selectedCount = selectedIds.length;

  // Generate display text
  let displayText = defaultPlaceholder;
  if (selectedCount > 0) {
    if (selectedCount === 1) {
      const group = groups.find(g => g.id === selectedIds[0]);
      displayText = group ? group.name : t('groups.unknownGroup', 'קבוצה לא ידועה');
    } else {
      displayText = t('groups.groupsSelected', { count: selectedCount });
    }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor="group-filter-trigger" className="block text-sm font-semibold text-gray-900 mb-2">
          {displayLabel}
        </label>
      )}

      <div className="flex items-center gap-2">
        <button
          id="group-filter-trigger"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-describedby={selectedCount > 0 ? "group-filter-summary" : undefined}
          className="flex-1 px-3 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between min-h-[44px] transition-colors"
        >
          <span className={`text-sm truncate block ${selectedCount === 0 ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
            {displayText}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
          )}
        </button>

        {showClearButton && selectedCount > 0 && (
          <button
            onClick={() => {
              onChange([]);
              if (onClear) onClear();
            }}
            className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[44px] whitespace-nowrap"
            aria-label={t('groups.clearGroups', 'נקה בחירת קבוצות')}
          >
            {t('groups.clearGroups', 'נקה קבוצות')}
          </button>
        )}
      </div>

      {/* Live region for selection feedback */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="group-filter-summary">
        {selectedCount > 0
          ? t('groups.selectionSummary', { count: selectedCount, text: displayText })
          : t('groups.noSelection', 'לא נבחרו קבוצות')
        }
      </div>

      {isOpen && (
        <div
          ref={listboxRef}
          className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-multiselectable="true"
          aria-label={t('groups.groupSelectionList', 'רשימת קבוצות לבחירה')}
        >
          {groups.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              {t('groups.noGroupsAvailable', 'אין קבוצות זמינות')}
            </div>
          ) : (
            groups.map((group, index) => {
              const isSelected = selectedIds.includes(group.id);
              const isUnassigned = group.isUnassigned;

              const selectionStatus = isSelected
                ? t('common.selected', 'נבחר')
                : t('common.notSelected', 'לא נבחר');

              const ariaLabel = isUnassigned
                ? t('groups.selectUnassignedItem', { status: selectionStatus })
                : t('groups.selectGroupItem', { name: group.name, status: selectionStatus });

              return (
                <div
                  key={group.id}
                  onClick={() => toggleSelection(group.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSelection(group.id);
                    }
                  }}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={ariaLabel}
                  tabIndex={0}
                  className={`flex items-center px-3 py-3 transition-colors border-b border-gray-50 last:border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 hover:bg-gray-50 cursor-pointer min-h-[44px] ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`w-5 h-5 border rounded flex items-center justify-center mr-3 flex-shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" aria-hidden="true" />}
                  </div>

                  {isUnassigned ? (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {group.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: group.color || '#gray' }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {group.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
