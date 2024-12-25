import { Question } from '../../types/patient';
import { fieldRepository } from './FieldRepository';
import { FieldValidator } from './FieldValidator';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export class FieldService {
  private static instance: FieldService | null = null;
  private validator: FieldValidator;

  private constructor() {
    this.validator = new FieldValidator();
  }

  static getInstance(): FieldService {
    if (!FieldService.instance) {
      FieldService.instance = new FieldService();
    }
    return FieldService.instance;
  }

  async addField(field: Question): Promise<void> {
    try {
      if (!field.category) {
        throw new Error('Category is required when adding a field');
      }

      // Validate field data
      this.validator.validateField(field);

      // Add field to repository and update category
      const fieldId = await fieldRepository.addField(field);
      
      // Update the category to include this field
      const categoryRef = doc(db, 'categories', field.category);
      const categoryDoc = await getDoc(categoryRef);
      
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        const fields = categoryData.fields || [];
        
        // Add the new field ID if it's not already present
        if (!fields.includes(fieldId)) {
          await updateDoc(categoryRef, {
            fields: [...fields, fieldId],
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error in field service:', error);
      throw error;
    }
  }

  async deleteField(fieldId: string, categoryId: string): Promise<void> {
    try {
      // Remove field from repository
      await fieldRepository.deleteField(fieldId);
      
      // Update the category to remove this field
      const categoryRef = doc(db, 'categories', categoryId);
      const categoryDoc = await getDoc(categoryRef);
      
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        const fields = categoryData.fields || [];
        
        // Remove the field ID from the category
        await updateDoc(categoryRef, {
          fields: fields.filter(id => id !== fieldId),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  }

  subscribeToFields(categoryId: string, callback: (fields: Question[]) => void) {
    if (!categoryId) {
      console.error('CategoryId is required for field subscription');
      callback([]);
      return () => {};
    }

    return fieldRepository.subscribeToFields(categoryId, (fields) => {
      // Filtrer pour accepter les champs qui ont soit categoryId soit category égal à l'ID de la catégorie
      const filteredFields = fields.filter(field => field.categoryId === categoryId || field.category === categoryId);
      callback(filteredFields);
    });
  }

  async getFieldsByCategory(categoryId: string): Promise<Question[]> {
    if (!categoryId) {
      throw new Error('CategoryId is required to get fields');
    }

    const fields = await fieldRepository.getFieldsByCategory(categoryId);
    // Accepter les champs qui ont soit categoryId soit category égal à l'ID de la catégorie
    return fields.filter(field => field.categoryId === categoryId || field.category === categoryId);
  }
}

export const fieldService = FieldService.getInstance();