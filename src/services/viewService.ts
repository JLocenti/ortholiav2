import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { View } from '../types/view';

export const viewService = {
  async getViews() {
    const viewsCollection = collection(db, 'views');
    const snapshot = await getDocs(viewsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as View[];
  },

  async addView(view: Omit<View, 'id'>) {
    const viewsCollection = collection(db, 'views');
    const docRef = await addDoc(viewsCollection, {
      ...view,
      isDefault: false,
      settings: {
        showLastModified: true,
        ...view.settings
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  async updateView(id: string, updates: Partial<View>) {
    const viewRef = doc(db, 'views', id);
    await updateDoc(viewRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async deleteView(id: string) {
    const viewRef = doc(db, 'views', id);
    await deleteDoc(viewRef);
  }
};
