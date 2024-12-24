import { useState } from 'react';
import OpenAI from 'openai';

interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export function useOpenAI() {
  const [config, setConfig] = useState<OpenAIConfig>(() => {
    const saved = localStorage.getItem('openai_config');
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      model: 'gpt-4',
      temperature: 0.3
    };
  });

  const updateConfig = (newConfig: Partial<OpenAIConfig>) => {
    const updated = { ...config, ...newConfig };
    localStorage.setItem('openai_config', JSON.stringify(updated));
    setConfig(updated);
  };

  const analyzeText = async (text: string) => {
    if (!config.apiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    const openai = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });

    const prompt = `
      En tant qu'expert en orthodontie, analyse le texte suivant et extrait les informations pertinentes
      pour chaque catégorie (général, clinique, fonctionnel, dentaire). Retourne les données au format JSON
      avec les identifiants de champs correspondants.
      
      Texte à analyser : ${text}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature
      });

      const result = response.choices[0]?.message?.content;
      if (!result) throw new Error('Pas de réponse de l\'API');

      return JSON.parse(result);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  };

  return {
    config,
    updateConfig,
    analyzeText
  };
}