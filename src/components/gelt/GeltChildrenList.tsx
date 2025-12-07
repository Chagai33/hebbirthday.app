import React from 'react';
import { useTranslation } from 'react-i18next';
import { Child } from '../../types/gelt';
import { GeltChildRow } from './GeltChildRow';
import { sortChildren } from '../../utils/geltCalculations';

interface GeltChildrenListProps {
  children: Child[];
  includedChildren: Set<string>;
  onUpdateChild: (child: Child) => void;
  onToggleInclude: (childId: string, include: boolean) => void;
  onResetAge: (childId: string) => void;
}

export const GeltChildrenList: React.FC<GeltChildrenListProps> = ({
  children,
  includedChildren,
  onUpdateChild,
  onToggleInclude,
  onResetAge,
}) => {
  const { t } = useTranslation();

  const sortedChildren = sortChildren(children);

  if (sortedChildren.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('gelt.noChildren')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full min-w-[300px] sm:min-w-0">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
              {t('gelt.childName')}
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
              {t('gelt.age')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedChildren.map((child) => (
            <GeltChildRow
              key={child.id}
              child={child}
              isIncluded={includedChildren.has(child.id)}
              onUpdate={onUpdateChild}
              onToggleInclude={onToggleInclude}
              onResetAge={onResetAge}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
