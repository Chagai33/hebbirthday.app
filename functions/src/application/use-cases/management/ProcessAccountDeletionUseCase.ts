import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { TenantRepository } from '../../../infrastructure/database/repositories/TenantRepository';
import { GoogleCalendarClient } from '../../../infrastructure/google/GoogleCalendarClient';
import { GoogleAuthClient } from '../../../infrastructure/google/GoogleAuthClient';

export class ProcessAccountDeletionUseCase {
  constructor(
    private tenantRepo: TenantRepository,
    private authClient: GoogleAuthClient,
    private calendarClient: GoogleCalendarClient,
    private db: admin.firestore.Firestore
  ) {}

  async execute(userId: string, tenantId: string, keepCalendar: boolean = false): Promise<{ deletedCount: number; remaining: boolean }> {
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
      if (!accessToken) throw new Error('No access token');
    } catch (error: unknown) {
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
      } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err.code === 404) {
          functions.logger.log(`Calendar ${googleCalendarId} already deleted (404)`);
        } else {
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

  private async nukeDatabase(tenantId: string, userId: string) {
    const bulk = this.db.bulkWriter();

    const deleteQuery = async (collection: string) => {
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
    } catch (e) {
        functions.logger.warn('User might already be deleted from Auth', e);
    }
  }
}