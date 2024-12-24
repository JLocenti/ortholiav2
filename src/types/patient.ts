import { PatientPrescription } from './prescription';

export interface Choice {
  id: string;
  text: string;
  color: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'checkbox' | 'radio' | 'multiple' | 'date' | 'number' | 'textarea';
  choices?: Choice[];
  category: string;
  description?: string;
  required?: boolean;
  order: number;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  icon: string;
  updatedAt?: string;
}

export interface Patient {
  id: string;
  fileNumber: string;
  practitioner: string | string[];
  fields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  prescriptions: Record<string, PatientPrescription>;
}