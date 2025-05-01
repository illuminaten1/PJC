import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaSignOutAlt, FaUser, FaChartPie, FaFileAlt, 
  FaShieldAlt, FaUsers, FaBriefcase, FaChartBar, 
  FaCog
} from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useContext(AuthContext);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
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
    <Container>
      <Header>
        <HeaderContent>
          <AppTitle>Protection Juridique Complémentaire - BRPF</AppTitle>
          
          <UserSection>
            <UserInfo>
              <UserIcon>
                <FaUser />
              </UserIcon>
              <span>{user?.nom}</span>
              <UserRole isAdmin={isAdmin()}>
                {isAdmin() ? 'Administrateur' : 'Rédacteur'}
              </UserRole>
            </UserInfo>
            
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt />
            </LogoutButton>
          </UserSection>
        </HeaderContent>
        
        <Nav>
          <NavList>
            <NavItem active={activeTab === 'dashboard'}>
              <StyledLink to="/">
                <NavIcon><FaChartPie /></NavIcon>
                <span>Tableau de bord</span>
              </StyledLink>
              {activeTab === 'dashboard' && <ActiveIndicator />}
            </NavItem>
            
            <NavItem active={activeTab === 'affaires'}>
              <StyledLink to="/affaires">
                <NavIcon><FaFileAlt /></NavIcon>
                <span>Affaires</span>
              </StyledLink>
              {activeTab === 'affaires' && <ActiveIndicator />}
            </NavItem>
            
            <NavItem active={activeTab === 'militaires'}>
              <StyledLink to="/militaires">
                <NavIcon><FaShieldAlt /></NavIcon>
                <span>Militaires</span>
              </StyledLink>
              {activeTab === 'militaires' && <ActiveIndicator />}
            </NavItem>
            
            <NavItem active={activeTab === 'beneficiaires'}>
              <StyledLink to="/beneficiaires">
                <NavIcon><FaUsers /></NavIcon>
                <span>Bénéficiaires</span>
              </StyledLink>
              {activeTab === 'beneficiaires' && <ActiveIndicator />}
            </NavItem>
            
            <NavItem active={activeTab === 'avocats'}>
              <StyledLink to="/avocats">
                <NavIcon><FaBriefcase /></NavIcon>
                <span>Avocats</span>
              </StyledLink>
              {activeTab === 'avocats' && <ActiveIndicator />}
            </NavItem>
            
            <NavItem active={activeTab === 'statistiques'}>
              <StyledLink to="/statistiques">
                <NavIcon><FaChartBar /></NavIcon>
                <span>Statistiques</span>
              </StyledLink>
              {activeTab === 'statistiques' && <ActiveIndicator />}
            </NavItem>
            
            <NavItem active={activeTab === 'parametres'}>
              <StyledLink to="/parametres">
                <NavIcon><FaCog /></NavIcon>
                <span>Paramètres</span>
              </StyledLink>
              {activeTab === 'parametres' && <ActiveIndicator />}
            </NavItem>
          </NavList>
        </Nav>
      </Header>
      
      <Content>
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
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  color: #003366;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #333;
`;

const UserIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #003366;
`;

const UserRole = styled.span`
  background-color: ${props => props.isAdmin ? '#e8f5e9' : '#e3f2fd'};
  color: ${props => props.isAdmin ? '#2e7d32' : '#0d47a1'};
  padding: 0.15rem 0.4rem;
  border-radius: 0.75rem;
  font-size: 0.65rem;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #6c6c6c;
  border: none;
  padding: 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 0.25rem;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const Nav = styled.nav`
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
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
    color: ${props => props.active ? '#003366' : '#6c6c6c'};
    background-color: ${props => props.active ? '#f5f5f5' : 'transparent'};
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
    color: #003366;
    background-color: #f5f5f5;
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
  background-color: #003366;
`;

const Content = styled.main`
  flex: 1;
  padding: 1rem;
`;

export default MainLayout;