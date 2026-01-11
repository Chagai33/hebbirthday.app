"use strict";
// Shared constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETION_QUEUE = exports.QUEUE = exports.LOCATION = exports.PROJECT_ID = void 0;
exports.PROJECT_ID = JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId;
exports.LOCATION = 'us-central1';
exports.QUEUE = 'calendar-sync';
exports.DELETION_QUEUE = 'deletion-queue';
//# sourceMappingURL=index.js.map