import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import { Category, CategoryData } from '../../types/category';

export class CategoryRepository {
  private categories: Category[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to initialize categories');
    }

    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    
    this.categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
    
    this.initialized = true;
  }

  async saveAll(categories: Category[]): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to save categories');
    }

    const batch = [];
    for (const category of categories) {
      const docRef = doc(collection(db, 'categories'));
      batch.push(
        setDoc(docRef, {
          ...category,
          userId: currentUser.uid,
          updatedAt: new Date().toISOString()
        })
      );
    }
    await Promise.all(batch);
  }

  async getCategories(): Promise<Category[]> {
    await this.initialize();
    return this.categories;
  }

  async createCategory(category: CategoryData): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to create a category');
    }

    const docRef = doc(collection(db, 'categories'));
    await setDoc(docRef, {
      ...category,
      id: docRef.id,
      userId: currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    await this.initialize();
  }

  async updateCategory(category: CategoryData): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update a category');
    }

    const docRef = doc(db, 'categories', category.id);
    await setDoc(docRef, {
      ...category,
      userId: currentUser.uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    await this.initialize();
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to delete a category');
    }

    await deleteDoc(doc(db, 'categories', categoryId));
    await this.initialize();
  }
}

export const categoryRepository = new CategoryRepository();