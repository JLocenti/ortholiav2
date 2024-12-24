import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Question } from '../types/patient';
import { CategoryId } from '../components/sidebar/EditSidebar';
import { Field } from '../types/field';
import { categoryService } from './categoryService';

const COLLECTION_NAME = 'fields';
const fieldsCollection = collection(db, COLLECTION_NAME);

export interface Field extends Omit<Question, 'id'> {
  id: string;
  categoryId: CategoryId;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export const addField = async (categoryId: CategoryId, data: Omit<Question, 'id'>): Promise<Field> => {
  const now = new Date().toISOString();
  const docRef = await addDoc(fieldsCollection, {
    ...data,
    categoryId,
    createdAt: now,
    updatedAt: now,
    order: 0,
  });

  return {
    id: docRef.id,
    ...data,
    categoryId,
    createdAt: now,
    updatedAt: now,
    order: 0,
  };
};

export const getFields = async (categoryId: CategoryId): Promise<Field[]> => {
  const q = query(
    fieldsCollection,
    where('categoryId', '==', categoryId),
    orderBy('order', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Field));
};

export const updateField = async (id: string, data: Partial<Omit<Field, 'id' | 'categoryId' | 'createdAt'>>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteField = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

export const updateFieldsOrder = async (categoryId: string, fields: Field[]): Promise<void> => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  // Mettre à jour l'ordre dans la collection fields
  fields.forEach((field, index) => {
    const fieldRef = doc(db, COLLECTION_NAME, field.id);
    batch.update(fieldRef, { 
      order: index,
      updatedAt: now
    });
  });

  await batch.commit();

  // Synchroniser l'ordre dans la catégorie
  await categoryService.syncFieldsOrder(
    categoryId,
    fields.map(field => field.id)
  );
};

// Fonction utilitaire pour obtenir l'ordre des champs depuis la catégorie
export const getFieldsOrderFromCategory = async (categoryId: string): Promise<Field[]> => {
  // Récupérer tous les champs de la catégorie
  const fields = await getFields(categoryId);
  
  // Récupérer la catégorie pour avoir l'ordre des champs
  const categorySnapshot = await getDocs(
    query(collection(db, 'categories'), where('id', '==', categoryId))
  );
  
  if (categorySnapshot.empty) {
    return fields; // Retourner les champs dans leur ordre par défaut
  }

  const category = categorySnapshot.docs[0].data();
  const fieldsOrder = category.fieldsOrder || [];

  // Trier les champs selon l'ordre stocké dans la catégorie
  return fields.sort((a, b) => {
    const orderA = fieldsOrder.find(f => f.id === a.id)?.order ?? Number.MAX_VALUE;
    const orderB = fieldsOrder.find(f => f.id === b.id)?.order ?? Number.MAX_VALUE;
    return orderA - orderB;
  });
};

export const fieldService = {
  async getAllFields(): Promise<Field[]> {
    const snapshot = await getDocs(fieldsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Field[];
  },
  getFields,
  addField,
  updateField,
  deleteField,
  updateFieldsOrder,
  getFieldsOrderFromCategory
};
