import React, { createContext, useContext, useState, useEffect } from 'react';
import { Practitioner } from '../types/practitioner';
import { firestoreService } from '../services/firestore';

interface PractitionerContextType {
  practitioners: Practitioner[];
  loading: boolean;
  error: string | null;
  refreshPractitioners: () => Promise<void>;
}

const PractitionerContext = createContext<PractitionerContextType | undefined>(undefined);

export function PractitionerProvider({ children }: { children: React.ReactNode }) {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToPractitioners((updatedPractitioners) => {
      setPractitioners(updatedPractitioners);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const refreshPractitioners = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getPractitioners();
      setPractitioners(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing practitioners:', err);
      setError('Erreur lors du rafraîchissement des praticiens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PractitionerContext.Provider value={{
      practitioners,
      loading,
      error,
      refreshPractitioners
    }}>
      {children}
    </PractitionerContext.Provider>
  );
}

export function usePractitioners() {
  const context = useContext(PractitionerContext);
  if (context === undefined) {
    throw new Error('usePractitioners must be used within a PractitionerProvider');
  }
  return context;
}