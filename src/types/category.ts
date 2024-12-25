export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  fields?: string[]; // Array of field IDs
  icon?: string; // Nom de l'icône Lucide
  fieldsOrder: { // Ordre des champs dans la catégorie
    id: string;
    order: number;
  }[];
}
