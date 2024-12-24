// Désactiver Firebase Analytics pour le script
process.env.DISABLE_FIREBASE_ANALYTICS = 'true';

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  writeBatch, 
  doc,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db, authenticate } from '../config/firebase.script';
import { Category } from '../types/category';
import { Field } from '../types/field';

interface FieldOrder {
  id: string;
  order: number;
}

async function initializeFieldsOrder(): Promise<void> {
  try {
    console.log('Authentification...');
    // Remplacez par vos identifiants
    await authenticate('your-email@example.com', 'your-password');
    
    console.log('Début de l\'initialisation de l\'ordre des champs...');
    
    // Récupérer toutes les catégories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const categoryDoc of categoriesSnapshot.docs) {
      const category = categoryDoc.data() as Category;
      
      if (!category.fieldsOrder) {
        console.log(`Initialisation de l'ordre des champs pour la catégorie ${category.name}...`);
        
        // Récupérer les champs de la catégorie
        const fieldsSnapshot = await getDocs(
          query(
            collection(db, 'fields'),
            where('categoryId', '==', categoryDoc.id),
            orderBy('order', 'asc')
          )
        );

        const fieldsOrder: FieldOrder[] = fieldsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>, index: number) => ({
          id: doc.id,
          order: index
        }));

        batch.update(doc(db, 'categories', categoryDoc.id), {
          fieldsOrder,
          updatedAt: now
        });

        console.log(`${fieldsOrder.length} champs ordonnés pour la catégorie ${category.name}`);
      } else {
        console.log(`La catégorie ${category.name} a déjà un ordre défini pour ses champs`);
      }
    }

    await batch.commit();
    console.log('Initialisation terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    throw error;
  }
}

// Auto-exécution avec gestion des erreurs
initializeFieldsOrder()
  .catch((error: Error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Script terminé');
    process.exit(0);
  });
