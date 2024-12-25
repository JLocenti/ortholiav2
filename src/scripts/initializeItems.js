import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeItems() {
  try {
    const currentDate = new Date().toISOString();

    // Créer la catégorie "Général"
    const generalCategoryRef = await addDoc(collection(db, 'categories'), {
      name: 'Général',
      order: 1,
      createdAt: currentDate,
      updatedAt: currentDate
    });
    console.log('Catégorie "Général" créée avec ID:', generalCategoryRef.id);

    // Créer les items dans la catégorie "Général"
    const generalItems = [
      {
        id: 'dental_class',
        type: 'radio',
        text: 'Classe dentaire',
        description: 'Classification dentaire du patient',
        choices: [
          'Classe I',
          'Classe II division 1',
          'Classe II division 2',
          'Classe III'
        ],
        required: true,
        order: 1,
        category: generalCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        id: 'age',
        type: 'field',
        text: 'Âge',
        description: 'Âge du patient',
        fieldType: 'number',
        required: true,
        order: 2,
        category: generalCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'field',
        text: 'Antécédents Médicaux',
        description: 'Historique médical du patient',
        fieldType: 'textarea',
        required: false,
        order: 3,
        category: generalCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'field',
        text: 'Antécédents Orthodontiques',
        description: 'Historique des traitements orthodontiques',
        fieldType: 'textarea',
        required: false,
        order: 4,
        category: generalCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'multiple',
        text: 'Motif de consultation',
        description: 'Raisons principales de la consultation',
        choices: [
          'Esthétique',
          'Fonctionnel',
          'Douleurs',
          'Orthodontie',
          'Autre'
        ],
        required: true,
        order: 5,
        category: generalCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'radio',
        text: 'Urgence',
        description: 'Niveau d\'urgence de la consultation',
        choices: [
          'Non urgent',
          'Peu urgent',
          'Urgent',
          'Très urgent'
        ],
        required: true,
        order: 6,
        category: generalCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];

    for (const item of generalItems) {
      const docRef = await addDoc(collection(db, 'items'), item);
      console.log(`Item "${item.text}" créé avec ID:`, docRef.id);
    }

    // Créer la catégorie "Diagnostic"
    const diagnosticCategoryRef = await addDoc(collection(db, 'categories'), {
      name: 'Diagnostic',
      order: 2,
      createdAt: currentDate,
      updatedAt: currentDate
    });
    console.log('Catégorie "Diagnostic" créée avec ID:', diagnosticCategoryRef.id);

    // Créer les items dans la catégorie "Diagnostic"
    const diagnosticItems = [
      {
        type: 'multiple',
        text: 'Signes cliniques',
        description: 'Signes cliniques observés',
        choices: [
          'Douleurs articulaires',
          'Craquements',
          'Limitation d\'ouverture',
          'Déviation',
          'Bruxisme',
          'Usure dentaire',
          'Autre'
        ],
        required: true,
        order: 1,
        category: diagnosticCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'radio',
        text: 'Type de malocclusion',
        description: 'Classification de la malocclusion',
        choices: [
          'Classe I',
          'Classe II division 1',
          'Classe II division 2',
          'Classe III'
        ],
        required: true,
        order: 2,
        category: diagnosticCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'field',
        text: 'Notes complémentaires',
        description: 'Observations additionnelles sur le diagnostic',
        fieldType: 'textarea',
        required: false,
        order: 3,
        category: diagnosticCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];

    for (const item of diagnosticItems) {
      const docRef = await addDoc(collection(db, 'items'), item);
      console.log(`Item "${item.text}" créé avec ID:`, docRef.id);
    }

    // Créer la catégorie "Traitement"
    const traitementCategoryRef = await addDoc(collection(db, 'categories'), {
      name: 'Traitement',
      order: 3,
      createdAt: currentDate,
      updatedAt: currentDate
    });
    console.log('Catégorie "Traitement" créée avec ID:', traitementCategoryRef.id);

    // Créer les items dans la catégorie "Traitement"
    const traitementItems = [
      {
        type: 'multiple',
        text: 'Plan de traitement',
        description: 'Éléments du plan de traitement',
        choices: [
          'Gouttière de repositionnement',
          'Gouttière de protection',
          'Orthodontie',
          'Kinésithérapie',
          'Autre'
        ],
        required: true,
        order: 1,
        category: traitementCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'radio',
        text: 'Durée estimée',
        description: 'Durée estimée du traitement',
        choices: [
          '3 mois',
          '6 mois',
          '9 mois',
          '12 mois',
          'Plus de 12 mois'
        ],
        required: true,
        order: 2,
        category: traitementCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        type: 'field',
        text: 'Instructions spécifiques',
        description: 'Instructions particulières pour le traitement',
        fieldType: 'textarea',
        required: false,
        order: 3,
        category: traitementCategoryRef.id,
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];

    for (const item of traitementItems) {
      const docRef = await addDoc(collection(db, 'items'), item);
      console.log(`Item "${item.text}" créé avec ID:`, docRef.id);
    }

    // Créer les praticiens
    const practitioners = [
      {
        id: 'practitioner_jj',
        name: 'JJ',
        color: '#FFD700', // Couleur dorée/jaune
        type: 'practitioner',
        createdAt: currentDate,
        updatedAt: currentDate
      },
      {
        id: 'practitioner_joseph',
        name: 'Joseph-L',
        color: '#FFD700', // Même couleur dorée/jaune
        type: 'practitioner',
        createdAt: currentDate,
        updatedAt: currentDate
      }
    ];

    // Ajouter les praticiens à la base de données
    for (const practitioner of practitioners) {
      const docRef = await addDoc(collection(db, 'practitioners'), practitioner);
      console.log(`Praticien "${practitioner.name}" créé avec ID:`, docRef.id);
    }

    console.log('Initialisation terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
}

// Exécuter l'initialisation
initializeItems();

import { db } from '../config/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

const categories = [
  {
    id: 'general',
    name: 'Général',
    order: 1
  },
  {
    id: 'diagnostic',
    name: 'Diagnostic',
    order: 2
  },
  {
    id: 'traitement',
    name: 'Traitement',
    order: 3
  }
];

const items = [
  // Items Généraux
  {
    type: 'field',
    category: 'general',
    text: 'Âge',
    description: 'Âge du patient',
    fieldType: 'number',
    required: true,
    order: 1
  },
  {
    type: 'field',
    category: 'general',
    text: 'Sexe',
    fieldType: 'radio',
    choices: ['Homme', 'Femme', 'Autre'],
    required: true,
    order: 2
  },
  {
    type: 'field',
    category: 'general',
    text: 'Antécédents médicaux',
    description: 'Liste des antécédents médicaux significatifs',
    fieldType: 'textarea',
    required: false,
    order: 3
  },

  // Items Diagnostic
  {
    type: 'field',
    category: 'diagnostic',
    text: 'Motif de consultation',
    fieldType: 'multiple',
    choices: ['Douleur', 'Raideur', 'Inflammation', 'Traumatisme', 'Autre'],
    required: true,
    order: 1
  },
  {
    type: 'field',
    category: 'diagnostic',
    text: 'Localisation',
    fieldType: 'multiple',
    choices: ['Cervicale', 'Dorsale', 'Lombaire', 'Membre supérieur', 'Membre inférieur', 'Autre'],
    required: true,
    order: 2
  },
  {
    type: 'field',
    category: 'diagnostic',
    text: 'Intensité de la douleur',
    description: 'Échelle de 0 à 10',
    fieldType: 'number',
    required: true,
    order: 3
  },

  // Items Traitement
  {
    type: 'field',
    category: 'traitement',
    text: 'Type de traitement',
    fieldType: 'multiple',
    choices: ['Manipulation', 'Massage', 'Exercices', 'Électrothérapie', 'Autre'],
    required: true,
    order: 1
  },
  {
    type: 'field',
    category: 'traitement',
    text: 'Fréquence recommandée',
    fieldType: 'radio',
    choices: ['1x par semaine', '2x par semaine', '3x par semaine', 'Autre'],
    required: true,
    order: 2
  },
  {
    type: 'field',
    category: 'traitement',
    text: 'Notes de traitement',
    description: 'Observations et recommandations spécifiques',
    fieldType: 'textarea',
    required: false,
    order: 3
  }
];

async function initializeData() {
  try {
    // Ajouter les catégories
    for (const category of categories) {
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Ajouter les items
    for (const item of items) {
      await addDoc(collection(db, 'items'), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    console.log('Données initialisées avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données:', error);
  }
}

initializeData();
