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
exports.ProcessAccountDeletionUseCase = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
class ProcessAccountDeletionUseCase {
    constructor(tenantRepo, authClient, calendarClient, db) {
        this.tenantRepo = tenantRepo;
        this.authClient = authClient;
        this.calendarClient = calendarClient;
        this.db = db;
    }
    async execute(userId, tenantId) {
        // 1. Validate Tenant Status
        const tenant = await this.tenantRepo.findById(tenantId);
        if (!tenant) {
            functions.logger.log('Tenant already deleted. Exiting.');
            return { deletedCount: 0, remaining: false };
        }
        if (tenant.deletionStatus !== 'PENDING') {
            functions.logger.warn(`Tenant ${tenantId} is not marked for deletion (Status: ${tenant.deletionStatus})`);
            return { deletedCount: 0, remaining: false };
        }
        // 2. Auth Check - Fail Fast if Revoked
        let calendarId;
        try {
            const accessToken = await this.authClient.getValidAccessToken(userId);
            if (!accessToken)
                throw new Error('No access token');
            calendarId = await this.authClient.getCalendarId(userId);
        }
        catch (error) {
            functions.logger.error(`Auth failed for user ${userId}. Skipping Google cleanup and nuking DB.`, error);
            await this.nukeDatabase(tenantId, userId);
            return { deletedCount: 0, remaining: false };
        }
        // 3. Batch Fetch - Get up to 50 synced birthdays
        const snapshot = await this.db.collection('birthdays')
            .where('tenant_id', '==', tenantId)
            .orderBy('googleCalendarEventId')
            .limit(50)
            .get();
        const eventsToDelete = snapshot.docs
            .map(doc => ({
            docId: doc.id,
            eventId: doc.data().googleCalendarEventId
        }))
            .filter(item => !!item.eventId);
        if (eventsToDelete.length === 0) {
            // 4. No more events to delete from Google -> Final Cleanup
            functions.logger.log('Google Calendar cleanup complete. Nuking Database...');
            await this.nukeDatabase(tenantId, userId);
            return { deletedCount: 0, remaining: false };
        }
        // 5. Execute Batch Deletion from Google
        functions.logger.log(`Deleting batch of ${eventsToDelete.length} events from Google...`);
        let deletedCount = 0;
        const deletionPromises = eventsToDelete.map(async ({ eventId, docId }) => {
            try {
                await this.calendarClient.deleteEvent(userId, calendarId, eventId);
                deletedCount++;
            }
            catch (e) {
                const error = e;
                if (error.code === 404 || error.code === 410) {
                    // Already deleted
                }
                else {
                    functions.logger.warn(`Failed to delete event ${eventId}: ${error.message || 'Unknown error'}`);
                }
            }
            // Delete local doc to prevent re-fetching
            await this.db.collection('birthdays').doc(docId).delete();
        });
        await Promise.all(deletionPromises);
        // 6. Recursion - Re-queue immediately
        return { deletedCount, remaining: true };
    }
    async nukeDatabase(tenantId, userId) {
        const bulk = this.db.bulkWriter();
        const deleteQuery = async (collection) => {
            const snaps = await this.db.collection(collection).where('tenant_id', '==', tenantId).get();
            snaps.forEach(doc => bulk.delete(doc.ref));
        };
        await deleteQuery('birthdays');
        await deleteQuery('groups');
        await deleteQuery('tenant_members');
        await deleteQuery('wishlist_items');
        bulk.delete(this.db.collection('tenants').doc(tenantId));
        bulk.delete(this.db.collection('users').doc(userId));
        await bulk.close();
        try {
            await admin.auth().deleteUser(userId);
        }
        catch (e) {
            functions.logger.warn('User might already be deleted from Auth', e);
        }
    }
}
exports.ProcessAccountDeletionUseCase = ProcessAccountDeletionUseCase;
//# sourceMappingURL=ProcessAccountDeletionUseCase.js.map