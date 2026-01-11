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
        // 3. Handle Missing Calendar
        if (!calendarId) {
            functions.logger.log('[DeleteJob] No dedicated calendar found in settings. Skipping Google cleanup.');
            await this.nukeDatabase(tenantId, userId);
            return { deletedCount: 0, remaining: false };
        }
        // 4. List Events from Google Calendar - Get events created by THIS app
        functions.logger.log(`[DeleteJob] Searching in calendar: ${calendarId} for events with createdByApp=hebbirthday...`);
        let response;
        try {
            // Fetch events created by THIS app from the CORRECT calendar
            response = await this.calendarClient.listEvents(userId, calendarId, {
                privateExtendedProperty: ['createdByApp=hebbirthday'],
                maxResults: 250, // Process in chunks
                singleEvents: true
            });
        }
        catch (error) {
            const err = error;
            if (err.code === 404) {
                functions.logger.log('[DeleteJob] Calendar already deleted or not accessible. Skipping Google cleanup.');
                await this.nukeDatabase(tenantId, userId);
                return { deletedCount: 0, remaining: false };
            }
            throw error; // Re-throw other errors
        }
        functions.logger.log(`Found ${response.items.length} events to delete.`);
        if (response.items.length === 0) {
            // 5. No more events to delete from Google -> Final Cleanup
            functions.logger.log('Google Calendar cleanup complete. Nuking Database...');
            await this.nukeDatabase(tenantId, userId);
            return { deletedCount: 0, remaining: false };
        }
        // 6. Execute Batch Deletion from Google with Strict Rate Control
        functions.logger.log(`Deleting batch of ${response.items.length} events from Google (rate-controlled)...`);
        // 6.1 Chunking for Rate Safety (3 events per chunk, 1 second delay)
        const chunkSize = 3;
        const chunks = [];
        for (let i = 0; i < response.items.length; i += chunkSize) {
            chunks.push(response.items.slice(i, i + chunkSize));
        }
        let deletedCount = 0;
        let failedCount = 0;
        // 6.2 Process chunks sequentially with rate limiting
        for (const chunk of chunks) {
            const promises = chunk.map(async (event) => {
                try {
                    await this.calendarClient.deleteEvent(userId, calendarId, event.id);
                    deletedCount++;
                    // Also delete from local DB if we have a matching birthday
                    const birthdayQuery = await this.db.collection('birthdays')
                        .where('tenant_id', '==', tenantId)
                        .where('googleCalendarEventId', '==', event.id)
                        .limit(1)
                        .get();
                    if (!birthdayQuery.empty) {
                        await this.db.collection('birthdays').doc(birthdayQuery.docs[0].id).delete();
                    }
                }
                catch (error) {
                    const err = error;
                    // Ignore 404 and 410 (already deleted)
                    if (err.code === 404 || err.code === 410) {
                        // Count as successful deletion (event was already gone)
                        deletedCount++;
                        return;
                    }
                    // Rate limit errors - critical, will trigger Cloud Tasks retry
                    if (err.code === 403 || err.code === 429) {
                        functions.logger.warn(`Rate limit hit for event ${event.id}: ${err.message}`);
                        failedCount++;
                        return;
                    }
                    // Other errors - log but continue
                    functions.logger.warn(`Failed to delete event ${event.id}: ${err.message || 'Unknown error'}`);
                    failedCount++;
                }
            });
            await Promise.all(promises);
            // 6.3 Rate Limit Delay (1 second between chunks)
            if (chunks.length > 1) { // Only delay if there are multiple chunks
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        // 6.4 Cloud Tasks Backoff Trigger
        if (failedCount > 0) {
            functions.logger.log(`[DeleteJob] ${failedCount} deletions failed (likely rate limit). Triggering Cloud Task retry with backoff.`);
            return { deletedCount, remaining: true }; // Keep user data, retry later with exponential backoff
        }
        // 7. Only proceed to final DB cleanup if we had 0 critical errors
        if (response.nextPageToken) {
            functions.logger.log(`[DeleteJob] Batch complete (${deletedCount} deleted). More events available, re-queuing...`);
            return { deletedCount, remaining: true };
        }
        // All events deleted successfully - proceed to final cleanup
        functions.logger.log(`[DeleteJob] All events deleted (${deletedCount} total). Proceeding to database cleanup...`);
        await this.nukeDatabase(tenantId, userId);
        return { deletedCount, remaining: false };
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