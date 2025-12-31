import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { format, startOfDay } from 'date-fns';
import * as admin from 'firebase-admin';

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
export function formatInTenantTimezone(date: Date, timezone: string, formatStr: string): string {
  return formatInTimeZone(date, timezone, formatStr);
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
 * Check if tenant's local hour is midnight (0)
 * Used by scheduled job to determine if tenant needs processing
 */
export function isMidnightInTimezone(timezone: string): boolean {
  return getCurrentHourInTimezone(timezone) === 0;
}

/**
 * Get tenants that need birthday processing
 * Logic: local hour is 0 AND haven't processed today yet
 */
export async function getTenantsNeedingBirthdayUpdate(): Promise<Array<{ id: string; timezone: string }>> {
  const db = admin.firestore();
  const tenantsSnapshot = await db.collection('tenants').get();

  const needsUpdate: Array<{ id: string; timezone: string }> = [];

  for (const tenantDoc of tenantsSnapshot.docs) {
    const tenant = tenantDoc.data();
    const timezone = tenant.timezone || 'Asia/Jerusalem';

    // Check 1: Is it midnight (hour 0) in this tenant's timezone?
    if (!isMidnightInTimezone(timezone)) {
      continue;
    }

    // Check 2: Have we already processed this tenant today (in their local time)?
    const localDateString = getCurrentDateString(timezone);
    const lastProcessed = tenant.last_birthday_process_date;

    if (lastProcessed === localDateString) {
      continue; // Already processed today
    }

    needsUpdate.push({ id: tenantDoc.id, timezone });
  }

  return needsUpdate;
}
