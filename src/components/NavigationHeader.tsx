import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationHeaderProps {
  title: string;
}

export default function NavigationHeader({ title }: NavigationHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={() => navigate('/app/home')}
        className="p-2 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Retour à l'accueil"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
    </div>
  );
}