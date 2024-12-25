import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testFirebaseConnection } from '../utils/firebaseTest';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      await login(email.trim(), password);
      navigate('/app/home');
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestResult('Test en cours...');
    try {
      const result = await testFirebaseConnection();
      setTestResult(result.message);
    } catch (error) {
      setTestResult(`Erreur lors du test: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ortholia-blue to-ortholia-purple flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenue sur Ortholia
          </h2>
          <p className="mt-2 text-gray-600">
            Connectez-vous à votre compte
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {testResult && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="text-sm text-blue-700">{testResult}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-ortholia-blue focus:border-ortholia-blue"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-ortholia-blue focus:border-ortholia-blue"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-ortholia-blue hover:text-ortholia-purple">
                Mot de passe oublié ?
              </a>
            </div>
            <div className="text-sm">
              <Link to="/register" className="font-medium text-ortholia-blue hover:text-ortholia-purple">
                Créer un compte
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ortholia-blue hover:bg-ortholia-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ortholia-blue ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          <button
            type="button"
            onClick={handleTestConnection}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-ortholia-blue rounded-md shadow-sm text-sm font-medium text-ortholia-blue hover:bg-ortholia-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ortholia-blue"
          >
            Tester la connexion Firebase
          </button>
        </form>
      </div>
    </div>
  );
}
