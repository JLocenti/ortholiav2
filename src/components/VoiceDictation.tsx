import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Settings } from 'lucide-react';
import { useVoiceDictation } from '../hooks/useVoiceDictation';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import Modal from './Modal';
import AIConfig from './AIConfig';

interface VoiceDictationProps {
  onAnalysisComplete: (data: Record<string, any>) => void;
}

export default function VoiceDictation({ onAnalysisComplete }: VoiceDictationProps) {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  } = useVoiceDictation();

  const { isAnalyzing, analyzeText } = useAIAnalysis();
  const [showConfig, setShowConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          Votre navigateur ne supporte pas la reconnaissance vocale.
        </p>
      </div>
    );
  }

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      handleAnalysis();
    } else {
      startListening();
    }
  };

  const handleAnalysis = async () => {
    if (!transcript.trim()) return;
    
    setError(null);
    try {
      const analyzedData = await analyzeText(transcript);
      onAnalysisComplete(analyzedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'analyse');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={handleToggleListening}
          disabled={isAnalyzing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-colors duration-200
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              Arrêter la dictée
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Commencer la dictée
            </>
          )}
        </button>

        <button
          onClick={() => setShowConfig(true)}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {transcript && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {transcript}
          </p>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Analyse en cours...
        </div>
      )}

      <Modal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Configuration OpenAI"
      >
        <AIConfig />
      </Modal>
    </div>
  );
}