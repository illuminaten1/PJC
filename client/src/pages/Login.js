import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #212529;
`;

const LoginCard = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 48px;
  width: 100%;
  max-width: 440px;

  @media (max-width: 576px) {
    padding: 32px 24px;
    margin: 0 16px;
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 32px;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #ffffff;
  border: 2px solid #6c757d;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  color: #495057;
  letter-spacing: 1px;

  @media (max-width: 576px) {
    width: 64px;
    height: 64px;
    font-size: 16px;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  color: #212529;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: -0.025em;

  @media (max-width: 576px) {
    font-size: 18px;
  }
`;

const Subtitle = styled.p`
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
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
  color: #212529;
  font-weight: 500;
  font-size: 14px;
`;

const Required = styled.span`
  color: #dc3545;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  background: #ffffff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #495057;
    box-shadow: 0 0 0 2px rgba(73, 80, 87, 0.1);
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  display: ${props => props.show ? 'block' : 'none'};
`;

const LoginButton = styled.button`
  width: 100%;
  background: #495057;
  color: #ffffff;
  border: 1px solid #495057;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  position: relative;

  &:hover:not(:disabled) {
    background: #343a40;
    border-color: #343a40;
  }

  &:disabled {
    background: #6c757d;
    border-color: #6c757d;
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

const FormFooter = styled.div`
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
`;

const HelpText = styled.p`
  color: #6c757d;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
`;

const SecurityNotice = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 16px;
  margin-top: 24px;
  font-size: 12px;
  color: #495057;
  text-align: center;
`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <Logo>PJC</Logo>
          <Title>Protection Juridique Complémentaire</Title>
          <Subtitle>Système de gestion des dossiers</Subtitle>
        </LoginHeader>
        
        <LoginForm onSubmit={handleSubmit} noValidate autoComplete="on">
          <FormGroup>
            <FormLabel htmlFor="username">
              Nom d'utilisateur <Required>*</Required>
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
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="password">
              Mot de passe <Required>*</Required>
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
            />
          </FormGroup>
          
          <ErrorMessage show={!!error} role="alert" id="error-message">
            {error}
          </ErrorMessage>
          
          <LoginButton 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
            aria-describedby="login-status"
          >
            {isLoading ? '' : 'Se connecter'}
          </LoginButton>
          
          <SecurityNotice>
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