import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, USER_ROLE_LABELS, User } from '../types/user';
import { Navigate } from 'react-router-dom';
import { Plus, Users, Building, Shield, Key } from 'lucide-react';
import Modal from '../components/Modal';
import NavigationHeader from '../components/NavigationHeader';

type DetailViewType = {
  company: string;
  role: 'super_admin' | 'admin' | 'member' | null;
} | null;

export default function AccountsView() {
  const { currentUser, getAllUsers } = useAuth();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [detailView, setDetailView] = useState<DetailViewType>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  if (!currentUser || currentUser.role === USER_ROLES.MEMBER) {
    return <Navigate to="/" />;
  }

  const users = getAllUsers();
  const isSuperAdmin = currentUser.role === USER_ROLES.SUPER_ADMIN;
  const isAdmin = currentUser.role === USER_ROLES.ADMIN;

  const filterUsersByRole = (users: User[], company?: string) => {
    return users.filter(user => {
      if (isSuperAdmin) return true;
      if (isAdmin) {
        return user.company === currentUser.company && 
               user.role !== USER_ROLES.SUPER_ADMIN;
      }
      return false;
    });
  };

  const filteredUsers = filterUsersByRole(users);

  const getRoleCount = (company: string, role: string) => {
    return users.filter(user => 
      user.company === company && 
      user.role === role
    ).length;
  };

  const getFilteredUsersByRoleAndCompany = (company: string, role: string) => {
    return users.filter(user => 
      user.company === company && 
      user.role === role
    );
  };

  if (detailView) {
    const filteredDetailUsers = getFilteredUsersByRoleAndCompany(detailView.company, detailView.role);
    const roleLabel = detailView.role === USER_ROLES.SUPER_ADMIN 
      ? 'Super Administrateurs'
      : detailView.role === USER_ROLES.ADMIN
      ? 'Administrateurs'
      : 'Membres';

    return (
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        <NavigationHeader title={`${roleLabel} - ${detailView.company}`} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prénom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Société
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDetailUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.firstName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.company}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <NavigationHeader title="Gestion des comptes" />
        <button
          onClick={() => setShowAddUserModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--theme-color)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-color)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {isSuperAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            Comptes globaux
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Société
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Super Administrateurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Administrateurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Membres
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from(new Set(users.map(user => user.company))).map(company => {
                  const superAdminCount = getRoleCount(company, USER_ROLES.SUPER_ADMIN);
                  const adminCount = getRoleCount(company, USER_ROLES.ADMIN);
                  const memberCount = getRoleCount(company, USER_ROLES.MEMBER);
                  
                  return (
                    <tr key={company} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {company || 'Non spécifié'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setDetailView({ company, role: USER_ROLES.SUPER_ADMIN })}
                          className="text-sm text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                        >
                          {superAdminCount}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setDetailView({ company, role: USER_ROLES.ADMIN })}
                          className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          {adminCount}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setDetailView({ company, role: USER_ROLES.MEMBER })}
                          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                        >
                          {memberCount}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5" />
            {isSuperAdmin ? 'Tous les utilisateurs' : `Utilisateurs de ${currentUser.company}`}
          </h2>
          <button
            onClick={() => setShowRecoveryModal(true)}
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <Key className="w-4 h-4" />
            Récupérer le statut Super Admin
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Société
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.firstName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.company || 'Non spécifié'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.role === USER_ROLES.SUPER_ADMIN 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        : user.role === USER_ROLES.ADMIN
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      {user.role === USER_ROLES.SUPER_ADMIN 
                        ? 'Super Admin'
                        : user.role === USER_ROLES.ADMIN
                        ? 'Admin'
                        : 'Membre'
                      }
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Ajouter un utilisateur"
      >
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-300">
            Fonctionnalité en cours de développement
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        title="Récupération du statut Super Administrateur"
      >
        <form className="space-y-4">
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