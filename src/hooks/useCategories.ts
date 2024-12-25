import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = categoryService.subscribeToCategories((updatedCategories) => {
      setCategories(updatedCategories);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { categories, loading, error, setCategories };
}