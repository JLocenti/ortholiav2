import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Practitioner } from '../types/practitioner';

const COLLECTION_NAME = 'practitioners';
const practitionersCollection = collection(db, COLLECTION_NAME);

export const addPractitioner = async (data: Omit<Practitioner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Practitioner> => {
  const now = new Date().toISOString();
  const docRef = await addDoc(practitionersCollection, {
    ...data,
    category: 'practitioners',
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    ...data,
    category: 'practitioners',
    createdAt: now,
    updatedAt: now,
  };
};

export const updatePractitioner = async (practitioner: Practitioner): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, practitioner.id);
  const now = new Date().toISOString();
  
  const updateData = {
    name: practitioner.name,
    color: practitioner.color,
    category: 'practitioners',
    updatedAt: now
  };

  await updateDoc(docRef, updateData);
};

export const deletePractitioner = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

export const subscribeToPractitioners = (callback: (practitioners: Practitioner[]) => void): Unsubscribe => {
  const q = query(
    practitionersCollection,
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const practitioners = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        color: data.color,
        category: data.category || 'practitioners',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Practitioner;
    });
    callback(practitioners);
  }, (error) => {
    console.error('Error in practitioners subscription:', error);
    callback([]);
  });
};
