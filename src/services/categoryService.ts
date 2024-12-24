import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  Firestore,
  getDocs,
  writeBatch,
  doc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Category } from '../types/category';

class CategoryService {
  private static instance: CategoryService | null = null;
  private db: Firestore;
  private readonly COLLECTION_NAME = 'categories';

  private constructor() {
    this.db = db;
  }

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  private getCollection() {
    return collection(this.db, this.COLLECTION_NAME);
  }

  subscribeToCategories(callback: (categories: Category[]) => void) {
    const categoriesRef = this.getCollection();
    const q = query(categoriesRef, orderBy('order', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      callback(categories);
    });
  }

  async getCategories(): Promise<Category[]> {
    const categoriesRef = this.getCollection();
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  }

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    const docRef = doc(this.db, this.COLLECTION_NAME, categoryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async updateCategoryIcon(categoryId: string, icon: string): Promise<void> {
    const categoryRef = doc(this.db, this.COLLECTION_NAME, categoryId);
    const now = new Date().toISOString();
    await updateDoc(categoryRef, { 
      icon,
      updatedAt: now
    });
  }

  async updateFieldsOrder(categoryId: string, fieldsOrder: { id: string; order: number; }[]): Promise<void> {
    const categoryRef = doc(this.db, this.COLLECTION_NAME, categoryId);
    const now = new Date().toISOString();
    
    await updateDoc(categoryRef, {
      fieldsOrder,
      updatedAt: now
    });
  }

  async syncFieldsOrder(categoryId: string, fieldIds: string[]): Promise<void> {
    // Crée un nouvel ordre basé sur la liste des IDs
    const fieldsOrder = fieldIds.map((id, index) => ({
      id,
      order: index
    }));

    await this.updateFieldsOrder(categoryId, fieldsOrder);
  }

  async initializeCategoryIcons(): Promise<void> {
    const categories = await this.getCategories();
    const batch = writeBatch(this.db);
    const now = new Date().toISOString();

    categories.forEach(category => {
      if (!category.icon) {
        const categoryRef = doc(this.db, this.COLLECTION_NAME, category.id);
        batch.update(categoryRef, {
          icon: 'FileText', // Icône par défaut
          updatedAt: now
        });
      }
    });

    await batch.commit();
  }

  async initializeFieldsOrder(): Promise<void> {
    const categories = await this.getCategories();
    const batch = writeBatch(this.db);
    const now = new Date().toISOString();

    for (const category of categories) {
      if (!category.fieldsOrder) {
        const categoryRef = doc(this.db, this.COLLECTION_NAME, category.id);
        
        // Récupérer les champs de la catégorie
        const fieldsSnapshot = await getDocs(
          query(
            collection(this.db, 'fields'),
            where('categoryId', '==', category.id),
            orderBy('order', 'asc')
          )
        );

        const fieldsOrder = fieldsSnapshot.docs.map((doc, index) => ({
          id: doc.id,
          order: index
        }));

        batch.update(categoryRef, {
          fieldsOrder,
          updatedAt: now
        });
      }
    }

    await batch.commit();
  }

  async updateCategoriesOrder(categories: Category[]): Promise<void> {
    const batch = writeBatch(this.db);
    
    categories.forEach(category => {
      const docRef = doc(this.db, this.COLLECTION_NAME, category.id);
      batch.update(docRef, { order: category.order });
    });

    await batch.commit();
  }
}

export const categoryService = CategoryService.getInstance();
