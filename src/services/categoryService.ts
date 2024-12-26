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
import { getAuth, onAuthStateChanged } from 'firebase/auth';

class CategoryService {
  private static instance: CategoryService | null = null;
  private db: Firestore;
  private readonly COLLECTION_NAME = 'categories';
  private initialized = false;

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
    const auth = getAuth();
    console.log('Starting categories subscription');
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid);
      
      if (!user) {
        console.log('No user, returning empty categories');
        callback([]);
        return;
      }

      const categoriesRef = this.getCollection();
      // Temporairement, on ne trie pas pour éviter l'erreur d'index
      const q = query(
        categoriesRef,
        where('userId', '==', user.uid)
      );
      
      console.log('Setting up categories listener for user:', user.uid);
      
      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        console.log('Categories snapshot received, count:', snapshot.docs.length);
        const categories = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Category data:', { id: doc.id, ...data });
          return {
            id: doc.id,
            ...data
          };
        }) 
        // On trie après avoir reçu les données
        .sort((a, b) => (a.order || 0) - (b.order || 0)) as Category[];
        
        callback(categories);
      }, (error) => {
        console.error('Error in categories subscription:', error);
        callback([]);
      });

      return () => {
        console.log('Cleaning up categories subscription');
        unsubscribeSnapshot();
      };
    });

    return () => {
      console.log('Cleaning up auth subscription');
      unsubscribeAuth();
    };
  }

  async getCategories(): Promise<Category[]> {
    const { currentUser } = getAuth();
    console.log('Getting categories for user:', currentUser?.uid);
    
    if (!currentUser) {
      console.log('No user, returning empty categories array');
      return [];
    }

    const categoriesRef = this.getCollection();
    // Temporairement, on ne trie pas pour éviter l'erreur d'index
    const q = query(
      categoriesRef,
      where('userId', '==', currentUser.uid)
    );
    
    console.log('Fetching categories with query');
    const snapshot = await getDocs(q);
    console.log('Categories fetched, count:', snapshot.docs.length);
    
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        console.log('Category data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      })
      // On trie après avoir reçu les données
      .sort((a, b) => (a.order || 0) - (b.order || 0)) as Category[];
  }

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update category');
    }

    const docRef = doc(this.db, this.COLLECTION_NAME, categoryId);
    await updateDoc(docRef, {
      ...updates,
      userId: currentUser.uid,
      updatedAt: new Date().toISOString()
    });
  }

  async updateCategoriesOrder(categories: Category[]): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update categories order');
    }

    const batch = writeBatch(this.db);

    categories.forEach((category, index) => {
      const docRef = doc(this.db, this.COLLECTION_NAME, category.id);
      batch.update(docRef, { 
        order: index,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
  }

  async initializeFieldsOrder(): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      console.log('No user for initializeFieldsOrder, returning');
      return;
    }

    console.log('Initializing fields order for user:', currentUser.uid);
    const categories = await this.getCategories();
    
    if (categories.length === 0) {
      console.log('No categories found, skipping initialization');
      return;
    }

    console.log('Found categories:', categories.length);
    const batch = writeBatch(this.db);

    categories.forEach((category, index) => {
      const docRef = doc(this.db, this.COLLECTION_NAME, category.id);
      batch.update(docRef, { 
        order: index,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
    });

    console.log('Committing batch update for fields order');
    await batch.commit();
    console.log('Fields order initialized successfully');
  }
}

export const categoryService = CategoryService.getInstance();
