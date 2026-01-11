// TenantRepository - גישה לנתוני tenants ב-Firestore

import * as admin from 'firebase-admin';
import { TenantData } from '../../../domain/entities/types';

export class TenantRepository {
  constructor(private db: admin.firestore.Firestore) {}

  async findById(id: string): Promise<TenantData | null> {
    const doc = await this.db.collection('tenants').doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as TenantData;
  }

  async update(id: string, data: Partial<TenantData>): Promise<void> {
    await this.db.collection('tenants').doc(id).update(data);
  }

  getDocRef(id: string): admin.firestore.DocumentReference {
    return this.db.collection('tenants').doc(id);
  }

  async setCalendarId(id: string, calendarId: string): Promise<void> {
    await this.update(id, { googleCalendarId: calendarId });
  }

  async getCalendarId(id: string): Promise<string | null> {
    const tenant = await this.findById(id);
    return tenant?.googleCalendarId || null;
  }

  async clearCalendarId(id: string): Promise<void> {
    await this.update(id, { googleCalendarId: null, hasCustomCalendarName: false });
  }

  async setCustomCalendarNameFlag(id: string, isCustom: boolean): Promise<void> {
    await this.update(id, { hasCustomCalendarName: isCustom });
  }
}



