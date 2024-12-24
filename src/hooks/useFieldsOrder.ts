import { useState, useEffect } from 'react';
import { Field } from '../types/field';
import { fieldService } from '../services/fieldService';

export const useFieldsOrder = (categoryId: string) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFields = async () => {
      try {
        // Utiliser la nouvelle fonction qui récupère les champs dans l'ordre de la catégorie
        const orderedFields = await fieldService.getFieldsOrderFromCategory(categoryId);
        setFields(orderedFields);
      } catch (error) {
        console.error('Error loading fields:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFields();
  }, [categoryId]);

  const reorderFields = async (sourceIndex: number, destinationIndex: number) => {
    const newFields = Array.from(fields);
    const [removed] = newFields.splice(sourceIndex, 1);
    newFields.splice(destinationIndex, 0, removed);

    setFields(newFields);

    try {
      // Mettre à jour l'ordre dans les deux collections
      await fieldService.updateFieldsOrder(categoryId, newFields);
    } catch (error) {
      console.error('Error updating fields order:', error);
      // Revert en cas d'erreur
      const originalFields = await fieldService.getFieldsOrderFromCategory(categoryId);
      setFields(originalFields);
    }
  };

  return {
    fields,
    loading,
    reorderFields
  };
};
