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
    <div className="min-h-screen bg-gradient-to-br from-[#4361ee] to-[#7209b7] flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-[28px] font-bold text-gray-900 mb-2">Bienvenue sur Ortholia</h2>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
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
            <label className="block text-[15px] text-gray-700 mb-2">
              Adresse e-mail
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-[15px]"
                placeholder="vous@exemple.com"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[15px] text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-[15px]"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[15px] text-blue-600 hover:text-blue-500"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-[10px] shadow-sm text-[15px] font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}