import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { ViewPreference, ViewPreferenceInput, ColumnVisibility, ViewSettings } from '../types/view';
import { Field } from '../types/field';
import { fieldService } from './fieldService';

const COLLECTION_NAME = 'viewPreferences';

export const viewPreferencesService = {
  async getViewPreferences(): Promise<ViewPreference[]> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to get view preferences');
    }

    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const q = query(viewPrefsCollection, where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    
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
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to create view preference');
    }

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
      userId: currentUser.uid,
      columns,
      settings: {},
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  },

  async updateViewPreference(id: string, updates: Partial<ViewPreference>): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update view preference');
    }

    // Vérifier que la vue appartient à l'utilisateur
    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const q = query(viewPrefsCollection, 
      where('userId', '==', currentUser.uid),
      where('id', '==', id)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Unauthorized access to view preference');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      userId: currentUser.uid,
      updatedAt: Timestamp.now()
    });
  },

  async deleteViewPreference(id: string): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to delete view preference');
    }

    // Vérifier que la vue appartient à l'utilisateur
    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const q = query(viewPrefsCollection, 
      where('userId', '==', currentUser.uid),
      where('id', '==', id)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Unauthorized access to delete view preference');
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  async createDefaultView(): Promise<string> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to create default view');
    }

    const defaultView: ViewPreferenceInput = {
      name: 'Vue par défaut',
      icon: 'ViewColumns',
      isDefault: true
    };

    return this.createViewPreference(defaultView);
  },

  async updateViewSettings(viewId: string, settings: ViewSettings): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update view settings');
    }

    // Vérifier que la vue appartient à l'utilisateur
    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const q = query(viewPrefsCollection, 
      where('userId', '==', currentUser.uid),
      where('id', '==', viewId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Unauthorized access to update view settings');
    }

    const docRef = doc(db, COLLECTION_NAME, viewId);
    await updateDoc(docRef, {
      settings,
      updatedAt: Timestamp.now()
    });
  },

  async updateColumnVisibility(viewId: string, fieldId: string, visible: boolean): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update column visibility');
    }

    // Vérifier que la vue appartient à l'utilisateur
    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const q = query(viewPrefsCollection, 
      where('userId', '==', currentUser.uid),
      where('id', '==', viewId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Unauthorized access to update column visibility');
    }

    const docRef = doc(db, COLLECTION_NAME, viewId);
    await updateDoc(docRef, {
      [`columns.${fieldId}.visible`]: visible,
      updatedAt: Timestamp.now()
    });
  },

  async updateColumnsOrder(viewId: string, newOrder: { fieldId: string; order: number }[]): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update columns order');
    }

    // Vérifier que la vue appartient à l'utilisateur
    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const q = query(viewPrefsCollection, 
      where('userId', '==', currentUser.uid),
      where('id', '==', viewId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Unauthorized access to update columns order');
    }

    const updates = newOrder.reduce((acc, { fieldId, order }) => {
      acc[`columns.${fieldId}.order`] = order;
      return acc;
    }, {} as Record<string, number>);

    const docRef = doc(db, COLLECTION_NAME, viewId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }
};
