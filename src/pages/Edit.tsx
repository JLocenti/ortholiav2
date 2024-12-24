import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import EditSidebar from '../components/sidebar/EditSidebar';
import PractitionerModal from '../components/modals/PractitionerModal';
import FieldModal from '../components/modals/FieldModal';
import { Practitioner } from '../types/practitioner';
import { Field } from '../types/field';

const predefinedColors = ['#FF69B4', '#33CC33', '#6666CC', '#CC3333', '#CCCC33'];

export default function Edit() {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPractitionerModal, setShowPractitionerModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingPractitioner, setEditingPractitioner] = useState<Practitioner | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);

  // Get category from URL
  useEffect(() => {
    const categoryFromUrl = window.location.pathname.split('/').pop();
    console.log('Initial category from URL:', categoryFromUrl);
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl);
    }
  }, []);

  // Initialize categories if needed
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && !activeCategory) {
      const defaultCategory = 'practitioners';
      console.log('Setting default category:', defaultCategory);
      setActiveCategory(defaultCategory);
      navigate(`/app/patient-edit/${defaultCategory}`);
    }
  }, [categories, categoriesLoading, activeCategory, navigate]);

  // Load items when category changes
  useEffect(() => {
    if (!activeCategory) {
      console.log('No active category yet');
      return;
    }

    console.log('Loading items for category:', activeCategory);
    setLoading(true);

    if (activeCategory === 'practitioners') {
      const unsubscribe = onSnapshot(
        collection(db, 'practitioners'),
        (snapshot) => {
          const practitionersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setItems(practitionersData);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading practitioners:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      const q = query(
        collection(db, 'fields'),
        where('categoryId', '==', activeCategory)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Loaded items:', itemsData);
        setItems(itemsData);
        setLoading(false);
      }, (error) => {
        console.error('Error loading items:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [activeCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    navigate(`/app/patient-edit/${categoryId}`);
  };

  const handleAddItem = () => {
    console.log('Adding new item in category:', activeCategory);
    if (activeCategory === 'practitioners') {
      setEditingPractitioner(null);
      setShowPractitionerModal(true);
    } else {
      setEditingField(null);
      setShowFieldModal(true);
    }
  };

  const handleEditItem = (item: any) => {
    console.log('Editing item:', item);
    if (activeCategory === 'practitioners') {
      setEditingPractitioner(item);
      setShowPractitionerModal(true);
    } else {
      setEditingField(item);
      setShowFieldModal(true);
    }
  };

  if (!activeCategory) {
    return (
      <div className="flex min-h-screen bg-gray-900 justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    try {
      if (activeCategory === 'practitioners') {
        // 1. Récupérer les champs associés au praticien
        const fieldsRef = collection(db, 'fields');
        const q = query(fieldsRef, where('practitionerId', '==', itemId));
        const fieldsSnapshot = await getDocs(q);
        
        // 2. Supprimer ou mettre à jour les champs associés
        for (const fieldDoc of fieldsSnapshot.docs) {
          await deleteDoc(doc(db, 'fields', fieldDoc.id));
        }

        // 3. Supprimer le praticien
        await deleteDoc(doc(db, 'practitioners', itemId));
      } else {
        const fieldDoc = await getDoc(doc(db, 'fields', itemId));
        if (fieldDoc.exists()) {
          const fieldData = fieldDoc.data();
          
          // Si le champ est lié à un praticien, mettre à jour le praticien
          if (fieldData.practitionerId) {
            const practitionerRef = doc(db, 'practitioners', fieldData.practitionerId);
            const practitionerDoc = await getDoc(practitionerRef);
            
            if (practitionerDoc.exists()) {
              const practitionerData = practitionerDoc.data();
              const fields = practitionerData.fields || [];
              
              await updateDoc(practitionerRef, {
                fields: fields.filter(id => id !== itemId),
                updatedAt: new Date().toISOString()
              });
            }
          }
        }

        // Supprimer le champ
        await deleteDoc(doc(db, 'fields', itemId));

        // Mettre à jour la catégorie
        const categoryRef = doc(db, 'categories', activeCategory);
        const categoryDoc = await getDoc(categoryRef);
        
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          const fields = categoryData.fields || [];
          
          await updateDoc(categoryRef, {
            fields: fields.filter(id => id !== itemId),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleSavePractitioner = async (practitioner: Partial<Practitioner>) => {
    try {
      const timestamp = new Date().toISOString();
      
      if (editingPractitioner) {
        // Mise à jour du praticien
        await updateDoc(doc(db, 'practitioners', editingPractitioner.id), {
          ...practitioner,
          updatedAt: timestamp
        });

        // Mettre à jour tous les champs qui référencent ce praticien
        const fieldsRef = collection(db, 'fields');
        const q = query(fieldsRef, where('practitionerId', '==', editingPractitioner.id));
        const fieldsSnapshot = await getDocs(q);
        
        for (const fieldDoc of fieldsSnapshot.docs) {
          await updateDoc(doc(db, 'fields', fieldDoc.id), {
            practitionerName: practitioner.name,
            practitionerColor: practitioner.color,
            updatedAt: timestamp
          });
        }
      } else {
        // Création d'un nouveau praticien
        const practitionerRef = await addDoc(collection(db, 'practitioners'), {
          ...practitioner,
          fields: [], // Liste des IDs des champs associés
          createdAt: timestamp,
          updatedAt: timestamp
        });

        // Créer automatiquement des champs par défaut pour ce praticien
        const defaultFields = [
          {
            type: 'text',
            name: 'Notes',
            description: `Notes pour ${practitioner.name}`,
            practitionerId: practitionerRef.id,
            practitionerName: practitioner.name,
            practitionerColor: practitioner.color
          },
          // Ajoutez d'autres champs par défaut si nécessaire
        ];

        for (const field of defaultFields) {
          const fieldRef = await addDoc(collection(db, 'fields'), {
            ...field,
            createdAt: timestamp,
            updatedAt: timestamp
          });

          // Mettre à jour le praticien avec l'ID du nouveau champ
          await updateDoc(doc(db, 'practitioners', practitionerRef.id), {
            fields: arrayUnion(fieldRef.id)
          });
        }
      }
      
      setShowPractitionerModal(false);
      setEditingPractitioner(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleSaveField = async (field: Partial<Field>) => {
    try {
      let fieldId = editingField?.id;
      const timestamp = new Date().toISOString();

      // Préparer les données du champ
      const fieldData = {
        ...field,
        categoryId: activeCategory,
        choices: field.type === 'text' ? null : field.choices?.map((choice, index) => ({
          id: choice.id || `choice_${index}`,
          text: choice.text,
          color: choice.color || predefinedColors[index % predefinedColors.length]
        })) || [],
        updatedAt: timestamp
      };

      // Si le champ est lié à un praticien
      if (field.practitionerId) {
        const practitionerRef = doc(db, 'practitioners', field.practitionerId);
        const practitionerDoc = await getDoc(practitionerRef);
        
        if (practitionerDoc.exists()) {
          const practitionerData = practitionerDoc.data();
          fieldData.practitionerName = practitionerData.name;
          fieldData.practitionerColor = practitionerData.color;
        }
      }

      if (fieldId) {
        // Mise à jour
        await updateDoc(doc(db, 'fields', fieldId), fieldData);
      } else {
        // Création
        const docRef = await addDoc(collection(db, 'fields'), {
          ...fieldData,
          createdAt: timestamp
        });
        fieldId = docRef.id;

        // Si le champ est lié à un praticien, mettre à jour le praticien
        if (field.practitionerId) {
          const practitionerRef = doc(db, 'practitioners', field.practitionerId);
          await updateDoc(practitionerRef, {
            fields: arrayUnion(fieldId)
          });
        }
      }

      setShowFieldModal(false);
      setEditingField(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <EditSidebar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* En-tête avec bouton d'ajout */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activeCategory === 'practitioners' ? 'Praticiens' : 'Champs'}
              </h1>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--theme-color)] rounded-md hover:bg-opacity-90"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter {activeCategory === 'practitioners' ? 'un praticien' : 'un champ'}
              </button>
            </div>

            {/* Liste des items */}
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-between items-center relative overflow-hidden"
                >
                  {activeCategory === 'practitioners' && item.color && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  <div className="flex items-center gap-4">
                    {(item.type === 'radio' || item.type === 'multiple') && item.color && (
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.text || item.name}
                      </h3>
                      {(item.type === 'radio' || item.type === 'multiple') && item.choices && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.choices.map((choice, index) => {
                            const choiceColor = typeof choice === 'string' ? predefinedColors[index % predefinedColors.length] : choice.color;
                            const choiceText = typeof choice === 'string' ? choice : choice.text;
                            return (
                              <div 
                                key={index}
                                className="px-3 py-1 rounded-full text-sm border"
                                style={{ 
                                  borderColor: choiceColor,
                                  color: choiceColor,
                                  backgroundColor: 'transparent'
                                }}
                              >
                                {choiceText}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPractitionerModal && (
        <PractitionerModal
          practitioner={editingPractitioner}
          onClose={() => {
            setShowPractitionerModal(false);
            setEditingPractitioner(null);
          }}
          onSave={async (data) => {
            try {
              await handleSavePractitioner(data);
            } catch (error) {
              console.error('Error saving practitioner:', error);
            }
          }}
        />
      )}

      {showFieldModal && (
        <FieldModal
          field={editingField}
          onClose={() => {
            setShowFieldModal(false);
            setEditingField(null);
          }}
          onSave={async (data) => {
            try {
              await handleSaveField(data);
            } catch (error) {
              console.error('Error saving field:', error);
            }
          }}
        />
      )}
    </div>
  );
}