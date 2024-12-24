import { Category } from '../../types/patient';

export interface CategoryData extends Omit<Category, 'updatedAt'> {
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  icon?: string;
  order?: number;
}