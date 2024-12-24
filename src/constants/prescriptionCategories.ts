export interface PrescriptionItem {
  id: string;
  name: string;
}

export interface PrescriptionCategory {
  id: string;
  name: string;
  items: PrescriptionItem[];
  nameIsLocked?: boolean;
}

export const defaultPrescriptionCategories: PrescriptionCategory[] = [];