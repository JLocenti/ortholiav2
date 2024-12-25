import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { ViewPreference } from '../types/view';
import { fieldService } from '../services/fieldService';

interface ViewContextType {
  viewPreferences: ViewPreference[];
  isLoading: boolean;
  updateViewPreference: (id: string, updates: Partial<ViewPreference>) => Promise<void>;
  createViewPreference: (name: string, icon: string) => Promise<string>;
  deleteViewPreference: (id: string) => Promise<void>;
  refreshViews: () => Promise<void>;
  updateLocalView: (updatedView: ViewPreference) => void;
  deleteView: (viewId: string) => Promise<void>;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [viewPreferences, setViewPreferences] = useState<ViewPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour convertir les timestamps Firebase en Date
  const convertTimestamps = (data: any) => {
    const result = { ...data };
    if (result.createdAt?.seconds) {
      result.createdAt = new Date(result.createdAt.seconds * 1000);
    } else if (result.createdAt) {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt?.seconds) {
      result.updatedAt = new Date(result.updatedAt.seconds * 1000);
    } else if (result.updatedAt) {
      result.updatedAt = new Date(result.updatedAt);
    }
    return result;
  };

  // Fonction pour charger les vues depuis Firebase
  const loadViewsFromFirebase = async () => {
    try {
      console.log("Chargement des vues...");
      const viewPrefsCollection = collection(db, 'viewPreferences');
      const snapshot = await getDocs(viewPrefsCollection);
      console.log("Nombre de vues trouvées:", snapshot.docs.length);
      const views = snapshot.docs.map(doc => {
        const data = doc.data();
        const view = {
          id: doc.id,
          ...convertTimestamps(data)
        };
        console.log(`Vue "${view.name}" créée le:`, view.createdAt);
        return view;
      }) as ViewPreference[];
      
      // Afficher toutes les vues avant le tri
      console.log("Vues avant tri:", views.map(v => ({
        name: v.name,
        createdAt: v.createdAt,
        timestamp: v.createdAt instanceof Date ? v.createdAt.getTime() : 0
      })));
      
      const sortedViews = views.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateA - dateB;
      });

      // Afficher toutes les vues après le tri
      console.log("Vues après tri:", sortedViews.map(v => ({
        name: v.name,
        createdAt: v.createdAt,
        timestamp: v.createdAt instanceof Date ? v.createdAt.getTime() : 0
      })));

      return sortedViews;
    } catch (error) {
      console.error("Error loading views from Firebase:", error);
      return [];
    }
  };

  const loadViews = async () => {
    try {
      console.log("Démarrage du chargement des vues...");
      const views = await loadViewsFromFirebase();
      setViewPreferences(views);
    } catch (error) {
      console.error("Error loading views:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier l'état de l'authentification
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      console.log("État de l'authentification:", user ? "Connecté" : "Non connecté");
      if (user) {
        loadViews();
      } else {
        console.log("Utilisateur non connecté, impossible de charger les vues");
        setViewPreferences([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Configurer un écouteur en temps réel pour les mises à jour
  useEffect(() => {
    const viewPrefsCollection = collection(db, 'viewPreferences');
    const unsubscribe = onSnapshot(viewPrefsCollection, (snapshot) => {
      const updatedViews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as ViewPreference[];
      setViewPreferences(updatedViews.sort((a, b) => {
        // S'assurer que les dates sont valides
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateA - dateB;
      }));
    }, (error) => {
      console.error("Error in view preferences listener:", error);
    });

    return () => unsubscribe();
  }, []);

  const refreshViews = async () => {
    const updatedViews = await loadViewsFromFirebase();
    setViewPreferences(updatedViews);
  };

  const updateViewPreference = async (id: string, updates: Partial<ViewPreference>) => {
    const docRef = doc(db, 'viewPreferences', id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    await updateDoc(docRef, updateData);
    await refreshViews();
  };

  const createViewPreference = async (name: string, icon: string) => {
    try {
      const fields = await fieldService.getAllFields();
      const columns = fields.map((field, index) => ({
        fieldId: field.id,
        visible: true,
        order: index
      }));

      const viewPrefsCollection = collection(db, 'viewPreferences');
      const docRef = await addDoc(viewPrefsCollection, {
        name,
        icon,
        columns,
        isDefault: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await refreshViews();
      return docRef.id;
    } catch (error) {
      console.error("Error creating view preference:", error);
      throw error;
    }
  };

  const deleteViewPreference = async (id: string) => {
    try {
      const view = viewPreferences.find(v => v.id === id);
      if (view?.isDefault) {
        throw new Error("Cannot delete default view");
      }

      const docRef = doc(db, 'viewPreferences', id);
      await deleteDoc(docRef);
      await refreshViews();
    } catch (error) {
      console.error("Error deleting view preference:", error);
      throw error;
    }
  };

  const deleteView = async (viewId: string) => {
    try {
      // Supprimer la vue de Firestore
      await deleteDoc(doc(db, 'views', viewId));
      
      // Mettre à jour l'état local
      setViewPreferences(prev => {
        const newPreferences = { ...prev };
        delete newPreferences[viewId];
        return newPreferences;
      });
    } catch (error) {
      console.error('Error deleting view:', error);
      throw error;
    }
  };

  const updateLocalView = (updatedView: ViewPreference) => {
    setViewPreferences(prev => 
      prev.map(view => view.id === updatedView.id ? updatedView : view)
    );
  };

  const value = {
    viewPreferences,
    isLoading,
    updateViewPreference,
    createViewPreference,
    deleteViewPreference,
    refreshViews,
    updateLocalView,
    deleteView
  };

  return (
    <ViewContext.Provider value={value}>
      {children}
    </ViewContext.Provider>
  );
}

export const useViews = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useViews must be used within a ViewProvider");
  }
  return context;
};