import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaSignOutAlt, FaUser, FaChartPie, FaFileAlt, 
  FaShieldAlt, FaUsers, FaBriefcase, FaChartBar, 
  FaCog, FaBook, FaBars, FaTimes
} from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { darkMode, toggleDarkMode, colors } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <Container colors={colors}>
      <Header colors={colors}>
        <HeaderContent>
          <HeaderLeft>
            <MobileMenuToggle 
              onClick={toggleMobileMenu}
              colors={colors}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </MobileMenuToggle>
            <AppTitle colors={colors}>
              <FullTitle>Protection Juridique Complémentaire - BRPF</FullTitle>
              <ShortTitle>PJC - BRPF</ShortTitle>
            </AppTitle>
          </HeaderLeft>
          
          <UserSection>
            <UserInfo colors={colors}>
              <UserIcon colors={colors}>
                <FaUser />
              </UserIcon>
              <UserDetails>
                <UserName>{user?.nom}</UserName>
                <UserRole isAdmin={isAdmin()} colors={colors}>
                  {isAdmin() ? 'Admin' : 'Rédacteur'}
                </UserRole>
              </UserDetails>
            </UserInfo>
            
            <LogoutButton onClick={handleLogout} colors={colors} title="Se déconnecter">
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
          
          {/* Navigation Desktop */}
          <DesktopNav>
            <NavList>
              <NavItem active={activeTab === 'dashboard'} colors={colors}>
                <StyledLink to="/" colors={colors}>
                  <NavIcon><FaChartPie /></NavIcon>
                  <NavText>Tableau de bord</NavText>
                </StyledLink>
                {activeTab === 'dashboard' && <ActiveIndicator colors={colors} />}
              </NavItem>
              
              <NavItem active={activeTab === 'affaires'} colors={colors}>
                <StyledLink to="/affaires" colors={colors}>
                  <NavIcon><FaFileAlt /></NavIcon>
                  <NavText>Affaires</NavText>
                </StyledLink>
                {activeTab === 'affaires' && <ActiveIndicator colors={colors} />}
              </NavItem>
              
              <NavItem active={activeTab === 'militaires'} colors={colors}>
                <StyledLink to="/militaires" colors={colors}>
                  <NavIcon><FaShieldAlt /></NavIcon>
                  <NavText>Militaires</NavText>
                </StyledLink>
                {activeTab === 'militaires' && <ActiveIndicator colors={colors} />}
              </NavItem>
              
              <NavItem active={activeTab === 'beneficiaires'} colors={colors}>
                <StyledLink to="/beneficiaires" colors={colors}>
                  <NavIcon><FaUsers /></NavIcon>
                  <NavText>Bénéficiaires</NavText>
                </StyledLink>
                {activeTab === 'beneficiaires' && <ActiveIndicator colors={colors} />}
              </NavItem>
              
              <NavItem active={activeTab === 'avocats'} colors={colors}>
                <StyledLink to="/avocats" colors={colors}>
                  <NavIcon><FaBriefcase /></NavIcon>
                  <NavText>Avocats</NavText>
                </StyledLink>
                {activeTab === 'avocats' && <ActiveIndicator colors={colors} />}
              </NavItem>
              
              <NavItem active={activeTab === 'statistiques'} colors={colors}>
                <StyledLink to="/statistiques" colors={colors}>
                  <NavIcon><FaChartBar /></NavIcon>
                  <NavText>Statistiques</NavText>
                </StyledLink>
                {activeTab === 'statistiques' && <ActiveIndicator colors={colors} />}
              </NavItem>
              
              <NavItem active={activeTab === 'documentation'} colors={colors}>
                <StyledLink to="/documentation" colors={colors}>
                  <NavIcon><FaBook /></NavIcon>
                  <NavText>Documentation</NavText>
                </StyledLink>
                {activeTab === 'documentation' && <ActiveIndicator colors={colors} />}
              </NavItem>
              
              <NavItem active={activeTab === 'parametres'} colors={colors}>
                <StyledLink to="/parametres" colors={colors}>
                  <NavIcon><FaCog /></NavIcon>
                  <NavText>Paramètres</NavText>
                </StyledLink>
                {activeTab === 'parametres' && <ActiveIndicator colors={colors} />}
              </NavItem>
            </NavList>
          </DesktopNav>

          {/* Navigation Mobile (Horizontal Scroll) */}
          <MobileNav>
            <MobileNavList>
              <MobileNavItem active={activeTab === 'dashboard'} colors={colors}>
                <MobileStyledLink to="/" colors={colors} onClick={closeMobileMenu}>
                  <FaChartPie />
                </MobileStyledLink>
              </MobileNavItem>
              
              <MobileNavItem active={activeTab === 'affaires'} colors={colors}>
                <MobileStyledLink to="/affaires" colors={colors} onClick={closeMobileMenu}>
                  <FaFileAlt />
                </MobileStyledLink>
              </MobileNavItem>
              
              <MobileNavItem active={activeTab === 'militaires'} colors={colors}>
                <MobileStyledLink to="/militaires" colors={colors} onClick={closeMobileMenu}>
                  <FaShieldAlt />
                </MobileStyledLink>
              </MobileNavItem>
              
              <MobileNavItem active={activeTab === 'beneficiaires'} colors={colors}>
                <MobileStyledLink to="/beneficiaires" colors={colors} onClick={closeMobileMenu}>
                  <FaUsers />
                </MobileStyledLink>
              </MobileNavItem>
              
              <MobileNavItem active={activeTab === 'avocats'} colors={colors}>
                <MobileStyledLink to="/avocats" colors={colors} onClick={closeMobileMenu}>
                  <FaBriefcase />
                </MobileStyledLink>
              </MobileNavItem>
              
              <MobileNavItem active={activeTab === 'statistiques'} colors={colors}>
                <MobileStyledLink to="/statistiques" colors={colors} onClick={closeMobileMenu}>
                  <FaChartBar />
                </MobileStyledLink>
              </MobileNavItem>
              
              <MobileNavItem active={activeTab === 'documentation'} colors={colors}>
                <MobileStyledLink to="/documentation" colors={colors} onClick={closeMobileMenu}>
                  <FaBook />
                </MobileStyledLink>
              </MobileNavItem>
              
              <MobileNavItem active={activeTab === 'parametres'} colors={colors}>
                <MobileStyledLink to="/parametres" colors={colors} onClick={closeMobileMenu}>
                  <FaCog />
                </MobileStyledLink>
              </MobileNavItem>
            </MobileNavList>
          </MobileNav>
        </Nav>

        {/* Menu mobile overlay (dropdown) */}
        <MobileMenuOverlay isOpen={isMobileMenuOpen} colors={colors}>
          <MobileMenuList>
            <MobileMenuItem active={activeTab === 'dashboard'} colors={colors}>
              <MobileMenuLink to="/" colors={colors} onClick={closeMobileMenu}>
                <FaChartPie />
                <span>Tableau de bord</span>
              </MobileMenuLink>
            </MobileMenuItem>
            
            <MobileMenuItem active={activeTab === 'affaires'} colors={colors}>
              <MobileMenuLink to="/affaires" colors={colors} onClick={closeMobileMenu}>
                <FaFileAlt />
                <span>Affaires</span>
              </MobileMenuLink>
            </MobileMenuItem>
            
            <MobileMenuItem active={activeTab === 'militaires'} colors={colors}>
              <MobileMenuLink to="/militaires" colors={colors} onClick={closeMobileMenu}>
                <FaShieldAlt />
                <span>Militaires</span>
              </MobileMenuLink>
            </MobileMenuItem>
            
            <MobileMenuItem active={activeTab === 'beneficiaires'} colors={colors}>
              <MobileMenuLink to="/beneficiaires" colors={colors} onClick={closeMobileMenu}>
                <FaUsers />
                <span>Bénéficiaires</span>
              </MobileMenuLink>
            </MobileMenuItem>
            
            <MobileMenuItem active={activeTab === 'avocats'} colors={colors}>
              <MobileMenuLink to="/avocats" colors={colors} onClick={closeMobileMenu}>
                <FaBriefcase />
                <span>Avocats</span>
              </MobileMenuLink>
            </MobileMenuItem>
            
            <MobileMenuItem active={activeTab === 'statistiques'} colors={colors}>
              <MobileMenuLink to="/statistiques" colors={colors} onClick={closeMobileMenu}>
                <FaChartBar />
                <span>Statistiques</span>
              </MobileMenuLink>
            </MobileMenuItem>
            
            <MobileMenuItem active={activeTab === 'documentation'} colors={colors}>
              <MobileMenuLink to="/documentation" colors={colors} onClick={closeMobileMenu}>
                <FaBook />
                <span>Documentation</span>
              </MobileMenuLink>
            </MobileMenuItem>
            
            <MobileMenuItem active={activeTab === 'parametres'} colors={colors}>
              <MobileMenuLink to="/parametres" colors={colors} onClick={closeMobileMenu}>
                <FaCog />
                <span>Paramètres</span>
              </MobileMenuLink>
            </MobileMenuItem>
          </MobileMenuList>
        </MobileMenuOverlay>
      </Header>
      
      <Content colors={colors}>
        <Outlet />
      </Content>
    </Container>
  );
};

// Styled Components avec responsive design

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.colors.background};
  transition: background-color 0.3s ease;
  position: relative;
`;

const Header = styled.header`
  background-color: ${props => props.colors.navBackground};
  border-bottom: 1px solid ${props => props.colors.navBorder};
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0; // Permet la troncature du texte
`;

const MobileMenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.colors.textPrimary};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.colors.surfaceHover};
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const FullTitle = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const ShortTitle = styled.span`
  display: none;
  
  @media (max-width: 768px) {
    display: inline;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  @media (max-width: 568px) {
    font-size: 0.7rem;
    gap: 0.25rem;
  }
`;

const UserIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${props => props.colors.primary};
  transition: color 0.3s ease;
  
  @media (max-width: 568px) {
    font-size: 0.7rem;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  
  @media (max-width: 568px) {
    display: none;
  }
`;

const UserName = styled.span`
  line-height: 1;
`;

const UserRole = styled.span`
  background-color: ${props => props.isAdmin ? props.colors.successBg : props.colors.warningBg};
  color: ${props => props.isAdmin ? props.colors.success : props.colors.warning};
  padding: 0.15rem 0.4rem;
  border-radius: 0.75rem;
  font-size: 0.65rem;
  line-height: 1;
  transition: all 0.3s ease;
  
  @media (max-width: 568px) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${props => props.colors.navTextMuted};
  border: none;
  padding: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.navText};
  }
  
  @media (max-width: 568px) {
    padding: 0.4rem;
    font-size: 0.8rem;
  }
`;

const Nav = styled.nav`
  background-color: ${props => props.colors.navBackground};
  border-top: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
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

// Navigation Desktop
const DesktopNav = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
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
  padding: 0.75rem 1rem;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  
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
  flex-shrink: 0;
`;

const NavText = styled.span`
  @media (max-width: 1024px) {
    display: none;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: ${props => props.colors.primary};
`;

// Navigation Mobile (Horizontal)
const MobileNav = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      height: 2px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props => props.colors.background};
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props => props.colors.border};
      border-radius: 2px;
    }
  }
`;

const MobileNavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  min-width: max-content;
`;

const MobileNavItem = styled.li`
  position: relative;
  
  a {
    color: ${props => props.active ? props.colors.primary : props.colors.navTextMuted};
    background-color: ${props => props.active ? props.colors.navActive : 'transparent'};
  }
  
  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${props.colors.primary};
    }
  `}
`;

const MobileStyledLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 60px;
  
  &:hover {
    color: ${props => props.colors.primary};
    background-color: ${props => props.colors.navActive};
  }
`;

// Menu mobile overlay (dropdown)
const MobileMenuOverlay = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${props => props.colors.navBackground};
  border-bottom: 1px solid ${props => props.colors.navBorder};
  box-shadow: ${props => props.colors.shadowHover};
  z-index: 999;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenuList = styled.ul`
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
`;

const MobileMenuItem = styled.li`
  a {
    color: ${props => props.active ? props.colors.primary : props.colors.textPrimary};
    background-color: ${props => props.active ? props.colors.navActive : 'transparent'};
    font-weight: ${props => props.active ? '500' : 'normal'};
  }
`;

const MobileMenuLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  text-decoration: none;
  font-size: 0.9rem;
  gap: 0.75rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
  }
  
  svg {
    font-size: 1rem;
    flex-shrink: 0;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 1rem;
  background-color: ${props => props.colors.background};
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

export default MainLayout;