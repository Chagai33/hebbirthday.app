"use strict";
// CalculateHebrewDataUseCase - חישוב נתונים עבריים ליום הולדת
// מקור: לוגיקת Hebcal מתוך onBirthdayWrite שורות 505-549
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
exports.CalculateHebrewDataUseCase = void 0;
const functions = __importStar(require("firebase-functions"));
const dateUtils_1 = require("../../../utils/dateUtils");
class CalculateHebrewDataUseCase {
    constructor(hebcalService, birthdayRepo, tenantRepo // Injected Dependency
    ) {
        this.hebcalService = hebcalService;
        this.birthdayRepo = birthdayRepo;
        this.tenantRepo = tenantRepo;
    }
    async execute(birthdayId, birthDateGregorian, afterSunset, tenantId // New parameter
    ) {
        try {
            functions.logger.log(`Calculating Hebrew data for ${birthdayId}`);
            // 1. Fetch Tenant Settings for Timezone
            const tenant = await this.tenantRepo.findById(tenantId);
            const timezone = tenant?.timezone || 'Asia/Jerusalem';
            const dateParts = birthDateGregorian.split('-');
            const bDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            const hebcal = await this.hebcalService.fetchHebcalData(bDate, afterSunset);
            // 2. Pass timezone to hebcal service
            const currHy = await this.hebcalService.getCurrentHebrewYear(timezone);
            const futures = await this.hebcalService.fetchNextHebrewBirthdays(currHy, hebcal.hm, hebcal.hd, 10);
            const updateData = {
                birth_date_hebrew_string: hebcal.hebrew,
                birth_date_hebrew_year: hebcal.hy,
                birth_date_hebrew_month: hebcal.hm,
                birth_date_hebrew_day: hebcal.hd,
                gregorian_year: bDate.getFullYear(),
                gregorian_month: bDate.getMonth() + 1,
                gregorian_day: bDate.getDate(),
                hebrew_year: hebcal.hy,
                hebrew_month: hebcal.hm,
                hebrew_day: hebcal.hd,
                updated_at: new Date(),
                _systemUpdate: true
            };
            if (futures.length > 0) {
                // 3. Use timezone-aware "now" for comparison
                // We need to know if the birthday has passed *in the user's timezone*
                const nowInTenant = (0, dateUtils_1.getTenantNow)(timezone);
                nowInTenant.setHours(0, 0, 0, 0); // Reset time part for date comparison
                const next = futures.find(f => f.gregorianDate >= nowInTenant) || futures[0];
                updateData.next_upcoming_hebrew_birthday = next.gregorianDate.toISOString().split('T')[0];
                updateData.next_upcoming_hebrew_year = next.hebrewYear;
                updateData.future_hebrew_birthdays = futures.map(f => ({
                    gregorian: f.gregorianDate.toISOString().split('T')[0],
                    hebrewYear: f.hebrewYear
                }));
            }
            else {
                updateData.future_hebrew_birthdays = [];
                updateData.next_upcoming_hebrew_year = null;
            }
            await this.birthdayRepo.update(birthdayId, updateData);
            return updateData;
        }
        catch (e) {
            functions.logger.error('Hebcal error:', e);
            throw e;
        }
    }
    shouldCalculate(beforeData, afterData) {
        // אם זה system update שזה עתה בוצע (הדגל קיים עכשיו אבל לא היה קודם) - דלג
        // כך נמנע לופ אינסופי, אבל נאפשר עדכונים עתידיים של המשתמש
        if (afterData._systemUpdate && !beforeData?._systemUpdate) {
            return false;
        }
        const hasHebrew = afterData.birth_date_hebrew_string && afterData.future_hebrew_birthdays?.length;
        // אם זה יום הולדת חדש לגמרי (אין beforeData)
        if (!beforeData) {
            return !hasHebrew;
        }
        // אם זה עדכון - בדוק אם התאריך השתנה
        const gregorianChanged = beforeData.birth_date_gregorian !== afterData.birth_date_gregorian;
        const sunsetChanged = beforeData.after_sunset !== afterData.after_sunset;
        const dateChanged = gregorianChanged || sunsetChanged;
        if (dateChanged) {
            // התאריך השתנה - חייב לחשב מחדש!
            return true;
        }
        // בדיקה חדשה: אם יום ההולדת העברי הקרוב עבר - חייבים לחשב מחדש
        // Note: We can't actullay do a perfect check here without fetching the tenant timezone
        // which effectively makes 'shouldCalculate' dependent on DB which we usually want to avoid in triggers pre-checks.
        // However, the 'next_upcoming_hebrew_birthday' is stored as YYYY-MM-DD.
        // We will do a looser check against UTC here, knowing the scheduled job catches edge cases.
        if (afterData.next_upcoming_hebrew_birthday) {
            const nextDate = new Date(afterData.next_upcoming_hebrew_birthday);
            const today = new Date(); // UTC
            today.setHours(0, 0, 0, 0);
            if (nextDate < today) {
                functions.logger.log(`Hebrew birthday has passed for birthday, recalculating...`);
                return true;
            }
        }
        // התאריך לא השתנה - חשב רק אם אין תאריך עברי
        return !hasHebrew;
    }
}
exports.CalculateHebrewDataUseCase = CalculateHebrewDataUseCase;
//# sourceMappingURL=CalculateHebrewDataUseCase.js.map