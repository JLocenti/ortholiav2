import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, USER_ROLE_LABELS, USER_ROLE_PERMISSIONS, UserRole } from '../types/user';
import { Shield, AlertCircle, Key } from 'lucide-react';
import Modal from '../components/Modal';

export default function GeneralSettings() {
  const { currentUser, updateUserRole, canManageRole, recoverSuperAdmin } = useAuth();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  if (!currentUser) return null;

  const handleRoleChange = async (role: UserRole) => {
    try {
      await updateUserRole(currentUser.id, role);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    try {
      await recoverSuperAdmin(recoveryEmail, recoveryCode);
      setShowRecoveryModal(false);
      alert('Statut Super Administrateur récupéré avec succès');
    } catch (error) {
      if (error instanceof Error) {
        setRecoveryError(error.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Paramètres
      </h1>

      <div className="space-y-6">
        {/* Gestion des Statuts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Gestion des Statuts
            </h2>
            <button
              onClick={() => setShowRecoveryModal(true)}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <Key className="w-4 h-4" />
              Récupérer le statut Super Admin
            </button>
          </div>

          {currentUser.role === USER_ROLES.MEMBER ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <p>Vous n'avez pas les permissions nécessaires pour gérer les statuts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Votre statut actuel : <span className="font-medium text-gray-900 dark:text-white">{USER_ROLE_LABELS[currentUser.role]}</span>
              </p>

              <div className="grid gap-4">
                {Object.entries(USER_ROLE_LABELS).map(([role, label]) => {
                  const isManageable = canManageRole(role as UserRole);
                  const isCurrentUserRole = currentUser.role === role;

                  return (
                    <div
                      key={role}
                      className={`p-4 rounded-lg border ${
                        isManageable
                          ? 'border-gray-200 dark:border-gray-700'
                          : 'border-gray-100 dark:border-gray-800 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {label}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getStatusDescription(role as UserRole)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {isCurrentUserRole && (
                            <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 rounded-full">
                              Statut actuel
                            </span>
                          )}
                          <input
                            type="radio"
                            name="role"
                            checked={isCurrentUserRole}
                            onChange={() => {
                              if (isManageable && !isCurrentUserRole) {
                                handleRoleChange(role as UserRole);
                              }
                            }}
                            disabled={!isManageable || isCurrentUserRole}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        title="Récupération du statut Super Administrateur"
      >
        <form onSubmit={handleRecovery} className="space-y-4">
          {recoveryError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {recoveryError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code de récupération
            </label>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowRecoveryModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Récupérer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function getStatusDescription(role: UserRole): string {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return 'Accès complet à toutes les fonctionnalités et gestion de tous les statuts';
    case USER_ROLES.ADMIN:
      return 'Gestion des statuts Administrateur et Membre';
    case USER_ROLES.MEMBER:
      return 'Accès aux fonctionnalités de base sans gestion des statuts';
    default:
      return '';
  }
}