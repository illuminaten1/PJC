import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Contextes
import AppContext from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Composant de route privée
import PrivateRoute from './utils/PrivateRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages publiques
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Pages privées
import Dashboard from './pages/Dashboard';
import Affaires from './pages/Affaires';
import DetailAffaire from './pages/DetailAffaire';
import Militaires from './pages/Militaires';
import DetailMilitaire from './pages/DetailMilitaire';
import Beneficiaires from './pages/Beneficiaires';
import DetailBeneficiaire from './pages/DetailBeneficiaire';
import Avocats from './pages/Avocats';
import Statistiques from './pages/Statistiques';
import Parametres from './pages/Parametres';
import Documentation from './pages/Documentation';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider> {/* Wrapper pour le thème */}
          <AppContext.Provider value={{ darkMode: false, toggleDarkMode: () => {} }}>
            <Routes>
              {/* Route publique */}
              <Route path="/login" element={<Login />} />
              
              {/* Routes privées (utilisateurs authentifiés) */}
              <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/affaires" element={<Affaires />} />
                  <Route path="/affaires/:id" element={<DetailAffaire />} />
                  <Route path="/militaires" element={<Militaires />} />
                  <Route path="/militaires/:id" element={<DetailMilitaire />} />
                  <Route path="/beneficiaires" element={<Beneficiaires />} />
                  <Route path="/beneficiaires/:id" element={<DetailBeneficiaire />} />
                  <Route path="/avocats" element={<Avocats />} />
                  <Route path="/statistiques" element={<Statistiques />} />
                  <Route path="/documentation" element={<Documentation />} />
                </Route>
              </Route>
              
              {/* Routes administrateur uniquement */}
              <Route element={<PrivateRoute requireAdmin={true} />}>
                <Route element={<MainLayout />}>
                  <Route path="/parametres" element={<Parametres />} />
                </Route>
              </Route>
              
              {/* Redirection et route 404 */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AppContext.Provider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;