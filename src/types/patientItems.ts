export interface PatientItemValue {
  id: string;
  patientId: string;
  itemId: string;
  value: string | string[] | number;
  otherValue?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  fileNumber: string;
  practitioner: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientWithItems extends Patient {
  itemValues: PatientItemValue[];
}
