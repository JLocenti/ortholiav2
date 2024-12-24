import React, { createContext, useContext, ReactNode } from 'react';
import { firestoreService } from '../services/firestore';

interface FirestoreContextType {
  getCollection: typeof firestoreService.getCollection;
  addDocument: typeof firestoreService.addDocument;
  updateDocument: typeof firestoreService.updateDocument;
  deleteDocument: typeof firestoreService.deleteDocument;
  getDocumentsByField: typeof firestoreService.getDocumentsByField;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export function FirestoreProvider({ children }: { children: ReactNode }) {
  const value = {
    getCollection: firestoreService.getCollection,
    addDocument: firestoreService.addDocument,
    updateDocument: firestoreService.updateDocument,
    deleteDocument: firestoreService.deleteDocument,
    getDocumentsByField: firestoreService.getDocumentsByField
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
}

export function useFirestore() {
  const context = useContext(FirestoreContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirestoreProvider');
  }
  return context;
}