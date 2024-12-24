import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User as AppUser, UserSettings, UserRole, USER_ROLES } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { initializeViewPreferences } from '../utils/initializeViewPreferences';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile, 
  User as FirebaseUser 
} from 'firebase/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: AppUser | null;
  userSettings: UserSettings | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  updateUserProfile: (profile: Partial<AppUser>) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  canManageRole: (role: UserRole) => boolean;
  recoverSuperAdmin: (email: string, recoveryCode: string) => Promise<void>;
  getAllUsers: () => AppUser[];
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

const mockUsers: Record<string, AppUser> = {
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
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
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

  useEffect(() => {
    // Écouter les changements d'état de l'authentification Firebase
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Récupérer les données mock existantes
        const existingMockUser = Object.values(mockUsers).find(
          user => user.email.toLowerCase() === firebaseUser.email?.toLowerCase()
        );

        if (existingMockUser) {
          // Fusionner les données
          const mergedUser: AppUser = {
            ...existingMockUser,
            id: firebaseUser.uid,
            email: firebaseUser.email || existingMockUser.email,
            photo: firebaseUser.photoURL || existingMockUser.photo,
            displayName: firebaseUser.displayName || existingMockUser.displayName
          };

          setCurrentUser(mergedUser);
          setIsAuthenticated(true);

          // Mettre à jour le stockage local
          mockUsers[mergedUser.email] = mergedUser;
          localStorage.setItem('currentUser', JSON.stringify(mergedUser));

          // Initialiser les préférences
          const settings = mockUserSettings[mergedUser.id] || initializeViewPreferences();
          setUserSettings(settings);
          localStorage.setItem('userSettings', JSON.stringify(settings));
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setUserSettings(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userSettings');
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (data: RegisterData) => {
    const normalizedEmail = data.email.toLowerCase();
    
    if (mockUsers[normalizedEmail]) {
      throw new Error('Cet email est déjà utilisé');
    }

    const userId = `user_${Date.now()}`;
    const newUser: AppUser = {
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
    try {
      const normalizedEmail = email.toLowerCase();
      const mockUser = mockUsers[normalizedEmail];
      
      if (!mockUser) {
        throw new Error('Utilisateur non trouvé');
      }

      try {
        // Essayer de se connecter d'abord
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const firebaseUser = userCredential.user;
        await handleUserAuthentication(firebaseUser, mockUser);
      } catch (error: any) {
        // Si l'erreur est "user-not-found", créer le compte
        if (error.code === 'auth/user-not-found') {
          const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          const firebaseUser = userCredential.user;
          await handleUserAuthentication(firebaseUser, mockUser);
        } else {
          throw error;
        }
      }

      navigate('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const handleUserAuthentication = async (firebaseUser: FirebaseUser, mockUser: AppUser) => {
    // Fusionner les données Firebase avec les données mock
    const mergedUser: AppUser = {
      ...mockUser,
      id: firebaseUser.uid,
      email: firebaseUser.email || mockUser.email,
      photo: firebaseUser.photoURL || mockUser.photo,
      displayName: firebaseUser.displayName || mockUser.displayName
    };

    // Mettre à jour le profil Firebase si nécessaire
    if (mockUser.photo && !firebaseUser.photoURL) {
      await updateProfile(firebaseUser, {
        photoURL: mockUser.photo
      });
    }

    if (mockUser.displayName && !firebaseUser.displayName) {
      await updateProfile(firebaseUser, {
        displayName: mockUser.displayName
      });
    }

    // Mettre à jour le state et le stockage local
    mockUsers[mergedUser.email] = mergedUser;
    setCurrentUser(mergedUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(mergedUser));

    // Initialiser les préférences utilisateur
    const settings = mockUserSettings[mergedUser.id] || initializeViewPreferences();
    setUserSettings(settings);
    localStorage.setItem('userSettings', JSON.stringify(settings));
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

  const updateUserProfile = async (profile: Partial<AppUser>) => {
    if (!auth.currentUser) return;

    try {
      if (profile.photo) {
        await updateProfile(auth.currentUser, {
          photoURL: profile.photo
        });
      }

      if (profile.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profile.displayName
        });
      }

      // Mise à jour du state local après la mise à jour Firebase
      if (currentUser) {
        const updatedUser = { ...currentUser, ...profile };
        mockUsers[currentUser.email] = updatedUser;
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
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