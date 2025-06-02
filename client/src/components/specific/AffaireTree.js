import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaFolder, FaUser, FaUsers, FaChevronRight, FaChevronDown, FaPlus } from 'react-icons/fa';
import { affairesAPI, beneficiairesAPI, militairesAPI } from '../../utils/api';
import Modal from '../common/Modal';
import MilitaireForm from '../forms/MilitaireForm';
import BeneficiaireForm from '../forms/BeneficiaireForm';
import { useTheme } from '../../contexts/ThemeContext';

const AffaireTree = ({ affaireId, onUpdate }) => {
  const [arborescence, setArborescence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMilitaires, setExpandedMilitaires] = useState({});
  const [militaireModalOpen, setMilitaireModalOpen] = useState(false);
  const [beneficiaireModalOpen, setBeneficiaireModalOpen] = useState(false);
  const [selectedMilitaire, setSelectedMilitaire] = useState(null);
  
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  useEffect(() => {
    fetchArborescence();
  }, [affaireId]);
  
  const fetchArborescence = async () => {
    setLoading(true);
    try {
      const response = await affairesAPI.getArborescence(affaireId);
      setArborescence(response.data);
      
      // Initialiser tous les militaires comme étendus par défaut
      if (response.data.militaires) {
        const initialExpanded = {};
        response.data.militaires.forEach(militaire => {
          initialExpanded[militaire._id] = true; // Mettre à true pour déplier par défaut
        });
        setExpandedMilitaires(initialExpanded);
      }
      
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'arborescence", err);
      setError("Impossible de charger les données de l'affaire");
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMilitaire = (militaireId) => {
    setExpandedMilitaires(prev => ({
      ...prev,
      [militaireId]: !prev[militaireId]
    }));
  };
  
  // Fonction pour tout déplier
  const expandAll = () => {
    const allExpanded = {};
    if (arborescence && arborescence.militaires) {
      arborescence.militaires.forEach(militaire => {
        allExpanded[militaire._id] = true;
      });
      setExpandedMilitaires(allExpanded);
    }
  };
  
  // Fonction pour tout replier
  const collapseAll = () => {
    const allCollapsed = {};
    if (arborescence && arborescence.militaires) {
      arborescence.militaires.forEach(militaire => {
        allCollapsed[militaire._id] = false;
      });
      setExpandedMilitaires(allCollapsed);
    }
  };
  
  // Vérifier si tout est déplié ou replié pour afficher le bon bouton
  const areAllExpanded = () => {
    if (!arborescence || !arborescence.militaires || arborescence.militaires.length === 0) {
      return false;
    }
    
    return arborescence.militaires.every(militaire => expandedMilitaires[militaire._id]);
  };
  
  const handleAddMilitaire = () => {
    setMilitaireModalOpen(true);
  };
  
  const handleAddBeneficiaire = (militaire) => {
    setSelectedMilitaire(militaire);
    setBeneficiaireModalOpen(true);
  };
  
  const handleMilitaireSubmit = async (data) => {
    try {
      // Extraire l'option de création de bénéficiaire et ignorer le rédacteur du formulaire
      const { creerBeneficiaire, redacteur, numeroDecisionBeneficiaire, ...militaireData } = data;
      
      // Créer le militaire
      const response = await militairesAPI.create(militaireData);
      
      // Si l'option est cochée et création du militaire réussie, créer aussi un bénéficiaire
      if (creerBeneficiaire && response.data && response.data._id) {
        const militaireId = response.data._id;
        
        // Données du bénéficiaire - sans redacteur et avec un tableau d'avocats vide
        const beneficiaireData = {
          prenom: militaireData.prenom,
          nom: militaireData.nom,
          qualite: 'Militaire',
          militaire: militaireId,
          numeroDecision: numeroDecisionBeneficiaire || '',
          dateDecision: militaireData.dateDecisionBeneficiaire || null,
          avocats: [] // Tableau vide d'avocats
        };
        
        await beneficiairesAPI.create(beneficiaireData);
      }
      
      setMilitaireModalOpen(false);
      fetchArborescence();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Erreur lors de la création du militaire", err);
      alert("Erreur: " + (err.response?.data?.message || err.message));
    }
  };
  
  const handleBeneficiaireSubmit = async (data) => {
    try {
      // Créer le bénéficiaire sans ajouter de redacteur
      await beneficiairesAPI.create(data);
      setBeneficiaireModalOpen(false);
      fetchArborescence();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Erreur lors de la création du bénéficiaire", err);
      alert("Erreur: " + (err.response?.data?.message || err.message));
    }
  };
  
  const navigateToMilitaire = (militaireId) => {
    navigate(`/militaires/${militaireId}`);
  };
  
  const navigateToBeneficiaire = (beneficiaireId) => {
    navigate(`/beneficiaires/${beneficiaireId}`);
  };
  
  if (loading) {
    return <Loading colors={colors}>Chargement de l'arborescence...</Loading>;
  }
  
  if (error) {
    return <Error colors={colors}>{error}</Error>;
  }
  
  if (!arborescence) {
    return <Empty colors={colors}>Aucune donnée disponible</Empty>;
  }
  
  return (
    <Container colors={colors}>
      <TreeHeader colors={colors}>
        <Title colors={colors}>
          <FaFolder />
          <span>{arborescence.nom}</span>
        </Title>
        <TreeControls>
          <ToggleAllButton onClick={areAllExpanded() ? collapseAll : expandAll} colors={colors}>
            <span className="toggle-text-long">{areAllExpanded() ? 'Tout replier' : 'Tout déplier'}</span>
            <span className="toggle-text-short">{areAllExpanded() ? 'Replier' : 'Déplier'}</span>
          </ToggleAllButton>
          <AddButton onClick={handleAddMilitaire} colors={colors}>
            <FaPlus />
            <span className="add-text">Ajouter un militaire</span>
          </AddButton>
        </TreeControls>
      </TreeHeader>
      
      <TreeContent colors={colors}>
        {arborescence.militaires && arborescence.militaires.length > 0 ? (
          <MilitairesList>
            {arborescence.militaires.map(militaire => (
              <MilitaireItem key={militaire._id} colors={colors}>
                <MilitaireHeader colors={colors}>
                  <ExpandButton onClick={() => toggleMilitaire(militaire._id)} colors={colors}>
                    {expandedMilitaires[militaire._id] ? <FaChevronDown /> : <FaChevronRight />}
                  </ExpandButton>
                  
                  <MilitaireInfo onClick={() => navigateToMilitaire(militaire._id)} colors={colors}>
                    <FaUser />
                    <MilitaireName colors={colors}>
                      <span className="grade">{militaire.grade}</span>
                      <span className="name">{militaire.prenom} {militaire.nom}</span>
                    </MilitaireName>
                    {militaire.decede ? (
                      <StatusTag type="deces" colors={colors}>Décédé</StatusTag>
                    ) : (
                      <StatusTag type="blesse" colors={colors}>Blessé</StatusTag>
                    )}
                  </MilitaireInfo>
                  
                  <AddBeneficiaireButton onClick={() => handleAddBeneficiaire(militaire)} colors={colors}>
                    <FaPlus />
                    <span className="btn-text">Ajouter un bénéficiaire</span>
                  </AddBeneficiaireButton>
                </MilitaireHeader>
                
                {expandedMilitaires[militaire._id] && (
                  <BeneficiairesList colors={colors}>
                    {militaire.beneficiaires && militaire.beneficiaires.length > 0 ? (
                      militaire.beneficiaires.map(beneficiaire => (
                        <BeneficiaireItem 
                          key={beneficiaire._id}
                          onClick={() => navigateToBeneficiaire(beneficiaire._id)}
                          colors={colors}
                        >
                          <FaUsers />
                          <BeneficiaireInfo>
                            <span className="beneficiaire-name">
                              {beneficiaire.prenom} {beneficiaire.nom}
                            </span>
                            <QualiteTag qualite={beneficiaire.qualite} colors={colors}>
                              {beneficiaire.qualite}
                            </QualiteTag>
                          </BeneficiaireInfo>
                        </BeneficiaireItem>
                      ))
                    ) : (
                      <EmptyBeneficiaires colors={colors}>
                        Aucun bénéficiaire associé
                      </EmptyBeneficiaires>
                    )}
                  </BeneficiairesList>
                )}
              </MilitaireItem>
            ))}
          </MilitairesList>
        ) : (
          <Empty colors={colors}>Aucun militaire associé à cette affaire</Empty>
        )}
      </TreeContent>
      
      {/* Modal pour ajouter un militaire */}
      <Modal
        isOpen={militaireModalOpen}
        onClose={() => setMilitaireModalOpen(false)}
        title="Ajouter un militaire"
        size="large"
      >
        <MilitaireForm 
          onSubmit={handleMilitaireSubmit}
          affaireId={affaireId}
          affaireNom={arborescence.nom}
        />
      </Modal>
      
      {/* Modal pour ajouter un bénéficiaire */}
      <Modal
        isOpen={beneficiaireModalOpen}
        onClose={() => setBeneficiaireModalOpen(false)}
        title="Ajouter un bénéficiaire"
        size="large"
      >
        {selectedMilitaire && (
          <BeneficiaireForm 
            onSubmit={handleBeneficiaireSubmit}
            militaireId={selectedMilitaire._id}
          />
        )}
      </Modal>
    </Container>
  );
};

// Styled Components avec thématisation et responsive design
const Container = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  margin-bottom: 24px;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const TreeHeader = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  background-color: ${props => props.colors.surfaceHover};
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 12px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.cardIcon.affaires.color};
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TreeControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    gap: 8px;
  }
`;

const ToggleAllButton = styled.button`
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    border-color: ${props => props.colors.primary};
    color: ${props => props.colors.primary};
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 10px 8px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    .toggle-text-long {
      display: none;
    }
    
    .toggle-text-short {
      display: inline;
    }
  }
  
  @media (min-width: 481px) {
    .toggle-text-long {
      display: inline;
    }
    
    .toggle-text-short {
      display: none;
    }
  }
`;

const AddButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 10px 8px;
    font-size: 14px;
    justify-content: center;
    
    svg {
      margin-right: 6px;
    }
  }
  
  @media (max-width: 480px) {
    .add-text {
      display: none;
    }
    
    svg {
      margin-right: 0;
    }
  }
`;

const TreeContent = styled.div`
  padding: 16px;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const MilitairesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MilitaireItem = styled.li`
  margin-bottom: 16px;
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  background-color: ${props => props.colors.surface};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.colors.shadow};
  }
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const MilitaireHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 10px;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${props => props.colors.primary};
  margin-right: 8px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 2px;
  }
`;

const MilitaireInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-wrap: wrap;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.colors.primary}20;
  }
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.cardIcon.militaires.color};
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 4px;
    width: 100%;
    order: 2;
  }
`;

const MilitaireName = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  flex-wrap: wrap;
  
  .grade {
    font-weight: 500;
    white-space: nowrap;
  }
  
  .name {
    white-space: nowrap;
  }
  
  @media (max-width: 480px) {
    .grade, .name {
      font-size: 14px;
    }
  }
`;

const StatusTag = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  ${props => props.type === 'deces' ? `
    background-color: ${props.colors.errorBg};
    color: ${props.colors.error};
  ` : props.type === 'blesse' ? `
    background-color: ${props.colors.successBg};
    color: ${props.colors.success};
  ` : ''}
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 0 6px;
    height: 20px;
  }
`;

const AddBeneficiaireButton = styled.button`
  background-color: ${props => props.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  svg {
    margin-right: 4px;
  }
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
  
  @media (max-width: 768px) {
    order: 3;
    flex: 1;
    justify-content: center;
    padding: 8px 10px;
  }
  
  @media (max-width: 480px) {
    .btn-text {
      display: none;
    }
    
    svg {
      margin-right: 0;
    }
  }
`;

const BeneficiairesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  padding: 8px 16px 16px 40px;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 8px 12px 12px 24px;
  }
`;

const BeneficiaireItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  cursor: pointer;
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    border-color: ${props => props.colors.primary};
    transform: translateX(4px);
  }
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.cardIcon.beneficiaires.color};
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
    
    &:hover {
      transform: translateX(2px);
    }
  }
`;

const BeneficiaireInfo = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  
  .beneficiaire-name {
    white-space: nowrap;
  }
  
  @media (max-width: 480px) {
    .beneficiaire-name {
      font-size: 14px;
    }
  }
`;

const QualiteTag = styled.span`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid;
  white-space: nowrap;
  
  ${props => {
    switch(props.qualite) {
      case 'Militaire':
        return `
          background-color: ${props.colors.successBg};
          color: ${props.colors.success};
          border-color: ${props.colors.success}40;
        `;
      case 'Conjoint':
        return `
          background-color: ${props.colors.cardIcon.affaires.bg};
          color: ${props.colors.cardIcon.affaires.color};
          border-color: ${props.colors.cardIcon.affaires.color}40;
        `;
      case 'Enfant':
        return `
          background-color: ${props.colors.warningBg};
          color: ${props.colors.warning};
          border-color: ${props.colors.warning}40;
        `;
      case 'Parent':
        return `
          background-color: ${props.colors.cardIcon.finances.bg};
          color: ${props.colors.cardIcon.finances.color};
          border-color: ${props.colors.cardIcon.finances.color}40;
        `;
      default:
        return `
          background-color: ${props.colors.surfaceHover};
          color: ${props.colors.textMuted};
          border-color: ${props.colors.borderLight};
        `;
    }
  }}
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 2px 4px;
  }
`;

const EmptyBeneficiaires = styled.div`
  padding: 12px;
  color: ${props => props.colors.textMuted};
  font-style: italic;
  text-align: center;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 14px;
  }
`;

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textSecondary};
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  border: 1px solid ${props => props.colors.error}40;
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

export default AffaireTree;