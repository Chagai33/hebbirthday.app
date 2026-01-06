import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AgeGroup, BudgetCalculation, Child } from '../../types/gelt';
import { Edit2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { roundToFive, updateGroupName, validateAgeRange, findUncoveredAges, findDuplicateAges, calculateGroupPercentage } from '../../utils/geltCalculations';

interface GeltAgeGroupRowProps {
  group: AgeGroup;
  calculation: BudgetCalculation;
  allGroups: AgeGroup[];
  onUpdate: (updatedGroup: AgeGroup) => void;
  onToggleInclude: (groupId: string, include: boolean) => void;
  onShowGroupChildren: (group: AgeGroup) => void;
  children: Child[];
}

export const GeltAgeGroupRow: React.FC<GeltAgeGroupRowProps> = ({
  group,
  calculation,
  allGroups,
  onUpdate,
  onToggleInclude,
  onShowGroupChildren,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editMinAge, setEditMinAge] = useState(group.minAge.toString());
  const [editMaxAge, setEditMaxAge] = useState(group.maxAge.toString());
  const [editAmount, setEditAmount] = useState(group.amountPerChild.toString());
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const groupData = calculation.groupTotals[group.id] || {
    childrenCount: 0,
    total: 0,
    calculatedAmountPerChild: undefined,
  };

  const handleSave = () => {
    const minAge = parseInt(editMinAge, 10);
    const maxAge = parseInt(editMaxAge, 10);
    const amount = parseFloat(editAmount);

    if (isNaN(minAge) || isNaN(maxAge) || isNaN(amount)) {
      setError(t('gelt.invalidInput'));
      setWarnings([]);
      return;
    }

    if (amount < 0) {
      setError(t('gelt.amountCannotBeNegative'));
      setWarnings([]);
      return;
    }

    // ולידציה של טווח הגיל
    const validation = validateAgeRange(allGroups, group.id, minAge, maxAge);
    if (!validation.isValid) {
      setError(validation.error || t('gelt.invalidAgeRange'));
      setWarnings([]);
      return;
    }

    // בדיקת חפיפות לאחר העדכון
    const updatedGroups = allGroups.map(g => 
      g.id === group.id 
        ? { ...g, minAge, maxAge }
        : g
    );
    
    const duplicates = findDuplicateAges(updatedGroups);
    if (duplicates.length > 0) {
      const duplicateInfo = duplicates
        .slice(0, 3)
        .map(d => `גיל ${d.age} (${d.groups.join(', ')})`)
        .join('; ');
      setError(`גילאים מופיעים ביותר מקבוצה אחת: ${duplicateInfo}${duplicates.length > 3 ? '...' : ''}`);
      setWarnings([]);
      return;
    }

    // אזהרות על גילאים לא מכוסים - רק אם יש גילאים בטווח הרלוונטי שלא מכוסים
    const uncovered = findUncoveredAges(updatedGroups);
    const newWarnings: string[] = [];
    if (uncovered.length > 0) {
      const uncoveredInfo = uncovered.length <= 10
        ? uncovered.join(', ')
        : `${uncovered[0]}-${uncovered[uncovered.length - 1]}`;
      newWarnings.push(`גילאים לא מכוסים: ${uncoveredInfo}`);
    }

    // אם יש אזהרות מהלוגיקה המקורית, נוסיף אותן
    if (validation.warnings && validation.warnings.length > 0) {
      newWarnings.push(...validation.warnings);
    }

    const roundedAmount = roundToFive(amount);
    const updatedGroup: AgeGroup = {
      ...group,
      minAge,
      maxAge,
      amountPerChild: roundedAmount,
      name: updateGroupName(minAge, maxAge),
    };

    onUpdate(updatedGroup);
    setIsEditing(false);
    setError(null);
    setWarnings(newWarnings);
  };

  const handleCancel = () => {
    setEditMinAge(group.minAge.toString());
    setEditMaxAge(group.maxAge.toString());
    setEditAmount(group.amountPerChild.toString());
    setIsEditing(false);
    setError(null);
    setWarnings([]);
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleInclude(group.id, !group.isIncluded)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
            role="switch"
            aria-checked={group.isIncluded}
            aria-label={group.isIncluded ? t('gelt.excludeGroup', { name: group.name }) : t('gelt.includeGroup', { name: group.name })}
          >
            {group.isIncluded ? (
              <ToggleRight className="w-5 h-5 text-green-700" aria-hidden="true" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" aria-hidden="true" />
            )}
          </button>
            {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editMinAge}
                onChange={(e) => setEditMinAge(e.target.value)}
                className="w-12 sm:w-16 px-1.5 sm:px-2 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="מינ'"
                aria-label={t('gelt.editMinAgeFor', { name: group.name })}
              />
              <span className="text-xs sm:text-sm">-</span>
              <input
                type="number"
                value={editMaxAge}
                onChange={(e) => setEditMaxAge(e.target.value)}
                className="w-12 sm:w-16 px-1.5 sm:px-2 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="מקס'"
                aria-label={t('gelt.editMaxAgeFor', { name: group.name })}
              />
              <button
                onClick={handleSave}
                className="p-2 text-green-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors min-h-[44px]"
                aria-label={t('gelt.saveGroupChanges')}
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
                aria-label={t('gelt.cancelGroupChanges')}
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-medium text-xs sm:text-sm">{group.name}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px]"
                aria-label={t('gelt.editGroup')}
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            </div>
          )}
          {error && <div className="text-xs text-red-600 mt-1" role="alert">{error}</div>}
          {warnings.length > 0 && !error && (
            <div className="text-xs text-yellow-600 mt-1" role="status">
              {warnings.map((warning, idx) => (
                <div key={idx}>{warning}</div>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3">
        {isEditing ? (
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="w-20 sm:w-24 px-2 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step="5"
            min="0"
            aria-label={t('gelt.editAmountFor', { name: group.name })}
          />
        ) : (
          <div className="flex flex-col">
            <span className="font-medium text-xs sm:text-sm">
              {calculation.isCustomBudget && groupData.calculatedAmountPerChild !== undefined
                ? groupData.calculatedAmountPerChild
                : group.amountPerChild} ₪
            </span>
            {calculation.isCustomBudget && groupData.calculatedAmountPerChild !== undefined && (
              <span className="text-[10px] sm:text-xs text-gray-500">
                {t('gelt.calculatedFromCustomBudget')}
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
        {groupData.childrenCount > 0 ? (
          <button
            onClick={() => onShowGroupChildren(group)}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer p-1 min-h-[44px]"
            aria-label={t('gelt.showChildrenInGroupCount', { count: groupData.childrenCount, name: group.name })}
          >
            {groupData.childrenCount}
          </button>
        ) : (
          <span className="text-xs sm:text-sm text-gray-400">{groupData.childrenCount}</span>
        )}
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium text-xs sm:text-sm">
        {groupData.total.toFixed(0)} ₪
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3">
        {calculation.totalRequired > 0 ? (
          <div className="flex flex-col items-center gap-0.5 sm:gap-1">
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 max-w-[60px] sm:max-w-[80px]">
              <div
                className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(calculateGroupPercentage(groupData.total, calculation.totalRequired), 100)}%` 
                }}
              />
            </div>
            <span className="text-[10px] sm:text-xs text-gray-600 font-medium">
              {calculateGroupPercentage(groupData.total, calculation.totalRequired).toFixed(1)}%
            </span>
          </div>
        ) : (
          <span className="text-[10px] sm:text-xs text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
};
