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
  and,
  or,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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

      const { currentUser } = getAuth();
      if (!currentUser) {
        throw new Error('User must be authenticated to add a field');
      }

      const docRef = doc(collection(this.db, 'fields'));
      await setDoc(docRef, {
        ...field,
        id: docRef.id,
        userId: currentUser.uid,
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
      const { currentUser } = getAuth();
      if (!currentUser) {
        throw new Error('User must be authenticated to delete a field');
      }

      const docRef = doc(this.db, 'fields', fieldId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  }

  subscribeToFields(categoryId: string, callback: (fields: Question[]) => void): Unsubscribe {
    console.log('Subscribing to fields for category:', categoryId);
    
    const auth = getAuth();
    let unsubscribeSnapshot: Unsubscribe | null = null;

    // On écoute les changements d'authentification
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Nettoyer l'ancien listener si il existe
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }

      if (!user) {
        console.log('No authenticated user, returning empty fields array');
        callback([]);
        return;
      }

      const fieldsRef = collection(this.db, 'fields');
      const q = query(
        fieldsRef,
        and(
          where('userId', '==', user.uid),
          or(
            where('categoryId', '==', categoryId),
            where('category', '==', categoryId)
          )
        ),
        orderBy('order', 'asc')
      );

      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const fields = snapshot.docs.map(doc => ({
          ...doc.data(),
          category: doc.data().categoryId || doc.data().category,
          id: doc.id
        } as Question));
        callback(fields);
      }, (error) => {
        console.error('Error in fields subscription:', error);
        callback([]);
      });
    });

    // Retourner une fonction qui nettoie les deux listeners
    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      unsubscribeAuth();
    };
  }

  async getFieldsByCategory(categoryId: string): Promise<Question[]> {
    try {
      const { currentUser } = getAuth();
      if (!currentUser) {
        throw new Error('User must be authenticated to get fields by category');
      }

      const fieldsRef = collection(this.db, 'fields');
      const q = query(
        fieldsRef,
        and(
          where('userId', '==', currentUser.uid),
          or(
            where('categoryId', '==', categoryId),
            where('category', '==', categoryId)
          )
        ),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        category: doc.data().categoryId || doc.data().category,
        id: doc.id
      } as Question));
    } catch (error) {
      console.error('Error getting fields by category:', error);
      throw error;
    }
  }
}

export const fieldRepository = FieldRepository.getInstance();