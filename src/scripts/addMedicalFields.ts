import { Question } from '../types/patient';
import { fieldService } from '../services/fields/FieldService';

const medicalFields: Partial<Question>[] = [
  {
    text: "Antécédents Médicaux",
    type: "textarea",
    category: "medical",
    description: "Historique médical complet du patient",
    required: false,
    order: 1
  },
  {
    text: "Antécédents Orthodontiques",
    type: "textarea",
    category: "medical",
    description: "Historique des traitements orthodontiques précédents",
    required: false,
    order: 2
  },
  {
    text: "Date des Premières Menstruations",
    type: "date",
    category: "medical",
    description: "Date importante pour évaluer la croissance",
    required: false,
    order: 3
  },
  {
    text: "Information(s) complémentaire(s)",
    type: "textarea",
    category: "medical",
    description: "Toute information médicale supplémentaire pertinente",
    required: false,
    order: 4
  },
  {
    text: "Motifs et Doléances du Patient",
    type: "textarea",
    category: "medical",
    description: "Raisons de la consultation et attentes du patient",
    required: true,
    order: 5
  }
];

async function addMedicalFields() {
  try {
    console.log('Début de l\'ajout des champs médicaux...');
    
    for (const field of medicalFields) {
      try {
        await fieldService.addField(field as Question);
        console.log(`Champ ajouté avec succès : ${field.text}`);
      } catch (error) {
        console.error(`Erreur lors de l'ajout du champ ${field.text}:`, error);
      }
    }
    
    console.log('Tous les champs ont été traités');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des champs:', error);
  }
}

// Exécuter le script
addMedicalFields();
