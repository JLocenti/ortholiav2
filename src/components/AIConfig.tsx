import React from 'react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';

export default function AIConfig() {
  const { config, updateConfig } = useAIAnalysis();

  const models = [
    { id: 'gpt-4', name: 'GPT-4 (Recommandé)' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Clé API OpenAI
        </label>
        <input
          type="password"
          value={config.apiKey}
          onChange={(e) => updateConfig({ apiKey: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="sk-..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Modèle
        </label>
        <select
          value={config.model}
          onChange={(e) => updateConfig({ model: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Température (Créativité)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
            {config.temperature}
          </span>
        </div>
      </div>
    </div>
  );
}