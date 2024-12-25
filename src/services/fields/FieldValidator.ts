import { Question } from '../../types/patient';

export class FieldValidator {
  validateField(field: Question): void {
    if (!field.text?.trim()) {
      throw new Error('Le libellé du champ est requis');
    }

    if (!field.type) {
      throw new Error('Le type de champ est requis');
    }

    if (!field.category) {
      throw new Error('La catégorie est requise');
    }

    // Validate choices if field type requires them
    if ((field.type === 'radio' || field.type === 'multiple') && field.choices) {
      this.validateChoices(field.choices);
    }
  }

  private validateChoices(choices: any[]): void {
    if (!choices.length) {
      throw new Error('Au moins un choix est requis');
    }

    choices.forEach((choice, index) => {
      if (!choice.text?.trim()) {
        throw new Error(`Le texte du choix ${index + 1} est requis`);
      }

      if (!choice.color?.match(/^#[0-9A-Fa-f]{6}$/)) {
        throw new Error(`La couleur du choix ${index + 1} est invalide`);
      }
    });
  }
}