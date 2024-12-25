import { Question, Choice } from '../../types/patient';
import { QuestionData, QuestionUpdate } from './types';
import { questionRepository } from './QuestionRepository';
import { questionInitializer } from './QuestionInitializer';

export class QuestionService {
  private static instance: QuestionService | null = null;
  private initialized = false;
  private subscribers: ((questions: QuestionData[]) => void)[] = [];

  private constructor() {}

  static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Initialize questions first
      await questionInitializer.initialize();
      
      // Then initialize repository
      await questionRepository.initialize();
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing question service:', error);
      throw error;
    }
  }

  async getQuestions(): Promise<QuestionData[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return questionRepository.getAll();
  }

  async saveQuestion(question: Question): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const sanitizedQuestion = {
        ...question,
        choices: question.choices || null,
        description: question.description || '',
        required: question.required || false
      };

      await questionRepository.save(sanitizedQuestion);
      const updatedQuestions = await questionRepository.getAll();
      this.notifySubscribers(updatedQuestions);
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  }

  async updateQuestion(questionId: string, updates: QuestionUpdate): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const sanitizedUpdates = {
        ...updates,
        choices: updates.choices || null
      };

      await questionRepository.updateQuestion(questionId, sanitizedUpdates);
      const updatedQuestions = await questionRepository.getAll();
      this.notifySubscribers(updatedQuestions);
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  async updateQuestionChoice(questionId: string, choiceId: string, updates: Partial<Choice>): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await questionRepository.updateQuestionChoice(questionId, choiceId, updates);
      const updatedQuestions = await questionRepository.getAll();
      this.notifySubscribers(updatedQuestions);
    } catch (error) {
      console.error('Error updating question choice:', error);
      throw error;
    }
  }

  async deleteQuestion(questionId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await questionRepository.deleteQuestion(questionId);
      const updatedQuestions = await questionRepository.getAll();
      this.notifySubscribers(updatedQuestions);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  subscribe(callback: (questions: QuestionData[]) => void): () => void {
    this.subscribers.push(callback);
    
    if (this.initialized) {
      questionRepository.getAll().then(questions => callback(questions));
    } else {
      this.initialize().then(() => {
        questionRepository.getAll().then(questions => callback(questions));
      });
    }
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(questions: QuestionData[]) {
    this.subscribers.forEach(callback => callback(questions));
  }
}

export const questionService = QuestionService.getInstance();