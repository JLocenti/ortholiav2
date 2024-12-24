import { 
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Firestore,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item, Field, Practitioner } from '../types/item';
import { CategoryId } from '../components/sidebar/EditSidebar';

class ItemService {
  private static instance: ItemService | null = null;
  private db: Firestore;
  private readonly COLLECTION_NAME = 'items';

  private constructor() {
    this.db = db;
  }

  static getInstance(): ItemService {
    if (!ItemService.instance) {
      ItemService.instance = new ItemService();
    }
    return ItemService.instance;
  }

  private getCollection() {
    return collection(this.db, this.COLLECTION_NAME);
  }

  async addItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    try {
      console.log('Adding item:', item);
      const now = new Date().toISOString();
      const docRef = doc(this.getCollection());
      
      const newItem = {
        ...item,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, newItem);
      console.log('Item added successfully:', newItem);
      return newItem as Item;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  }

  async addPractitioner(data: { name: string; color: string }): Promise<Practitioner> {
    try {
      console.log('Adding practitioner:', data);
      return this.addItem({
        type: 'practitioner',
        category: 'practitioners',
        ...data,
      }) as Promise<Practitioner>;
    } catch (error) {
      console.error('Error adding practitioner:', error);
      throw error;
    }
  }

  async addField(data: Omit<Field, 'id' | 'createdAt' | 'updatedAt' | 'type'>): Promise<Field> {
    try {
      console.log('Adding field with data:', data);
      return this.addItem({
        type: 'field',
        ...data,
      }) as Promise<Field>;
    } catch (error) {
      console.error('Error adding field:', error);
      throw error;
    }
  }

  async updateItem(item: Item): Promise<void> {
    try {
      console.log('Updating item:', item);
      const docRef = doc(this.db, this.COLLECTION_NAME, item.id);
      const now = new Date().toISOString();
      
      await setDoc(docRef, {
        ...item,
        updatedAt: now,
      }, { merge: true });
      console.log('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      console.log('Deleting item:', id);
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      console.log('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  subscribeToItems(categoryId: CategoryId, callback: (items: Item[]) => void) {
    console.log('Setting up subscription for category:', categoryId);
    
    let q;
    
    if (categoryId === 'practitioners') {
      // Pour les praticiens, on récupère tous les items de type practitioner
      q = query(
        this.getCollection(),
        where('type', '==', 'practitioner')
      );
    } else {
      // Pour les champs, on récupère les items de type field pour la catégorie spécifique
      q = query(
        this.getCollection(),
        where('type', '==', 'field'),
        where('category', '==', categoryId)
      );
    }

    return onSnapshot(
      q,
      (querySnapshot) => {
        const items: Item[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            ...data,
            id: doc.id,
          } as Item);
        });
        
        console.log(`Items retrieved for ${categoryId}:`, items);
        callback(items);
      },
      (error) => {
        console.error('Error getting items:', error);
        callback([]);
      }
    );
  }

  async migrateData(): Promise<void> {
    try {
      console.log('Starting data migration...');
      const batch = writeBatch(this.db);

      // Migrate practitioners
      const practitionersCollection = collection(this.db, 'practitioners');
      const practitionersSnapshot = await getDocs(practitionersCollection);
      
      for (const doc of practitionersSnapshot.docs) {
        const data = doc.data();
        const newDocRef = doc(this.getCollection());
        
        batch.set(newDocRef, {
          id: newDocRef.id,
          type: 'practitioner',
          category: 'practitioners',
          name: data.name,
          color: data.color,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      }

      // Migrate fields
      const fieldsCollection = collection(this.db, 'fields');
      const fieldsSnapshot = await getDocs(fieldsCollection);
      
      for (const doc of fieldsSnapshot.docs) {
        const data = doc.data();
        const newDocRef = doc(this.getCollection());
        
        batch.set(newDocRef, {
          id: newDocRef.id,
          type: 'field',
          category: data.category,
          text: data.text,
          description: data.description || '',
          fieldType: data.fieldType || 'text',
          required: data.required || false,
          order: data.order || 0,
          choices: data.choices || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      }

      await batch.commit();
      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Error during data migration:', error);
      throw error;
    }
  }
}

export const itemService = ItemService.getInstance();
