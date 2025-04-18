import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Composant de route privée qui vérifie l'authentification et les rôles
 * Redirige vers la page de connexion si non authentifié
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.requireAdmin - Si true, la route nécessite les droits administrateur
 */
const PrivateRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  // Composant de chargement simple
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontSize: '16px',
        color: '#666'
      }}>
        <div>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            margin: '0 auto 10px auto',
            animation: 'spin 2s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  // Si non authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si la route nécessite les droits administrateur, vérifier le rôle
  if (requireAdmin && user?.role !== 'administrateur') {
    // Rediriger vers la page d'accueil si l'utilisateur n'est pas administrateur
    return <Navigate to="/" replace />;
  }

  // Si authentifié (et admin si requis), rendre les routes enfants
  return <Outlet />;
};

export default PrivateRoute;