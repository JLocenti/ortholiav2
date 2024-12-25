import { Field } from './field';

export interface ViewField extends Field {
  id: string;
  name: string;
  type: string;
}

export interface ViewSettings {
  showLastModified: boolean;
  showPractitioner: boolean;
  visiblePractitioners?: string[];
}

export interface ColumnVisibility {
  fieldId: string;
  visible: boolean;
  order: number;
}

export interface ViewPreference {
  id: string;
  name: string;
  icon: string;
  columns: ColumnVisibility[];
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewPreferenceInput {
  name: string;
  icon: string;
  columns: ColumnVisibility[];
  isDefault?: boolean;
}

export interface View {
  id: string;
  name: string;
  icon: string;
  fields: ViewField[];
  isDefault?: boolean;
  settings: ViewSettings;
  preference: ViewPreference;
}

export interface Patient {
  id: string;
  fileNumber: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}