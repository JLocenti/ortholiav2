export interface ColumnVisibility {
  id: string;          // ID de la colonne
  visible: boolean;    // État de visibilité
}

export interface ViewPreferences {
  id: string;          // ID de la vue
  userId: string;      // ID de l'utilisateur
  name: string;        // Nom de la vue
  icon: string;        // Icône de la vue
  columns: ColumnVisibility[]; // État de visibilité des colonnes
  showLastModified: boolean;   // Afficher la dernière modification
  isDefault?: boolean;         // Vue par défaut
  createdAt: string;
  updatedAt: string;
}
