export const fieldTypes = [
  { value: 'text', label: 'Texte sur une seule ligne' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'number', label: 'Nombre' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Case à cocher' },
  { value: 'radio', label: 'Choix unique' },
  { value: 'multiple', label: 'Choix multiple' }
] as const;

export type FieldType = typeof fieldTypes[number]['value'];