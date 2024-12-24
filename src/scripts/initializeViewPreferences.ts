import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { fieldService } from '../services/fieldService';
import { ViewPreference, ColumnVisibility } from '../types/view';

const COLLECTION_NAME = 'viewPreferences';

export async function initializeViewPreferences() {
  try {
    // 1. Récupérer tous les fields
    const fields = await fieldService.getAllFields();
    
    // 2. Récupérer toutes les vues existantes
    const viewPrefsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(viewPrefsCollection);
    const existingViews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ViewPreference[];

    // 3. Pour chaque vue existante
    for (const view of existingViews) {
      const columns: ColumnVisibility[] = fields.map((field, index) => {
        // Chercher si une préférence existe déjà pour ce field
        const existingColumn = view.columns?.find(col => col.fieldId === field.id);
        
        return {
          fieldId: field.id,
          visible: existingColumn?.visible ?? true, // Garder la visibilité existante ou true par défaut
          order: existingColumn?.order ?? index // Garder l'ordre existant ou utiliser l'index
        };
      });

      // Mettre à jour la vue avec les colonnes complètes
      const viewRef = doc(db, COLLECTION_NAME, view.id);
      await updateDoc(viewRef, {
        columns,
        updatedAt: Timestamp.now()
      });
    }

    // 4. Si aucune vue n'existe, créer la vue par défaut
    if (existingViews.length === 0) {
      const defaultColumns: ColumnVisibility[] = fields.map((field, index) => ({
        fieldId: field.id,
        visible: true,
        order: index
      }));

      await addDoc(viewPrefsCollection, {
        name: 'Accueil',
        icon: 'Home',
        columns: defaultColumns,
        isDefault: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    console.log('ViewPreferences initialization completed successfully');
  } catch (error) {
    console.error('Error initializing viewPreferences:', error);
    throw error;
  }
}
