
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BudgetConfig } from '../../types/gelt';
import { roundToFive, handleInputBlur, handleArrowKey } from '../../utils/geltCalculations';

interface GeltBudgetConfigProps {
  config: BudgetConfig;
  onUpdate: (config: BudgetConfig) => void;
}

export const GeltBudgetConfig: React.FC<GeltBudgetConfigProps> = ({
  config,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState(config.participants.toString());
  const [overflow, setOverflow] = useState(config.allowedOverflowPercentage.toString());

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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('gelt.participants')}
        </label>
        <input
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('gelt.allowedOverflow')} (%)
        </label>
        <input
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
    </div>
  );
};
