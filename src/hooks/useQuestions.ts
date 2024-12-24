import { useState, useEffect } from 'react';
import { Question } from '../types/patient';
import { firestoreService } from '../services/firestore';

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToQuestions((updatedQuestions) => {
      setQuestions(updatedQuestions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveQuestion = async (question: Question) => {
    try {
      setError(null);
      await firestoreService.updateQuestion(question.id, question);
    } catch (err) {
      setError('Error saving question');
      throw err;
    }
  };

  const updateQuestion = async (questionId: string, updates: Partial<Question>) => {
    try {
      setError(null);
      await firestoreService.updateQuestion(questionId, updates);
    } catch (err) {
      setError('Error updating question');
      throw err;
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      setError(null);
      await firestoreService.deleteQuestion(questionId);
    } catch (err) {
      setError('Error deleting question');
      throw err;
    }
  };

  return {
    questions,
    loading,
    error,
    saveQuestion,
    updateQuestion,
    deleteQuestion
  };
}