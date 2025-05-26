import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBook, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import PageHeader from '../components/common/PageHeader';

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
    const sections = document.querySelectorAll('.doc-section');
    let current = 'introduction';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    
    setActiveSection(current);
  };

  // Navigation vers une section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setShowMobileSidebar(false); // Fermer la sidebar mobile après navigation
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

  // Filtrage du contenu
  const filterContent = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      // Réinitialiser l'affichage
      const sections = document.querySelectorAll('.doc-section');
      sections.forEach(section => {
        section.style.display = 'block';
        // Supprimer les surlignages
        section.innerHTML = section.innerHTML.replace(/<mark class="highlight"[^>]*>(.*?)<\/mark>/gi, '$1');
      });
      return;
    }

    const sections = document.querySelectorAll('.doc-section');
    sections.forEach(section => {
      const text = section.textContent.toLowerCase();
      if (text.includes(term.toLowerCase())) {
        section.style.display = 'block';
        highlightText(section, term);
      } else {
        section.style.display = 'none';
      }
    });
  };

  // Surlignage du texte
  const highlightText = (element, term) => {
    // Simple implementation - in production, you might want a more robust solution
    const text = element.innerHTML;
    const regex = new RegExp(`(${term})`, 'gi');
    const highlightedText = text.replace(regex, '<mark class="highlight" style="background-color: yellow; padding: 2px 4px; border-radius: 2px;">$1</mark>');
    element.innerHTML = highlightedText;
  };

  const tableOfContentsItems = [
    { id: 'introduction', label: 'Introduction' },
    { 
      id: 'structure', 
      label: 'Structure des données',
      children: [
        { id: 'affaires', label: 'Affaires' },
        { id: 'militaires', label: 'Militaires' },
        { id: 'beneficiaires', label: 'Bénéficiaires' }
      ]
    },
    { id: 'fonctionnalites', label: 'Fonctionnalités' },
    { 
      id: 'gestion-parametres', 
      label: 'Gestion des paramètres',
      children: [
        { id: 'circonstances', label: 'Circonstances' },
        { id: 'redacteurs', label: 'Rédacteurs' }
      ]
    },
    { 
      id: 'templates', 
      label: 'Templates de documents',
      children: [
        { id: 'personnalisation', label: 'Personnalisation' },
        { id: 'variables-convention', label: 'Variables convention' },
        { id: 'variables-reglement', label: 'Variables règlement' }
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
          <Section id="introduction" className="doc-section" colors={colors}>
            <SectionTitle colors={colors}>Introduction</SectionTitle>
            <HighlightBox colors={colors}>
              <p><strong>Bienvenue dans l'application de gestion de Protection Juridique Complémentaire</strong></p>
              <p>Cette application permet la gestion des dossiers de protection juridique complémentaire pour les militaires ou leurs ayants-droits.</p>
            </HighlightBox>
            
            <p>L'application offre une interface complète pour gérer l'ensemble du processus, depuis la création des dossiers jusqu'au suivi des paiements, en passant par la génération automatique de documents.</p>
          </Section>

          <Section id="structure" className="doc-section" colors={colors}>
            <SectionTitle colors={colors}>Structure des données</SectionTitle>
            
            <StructureCard colors={colors}>
              <p>L'application s'organise autour de trois entités principales qui forment une hiérarchie logique :</p>
            </StructureCard>

            <FeatureGrid>
              <FeatureCard id="affaires" colors={colors}>
                <h4>🗂️ Affaires</h4>
                <p>Regroupements des affaires par événement ou circonstance</p>
                <em>Exemple : "Accident de l'autoroute A13"</em>
              </FeatureCard>

              <FeatureCard id="militaires" colors={colors}>
                <h4>🎖️ Militaires</h4>
                <p>Les militaires blessés ou décédés en service qui génèrent le droit à cette protection juridique complémentaire</p>
              </FeatureCard>

              <FeatureCard id="beneficiaires" colors={colors}>
                <h4>👥 Bénéficiaires</h4>
                <p>Soit le militaire lui-même (s'il est blessé), soit ses ayants-droits (famille)</p>
              </FeatureCard>
            </FeatureGrid>
          </Section>

          <Section id="fonctionnalites" className="doc-section" colors={colors}>
            <SectionTitle colors={colors}>Fonctionnalités principales</SectionTitle>
            
            <SubsectionTitle colors={colors}>Gestion hiérarchique</SubsectionTitle>
            <p>L'application permet de naviguer facilement entre les différents niveaux : affaires → militaires → bénéficiaires, tout en conservant les liens logiques entre ces entités.</p>

            <SubsectionTitle colors={colors}>Suivi financier</SubsectionTitle>
            <p>Gestion complète des conventions d'honoraires et du suivi des paiements avec calcul automatique des ratios et des montants restants à payer.</p>

            <SubsectionTitle colors={colors}>Génération de documents</SubsectionTitle>
            <p>Création automatique de documents personnalisés :</p>
            <ul>
              <li>Conventions d'honoraires</li>
              <li>Fiches de règlement</li>
              <li>Fiches de suivi</li>
            </ul>

            <SubsectionTitle colors={colors}>Statistiques et tableaux de bord</SubsectionTitle>
            <p>Vue d'ensemble avec indicateurs clés de performance et analyses financières détaillées.</p>
          </Section>

          <Section id="gestion-parametres" className="doc-section" colors={colors}>
            <SectionTitle colors={colors}>Gestion des paramètres</SectionTitle>
            
            <WarningBox colors={colors}>
              <p><strong>⚠️ Important :</strong> Consultez cette documentation avant de modifier les circonstances ou les rédacteurs.</p>
            </WarningBox>

            <SubsectionTitle id="circonstances" colors={colors}>Modification des circonstances</SubsectionTitle>
            <p>Pour modifier une circonstance existante :</p>
            <ol>
              <li>Ajoutez d'abord la nouvelle circonstance <strong>sans supprimer l'ancienne</strong></li>
              <li>Modifiez les dossiers concernés pour qu'ils utilisent la nouvelle circonstance</li>
              <li>Une fois tous les dossiers mis à jour, supprimez l'ancienne circonstance</li>
            </ol>
            
            <HighlightBox colors={colors}>
              <p><strong>Note :</strong> La suppression d'une circonstance ne supprime pas la valeur dans les dossiers déjà créés.</p>
            </HighlightBox>

            <SubsectionTitle id="redacteurs" colors={colors}>Modification des rédacteurs</SubsectionTitle>
            <p>Pour remplacer un rédacteur :</p>
            <ol>
              <li>Ajoutez le nouveau rédacteur</li>
              <li>Utilisez l'option <strong>"Transférer un portefeuille"</strong> pour réaffecter tous les dossiers</li>
              <li>Supprimez l'ancien rédacteur une fois le transfert terminé</li>
            </ol>
          </Section>

          <Section id="templates" className="doc-section" colors={colors}>
            <SectionTitle colors={colors}>Templates de documents</SectionTitle>
            
            <SubsectionTitle id="personnalisation" colors={colors}>Personnalisation des templates</SubsectionTitle>
            
            <WarningBox colors={colors}>
              <p><strong>⚠️ Attention :</strong> Ne modifiez jamais les variables entre accolades comme <code>{`{d.beneficiaire.nom}`}</code> - elles seront remplacées automatiquement par les données.</p>
            </WarningBox>

            <p>Processus de personnalisation :</p>
            <ol>
              <li><strong>Téléchargez</strong> le template existant pour voir sa structure</li>
              <li>Utilisez LibreOffice ou Microsoft Word pour modifier le template (format DOCX)</li>
              <li>Conservez toutes les variables de données intactes</li>
              <li><strong>Uploadez</strong> le template personnalisé</li>
              <li>Testez la génération sur un dossier exemple</li>
            </ol>

            <p>Vous pouvez toujours <strong>restaurer</strong> le template par défaut si nécessaire.</p>

            <SubsectionTitle id="variables-convention" colors={colors}>Variables pour les conventions d'honoraires</SubsectionTitle>
            
            <VariablesGrid>
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>👤 Bénéficiaire</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.beneficiaire.prenom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.beneficiaire.nom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.beneficiaire.qualite}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.beneficiaire.numeroDecision}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.beneficiaire.dateDecision}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>🎖️ Militaire</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.militaire.grade}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.militaire.prenom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.militaire.nom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.militaire.unite}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>📁 Affaire</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.affaire.nom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.affaire.lieu}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.affaire.dateFaits}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.affaire.redacteur}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>⚖️ Avocat</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.avocat.prenom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.avocat.nom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.avocat.email}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>📄 Convention</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.convention.montant}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.convention.pourcentageResultats}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>📅 Autres</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.dateDocument}`}</VariableItem>
                </VariableList>
              </VariableGroup>
            </VariablesGrid>

            <SubsectionTitle id="variables-reglement" colors={colors}>Variables pour les fiches de règlement</SubsectionTitle>
            
            <VariablesGrid>
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>💰 Paiement</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.paiement.montant}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.type}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.date}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.referencePiece}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.qualiteDestinataire}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.identiteDestinataire}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.adresseDestinataire}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.siretRidet}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.titulaireCompte}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.codeEtablissement}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.codeGuichet}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.numeroCompte}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.paiement.cleVerification}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>👤 Bénéficiaire</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.beneficiaire.prenom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.beneficiaire.nom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.beneficiaire.qualite}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.beneficiaire.numeroDecision}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.beneficiaire.dateDecision}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>🎖️ Militaire</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.militaire.grade}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.militaire.prenom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.militaire.nom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.militaire.unite}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>📁 Affaire</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.affaire.nom}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.affaire.lieu}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.affaire.dateFaits}`}</VariableItem>
                  <VariableItem colors={colors}>{`{d.affaire.redacteur}`}</VariableItem>
                </VariableList>
              </VariableGroup>
              
              <VariableGroup colors={colors}>
                <VariableGroupTitle colors={colors}>📅 Autres</VariableGroupTitle>
                <VariableList>
                  <VariableItem colors={colors}>{`{d.dateDocument}`}</VariableItem>
                </VariableList>
              </VariableGroup>
            </VariablesGrid>
          </Section>
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

// Styled Components avec responsive design complet

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

// Toggle button pour mobile
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

// Overlay pour fermer la sidebar mobile
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
    right: auto;
    bottom: auto;
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
  transition: color 0.3s ease;
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
  transition: color 0.3s ease;
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
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const Section = styled.section`
  margin-bottom: 48px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  p {
    margin-bottom: 16px;
    line-height: 1.7;
    color: ${props => props.colors.textPrimary};
    transition: color 0.3s ease;
  }
  
  ul, ol {
    margin: 16px 0;
    padding-left: 24px;
    
    li {
      margin-bottom: 8px;
      line-height: 1.6;
      color: ${props => props.colors.textPrimary};
      transition: color 0.3s ease;
    }
    
    @media (max-width: 480px) {
      padding-left: 16px;
    }
  }
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  margin-bottom: 16px;
  border-bottom: 3px solid ${props => props.colors.primary};
  padding-bottom: 8px;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    border-bottom-width: 2px;
  }
`;

const SubsectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  margin: 32px 0 16px 0;
  position: relative;
  transition: color 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    left: -16px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background-color: ${props => props.colors.primary};
    border-radius: 2px;
    
    @media (max-width: 480px) {
      left: -12px;
      width: 3px;
      height: 16px;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 24px 0 12px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const HighlightBox = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.primary}10, ${props => props.colors.primary}05);
  border-left: 4px solid ${props => props.colors.primary};
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  p {
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    margin: 16px 0;
  }
`;

const WarningBox = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.warningBg}, #fff8e1);
  border-left: 4px solid ${props => props.colors.warning};
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  p {
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: #e65100;
    }
  }
  
  code {
    background-color: ${props => props.colors.surfaceHover};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: ${props => props.colors.textPrimary};
    word-break: break-all;
    
    @media (max-width: 480px) {
      font-size: 11px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    margin: 16px 0;
  }
`;

const StructureCard = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.successBg}, #e8f5e9);
  border: 1px solid ${props => props.colors.success};
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  p {
    margin: 0;
    color: ${props => props.colors.textPrimary};
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    margin: 16px 0;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 20px 0;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    margin: 16px 0;
  }
`;

const FeatureCard = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.colors.shadowHover};
    border-color: ${props => props.colors.primary};
  }
  
  h4 {
    color: ${props => props.colors.primary};
    margin-bottom: 12px;
    font-size: 18px;
    
    @media (max-width: 480px) {
      font-size: 16px;
      margin-bottom: 8px;
    }
  }
  
  p {
    color: ${props => props.colors.textPrimary};
    margin-bottom: 8px;
    
    @media (max-width: 480px) {
      font-size: 14px;
    }
  }
  
  em {
    color: ${props => props.colors.textSecondary};
    font-size: 14px;
    
    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const VariablesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin: 16px 0;
  }
`;

const VariableGroup = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const VariableGroupTitle = styled.h5`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.colors.primary};
  margin-bottom: 12px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  padding-bottom: 4px;
  transition: color 0.3s ease;
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 8px;
  }
`;

const VariableList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const VariableItem = styled.li`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: ${props => props.colors.primaryDark};
  transition: all 0.3s ease;
  word-break: break-all;
  
  &:hover {
    background-color: ${props => props.colors.primary};
    color: white;
    transform: translateX(4px);
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 6px 8px;
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
  
  @media (max-width: 480px) {
    bottom: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
`;

export default Documentation;