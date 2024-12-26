import { collection, getDocs, setDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ViewPreferences } from '../types/viewPreferences';

const defaultViews: Partial<ViewPreferences>[] = [
  {
    name: "Vue Standard",
    icon: "Layout",
    columns: [
      { id: "lastName", visible: true },
      { id: "firstName", visible: true },
      { id: "birthDate", visible: true },
      { id: "phoneNumber", visible: true },
      { id: "email", visible: true },
      { id: "lastVisit", visible: true },
      { id: "nextVisit", visible: true }
    ],
    showLastModified: true,
    isDefault: true
  },
  {
    name: "Vue Compacte",
    icon: "List",
    columns: [
      { id: "lastName", visible: true },
      { id: "firstName", visible: true },
      { id: "birthDate", visible: true },
      { id: "phoneNumber", visible: false },
      { id: "email", visible: false },
      { id: "lastVisit", visible: true },
      { id: "nextVisit", visible: true }
    ],
    showLastModified: false,
    isDefault: false
  }
];

// Collection pour stocker les métadonnées des utilisateurs
const USER_METADATA_COLLECTION = 'userMetadata';

export const initializeViewPreferences = async (userId: string) => {
  try {
    // Vérifier dans Firestore si l'utilisateur a déjà eu les vues par défaut
    const userMetadataRef = doc(db, USER_METADATA_COLLECTION, userId);
    const userMetadata = await getDoc(userMetadataRef);
    
    if (userMetadata.exists() && userMetadata.data().hadDefaultViews) {
      console.log('User previously had default views, skipping initialization');
      return;
    }

    // Vérifier si l'utilisateur a déjà des préférences
    const q = query(
      collection(db, 'viewPreferences'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    // Si l'utilisateur a des préférences existantes
    if (querySnapshot.size > 0) {
      // Marquer que l'utilisateur a eu les vues par défaut
      await setDoc(userMetadataRef, { hadDefaultViews: true }, { merge: true });
      console.log('User has existing preferences, skipping initialization');
      return;
    }

    // Créer les vues par défaut pour un nouvel utilisateur
    for (const viewData of defaultViews) {
      const newViewId = doc(collection(db, 'viewPreferences')).id;
      const newView: ViewPreferences = {
        id: newViewId,
        userId,
        name: viewData.name || 'Nouvelle vue',
        icon: viewData.icon || 'Layout',
        columns: viewData.columns || [],
        showLastModified: viewData.showLastModified ?? true,
        isDefault: viewData.isDefault ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'viewPreferences', newViewId), newView);
    }

    // Marquer que l'utilisateur a eu les vues par défaut
    await setDoc(userMetadataRef, { hadDefaultViews: true }, { merge: true });
    console.log('Default views initialized for new user:', userId);
  } catch (error) {
    console.error('Error initializing view preferences:', error);
    throw error;
  }
};
