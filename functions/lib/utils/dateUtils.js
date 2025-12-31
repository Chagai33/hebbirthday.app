"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantNow = getTenantNow;
exports.getTenantHebrewNow = getTenantHebrewNow;
exports.formatInTenantTimezone = formatInTenantTimezone;
exports.getStartOfDayInTimezone = getStartOfDayInTimezone;
exports.getCurrentHourInTimezone = getCurrentHourInTimezone;
exports.getCurrentDateString = getCurrentDateString;
exports.isMidnightInTimezone = isMidnightInTimezone;
exports.getTenantsNeedingBirthdayUpdate = getTenantsNeedingBirthdayUpdate;
const date_fns_tz_1 = require("date-fns-tz");
const date_fns_1 = require("date-fns");
const admin = __importStar(require("firebase-admin"));
/**
 * Get current date/time in tenant's timezone
 * @param timezone - IANA timezone string (e.g., 'Asia/Jerusalem')
 * @returns Date object representing current time in the specified timezone
 */
function getTenantNow(timezone = 'Asia/Jerusalem') {
    const utcNow = new Date();
    return (0, date_fns_tz_1.toZonedTime)(utcNow, timezone);
}
/**
 * Get current date adjusted for Hebrew evening transition
 * Phase 1: Assumes sunset at 19:00 local time (no geolocation yet)
 * @param timezone - Tenant's timezone
 * @param sunsetHour - Hour when Hebrew day starts (default: 19)
 */
function getTenantHebrewNow(timezone = 'Asia/Jerusalem', sunsetHour = 19) {
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
function formatInTenantTimezone(date, timezone, formatStr) {
    return (0, date_fns_tz_1.formatInTimeZone)(date, timezone, formatStr);
}
/**
 * Get start of day (midnight) in tenant's timezone
 */
function getStartOfDayInTimezone(date, timezone) {
    const zonedDate = (0, date_fns_tz_1.toZonedTime)(date, timezone);
    return (0, date_fns_1.startOfDay)(zonedDate);
}
/**
 * Get current hour in tenant's timezone (0-23)
 */
function getCurrentHourInTimezone(timezone) {
    return getTenantNow(timezone).getHours();
}
/**
 * Get current date string in tenant's timezone (YYYY-MM-DD)
 */
function getCurrentDateString(timezone) {
    return (0, date_fns_1.format)(getTenantNow(timezone), 'yyyy-MM-dd');
}
/**
 * Check if tenant's local hour is midnight (0)
 * Used by scheduled job to determine if tenant needs processing
 */
function isMidnightInTimezone(timezone) {
    return getCurrentHourInTimezone(timezone) === 0;
}
/**
 * Get tenants that need birthday processing
 * Logic: local hour is 0 AND haven't processed today yet
 */
async function getTenantsNeedingBirthdayUpdate() {
    const db = admin.firestore();
    const tenantsSnapshot = await db.collection('tenants').get();
    const needsUpdate = [];
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
//# sourceMappingURL=dateUtils.js.map