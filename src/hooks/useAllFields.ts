import { useState, useEffect } from 'react';
import { Question } from '../types/patient';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useAllFields() {
  const [fields, setFields] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fieldsRef = collection(db, 'fields');
    const q = query(fieldsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fieldsMap: Record<string, Question> = {};
      snapshot.docs.forEach(doc => {
        fieldsMap[doc.id] = {
          id: doc.id,
          ...doc.data()
        } as Question;
      });
      setFields(fieldsMap);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { fields, loading };
}
