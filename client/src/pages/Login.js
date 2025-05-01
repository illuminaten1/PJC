import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaLock, FaMoon, FaSun } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import FormField from '../components/common/FormField';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!username || !password) {
      setError('Veuillez saisir un nom d\'utilisateur et un mot de passe');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
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
      <ThemeToggle onClick={toggleDarkMode} darkMode={darkMode}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </ThemeToggle>
    
      <LoginCard darkMode={darkMode}>
        <LoginHeader darkMode={darkMode}>
          <Logo src="/logo192.png" alt="PJC Logo" />
          <Title darkMode={darkMode}>Protection Juridique Complémentaire</Title>
          <Subtitle darkMode={darkMode}>Connectez-vous pour accéder à l'application</Subtitle>
        </LoginHeader>
        
        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username" darkMode={darkMode}>
              <LabelIcon darkMode={darkMode}>
                <FaUser />
              </LabelIcon>
              Nom d'utilisateur
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom d'utilisateur"
              darkMode={darkMode}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password" darkMode={darkMode}>
              <LabelIcon darkMode={darkMode}>
                <FaLock />
              </LabelIcon>
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              darkMode={darkMode}
              required
            />
          </FormGroup>
          
          {error && <ErrorMessage darkMode={darkMode}>{error}</ErrorMessage>}
          
          <LoginButton type="submit" disabled={isLoading} darkMode={darkMode}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </LoginButton>
        </LoginForm>
        
        <Footer darkMode={darkMode}>
          © {new Date().getFullYear()} - BRPF
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
};

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${props => props.darkMode ? '#1a1a1a' : '#f5f5f5'};
  transition: background-color 0.3s;
  position: relative;
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.darkMode ? '#2c2c2c' : '#ffffff'};
  color: ${props => props.darkMode ? '#f0c674' : '#6c6c6c'};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, ${props => props.darkMode ? '0.3' : '0.1'});
  transition: background-color 0.3s, color 0.3s;
  
  &:hover {
    background: ${props => props.darkMode ? '#3c3c3c' : '#f0f0f0'};
  }
`;

const LoginCard = styled.div`
  background-color: ${props => props.darkMode ? '#121212' : 'white'};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, ${props => props.darkMode ? '0.3' : '0.1'});
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  transition: background-color 0.3s, box-shadow 0.3s;
`;

const LoginHeader = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: ${props => props.darkMode ? '#1c1c1c' : '#003366'};
  transition: background-color 0.3s;
`;

const Logo = styled.img`
  height: 80px;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${props => props.darkMode ? '#3f8cff' : 'white'};
  margin: 0;
  transition: color 0.3s;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.darkMode ? '#b0b0b0' : 'rgba(255, 255, 255, 0.8)'};
  margin-top: 0.5rem;
  transition: color 0.3s;
`;

const LoginForm = styled.form`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  transition: color 0.3s;
`;

const LabelIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
  color: ${props => props.darkMode ? '#3f8cff' : '#003366'};
  transition: color 0.3s;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.darkMode ? '#2c2c2c' : '#ddd'};
  border-radius: 4px;
  font-size: 1rem;
  background-color: ${props => props.darkMode ? '#1e1e1e' : '#fff'};
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  transition: border-color 0.3s, background-color 0.3s, color 0.3s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.darkMode ? '#3f8cff' : '#003366'};
    box-shadow: 0 0 0 2px ${props => props.darkMode ? 'rgba(63, 140, 255, 0.2)' : 'rgba(0, 51, 102, 0.2)'};
  }
  
  &::placeholder {
    color: ${props => props.darkMode ? '#6c6c6c' : '#aaa'};
  }
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.darkMode ? 'rgba(244, 67, 54, 0.2)' : '#ffebee'};
  color: ${props => props.darkMode ? '#ff5252' : '#c62828'};
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  transition: background-color 0.3s, color 0.3s;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: ${props => props.darkMode ? '#3f8cff' : '#003366'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${props => props.darkMode ? '#2c78e0' : '#002347'};
  }
  
  &:disabled {
    background-color: ${props => props.darkMode ? '#2a5999' : '#99b4cc'};
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: ${props => props.darkMode ? '#6c6c6c' : '#666'};
  border-top: 1px solid ${props => props.darkMode ? '#2c2c2c' : '#eee'};
  transition: color 0.3s, border-color 0.3s;
`;

export default Login;