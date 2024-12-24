import { db } from '../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

async function migrateViews() {
  try {
    // Get all existing views
    const viewsCollection = collection(db, 'views');
    const viewsSnapshot = await getDocs(viewsCollection);
    const views = viewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Create new view preferences
    const viewPrefsCollection = collection(db, 'viewPreferences');
    for (const view of views) {
      // Convert fields to columns
      const columns = view.fields.map((field, index) => ({
        id: field.id,
        visible: true,
        order: index
      }));

      // Create new view preference
      await addDoc(viewPrefsCollection, {
        name: view.name || 'Vue sans nom',
        icon: view.icon || 'FileText',
        columns,
        isDefault: view.isDefault || false,
        settings: {
          showLastModified: view.settings?.showLastModified ?? true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Delete old view
      await deleteDoc(doc(viewsCollection, view.id));
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

migrateViews();
