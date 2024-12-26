import { 
  collection,
  getDocs,
  writeBatch,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  QueryConstraint,
  DocumentData,
  Firestore,
  getDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';
import { Category } from '../types/patient';
import { Patient } from '../types/view';
import { Practitioner } from '../types/practitioner';

export const firestoreService = {
  // Patients
  subscribeToPatients(callback: (patients: Patient[]) => void) {
    const auth = getAuth();
    
    // On écoute les changements d'authentification
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        callback([]);
        return;
      }

      const patientsRef = collection(db, 'patients');
      const q = query(
        patientsRef,
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const patients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Patient[];
        callback(patients);
      }, (error) => {
        console.error('Error subscribing to patients:', error);
      });

      // Nettoyer le listener quand l'utilisateur se déconnecte
      return () => {
        unsubscribeSnapshot();
      };
    });

    // Retourner une fonction pour nettoyer les deux listeners
    return () => {
      unsubscribeAuth();
    };
  },

  async addPatient(patientData: Omit<Patient, 'id'>) {
    try {
      // Vérifier que le praticien existe
      if (patientData.practitioner) {
        const practitionerRef = doc(db, 'practitioners', patientData.practitioner);
        const practitionerDoc = await getDoc(practitionerRef);
        if (!practitionerDoc.exists()) {
          throw new Error('Le praticien sélectionné n\'existe pas');
        }
      }

      const patientsRef = collection(db, 'patients');
      const docRef = doc(patientsRef);
      await setDoc(docRef, {
        ...patientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  },

  async updatePatient(patientId: string, data: Partial<Patient>) {
    try {
      // Vérifier que le praticien existe si on met à jour le praticien
      if (data.practitioner) {
        const practitionerRef = doc(db, 'practitioners', data.practitioner);
        const practitionerDoc = await getDoc(practitionerRef);
        if (!practitionerDoc.exists()) {
          throw new Error('Le praticien sélectionné n\'existe pas');
        }
      }

      const docRef = doc(db, 'patients', patientId);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  async deletePatient(patientId: string) {
    try {
      const docRef = doc(db, 'patients', patientId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  // Practitioners
  subscribeToPractitioners(callback: (practitioners: Practitioner[]) => void) {
    const practitionersRef = collection(db, 'practitioners');
    const q = query(practitionersRef, orderBy('name', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const practitioners = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Practitioner[];
      callback(practitioners);
    }, (error) => {
      console.error('Error subscribing to practitioners:', error);
    });
  },

  async getPractitioners() {
    try {
      const practitionersRef = collection(db, 'practitioners');
      const q = query(practitionersRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Practitioner[];
    } catch (error) {
      console.error('Error getting practitioners:', error);
      throw error;
    }
  },

  async addPractitioner(practitionerData: Omit<Practitioner, 'id'>) {
    try {
      const practitionersRef = collection(db, 'practitioners');
      const docRef = doc(practitionersRef);
      await setDoc(docRef, practitionerData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding practitioner:', error);
      throw error;
    }
  },

  async updatePractitioner(practitionerId: string, data: Partial<Practitioner>) {
    try {
      const docRef = doc(db, 'practitioners', practitionerId);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error('Error updating practitioner:', error);
      throw error;
    }
  },

  async deletePractitioner(practitionerId: string) {
    try {
      const docRef = doc(db, 'practitioners', practitionerId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting practitioner:', error);
      throw error;
    }
  },

  // Categories
  subscribeToCategories(callback: (categories: Category[]) => void) {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      callback(categories);
    }, (error) => {
      console.error('Error subscribing to categories:', error);
    });
  },

  async initializeCategories(categories: Category[]) {
    try {
      const batch = writeBatch(db);
      
      categories.forEach(category => {
        const docRef = doc(db, 'categories', category.id);
        batch.set(docRef, {
          ...category,
          updatedAt: new Date().toISOString()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error initializing categories:', error);
      throw error;
    }
  },

  async updateCategory(categoryId: string, data: Partial<Category>) {
    try {
      const docRef = doc(db, 'categories', categoryId);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(categoryId: string) {
    try {
      const docRef = doc(db, 'categories', categoryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Generic collection functions
  async getCollection(collectionName: string, constraints: QueryConstraint[] = []) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  },

  async addDocument(collectionName: string, data: DocumentData) {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = doc(collectionRef);
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  },

  async updateDocument(collectionName: string, documentId: string, data: Partial<DocumentData>) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  async deleteDocument(collectionName: string, documentId: string) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }
};