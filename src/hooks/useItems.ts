import { useState, useEffect } from 'react';
import { Item, Field, Practitioner } from '../types/item';
import { itemService } from '../services/itemService';
import { CategoryId } from '../components/sidebar/EditSidebar';

export function useItems(categoryId: CategoryId) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = itemService.subscribeToItems(categoryId, (newItems) => {
      setItems(newItems);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [categoryId]);

  const practitioners = items
    .filter((item): item is Practitioner => item.type === 'practitioner')
    .sort((a, b) => a.name.localeCompare(b.name));

  const fields = items
    .filter((item): item is Field => item.type === 'field')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const addPractitioner = async (data: { name: string; color: string }) => {
    try {
      setError(null);
      await itemService.addPractitioner(data);
    } catch (err) {
      setError('Error adding practitioner');
      console.error('Error adding practitioner:', err);
      throw err;
    }
  };

  const addField = async (data: Omit<Field, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => {
    try {
      setError(null);
      await itemService.addField(data);
    } catch (err) {
      setError('Error adding field');
      console.error('Error adding field:', err);
      throw err;
    }
  };

  const updateItem = async (item: Item) => {
    try {
      setError(null);
      await itemService.updateItem(item);
    } catch (err) {
      setError('Error updating item');
      console.error('Error updating item:', err);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setError(null);
      await itemService.deleteItem(id);
    } catch (err) {
      setError('Error deleting item');
      console.error('Error deleting item:', err);
      throw err;
    }
  };

  return {
    practitioners,
    fields,
    loading,
    error,
    addPractitioner,
    addField,
    updateItem,
    deleteItem,
  };
}
