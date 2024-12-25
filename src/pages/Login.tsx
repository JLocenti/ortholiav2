import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { login, resetPassword } = useAuth();

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Veuillez entrer votre email pour réinitialiser votre mot de passe');
      return;
    }

    try {
      await resetPassword(email);
      setResetEmailSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex flex-col items-center justify-center p-4">
      {/* Logo et Titre */}
      <div className="text-center text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">Ortholia</h1>
        <h2 className="text-2xl font-semibold mb-2">Une Solution Innovante pour les Orthodontistes</h2>
        <p className="text-lg opacity-90">Gérez vos 1ères consultations et bilans de manière professionnelle grâce à un outil intelligent qui collecte et organise facilement les données patients.</p>
      </div>

      {/* Carte de connexion */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Se connecter</h3>
          <p className="text-gray-600">Accédez à votre espace Ortholia</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {resetEmailSent && (
          <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Un email de réinitialisation a été envoyé à votre adresse email.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse e-mail
            </label>
            <input
              ref={emailInputRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm transition-all duration-200"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}