import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white text-2xl font-bold">Ortholia</div>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
            >
              Se connecter
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="pt-32 pb-16 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Une Solution Innovante pour les Orthodontistes
        </h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
          Gérez vos 1eres consultations et bilans de manière professionnelle grâce à un outil intelligent qui collecte et organise facilement les données patients.
        </p>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-x-auto">
        <div className="grid md:grid-cols-3 gap-8 min-w-full">
          {[
            {
              title: "Gestion des patients",
              description: "Vue d'ensemble claire et organisée de tous vos patients",
              illustration: (
                <div className="aspect-video bg-white rounded-lg shadow-md mb-4 overflow-hidden p-4">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-32 h-8 bg-blue-100 rounded-md"></div>
                      <div className="w-24 h-8 bg-blue-500 rounded-md"></div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                          <div className="w-12 h-12 bg-blue-200 rounded-full mb-2 mx-auto"></div>
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 w-2/3 bg-gray-200 rounded mx-auto"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: "Formulaires personnalisables",
              description: "Créez des formulaires adaptés à vos besoins",
              illustration: (
                <div className="aspect-video bg-white rounded-lg shadow-md mb-4 overflow-hidden p-4">
                  <div className="h-full flex flex-col">
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 h-8 bg-purple-100 rounded-md"></div>
                      <div className="w-8 h-8 bg-purple-500 rounded-md"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-400 rounded"></div>
                        <div className="flex-1 h-6 bg-gray-100 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-400 rounded-full"></div>
                        <div className="flex-1 h-6 bg-gray-100 rounded"></div>
                      </div>
                      <div className="h-20 bg-gray-100 rounded"></div>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex-1 h-8 bg-purple-100 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: "Suivi et analyses",
              description: "Visualisez vos données de manière intuitive",
              illustration: (
                <div className="aspect-video bg-white rounded-lg shadow-md mb-4 overflow-hidden p-4">
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="space-x-2 flex">
                        {['#EF4444', '#F59E0B', '#10B981'].map((color) => (
                          <div key={color} className="w-24 h-8 rounded" style={{ backgroundColor: color }}></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 flex items-end gap-3 pb-4">
                      {[60, 45, 75, 30, 85, 50].map((height, i) => (
                        <div key={i} className="flex-1 bg-blue-500/20 rounded-t" style={{ height: `${height}%` }}>
                          <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height * 0.7}%` }}></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="w-8 h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
          ].map((feature, index) => (
            <div key={index} className="relative group">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 group-hover:shadow-lg">
                {feature.illustration}
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mt-2">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white/10 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Une Application Conçue pour Vous et Vos Patients
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Gain de Temps",
                description: "Automatisez les étapes clés des consultations et des bilans"
              },
              {
                title: "Flexibilité",
                description: "Travaillez où et quand vous le souhaitez"
              },
              {
                title: "Simplicité",
                description: "Une interface intuitive pensée pour répondre aux besoins spécifiques des orthodontistes"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-blue-100">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}