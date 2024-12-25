import { Category } from '../../types/patient';
import { CategoryData } from './types';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';

export class CategoryRepository {
  private categories: Category[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const categoriesRef = collection(db, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      
      this.categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing categories:', error);
      throw error;
    }
  }

  private async saveAll(categories: Category[]): Promise<void> {
    const batch = [];
    for (const category of categories) {
      const docRef = doc(db, 'categories', category.id);
      batch.push(setDoc(docRef, category));
    }
    await Promise.all(batch);
  }

  async getCategories(): Promise<Category[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.categories;
  }

  async createCategory(category: CategoryData): Promise<void> {
    try {
      const docRef = doc(db, 'categories', category.id);
      await setDoc(docRef, category);
      this.categories.push(category as Category);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(category: CategoryData): Promise<void> {
    try {
      const docRef = doc(db, 'categories', category.id);
      await setDoc(docRef, category, { merge: true });
      const index = this.categories.findIndex(c => c.id === category.id);
      if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...category };
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      this.categories = this.categories.filter(c => c.id !== categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

export const categoryRepository = new CategoryRepository();