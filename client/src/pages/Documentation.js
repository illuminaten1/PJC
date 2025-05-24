import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBook, FaSearch } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import PageHeader from '../components/common/PageHeader';

const Documentation = () => {
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('introduction');
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    }
  };

  // Retour en haut
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <Container colors={colors}>
      <PageHeader 
        title="Documentation"
        subtitle="Guide d'utilisation de l'application de Protection Juridique Complémentaire"
        backButton
      />

      <DocumentationLayout>
        <Sidebar colors={colors}>
          <SidebarTitle colors={colors}>
            <FaBook style={{ marginRight: '8px' }} />
            Sommaire
          </SidebarTitle>
          
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
            <TocItem>
              <TocLink 
                active={activeSection === 'introduction'}
                onClick={() => scrollToSection('introduction')}
                colors={colors}
              >
                Introduction
              </TocLink>
            </TocItem>
            
            <TocItem>
              <TocLink 
                active={activeSection === 'structure'}
                onClick={() => scrollToSection('structure')}
                colors={colors}
              >
                Structure des données
              </TocLink>
              <SubMenu>
                <TocItem>
                  <TocLink 
                    active={activeSection === 'affaires'}
                    onClick={() => scrollToSection('affaires')}
                    colors={colors}
                    submenu={true}
                  >
                    Affaires
                  </TocLink>
                </TocItem>
                <TocItem>
                  <TocLink 
                    active={activeSection === 'militaires'}
                    onClick={() => scrollToSection('militaires')}
                    colors={colors}
                    submenu={true}
                  >
                    Militaires
                  </TocLink>
                </TocItem>
                <TocItem>
                  <TocLink 
                    active={activeSection === 'beneficiaires'}
                    onClick={() => scrollToSection('beneficiaires')}
                    colors={colors}
                    submenu={true}
                  >
                    Bénéficiaires
                  </TocLink>
                </TocItem>
              </SubMenu>
            </TocItem>
            
            <TocItem>
              <TocLink 
                active={activeSection === 'fonctionnalites'}
                onClick={() => scrollToSection('fonctionnalites')}
                colors={colors}
              >
                Fonctionnalités
              </TocLink>
            </TocItem>
            
            <TocItem>
              <TocLink 
                active={activeSection === 'gestion-parametres'}
                onClick={() => scrollToSection('gestion-parametres')}
                colors={colors}
              >
                Gestion des paramètres
              </TocLink>
              <SubMenu>
                <TocItem>
                  <TocLink 
                    active={activeSection === 'circonstances'}
                    onClick={() => scrollToSection('circonstances')}
                    colors={colors}
                    submenu={true}
                  >
                    Circonstances
                  </TocLink>
                </TocItem>
                <TocItem>
                  <TocLink 
                    active={activeSection === 'redacteurs'}
                    onClick={() => scrollToSection('redacteurs')}
                    colors={colors}
                    submenu={true}
                  >
                    Rédacteurs
                  </TocLink>
                </TocItem>
              </SubMenu>
            </TocItem>
            
            <TocItem>
              <TocLink 
                active={activeSection === 'templates'}
                onClick={() => scrollToSection('templates')}
                colors={colors}
              >
                Templates de documents
              </TocLink>
              <SubMenu>
                <TocItem>
                  <TocLink 
                    active={activeSection === 'personnalisation'}
                    onClick={() => scrollToSection('personnalisation')}
                    colors={colors}
                    submenu={true}
                  >
                    Personnalisation
                  </TocLink>
                </TocItem>
                <TocItem>
                  <TocLink 
                    active={activeSection === 'variables-convention'}
                    onClick={() => scrollToSection('variables-convention')}
                    colors={colors}
                    submenu={true}
                  >
                    Variables convention
                  </TocLink>
                </TocItem>
                <TocItem>
                  <TocLink 
                    active={activeSection === 'variables-reglement'}
                    onClick={() => scrollToSection('variables-reglement')}
                    colors={colors}
                    submenu={true}
                  >
                    Variables règlement
                  </TocLink>
                </TocItem>
              </SubMenu>
            </TocItem>
          </TableOfContents>
        </Sidebar>

        <Content colors={colors}>
          <Section id="introduction" className="doc-section">
            <SectionTitle colors={colors}>Introduction</SectionTitle>
            <HighlightBox colors={colors}>
              <p><strong>Bienvenue dans l'application de gestion de Protection Juridique Complémentaire</strong></p>
              <p>Cette application permet la gestion des dossiers de protection juridique complémentaire pour les militaires ou leurs ayants-droits.</p>
            </HighlightBox>
            
            <p>L'application offre une interface complète pour gérer l'ensemble du processus, depuis la création des dossiers jusqu'au suivi des paiements, en passant par la génération automatique de documents.</p>
          </Section>

          <Section id="structure" className="doc-section">
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

          <Section id="fonctionnalites" className="doc-section">
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

          <Section id="gestion-parametres" className="doc-section">
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

          <Section id="templates" className="doc-section">
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
              
              {/* Répéter les autres groupes de variables communes */}
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

// Styled Components
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

const DocumentationLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.nav`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  padding: 20px;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  @media (max-width: 968px) {
    position: static;
    max-height: none;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${props => props.colors.textPrimary};
  border-bottom: 2px solid ${props => props.colors.primary};
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
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
`;

const Section = styled.section`
  margin-bottom: 48px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  p {
    margin-bottom: 16px;
    line-height: 1.7;
    color: ${props => props.colors?.textPrimary};
  }
  
  ul, ol {
    margin: 16px 0;
    padding-left: 24px;
    
    li {
      margin-bottom: 8px;
      line-height: 1.6;
      color: ${props => props.colors?.textPrimary};
    }
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
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
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
  }
  
  p {
    color: ${props => props.colors.textPrimary};
    margin-bottom: 8px;
  }
  
  em {
    color: ${props => props.colors.textSecondary};
    font-size: 14px;
  }
`;

const VariablesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin: 20px 0;
`;

const VariableGroup = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
`;

const VariableGroupTitle = styled.h5`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.colors.primary};
  margin-bottom: 12px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  padding-bottom: 4px;
  transition: color 0.3s ease;
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
  
  &:hover {
    background-color: ${props => props.colors.primary};
    color: white;
    transform: translateX(4px);
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
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.colors.primaryDark};
  }
`;

export default Documentation;