import { useTranslation } from 'react-i18next';
import { CalendarPreference } from '../../types';
import { calendarPreferenceService } from '../../services/calendarPreference.service';

interface CalendarPreferenceSelectorProps {
  value: CalendarPreference | undefined;
  onChange: (value: CalendarPreference) => void;
  showDescription?: boolean;
  label?: string;
}

export const CalendarPreferenceSelector: React.FC<CalendarPreferenceSelectorProps> = ({
  value,
  onChange,
  showDescription = true,
  label,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language as 'he' | 'en' | 'es') || 'en';


  const options: CalendarPreference[] = ['gregorian', 'hebrew', 'both'];

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-gray-900">
          {label}
        </label>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        {options.map((option) => {
          const preferenceData = calendarPreferenceService.getPreferenceLabel(option);
          const descriptionData = calendarPreferenceService.getPreferenceDescription(option);
          const optionLabel = preferenceData[currentLang] || preferenceData.en;
          const optionDesc = descriptionData[currentLang] || descriptionData.en;
          const isSelected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`
                relative p-2 border-2 rounded-lg text-start transition-colors duration-200
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
                }
              `}
            >
              <div className="flex items-start gap-1.5">
                <div className={`
                  mt-[2px] w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}
                `}>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {optionLabel}
                  </div>
                  {showDescription && (
                    <div className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                      {optionDesc}
                    </div>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="absolute -top-0.5 -end-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
