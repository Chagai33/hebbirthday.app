// Management Functions - Account & System Management

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createDependencies } from '../dependencies';

// Get account deletion summary
export const getAccountDeletionSummaryFn = functions.https.onCall(async (data, context) => {
  const deps = createDependencies();
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  const bCount = await deps.db
    .collection('birthdays')
    .where('tenant_id', '==', data.tenantId)
    .count()
    .get();
  const gCount = await deps.db
    .collection('groups')
    .where('tenant_id', '==', data.tenantId)
    .count()
    .get();

  return { birthdaysCount: bCount.data().count, groupsCount: gCount.data().count };
});

// Delete account
export const deleteAccountFn = functions.https.onCall(async (data, context) => {
  const deps = createDependencies();
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  const { tenantId } = data;
  const userId = context.auth.uid;
  const tDocRef = deps.db.collection('tenants').doc(tenantId);
  const tDoc = await tDocRef.get();

  if (tDoc.data()?.owner_id !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Not owner');
  }

  // 1. Soft Delete & Lock
  await tDocRef.update({
    deletionStatus: 'PENDING',
    deletionStartedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 2. Start Background Job
  try {
      await deps.tasksClient.createDeletionTask({ userId, tenantId });
  } catch (error) {
      functions.logger.error('Failed to queue deletion task', error);
      throw new functions.https.HttpsError('internal', 'Deletion initiation failed');
  }

  return { success: true, message: 'Account deletion started in background' };
});


