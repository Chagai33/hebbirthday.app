"use strict";
// Management Functions - Account & System Management
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
exports.deleteAccountFn = exports.getAccountDeletionSummaryFn = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const dependencies_1 = require("../dependencies");
// Get account deletion summary
exports.getAccountDeletionSummaryFn = functions.https.onCall(async (data, context) => {
    const deps = (0, dependencies_1.createDependencies)();
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
exports.deleteAccountFn = functions.https.onCall(async (data, context) => {
    const deps = (0, dependencies_1.createDependencies)();
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
    }
    catch (error) {
        functions.logger.error('Failed to queue deletion task', error);
        throw new functions.https.HttpsError('internal', 'Deletion initiation failed');
    }
    return { success: true, message: 'Account deletion started in background' };
});
//# sourceMappingURL=management-functions.js.map