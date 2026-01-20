// HebcalService - Hebrew date calculations
// Source: lines 79-129 from index.ts
// CRITICAL: line 90 - renderGematriya() not render('he')!

import { HDate } from '@hebcal/core';
import { HebcalData, NextHebrewBirthday } from '../entities/types';
import { getTenantNow } from '../../utils/dateUtils';

export class HebcalService {
  async getCurrentHebrewYear(timezone: string = 'Asia/Jerusalem'): Promise<number> {
    const now = getTenantNow(timezone);
    return new HDate(now).getFullYear();
  }

  async fetchHebcalData(date: Date, afterSunset: boolean): Promise<HebcalData> {
    let hDate = new HDate(date);

    if (afterSunset) {
      hDate = hDate.next(); // CRITICAL FIX: next() returns a NEW HDate object!
    }

    return {
      // CRITICAL: render('he') in original line 90 - renderGematriya()
      // Returns full Hebrew string like "כ״ו בכסלו תשע״ו"
      hebrew: hDate.renderGematriya(),
      hy: hDate.getFullYear(),
      hm: hDate.getMonthName(),
      hd: hDate.getDate()
    };
  }

  async fetchNextHebrewBirthdays(
    currentYear: number,
    month: string,
    day: number,
    count: number
  ): Promise<NextHebrewBirthday[]> {
    const results: NextHebrewBirthday[] = [];

    for (let i = 0; i <= count; i++) {
      const nextYear = currentYear + i;
      try {
        let nextHDate: HDate;
        try {
          nextHDate = new HDate(day, month, nextYear);
        } catch (e) {
          // Handle Adar/Leap year mismatches and day 30 vs 29
          if (day === 30) {
            nextHDate = new HDate(29, month, nextYear);
          } else if (month === 'Adar I' && !HDate.isLeapYear(nextYear)) {
            nextHDate = new HDate(day, 'Adar', nextYear);
          } else if (month === 'Adar II' && !HDate.isLeapYear(nextYear)) {
            nextHDate = new HDate(day, 'Adar', nextYear);
          } else if (month === 'Adar' && HDate.isLeapYear(nextYear)) {
            nextHDate = new HDate(day, 'Adar II', nextYear);
          } else {
            throw e;
          }
        }
        results.push({
          gregorianDate: nextHDate.greg(),
          hebrewYear: nextYear
        });
      } catch (e) {
        // Skip invalid calculations silently
      }
    }
    return results;
  }
}
