import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ViewPreferences, ColumnVisibility } from '../types/viewPreferences';
import { useAuth } from './AuthContext';

interface ViewPreferencesContextType {
  viewPreferences: ViewPreferences[];
  createViewPreference: (viewData: Partial<ViewPreferences>) => Promise<void>;
  updateViewPreference: (viewId: string, updates: Partial<ViewPreferences>) => Promise<void>;
  getViewPreference: (viewId: string) => Promise<ViewPreferences | null>;
  updateColumnVisibility: (viewId: string, columnId: string, visible: boolean) => Promise<void>;
  updateViewIcon: (viewId: string, icon: string) => Promise<void>;
  updateViewName: (viewId: string, name: string) => Promise<void>;
}

const ViewPreferencesContext = createContext<ViewPreferencesContextType | undefined>(undefined);

export function ViewPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [viewPreferences, setViewPreferences] = useState<ViewPreferences[]>([]);
  const { user } = useAuth();

  // Charger les préférences de l'utilisateur
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;

    const q = query(
      collection(db, 'viewPreferences'),
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const preferences: ViewPreferences[] = [];
    querySnapshot.forEach((doc) => {
      preferences.push({ id: doc.id, ...doc.data() } as ViewPreferences);
    });

    setViewPreferences(preferences);
  };

  const createViewPreference = async (viewData: Partial<ViewPreferences>) => {
    if (!user) return;

    const newPreference: ViewPreferences = {
      id: doc(collection(db, 'viewPreferences')).id,
      userId: user.uid,
      name: viewData.name || 'Nouvelle vue',
      icon: viewData.icon || 'Layout',
      columns: viewData.columns || [],
      showLastModified: viewData.showLastModified ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...viewData
    };

    await setDoc(doc(db, 'viewPreferences', newPreference.id), newPreference);
    setViewPreferences(prev => [...prev, newPreference]);
  };

  const updateViewPreference = async (viewId: string, updates: Partial<ViewPreferences>) => {
    const docRef = doc(db, 'viewPreferences', viewId);
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(docRef, updatedData);
    setViewPreferences(prev =>
      prev.map(pref => (pref.id === viewId ? { ...pref, ...updatedData } : pref))
    );
  };

  const getViewPreference = async (viewId: string): Promise<ViewPreferences | null> => {
    const docRef = doc(db, 'viewPreferences', viewId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as ViewPreferences : null;
  };

  const updateColumnVisibility = async (viewId: string, columnId: string, visible: boolean) => {
    const preference = viewPreferences.find(p => p.id === viewId);
    if (!preference) return;

    const columns = [...(preference.columns || [])];
    const columnIndex = columns.findIndex(c => c.id === columnId);
    
    if (columnIndex >= 0) {
      columns[columnIndex] = { ...columns[columnIndex], visible };
    } else {
      columns.push({ id: columnId, visible });
    }

    await updateViewPreference(viewId, { columns });
  };

  const updateViewIcon = async (viewId: string, icon: string) => {
    await updateViewPreference(viewId, { icon });
  };

  const updateViewName = async (viewId: string, name: string) => {
    await updateViewPreference(viewId, { name });
  };

  return (
    <ViewPreferencesContext.Provider
      value={{
        viewPreferences,
        createViewPreference,
        updateViewPreference,
        getViewPreference,
        updateColumnVisibility,
        updateViewIcon,
        updateViewName
      }}
    >
      {children}
    </ViewPreferencesContext.Provider>
  );
}

export function useViewPreferences() {
  const context = useContext(ViewPreferencesContext);
  if (context === undefined) {
    throw new Error('useViewPreferences must be used within a ViewPreferencesProvider');
  }
  return context;
}
