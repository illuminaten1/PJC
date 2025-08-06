import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBook, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import PageHeader from '../components/common/PageHeader';
import MDXProvider from '../components/mdx/MDXProvider';
import DocumentationMDX from '../content/documentation.mdx';

const Documentation = () => {
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('introduction');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Gestion du scroll pour le bouton "retour en haut"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      updateActiveNav();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mise à jour de la navigation active basée sur la position de scroll
  const updateActiveNav = () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let current = 'introduction';
    
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 150) {
        current = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-') || current;
      }
    });
    
    setActiveSection(current);
  };

  // Navigation vers une section
  const scrollToSection = (sectionId) => {
    // Chercher l'élément par ID ou par contenu textuel
    let element = document.getElementById(sectionId);
    
    if (!element) {
      // Fallback : chercher par texte du heading
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const headingId = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-');
        if (headingId === sectionId) {
          element = heading;
        }
      });
    }
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setShowMobileSidebar(false);
    }
  };

  // Retour en haut
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle sidebar mobile
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // Filtrage du contenu (version simplifiée)
  const filterContent = (term) => {
    setSearchTerm(term);
    // La recherche pourrait être implémentée plus tard avec une logique plus complexe
  };

  const tableOfContentsItems = [
    { id: 'introduction', label: 'Introduction' },
    { 
      id: 'structure-des-donnees', 
      label: 'Structure des données',
      children: [
        { id: 'affaires', label: 'Affaires' },
        { id: 'militaires', label: 'Militaires' },
        { id: 'beneficiaires', label: 'Bénéficiaires' }
      ]
    },
    { id: 'fonctionnalites-principales', label: 'Fonctionnalités' },
    { 
      id: 'gestion-des-parametres', 
      label: 'Gestion des paramètres',
      children: [
        { id: 'modification-des-circonstances', label: 'Circonstances' },
        { id: 'modification-des-redacteurs', label: 'Rédacteurs' }
      ]
    },
    { 
      id: 'templates-de-documents', 
      label: 'Templates de documents',
      children: [
        { id: 'personnalisation-des-templates', label: 'Personnalisation' },
        { id: 'variables-pour-les-conventions-dhonoraires', label: 'Variables convention' },
        { id: 'variables-pour-les-fiches-de-reglement', label: 'Variables règlement' }
      ]
    }
  ];

  return (
    <Container colors={colors}>
      <PageHeader 
        title="Documentation"
        subtitle="Guide d'utilisation de l'application de Protection Juridique Complémentaire"
        backButton
      />

      <DocumentationLayout>
        {/* Mobile Sidebar Toggle */}
        <MobileSidebarToggle 
          onClick={toggleMobileSidebar}
          colors={colors}
        >
          {showMobileSidebar ? <FaTimes /> : <FaBars />}
          <span>Sommaire</span>
        </MobileSidebarToggle>

        {/* Sidebar avec overlay mobile */}
        <SidebarOverlay 
          isOpen={showMobileSidebar} 
          onClick={() => setShowMobileSidebar(false)}
          colors={colors}
        />
        
        <Sidebar colors={colors} isOpen={showMobileSidebar}>
          <SidebarContent>
            <SidebarHeader>
              <SidebarTitle colors={colors}>
                <FaBook style={{ marginRight: '8px' }} />
                Sommaire
              </SidebarTitle>
              
              <MobileCloseButton 
                onClick={() => setShowMobileSidebar(false)}
                colors={colors}
              >
                <FaTimes />
              </MobileCloseButton>
            </SidebarHeader>
            
            <SearchBox>
              <SearchIcon colors={colors}>
                <FaSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Rechercher dans la documentation..."
                value={searchTerm}
                onChange={(e) => filterContent(e.target.value)}
                colors={colors}
              />
            </SearchBox>
            
            <TableOfContents>
              {tableOfContentsItems.map(item => (
                <TocItem key={item.id}>
                  <TocLink 
                    active={activeSection === item.id}
                    onClick={() => scrollToSection(item.id)}
                    colors={colors}
                  >
                    {item.label}
                  </TocLink>
                  {item.children && (
                    <SubMenu>
                      {item.children.map(child => (
                        <TocItem key={child.id}>
                          <TocLink 
                            active={activeSection === child.id}
                            onClick={() => scrollToSection(child.id)}
                            colors={colors}
                            submenu={true}
                          >
                            {child.label}
                          </TocLink>
                        </TocItem>
                      ))}
                    </SubMenu>
                  )}
                </TocItem>
              ))}
            </TableOfContents>
          </SidebarContent>
        </Sidebar>

        <Content colors={colors}>
          <MDXProvider>
            <DocumentationMDX />
          </MDXProvider>
        </Content>
      </DocumentationLayout>

      {showScrollTop && (
        <ScrollToTopButton onClick={scrollToTop} colors={colors}>
          ↑
        </ScrollToTopButton>
      )}
    </Container>
  );
};

// Styles simplifiés mais conservant le design
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const DocumentationLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
  position: relative;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const MobileSidebarToggle = styled.button`
  display: none;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    border-color: ${props => props.colors.primary};
  }
  
  @media (max-width: 968px) {
    display: flex;
  }
`;

const SidebarOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  
  @media (max-width: 968px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const Sidebar = styled.nav`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  
  @media (max-width: 968px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(${props => props.isOpen ? '1' : '0.8'});
    max-height: 80vh;
    width: 90%;
    max-width: 400px;
    z-index: 999;
    opacity: ${props => props.isOpen ? '1' : '0'};
    visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
    pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  }
`;

const SidebarContent = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  
  @media (max-width: 968px) {
    padding: 16px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  @media (min-width: 969px) {
    justify-content: flex-start;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${props => props.colors.textPrimary};
  border-bottom: 2px solid ${props => props.colors.primary};
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  flex: 1;
  
  @media (max-width: 968px) {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const MobileCloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.colors.textSecondary};
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.textPrimary};
  }
  
  @media (max-width: 968px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: ${props => props.colors.textSecondary};
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.colors.textMuted};
  }
`;

const TableOfContents = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TocItem = styled.li`
  margin-bottom: 4px;
`;

const TocLink = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: ${props => props.submenu ? '6px 12px' : '8px 12px'};
  color: ${props => props.active ? 'white' : props.colors.textSecondary};
  background-color: ${props => props.active ? props.colors.primary : 'transparent'};
  border: none;
  border-radius: 4px;
  font-size: ${props => props.submenu ? '13px' : '14px'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? props.colors.primaryDark : props.colors.primary};
    color: white;
    transform: translateX(4px);
  }
`;

const SubMenu = styled.ul`
  list-style: none;
  margin-left: 16px;
  margin-top: 4px;
  padding: 0;
`;

const Content = styled.main`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  padding: 32px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  /* Styles pour le contenu MDX */
  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.colors.textPrimary};
    margin-top: 2em;
    margin-bottom: 1em;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  h1 {
    font-size: 2.5em;
    border-bottom: 3px solid ${props => props.colors.primary};
    padding-bottom: 0.5em;
  }
  
  h2 {
    font-size: 1.8em;
    border-bottom: 2px solid ${props => props.colors.primary};
    padding-bottom: 0.3em;
  }
  
  h3 {
    font-size: 1.4em;
    position: relative;
    padding-left: 16px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background-color: ${props => props.colors.primary};
      border-radius: 2px;
    }
  }
  
  p {
    color: ${props => props.colors.textPrimary};
    line-height: 1.7;
    margin-bottom: 1em;
  }
  
  ul, ol {
    color: ${props => props.colors.textPrimary};
    margin-left: 2em;
    margin-bottom: 1em;
    
    li {
      margin-bottom: 0.5em;
      line-height: 1.6;
    }
  }
  
  code {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.textPrimary};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  strong {
    font-weight: 600;
  }
  
  em {
    color: ${props => props.colors.textSecondary};
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  box-shadow: ${props => props.colors.shadowHover};
  transition: all 0.3s ease;
  font-size: 18px;
  font-weight: bold;
  z-index: 100;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.colors.primaryDark};
  }
  
  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
`;

export default Documentation;