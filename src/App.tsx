import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ViewProvider } from './context/ViewContext';
import { ThemeProvider } from './context/ThemeContext';
import { PatientProvider } from './context/PatientContext';
import { FirestoreProvider } from './context/FirestoreContext';
import { PractitionerProvider } from './context/PractitionerContext';
import { useAuth } from './context/AuthContext';
import OfflineIndicator from './components/OfflineIndicator';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import AdminView from './pages/AdminView';
import Settings from './pages/Settings';
import AccountsView from './pages/AccountsView';
import LandingPage from './pages/LandingPage';
import AISettings from './pages/AISettings';
import Edit from './pages/Edit';
import { categoryService } from './services/categoryService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Chargement...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  useEffect(() => {
    // Initialiser les icônes des catégories
    categoryService.initializeCategoryIcons().catch(console.error);
    // Initialiser l'ordre des champs dans les catégories
    categoryService.initializeFieldsOrder().catch(console.error);
  }, []);

  return (
    <ThemeProvider>
      <ViewProvider>
        <PatientProvider>
          <FirestoreProvider>
            <PractitionerProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/app/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route index element={<Navigate to="home" replace />} />
                            <Route path=":viewId" element={<AdminView />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="accounts" element={<AccountsView />} />
                            <Route path="ai-settings" element={<AISettings />} />
                            <Route path="patient-edit/:categoryId" element={<Edit />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <OfflineIndicator />
              </div>
            </PractitionerProvider>
          </FirestoreProvider>
        </PatientProvider>
      </ViewProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}