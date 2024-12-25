import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PatientItemValue } from '../types/patientItems';

export const patientItemsService = {
  // Récupérer toutes les valeurs d'items pour un patient
  async getPatientItems(patientId: string): Promise<PatientItemValue[]> {
    const q = query(
      collection(db, 'patientItems'),
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
    const docRef = await addDoc(collection(db, 'patientItems'), data);
    return docRef.id;
  },

  // Mettre à jour une valeur d'item
  async updatePatientItem(id: string, data: Partial<PatientItemValue>): Promise<void> {
    const timestamp = new Date().toISOString();
    await updateDoc(doc(db, 'patientItems', id), {
      ...data,
      updatedAt: timestamp
    });
  },

  // Supprimer une valeur d'item
  async deletePatientItem(id: string): Promise<void> {
    await deleteDoc(doc(db, 'patientItems', id));
  },

  // Ajouter plusieurs valeurs d'items pour un patient
  async addPatientItems(patientId: string, items: Array<Omit<PatientItemValue, 'id' | 'patientId'>>): Promise<string[]> {
    const timestamp = new Date().toISOString();
    const itemIds: string[] = [];

    for (const item of items) {
      const docRef = await addDoc(collection(db, 'patientItems'), {
        ...item,
        patientId,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      itemIds.push(docRef.id);
    }

    return itemIds;
  },

  // Mettre à jour toutes les valeurs d'items d'un patient
  async updatePatientItems(patientId: string, items: PatientItemValue[]): Promise<void> {
    const timestamp = new Date().toISOString();
    
    // Supprimer les anciennes valeurs
    const oldItems = await this.getPatientItems(patientId);
    for (const item of oldItems) {
      await this.deletePatientItem(item.id);
    }

    // Ajouter les nouvelles valeurs
    for (const item of items) {
      await addDoc(collection(db, 'patientItems'), {
        ...item,
        patientId,
        updatedAt: timestamp
      });
    }
  }
};
