"use strict";
// Scheduled function - Update next birthdays hourly for tenants at their local midnight
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
exports.updateNextBirthdayScheduledFn = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const dependencies_1 = require("../dependencies");
const dateUtils_1 = require("../../utils/dateUtils");
const deps = (0, dependencies_1.createDependencies)();
exports.updateNextBirthdayScheduledFn = functions.pubsub
    .schedule('every 1 hours') // Changed from 'every day 00:00' - run hourly
    .timeZone('UTC') // Run on UTC (timezone-neutral)
    .onRun(async (context) => {
    try {
        // Get tenants whose local time is midnight AND haven't been processed today
        const tenantsToUpdate = await (0, dateUtils_1.getTenantsNeedingBirthdayUpdate)();
        if (tenantsToUpdate.length === 0) {
            functions.logger.log('No tenants need processing at this hour');
            return null;
        }
        functions.logger.log(`Processing ${tenantsToUpdate.length} tenant(s) at their local midnight`);
        // Process each tenant
        for (const { id: tenantId, timezone } of tenantsToUpdate) {
            const localDateString = (0, dateUtils_1.getCurrentDateString)(timezone);
            // Find birthdays with outdated next_upcoming_hebrew_birthday
            const snapshot = await deps.db
                .collection('birthdays')
                .where('tenant_id', '==', tenantId)
                .where('archived', '==', false)
                .where('next_upcoming_hebrew_birthday', '<', localDateString)
                .get();
            if (!snapshot.empty) {
                const batch = deps.db.batch();
                snapshot.docs.forEach((doc) => {
                    batch.update(doc.ref, {
                        updated_at: admin.firestore.FieldValue.serverTimestamp()
                    });
                });
                await batch.commit();
                functions.logger.log(`✅ Tenant ${tenantId} (${timezone}): Updated ${snapshot.size} birthday(s)`);
            }
            // Mark this tenant as processed for today (in their local time)
            await deps.db.collection('tenants').doc(tenantId).update({
                last_birthday_process_date: localDateString,
            });
        }
        return null;
    }
    catch (error) {
        functions.logger.error('Error in scheduled birthday update:', error);
        return null;
    }
});
//# sourceMappingURL=update-birthdays.js.map