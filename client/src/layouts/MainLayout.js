import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background-color: #003366;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const Nav = styled.nav`
  background-color: #f0f0f0;
  padding: 0.5rem 1rem;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
`;

const NavItem = styled.li`
  a {
    color: #333;
    text-decoration: none;
    padding: 0.5rem;
    font-weight: ${props => props.active ? 'bold' : 'normal'};
    border-bottom: ${props => props.active ? '2px solid #003366' : 'none'};
    
    &:hover {
      color: #003366;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
`;

const UserRole = styled.span`
  font-size: 0.8rem;
  background-color: ${props => props.isAdmin ? '#4caf50' : '#3f51b5'};
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 8px;
`;

const LogoutButton = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 1rem;
`;

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useContext(AuthContext);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Container>
      <Header>
        <AppTitle>Protection Juridique Complémentaire - BRPF</AppTitle>
        
        {user && (
          <UserSection>
            <UserInfo>
              <FaUser />
              <span>{user.nom}</span>
              <UserRole isAdmin={isAdmin()}>
                {isAdmin() ? 'Administrateur' : 'Rédacteur'}
              </UserRole>
            </UserInfo>
            
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Déconnexion</span>
            </LogoutButton>
          </UserSection>
        )}
      </Header>
      
      <Nav>
        <NavList>
          <NavItem active={location.pathname === '/' || location.pathname === '/dashboard'}>
            <Link to="/">Tableau de bord</Link>
          </NavItem>
          <NavItem active={location.pathname.startsWith('/affaires')}>
            <Link to="/affaires">Affaires</Link>
          </NavItem>
          <NavItem active={location.pathname.startsWith('/militaires')}>
            <Link to="/militaires">Militaires</Link>
          </NavItem>
          <NavItem active={location.pathname.startsWith('/beneficiaires')}>
            <Link to="/beneficiaires">Bénéficiaires</Link>
          </NavItem>
          <NavItem active={location.pathname.startsWith('/avocats')}>
            <Link to="/avocats">Avocats</Link>
          </NavItem>
          <NavItem active={location.pathname.startsWith('/statistiques')}>
            <Link to="/statistiques">Statistiques</Link>
          </NavItem>
          <NavItem active={location.pathname.startsWith('/parametres')}>
            <Link to="/parametres">Paramètres</Link>
          </NavItem>
        </NavList>
      </Nav>
      
      <Content>
        <Outlet />
      </Content>
      
    </Container>
  );
};

export default MainLayout;