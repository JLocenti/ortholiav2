import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { PatientItemValue } from '../types/patientItems';

export const patientItemsService = {
  // Récupérer toutes les valeurs d'items pour un patient
  async getPatientItems(patientId: string): Promise<PatientItemValue[]> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to get patient items');
    }

    const q = query(
      collection(db, 'patientItems'),
      where('userId', '==', currentUser.uid),
      where('patientId', '==', patientId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PatientItemValue[];
  },

  // Ajouter une nouvelle valeur d'item
  async addPatientItem(data: Omit<PatientItemValue, 'id'>): Promise<string> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to add patient item');
    }

    const docRef = await addDoc(collection(db, 'patientItems'), {
      ...data,
      userId: currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  },

  // Mettre à jour une valeur d'item
  async updatePatientItem(id: string, data: Partial<PatientItemValue>): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update patient item');
    }

    // Vérifier que l'item appartient à l'utilisateur
    const q = query(
      collection(db, 'patientItems'),
      where('userId', '==', currentUser.uid),
      where('id', '==', id)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error('Unauthorized access to update patient item');
    }

    const timestamp = new Date().toISOString();
    await updateDoc(doc(db, 'patientItems', id), {
      ...data,
      userId: currentUser.uid,
      updatedAt: timestamp
    });
  },

  // Supprimer une valeur d'item
  async deletePatientItem(id: string): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to delete patient item');
    }

    // Vérifier que l'item appartient à l'utilisateur
    const q = query(
      collection(db, 'patientItems'),
      where('userId', '==', currentUser.uid),
      where('id', '==', id)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error('Unauthorized access to delete patient item');
    }

    await deleteDoc(doc(db, 'patientItems', id));
  },

  // Ajouter plusieurs valeurs d'items pour un patient
  async addPatientItems(patientId: string, items: Array<Omit<PatientItemValue, 'id' | 'patientId'>>): Promise<string[]> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to add patient items');
    }

    const timestamp = new Date().toISOString();
    const itemIds: string[] = [];

    for (const item of items) {
      const docRef = await addDoc(collection(db, 'patientItems'), {
        ...item,
        patientId,
        userId: currentUser.uid,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      itemIds.push(docRef.id);
    }

    return itemIds;
  },

  // Mettre à jour toutes les valeurs d'items d'un patient
  async updatePatientItems(patientId: string, items: PatientItemValue[]): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update patient items');
    }

    // Vérifier que le patient appartient à l'utilisateur
    const q = query(
      collection(db, 'patientItems'),
      where('userId', '==', currentUser.uid),
      where('patientId', '==', patientId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error('Unauthorized access to update patient items');
    }

    const timestamp = new Date().toISOString();
    const batch = [];

    for (const item of items) {
      batch.push(
        updateDoc(doc(db, 'patientItems', item.id), {
          ...item,
          userId: currentUser.uid,
          updatedAt: timestamp
        })
      );
    }

    await Promise.all(batch);
  }
};
