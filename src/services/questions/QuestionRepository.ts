import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  writeBatch,
  updateDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Question, Choice } from '../../types/patient';
import { QuestionData, QuestionUpdate } from './types';

export class QuestionRepository {
  private static instance: QuestionRepository | null = null;
  private questions: QuestionData[] = [];
  private unsubscribe: (() => void) | null = null;

  private constructor() {}

  static getInstance(): QuestionRepository {
    if (!QuestionRepository.instance) {
      QuestionRepository.instance = new QuestionRepository();
    }
    return QuestionRepository.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.setupRealtimeSync();
      
      // Load initial data
      const questionsRef = collection(db, 'questions');
      const querySnapshot = await getDocs(query(questionsRef, orderBy('order')));
      
      this.questions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuestionData[];
      
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw error;
    }
  }

  private setupRealtimeSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const questionsRef = collection(db, 'questions');
    const q = query(questionsRef, orderBy('order'));

    this.unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const questionData = {
            id: change.doc.id,
            ...change.doc.data()
          } as QuestionData;

          if (change.type === 'added' || change.type === 'modified') {
            this.questions = [
              ...this.questions.filter(q => q.id !== questionData.id),
              questionData
            ].sort((a, b) => a.order - b.order);
          } else if (change.type === 'removed') {
            this.questions = this.questions.filter(q => q.id !== questionData.id);
          }
        });
      },
      error: (error) => {
        console.error('Error in questions sync:', error);
      }
    });
  }

  async getAll(): Promise<QuestionData[]> {
    return this.questions;
  }

  async save(question: Question): Promise<void> {
    try {
      const docRef = doc(db, 'questions', question.id);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      
      const data = {
        ...question,
        updatedAt: serverTimestamp()
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, data);
      }

      // Update local cache
      this.questions = [
        ...this.questions.filter(q => q.id !== question.id),
        { ...question, updatedAt: new Date().toISOString() }
      ].sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  }

  async updateQuestion(questionId: string, updates: QuestionUpdate): Promise<void> {
    try {
      const docRef = doc(db, 'questions', questionId);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Question with ID ${questionId} not found`);
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);

      // Update local cache
      const existingQuestion = this.questions.find(q => q.id === questionId);
      if (existingQuestion) {
        const updatedQuestion = {
          ...existingQuestion,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        this.questions = [
          ...this.questions.filter(q => q.id !== questionId),
          updatedQuestion
        ].sort((a, b) => a.order - b.order);
      }
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  async updateQuestionChoice(questionId: string, choiceId: string, updates: Partial<Choice>): Promise<void> {
    try {
      const docRef = doc(db, 'questions', questionId);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Question with ID ${questionId} not found`);
      }

      const question = docSnap.data() as Question;
      if (!question.choices) {
        throw new Error('Question has no choices');
      }

      const updatedChoices = question.choices.map(choice =>
        choice.id === choiceId ? { ...choice, ...updates } : choice
      );

      await updateDoc(docRef, { 
        choices: updatedChoices,
        updatedAt: serverTimestamp()
      });

      // Update local cache
      const existingQuestion = this.questions.find(q => q.id === questionId);
      if (existingQuestion) {
        const updatedQuestion = {
          ...existingQuestion,
          choices: updatedChoices,
          updatedAt: new Date().toISOString()
        };
        this.questions = [
          ...this.questions.filter(q => q.id !== questionId),
          updatedQuestion
        ].sort((a, b) => a.order - b.order);
      }
    } catch (error) {
      console.error('Error updating question choice:', error);
      throw error;
    }
  }

  async deleteQuestion(questionId: string): Promise<void> {
    try {
      const docRef = doc(db, 'questions', questionId);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Question with ID ${questionId} not found`);
      }

      await deleteDoc(docRef);
      
      // Update local cache
      this.questions = this.questions.filter(q => q.id !== questionId);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export const questionRepository = QuestionRepository.getInstance();