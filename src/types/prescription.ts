export interface BracketChoice {
  id: string;
  name: string;
}

export interface ToothPosition {
  id: string;
  name: string;
}

export interface SpecialCase {
  id: string;
  toothNumber: number;
  brand: string;
  type: string;
  positions: string[];
}

export interface UnitPrescription {
  tooth: string;
  position: string;
  bracketBrand: string;
  torqueType: string;
}

export interface ArchPrescription {
  brand: string;
  type: string;
  unitPrescriptions: UnitPrescription[];
  specialCases: SpecialCase[];
}

export interface PatientPrescription {
  id?: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  maxillary: ArchPrescription;
  mandibular: ArchPrescription;
}

export const BRACKET_BRANDS: BracketChoice[] = [
  { id: 'damon_q2', name: 'Damon Q2' },
  { id: 'damon_ultima', name: 'Damon Ultima' },
  { id: 'empower', name: 'Empower' }
];

export const BRACKET_TYPES: BracketChoice[] = [
  { id: 'low_torque', name: 'Low torque' },
  { id: 'standard', name: 'Standard' },
  { id: 'high_torque', name: 'High torque' }
];

export const POSITIONS: ToothPosition[] = [
  { id: 'inverted', name: 'À l\'envers' },
  { id: 'mesial', name: 'Mesial' },
  { id: 'distal', name: 'Distal' },
  { id: 'occlusal', name: 'Occlussal' },
  { id: 'cervical', name: 'Cervical' }
];