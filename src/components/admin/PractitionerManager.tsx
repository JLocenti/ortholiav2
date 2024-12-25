import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const COLORS = {
  JL: '#4D7EF9',
  Jeanne: '#FF69B4'
};

export default function PractitionerManager() {
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPractitioners();
  }, []);

  const loadPractitioners = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'practitioners'));
      setPractitioners(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading practitioners:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearPractitioners = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'practitioners'));
      
      // Supprimer tous les praticiens existants
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      await loadPractitioners();
    } catch (error) {
      console.error('Error clearing practitioners:', error);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Gestion des praticiens</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Praticiens actuels :</h3>
          {practitioners.length === 0 ? (
            <p className="text-gray-500">Aucun praticien</p>
          ) : (
            <ul className="space-y-2">
              {practitioners.map(practitioner => (
                <li
                  key={practitioner.id}
                  className="flex items-center gap-2 p-2 border rounded"
                  style={{ borderColor: practitioner.color }}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: practitioner.color }}
                  />
                  <span>{practitioner.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
