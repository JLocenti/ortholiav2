import { CategoryId } from '../components/sidebar/EditSidebar';

export interface Choice {
  id: string;
  text: string;
  color: string;
}

export interface Field {
  id: string;
  text: string;
  description?: string;
  type: 'text' | 'number' | 'radio' | 'multiple' | 'textarea';
  required: boolean;
  choices?: Choice[];
  categoryId: string;
  order: number;
}

export interface Patient {
  id: string;
  fileNumber: string;
  practitioner: string;
  values: {
    [fieldId: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}
