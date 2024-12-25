import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
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

export const initializeViewPreferences = async (userId: string) => {
  try {
    // Vérifier si l'utilisateur a déjà des préférences
    const q = collection(db, 'viewPreferences');
    const querySnapshot = await getDocs(q);
    const existingPreferences = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(pref => pref.userId === userId);

    if (existingPreferences.length === 0) {
      // Créer les vues par défaut pour l'utilisateur
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
      console.log('Préférences de vue initialisées avec succès pour l\'utilisateur:', userId);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des préférences de vue:', error);
    throw error;
  }
};
