// Parametres.js - Version avec barre d'onglets entièrement responsive

import React, { useState, useContext, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ToastProvider, useToast } from '../components/common/Toast';
import PageHeader from '../components/common/PageHeader';
import TemplatesTab from '../components/parametres/TemplatesTab';
import UtilisateursTab from '../components/parametres/UtilisateursTab';
import CirconstancesTab from '../components/parametres/CirconstancesTab';
import RegionsTab from '../components/parametres/RegionsTab';
import DepartementsTab from '../components/parametres/DepartementsTab';
import RedacteursTab from '../components/parametres/RedacteursTab';
import GradesTab from '../components/parametres/GradesTab';
import LogsTab from '../components/parametres/LogsTab';
import { 
  FaFileAlt, 
  FaUsers, 
  FaGavel, 
  FaMapMarkerAlt, 
  FaMap, 
  FaUserEdit,
  FaMedal,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaClipboardList
} from 'react-icons/fa';

const ParametresContent = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabListRef = useRef(null);
  
  const { isAdmin } = useContext(AuthContext);
  const { colors } = useTheme();
  const { showSuccessToast, showErrorToast } = useToast();

  const showSuccessMessage = (message) => {
    showSuccessToast(message);
  };

  const setErrorMessage = (message) => {
    showErrorToast(message);
  };

  const tabs = [
    ...(isAdmin() ? [
      { id: 'templates', label: 'Templates', icon: FaFileAlt, shortLabel: 'Temp' },
      { id: 'utilisateurs', label: 'Utilisateurs', icon: FaUsers, shortLabel: 'Users' },
      { id: 'logs', label: 'Logs', icon: FaClipboardList, shortLabel: 'Logs' },
      { id: 'redacteurs', label: 'Rédacteurs', icon: FaUserEdit, shortLabel: 'Réd' },
    ] : [
      { id: 'redacteurs', label: 'Rédacteurs', icon: FaUserEdit, shortLabel: 'Réd' },
    ]),
    { id: 'grades', label: 'Grades', icon: FaMedal, shortLabel: 'Grades' },
    { id: 'circonstances', label: 'Circonstances', icon: FaGavel, shortLabel: 'Circ' },
    { id: 'regions', label: 'Régions', icon: FaMapMarkerAlt, shortLabel: 'Rég' },
    { id: 'departements', label: 'Départements', icon: FaMap, shortLabel: 'Dép' },
  ];

  // Si l'utilisateur n'est pas admin et qu'aucun onglet par défaut n'est disponible
  useEffect(() => {
    if (!isAdmin() && activeTab === 'templates') {
      setActiveTab('redacteurs');
    }
  }, [isAdmin, activeTab]);

  // Vérifier si on peut faire défiler
  const checkScrollButtons = () => {
    if (tabListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabListRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const scrollTabs = (direction) => {
    if (tabListRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? tabListRef.current.scrollLeft - scrollAmount
        : tabListRef.current.scrollLeft + scrollAmount;
      
      tabListRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollButtons, 100);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowMobileDropdown(false);
  };

  const getActiveTabLabel = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    return activeTabData ? activeTabData.label : '';
  };

  const renderTabContent = () => {
    const commonProps = {
      showSuccessMessage,
      setErrorMessage,
      colors
    };

    switch (activeTab) {
      case 'templates':
        return isAdmin() ? <TemplatesTab {...commonProps} /> : null;
      case 'utilisateurs':
        return isAdmin() ? <UtilisateursTab {...commonProps} /> : null;
      case 'logs':
        return isAdmin() ? <LogsTab {...commonProps} /> : null;
      case 'redacteurs':
        return <RedacteursTab {...commonProps} />;
      case 'grades':
        return <GradesTab {...commonProps} />; 
      case 'circonstances':
        return <CirconstancesTab {...commonProps} />;
      case 'regions':
        return <RegionsTab {...commonProps} />;
      case 'departements':
        return <DepartementsTab {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Container colors={colors}>
      <PageHeader 
        title="Paramètres" 
        subtitle="Configuration de l'application"
      />
      
      <TabContainer colors={colors}>
        {/* Navigation Desktop avec défilement horizontal */}
        <DesktopTabNavigation colors={colors}>
          {canScrollLeft && (
            <ScrollButton 
              direction="left" 
              onClick={() => scrollTabs('left')}
              colors={colors}
            >
              <FaChevronLeft />
            </ScrollButton>
          )}
          
          <TabListContainer>
            <TabList 
              ref={tabListRef}
              colors={colors}
              onScroll={checkScrollButtons}
            >
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <TabItem 
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    colors={colors}
                  >
                    <TabIcon colors={colors}>
                      <IconComponent />
                    </TabIcon>
                    <TabLabel>{tab.label}</TabLabel>
                    <TabShortLabel>{tab.shortLabel}</TabShortLabel>
                    {activeTab === tab.id && <ActiveIndicator colors={colors} />}
                  </TabItem>
                );
              })}
            </TabList>
          </TabListContainer>
          
          {canScrollRight && (
            <ScrollButton 
              direction="right" 
              onClick={() => scrollTabs('right')}
              colors={colors}
            >
              <FaChevronRight />
            </ScrollButton>
          )}
        </DesktopTabNavigation>

        {/* Navigation Mobile avec dropdown */}
        <MobileTabNavigation colors={colors}>
          <MobileTabSelector 
            onClick={() => setShowMobileDropdown(!showMobileDropdown)}
            colors={colors}
          >
            <MobileTabCurrent>
              <span>{getActiveTabLabel()}</span>
              <FaBars />
            </MobileTabCurrent>
          </MobileTabSelector>
          
          {showMobileDropdown && (
            <MobileDropdown colors={colors}>
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <MobileDropdownItem
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    colors={colors}
                  >
                    <IconComponent />
                    <span>{tab.label}</span>
                  </MobileDropdownItem>
                );
              })}
            </MobileDropdown>
          )}
        </MobileTabNavigation>
        
        <TabContent colors={colors}>
          {renderTabContent()}
        </TabContent>
      </TabContainer>
    </Container>
  );
};

const Parametres = () => {
  const { colors } = useTheme();
  
  return (
    <ToastProvider colors={colors}>
      <ParametresContent />
    </ToastProvider>
  );
};

// Styled Components

const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const TabContainer = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  overflow: hidden;
  transition: all 0.3s ease;
`;

// Navigation Desktop
const DesktopTabNavigation = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.colors.surfaceHover};
  border-bottom: 1px solid ${props => props.colors.border};
  position: relative;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ScrollButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 60px;
  background-color: ${props => props.colors.surface};
  border: none;
  border-right: ${props => props.direction === 'left' ? `1px solid ${props.colors.border}` : 'none'};
  border-left: ${props => props.direction === 'right' ? `1px solid ${props.colors.border}` : 'none'};
  color: ${props => props.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.primary};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const TabListContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

const TabList = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  
  /* Masquer la scrollbar mais garder la fonctionnalité */
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabItem = styled.button`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: all 0.3s ease;
  color: ${props => props.active ? props.colors.primary : props.colors.textMuted};
  background-color: ${props => props.active ? props.colors.surface : 'transparent'};
  flex-shrink: 0;
  min-width: fit-content;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    color: ${props => props.colors.textPrimary};
  }
  
  @media (max-width: 1200px) {
    padding: 16px 16px;
  }
  
  @media (max-width: 992px) {
    padding: 16px 12px;
  }
`;

const TabIcon = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: color 0.3s ease;
  flex-shrink: 0;
`;

const TabLabel = styled.span`
  font-weight: 500;
  font-size: 14px;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const TabShortLabel = styled.span`
  font-weight: 500;
  font-size: 12px;
  display: none;
  
  @media (max-width: 1200px) {
    display: block;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: ${props => props.colors.primary};
  transition: background-color 0.3s ease;
`;

// Navigation Mobile
const MobileTabNavigation = styled.div`
  display: none;
  position: relative;
  
  @media (max-width: 768px) {
    display: block;
    background-color: ${props => props.colors.surfaceHover};
    border-bottom: 1px solid ${props => props.colors.border};
  }
`;

const MobileTabSelector = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.colors.textPrimary};
  
  &:hover {
    background-color: ${props => props.colors.navActive};
  }
`;

const MobileTabCurrent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
`;

const MobileDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-top: none;
  box-shadow: ${props => props.colors.shadowHover};
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
`;

const MobileDropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border: none;
  background: ${props => props.active ? props.colors.navActive : 'none'};
  color: ${props => props.active ? props.colors.primary : props.colors.textPrimary};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
  }
  
  svg {
    margin-right: 12px;
    font-size: 16px;
  }
`;

const TabContent = styled.div`
  padding: 24px;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

export default Parametres;