import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaChartBar, FaCog, FaUser, FaUsers, FaFolder, FaHome, FaUserTie} from 'react-icons/fa';
import styled from 'styled-components';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <LayoutContainer>
      <Sidebar open={sidebarOpen}>
        <SidebarHeader>
          <Logo>Protection Juridique Complémentaire</Logo>
          <CloseButton onClick={toggleSidebar}>
            <FaTimes />
          </CloseButton>
        </SidebarHeader>
        
        <NavMenu>
          <NavItem isActive={location.pathname === '/'}>
            <NavLink to="/" end>
              <FaHome />
              <span>Tableau de bord</span>
            </NavLink>
          </NavItem>
          
          <NavItem isActive={location.pathname.includes('/affaires')}>
            <NavLink to="/affaires">
              <FaFolder />
              <span>Affaires</span>
            </NavLink>
          </NavItem>
          
          <NavItem isActive={location.pathname.includes('/militaires')}>
            <NavLink to="/militaires">
              <FaUser />
              <span>Militaires</span>
            </NavLink>
          </NavItem>
          
          <NavItem isActive={location.pathname.includes('/beneficiaires')}>
            <NavLink to="/beneficiaires">
              <FaUsers />
              <span>Bénéficiaires</span>
            </NavLink>
          </NavItem>

          <NavItem isActive={location.pathname.includes('/avocats')}>
            <NavLink to="/avocats">
              <FaUserTie />
              <span>Avocats</span>
            </NavLink>
          </NavItem>

          
          <NavItem isActive={location.pathname.includes('/statistiques')}>
            <NavLink to="/statistiques">
              <FaChartBar />
              <span>Statistiques</span>
            </NavLink>
          </NavItem>
          
          <NavItem isActive={location.pathname.includes('/parametres')}>
            <NavLink to="/parametres">
              <FaCog />
              <span>Paramètres</span>
            </NavLink>
          </NavItem>
        </NavMenu>
      </Sidebar>
      
      <MainContent sidebarOpen={sidebarOpen}>
        <Header>
          <MenuButton onClick={toggleSidebar}>
            <FaBars />
          </MenuButton>
          
          <div>
            {/* Emplacement pour d'autres éléments d'en-tête */}
          </div>
        </Header>
        
        <ContentContainer>
          <Outlet />
        </ContentContainer>
      </MainContent>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.aside`
  width: 250px;
  background-color: #1a237e;
  color: #fff;
  transition: all 0.3s;
  transform: ${({open}) => open ? 'translateX(0)' : 'translateX(-100%)'};
  position: fixed;
  height: 100vh;
  z-index: 100;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  font-weight: bold;
  font-size: 18px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  a {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    color: #fff;
    text-decoration: none;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      text-decoration: none;
    }
    
    span {
      margin-left: 10px;
    }
  }
  
  background-color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.sidebarOpen ? '250px' : '0'};
  transition: margin-left 0.3s;
  width: calc(100% - ${props => props.sidebarOpen ? '250px' : '0'});
`;

const Header = styled.header`
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: inherit;
  z-index: 99;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentContainer = styled.div`
  padding: 80px 20px 20px;
  height: 100%;
  overflow-y: auto;
`;

export default MainLayout;