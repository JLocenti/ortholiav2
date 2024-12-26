import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userSettingsService } from '../services/userSettings/UserSettingsService';

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSuperAdmin: () => boolean;
  createUser: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          setCurrentUser(firebaseUser);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const createUser = async (data: RegisterData) => {
    try {
      if (!data.email || !data.password) {
        throw new Error('Email et mot de passe requis');
      }

      setIsLoading(true);
      
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUserId = userCredential.user.uid;

      // Mettre à jour le profil Firebase Auth avec le nom complet
      if (data.firstName || data.lastName) {
        const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }

      // Initialiser les données par défaut pour le nouvel utilisateur
      await userSettingsService.createDefaultSettings(
        newUserId, 
        data.firstName || '', 
        data.lastName || '', 
        data.email,
        {
          company: data.company || '',
          phone: data.phone || '',
          address: data.address || ''
        }
      );

      // Se connecter automatiquement
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      navigate('/app/home');
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse email est déjà utilisée');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse email invalide');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('L\'inscription par email/mot de passe n\'est pas activée');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Le mot de passe est trop faible');
      } else {
        throw new Error('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      setIsLoading(true);
      
      // Test de la configuration Firebase
      if (!auth.app.options.apiKey) {
        throw new Error('Configuration Firebase manquante. Vérifiez vos variables d\'environnement.');
      }

      // Connexion
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Initialiser les paramètres utilisateur si nécessaire
      const settings = await userSettingsService.getUserSettings();
      
      if (!settings) {
        await userSettingsService.createDefaultSettings(
          userCredential.user.uid,
          userCredential.user.displayName || '',
          userCredential.user.photoURL || '',
          userCredential.user.email || ''
        );
      }

      navigate('/app/home');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Email ou mot de passe incorrect');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte ne correspond à cet email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe incorrect');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Erreur de connexion réseau. Vérifiez votre connexion internet');
      } else {
        throw new Error(error.message || 'Une erreur est survenue lors de la connexion');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const isSuperAdmin = () => {
    // L'unique utilisateur dans Firebase Auth est le super admin
    return !!currentUser;
  };

  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    logout,
    isSuperAdmin,
    createUser
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
    throw new Error('useAuth doit être utilisé avec AuthProvider');
  }
  return context;
}