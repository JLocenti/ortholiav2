import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { defaultQuestions } from '../constants/defaultQuestions';

async function createDefaultView() {
  try {
    const viewPrefsCollection = collection(db, 'viewPreferences');
    
    // Create default columns from questions
    const defaultColumns = defaultQuestions.map(question => ({
      id: question.id,
      visible: true,
      order: defaultQuestions.indexOf(question)
    }));

    // Create the default view
    await addDoc(viewPrefsCollection, {
      name: 'Accueil',
      icon: 'Home',
      columns: defaultColumns,
      isDefault: true,
      settings: {
        showLastModified: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Default view created successfully');
  } catch (error) {
    console.error('Error creating default view:', error);
  }
}

createDefaultView();
