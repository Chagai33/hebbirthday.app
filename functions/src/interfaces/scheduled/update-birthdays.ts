// Scheduled function - Update next birthdays hourly for tenants at their local midnight

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createDependencies } from '../dependencies';
import { getTenantsNeedingBirthdayUpdate, getCurrentDateString } from '../../utils/dateUtils';

const deps = createDependencies();

export const updateNextBirthdayScheduledFn = functions.pubsub
  .schedule('0 * * * *')  // Run every hour (at minute 0) - Cron syntax
  .timeZone('UTC')  // Run on UTC (timezone-neutral)
  .onRun(async (context) => {
    try {
      // Get tenants whose local time is midnight AND haven't been processed today
      const tenantsToUpdate = await getTenantsNeedingBirthdayUpdate();

      if (tenantsToUpdate.length === 0) {
        functions.logger.log('No tenants need processing at this hour');
        return null;
      }

      functions.logger.log(`Processing ${tenantsToUpdate.length} tenant(s) at their local midnight`);

      // Process each tenant
      for (const { id: tenantId, timezone } of tenantsToUpdate) {
        const localDateString = getCurrentDateString(timezone);

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
          functions.logger.log(
            `✅ Tenant ${tenantId} (${timezone}): Updated ${snapshot.size} birthday(s)`
          );
        }

        // Mark this tenant as processed for today (in their local time)
        await deps.db.collection('tenants').doc(tenantId).update({
          last_birthday_process_date: localDateString,
        });
      }

      return null;
    } catch (error) {
      functions.logger.error('Error in scheduled birthday update:', error);
      return null;
    }
  });

