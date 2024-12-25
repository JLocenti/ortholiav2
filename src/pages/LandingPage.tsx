import React from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, ClipboardDocumentListIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ortholia-blue to-ortholia-purple">
      <nav className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-white text-2xl font-bold">Ortholia</div>
          <Link
            to="/login"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Une Solution Innovante pour les Orthodontistes
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Gérez vos 1eres consultations et bilans de manière professionnelle grâce à un outil
            intelligent qui collecte et organise facilement les données patients.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="h-32 flex items-center justify-center">
              <UserGroupIcon className="w-24 h-24 text-ortholia-blue stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4">
              Gestion des patients
            </h3>
            <p className="text-gray-600 mt-2">
              Vue d'ensemble claire et organisée de tous vos patients
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="h-32 flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-24 h-24 text-ortholia-purple stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4">
              Formulaires personnalisables
            </h3>
            <p className="text-gray-600 mt-2">
              Créez des formulaires adaptés à vos besoins
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="h-32 flex items-center justify-center">
              <ChartBarIcon className="w-24 h-24 text-green-500 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4">
              Suivi et analyses
            </h3>
            <p className="text-gray-600 mt-2">
              Visualisez vos données de manière intuitive
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
