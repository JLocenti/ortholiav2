import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ViewPreference, ViewPreferenceInput, ColumnVisibility, ViewSettings } from '../types/view';
import { Field } from '../types/field';
import { fieldService } from './fieldService';

const COLLECTION_NAME = 'viewPreferences';

export const viewPreferencesService = {
  async getViewPreferences(): Promise<ViewPreference[]> {
    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(viewPrefsCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const now = new Date();
      return {
        id: doc.id,
        name: data.name,
        icon: data.icon,
        columns: data.columns || [],
        settings: data.settings || {},
        isDefault: data.isDefault || false,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : now,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : now
      };
    });
  },

  async createViewPreference(viewPref: ViewPreferenceInput): Promise<string> {
    // Charger tous les fields pour créer les colonnes
    const fields = await fieldService.getAllFields();
    const columns: ColumnVisibility[] = fields.map((field, index) => ({
      fieldId: field.id,
      visible: true, // Par défaut, toutes les colonnes sont visibles
      order: index
    }));

    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(viewPrefsCollection, {
      ...viewPref,
      columns,
      settings: {},
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  },

  async updateViewPreference(id: string, updates: Partial<ViewPreference>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Si la mise à jour concerne les colonnes, s'assurer que tous les champs requis sont présents
      if (updates.columns) {
        updates.columns = updates.columns.map(col => ({
          fieldId: col.fieldId,
          visible: col.visible,
          order: col.order
        }));
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating view preference:', error);
      throw error;
    }
  },

  async deleteViewPreference(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async createDefaultView(): Promise<string> {
    // Charger tous les fields pour la vue par défaut
    const fields = await fieldService.getAllFields();
    const columns: ColumnVisibility[] = fields.map((field, index) => ({
      fieldId: field.id,
      visible: true, // Par défaut, toutes les colonnes sont visibles
      order: index
    }));

    const defaultView: ViewPreferenceInput = {
      name: 'Accueil',
      icon: 'Home',
      columns,
      isDefault: true
    };

    return this.createViewPreference(defaultView);
  },

  async updateViewSettings(viewId: string, settings: ViewSettings): Promise<void> {
    try {
      // 1. Récupérer la référence du document
      const docRef = doc(db, COLLECTION_NAME, viewId);

      // 2. Mettre à jour dans Firestore
      await updateDoc(docRef, {
        settings,
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Error updating view settings:', error);
      throw error;
    }
  },

  async updateColumnVisibility(viewId: string, fieldId: string, visible: boolean): Promise<void> {
    try {
      // 1. Récupérer la référence du document
      const docRef = doc(db, COLLECTION_NAME, viewId);

      // 2. Récupérer la vue actuelle
      const view = (await this.getViewPreferences()).find(v => v.id === viewId);
      if (!view) throw new Error('View not found');

      // 3. Préparer la mise à jour des colonnes
      const columns = [...(view.columns || [])];
      const columnIndex = columns.findIndex(col => col.fieldId === fieldId);

      if (columnIndex >= 0) {
        // Mettre à jour la colonne existante
        columns[columnIndex] = {
          ...columns[columnIndex],
          visible
        };
      } else {
        // Ajouter une nouvelle colonne
        columns.push({
          fieldId,
          visible,
          order: columns.length
        });
      }

      // 4. Mettre à jour dans Firestore
      await updateDoc(docRef, {
        columns,
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Error updating column visibility:', error);
      throw error;
    }
  },

  async updateColumnsOrder(viewId: string, newOrder: { fieldId: string; order: number }[]): Promise<void> {
    const view = (await this.getViewPreferences()).find(v => v.id === viewId);
    if (!view) throw new Error('View not found');

    const columns = view.columns.map(col => {
      const newPos = newOrder.find(o => o.fieldId === col.fieldId);
      return newPos ? { ...col, order: newPos.order } : col;
    });

    await this.updateViewPreference(viewId, { columns });
  }
};
