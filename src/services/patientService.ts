import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { Patient } from '../types/field';

class PatientService {
  private collection = 'patients';

  async createPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to create a patient');
    }

    const now = new Date().toISOString();
    const patientRef = doc(collection(db, this.collection));
    
    const patient: Patient = {
      id: patientRef.id,
      ...data,
      userId: currentUser.uid,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(patientRef, patient);
    return patientRef.id;
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update a patient');
    }

    const now = new Date().toISOString();
    await setDoc(doc(db, this.collection, id), {
      ...data,
      userId: currentUser.uid,
      updatedAt: now
    }, { merge: true });
  }

  async getPatient(id: string): Promise<Patient | null> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to get a patient');
    }

    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const patient = docSnap.data() as Patient;
    // Verify that the patient belongs to the current user
    if (patient.userId !== currentUser.uid) {
      return null;
    }

    return patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to get patients');
    }

    const q = query(
      collection(db, this.collection),
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Patient);
  }

  async deletePatient(id: string): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to delete a patient');
    }

    // Vérifier que le patient appartient à l'utilisateur avant de le supprimer
    const patient = await this.getPatient(id);
    if (!patient || patient.userId !== currentUser.uid) {
      throw new Error('Unauthorized access to delete patient');
    }

    await deleteDoc(doc(db, this.collection, id));
  }

  async updatePatientValue(patientId: string, fieldId: string, value: any): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update patient value');
    }

    // Vérifier que le patient appartient à l'utilisateur
    const patient = await this.getPatient(patientId);
    if (!patient || patient.userId !== currentUser.uid) {
      throw new Error('Unauthorized access to update patient value');
    }

    const now = new Date().toISOString();
    await setDoc(doc(db, this.collection, patientId), {
      [`values.${fieldId}`]: value,
      updatedAt: now
    }, { merge: true });
  }
}

export const patientService = new PatientService();
