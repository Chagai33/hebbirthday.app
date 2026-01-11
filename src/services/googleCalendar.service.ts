import { functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { GoogleCalendarStatus, SyncResult, BulkSyncResult, CleanupOrphansResult, PreviewDeletionResult } from '../types';

class GoogleCalendarService {
    async getStatus(_userId: string): Promise<GoogleCalendarStatus> {
        const getStatusFn = httpsCallable<any, GoogleCalendarStatus>(functions, 'getGoogleCalendarStatus');
        const result = await getStatusFn();
        return result.data;
    }

    async initiateGoogleOAuth(): Promise<{ accessToken: string }> {
        return new Promise((resolve, reject) => {
            const google = (window as any).google;
            if (!google?.accounts.oauth2) {
                reject(new Error('Google Identity Services not loaded'));
                return;
            }

            const client = google.accounts.oauth2.initCodeClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
                ux_mode: 'popup',
                callback: async (response: any) => {
                    if (response.code) {
                        try {
                            const exchangeFn = httpsCallable<{code: string}, {accessToken: string}>(functions, 'exchangeGoogleAuthCode');
                            const res = await exchangeFn({ code: response.code });
                            resolve(res.data);
  } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(new Error('Failed to get authorization code'));
                    }
                },
                error_callback: (error: unknown) => {
                    reject(error);
                }
            });
            client.requestCode();
        });
    }

    async syncBirthdayToCalendar(birthdayId: string): Promise<SyncResult> {
        const syncFn = httpsCallable<{birthdayId: string}, SyncResult>(functions, 'syncBirthdayToGoogleCalendar');
        try {
            const result = await syncFn({ birthdayId });
            return result.data;
        } catch (error: any) {
            // Handle ghost calendar errors
            if (error.code === 'functions/not-found' ||
                error.message?.includes('404') ||
                error.message?.includes('Resource has been deleted')) {
                throw new Error('CALENDAR_DELETED');
            }
            throw error;
        }
    }

    async syncMultipleBirthdays(birthdayIds: string[]): Promise<BulkSyncResult> {
        const syncFn = httpsCallable<{birthdayIds: string[]}, BulkSyncResult>(functions, 'syncMultipleBirthdaysToGoogleCalendar');
        try {
            const result = await syncFn({ birthdayIds });
            return result.data;
        } catch (error: any) {
            // Handle ghost calendar errors
            if (error.code === 'functions/not-found' ||
                error.message?.includes('404') ||
                error.message?.includes('Resource has been deleted')) {
                throw new Error('CALENDAR_DELETED');
            }
            throw error;
        }
    }

    async removeBirthdayFromCalendar(birthdayId: string): Promise<void> {
        const removeFn = httpsCallable<{birthdayId: string}, void>(functions, 'removeBirthdayFromGoogleCalendar');
        await removeFn({ birthdayId });
    }
    
    async cleanupOrphanEvents(tenantId: string, dryRun: boolean): Promise<CleanupOrphansResult> {
         const fn = httpsCallable<{tenantId: string; dryRun: boolean}, CleanupOrphansResult>(functions, 'cleanupOrphanEvents');
         const res = await fn({ tenantId, dryRun });
         return res.data;
    }

    async previewDeletion(tenantId: string): Promise<PreviewDeletionResult> {
         const fn = httpsCallable<{tenantId: string}, PreviewDeletionResult>(functions, 'previewDeletion');
         const res = await fn({ tenantId });
         return res.data;
    }

    async deleteAllSyncedEvents(tenantId: string, forceDBOnly?: boolean): Promise<{ success: boolean; message: string }> {
        const fn = httpsCallable<{tenantId: string}, { success: boolean; message: string }>(functions, 'triggerDeleteAllEvents');
        const res = await fn({ tenantId });
        return res.data;
    }

    async disconnectCalendar(): Promise<void> {
        const fn = httpsCallable<void, void>(functions, 'disconnectGoogleCalendar');
        await fn();
    }

    async createCalendar(name: string, tenantId: string): Promise<{ calendarId: string; calendarName: string }> {
        const fn = httpsCallable<{name: string, tenantId: string}, { calendarId: string; calendarName: string }>(functions, 'createGoogleCalendar');
        const res = await fn({ name, tenantId });
        return res.data;
    }

    async updateCalendarSelection(calendarId: string, calendarName: string, tenantId: string): Promise<{ calendarId: string; calendarName: string }> {
        const fn = httpsCallable<{calendarId: string; calendarName: string; tenantId: string}, { calendarId: string; calendarName: string }>(functions, 'updateGoogleCalendarSelection');
        const res = await fn({ calendarId, calendarName, tenantId });
        return res.data;
    }

    async listCalendars(): Promise<Array<{ id: string; summary: string; description: string; primary: boolean }>> {
        const fn = httpsCallable<void, { calendars: Array<{ id: string; summary: string; description: string; primary: boolean }> }>(functions, 'listGoogleCalendars');
        const res = await fn();
        return res.data.calendars;
    }

    async deleteCalendar(calendarId: string, tenantId: string): Promise<void> {
        const fn = httpsCallable<{calendarId: string, tenantId: string}, void>(functions, 'deleteGoogleCalendar');
        await fn({ calendarId, tenantId });
    }

    async resetBirthdaySyncData(birthdayId: string): Promise<void> {
        const fn = httpsCallable<{birthdayId: string}, void>(functions, 'resetBirthdaySyncData');
        await fn({ birthdayId });
    }
}

export const googleCalendarService = new GoogleCalendarService();
