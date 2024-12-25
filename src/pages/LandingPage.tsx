import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white text-3xl font-bold">Ortholia</div>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-2.5 border border-white/20 text-sm font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 transition-all duration-200"
            >
              Se connecter
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="pt-40 pb-20 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
          Une Solution Innovante<br />pour les Orthodontistes
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto mb-16">
          Gérez vos 1ères consultations et bilans de manière professionnelle grâce à un outil intelligent qui collecte et organise facilement les données patients.
        </p>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Gestion des patients */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-40 mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Illustration stylisée d'une liste de patients */}
                  <div className="absolute inset-0 flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-200"></div>
                      <div className="flex-1">
                        <div className="h-2.5 bg-blue-200 rounded w-3/4"></div>
                        <div className="h-2 bg-blue-100 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-200"></div>
                      <div className="flex-1">
                        <div className="h-2.5 bg-blue-200 rounded w-2/3"></div>
                        <div className="h-2 bg-blue-100 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-200"></div>
                      <div className="flex-1">
                        <div className="h-2.5 bg-blue-200 rounded w-4/5"></div>
                        <div className="h-2 bg-blue-100 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Gestion des patients</h3>
            <p className="text-gray-600">Vue d'ensemble claire et organisée de tous vos patients. Accédez rapidement aux informations essentielles.</p>
          </div>

          {/* Formulaires personnalisables */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-40 mb-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Illustration stylisée d'un formulaire */}
                  <div className="absolute inset-0 flex flex-col space-y-3">
                    <div className="h-6 bg-purple-200 rounded-lg w-3/4"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm border-2 border-purple-300"></div>
                      <div className="h-3 bg-purple-200 rounded flex-1"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full border-2 border-purple-300"></div>
                      <div className="h-3 bg-purple-200 rounded flex-1"></div>
                    </div>
                    <div className="h-12 bg-purple-100 rounded-lg border-2 border-purple-200"></div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Formulaires personnalisables</h3>
            <p className="text-gray-600">Créez des formulaires adaptés à vos besoins spécifiques. Personnalisez chaque aspect de vos consultations.</p>
          </div>

          {/* Suivi et analyses */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-40 mb-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Illustration stylisée de graphiques */}
                  <div className="absolute inset-0 flex items-end justify-between px-3">
                    <div className="w-1/6 bg-green-300 rounded-t h-[60%]"></div>
                    <div className="w-1/6 bg-green-400 rounded-t h-[80%]"></div>
                    <div className="w-1/6 bg-green-500 rounded-t h-[40%]"></div>
                    <div className="w-1/6 bg-green-400 rounded-t h-[70%]"></div>
                    <div className="w-1/6 bg-green-300 rounded-t h-[90%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Suivi et analyses</h3>
            <p className="text-gray-600">Visualisez vos données de manière intuitive. Prenez des décisions éclairées grâce à des analyses détaillées.</p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {/* Gain de Temps */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-40 mb-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Nouvelle illustration de progression/efficacité */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full max-w-[200px] flex items-end space-x-3">
                      {/* Première barre avec flèche */}
                      <div className="flex-1 flex flex-col items-center">
                        <div className="w-full h-16 bg-orange-200 rounded-t-lg relative">
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 
                                      border-l-[10px] border-l-transparent
                                      border-b-[16px] border-b-orange-200
                                      border-r-[10px] border-r-transparent">
                          </div>
                        </div>
                      </div>
                      {/* Deuxième barre avec flèche */}
                      <div className="flex-1 flex flex-col items-center">
                        <div className="w-full h-24 bg-orange-300 rounded-t-lg relative">
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 
                                      border-l-[10px] border-l-transparent
                                      border-b-[16px] border-b-orange-300
                                      border-r-[10px] border-r-transparent">
                          </div>
                        </div>
                      </div>
                      {/* Troisième barre avec flèche */}
                      <div className="flex-1 flex flex-col items-center">
                        <div className="w-full h-32 bg-orange-400 rounded-t-lg relative">
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 
                                      border-l-[10px] border-l-transparent
                                      border-b-[16px] border-b-orange-400
                                      border-r-[10px] border-r-transparent">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Gain de Temps</h3>
            <p className="text-gray-600">Automatisez les étapes clés des consultations et des bilans. Optimisez votre temps de travail.</p>
          </div>

          {/* Flexibilité */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-40 mb-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Illustration stylisée de la flexibilité */}
                  <div className="absolute inset-0 grid grid-cols-2 gap-3 p-2">
                    <div className="bg-indigo-200 rounded-lg"></div>
                    <div className="bg-indigo-300 rounded-lg"></div>
                    <div className="bg-indigo-300 rounded-lg"></div>
                    <div className="bg-indigo-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Flexibilité</h3>
            <p className="text-gray-600">Travaillez où et quand vous le souhaitez. Une solution adaptée à votre pratique.</p>
          </div>

          {/* Simplicité */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-40 mb-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Illustration stylisée de la simplicité */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 bg-pink-300 rounded-full opacity-20"></div>
                      <div className="absolute inset-2 bg-pink-200 rounded-full"></div>
                      <div className="absolute inset-4 bg-pink-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Simplicité</h3>
            <p className="text-gray-600">Une interface intuitive pensée pour répondre aux besoins spécifiques des orthodontistes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
