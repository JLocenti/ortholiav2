import { useState } from 'react';
import OpenAI from 'openai';

interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export function useAIAnalysis() {
  const [config, setConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('ai_config');
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      model: 'gpt-4',
      temperature: 0.3
    };
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const updateConfig = (newConfig: Partial<AIConfig>) => {
    const updated = { ...config, ...newConfig };
    localStorage.setItem('ai_config', JSON.stringify(updated));
    setConfig(updated);
  };

  const analyzeText = async (text: string) => {
    if (!config.apiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    setIsAnalyzing(true);

    try {
      const openai = new OpenAI({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true
      });

      const prompt = `
        En tant qu'expert en orthodontie, analyse le texte suivant et extrait les informations pertinentes
        pour chaque catégorie. Retourne les données au format JSON avec les identifiants de champs correspondants.
        
        Catégories à analyser :
        - Général (antécédents, motifs, traitements)
        - Signes cliniques (croissance, habitudes, ATM)
        - Diagnostic fonctionnel (ventilation, déglutition, langue)
        - Diagnostic dentaire (axes, supraclusion, infraclusion)
        - Diagnostic squelettique (maxillaire, mandibule, profil)
        
        Texte à analyser : ${text}
      `;

      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature
      });

      const result = response.choices[0]?.message?.content;
      if (!result) throw new Error('Pas de réponse de l\'API');

      return JSON.parse(result);
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    config,
    isAnalyzing,
    updateConfig,
    analyzeText
  };
}