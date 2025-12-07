import React from 'react';
import { useTranslation } from 'react-i18next';
import { BudgetCalculation } from '../../types/gelt';
import { isOverBudget, getOverflowAmount } from '../../utils/geltCalculations';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface GeltCalculationResultsProps {
  calculation: BudgetCalculation;
}

export const GeltCalculationResults: React.FC<GeltCalculationResultsProps> = ({
  calculation,
}) => {
  const { t } = useTranslation();
  const overBudget = isOverBudget(calculation);
  const overflowAmount = getOverflowAmount(calculation);

  return (
    <div className="space-y-3">
      {calculation.isCustomBudget && (
        <div className="flex items-center justify-end mb-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
            {t('gelt.customBudgetActive')}
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-gray-700 text-sm sm:text-base">
          {calculation.isCustomBudget ? t('gelt.customBudget') : t('gelt.totalRequired')}:
        </span>
        <span className="font-semibold text-base sm:text-lg">{calculation.totalRequired.toFixed(0)} ₪</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-gray-700 text-sm sm:text-base">{t('gelt.amountPerParticipant')}:</span>
        <span className="font-semibold text-base sm:text-lg">{calculation.amountPerParticipant.toFixed(0)} ₪</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-gray-700 text-sm sm:text-base">{t('gelt.maxAllowed')}:</span>
        <span className="font-semibold text-sm sm:text-base">{calculation.maxAllowed.toFixed(0)} ₪</span>
      </div>

      {overBudget && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-red-800 font-medium text-xs sm:text-sm">{t('gelt.overBudget')}</span>
            <span className="text-red-600 ml-1 sm:ml-2 text-xs sm:text-sm block sm:inline">
              {t('gelt.overflowAmount')}: {overflowAmount.toFixed(0)} ₪
            </span>
          </div>
        </div>
      )}

      {!overBudget && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-800 font-medium text-xs sm:text-sm">{t('gelt.withinBudget')}</span>
        </div>
      )}
    </div>
  );
};
