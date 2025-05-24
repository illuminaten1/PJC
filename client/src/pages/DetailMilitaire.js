import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaChartBar, FaUser } from 'react-icons/fa';
import { militairesAPI, statistiquesAPI, affairesAPI, beneficiairesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import MilitaireForm from '../components/forms/MilitaireForm';
import BeneficiaireForm from '../components/forms/BeneficiaireForm';
import { useTheme } from '../contexts/ThemeContext';
import {
  ThemedHeaderCard,
  HeaderGrid,
  HeaderItem,
  ThemedHeaderLabel,
  ThemedHeaderValue,
  ThemedArchiveNote
} from '../components/common/HeaderComponents';

const DetailMilitaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  const [militaire, setMilitaire] = useState(null);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [beneficiaireModalOpen, setBeneficiaireModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  // Définir fetchMilitaire avec useCallback
  const fetchMilitaire = useCallback(async () => {
    setLoading(true);
    try {
      const response = await militairesAPI.getById(id);
      setMilitaire(response.data);
      console.log("Données du militaire:", response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération du militaire", err);
      setError("Impossible de charger les détails du militaire");
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  // Définir fetchStatistiques avec useCallback
  const fetchStatistiques = useCallback(async () => {
    try {
      const response = await statistiquesAPI.getByMilitaire(id);
      setStatistiques(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques", err);
      // Ne pas bloquer l'affichage de la page si les statistiques échouent
    }
  }, [id]);
  
  // Utiliser les fonctions dans useEffect
  useEffect(() => {
    fetchMilitaire();
    fetchStatistiques();
  }, [fetchMilitaire, fetchStatistiques]);

  const handleEditMilitaire = async (data) => {
    try {
      await militairesAPI.update(id, data);
      setEditModalOpen(false);
      fetchMilitaire();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du militaire", err);
      // Gérer l'erreur
    }
  };
  
  const handleAddBeneficiaire = async (data) => {
    try {
      // Récupérer d'abord le militaire pour obtenir l'affaire associée
      const militaireResponse = await militairesAPI.getById(id);
      const affaireId = militaireResponse.data.affaire._id || militaireResponse.data.affaire;
      
      // Ensuite, récupérer l'affaire pour obtenir le rédacteur
      const affaireResponse = await affairesAPI.getById(affaireId);
      const affaireRedacteur = affaireResponse.data.redacteur;
      
      // S'assurer que les avocats sont correctement formatés
      const formattedAvocats = data.avocats.map(avocat => {
        // Si avocat est déjà un ID, le retourner tel quel
        if (typeof avocat === 'string') return avocat;
        // Sinon, retourner l'ID
        return avocat._id;
      });

      // Créer le bénéficiaire
      const beneficiaireData = {
        ...data,
        militaire: id, // Assurez-vous que l'ID du militaire est utilisé
        redacteur: affaireRedacteur, // Utiliser le rédacteur de l'affaire
        avocats: formattedAvocats,
      };
      
      // Utiliser l'API des bénéficiaires
      await beneficiairesAPI.create(beneficiaireData);
      setBeneficiaireModalOpen(false);
      fetchMilitaire();
      fetchStatistiques();
    } catch (err) {
      console.error("Erreur lors de la création du bénéficiaire", err);
      alert("Erreur: " + (err.response?.data?.message || err.message));
    }
  };
  
  const handleDelete = async () => {
    try {
      await militairesAPI.delete(id);
      navigate('/militaires');
    } catch (err) {
      console.error("Erreur lors de la suppression du militaire", err);
      setDeleteError("Erreur lors de la suppression");
    }
  };
  
  const navigateToBeneficiaire = (beneficiaireId) => {
    navigate(`/beneficiaires/${beneficiaireId}`);
  };
  
  const navigateToAffaire = (affaireId) => {
    navigate(`/affaires/${affaireId}`);
  };
  
  if (loading) {
    return (
      <Container colors={colors}>
        <PageHeader 
          title="Détails du militaire" 
          backButton
        />
        <Loading colors={colors}>Chargement des détails du militaire...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container colors={colors}>
        <PageHeader 
          title="Détails du militaire" 
          backButton
        />
        <Error colors={colors}>{error}</Error>
      </Container>
    );
  }
  
  return (
    <Container colors={colors}>
      <PageHeader 
        title={`${militaire.grade} ${militaire.prenom} ${militaire.nom}`}
        subtitle={
          militaire.decede ? 
          "Militaire décédé en service" : 
          "Militaire blessé en service"
        }
        backButton
        actionButton={
          <ActionButtons>
            <ActionButton onClick={() => setEditModalOpen(true)} title="Modifier le militaire" colors={colors}>
              <FaEdit />
              <ButtonText>Modifier</ButtonText>
            </ActionButton>
            
            <ActionButton 
              onClick={() => setDeleteModalOpen(true)} 
              title="Supprimer le militaire"
              className="delete"
              colors={colors}
            >
              <FaTrash />
              <ButtonText>Supprimer</ButtonText>
            </ActionButton>
          </ActionButtons>
        }
      />
      
      <ThemedHeaderCard>
        <HeaderGrid>
          <HeaderItem>
            <ThemedHeaderLabel>Affaire</ThemedHeaderLabel>
            <AffaireLink onClick={() => navigateToAffaire(militaire.affaire._id)} colors={colors}>
              {militaire.affaire.nom}
            </AffaireLink>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Unité d'affectation</ThemedHeaderLabel>
            <ThemedHeaderValue>{militaire.unite}</ThemedHeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Région / Département</ThemedHeaderLabel>
            <ThemedHeaderValue>{militaire.region || '-'} / {militaire.departement || '-'}</ThemedHeaderValue>
          </HeaderItem>

          <HeaderItem>
            <ThemedHeaderLabel>Statut d'archivage</ThemedHeaderLabel>
            <StatusTag status={militaire.archive ? 'archived' : 'active'} colors={colors}>
              {militaire.archive ? 'Archivé' : 'Actif'}
            </StatusTag>
            {militaire.archive && (
              <ThemedArchiveNote>
                Ce militaire est archivé car il fait partie d'une affaire archivée.
                Pour le désarchiver, veuillez désarchiver l'affaire correspondante.
              </ThemedArchiveNote>
            )}
          </HeaderItem>
        </HeaderGrid>

        <HeaderGrid>
          <HeaderItem>
            <ThemedHeaderLabel>Circonstance</ThemedHeaderLabel>
            <ThemedHeaderValue>{militaire.circonstance}</ThemedHeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Statut</ThemedHeaderLabel>
            <StatusTag status={militaire.decede ? 'deces' : 'blesse'} colors={colors}>
              {militaire.decede ? 'Décédé' : 'Blessé'}
            </StatusTag>
          </HeaderItem>
          
          {!militaire.decede && (
            <HeaderItem>
              <ThemedHeaderLabel>Jours d'ITT</ThemedHeaderLabel>
              <ThemedHeaderValue>{militaire.itt || '0'} jours</ThemedHeaderValue>
            </HeaderItem>
          )}
        
          {militaire.natureDesBlessures && (
            <HeaderItem>
              <ThemedHeaderLabel>Nature des blessures</ThemedHeaderLabel>
              <ThemedHeaderValue>{militaire.natureDesBlessures}</ThemedHeaderValue>
            </HeaderItem>
          )}
        </HeaderGrid>
      </ThemedHeaderCard>
      
      {statistiques && (
        <Section colors={colors}>
          <SectionHeader>
            <SectionTitle colors={colors}>
              <FaChartBar />
              <span>Statistiques</span>
            </SectionTitle>
          </SectionHeader>
          
          <StatsGrid>
            <StatsCard colors={colors}>
              <StatsTitle colors={colors}>Nombre de bénéficiaires</StatsTitle>
              <StatsValue colors={colors}>{statistiques.beneficiaires.total}</StatsValue>
              <StatsDetails colors={colors}>
                {Object.entries(statistiques.beneficiaires.parQualite).map(([qualite, nombre]) => (
                  <StatDetail key={qualite}>
                    <StatDetailLabel colors={colors}>{qualite} :</StatDetailLabel>
                    <StatDetailValue colors={colors}>{nombre}</StatDetailValue>
                  </StatDetail>
                ))}
              </StatsDetails>
            </StatsCard>
            
            <StatsCard colors={colors}>
              <StatsTitle colors={colors}>Total engagé</StatsTitle>
              <StatsValue colors={colors}>{statistiques.finances.montantGage.toLocaleString('fr-FR')} €</StatsValue>
              <StatsDetails colors={colors}>
                <StatDetail>
                  <StatDetailLabel colors={colors}>Conventions :</StatDetailLabel>
                  <StatDetailValue colors={colors}>{statistiques.finances.nombreConventions}</StatDetailValue>
                </StatDetail>
              </StatsDetails>
            </StatsCard>
            
            <StatsCard colors={colors}>
              <StatsTitle colors={colors}>Total payé</StatsTitle>
              <StatsValue colors={colors}>{statistiques.finances.montantPaye.toLocaleString('fr-FR')} €</StatsValue>
              <StatsDetails colors={colors}>
                <StatDetail>
                  <StatDetailLabel colors={colors}>Paiements :</StatDetailLabel>
                  <StatDetailValue colors={colors}>{statistiques.finances.nombrePaiements}</StatDetailValue>
                </StatDetail>
                <StatDetail>
                  <StatDetailLabel colors={colors}>Ratio :</StatDetailLabel>
                  <StatDetailValue colors={colors}>{statistiques.finances.ratio.toFixed(1)}%</StatDetailValue>
                </StatDetail>
              </StatsDetails>
            </StatsCard>
          </StatsGrid>
        </Section>
      )}
      
      <Section colors={colors}>
        <SectionHeader>
          <SectionTitle colors={colors}>Bénéficiaires associés</SectionTitle>
          <AddButton onClick={() => setBeneficiaireModalOpen(true)} colors={colors}>
            <FaPlus />
            <span>Ajouter un bénéficiaire</span>
          </AddButton>
        </SectionHeader>
        
        {militaire.beneficiaires && militaire.beneficiaires.length > 0 ? (
          <BeneficiairesList>
            {militaire.beneficiaires.map(beneficiaire => (
              <BeneficiaireItem 
                key={beneficiaire._id}
                onClick={() => navigateToBeneficiaire(beneficiaire._id)}
                colors={colors}
              >
                <BeneficiaireHeader>
                  <BeneficiaireNameContainer>
                    <BeneficiaireName colors={colors}>
                      <FaUser />
                      {beneficiaire.prenom} {beneficiaire.nom}
                    </BeneficiaireName>
                    <BeneficiaireQualite colors={colors}>{beneficiaire.qualite}</BeneficiaireQualite>
                  </BeneficiaireNameContainer>
                </BeneficiaireHeader>
                
                <BeneficiaireDetails>
                  <BeneficiaireDetail>
                    <DetailLabel colors={colors}>Avocats :</DetailLabel>
                    <DetailValue colors={colors}>
                      {beneficiaire.avocats && beneficiaire.avocats.length > 0
                        ? beneficiaire.avocats.map(a => {
                            return `${a.prenom || ''} ${a.nom || ''}`.trim() || 'Détails manquants';
                          }).join(', ')
                        : 'Aucun'}
                    </DetailValue>
                  </BeneficiaireDetail>
                  
                  <BeneficiaireDetail>
                    <DetailLabel colors={colors}>Conventions :</DetailLabel>
                    <DetailValue colors={colors}>
                      {beneficiaire.conventions && beneficiaire.conventions.length
                        ? beneficiaire.conventions.length
                        : 'Aucune'}
                    </DetailValue>
                  </BeneficiaireDetail>
                  
                  <BeneficiaireDetail>
                    <DetailLabel colors={colors}>Paiements :</DetailLabel>
                    <DetailValue colors={colors}>
                      {beneficiaire.paiements && beneficiaire.paiements.length > 0
                        ? beneficiaire.paiements.length
                        : 'Aucun'}
                    </DetailValue>
                  </BeneficiaireDetail>
                </BeneficiaireDetails>
              </BeneficiaireItem>
            ))}
          </BeneficiairesList>
        ) : (
          <EmptyMessage colors={colors}>Aucun bénéficiaire associé à ce militaire</EmptyMessage>
        )}
      </Section>
      
      {/* Modal de modification */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier le militaire"
        size="large"
      >
        <MilitaireForm 
          onSubmit={handleEditMilitaire}
          initialData={militaire}
          isEditing
          affaireId={militaire.affaire._id || militaire.affaire}
          affaireNom={militaire.affaire.nom || "Affaire associée"}
        />
      </Modal>
      
      {/* Modal d'ajout de bénéficiaire */}
      <Modal
        isOpen={beneficiaireModalOpen}
        onClose={() => setBeneficiaireModalOpen(false)}
        title="Ajouter un bénéficiaire"
        size="large"
      >
        <BeneficiaireForm 
          onSubmit={handleAddBeneficiaire}
          militaireId={id}
        />
      </Modal>
      
      {/* Modal de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer le militaire"
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setDeleteModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={handleDelete} colors={colors}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent>
          <p>Êtes-vous sûr de vouloir supprimer définitivement ce militaire ?</p>
          <p><strong>Attention :</strong> Cette action supprimera également tous les bénéficiaires associés à ce militaire.</p>
          
          {deleteError && <ErrorMessage colors={colors}>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>
    </Container>
  );
};

// Styled Components avec thématisation complète
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

const AffaireLink = styled.div`
  font-size: 16px;
  color: ${props => props.colors.primary};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    text-decoration: underline;
    color: ${props => props.colors.primaryDark};
  }
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => props.status === 'deces' ? `
    background-color: ${props.colors.errorBg};
    color: ${props.colors.error};
    border: 1px solid ${props.colors.error}40;
  ` : props.status === 'blesse' ? `
    background-color: ${props.colors.successBg};
    color: ${props.colors.success};
    border: 1px solid ${props.colors.success}40;
  ` : props.status === 'archived' ? `
    background-color: ${props.colors.surfaceHover};
    color: ${props.colors.textMuted};
    border: 1px solid ${props.colors.borderLight};
  ` : props.status === 'active' ? `
    background-color: ${props.colors.successBg};
    color: ${props.colors.success};
    border: 1px solid ${props.colors.success}40;
  ` : ''}
`;

const Section = styled.section`
  margin-bottom: 30px;
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.colors ? props.colors.borderLight : '#e0e0e0'};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  display: flex;
  align-items: center;
  margin: 0;
  transition: color 0.3s ease;
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.primary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatsCard = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  padding: 20px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const StatsTitle = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 8px;
  font-weight: 500;
  transition: color 0.3s ease;
`;

const StatsValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.colors.primary};
  margin-bottom: 16px;
  transition: color 0.3s ease;
`;

const StatsDetails = styled.div`
  border-top: 1px solid ${props => props.colors.borderLight};
  padding-top: 12px;
`;

const StatDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 14px;
`;

const StatDetailLabel = styled.span`
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const StatDetailValue = styled.span`
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const AddButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: ${props => props.colors.shadow};
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const BeneficiairesList = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
`;

const BeneficiaireItem = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.colors.border};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.colors.shadowHover};
    border-color: ${props => props.colors.primary}40;
  }
`;

const BeneficiaireHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.colors ? props.colors.borderLight : '#eee'};
`;

const BeneficiaireNameContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const BeneficiaireName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.colors.textPrimary};
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.primary};
    font-size: 16px;
  }
`;

const BeneficiaireQualite = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  padding: 4px 8px;
  background-color: ${props => props.colors.primary}20;
  color: ${props => props.colors.primary};
  border-radius: 4px;
  height: 24px;
  font-weight: 500;
  border: 1px solid ${props => props.colors.primary}40;
  transition: all 0.3s ease;
`;

const BeneficiaireDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BeneficiaireDetail = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const DetailLabel = styled.span`
  color: ${props => props.colors.textSecondary};
  min-width: 100px;
  margin-right: 10px;
  font-weight: 500;
  transition: color 0.3s ease;
`;

const DetailValue = styled.span`
  color: ${props => props.colors.textPrimary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textSecondary};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.primary};
  border: 1px solid ${props => props.colors.primary};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 36px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.colors.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  &.delete {
    color: ${props => props.colors.error};
    border-color: ${props => props.colors.error};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.colors.error};
      color: white;
    }
  }
  
  svg {
    margin-right: 6px;
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
  font-weight: 500;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const DeleteConfirmContent = styled.div`
  p {
    margin-bottom: 16px;
    color: ${props => props.colors ? props.colors.textPrimary : '#333'};
    
    strong {
      color: ${props => props.colors ? props.colors.error : '#f44336'};
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 14px;
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
`;

const CancelButton = styled.button`
  background-color: ${props => props.colors.surfaceHover};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.borderLight};
    border-color: ${props => props.colors.primary};
    transform: translateY(-1px);
  }
`;

const DeleteButton = styled.button`
  background-color: ${props => props.colors.error};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.error}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textSecondary};
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
`;

export default DetailMilitaire;