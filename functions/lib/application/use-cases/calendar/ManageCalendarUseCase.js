"use strict";
// ManageCalendarUseCase - ניהול Google Calendars (יצירה, מחיקה, רשימה)
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageCalendarUseCase = void 0;
class ManageCalendarUseCase {
    constructor(calendarClient, tokenRepo, tenantRepo) {
        this.calendarClient = calendarClient;
        this.tokenRepo = tokenRepo;
        this.tenantRepo = tenantRepo;
    }
    getExpectedCalendarName(language) {
        const calendarNames = {
            he: 'יום הולדת עברי/לועזי',
            en: 'Hebrew/Gregorian Birthday',
            es: 'Cumpleaños Hebreo/Gregoriano'
        };
        return calendarNames[language] || calendarNames.he;
    }
    async getOrCreateCalendar(userId, tenantId) {
        // Check DB for existing calendar ID
        const existingCalendarId = await this.tenantRepo.getCalendarId(tenantId);
        if (existingCalendarId) {
            // Check if calendar still exists
            const calendarInfo = await this.calendarClient.getCalendar(userId, existingCalendarId);
            if (calendarInfo) {
                // Calendar exists, check if name needs updating
                const tenant = await this.tenantRepo.findById(tenantId);
                const hasCustomName = tenant?.hasCustomCalendarName || false;
                if (!hasCustomName) {
                    const expectedName = this.getExpectedCalendarName(tenant?.default_language || 'he');
                    if (calendarInfo.summary !== expectedName) {
                        // Update calendar name to match current language
                        await this.calendarClient.updateCalendar(userId, existingCalendarId, expectedName);
                    }
                }
                return existingCalendarId; // In this case, we just return the ID since the calendar already exists
            }
            else {
                // Calendar was manually deleted, clear from DB and proceed to create
                await this.tenantRepo.clearCalendarId(tenantId);
            }
        }
        // No existing calendar or it was cleared, create new one
        const tenant = await this.tenantRepo.findById(tenantId);
        const calendarName = this.getExpectedCalendarName(tenant?.default_language || 'he');
        try {
            const newCalendarId = await this.calendarClient.createCalendar(userId, calendarName);
            await this.tenantRepo.setCalendarId(tenantId, newCalendarId);
            await this.tenantRepo.setCustomCalendarNameFlag(tenantId, false);
            return newCalendarId;
        }
        catch (error) {
            // Handle 401/403 errors (auth issues) distinctly from 404
            if (error.code === 401 || error.code === 403) {
                throw new Error(`Authentication error: ${error.message}`);
            }
            throw error;
        }
    }
    async deleteCalendar(userId, calendarId) {
        await this.calendarClient.deleteCalendar(userId, calendarId);
    }
    async listCalendars(userId) {
        return await this.calendarClient.listCalendars(userId);
    }
    async updateSelection(userId, calendarId, calendarName) {
        await this.tokenRepo.update(userId, {
            calendarId,
            calendarName
        });
    }
}
exports.ManageCalendarUseCase = ManageCalendarUseCase;
//# sourceMappingURL=ManageCalendarUseCase.js.map