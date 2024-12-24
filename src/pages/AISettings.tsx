import React from 'react';
import { Brain, Key, Sliders, Mic } from 'lucide-react';
import AIConfig from '../components/AIConfig';
import NavigationHeader from '../components/NavigationHeader';

export default function AISettings() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <NavigationHeader title="Intelligence Artificielle" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5" />
            Configuration OpenAI
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configurez votre clé API et les paramètres de l'IA pour l'analyse des patients.
          </p>
        </div>

        <AIConfig />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Dictée Vocale
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            La dictée vocale vous permet d'enregistrer vos observations qui seront automatiquement analysées par l'IA pour remplir les champs appropriés.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300">
            <Sliders className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              La dictée vocale est disponible lors de la création ou modification d'une fiche patient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}