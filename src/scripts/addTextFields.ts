import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Field } from '../types/item';

const addTextFields = async () => {
  try {
    // Trouver la catégorie "Général"
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('name', '==', 'Général'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error('Catégorie "Général" non trouvée');
      return;
    }

    const generalCategory = querySnapshot.docs[0];
    const fieldsRef = collection(db, 'fields');

    const currentDate = new Date().toISOString();

    // Vérifier les champs existants
    const existingFieldsSnapshot = await getDocs(fieldsRef);
    const existingFields = existingFieldsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Field[];

    const textFieldsToAdd = [
      {
        type: 'field' as const,
        text: 'Traitement dentiste',
        fieldType: 'textarea',
        required: false,
        order: existingFields.length + 1,
        categoryId: generalCategory.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'field' as const,
        text: 'Motif',
        fieldType: 'textarea',
        required: false,
        order: existingFields.length + 2,
        categoryId: generalCategory.id,
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];

    // N'ajouter que les champs qui n'existent pas déjà
    for (const field of textFieldsToAdd) {
      const exists = existingFields.some(ef => 
        ef.text === field.text && 
        ef.type === field.type && 
        ef.fieldType === field.fieldType
      );

      if (!exists) {
        await addDoc(fieldsRef, field);
        console.log(`Champ "${field.text}" ajouté avec succès`);
      } else {
        console.log(`Champ "${field.text}" existe déjà, ignoré`);
      }
    }

    console.log('Tous les champs ont été traités avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des champs:', error);
  }
};

// Exécuter le script
addTextFields();
