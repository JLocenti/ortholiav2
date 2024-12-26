import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import { Practitioner } from '../../types/practitioner';

export class PractitionerService {
  private static instance: PractitionerService;
  private initialized = false;
  private readonly collectionName = 'practitioners';
  private subscribers: ((practitioners: Practitioner[]) => void)[] = [];

  private constructor() {}

  static getInstance(): PractitionerService {
    if (!PractitionerService.instance) {
      PractitionerService.instance = new PractitionerService();
    }
    return PractitionerService.instance;
  }

  subscribe(callback: (practitioners: Practitioner[]) => void): () => void {
    this.subscribers.push(callback);
    if (!this.initialized) {
      this.initializeSubscription();
    }
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private initializeSubscription() {
    const { currentUser } = getAuth();
    if (!currentUser) {
      console.error('User must be authenticated to initialize practitioners');
      return;
    }

    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', currentUser.uid)
    );

    onSnapshot(q, (snapshot) => {
      const practitioners = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Practitioner));
      
      this.subscribers.forEach(callback => callback(practitioners));
    });

    this.initialized = true;
  }

  async savePractitioner(data: Omit<Practitioner, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to save practitioner');
    }

    const docRef = doc(collection(db, this.collectionName));
    await setDoc(docRef, {
      ...data,
      id: docRef.id,
      userId: currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async updatePractitioner(id: string, data: Partial<Omit<Practitioner, 'id' | 'createdAt'>>): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update practitioner');
    }

    const docRef = doc(db, this.collectionName, id);
    await setDoc(docRef, {
      ...data,
      userId: currentUser.uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  async deletePractitioner(id: string): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to delete practitioner');
    }

    await deleteDoc(doc(db, this.collectionName, id));
  }
}

export const practitionerService = PractitionerService.getInstance();