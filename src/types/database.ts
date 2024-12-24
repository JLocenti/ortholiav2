export type FieldType = 'short_text' | 'long_text' | 'date' | 'single' | 'multiple';

export interface Field {
  id: string;
  name: string;
  category: string;
  type: FieldType;
  options?: string[];  // Pour les types 'single' et 'multiple'
}

export interface Patient {
  id: string;
  fileNumber: string;
  createdAt: string;
  updatedAt: string;
  practitionerId: string;
  [key: string]: any;  // Pour les champs dynamiques basés sur Fields
}

export interface Practitioner {
  id: string;
  name: string;
  email: string;
  role: string;
}
