import { useQuery } from '@tanstack/react-query';
import { HDate, HebrewCalendar, gematriya, Locale } from '@hebcal/core';
import { getTenantHebrewNow } from '../utils/dateUtils';
import { useTenant } from '../contexts/TenantContext';

interface HebcalResponse {
  gy: number;
  gm: number;
  gd: number;
  hy: number;
  hm: string;
  hd: number;
  hebrew: string;
  events: string[];
}

export const useTodayHebrewDate = () => {
  const { currentTenant } = useTenant();
  const timezone = currentTenant?.timezone || 'Asia/Jerusalem';

  return useQuery({
    queryKey: ['todayHebrewDate', timezone],
    queryFn: async () => {
      // SINGLE SOURCE OF TRUTH for current time with Hebrew day transition
      const now = getTenantHebrewNow(timezone);

      const hd = new HDate(now);

      // Get events for this Hebrew date (in Israel = true)
      const events = HebrewCalendar.getHolidaysOnDate(hd, true) || [];

      // Format manually to ensure Hebrew letters (Gematriya)
      const day = gematriya(hd.getDate());
      const month = Locale.gettext(hd.getMonthName(), 'he'); // Returns "כִּסְלֵו"
      const year = gematriya(hd.getFullYear());
      const hebrewDateString = `${day} ${month} ${year}`; // e.g., "כ״ה כִּסְלֵו תשפ״ו"

      return {
        gy: now.getFullYear(),
        gm: now.getMonth() + 1,
        gd: now.getDate(),
        hy: hd.getFullYear(),
        hm: hd.getMonthName(),
        hd: hd.getDate(),
        hebrew: hebrewDateString,
        events: events.map(e => e.render('he')),
      } as HebcalResponse;
    },
    // Local calculation is cheap, so we can refresh reasonably often to catch the 19:00 switch
    refetchInterval: 60000 * 5, // Every 5 minutes
    staleTime: Infinity, // Data is considered fresh until refetched
  });
};
