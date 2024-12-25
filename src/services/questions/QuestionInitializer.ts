import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Question } from '../../types/patient';
import { defaultQuestions } from '../../constants/defaultQuestions';

export class QuestionInitializer {
  private static instance: QuestionInitializer | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): QuestionInitializer {
    if (!QuestionInitializer.instance) {
      QuestionInitializer.instance = new QuestionInitializer();
    }
    return QuestionInitializer.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const questionsRef = collection(db, 'questions');
      const snapshot = await getDocs(questionsRef);
      const existingQuestions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];

      // Merge existing questions with defaults
      const mergedQuestions = this.mergeQuestions(existingQuestions, defaultQuestions);

      // Save all questions in a batch
      const batch = writeBatch(db);
      
      mergedQuestions.forEach(question => {
        const docRef = doc(db, 'questions', question.id);
        const sanitizedQuestion = this.sanitizeQuestion(question);
        batch.set(docRef, sanitizedQuestion);
      });

      await batch.commit();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing questions:', error);
      throw error;
    }
  }

  private mergeQuestions(existing: Question[], defaults: Question[]): Question[] {
    const merged = new Map<string, Question>();

    // Add defaults first
    defaults.forEach(defaultQ => {
      merged.set(defaultQ.id, {
        ...defaultQ,
        choices: defaultQ.choices || null // Convert undefined to null for Firestore
      });
    });

    // Override with existing where applicable
    existing.forEach(existingQ => {
      if (merged.has(existingQ.id)) {
        const defaultQ = merged.get(existingQ.id)!;
        merged.set(existingQ.id, {
          ...defaultQ,
          ...existingQ,
          choices: existingQ.choices || defaultQ.choices || null
        });
      } else {
        merged.set(existingQ.id, existingQ);
      }
    });

    return Array.from(merged.values());
  }

  private sanitizeQuestion(question: Question): any {
    return {
      ...question,
      choices: question.choices || null, // Ensure choices is null if undefined
      description: question.description || '',
      required: question.required || false,
      updatedAt: new Date().toISOString()
    };
  }
}

export const questionInitializer = QuestionInitializer.getInstance();