import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { GeltTemplate } from '../types/gelt';
import { retryFirestoreOperation } from './firestore.retry';

// Interface for Firestore document
interface GeltTemplateDocument {
  tenant_id: string;
  name: string;
  description?: string;
  ageGroups: Array<{
    id: string;
    name: string;
    minAge: number;
    maxAge: number;
    amountPerChild: number;
    isIncluded: boolean;
  }>;
  budgetConfig: {
    participants: number;
    allowedOverflowPercentage: number;
    customBudget: number | null; // Always present - null if not set, number if set
  };
  customGroupSettings: Array<{
    id: string;
    name: string;
    minAge: number;
    maxAge: number;
    amountPerChild: number;
    isIncluded: boolean;
  }> | null;
  currency?: 'ILS' | 'USD' | 'EUR';
  created_at: Timestamp | FieldValue | null;
  updated_at: Timestamp | FieldValue | null;
  created_by: string;
  updated_by: string;
  is_default?: boolean;
}

export const geltTemplatesService = {
  // Get all budget templates for tenant
  async getTemplates(tenantId: string): Promise<GeltTemplate[]> {
    return retryFirestoreOperation(async () => {
      const templatesRef = collection(db, 'gelt_templates');
      const q = query(
        templatesRef,
        where('tenant_id', '==', tenantId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data() as GeltTemplateDocument;
        
        // Clean budgetConfig - remove customBudget if it's not valid
        const budgetConfig = data.budgetConfig || {};
        const cleanedBudgetConfig = {
          participants: budgetConfig.participants,
          allowedOverflowPercentage: budgetConfig.allowedOverflowPercentage,
          ...(budgetConfig.customBudget !== undefined && 
              budgetConfig.customBudget !== null && 
              budgetConfig.customBudget > 0
            ? { customBudget: budgetConfig.customBudget }
            : {}),
        };
        
        return {
          id: docSnap.id,
          tenant_id: data.tenant_id,
          name: data.name,
          description: data.description,
          ageGroups: data.ageGroups || [],
          budgetConfig: cleanedBudgetConfig,
          customGroupSettings: data.customGroupSettings || null,
          created_at: data.created_at instanceof Timestamp
            ? data.created_at.toDate().toISOString()
            : new Date().toISOString(),
          updated_at: data.updated_at instanceof Timestamp
            ? data.updated_at.toDate().toISOString()
            : new Date().toISOString(),
          created_by: data.created_by,
          updated_by: data.updated_by,
          is_default: data.is_default || false,
        };
      });
    });
  },

  // Get specific budget template
  async getTemplate(templateId: string): Promise<GeltTemplate | null> {
    return retryFirestoreOperation(async () => {
      const docRef = doc(db, 'gelt_templates', templateId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data() as GeltTemplateDocument;
      
      // Clean budgetConfig - remove customBudget if it's not valid
      const budgetConfig = data.budgetConfig || {};
      const cleanedBudgetConfig = {
        participants: budgetConfig.participants,
        allowedOverflowPercentage: budgetConfig.allowedOverflowPercentage,
        ...(budgetConfig.customBudget !== undefined && 
            budgetConfig.customBudget !== null && 
            budgetConfig.customBudget > 0
          ? { customBudget: budgetConfig.customBudget }
          : {}),
      };
      
      return {
        id: docSnap.id,
        tenant_id: data.tenant_id,
        name: data.name,
        description: data.description,
        ageGroups: data.ageGroups || [],
        budgetConfig: cleanedBudgetConfig,
        customGroupSettings: data.customGroupSettings || null,
        created_at: data.created_at instanceof Timestamp
          ? data.created_at.toDate().toISOString()
          : new Date().toISOString(),
        updated_at: data.updated_at instanceof Timestamp
          ? data.updated_at.toDate().toISOString()
          : new Date().toISOString(),
        created_by: data.created_by,
        updated_by: data.updated_by,
        currency: data.currency,
        is_default: data.is_default || false,
      };
    });
  },

  // Save new budget template
  async saveTemplate(
    tenantId: string,
    template: Omit<GeltTemplate, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>,
    userId: string
  ): Promise<string> {
    return retryFirestoreOperation(async () => {
      const templatesRef = collection(db, 'gelt_templates');
      const docRef = doc(templatesRef);

      // Prepare budgetConfig - always include customBudget (null if not set)
      const hasCustomBudget = template.budgetConfig.customBudget !== undefined && 
                              template.budgetConfig.customBudget !== null && 
                              template.budgetConfig.customBudget > 0;
      const budgetConfigToSave: { participants: number; allowedOverflowPercentage: number; customBudget: number | null } = {
        participants: template.budgetConfig.participants,
        allowedOverflowPercentage: template.budgetConfig.allowedOverflowPercentage,
        // Always include customBudget - null if not set, value if set
        customBudget: hasCustomBudget ? (template.budgetConfig.customBudget ?? null) : null,
      };

      const templateData: GeltTemplateDocument = {
        tenant_id: tenantId,
        name: template.name,
        ...(template.description !== undefined && template.description !== null && template.description.trim() !== '' 
          ? { description: template.description.trim() } 
          : {}),
        ageGroups: template.ageGroups,
        budgetConfig: budgetConfigToSave,
        customGroupSettings: (template.customGroupSettings !== undefined && template.customGroupSettings !== null)
          ? template.customGroupSettings
          : null,
        ...(template.currency !== undefined ? { currency: template.currency } : {}),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: userId,
        updated_by: userId,
        is_default: template.is_default || false,
      };

      await setDoc(docRef, templateData);

      // If this is default template, remove default flag from other templates
      if (template.is_default) {
        await this.unsetOtherDefaults(tenantId, docRef.id);
      }

      return docRef.id;
    });
  },

  // Update existing budget template
  async updateTemplate(
    templateId: string,
    template: Partial<Omit<GeltTemplate, 'id' | 'tenant_id' | 'created_at' | 'created_by'>>,
    userId: string
  ): Promise<void> {
    return retryFirestoreOperation(async () => {
      const docRef = doc(db, 'gelt_templates', templateId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Template not found');
      }

      const updateData: Partial<GeltTemplateDocument> = {
        updated_at: serverTimestamp(),
        updated_by: userId,
      };

      if (template.name !== undefined) updateData.name = template.name;
      if (template.description !== undefined) {
        // If description is null or empty string, don't include it (Firestore doesn't allow undefined)
        if (template.description !== null && template.description.trim() !== '') {
          updateData.description = template.description.trim();
        }
        // If description is null or empty, leave the existing field (don't delete it)
        // If we want to delete it, need to use deleteField() - but not needed currently
      }
      if (template.ageGroups !== undefined) updateData.ageGroups = template.ageGroups;
      if (template.budgetConfig !== undefined) {
        // Prepare budgetConfig - always include customBudget (null if not set)
        const hasCustomBudget = template.budgetConfig.customBudget !== undefined && 
                                template.budgetConfig.customBudget !== null && 
                                template.budgetConfig.customBudget > 0;
        const budgetConfigToSave: { participants: number; allowedOverflowPercentage: number; customBudget: number | null } = {
          participants: template.budgetConfig.participants,
          allowedOverflowPercentage: template.budgetConfig.allowedOverflowPercentage,
          // Always include customBudget - null if not set, value if set
          customBudget: hasCustomBudget ? (template.budgetConfig.customBudget ?? null) : null,
        };
        updateData.budgetConfig = budgetConfigToSave;
      }
      if (template.customGroupSettings !== undefined) {
        // If customGroupSettings is null, don't include it (Firestore doesn't allow null for arrays)
        if (template.customGroupSettings !== null) {
          updateData.customGroupSettings = template.customGroupSettings;
        }
      }
      if (template.is_default !== undefined) updateData.is_default = template.is_default;

      await setDoc(docRef, updateData, { merge: true });

      // If this is default template, remove default flag from other templates
      if (template.is_default) {
        await this.unsetOtherDefaults((docSnap.data() as GeltTemplateDocument).tenant_id, templateId);
      }
    });
  },

  // Delete budget template
  async deleteTemplate(templateId: string): Promise<void> {
    return retryFirestoreOperation(async () => {
      const docRef = doc(db, 'gelt_templates', templateId);
      await deleteDoc(docRef);
    });
  },

  // Remove default flag from other templates
  async unsetOtherDefaults(tenantId: string, currentTemplateId: string): Promise<void> {
    return retryFirestoreOperation(async () => {
      const templatesRef = collection(db, 'gelt_templates');
      const q = query(
        templatesRef,
        where('tenant_id', '==', tenantId),
        where('is_default', '==', true)
      );
      const querySnapshot = await getDocs(q);

      const updatePromises = querySnapshot.docs
        .filter((docSnap) => docSnap.id !== currentTemplateId)
        .map((docSnap) => {
          const docRef = doc(db, 'gelt_templates', docSnap.id);
          return setDoc(
            docRef,
            { is_default: false, updated_at: serverTimestamp() },
            { merge: true }
          );
        });

      await Promise.all(updatePromises);
    });
  },

  // Get default budget template
  async getDefaultTemplate(tenantId: string): Promise<GeltTemplate | null> {
    return retryFirestoreOperation(async () => {
      const templatesRef = collection(db, 'gelt_templates');
      const q = query(
        templatesRef,
        where('tenant_id', '==', tenantId),
        where('is_default', '==', true)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data() as GeltTemplateDocument;
      
      // Clean budgetConfig - remove customBudget if it's not valid
      const budgetConfig = data.budgetConfig || {};
      const cleanedBudgetConfig = {
        participants: budgetConfig.participants,
        allowedOverflowPercentage: budgetConfig.allowedOverflowPercentage,
        ...(budgetConfig.customBudget !== undefined && 
            budgetConfig.customBudget !== null && 
            budgetConfig.customBudget > 0
          ? { customBudget: budgetConfig.customBudget }
          : {}),
      };
      
      return {
        id: docSnap.id,
        tenant_id: data.tenant_id,
        name: data.name,
        description: data.description,
        ageGroups: data.ageGroups || [],
        budgetConfig: cleanedBudgetConfig,
        customGroupSettings: data.customGroupSettings || null,
        created_at: data.created_at instanceof Timestamp
          ? data.created_at.toDate().toISOString()
          : new Date().toISOString(),
        updated_at: data.updated_at instanceof Timestamp
          ? data.updated_at.toDate().toISOString()
          : new Date().toISOString(),
        created_by: data.created_by,
        updated_by: data.updated_by,
        currency: data.currency,
        is_default: data.is_default || false,
      };
    });
  },
};
