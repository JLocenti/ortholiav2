import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserSettings, UserRole, USER_ROLES } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { initializeViewPreferences } from '../utils/initializeViewPreferences';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  userSettings: UserSettings | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  updateUserProfile: (profile: Partial<User>) => void;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  canManageRole: (role: UserRole) => boolean;
  recoverSuperAdmin: (email: string, recoveryCode: string) => Promise<void>;
  getAllUsers: () => User[];
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_RECOVERY_CODE = 'SA-RECOVERY-2024';

const mockUsers: Record<string, User> = {
  'jl@vincenti.fr': {
    id: 'super_admin',
    email: 'jl@vincenti.fr',
    firstName: 'Jean-Luc',
    lastName: 'Vincenti',
    phone: '',
    address: '',
    company: 'Ortholia',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    defaultViewId: 'global',
    customViews: [],
    createdAt: new Date().toISOString(),
    role: USER_ROLES.SUPER_ADMIN,
    status: 'active'
  }
};

const mockPasswords: Record<string, string> = {
  'jl@vincenti.fr': 'kiki'
};

const mockUserSettings: Record<string, UserSettings> = {
  'super_admin': {
    defaultViewId: 'global',
    customViews: [],
    theme: 'light',
    themeColor: '#3B82F6'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedSettings = localStorage.getItem('userSettings');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const settings = savedSettings ? JSON.parse(savedSettings) : mockUserSettings[user.id];
      setCurrentUser(user);
      setUserSettings(settings);
      setIsAuthenticated(true);
      
      // Déplacer l'initialisation des préférences dans une fonction séparée
      const initializePrefs = async () => {
        try {
          await initializeViewPreferences(user.id);
        } catch (error) {
          console.error('Erreur lors de l\'initialisation des préférences:', error);
        }
      };
      initializePrefs();
    }
  }, []);

  const register = async (data: RegisterData) => {
    const normalizedEmail = data.email.toLowerCase();
    
    if (mockUsers[normalizedEmail]) {
      throw new Error('Cet email est déjà utilisé');
    }

    const userId = `user_${Date.now()}`;
    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      company: data.company,
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
      defaultViewId: 'global',
      customViews: [],
      createdAt: new Date().toISOString(),
      role: USER_ROLES.MEMBER,
      status: 'active'
    };

    mockPasswords[normalizedEmail] = data.password;

    const newSettings: UserSettings = {
      defaultViewId: 'global',
      customViews: [],
      theme: 'light',
      themeColor: '#3B82F6'
    };

    mockUsers[normalizedEmail] = newUser;
    mockUserSettings[userId] = newSettings;

    setCurrentUser(newUser);
    setUserSettings(newSettings);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    // Initialiser les préférences de vue pour le nouvel utilisateur
    await initializeViewPreferences(userId);
  };

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase();
    const user = mockUsers[normalizedEmail];
    const storedPassword = mockPasswords[normalizedEmail];

    if (user && storedPassword === password) {
      const settings = mockUserSettings[user.id];
      setCurrentUser(user);
      setUserSettings(settings);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      try {
        await initializeViewPreferences(user.id);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des préférences:', error);
        // Continue même si l'initialisation échoue
      }
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserSettings(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userSettings');
    navigate('/');
  };

  const updateUserSettings = (settings: Partial<UserSettings>) => {
    if (currentUser && userSettings) {
      const newSettings = { ...userSettings, ...settings };
      mockUserSettings[currentUser.id] = newSettings;
      setUserSettings(newSettings);
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
    }
  };

  const updateUserProfile = (profile: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...profile };
      mockUsers[currentUser.email] = updatedUser;
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const getAllUsers = () => Object.values(mockUsers);

  const countSuperAdmins = () => {
    return Object.values(mockUsers).filter(user => user.role === USER_ROLES.SUPER_ADMIN).length;
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    if (!currentUser) return;

    const userToUpdate = Object.values(mockUsers).find(u => u.id === userId);
    if (!userToUpdate) return;

    if (!canManageRole(role)) return;

    if (currentUser.role === USER_ROLES.SUPER_ADMIN && 
        userToUpdate.id === currentUser.id && 
        role !== USER_ROLES.SUPER_ADMIN) {
      
      const superAdminCount = countSuperAdmins();
      
      if (superAdminCount === 1) {
        throw new Error('Action impossible : Il doit y avoir au moins un Super Administrateur dans le système.');
      }
      
      if (!window.confirm('Êtes-vous sûr de vouloir changer votre statut ? Une autre personne est déjà Super Administrateur.')) {
        return;
      }
    }

    const updatedUser = { ...userToUpdate, role };
    mockUsers[userToUpdate.email] = updatedUser;

    if (userId === currentUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const canManageRole = (role: UserRole): boolean => {
    if (!currentUser) return false;

    const { role: currentRole } = currentUser;
    
    switch (currentRole) {
      case USER_ROLES.SUPER_ADMIN:
        return true;
      case USER_ROLES.ADMIN:
        return role !== USER_ROLES.SUPER_ADMIN;
      default:
        return false;
    }
  };

  const recoverSuperAdmin = async (email: string, recoveryCode: string) => {
    if (recoveryCode !== SUPER_ADMIN_RECOVERY_CODE) {
      throw new Error('Code de récupération invalide');
    }

    const user = mockUsers[email.toLowerCase()];
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const updatedUser = { ...user, role: USER_ROLES.SUPER_ADMIN };
    mockUsers[email.toLowerCase()] = updatedUser;

    if (currentUser && currentUser.email === email) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      userSettings,
      login,
      logout,
      register,
      updateUserSettings,
      updateUserProfile,
      updateUserRole,
      canManageRole,
      recoverSuperAdmin,
      getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}