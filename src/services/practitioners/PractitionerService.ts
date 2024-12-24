import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
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
    if (!this.initialized) {
      this.initializeSubscription();
    }

    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private initializeSubscription() {
    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
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
    const now = new Date().toISOString();
    await addDoc(collection(db, this.collectionName), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updatePractitioner(id: string, data: Partial<Omit<Practitioner, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async deletePractitioner(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}

export const practitionerService = PractitionerService.getInstance();