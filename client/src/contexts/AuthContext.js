import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Création du contexte d'authentification
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // États
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configuration d'axios pour inclure le token dans toutes les requêtes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Vérification du token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/verify');
        
        if (res.data.success) {
          setIsAuthenticated(true);
          setUser(res.data.utilisateur);
        } else {
          // Token invalide
          localStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        // Erreur de vérification (token expiré, invalide, etc.)
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Fonction de connexion
  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', {
        username,
        password
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setIsAuthenticated(true);
        setUser(res.data.utilisateur);
        return true;
      } else {
        throw new Error(res.data.message || 'Échec de la connexion');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        throw new Error(err.response.data.message || 'Identifiants incorrects');
      }
      throw new Error('Erreur de connexion au serveur');
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  // Fonction pour vérifier si l'utilisateur est administrateur
  const isAdmin = () => {
    return user && user.role === 'administrateur';
  };

  // Valeurs exposées par le contexte
  const contextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;