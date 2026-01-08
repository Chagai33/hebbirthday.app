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

  async execute(userId: string, tenantId: string): Promise<{ deletedCount: number; remaining: boolean }> {
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
    let calendarId: string;
    try {
      const accessToken = await this.authClient.getValidAccessToken(userId);
      if (!accessToken) throw new Error('No access token');
      calendarId = await this.authClient.getCalendarId(userId);
    } catch (error: unknown) {
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
      } catch (e: unknown) {
        const error = e as { code?: number; message?: string };
        if (error.code === 404 || error.code === 410) {
            // Already deleted
        } else {
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