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
    <div className="min-h-screen flex">
      {/* Image de fond à gauche */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/login-background.jpg"
          alt="Ortholia background"
        />
      </div>

      {/* Formulaire de connexion à droite */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <img
              className="mx-auto h-12 w-auto"
              src="/ortholia.svg"
              alt="Ortholia"
            />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Connexion à votre compte
            </h2>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {resetEmailSent && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Un email de réinitialisation a été envoyé à votre adresse email.
            </div>
          )}

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Adresse e-mail
                </label>
                <div className="mt-1">
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Se connecter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}