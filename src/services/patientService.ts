import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Patient } from '../types/field';

class PatientService {
  private collection = 'patients';

  async createPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const patientRef = doc(collection(db, this.collection));
    
    const patient: Patient = {
      id: patientRef.id,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(patientRef, patient);
    return patientRef.id;
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    const now = new Date().toISOString();
    await setDoc(doc(db, this.collection, id), {
      ...data,
      updatedAt: now
    }, { merge: true });
  }

  async getPatient(id: string): Promise<Patient | null> {
    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Patient : null;
  }

  async getAllPatients(): Promise<Patient[]> {
    const q = query(collection(db, this.collection), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Patient));
  }

  async deletePatient(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collection, id));
  }

  async updatePatientValue(patientId: string, fieldId: string, value: any): Promise<void> {
    const now = new Date().toISOString();
    await setDoc(doc(db, this.collection, patientId), {
      values: {
        [fieldId]: value
      },
      updatedAt: now
    }, { merge: true });
  }
}

export const patientService = new PatientService();
