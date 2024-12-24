import { Question, Choice } from '../../types/patient';
import { QuestionData, ChoiceData } from './types';

export function sanitizeChoice(choice: Choice): ChoiceData {
  return {
    id: choice.id,
    text: choice.text,
    color: choice.color || '#3B82F6'
  };
}

export function sanitizeChoices(choices?: Choice[]): ChoiceData[] | undefined {
  if (!choices) return undefined;
  return choices.map(sanitizeChoice);
}

export function sanitizeQuestion(question: Question): QuestionData {
  const sanitized: QuestionData = {
    id: question.id,
    text: question.text,
    type: question.type,
    category: question.category,
    description: question.description || '',
    required: question.required || false,
    order: question.order
  };

  if (question.choices) {
    sanitized.choices = sanitizeChoices(question.choices);
  }

  return sanitized;
}

export function sanitizeQuestions(questions: Question[]): QuestionData[] {
  return questions.map(sanitizeQuestion);
}

export function mergeChoices(existing: ChoiceData[], defaults: Choice[]): ChoiceData[] {
  const merged = new Map<string, ChoiceData>();
  
  // Add default choices first
  defaults.forEach(defaultChoice => {
    merged.set(defaultChoice.id, sanitizeChoice(defaultChoice));
  });

  // Override with existing choices where applicable
  existing.forEach(existingChoice => {
    if (merged.has(existingChoice.id)) {
      const defaultChoice = merged.get(existingChoice.id)!;
      merged.set(existingChoice.id, {
        ...defaultChoice,
        ...existingChoice,
        color: existingChoice.color || defaultChoice.color
      });
    } else {
      merged.set(existingChoice.id, existingChoice);
    }
  });

  return Array.from(merged.values());
}

export function mergeQuestions(existing: QuestionData[], defaults: Question[]): QuestionData[] {
  const merged = new Map<string, QuestionData>();
  
  // Add default questions first
  defaults.forEach(defaultQ => {
    merged.set(defaultQ.id, sanitizeQuestion(defaultQ));
  });

  // Override with existing questions where applicable
  existing.forEach(existingQ => {
    if (merged.has(existingQ.id)) {
      const defaultQ = merged.get(existingQ.id)!;
      merged.set(existingQ.id, {
        ...defaultQ,
        ...existingQ,
        choices: existingQ.choices && defaultQ.choices ? 
          mergeChoices(existingQ.choices, defaultQ.choices) : 
          existingQ.choices || defaultQ.choices
      });
    } else {
      merged.set(existingQ.id, existingQ);
    }
  });

  return Array.from(merged.values()).sort((a, b) => a.order - b.order);
}