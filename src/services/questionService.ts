import { Question, Choice } from '../types/patient';
import { defaultQuestions } from '../constants/defaultQuestions';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, writeBatch, updateDoc, where } from 'firebase/firestore';

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
      const { currentUser } = getAuth();
      if (!currentUser) {
        throw new Error('User must be authenticated to initialize questions');
      }

      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
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

  private async saveQuestionsToFirestore(questions: Question[]): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to save questions');
    }

    const batch = writeBatch(db);
    const questionsRef = collection(db, 'questions');

    questions.forEach(question => {
      const docRef = doc(questionsRef);
      batch.set(docRef, {
        ...question,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
  }

  async getQuestions(): Promise<Question[]> {
    await this.initialize();
    return this.questions;
  }

  async updateQuestion(questionId: string, updates: Partial<Question>): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update question');
    }

    // Vérifier que la question appartient à l'utilisateur
    const questionRef = doc(db, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);
    
    if (!questionSnap.exists() || questionSnap.data().userId !== currentUser.uid) {
      throw new Error('Unauthorized access to update question');
    }

    await updateDoc(questionRef, {
      ...updates,
      userId: currentUser.uid,
      updatedAt: new Date().toISOString()
    });

    // Update local cache
    this.questions = this.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
  }

  async addChoice(questionId: string, choice: Choice): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to add choice');
    }

    const question = this.questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const updatedChoices = [...(question.choices || []), choice];
    await this.updateQuestion(questionId, { choices: updatedChoices });
  }

  async updateChoice(questionId: string, choiceId: string, updates: Partial<Choice>): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to update choice');
    }

    const question = this.questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const updatedChoices = question.choices?.map(c =>
      c.id === choiceId ? { ...c, ...updates } : c
    );

    await this.updateQuestion(questionId, { choices: updatedChoices });
  }

  async deleteChoice(questionId: string, choiceId: string): Promise<void> {
    const { currentUser } = getAuth();
    if (!currentUser) {
      throw new Error('User must be authenticated to delete choice');
    }

    const question = this.questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const updatedChoices = question.choices?.filter(c => c.id !== choiceId);
    await this.updateQuestion(questionId, { choices: updatedChoices });
  }

  private mergeWithDefaultQuestions(loadedQuestions: Question[]): Question[] {
    return defaultQuestions.map(defaultQ => {
      const loadedQ = loadedQuestions.find(q => q.id === defaultQ.id);
      if (loadedQ) {
        return {
          ...defaultQ,
          choices: loadedQ.choices?.map(loadedChoice => {
            const defaultChoice = defaultQ.choices?.find(c => c.id === loadedChoice.id);
            return defaultChoice ? { ...defaultChoice, ...loadedChoice } : loadedChoice;
          }) || defaultQ.choices
        };
      }
      return defaultQ;
    });
  }
}

export const questionService = QuestionService.getInstance();