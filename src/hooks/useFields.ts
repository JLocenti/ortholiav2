import { useState, useEffect } from 'react';
import { Question } from '../types/patient';
import { fieldService } from '../services/fields/FieldService';

export function useFields(categoryId: string) {
  const [fields, setFields] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = fieldService.subscribeToFields(categoryId, (updatedFields) => {
      setFields(updatedFields);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryId]);

  const addField = async (fieldData: Partial<Question>) => {
    try {
      setError(null);
      
      const newField: Question = {
        id: `field_${Date.now()}`,
        text: fieldData.text || '',
        type: fieldData.type || 'text',
        category: categoryId,
        description: fieldData.description || '',
        required: fieldData.required || false,
        order: fieldData.order || 0,
        choices: fieldData.choices || []
      };

      await fieldService.addField(newField);
    } catch (err) {
      setError('Error adding field');
      console.error('Error adding field:', err);
      throw err;
    }
  };

  const updateField = async (fieldId: string, updates: Partial<Question>) => {
    try {
      setLoading(true);
      setError(null);

      const existingField = fields.find(f => f.id === fieldId);
      if (!existingField) throw new Error('Field not found');

      const updatedField = { ...existingField, ...updates };
      await fieldService.updateField(updatedField);
    } catch (err) {
      setError('Error updating field');
      console.error('Error updating field:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteField = async (fieldId: string) => {
    try {
      setLoading(true);
      setError(null);

      await fieldService.deleteField(fieldId);
    } catch (err) {
      setError('Error deleting field');
      console.error('Error deleting field:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    fields,
    loading,
    error,
    addField,
    updateField,
    deleteField
  };
}