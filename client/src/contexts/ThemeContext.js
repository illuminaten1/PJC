import React, { createContext, useState, useEffect } from 'react';

// Création du contexte de thème
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Vérification de la préférence système et du thème sauvegardé
  const getInitialTheme = () => {
    // Vérifier si un thème est déjà sauvegardé dans localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    
    // Sinon, vérifier les préférences du système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    // Par défaut en mode clair
    return false;
  };
  
  // État pour le mode sombre
  const [darkMode, setDarkMode] = useState(getInitialTheme);
  
  // Sauvegarder les changements dans localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Mettre à jour les variables CSS globales
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Ne mettre à jour que si l'utilisateur n'a pas défini de préférence explicite
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
      }
    };
    
    // Abonnement aux changements
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Pour la compatibilité avec les anciens navigateurs
      mediaQuery.addListener(handleChange);
    }
    
    // Nettoyage de l'effet
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  
  // Fonction pour basculer le mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Valeurs exposées par le contexte
  const contextValue = {
    darkMode,
    toggleDarkMode
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};