import localforage from 'localforage';
import { Patient } from '../types/view';

// Configuration du cache local
localforage.config({
  name: 'ortholia',
  storeName: 'patients'
});

export const cacheService = {
  async getPatient(id: string): Promise<Patient | null> {
    try {
      return await localforage.getItem(`patient_${id}`);
    } catch (error) {
      console.error('Cache error getting patient:', error);
      return null;
    }
  },

  async setPatient(patient: Patient): Promise<void> {
    try {
      await localforage.setItem(`patient_${patient.id}`, patient);
    } catch (error) {
      console.error('Cache error setting patient:', error);
    }
  },

  async removePatient(id: string): Promise<void> {
    try {
      await localforage.removeItem(`patient_${id}`);
    } catch (error) {
      console.error('Cache error removing patient:', error);
    }
  },

  async getAllPatients(): Promise<Patient[]> {
    const patients: Patient[] = [];
    try {
      await localforage.iterate<Patient, void>((value, key) => {
        if (key.startsWith('patient_')) {
          patients.push(value);
        }
      });
      return patients;
    } catch (error) {
      console.error('Cache error getting all patients:', error);
      return [];
    }
  },

  async clearCache(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Cache error clearing cache:', error);
    }
  }
};