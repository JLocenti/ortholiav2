import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Modal from '../Modal';
import { usePatients } from '../../context/PatientContext';
import { Field, Item } from '../../types/item';
import { PatientItemValue } from '../../types/patientItems';
import { patientItemsService } from '../../services/patientItemsService';
import { cn } from '../../utils/cn';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleFields?: string[];
  viewId?: string;
  onSubmit?: (data: any) => Promise<void>;
  columnVisibility: Record<string, boolean>;
}

export default function CreatePatientModal({ 
  isOpen, 
  onClose, 
  visibleFields = [], 
  viewId,
  onSubmit,
  columnVisibility
}: CreatePatientModalProps) {
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [formData, setFormData] = useState<{
    fileNumber: string;
    practitioner: string;
    itemValues: Array<{
      itemId: string;
      value: string | string[] | number;
      otherValue?: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }>({
    fileNumber: '',
    practitioner: '',
    itemValues: []
  });
  const { addPatient } = usePatients();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Charger les catégories
        const categoriesCollection = collection(db, 'categories');
        const categoriesQuery = query(categoriesCollection, orderBy('order'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);

        // Charger les praticiens
        const practitionersCollection = collection(db, 'practitioners');
        const practitionersSnapshot = await getDocs(practitionersCollection);
        const practitionersData = practitionersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPractitioners(practitionersData);

        // Charger les champs avec leur ordre
        const fieldsCollection = collection(db, 'fields');
        const fieldsSnapshot = await getDocs(fieldsCollection);
        let itemsData = fieldsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text || data.name,
            type: 'field',
            fieldType: data.type || 'text',
            required: data.required || false,
            categoryId: data.category || data.categoryId || 'general',
            choices: data.choices?.map((choice: any) => ({
              id: typeof choice === 'object' ? choice.id : choice,
              text: typeof choice === 'object' ? choice.text : choice,
              color: typeof choice === 'object' ? choice.color : '#6B7280'
            }))
          };
        });

        // Filtrer pour ne garder que les champs visibles dans le tableau
        itemsData = itemsData.filter(item => columnVisibility[item.id] === true);

        // Trier les champs par catégorie et ordre
        itemsData.sort((a, b) => {
          const catA = categoriesData.find(c => c.id === a.categoryId)?.order || 0;
          const catB = categoriesData.find(c => c.id === b.categoryId)?.order || 0;
          return catA - catB;
        });

        setItems(itemsData);
        
        // Définir l'onglet actif sur la première catégorie qui a des champs visibles
        if (itemsData.length > 0) {
          const firstCategory = categoriesData.find(cat => 
            itemsData.some(item => item.categoryId === cat.id)
          );
          if (firstCategory) {
            setActiveTab(firstCategory.id);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
      setFormData({
        fileNumber: '',
        practitioner: '',
        itemValues: []
      });
    }
  }, [isOpen, columnVisibility]);

  const handleInputChange = (itemId: string, value: string | string[] | number) => {
    const timestamp = new Date().toISOString();
    
    setFormData(prev => {
      const existingItemIndex = prev.itemValues.findIndex(item => item.itemId === itemId);
      let newValue;

      if (Array.isArray(value)) {
        // Pour les choix multiples, on s'assure que c'est toujours un tableau
        newValue = {
          itemId,
          value: value,
          createdAt: existingItemIndex >= 0 ? prev.itemValues[existingItemIndex].createdAt : timestamp,
          updatedAt: timestamp
        };
      } else {
        newValue = {
          itemId,
          value: value,
          createdAt: existingItemIndex >= 0 ? prev.itemValues[existingItemIndex].createdAt : timestamp,
          updatedAt: timestamp
        };
      }

      const newItemValues = [...prev.itemValues];
      if (existingItemIndex >= 0) {
        newItemValues[existingItemIndex] = newValue;
      } else {
        newItemValues.push(newValue);
      }
      
      return {
        ...prev,
        itemValues: newItemValues
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification du numéro de dossier
    if (!formData.fileNumber.trim()) {
      alert('Veuillez entrer un numéro de dossier');
      return;
    }

    // Vérification du praticien
    if (!formData.practitioner) {
      alert('Veuillez sélectionner un praticien');
      return;
    }

    try {
      setLoading(true);
      
      const timestamp = new Date().toISOString();
      
      // Convertir les itemValues en structure de champs
      const fields: Record<string, any> = {};
      formData.itemValues.forEach(item => {
        fields[item.itemId] = item.value;
      });

      const patientData = {
        fileNumber: formData.fileNumber.trim(),
        practitioner: formData.practitioner,
        createdAt: timestamp,
        updatedAt: timestamp,
        fields
      };

      if (onSubmit) {
        await onSubmit(patientData);
      } else {
        const patientId = await addPatient(patientData).catch(error => {
          if (error.message === 'Ce numéro de dossier existe déjà') {
            throw new Error('Ce numéro de dossier est déjà utilisé par un autre patient');
          }
          throw error;
        });

        if (!patientId) {
          throw new Error('Erreur lors de la création du patient : ID non retourné');
        }
      }

      onClose();
    } catch (error) {
      console.error('Error creating patient:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du patient');
    } finally {
      setLoading(false);
    }
  };

  const handleFileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setFormData(prev => ({
      ...prev,
      fileNumber: value
    }));
  };

  const renderField = (item: Item) => {
    if (item.type === 'field') {
      const itemValue = formData.itemValues.find(v => v.itemId === item.id);
      const value = itemValue?.value ?? '';

      return (
        <div 
          key={item.id} 
          id={`field-${item.id}`}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            {item.text}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {item.fieldType === 'short_text' || item.fieldType === 'text' ? (
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(item.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              required={item.required}
              placeholder={`Entrez ${item.text.toLowerCase()}`}
            />
          ) : item.fieldType === 'long_text' || item.fieldType === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => handleInputChange(item.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              required={item.required}
              rows={4}
              placeholder={`Écrivez ${item.text.toLowerCase()}`}
            />
          ) : item.fieldType === 'radio' ? (
            <div className="flex flex-wrap gap-2">
              {item.choices?.map((choice) => {
                const isSelected = value === choice.id;
                return (
                  <label key={choice.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`field_${item.id}`}
                      value={choice.id}
                      checked={isSelected}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm",
                        isSelected ? "text-white" : "bg-opacity-10 hover:bg-opacity-20"
                      )}
                      style={{
                        backgroundColor: isSelected ? choice.color : 'transparent',
                        color: isSelected ? 'white' : choice.color,
                        border: `2px solid ${choice.color}`,
                      }}
                    >
                      {choice.text}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : item.fieldType === 'multiple' ? (
            <div className="flex flex-wrap gap-2">
              {item.choices?.map((choice) => {
                const values = Array.isArray(value) ? value : [];
                const isSelected = values.includes(choice.id);
                return (
                  <label key={choice.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      name={`field_${item.id}`}
                      value={choice.id}
                      checked={isSelected}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...values, choice.id]
                          : values.filter(v => v !== choice.id);
                        handleInputChange(item.id, newValues);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm",
                        isSelected ? "text-white" : "bg-opacity-10 hover:bg-opacity-20"
                      )}
                      style={{
                        backgroundColor: isSelected ? choice.color : 'transparent',
                        color: isSelected ? 'white' : choice.color,
                        border: `2px solid ${choice.color}`,
                      }}
                    >
                      {choice.text}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(item.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              required={item.required}
              placeholder={`Entrez ${item.text.toLowerCase()}`}
            />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau patient" size="xl">
      <div className="flex flex-col h-[80vh]">
        {/* Basic information fixed at top */}
        <div className="pt-6 px-4">
          <div className="flex items-start space-x-12 pb-6">
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                N° Dossier
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.fileNumber}
                onChange={handleFileNumberChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Entrez le numéro de dossier"
                required
              />
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Praticien
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {practitioners.map((practitioner) => (
                      <label key={practitioner.id} className="cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.practitioner === practitioner.id}
                          onChange={() => setFormData(prev => ({ ...prev, practitioner: practitioner.id }))}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm",
                            formData.practitioner === practitioner.id
                              ? "text-white"
                              : "bg-opacity-10 hover:bg-opacity-20"
                          )}
                          style={{
                            backgroundColor: formData.practitioner === practitioner.id ? practitioner.color : 'transparent',
                            color: formData.practitioner === practitioner.id ? 'white' : practitioner.color,
                            border: `2px solid ${practitioner.color}`,
                          }}
                        >
                          {practitioner.name}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  type="button"
                  onClick={() => {
                    const prescriptionCategory = categories.find(cat => cat.name.toLowerCase() === 'prescription');
                    if (prescriptionCategory) {
                      setActiveTab(prescriptionCategory.id);
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Prescription
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const treatmentCategory = categories.find(cat => cat.name.toLowerCase() === 'traitement');
                    if (treatmentCategory) {
                      setActiveTab(treatmentCategory.id);
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Traitement
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category tabs header */}
        <div className="pt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto px-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={cn(
                  "py-2 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === category.id
                    ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {items
            .filter(item => item.categoryId === activeTab)
            .map(item => (
              <div key={item.id} className="space-y-2">
                {renderField(item)}
              </div>
            ))}
        </div>

        {/* Action buttons fixed at bottom */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-md disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer le patient"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
