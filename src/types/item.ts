import { CategoryId } from '../components/sidebar/EditSidebar';

export interface BaseItem {
  id: string;
  category: CategoryId;
  createdAt: string;
  updatedAt: string;
}

export interface Field extends BaseItem {
  type: 'field';
  text: string;
  description?: string;
  fieldType: string;
  required: boolean;
  order: number;
  choices?: Array<{
    id: string;
    text: string;
    color: string;
  }>;
}

export interface Practitioner extends BaseItem {
  type: 'practitioner';
  name: string;
  color: string;
}

export type Item = Field | Practitioner;
