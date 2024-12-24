export interface PatientItem {
  itemId: string;
  value: string | string[];  // Pour supporter à la fois les valeurs simples et multiples
  otherValue?: string;       // Pour les cas où "Autre" est sélectionné
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  fileNumber: string;
  practitioner: string;
  items: PatientItem[];
  createdAt: string;
  updatedAt: string;
}
