import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaSignOutAlt, FaUser, FaChartPie, FaFileAlt, 
  FaShieldAlt, FaUsers, FaBriefcase, FaChartBar, 
  FaCog, FaSearch, FaMoon, FaSun
} from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Déterminer l'onglet actif en fonction de l'URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.startsWith('/affaires')) return 'affaires';
    if (path.startsWith('/militaires')) return 'militaires';
    if (path.startsWith('/beneficiaires')) return 'beneficiaires';
    if (path.startsWith('/avocats')) return 'avocats';
    if (path.startsWith('/statistiques')) return 'statistiques';
    if (path.startsWith('/parametres')) return 'parametres';
    return '';
  };
  
  const activeTab = getActiveTab();
  
  return (
    <Container darkMode={darkMode}>
      <Header darkMode={darkMode}>
        <HeaderContent>
          <AppTitle darkMode={darkMode}>Protection Juridique Complémentaire - BRPF</AppTitle>
          
          <UserSection>
            {/* Bouton de basculement du thème */}
            <ThemeToggle onClick={toggleDarkMode} darkMode={darkMode}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </ThemeToggle>
            
            {/* Informations utilisateur */}
            <UserInfo darkMode={darkMode}>
              <UserIcon darkMode={darkMode}>
                <FaUser />
              </UserIcon>
              <span>{user?.nom}</span>
              <UserRole darkMode={darkMode} isAdmin={isAdmin()}>
                {isAdmin() ? 'Administrateur' : 'Rédacteur'}
              </UserRole>
            </UserInfo>
            
            {/* Bouton de déconnexion */}
            <LogoutButton onClick={handleLogout} darkMode={darkMode}>
              <FaSignOutAlt />
            </LogoutButton>
          </UserSection>
        </HeaderContent>
        
        {/* Navigation avec onglets */}
        <Nav darkMode={darkMode}>
          <NavList>
            <NavItem active={activeTab === 'dashboard'} darkMode={darkMode}>
              <StyledLink to="/" darkMode={darkMode}>
                <NavIcon><FaChartPie /></NavIcon>
                <span>Tableau de bord</span>
              </StyledLink>
              {activeTab === 'dashboard' && <ActiveIndicator darkMode={darkMode} />}
            </NavItem>
            
            <NavItem active={activeTab === 'affaires'} darkMode={darkMode}>
              <StyledLink to="/affaires" darkMode={darkMode}>
                <NavIcon><FaFileAlt /></NavIcon>
                <span>Affaires</span>
              </StyledLink>
              {activeTab === 'affaires' && <ActiveIndicator darkMode={darkMode} />}
            </NavItem>
            
            <NavItem active={activeTab === 'militaires'} darkMode={darkMode}>
              <StyledLink to="/militaires" darkMode={darkMode}>
                <NavIcon><FaShieldAlt /></NavIcon>
                <span>Militaires</span>
              </StyledLink>
              {activeTab === 'militaires' && <ActiveIndicator darkMode={darkMode} />}
            </NavItem>
            
            <NavItem active={activeTab === 'beneficiaires'} darkMode={darkMode}>
              <StyledLink to="/beneficiaires" darkMode={darkMode}>
                <NavIcon><FaUsers /></NavIcon>
                <span>Bénéficiaires</span>
              </StyledLink>
              {activeTab === 'beneficiaires' && <ActiveIndicator darkMode={darkMode} />}
            </NavItem>
            
            <NavItem active={activeTab === 'avocats'} darkMode={darkMode}>
              <StyledLink to="/avocats" darkMode={darkMode}>
                <NavIcon><FaBriefcase /></NavIcon>
                <span>Avocats</span>
              </StyledLink>
              {activeTab === 'avocats' && <ActiveIndicator darkMode={darkMode} />}
            </NavItem>
            
            <NavItem active={activeTab === 'statistiques'} darkMode={darkMode}>
              <StyledLink to="/statistiques" darkMode={darkMode}>
                <NavIcon><FaChartBar /></NavIcon>
                <span>Statistiques</span>
              </StyledLink>
              {activeTab === 'statistiques' && <ActiveIndicator darkMode={darkMode} />}
            </NavItem>
            
            <NavItem active={activeTab === 'parametres'} darkMode={darkMode}>
              <StyledLink to="/parametres" darkMode={darkMode}>
                <NavIcon><FaCog /></NavIcon>
                <span>Paramètres</span>
              </StyledLink>
              {activeTab === 'parametres' && <ActiveIndicator darkMode={darkMode} />}
            </NavItem>
          </NavList>
        </Nav>
      </Header>
      
      <Content darkMode={darkMode}>
        <Outlet />
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.darkMode ? '#1a1a1a' : '#f5f5f5'};
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  transition: background-color 0.3s, color 0.3s;
`;

const Header = styled.header`
  background-color: ${props => props.darkMode ? '#121212' : '#fff'};
  border-bottom: 1px solid ${props => props.darkMode ? '#2c2c2c' : '#e0e0e0'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, ${props => props.darkMode ? '0.3' : '0.05'});
  transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.darkMode ? '#3f8cff' : '#003366'};
  transition: color 0.3s;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.darkMode ? '#2c2c2c' : '#f0f0f0'};
  color: ${props => props.darkMode ? '#f0c674' : '#6c6c6c'};
  border: none;
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  
  &:hover {
    background: ${props => props.darkMode ? '#3c3c3c' : '#e0e0e0'};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  transition: color 0.3s;
`;

const UserIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${props => props.darkMode ? '#3f8cff' : '#003366'};
  transition: color 0.3s;
`;

const UserRole = styled.span`
  background-color: ${props => {
    if (props.darkMode) {
      return props.isAdmin ? '#264c26' : '#1a365d';
    }
    return props.isAdmin ? '#e8f5e9' : '#e3f2fd';
  }};
  color: ${props => {
    if (props.darkMode) {
      return props.isAdmin ? '#81c784' : '#82b1ff';
    }
    return props.isAdmin ? '#2e7d32' : '#0d47a1';
  }};
  padding: 0.15rem 0.4rem;
  border-radius: 0.75rem;
  font-size: 0.65rem;
  transition: background-color 0.3s, color 0.3s;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${props => props.darkMode ? '#8c8c8c' : '#6c6c6c'};
  border: none;
  padding: 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.3s, color 0.3s;
  
  &:hover {
    background-color: ${props => props.darkMode ? '#2c2c2c' : '#f0f0f0'};
    color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  }
`;

const Nav = styled.nav`
  background-color: ${props => props.darkMode ? '#1c1c1c' : '#fff'};
  border-top: 1px solid ${props => props.darkMode ? '#2c2c2c' : '#f0f0f0'};
  transition: background-color 0.3s, border-color 0.3s;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
`;

const NavItem = styled.li`
  position: relative;
  
  a {
    color: ${props => {
      if (props.active) {
        return props.darkMode ? '#3f8cff' : '#003366';
      }
      return props.darkMode ? '#8c8c8c' : '#6c6c6c';
    }};
    background-color: ${props => {
      if (props.active) {
        return props.darkMode ? '#24292e' : '#f5f5f5';
      }
      return 'transparent';
    }};
    font-weight: ${props => props.active ? '500' : 'normal'};
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s, background-color 0.3s;
  
  &:hover {
    color: ${props => props.darkMode ? '#e0e0e0' : '#003366'};
    background-color: ${props => props.darkMode ? '#24292e' : '#f5f5f5'};
  }
`;

const NavIcon = styled.span`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: ${props => props.darkMode ? '#3f8cff' : '#003366'};
  transition: background-color 0.3s;
`;

const Content = styled.main`
  flex: 1;
  padding: 1rem;
  background-color: ${props => props.darkMode ? '#1a1a1a' : '#f5f5f5'};
  transition: background-color 0.3s;
`;

export default MainLayout;