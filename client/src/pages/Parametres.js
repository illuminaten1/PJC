import React, { useState, useContext } from 'react';
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
import { 
  FaFileAlt, 
  FaUsers, 
  FaGavel, 
  FaMapMarkerAlt, 
  FaMap, 
  FaUserEdit ,
  FaMedal
} from 'react-icons/fa';

const ParametresContent = () => {
  const [activeTab, setActiveTab] = useState('templates');
  
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
      { id: 'templates', label: 'Templates', icon: FaFileAlt },
      { id: 'utilisateurs', label: 'Utilisateurs', icon: FaUsers },
      { id: 'redacteurs', label: 'Rédacteurs', icon: FaUserEdit },
    ] : [
      { id: 'redacteurs', label: 'Rédacteurs', icon: FaUserEdit },
    ]),
      { id: 'grades', label: 'Grades', icon: FaMedal },
    { id: 'circonstances', label: 'Circonstances', icon: FaGavel },
    { id: 'regions', label: 'Régions', icon: FaMapMarkerAlt },
    { id: 'departements', label: 'Départements', icon: FaMap },
  ];

  // Si l'utilisateur n'est pas admin et qu'aucun onglet par défaut n'est disponible
  if (!isAdmin() && activeTab === 'templates') {
    setActiveTab('redacteurs');
  }

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
        <TabList colors={colors}>
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <TabItem 
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                colors={colors}
              >
                <TabIcon colors={colors}>
                  <IconComponent />
                </TabIcon>
                <TabLabel>{tab.label}</TabLabel>
                {activeTab === tab.id && <ActiveIndicator colors={colors} />}
              </TabItem>
            );
          })}
        </TabList>
        
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

const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

const TabContainer = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const TabList = styled.div`
  display: flex;
  background-color: ${props => props.colors.surfaceHover};
  border-bottom: 1px solid ${props => props.colors.border};
  overflow-x: auto;
  
  @media (max-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const TabItem = styled.button`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: all 0.3s ease;
  color: ${props => props.active ? props.colors.primary : props.colors.textMuted};
  background-color: ${props => props.active ? props.colors.surface : 'transparent'};
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    color: ${props => props.colors.textPrimary};
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-shrink: 0;
  }
`;

const TabIcon = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: color 0.3s ease;
`;

const TabLabel = styled.span`
  font-weight: 500;
  font-size: 14px;
  
  @media (max-width: 768px) {
    display: none;
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

const TabContent = styled.div`
  padding: 24px;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
`;

export default Parametres;