import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${props => props.darkMode ? '#1a1a1a' : '#f8f9fa'};
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: ${props => props.darkMode ? '#e9ecef' : '#212529'};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const LoginCard = styled.div`
  background: ${props => props.darkMode ? '#2d2d2d' : '#ffffff'};
  border: 1px solid ${props => props.darkMode ? '#404040' : '#dee2e6'};
  border-radius: 4px;
  box-shadow: ${props => props.darkMode 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  padding: 48px;
  width: 100%;
  max-width: 440px;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

  @media (max-width: 576px) {
    padding: 32px 24px;
    margin: 0 16px;
  }
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  color: ${props => props.darkMode ? '#adb5bd' : '#6c757d'};
  opacity: 0.7;

  &:hover {
    opacity: 1;
    background: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 1px solid ${props => props.darkMode ? '#404040' : '#e9ecef'};
  padding-bottom: 32px;
  transition: border-color 0.3s ease;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: ${props => props.darkMode ? '#404040' : '#ffffff'};
  border: 2px solid ${props => props.darkMode ? '#666666' : '#6c757d'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  color: ${props => props.darkMode ? '#e9ecef' : '#495057'};
  letter-spacing: 1px;
  transition: all 0.3s ease;

  @media (max-width: 576px) {
    width: 64px;
    height: 64px;
    font-size: 16px;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  color: ${props => props.darkMode ? '#ffffff' : '#212529'};
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: -0.025em;
  transition: color 0.3s ease;

  @media (max-width: 576px) {
    font-size: 18px;
  }
`;

const Subtitle = styled.p`
  color: ${props => props.darkMode ? '#adb5bd' : '#6c757d'};
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  transition: color 0.3s ease;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  color: ${props => props.darkMode ? '#ffffff' : '#212529'};
  font-weight: 500;
  font-size: 14px;
  transition: color 0.3s ease;
`;

const Required = styled.span`
  color: ${props => props.darkMode ? '#ff6b6b' : '#dc3545'};
  transition: color 0.3s ease;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.darkMode ? '#555555' : '#ced4da'};
  border-radius: 4px;
  font-size: 16px;
  background: ${props => props.darkMode ? '#404040' : '#ffffff'};
  color: ${props => props.darkMode ? '#ffffff' : '#212529'};
  transition: all 0.15s ease-in-out;

  &::placeholder {
    color: ${props => props.darkMode ? '#adb5bd' : '#6c757d'};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? '#666666' : '#495057'};
    box-shadow: 0 0 0 2px ${props => props.darkMode 
      ? 'rgba(102, 102, 102, 0.2)' 
      : 'rgba(73, 80, 87, 0.1)'};
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.darkMode ? '#3d1a1a' : '#f8d7da'};
  color: ${props => props.darkMode ? '#ff9999' : '#721c24'};
  padding: 12px 16px;
  border: 1px solid ${props => props.darkMode ? '#663333' : '#f5c6cb'};
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  display: ${props => props.show ? 'block' : 'none'};
  transition: all 0.3s ease;
`;

const LoginButton = styled.button`
  width: 100%;
  background: ${props => props.darkMode ? '#495057' : '#495057'};
  color: #ffffff;
  border: 1px solid ${props => props.darkMode ? '#495057' : '#495057'};
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  position: relative;

  &:hover:not(:disabled) {
    background: ${props => props.darkMode ? '#343a40' : '#343a40'};
    border-color: ${props => props.darkMode ? '#343a40' : '#343a40'};
  }

  &:disabled {
    background: ${props => props.darkMode ? '#555555' : '#6c757d'};
    border-color: ${props => props.darkMode ? '#555555' : '#6c757d'};
    cursor: not-allowed;
  }

  &.loading {
    color: transparent;
  }

  &.loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    left: 50%;
    margin-left: -8px;
    margin-top: -8px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SecurityNotice = styled.div`
  background: ${props => props.darkMode ? '#1a1a1a' : '#f8f9fa'};
  border: 1px solid ${props => props.darkMode ? '#404040' : '#dee2e6'};
  border-radius: 4px;
  padding: 16px;
  margin-top: 24px;
  font-size: 12px;
  color: ${props => props.darkMode ? '#e9ecef' : '#495057'};
  text-align: center;
  transition: all 0.3s ease;
`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Récupérer la préférence depuis localStorage ou utiliser la préférence système
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Sauvegarder la préférence de thème
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!username.trim() || !password) {
      setError('Veuillez saisir un nom d\'utilisateur et un mot de passe');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Appel de la fonction login du context
      const success = await login(username, password);
      
      if (success) {
        // Redirection vers la page d'accueil si connexion réussie
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer darkMode={darkMode}>
      <ThemeToggle 
        darkMode={darkMode} 
        onClick={toggleDarkMode}
        title={darkMode ? 'Mode clair' : 'Mode sombre'}
      >
        {darkMode ? '☀️' : '🌙'}
      </ThemeToggle>
      
      <LoginCard darkMode={darkMode}>
        <LoginHeader darkMode={darkMode}>
          <Logo darkMode={darkMode}>PJC</Logo>
          <Title darkMode={darkMode}>Protection Juridique Complémentaire</Title>
          <Subtitle darkMode={darkMode}>Système de gestion des dossiers</Subtitle>
        </LoginHeader>
        
        <LoginForm onSubmit={handleSubmit} noValidate autoComplete="on">
          <FormGroup>
            <FormLabel htmlFor="username" darkMode={darkMode}>
              Nom d'utilisateur <Required darkMode={darkMode}>*</Required>
            </FormLabel>
            <FormInput
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Saisissez votre nom d'utilisateur"
              required
              autoComplete="username"
              aria-describedby={error ? "error-message" : undefined}
              darkMode={darkMode}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="password" darkMode={darkMode}>
              Mot de passe <Required darkMode={darkMode}>*</Required>
            </FormLabel>
            <FormInput
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Saisissez votre mot de passe"
              required
              autoComplete="current-password"
              aria-describedby={error ? "error-message" : undefined}
              darkMode={darkMode}
            />
          </FormGroup>
          
          <ErrorMessage show={!!error} role="alert" id="error-message" darkMode={darkMode}>
            {error}
          </ErrorMessage>
          
          <LoginButton 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
            aria-describedby="login-status"
            darkMode={darkMode}
          >
            {isLoading ? '' : 'Se connecter'}
          </LoginButton>
          
          <SecurityNotice darkMode={darkMode}>
            <strong>CONFIDENTIEL</strong><br />
            Accès réservé au personnel autorisé (BRPF).<br />
            Toutes les connexions sont enregistrées.
          </SecurityNotice>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;