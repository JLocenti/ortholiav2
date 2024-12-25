import { Question, Category } from '../types/patient';
import { Patient } from '../types/view';

const STORAGE_KEYS = {
  QUESTIONS: 'ortholia_questions',
  CATEGORIES: 'ortholia_categories',
  FIELDS: 'ortholia_fields',
  PATIENTS: 'ortholia_patients'
};

class LocalStorageService {
  // Patients
  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading patients from localStorage:', error);
      return [];
    }
  }

  savePatients(patients: Patient[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    } catch (error) {
      console.error('Error saving patients to localStorage:', error);
    }
  }

  addPatient(patient: Patient): void {
    try {
      const patients = this.getPatients();
      patients.push(patient);
      this.savePatients(patients);
    } catch (error) {
      console.error('Error adding patient to localStorage:', error);
    }
  }

  updatePatient(patientId: string, updates: Partial<Patient>): void {
    try {
      const patients = this.getPatients();
      const index = patients.findIndex(p => p.id === patientId);
      if (index !== -1) {
        patients[index] = { ...patients[index], ...updates };
        this.savePatients(patients);
      }
    } catch (error) {
      console.error('Error updating patient in localStorage:', error);
    }
  }

  deletePatient(patientId: string): void {
    try {
      const patients = this.getPatients();
      const filtered = patients.filter(p => p.id !== patientId);
      this.savePatients(filtered);
    } catch (error) {
      console.error('Error deleting patient from localStorage:', error);
    }
  }

  // Questions
  getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading questions from localStorage:', error);
      return [];
    }
  }

  saveQuestions(questions: Question[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (error) {
      console.error('Error saving questions to localStorage:', error);
    }
  }

  // Categories
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading categories from localStorage:', error);
      return [];
    }
  }

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }

  // Fields
  getFields(categoryId: string): Question[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.FIELDS}_${categoryId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading fields from localStorage:', error);
      return [];
    }
  }

  saveField(categoryId: string, field: Question): void {
    try {
      const fields = this.getFields(categoryId);
      const existingIndex = fields.findIndex(f => f.id === field.id);
      
      if (existingIndex !== -1) {
        fields[existingIndex] = field;
      } else {
        fields.push(field);
      }

      localStorage.setItem(`${STORAGE_KEYS.FIELDS}_${categoryId}`, JSON.stringify(fields));
    } catch (error) {
      console.error('Error saving field to localStorage:', error);
    }
  }

  deleteField(categoryId: string, fieldId: string): void {
    try {
      const fields = this.getFields(categoryId);
      const updatedFields = fields.filter(f => f.id !== fieldId);
      localStorage.setItem(`${STORAGE_KEYS.FIELDS}_${categoryId}`, JSON.stringify(updatedFields));
    } catch (error) {
      console.error('Error deleting field from localStorage:', error);
    }
  }

  // Clear all data
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export const localStorageService = new LocalStorageService();