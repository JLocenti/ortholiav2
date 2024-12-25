import { useState, useEffect } from 'react';
import { Practitioner } from '../types/practitioner';
import * as practitionerService from '../services/practitionerService';

export function usePractitioners() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = practitionerService.subscribeToPractitioners((updatedPractitioners) => {
      setPractitioners(updatedPractitioners);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const savePractitioner = async (data: { name: string; color: string }) => {
    try {
      setError(null);
      await practitionerService.addPractitioner(data);
    } catch (err) {
      setError('Error saving practitioner');
      console.error('Error saving practitioner:', err);
      throw err;
    }
  };

  const updatePractitioner = async (practitioner: Practitioner) => {
    try {
      setError(null);
      await practitionerService.updatePractitioner(practitioner);
    } catch (err) {
      setError('Error updating practitioner');
      console.error('Error updating practitioner:', err);
      throw err;
    }
  };

  const deletePractitioner = async (id: string) => {
    try {
      setError(null);
      await practitionerService.deletePractitioner(id);
    } catch (err) {
      setError('Error deleting practitioner');
      console.error('Error deleting practitioner:', err);
      throw err;
    }
  };

  return {
    practitioners,
    loading,
    error,
    savePractitioner,
    updatePractitioner,
    deletePractitioner
  };
}