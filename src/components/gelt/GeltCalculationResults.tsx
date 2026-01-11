import React from 'react';
import { useTranslation } from 'react-i18next';
import { BudgetCalculation } from '../../types/gelt';
import { Tenant } from '../../types';
import { isOverBudget, getOverflowAmount } from '../../utils/geltCalculations';
import { formatCurrency } from '../../utils/currencyUtils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface GeltCalculationResultsProps {
  calculation: BudgetCalculation;
  tenant?: Tenant | null;
}

export const GeltCalculationResults: React.FC<GeltCalculationResultsProps> = ({
  calculation,
  tenant,
}) => {
  const { t } = useTranslation();
  const overBudget = isOverBudget(calculation);
  const overflowAmount = getOverflowAmount(calculation);

  return (
    <dl className="space-y-3" aria-live="polite">
      {calculation.isCustomBudget && (
        <div className="flex items-center justify-end mb-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
            {t('gelt.customBudgetActive')}
          </span>
        </div>
      )}

      <div>
        <dt className="text-gray-700 text-sm sm:text-base">
          {calculation.isCustomBudget ? t('gelt.customBudget') : t('gelt.totalRequired')}:
        </dt>
        <dd className="font-semibold text-base sm:text-lg mt-1">{formatCurrency(calculation.totalRequired, tenant?.currency)}</dd>
      </div>

      <div>
        <dt className="text-gray-700 text-sm sm:text-base">{t('gelt.amountPerParticipant')}:</dt>
        <dd className="font-semibold text-base sm:text-lg mt-1">{formatCurrency(calculation.amountPerParticipant, tenant?.currency)}</dd>
      </div>

      <div>
        <dt className="text-gray-700 text-sm sm:text-base">{t('gelt.maxAllowed')}:</dt>
        <dd className="font-semibold text-sm sm:text-base mt-1">{formatCurrency(calculation.maxAllowed, tenant?.currency)}</dd>
      </div>

      {overBudget && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="text-red-800 font-medium text-xs sm:text-sm">{t('gelt.overBudget')}</span>
            <span className="text-red-600 ml-1 sm:ml-2 text-xs sm:text-sm block sm:inline">
              {t('gelt.overflowAmount')}: {formatCurrency(overflowAmount, tenant?.currency)}
            </span>
          </div>
        </div>
      )}

      {!overBudget && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2" role="status">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 flex-shrink-0" aria-hidden="true" />
          <span className="text-green-800 font-medium text-xs sm:text-sm">{t('gelt.withinBudget')}</span>
        </div>
      )}
    </dl>
  );
};
