import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PatientPrescription } from '../types/prescription';

interface DefaultSettings {
  maxillary: {
    brand: string;
    type: string;
  };
  mandibular: {
    brand: string;
    type: string;
  };
}

interface PrescriptionContextType {
  defaultSettings: DefaultSettings;
  updateDefaultSettings: (settings: DefaultSettings) => Promise<void>;
  getPatientPrescription: (patientId: string) => Promise<PatientPrescription | undefined>;
  updatePatientPrescription: (patientId: string, prescription: PatientPrescription) => Promise<void>;
}

const DEFAULT_SETTINGS: DefaultSettings = {
  maxillary: { brand: '', type: '' },
  mandibular: { brand: '', type: '' }
};

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined);

interface PrescriptionProviderProps {
  children: ReactNode;
}

export function PrescriptionProvider({ children }: PrescriptionProviderProps) {
  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadDefaultSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'prescription_defaults');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDefaultSettings(docSnap.data() as DefaultSettings);
        } else {
          await setDoc(docRef, DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('Error loading default settings:', error);
      }
    };

    loadDefaultSettings();
  }, []);

  const updateDefaultSettings = async (settings: DefaultSettings) => {
    try {
      const docRef = doc(db, 'settings', 'prescription_defaults');
      await setDoc(docRef, settings);
      setDefaultSettings(settings);
    } catch (error) {
      console.error('Error updating default settings:', error);
      throw error;
    }
  };

  const getPatientPrescription = async (patientId: string) => {
    try {
      const docRef = doc(db, 'prescriptions', patientId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as PatientPrescription : undefined;
    } catch (error) {
      console.error('Error getting patient prescription:', error);
      throw error;
    }
  };

  const updatePatientPrescription = async (patientId: string, prescription: PatientPrescription) => {
    try {
      const docRef = doc(db, 'prescriptions', patientId);
      await setDoc(docRef, prescription);
    } catch (error) {
      console.error('Error updating patient prescription:', error);
      throw error;
    }
  };

  return (
    <PrescriptionContext.Provider
      value={{
        defaultSettings,
        updateDefaultSettings,
        getPatientPrescription,
        updatePatientPrescription
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
}

export function usePrescription() {
  const context = useContext(PrescriptionContext);
  if (context === undefined) {
    throw new Error('usePrescription must be used within a PrescriptionProvider');
  }
  return context;
}

export { PrescriptionContext };