import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTodayHebrewDate } from '../../hooks/useTodayHebrewDate';
import { formatInTenantTimezone } from '../../utils/dateUtils';
import { useTenant } from '../../contexts/TenantContext';

export const CurrentDateDisplay: React.FC = () => {
  const { i18n } = useTranslation();
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
    i18n.language === 'he' ? 'dd/MM/yyyy' : 'MM/dd/yyyy'
  );

  return (
    <div className="flex flex-col items-center justify-center px-2 leading-none select-none min-w-[80px]">
      <span className="text-[10px] sm:text-xs font-bold text-[#8e24aa] whitespace-nowrap mb-0.5">
        {hebrewDate.hebrew}
      </span>
      <span className="text-[10px] sm:text-xs font-medium text-[#304FFE] whitespace-nowrap">
        {gregorianDate}
      </span>
    </div>
  );
};














