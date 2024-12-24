import { Question, Choice } from '../types/patient';
import { defaultQuestions } from '../constants/defaultQuestions';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, writeBatch, updateDoc } from 'firebase/firestore';

class QuestionService {
  private static instance: QuestionService;
  private questions: Question[] = defaultQuestions;
  private initialized = false;

  private constructor() {}

  static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      const questionsRef = collection(db, 'questions');
      const querySnapshot = await getDocs(query(questionsRef));
      
      if (!querySnapshot.empty) {
        const loadedQuestions = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Question[];
        this.questions = this.mergeWithDefaultQuestions(loadedQuestions);
      } else {
        // Initialize with default questions if none exist
        await this.saveQuestionsToFirestore(this.questions);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing questions:', error);
      throw error;
    }
  }

  private mergeWithDefaultQuestions(loadedQuestions: Question[]): Question[] {
    return defaultQuestions.map(defaultQ => {
      const loadedQ = loadedQuestions.find(q => q.id === defaultQ.id);
      if (loadedQ) {
        return {
          ...defaultQ,
          choices: loadedQ.choices?.map(loadedChoice => {
            const defaultChoice = defaultQ.choices?.find(c => c.id === loadedChoice.id);
            return {
              ...defaultChoice,
              ...loadedChoice,
              color: loadedChoice.color || defaultChoice?.color || '#3B82F6'
            };
          }) || defaultQ.choices
        };
      }
      return defaultQ;
    });
  }

  private async saveQuestionsToFirestore(questions: Question[]) {
    try {
      const batch = writeBatch(db);
      
      questions.forEach(question => {
        if (question.choices) {
          // Ensure each choice has a color
          question.choices = question.choices.map(choice => ({
            ...choice,
            color: choice.color || '#3B82F6'
          }));
        }
        const docRef = doc(db, 'questions', question.id);
        batch.set(docRef, {
          ...question,
          updatedAt: new Date().toISOString()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving questions to Firestore:', error);
      throw error;
    }
  }

  async getQuestions(): Promise<Question[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.questions;
  }

  async updateQuestionColor(questionId: string, choiceId: string, newColor: string): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const question = this.questions.find(q => q.id === questionId);
      if (!question || !question.choices) return;

      const updatedQuestion = {
        ...question,
        choices: question.choices.map(choice =>
          choice.id === choiceId ? { ...choice, color: newColor } : choice
        ),
        updatedAt: new Date().toISOString()
      };

      // Update Firestore
      const docRef = doc(db, 'questions', questionId);
      await updateDoc(docRef, {
        choices: updatedQuestion.choices,
        updatedAt: updatedQuestion.updatedAt
      });

      // Update local cache
      this.questions = this.questions.map(q =>
        q.id === questionId ? updatedQuestion : q
      );
    } catch (error) {
      console.error('Error updating question color:', error);
      throw error;
    }
  }

  async saveQuestion(question: Question): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Ensure all choices have colors
      if (question.choices) {
        question.choices = question.choices.map(choice => ({
          ...choice,
          color: choice.color || '#3B82F6'
        }));
      }

      const updatedQuestion = {
        ...question,
        updatedAt: new Date().toISOString()
      };

      // Update Firestore
      const docRef = doc(db, 'questions', question.id);
      await setDoc(docRef, updatedQuestion);

      // Update local cache
      this.questions = this.questions.map(q =>
        q.id === question.id ? updatedQuestion : q
      );
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  }

  async saveQuestions(questions: Question[]): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const questionsWithColors = questions.map(question => ({
        ...question,
        choices: question.choices?.map(choice => ({
          ...choice,
          color: choice.color || '#3B82F6'
        }))
      }));

      await this.saveQuestionsToFirestore(questionsWithColors);
      this.questions = questionsWithColors;
    } catch (error) {
      console.error('Error saving questions:', error);
      throw error;
    }
  }
}

export const questionService = QuestionService.getInstance();