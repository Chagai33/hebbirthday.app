import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { googleCalendarService } from '../services/googleCalendar.service';
import { useAuth } from './AuthContext';
import { GoogleCalendarContextType, SyncResult, BulkSyncResult, CleanupOrphansResult, PreviewDeletionResult } from '../types';
import { logger } from '../utils/logger';
import { useToast } from './ToastContext';

const GoogleCalendarContext = createContext<GoogleCalendarContextType | undefined>(undefined);

export const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
  }
  return context;
};

interface GoogleCalendarProviderProps {
  children: ReactNode;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GoogleCalendarProvider: React.FC<GoogleCalendarProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [calendarName, setCalendarName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refreshStatus();
    } else {
      setIsConnected(false);
      setLastSyncTime(null);
      setUserEmail(null);
      setCalendarId(null);
      setCalendarName(null);
    }
  }, [user]);

  const refreshStatus = async () => {
    if (!user) return;

    try {
      const status = await googleCalendarService.getTokenStatus(user.id);
      setIsConnected(status.isConnected);

      if (status.lastSyncTime) {
        setLastSyncTime(new Date(status.lastSyncTime));
      }

      if (status.userEmail) {
        setUserEmail(status.userEmail);
      }

      if (status.calendarId) {
        setCalendarId(status.calendarId);
      }

      if (status.calendarName) {
        setCalendarName(status.calendarName);
      }

      // אם יש מייל ב-status, נשתמש בו
      if (status.isConnected && status.userEmail && !userEmail) {
        setUserEmail(status.userEmail);
      }
      
      // אם מחובר אבל אין מייל, נטען את פרטי המשתמש - קריטי!
      if (status.isConnected && !userEmail) {
        try {
          const accountInfo = await googleCalendarService.getGoogleAccountInfo();
          if (accountInfo?.email) {
            setUserEmail(accountInfo.email);
            logger.log('User email loaded in refreshStatus:', accountInfo.email);
          }
        } catch (emailError: any) {
          logger.error('Error loading user email in refreshStatus:', emailError);
          
          // אם הטוקן פג תוקף, ננתק את החיבור
          if (emailError.message?.includes('פג תוקף') || emailError.message?.includes('permission-denied')) {
            logger.warn('Token expired, disconnecting Google Calendar');
            setIsConnected(false);
            setUserEmail(null);
            setCalendarId(null);
            setCalendarName(null);
            showToast(t('googleCalendar.connectFirst'), 'warning');
            return;
          }
          
          // ננסה שוב אחרי רגע רק אם זו לא שגיאת הרשאה
          setTimeout(async () => {
            try {
              const accountInfo = await googleCalendarService.getGoogleAccountInfo();
              if (accountInfo?.email) {
                setUserEmail(accountInfo.email);
              }
            } catch (retryError) {
              logger.error('Retry failed to load user email:', retryError);
            }
          }, 2000);
        }
      }
    } catch (error) {
      logger.error('Error refreshing Google Calendar status:', error);
    }
  };

  const connectToGoogle = async () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      showToast(t('googleCalendar.apiError'), 'error');
      return;
    }

    setIsSyncing(true);

    try {
      const tokenResponse = await googleCalendarService.initiateGoogleOAuth();

      if (!tokenResponse.accessToken) {
        throw new Error(t('googleCalendar.noToken'));
      }

      await googleCalendarService.saveAccessToken(tokenResponse.accessToken, tokenResponse.expiresIn);

      // טעינת פרטי משתמש אחרי חיבור - קריטי!
      try {
        const accountInfo = await googleCalendarService.getGoogleAccountInfo();
        if (accountInfo?.email) {
          setUserEmail(accountInfo.email);
          logger.log('User email loaded:', accountInfo.email);
        } else {
          logger.warn('No email received from Google account info');
        }
      } catch (emailError: any) {
        logger.error('Error loading user email:', emailError);
        // לא נזרוק שגיאה כאן, רק נוודא שהמייל יטען ב-refreshStatus
      }

      await refreshStatus();

      // אם עדיין אין מייל אחרי refreshStatus, ננסה שוב
      // נבדוק את ה-state אחרי refreshStatus
      const currentStatus = await googleCalendarService.getTokenStatus(user!.id);
      if (currentStatus.isConnected && !currentStatus.userEmail) {
        try {
          const accountInfo = await googleCalendarService.getGoogleAccountInfo();
          if (accountInfo?.email) {
            setUserEmail(accountInfo.email);
            logger.log('User email loaded in retry:', accountInfo.email);
          }
        } catch (retryError) {
          logger.error('Retry failed to load user email:', retryError);
        }
      }

      showToast(t('googleCalendar.connected'), 'success');
    } catch (error: any) {
      logger.error('Error connecting to Google Calendar:', error);
      showToast(error.message || t('googleCalendar.syncError'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncSingleBirthday = async (birthdayId: string): Promise<SyncResult> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      const result = await googleCalendarService.syncBirthdayToCalendar(birthdayId);

      if (result.success) {
        setLastSyncTime(new Date());
        showToast(t('googleCalendar.syncSuccess'), 'success');
      } else {
        showToast(result.error || t('googleCalendar.syncError'), 'error');
      }

      return result;
    } catch (error: any) {
      logger.error('Error syncing birthday:', error);
      showToast(error.message || t('googleCalendar.syncError'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncMultipleBirthdays = async (birthdayIds: string[]): Promise<BulkSyncResult> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      
      // Chunk processing to chunks of 5
      const chunkSize = 5;
      const results: SyncResult[] = [];
      let successCount = 0;
      let failureCount = 0;
      
      for (let i = 0; i < birthdayIds.length; i += chunkSize) {
        const chunk = birthdayIds.slice(i, i + chunkSize);
        
        try {
             // Process chunk
             const chunkResult = await googleCalendarService.syncMultipleBirthdays(chunk);
             if (chunkResult.results) {
                 results.push(...chunkResult.results);
             }
             successCount += chunkResult.successCount;
             failureCount += chunkResult.failureCount;
             
             // Add small delay between chunks if needed, or just continue
        } catch (chunkError) {
            logger.error(`Error syncing chunk ${i/chunkSize}:`, chunkError);
            // Mark all in chunk as failed if the bulk call itself failed completely
            failureCount += chunk.length;
            chunk.forEach(id => {
                results.push({
                    success: false,
                    birthdayId: id,
                    error: 'Batch sync failed'
                });
            });
        }
      }

      setLastSyncTime(new Date());
      
      const finalResult: BulkSyncResult = {
          totalAttempted: birthdayIds.length,
          successCount,
          failureCount,
          results
      };

      showToast(t('googleCalendar.syncedCount', { count: successCount }), 'success');

      return finalResult;
    } catch (error: any) {
      logger.error('Error syncing multiple birthdays:', error);
      showToast(error.message || t('googleCalendar.syncError'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const cleanupOrphanEvents = async (tenantId: string): Promise<CleanupOrphansResult> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      const result = await googleCalendarService.cleanupOrphanEvents(tenantId);
      showToast(t('googleCalendar.cleanupSuccess', { count: result.deletedCount }), 'success');
      return result;
    } catch (error: any) {
      logger.error('Error cleaning orphans:', error);
      showToast(error.message || t('common.error'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const previewDeletion = async (tenantId: string): Promise<PreviewDeletionResult> => {
     if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }
    
    try {
        setIsSyncing(true);
        const result = await googleCalendarService.previewDeletion(tenantId);
        return result;
    } catch (error: any) {
        logger.error('Error previewing deletion:', error);
        showToast(error.message || t('common.error'), 'error');
        throw error;
    } finally {
        setIsSyncing(false);
    }
  };

  const removeBirthdayFromCalendar = async (birthdayId: string): Promise<void> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      await googleCalendarService.removeBirthdayFromCalendar(birthdayId);
      showToast(t('googleCalendar.removedSuccess'), 'success');
    } catch (error: any) {
      logger.error('Error removing birthday:', error);
      showToast(error.message || t('common.error'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteAllSyncedEvents = async (tenantId: string): Promise<{ totalDeleted: number; failedCount: number }> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      const result = await googleCalendarService.deleteAllSyncedEvents(tenantId);
      showToast(t('googleCalendar.eventsDeletedSuccess', { count: result.totalDeleted }), 'success');
      return result;
    } catch (error: any) {
      logger.error('Error deleting all synced events:', error);
      showToast(error.message || t('common.error'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      await googleCalendarService.disconnectCalendar();

      setIsConnected(false);
      setLastSyncTime(null);
      setUserEmail(null);
      setCalendarId(null);
      setCalendarName(null);
      showToast(t('googleCalendar.disconnectedSuccess'), 'success');
    } catch (error: any) {
      logger.error('Error disconnecting:', error);
      showToast(error.message || t('common.error'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const createCalendar = async (name: string): Promise<{ calendarId: string; calendarName: string }> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      const result = await googleCalendarService.createCalendar(name);
      
      setCalendarId(result.calendarId);
      setCalendarName(result.calendarName);
      
      showToast(t('googleCalendar.createdSuccess'), 'success');
      return result;
    } catch (error: any) {
      logger.error('Error creating calendar:', error);
      showToast(error.message || t('common.error'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateCalendarSelection = async (selectedCalendarId: string, selectedCalendarName: string): Promise<void> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      await googleCalendarService.updateCalendarSelection(selectedCalendarId, selectedCalendarName);
      
      setCalendarId(selectedCalendarId);
      setCalendarName(selectedCalendarName);
      
      showToast(t('googleCalendar.calendarSelectionUpdated'), 'success');
    } catch (error: any) {
      logger.error('Error updating calendar selection:', error);
      showToast(error.message || t('common.error'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const listCalendars = async (): Promise<Array<{ id: string; summary: string; description: string; primary: boolean }>> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      const calendars = await googleCalendarService.listCalendars();
      return calendars;
    } catch (error: any) {
      logger.error('Error listing calendars:', error);
      showToast(error.message || t('common.error'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteCalendar = async (calendarIdToDelete: string): Promise<void> => {
    if (!isConnected) {
      showToast(t('googleCalendar.connectFirst'), 'error');
      throw new Error('Not connected to Google Calendar');
    }

    try {
      setIsSyncing(true);
      await googleCalendarService.deleteCalendar(calendarIdToDelete);
      showToast(t('googleCalendar.deletedSuccess'), 'success');
      
      // רענון רשימת היומנים אחרי מחיקה
      await listCalendars();
    } catch (error: any) {
      logger.error('Error deleting calendar:', error);
      showToast(error.message || t('common.error'), 'error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const value: GoogleCalendarContextType = {
    isConnected,
    lastSyncTime,
    isSyncing,
    userEmail,
    calendarId,
    calendarName,
    connectToGoogle,
    syncSingleBirthday,
    syncMultipleBirthdays,
    removeBirthdayFromCalendar,
    deleteAllSyncedEvents,
    disconnect,
    refreshStatus,
    createCalendar,
    updateCalendarSelection,
    listCalendars,
    deleteCalendar,
    cleanupOrphanEvents,
    previewDeletion
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleCalendarContext.Provider value={value}>{children}</GoogleCalendarContext.Provider>
    </GoogleOAuthProvider>
  );
};
