import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from 'firebase/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSuperAdmin: () => boolean;
  createUser: (email: string, password: string) => Promise<void>;
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

  const createUser = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      setIsLoading(true);
      
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUserId = userCredential.user.uid;

      // Initialiser les données par défaut pour le nouvel utilisateur via l'API
      const response = await fetch('http://localhost:3001/api/initialize-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: newUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize user data');
      }

      navigate('/app/home');
      return userCredential;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app/home');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
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