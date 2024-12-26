import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserSettings, UserRole, USER_ROLES } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { initializeViewPreferences } from '../utils/initializeViewPreferences';
import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          // Récupérer les données utilisateur de Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            setIsAuthenticated(true);

            // Récupérer les paramètres utilisateur
            const settingsDoc = await getDoc(doc(db, 'userSettings', firebaseUser.uid));
            if (settingsDoc.exists()) {
              setUserSettings(settingsDoc.data() as UserSettings);
            }
          }
        } else {
          setCurrentUser(null);
          setUserSettings(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setCurrentUser(null);
        setUserSettings(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Validation de base
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Vérifier si l'utilisateur existe dans Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        // Créer un nouvel utilisateur dans Firestore
        const newUser: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email || email.toLowerCase(),
          firstName: '',
          lastName: '',
          phone: '',
          address: '',
          company: '',
          photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
          defaultViewId: 'global',
          customViews: [],
          createdAt: new Date().toISOString(),
          role: USER_ROLES.MEMBER,
          status: 'active'
        };

        const newSettings: UserSettings = {
          defaultViewId: 'global',
          customViews: [],
          theme: 'light',
          themeColor: '#3B82F6'
        };

        // Initialiser les vues par défaut uniquement pour un nouvel utilisateur
        await initializeViewPreferences(userCredential.user.uid);

        // Sauvegarder les données dans Firestore
        await Promise.all([
          setDoc(doc(db, 'users', userCredential.user.uid), newUser),
          setDoc(doc(db, 'userSettings', userCredential.user.uid), newSettings)
        ]);

        setCurrentUser(newUser);
        setUserSettings(newSettings);
      } else {
        // Utilisateur existe déjà
        const userData = userDoc.data() as User;
        setCurrentUser(userData);

        // Récupérer ou créer les paramètres utilisateur
        const settingsDoc = await getDoc(doc(db, 'userSettings', userCredential.user.uid));
        if (settingsDoc.exists()) {
          setUserSettings(settingsDoc.data() as UserSettings);
        }
      }

      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserSettings(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      const newUser: User = {
        id: userCredential.user.uid,
        email: data.email.toLowerCase(),
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

      const newSettings: UserSettings = {
        defaultViewId: 'global',
        customViews: [],
        theme: 'light',
        themeColor: '#3B82F6'
      };

      // Initialiser les vues par défaut pour le nouvel utilisateur
      await initializeViewPreferences(userCredential.user.uid);

      // Sauvegarder les données utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      await setDoc(doc(db, 'userSettings', userCredential.user.uid), newSettings);

      setCurrentUser(newUser);
      setUserSettings(newSettings);
      setIsAuthenticated(true);
      
      navigate('/');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw new Error('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    userSettings,
    login,
    logout,
    register,
    updateUserSettings: (settings: Partial<UserSettings>) => {
      if (currentUser && userSettings) {
        const newSettings = { ...userSettings, ...settings };
        setUserSettings(newSettings);
        setDoc(doc(db, 'userSettings', currentUser.id), newSettings);
      }
    },
    updateUserProfile: (profile: Partial<User>) => {
      if (currentUser) {
        const updatedUser = { ...currentUser, ...profile };
        setCurrentUser(updatedUser);
        setDoc(doc(db, 'users', currentUser.id), updatedUser);
      }
    },
    updateUserRole: async (userId: string, role: UserRole) => {
      await setDoc(doc(db, 'users', userId), { role }, { merge: true });
    },
    canManageRole: (role: UserRole) => {
      return currentUser?.role === USER_ROLES.SUPER_ADMIN;
    },
    recoverSuperAdmin: async (email: string, recoveryCode: string) => {
      // Implémenter la logique de récupération si nécessaire
    },
    getAllUsers: () => {
      // Implémenter la récupération des utilisateurs si nécessaire
      return [];
    }
  };

  return (
    <AuthContext.Provider value={value}>
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