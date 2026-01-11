"use strict";
// TenantRepository - גישה לנתוני tenants ב-Firestore
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRepository = void 0;
class TenantRepository {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const doc = await this.db.collection('tenants').doc(id).get();
        if (!doc.exists)
            return null;
        return doc.data();
    }
    async update(id, data) {
        await this.db.collection('tenants').doc(id).update(data);
    }
    getDocRef(id) {
        return this.db.collection('tenants').doc(id);
    }
    async setCalendarId(id, calendarId) {
        await this.update(id, { googleCalendarId: calendarId });
    }
    async getCalendarId(id) {
        const tenant = await this.findById(id);
        return tenant?.googleCalendarId || null;
    }
    async clearCalendarId(id) {
        await this.update(id, { googleCalendarId: null, hasCustomCalendarName: false });
    }
    async setCustomCalendarNameFlag(id, isCustom) {
        await this.update(id, { hasCustomCalendarName: isCustom });
    }
}
exports.TenantRepository = TenantRepository;
//# sourceMappingURL=TenantRepository.js.map