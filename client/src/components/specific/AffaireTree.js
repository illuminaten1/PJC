import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaFolder, FaUser, FaUsers, FaChevronRight, FaChevronDown, FaPlus } from 'react-icons/fa';
import { affairesAPI, beneficiairesAPI, militairesAPI } from '../../utils/api';
import Modal from '../common/Modal';
import MilitaireForm from '../forms/MilitaireForm';
import BeneficiaireForm from '../forms/BeneficiaireForm';

const AffaireTree = ({ affaireId, onUpdate }) => {
  const [arborescence, setArborescence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMilitaires, setExpandedMilitaires] = useState({});
  const [militaireModalOpen, setMilitaireModalOpen] = useState(false);
  const [beneficiaireModalOpen, setBeneficiaireModalOpen] = useState(false);
  const [selectedMilitaire, setSelectedMilitaire] = useState(null);
  
  const navigate = useNavigate();
  
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
    return <Loading>Chargement de l'arborescence...</Loading>;
  }
  
  if (error) {
    return <Error>{error}</Error>;
  }
  
  if (!arborescence) {
    return <Empty>Aucune donnée disponible</Empty>;
  }
  
  return (
    <Container>
      <TreeHeader>
        <Title>
          <FaFolder />
          <span>{arborescence.nom}</span>
        </Title>
        <TreeControls>
          <ToggleAllButton onClick={areAllExpanded() ? collapseAll : expandAll}>
            {areAllExpanded() ? 'Tout replier' : 'Tout déplier'}
          </ToggleAllButton>
          <AddButton onClick={handleAddMilitaire}>
            <FaPlus />
            <span>Ajouter un militaire</span>
          </AddButton>
        </TreeControls>
      </TreeHeader>
      
      <TreeContent>
        {arborescence.militaires && arborescence.militaires.length > 0 ? (
          <MilitairesList>
            {arborescence.militaires.map(militaire => (
              <MilitaireItem key={militaire._id}>
                <MilitaireHeader>
                  <ExpandButton onClick={() => toggleMilitaire(militaire._id)}>
                    {expandedMilitaires[militaire._id] ? <FaChevronDown /> : <FaChevronRight />}
                  </ExpandButton>
                  
                  <MilitaireInfo onClick={() => navigateToMilitaire(militaire._id)}>
                    <FaUser />
                    <MilitaireName>
                      {militaire.grade} {militaire.prenom} {militaire.nom}
                    </MilitaireName>
                    {militaire.decede ? (
                      <StatusTag type="deces">Décédé</StatusTag>
                    ) : (
                      <StatusTag type="blesse">Blessé</StatusTag>
                    )}
                  </MilitaireInfo>
                  
                  <AddBeneficiaireButton onClick={() => handleAddBeneficiaire(militaire)}>
                    <FaPlus />
                    <span>Ajouter un bénéficiaire</span>
                  </AddBeneficiaireButton>
                </MilitaireHeader>
                
                {expandedMilitaires[militaire._id] && (
                  <BeneficiairesList>
                    {militaire.beneficiaires && militaire.beneficiaires.length > 0 ? (
                      militaire.beneficiaires.map(beneficiaire => (
                        <BeneficiaireItem 
                          key={beneficiaire._id}
                          onClick={() => navigateToBeneficiaire(beneficiaire._id)}
                        >
                          <FaUsers />
                          <span>
                            {beneficiaire.prenom} {beneficiaire.nom}
                            <QualiteTag>{beneficiaire.qualite}</QualiteTag>
                          </span>
                        </BeneficiaireItem>
                      ))
                    ) : (
                      <EmptyBeneficiaires>
                        Aucun bénéficiaire associé
                      </EmptyBeneficiaires>
                    )}
                  </BeneficiairesList>
                )}
              </MilitaireItem>
            ))}
          </MilitairesList>
        ) : (
          <Empty>Aucun militaire associé à cette affaire</Empty>
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

const Container = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const TreeHeader = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #f57c00;
  }
`;

const TreeControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ToggleAllButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const AddButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #303f9f;
  }
`;

const TreeContent = styled.div`
  padding: 16px;
`;

const MilitairesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MilitaireItem = styled.li`
  margin-bottom: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const MilitaireHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #3f51b5;
  margin-right: 8px;
`;

const MilitaireInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(63, 81, 181, 0.1);
  }
  
  svg {
    margin-right: 8px;
    color: #3f51b5;
  }
`;

const MilitaireName = styled.span`
  margin-right: 10px;
`;

const StatusTag = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => props.type === 'deces' ? `
    background-color: #ffebee;
    color: #c62828;
  ` : props.type === 'blesse' ? `
    background-color: #e8f5e9;
    color: #388e3c;
  ` : ''}
`;

const AddBeneficiaireButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 4px;
  }
  
  &:hover {
    background-color: #388e3c;
  }
`;

const BeneficiairesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  padding: 8px 16px 16px 40px;
`;

const BeneficiaireItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  svg {
    margin-right: 8px;
    color: #673ab7;
  }
`;

const QualiteTag = styled.span`
  background-color: #e3f2fd;
  color: #0d47a1;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
`;

const EmptyBeneficiaires = styled.div`
  padding: 12px;
  color: #757575;
  font-style: italic;
  text-align: center;
`;

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: #757575;
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
`;

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  color: #757575;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

export default AffaireTree;