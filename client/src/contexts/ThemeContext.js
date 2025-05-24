import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Récupérer la préférence depuis localStorage ou utiliser la préférence système
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sauvegarder la préférence de thème
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = {
    darkMode,
    toggleDarkMode,
    colors: {
      // Couleurs de base
      background: darkMode ? '#1a1a1a' : '#f5f5f5',
      surface: darkMode ? '#2d2d2d' : '#ffffff',
      surfaceHover: darkMode ? '#404040' : '#f9f9f9',
      
      // Texte
      textPrimary: darkMode ? '#ffffff' : '#212529',
      textSecondary: darkMode ? '#adb5bd' : '#6c757d',
      textMuted: darkMode ? '#868e96' : '#757575',
      
      // Bordures
      border: darkMode ? '#404040' : '#dee2e6',
      borderLight: darkMode ? '#555555' : '#e9ecef',
      
      // Couleurs d'accent
      primary: '#5c6bc0',
      primaryDark: '#303f9f',
      primaryLight: '#7986cb',
      
      // États
      success: darkMode ? '#4caf50' : '#28a745',
      successBg: darkMode ? '#1b4d1c' : '#d4edda',
      warning: darkMode ? '#ff9800' : '#ffc107',
      warningBg: darkMode ? '#4d2c00' : '#fff3cd',
      error: darkMode ? '#f44336' : '#dc3545',
      errorBg: darkMode ? '#4d1313' : '#f8d7da',
      
      // Ombres
      shadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      shadowHover: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 8px rgba(0, 0, 0, 0.15)',
      
      // Navigation
      navBackground: darkMode ? '#2d2d2d' : '#ffffff',
      navBorder: darkMode ? '#404040' : '#e0e0e0',
      navActive: darkMode ? '#404040' : '#f5f5f5',
      navText: darkMode ? '#ffffff' : '#333333',
      navTextMuted: darkMode ? '#adb5bd' : '#6c6c6c',
      
      // Cartes et statistiques
      cardIcon: {
        affaires: {
          bg: darkMode ? '#1a237e' : '#e3f2fd',
          color: darkMode ? '#5c6bc0' : '#1976d2'
        },
        militaires: {
          bg: darkMode ? '#1b5e20' : '#e8f5e9',
          color: darkMode ? '#66bb6a' : '#388e3c'
        },
        beneficiaires: {
          bg: darkMode ? '#e65100' : '#fff8e1',
          color: darkMode ? '#ffa726' : '#f57f17'
        },
        finances: {
          bg: darkMode ? '#4a148c' : '#f3e5f5',
          color: darkMode ? '#ba68c8' : '#8e24aa'
        }
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};