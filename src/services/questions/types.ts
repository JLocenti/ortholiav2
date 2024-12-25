import { Question, Choice } from '../../types/patient';

export interface QuestionData extends Omit<Question, 'updatedAt'> {
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface ChoiceData extends Choice {
  color: string;
}

export interface QuestionUpdate {
  text?: string;
  description?: string;
  required?: boolean;
  choices?: ChoiceData[];
  order?: number;
}