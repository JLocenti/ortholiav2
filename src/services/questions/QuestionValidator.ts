import { Question } from '../../types/patient';

export class QuestionValidator {
  validateQuestion(question: Question): void {
    if (!question.id) {
      throw new Error('Question ID is required');
    }

    if (!question.text) {
      throw new Error('Question text is required');
    }

    if (!question.type) {
      throw new Error('Question type is required');
    }

    if (!question.category) {
      throw new Error('Question category is required');
    }

    if (question.choices) {
      question.choices.forEach(choice => {
        if (!choice.id) {
          throw new Error('Choice ID is required');
        }
        if (!choice.text) {
          throw new Error('Choice text is required');
        }
        if (!choice.color) {
          throw new Error('Choice color is required');
        }
        this.validateColor(choice.color);
      });
    }
  }

  validateColor(color: string): void {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(color)) {
      throw new Error('Invalid color format. Must be a valid hex color (e.g., #FF0000)');
    }
  }
}