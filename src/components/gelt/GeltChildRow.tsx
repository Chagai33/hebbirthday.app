import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Child } from '../../types/gelt';
import { Edit2, X, RotateCcw, Check } from 'lucide-react';
import { updateChildAge } from '../../utils/geltCalculations';

interface GeltChildRowProps {
  child: Child;
  isIncluded: boolean;
  onUpdate: (updatedChild: Child) => void;
  onToggleInclude: (childId: string, include: boolean) => void;
  onResetAge: (childId: string) => void;
}

export const GeltChildRow: React.FC<GeltChildRowProps> = ({
  child,
  isIncluded,
  onUpdate,
  onToggleInclude,
  onResetAge,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editAge, setEditAge] = useState(child.age.toString());

  const handleSave = () => {
    const newAge = parseInt(editAge, 10);
    if (!isNaN(newAge) && newAge >= 0 && newAge <= 120) {
      const updated = updateChildAge([child], child.id, newAge)[0];
      onUpdate(updated);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditAge(child.age.toString());
    setIsEditing(false);
  };

  const handleReset = () => {
    if (child.originalAge !== undefined) {
      onResetAge(child.id);
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50" role="row">
      <td className="px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isIncluded}
            onChange={(e) => onToggleInclude(child.id, e.target.checked)}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500"
            aria-label={isIncluded ? t('gelt.excludeChild', { name: child.firstName }) : t('gelt.includeChild', { name: child.firstName })}
          />
          <span className="font-medium text-xs sm:text-sm">
            {child.firstName} {child.lastName}
          </span>
        </div>
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
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
              onClick={handleSave}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors min-h-[44px]"
              aria-label={t('gelt.saveAge')}
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
              aria-label={t('gelt.cancelEdit')}
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium">{child.age}</span>
            {child.originalAge !== undefined && (
              <span className="text-[10px] sm:text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded font-medium">
                {t('gelt.originalAge')}: {child.originalAge}
              </span>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px]"
              aria-label={t('gelt.editAgeFor', { name: child.firstName })}
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </button>
            {child.originalAge !== undefined && (
              <button
                onClick={handleReset}
                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
                aria-label={t('gelt.resetAgeFor', { name: child.firstName })}
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};
