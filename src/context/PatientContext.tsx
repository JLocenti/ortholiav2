import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient } from '../types/patientItems';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface PatientContextType {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<string>;
  updatePatient: (patientId: string, updates: Partial<Patient>) => Promise<boolean>;
  deletePatient: (patientId: string) => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Mettre en place le listener Firestore
  useEffect(() => {
    if (!currentUser) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('userId', '==', currentUser.uid));
    
    // Créer un listener pour les mises à jour en temps réel
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const patientsData: Patient[] = [];
        snapshot.forEach((doc) => {
          patientsData.push({
            id: doc.id,
            ...doc.data()
          } as Patient);
        });
        setPatients(patientsData);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur lors de l\'écoute des patients:', err);
        setError('Erreur lors du chargement des patients');
        setLoading(false);
      }
    );

    // Nettoyer le listener quand le composant est démonté
    return () => unsubscribe();
  }, [currentUser]);

  const addPatient = async (newPatient: Omit<Patient, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'patients'), {
        ...newPatient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser.uid
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(patientRef, updatedData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du patient:', error);
      throw error;
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        loading,
        error,
        addPatient,
        updatePatient,
        deletePatient
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};