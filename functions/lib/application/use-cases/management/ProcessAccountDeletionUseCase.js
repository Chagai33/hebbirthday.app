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
    async execute(userId, tenantId, keepCalendar = false) {
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
        try {
            const accessToken = await this.authClient.getValidAccessToken(userId);
            if (!accessToken)
                throw new Error('No access token');
        }
        catch (error) {
            functions.logger.error(`Auth failed for user ${userId}. Skipping Google cleanup and nuking DB.`, error);
            await this.nukeDatabase(tenantId, userId);
            return { deletedCount: 0, remaining: false };
        }
        // 3. Handle Calendar Deletion
        const googleCalendarId = await this.tenantRepo.getCalendarId(tenantId);
        if (!keepCalendar && googleCalendarId) {
            try {
                await this.calendarClient.deleteCalendar(userId, googleCalendarId);
                functions.logger.log(`Successfully deleted calendar ${googleCalendarId}`);
            }
            catch (error) {
                const err = error;
                if (err.code === 404) {
                    functions.logger.log(`Calendar ${googleCalendarId} already deleted (404)`);
                }
                else {
                    functions.logger.error(`Failed to delete calendar ${googleCalendarId}:`, error);
                    throw error; // Re-throw non-404 errors
                }
            }
        }
        // 4. Nuke Database - Clean up all data
        functions.logger.log('Proceeding to database cleanup...');
        await this.nukeDatabase(tenantId, userId);
        return { deletedCount: 0, remaining: false };
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