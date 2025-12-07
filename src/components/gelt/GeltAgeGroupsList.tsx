import React from 'react';
import { useTranslation } from 'react-i18next';
import { AgeGroup, BudgetCalculation, Child } from '../../types/gelt';
import { GeltAgeGroupRow } from './GeltAgeGroupRow';

interface GeltAgeGroupsListProps {
  ageGroups: AgeGroup[];
  calculation: BudgetCalculation;
  onUpdateGroup: (group: AgeGroup) => void;
  onToggleInclude: (groupId: string, include: boolean) => void;
  onShowGroupChildren: (group: AgeGroup) => void;
  children: Child[];
}

export const GeltAgeGroupsList: React.FC<GeltAgeGroupsListProps> = ({
  ageGroups,
  calculation,
  onUpdateGroup,
  onToggleInclude,
  onShowGroupChildren,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full min-w-[600px] sm:min-w-0">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
              {t('gelt.ageGroup')}
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
              {t('gelt.amountPerChild')}
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-900">
              {t('gelt.childrenCount')}
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
              {t('gelt.total')}
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-900">
              {t('gelt.percentageOfBudget')}
            </th>
          </tr>
        </thead>
        <tbody>
          {ageGroups.map((group) => (
            <GeltAgeGroupRow
              key={group.id}
              group={group}
              calculation={calculation}
              allGroups={ageGroups}
              onUpdate={onUpdateGroup}
              onToggleInclude={onToggleInclude}
              onShowGroupChildren={onShowGroupChildren}
              children={children}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
