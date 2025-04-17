import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppContext from './contexts/AppContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Affaires from './pages/Affaires';
import Avocats from './pages/Avocats';
import DetailAffaire from './pages/DetailAffaire';
import Militaires from './pages/Militaires';
import DetailMilitaire from './pages/DetailMilitaire';
import Beneficiaires from './pages/Beneficiaires';
import DetailBeneficiaire from './pages/DetailBeneficiaire';
import Statistiques from './pages/Statistiques';
import Parametres from './pages/Parametres';
import NotFound from './pages/NotFound';


function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  const context = {
    darkMode,
    toggleDarkMode: () => setDarkMode(!darkMode)
  };
  
  return (
    <AppContext.Provider value={context}>
      <div className={darkMode ? 'app dark-mode' : 'app'}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="affaires" element={<Affaires />} />
            <Route path="affaires/:id" element={<DetailAffaire />} />
            <Route path="militaires" element={<Militaires />} />
            <Route path="militaires/:id" element={<DetailMilitaire />} />
            <Route path="beneficiaires" element={<Beneficiaires />} />
            <Route path="beneficiaires/:id" element={<DetailBeneficiaire />} />
            <Route path="avocats" element={<Avocats />} />
            <Route path="statistiques" element={<Statistiques />} />
            <Route path="parametres" element={<Parametres />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </AppContext.Provider>
  );
}

export default App;
