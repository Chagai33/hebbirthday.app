import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTodayHebrewDate } from '../../hooks/useTodayHebrewDate';
import { formatInTenantTimezone } from '../../utils/dateUtils';
import { useTenant } from '../../contexts/TenantContext';

export const CurrentDateDisplay: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentTenant } = useTenant();
  const { data: hebrewDate } = useTodayHebrewDate();
  const timezone = currentTenant?.timezone || 'Asia/Jerusalem';

  if (!hebrewDate) {
    return null;
  }

  // Use tenant timezone for Gregorian date display
  const gregorianDate = formatInTenantTimezone(
    new Date(),
    timezone,
    i18n.language === 'he' ? 'dd/MM/yyyy' : 'MM/dd/yyyy',
    i18n.language
  );

  return (
    <div
      className="flex flex-col items-center justify-center px-2 leading-none select-none min-w-[80px]"
      role="img"
      aria-label={t('common.currentDateLabel', {
        hebrew: hebrewDate.hebrew,
        gregorian: gregorianDate,
        interpolation: { escapeValue: false }
      })}
    >
      <time
        dateTime={new Date().toISOString()}
        className="text-[10px] sm:text-xs font-bold text-[#8e24aa] whitespace-nowrap mb-0.5"
        aria-hidden="true"
      >
        {hebrewDate.hebrew}
      </time>
      <span
        className="text-[10px] sm:text-xs font-medium text-[#304FFE] whitespace-nowrap"
        aria-hidden="true"
      >
        {gregorianDate}
      </span>
    </div>
  );
};














