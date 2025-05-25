import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaSignOutAlt, FaUser, FaChartPie, FaFileAlt, 
  FaShieldAlt, FaUsers, FaBriefcase, FaChartBar, 
  FaCog, FaBook // Nouvelle icône pour Documentation
} from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { darkMode, toggleDarkMode, colors } = useTheme();
  
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
    if (path.startsWith('/documentation')) return 'documentation';
    return '';
  };
  
  const activeTab = getActiveTab();
  
  return (
    <Container colors={colors}>
      <Header colors={colors}>
        <HeaderContent>
          <AppTitle colors={colors}>Protection Juridique Complémentaire - BRPF</AppTitle>
          
          <UserSection>
            <UserInfo colors={colors}>
              <UserIcon colors={colors}>
                <FaUser />
              </UserIcon>
              <span>{user?.nom}</span>
              <UserRole isAdmin={isAdmin()} colors={colors}>
                {isAdmin() ? 'Administrateur' : 'Rédacteur'}
              </UserRole>
            </UserInfo>
            
            <LogoutButton onClick={handleLogout} colors={colors}>
              <FaSignOutAlt />
            </LogoutButton>
          </UserSection>
        </HeaderContent>
        
        <Nav colors={colors}>
          <ThemeToggle 
            onClick={toggleDarkMode}
            colors={colors}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? '☀' : '●'}
          </ThemeToggle>
          <NavList>
            <NavItem active={activeTab === 'dashboard'} colors={colors}>
              <StyledLink to="/" colors={colors}>
                <NavIcon><FaChartPie /></NavIcon>
                <span>Tableau de bord</span>
              </StyledLink>
              {activeTab === 'dashboard' && <ActiveIndicator colors={colors} />}
            </NavItem>
            
            <NavItem active={activeTab === 'affaires'} colors={colors}>
              <StyledLink to="/affaires" colors={colors}>
                <NavIcon><FaFileAlt /></NavIcon>
                <span>Affaires</span>
              </StyledLink>
              {activeTab === 'affaires' && <ActiveIndicator colors={colors} />}
            </NavItem>
            
            <NavItem active={activeTab === 'militaires'} colors={colors}>
              <StyledLink to="/militaires" colors={colors}>
                <NavIcon><FaShieldAlt /></NavIcon>
                <span>Militaires</span>
              </StyledLink>
              {activeTab === 'militaires' && <ActiveIndicator colors={colors} />}
            </NavItem>
            
            <NavItem active={activeTab === 'beneficiaires'} colors={colors}>
              <StyledLink to="/beneficiaires" colors={colors}>
                <NavIcon><FaUsers /></NavIcon>
                <span>Bénéficiaires</span>
              </StyledLink>
              {activeTab === 'beneficiaires' && <ActiveIndicator colors={colors} />}
            </NavItem>
            
            <NavItem active={activeTab === 'avocats'} colors={colors}>
              <StyledLink to="/avocats" colors={colors}>
                <NavIcon><FaBriefcase /></NavIcon>
                <span>Avocats</span>
              </StyledLink>
              {activeTab === 'avocats' && <ActiveIndicator colors={colors} />}
            </NavItem>
            
            <NavItem active={activeTab === 'statistiques'} colors={colors}>
              <StyledLink to="/statistiques" colors={colors}>
                <NavIcon><FaChartBar /></NavIcon>
                <span>Statistiques</span>
              </StyledLink>
              {activeTab === 'statistiques' && <ActiveIndicator colors={colors} />}
            </NavItem>
            
            {/* Nouvelle entrée pour Documentation */}
            <NavItem active={activeTab === 'documentation'} colors={colors}>
              <StyledLink to="/documentation" colors={colors}>
                <NavIcon><FaBook /></NavIcon>
                <span>Documentation</span>
              </StyledLink>
              {activeTab === 'documentation' && <ActiveIndicator colors={colors} />}
            </NavItem>
            
            <NavItem active={activeTab === 'parametres'} colors={colors}>
              <StyledLink to="/parametres" colors={colors}>
                <NavIcon><FaCog /></NavIcon>
                <span>Paramètres</span>
              </StyledLink>
              {activeTab === 'parametres' && <ActiveIndicator colors={colors} />}
            </NavItem>
          </NavList>
        </Nav>
      </Header>
      
      <Content colors={colors}>
        <Outlet />
      </Content>
    </Container>
  );
};

// Styled Components (identiques à votre version existante)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.colors.background};
  transition: background-color 0.3s ease;
  position: relative;
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  color: ${props => props.colors.textPrimary};
  box-shadow: ${props => props.colors.shadow};
  z-index: 100;

  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: ${props => props.colors.shadowHover};
    border-color: ${props => props.colors.primary};
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  @media (max-width: 768px) {
    right: 12px;
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
`;

const Header = styled.header`
  background-color: ${props => props.colors.navBackground};
  border-bottom: 1px solid ${props => props.colors.navBorder};
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
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
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
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
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const UserIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${props => props.colors.primary};
  transition: color 0.3s ease;
`;

const UserRole = styled.span`
  background-color: ${props => props.isAdmin ? props.colors.successBg : props.colors.warningBg};
  color: ${props => props.isAdmin ? props.colors.success : props.colors.warning};
  padding: 0.15rem 0.4rem;
  border-radius: 0.75rem;
  font-size: 0.65rem;
  transition: all 0.3s ease;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${props => props.colors.navTextMuted};
  border: none;
  padding: 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.navText};
  }
`;

const Nav = styled.nav`
  background-color: ${props => props.colors.navBackground};
  border-top: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  position: relative;
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
    color: ${props => props.active ? props.colors.textPrimary : props.colors.navTextMuted};
    background-color: ${props => props.active ? props.colors.navActive : 'transparent'};
    font-weight: ${props => props.active ? '500' : 'normal'};
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.colors.primary};
    background-color: ${props => props.colors.navActive};
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
  background-color: ${props => props.colors.primary};
`;

const Content = styled.main`
  flex: 1;
  padding: 1rem;
  background-color: ${props => props.colors.background};
  transition: background-color 0.3s ease;
`;

export default MainLayout;