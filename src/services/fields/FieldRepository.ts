import { 
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  Firestore,
  or 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Question } from '../../types/patient';

export class FieldRepository {
  private static instance: FieldRepository | null = null;
  private db: Firestore;

  private constructor() {
    this.db = db;
  }

  static getInstance(): FieldRepository {
    if (!FieldRepository.instance) {
      FieldRepository.instance = new FieldRepository();
    }
    return FieldRepository.instance;
  }

  async addField(field: Question): Promise<string> {
    try {
      if (!field.category) {
        throw new Error('Category is required for a field');
      }

      const docRef = doc(collection(this.db, 'fields'));
      await setDoc(docRef, {
        ...field,
        id: docRef.id,
        categoryId: field.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding field:', error);
      throw error;
    }
  }

  async deleteField(fieldId: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'fields', fieldId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  }

  subscribeToFields(categoryId: string, callback: (fields: Question[]) => void) {
    console.log('Subscribing to fields for category:', categoryId);
    console.log('Database instance:', this.db ? 'initialized' : 'not initialized');
    
    const fieldsRef = collection(this.db, 'fields');
    const q = query(
      fieldsRef,
      or(
        where('categoryId', '==', categoryId),
        where('category', '==', categoryId)
      ),
      orderBy('order', 'asc')
    );

    console.log('Query created with:', {
      collection: 'fields',
      categoryFilter: categoryId,
      orderBy: 'order'
    });

    return onSnapshot(q, (snapshot) => {
      console.log(`Received ${snapshot.docs.length} fields for category ${categoryId}`);
      console.log('Raw snapshot data:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const fields = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing field:', { id: doc.id, categoryId: data.categoryId || data.category, text: data.text });
        return {
          ...data,
          category: data.categoryId || data.category, // Assure la compatibilité avec l'ancien format
          id: doc.id
        } as Question;
      });
      
      console.log('Final fields array:', fields);
      callback(fields);
    }, (error) => {
      console.error('Error in fields subscription:', error);
      callback([]);
    });
  }

  async getFieldsByCategory(categoryId: string): Promise<Question[]> {
    try {
      const fieldsRef = collection(this.db, 'fields');
      const q = query(
        fieldsRef,
        or(
          where('categoryId', '==', categoryId),
          where('category', '==', categoryId)
        ),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Field data:', { id: doc.id, categoryId: data.categoryId || data.category, text: data.text });
        return {
          ...data,
          category: data.categoryId || data.category, // Assure la compatibilité avec l'ancien format
          id: doc.id
        } as Question;
      });
    } catch (error) {
      console.error('Error getting fields by category:', error);
      throw error;
    }
  }
}

export const fieldRepository = FieldRepository.getInstance();