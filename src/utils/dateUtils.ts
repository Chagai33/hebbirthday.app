import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { format, startOfDay } from 'date-fns';
import { he, enUS, es } from 'date-fns/locale';

const locales: Record<string, any> = {
  he,
  en: enUS,
  es
};

/**
 * Get current date/time in tenant's timezone
 * @param timezone - IANA timezone string (e.g., 'Asia/Jerusalem')
 * @returns Date object representing current time in the specified timezone
 */
export function getTenantNow(timezone: string = 'Asia/Jerusalem'): Date {
  const utcNow = new Date();
  return toZonedTime(utcNow, timezone);
}

/**
 * Get current date adjusted for Hebrew evening transition
 * Phase 1: Assumes sunset at 19:00 local time (no geolocation yet)
 * @param timezone - Tenant's timezone
 * @param sunsetHour - Hour when Hebrew day starts (default: 19)
 */
export function getTenantHebrewNow(timezone: string = 'Asia/Jerusalem', sunsetHour: number = 19): Date {
  const now = getTenantNow(timezone);
  
  // If past sunset hour (e.g., 19:00), advance to next calendar day
  if (now.getHours() >= sunsetHour) {
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }
  
  return now;
}

/**
 * Format date in tenant's timezone
 */
export function formatInTenantTimezone(
  date: Date,
  timezone: string,
  formatStr: string,
  localeCode: string = 'en'
): string {
  const locale = locales[localeCode] || locales['en'];
  return formatInTimeZone(date, timezone, formatStr, { locale });
}

/**
 * Get start of day (midnight) in tenant's timezone
 */
export function getStartOfDayInTimezone(date: Date, timezone: string): Date {
  const zonedDate = toZonedTime(date, timezone);
  return startOfDay(zonedDate);
}

/**
 * Get current hour in tenant's timezone (0-23)
 */
export function getCurrentHourInTimezone(timezone: string): number {
  return getTenantNow(timezone).getHours();
}

/**
 * Get current date string in tenant's timezone (YYYY-MM-DD)
 */
export function getCurrentDateString(timezone: string): string {
  return format(getTenantNow(timezone), 'yyyy-MM-dd');
}

/**
 * Auto-detect browser timezone using Intl API
 */
export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Asia/Jerusalem'; // Fallback
  }
}

/**
 * Get all supported timezones (for UI selector)
 * Grouped by region for better UX
 */
export function getSupportedTimezones(): Record<string, string[]> {
  try {
    const allTimezones = Intl.supportedValuesOf('timeZone');
    
    // Group by region
    const grouped: Record<string, string[]> = {
      'Middle East': [],
      'Europe': [],
      'Americas': [],
      'Asia & Pacific': [],
      'Other': [],
    };
    
    allTimezones.forEach(tz => {
      if (tz.startsWith('Asia/') && ['Jerusalem', 'Dubai', 'Riyadh', 'Tehran'].some(city => tz.includes(city))) {
        grouped['Middle East'].push(tz);
      } else if (tz.startsWith('Europe/')) {
        grouped['Europe'].push(tz);
      } else if (tz.startsWith('America/')) {
        grouped['Americas'].push(tz);
      } else if (tz.startsWith('Asia/') || tz.startsWith('Pacific/') || tz.startsWith('Australia/')) {
        grouped['Asia & Pacific'].push(tz);
      } else if (!tz.startsWith('Etc/')) {
        grouped['Other'].push(tz);
      }
    });
    
    return grouped;
  } catch {
    // Fallback for older browsers
    return {
      'Middle East': ['Asia/Jerusalem', 'Asia/Dubai'],
      'Europe': ['Europe/London', 'Europe/Paris', 'Europe/Berlin'],
      'Americas': ['America/New_York', 'America/Chicago', 'America/Los_Angeles'],
      'Asia & Pacific': ['Asia/Tokyo', 'Australia/Sydney'],
    };
  }
}
