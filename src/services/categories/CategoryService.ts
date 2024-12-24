import { Category } from '../../types/patient';
import { CategoryData, CategoryUpdate } from './types';
import { categoryRepository } from './CategoryRepository';

export class CategoryService {
  private static instance: CategoryService | null = null;
  private initialized = false;
  private subscribers: ((categories: CategoryData[]) => void)[] = [];

  private constructor() {}

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await categoryRepository.initialize();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing categories:', error);
      throw error;
    }
  }

  async getCategories(): Promise<CategoryData[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return categoryRepository.getAll();
  }

  async saveCategory(category: Category): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await categoryRepository.save(category);
      const updatedCategories = await categoryRepository.getAll();
      this.notifySubscribers(updatedCategories);
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, updates: CategoryUpdate): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await categoryRepository.updateCategory(categoryId, updates);
      const updatedCategories = await categoryRepository.getAll();
      this.notifySubscribers(updatedCategories);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await categoryRepository.deleteCategory(categoryId);
      const updatedCategories = await categoryRepository.getAll();
      this.notifySubscribers(updatedCategories);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  subscribe(callback: (categories: CategoryData[]) => void): () => void {
    this.subscribers.push(callback);
    
    if (this.initialized) {
      categoryRepository.getAll().then(categories => callback(categories));
    } else {
      this.initialize().then(() => {
        categoryRepository.getAll().then(categories => callback(categories));
      });
    }
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(categories: CategoryData[]) {
    this.subscribers.forEach(callback => callback(categories));
  }
}

export const categoryService = CategoryService.getInstance();