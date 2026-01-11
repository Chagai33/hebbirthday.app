import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BudgetConfig } from '../../types/gelt';
import { handleInputBlur, handleArrowKey, roundToFive } from '../../utils/geltCalculations';
import { X, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { useFocusTrap } from '../../hooks/useAccessibility';

interface GeltBudgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BudgetConfig;
  onUpdate: (config: BudgetConfig) => void;
}

export const GeltBudgetConfigModal: React.FC<GeltBudgetConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState(config.participants.toString());
  const [overflow, setOverflow] = useState(config.allowedOverflowPercentage.toString());
  const [customBudget, setCustomBudget] = useState(
    config.customBudget ? config.customBudget.toString() : ''
  );

  // Focus trap for modal
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  // Update local state when config changes
  useEffect(() => {
    setParticipants(config.participants.toString());
    setOverflow(config.allowedOverflowPercentage.toString());
    setCustomBudget(config.customBudget ? config.customBudget.toString() : '');
  }, [config]);

  if (!isOpen) return null;

  const handleParticipantsBlur = () => {
    const value = handleInputBlur(participants, config.participants, {
      min: 1,
      max: 1000,
    });
    setParticipants(value.toString());
    onUpdate({ ...config, participants: value });
  };

  const handleOverflowBlur = () => {
    const value = handleInputBlur(overflow, config.allowedOverflowPercentage, {
      min: 0,
      max: 100,
    });
    setOverflow(value.toString());
    onUpdate({ ...config, allowedOverflowPercentage: value });
  };

  const handleParticipantsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = handleArrowKey(config.participants, e.key === 'ArrowUp' ? 'up' : 'down', {
        min: 1,
        max: 1000,
      });
      setParticipants(newValue.toString());
      onUpdate({ ...config, participants: newValue });
    }
  };

  const handleOverflowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = handleArrowKey(
        config.allowedOverflowPercentage,
        e.key === 'ArrowUp' ? 'up' : 'down',
        {
          min: 0,
          max: 100,
        }
      );
      setOverflow(newValue.toString());
      onUpdate({ ...config, allowedOverflowPercentage: newValue });
    }
  };

  const handleCustomBudgetBlur = () => {
    if (!customBudget || customBudget.trim() === '') {
      // Clear custom budget
      onUpdate({ ...config, customBudget: undefined });
      return;
    }

    let value = parseFloat(customBudget);
    if (isNaN(value) || value < 0) {
      setCustomBudget(config.customBudget ? config.customBudget.toString() : '');
      return;
    }

    // Round to nearest 5
    value = roundToFive(value);
    setCustomBudget(value.toString());
    onUpdate({ ...config, customBudget: value });
  };

  const handleCustomBudgetKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = config.customBudget || 0;
      const newValue = roundToFive(
        currentValue + (e.key === 'ArrowUp' ? 5 : -5)
      );
      const finalValue = Math.max(0, newValue);
      setCustomBudget(finalValue.toString());
      onUpdate({ ...config, customBudget: finalValue > 0 ? finalValue : undefined });
    }
  };

  const handleClearCustomBudget = () => {
    setCustomBudget('');
    onUpdate({ ...config, customBudget: undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={focusTrapRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-config-title"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="budget-config-title" className="text-xl font-bold text-gray-900">{t('gelt.budgetConfig')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-h-[44px]"
            aria-label={t('gelt.closeBudgetConfig')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="participants-input" className="block text-sm font-medium text-gray-700 mb-2">
              {t('gelt.participants')}
            </label>
            <input
              id="participants-input"
              type="number"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              onBlur={handleParticipantsBlur}
              onKeyDown={handleParticipantsKeyDown}
              min="1"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="overflow-input" className="block text-sm font-medium text-gray-700 mb-2">
              {t('gelt.allowedOverflow')} (%)
            </label>
            <input
              id="overflow-input"
              type="number"
              value={overflow}
              onChange={(e) => setOverflow(e.target.value)}
              onBlur={handleOverflowBlur}
              onKeyDown={handleOverflowKeyDown}
              min="0"
              max="100"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="custom-budget-input" className="block text-sm font-medium text-gray-700">
                {t('gelt.customBudget')}
              </label>
              {config.customBudget && (
                <button
                  onClick={handleClearCustomBudget}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 p-1 min-h-[44px]"
                  aria-label={t('gelt.clearCustomBudget')}
                >
                  <XCircle className="w-3 h-3" aria-hidden="true" />
                  {t('gelt.clear')}
                </button>
              )}
            </div>
            <input
              id="custom-budget-input"
              type="number"
              value={customBudget}
              onChange={(e) => setCustomBudget(e.target.value)}
              onBlur={handleCustomBudgetBlur}
              onKeyDown={handleCustomBudgetKeyDown}
              min="0"
              step="5"
              placeholder={t('gelt.customBudgetPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-describedby="custom-budget-hint"
            />
            <p id="custom-budget-hint" className="text-xs text-gray-500 mt-1">
              {t('gelt.customBudgetHint')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
};
