"use strict";
// GoogleOAuthUseCase - אימות Google OAuth
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthUseCase = void 0;
class GoogleOAuthUseCase {
    constructor(authClient, calendarClient, tokenRepo) {
        this.authClient = authClient;
        this.calendarClient = calendarClient;
        this.tokenRepo = tokenRepo;
    }
    async exchangeCode(code, userId) {
        await this.authClient.exchangeCode(code, userId);
        const tokenData = await this.tokenRepo.findByUserId(userId);
        return { accessToken: tokenData?.accessToken || '' };
    }
    async disconnect(userId) {
        await this.tokenRepo.delete(userId);
    }
    async getStatus(userId) {
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
        }
        catch (e) {
            // Ignore
        }
        let currentCalId = tokenData.calendarId || 'primary';
        let currentCalName = tokenData.calendarName || 'Primary Calendar';
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
    async getAccountInfo(userId) {
        return await this.calendarClient.getUserInfo(userId);
    }
}
exports.GoogleOAuthUseCase = GoogleOAuthUseCase;
//# sourceMappingURL=GoogleOAuthUseCase.js.map