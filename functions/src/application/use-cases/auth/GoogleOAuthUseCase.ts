// GoogleOAuthUseCase - אימות Google OAuth

import { GoogleAuthClient } from '../../../infrastructure/google/GoogleAuthClient';
import { GoogleCalendarClient } from '../../../infrastructure/google/GoogleCalendarClient';
import { TokenRepository } from '../../../infrastructure/database/repositories/TokenRepository';

export class GoogleOAuthUseCase {
  constructor(
    private authClient: GoogleAuthClient,
    private calendarClient: GoogleCalendarClient,
    private tokenRepo: TokenRepository
  ) {}

  async exchangeCode(code: string, userId: string): Promise<{ accessToken: string }> {
    await this.authClient.exchangeCode(code, userId);
    const tokenData = await this.tokenRepo.findByUserId(userId);
    return { accessToken: tokenData?.accessToken || '' };
  }

  async disconnect(userId: string): Promise<void> {
    await this.tokenRepo.delete(userId);
  }

  async getStatus(userId: string): Promise<any> {
    const tokenData = await this.tokenRepo.findByUserId(userId);
    if (!tokenData || !tokenData.accessToken) {
      return { isConnected: false };
    }

    let email = '';
    let name = '';
    let picture = '';

    try {
      const userInfo = await this.calendarClient.getUserInfo(userId);
      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture;
    } catch (e) {
      // Ignore
    }

    let currentCalId: string | null = tokenData.calendarId || 'primary';
    let currentCalName: string | null = tokenData.calendarName || 'Primary Calendar';
    let isPrimary = currentCalId === 'primary' || (email && currentCalId === email);

    // Validate calendar existence if we have a non-primary calendar
    if (currentCalId && currentCalId !== 'primary' && (!email || currentCalId !== email)) {
      const calendarInfo = await this.calendarClient.getCalendar(userId, currentCalId);
      if (!calendarInfo) {
        // Ghost calendar detected - clean up the DB
        await this.tokenRepo.update(userId, {
          calendarId: null,
          calendarName: null
        });
        // Return status indicating setup is needed
        currentCalId = null;
        currentCalName = null;
        isPrimary = false;
      }
    }

    return {
      isConnected: true,
      email,
      name,
      picture,
      calendarId: currentCalId,
      calendarName: currentCalName,
      isPrimary,
      syncStatus: tokenData.syncStatus || 'IDLE',
      lastSyncStart: tokenData.lastSyncStart || 0
    };
  }

  async getAccountInfo(userId: string): Promise<{ email: string; name: string; picture: string }> {
    return await this.calendarClient.getUserInfo(userId);
  }
}



