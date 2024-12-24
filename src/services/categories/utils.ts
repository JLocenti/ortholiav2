import { Category } from '../../types/patient';
import { CategoryData } from './types';

export function sanitizeCategory(category: Category): CategoryData {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    order: category.order,
    icon: category.icon
  };
}

export function sanitizeCategories(categories: Category[]): CategoryData[] {
  return categories.map(sanitizeCategory);
}

export function mergeCategories(existing: CategoryData[], defaults: Category[]): CategoryData[] {
  const merged = new Map<string, CategoryData>();
  
  // Add default categories first
  defaults.forEach(defaultCat => {
    merged.set(defaultCat.id, sanitizeCategory(defaultCat));
  });

  // Override with existing categories where applicable
  existing.forEach(existingCat => {
    if (merged.has(existingCat.id)) {
      const defaultCat = merged.get(existingCat.id)!;
      merged.set(existingCat.id, {
        ...defaultCat,
        ...existingCat,
        name: existingCat.name || defaultCat.name,
        description: existingCat.description || defaultCat.description,
        icon: existingCat.icon || defaultCat.icon
      });
    } else {
      merged.set(existingCat.id, existingCat);
    }
  });

  return Array.from(merged.values()).sort((a, b) => a.order - b.order);
}