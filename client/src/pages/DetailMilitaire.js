import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaChartBar, FaUser } from 'react-icons/fa';
import { militairesAPI, statistiquesAPI, affairesAPI, beneficiairesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import MilitaireForm from '../components/forms/MilitaireForm';
import BeneficiaireForm from '../components/forms/BeneficiaireForm';
import {
  HeaderCard,
  HeaderGrid,
  HeaderItem,
  HeaderLabel,
  HeaderValue,
  ArchiveNote
} from '../components/common/HeaderComponents';

const DetailMilitaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
      <Container>
        <PageHeader 
          title="Détails du militaire" 
          backButton
        />
        <Loading>Chargement des détails du militaire...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <PageHeader 
          title="Détails du militaire" 
          backButton
        />
        <Error>{error}</Error>
      </Container>
    );
  }
  
  return (
    <Container>
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
            <ActionButton onClick={() => setEditModalOpen(true)} title="Modifier le militaire">
              <FaEdit />
              <ButtonText>Modifier</ButtonText>
            </ActionButton>
            
            <ActionButton 
              onClick={() => setDeleteModalOpen(true)} 
              title="Supprimer le militaire"
              className="delete"
            >
              <FaTrash />
              <ButtonText>Supprimer</ButtonText>
            </ActionButton>
          </ActionButtons>
        }
      />
      
      <HeaderCard>
        <HeaderGrid>
          <HeaderItem>
            <HeaderLabel>Affaire</HeaderLabel>
            <AffaireLink onClick={() => navigateToAffaire(militaire.affaire._id)}>
              {militaire.affaire.nom}
            </AffaireLink>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Unité d'affectation</HeaderLabel>
            <HeaderValue>{militaire.unite}</HeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Région / Département</HeaderLabel>
            <HeaderValue>{militaire.region || '-'} / {militaire.departement || '-'}</HeaderValue>
          </HeaderItem>

          <HeaderItem>
            <HeaderLabel>Statut d'archivage</HeaderLabel>
            <StatusTag status={militaire.archive ? 'archived' : 'active'}>
              {militaire.archive ? 'Archivé' : 'Actif'}
            </StatusTag>
            {militaire.archive && (
              <ArchiveNote>
                Ce militaire est archivé car il fait partie d'une affaire archivée.
                Pour le désarchiver, veuillez désarchiver l'affaire correspondante.
              </ArchiveNote>
            )}
          </HeaderItem>
        </HeaderGrid>

        <HeaderGrid>
          <HeaderItem>
            <HeaderLabel>Circonstance</HeaderLabel>
            <HeaderValue>{militaire.circonstance}</HeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Statut</HeaderLabel>
            <StatusTag status={militaire.decede ? 'deces' : 'blesse'}>
              {militaire.decede ? 'Décédé' : 'Blessé'}
            </StatusTag>
          </HeaderItem>
          
          {!militaire.decede && (
            <HeaderItem>
              <HeaderLabel>Jours d'ITT</HeaderLabel>
              <HeaderValue>{militaire.itt || '0'} jours</HeaderValue>
            </HeaderItem>
          )}
        
          {militaire.natureDesBlessures && (
            <HeaderItem>
              <HeaderLabel>Nature des blessures</HeaderLabel>
              <HeaderValue>{militaire.natureDesBlessures}</HeaderValue>
            </HeaderItem>
          )}
        </HeaderGrid>
      </HeaderCard>
      
      {statistiques && (
        <StatsCard>
          <StatsHeader>
            <StatsTitle>
              <FaChartBar />
              <span>Statistiques</span>
            </StatsTitle>
          </StatsHeader>
          
          <StatsGrid>
            <StatsItem>
              <StatsLabel>Nombre de bénéficiaires</StatsLabel>
              <StatsValue>{statistiques.beneficiaires.total}</StatsValue>
              <StatsDetails>
                {Object.entries(statistiques.beneficiaires.parQualite).map(([qualite, nombre]) => (
                  <StatDetail key={qualite}>
                    <StatDetailLabel>{qualite} :</StatDetailLabel>
                    <StatDetailValue>{nombre}</StatDetailValue>
                  </StatDetail>
                ))}
              </StatsDetails>
            </StatsItem>
            
            <StatsItem>
              <StatsLabel>Total engagé</StatsLabel>
              <StatsValue>{statistiques.finances.montantGage.toLocaleString('fr-FR')} €</StatsValue>
              <StatsDetails>
                <StatDetail>
                  <StatDetailLabel>Conventions :</StatDetailLabel>
                  <StatDetailValue>{statistiques.finances.nombreConventions}</StatDetailValue>
                </StatDetail>
              </StatsDetails>
            </StatsItem>
            
            <StatsItem>
              <StatsLabel>Total payé</StatsLabel>
              <StatsValue>{statistiques.finances.montantPaye.toLocaleString('fr-FR')} €</StatsValue>
              <StatsDetails>
                <StatDetail>
                  <StatDetailLabel>Paiements :</StatDetailLabel>
                  <StatDetailValue>{statistiques.finances.nombrePaiements}</StatDetailValue>
                </StatDetail>
                <StatDetail>
                  <StatDetailLabel>Ratio :</StatDetailLabel>
                  <StatDetailValue>{statistiques.finances.ratio.toFixed(1)}%</StatDetailValue>
                </StatDetail>
              </StatsDetails>
            </StatsItem>
          </StatsGrid>
        </StatsCard>
      )}
      
      <Section>
        <SectionHeader>
          <SectionTitle>Bénéficiaires associés</SectionTitle>
          <AddButton onClick={() => setBeneficiaireModalOpen(true)}>
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
              >
                <BeneficiaireHeader>
                  <BeneficiaireNameContainer>
                    <BeneficiaireName>
                      <FaUser />
                      {beneficiaire.prenom} {beneficiaire.nom}
                    </BeneficiaireName>
                    <BeneficiaireQualite>{beneficiaire.qualite}</BeneficiaireQualite>
                  </BeneficiaireNameContainer>
                </BeneficiaireHeader>
                
                <BeneficiaireDetails>
                  <BeneficiaireDetail>
                    <DetailLabel>Avocats :</DetailLabel>
                    <DetailValue>
                      {beneficiaire.avocats && beneficiaire.avocats.length > 0
                        ? beneficiaire.avocats.map(a => {
                            return `${a.prenom || ''} ${a.nom || ''}`.trim() || 'Détails manquants';
                          }).join(', ')
                        : 'Aucun'}
                    </DetailValue>
                  </BeneficiaireDetail>
                  
                  <BeneficiaireDetail>
                    <DetailLabel>Conventions :</DetailLabel>
                    <DetailValue>
                      {beneficiaire.conventions && beneficiaire.conventions.length
                        ? beneficiaire.conventions.length
                        : 'Aucune'}
                    </DetailValue>
                  </BeneficiaireDetail>
                  
                  <BeneficiaireDetail>
                    <DetailLabel>Paiements :</DetailLabel>
                    <DetailValue>
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
          <EmptyMessage>Aucun bénéficiaire associé à ce militaire</EmptyMessage>
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
            <CancelButton onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={handleDelete}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent>
          <p>Êtes-vous sûr de vouloir supprimer définitivement ce militaire ?</p>
          <p><strong>Attention :</strong> Cette action supprimera également tous les bénéficiaires associés à ce militaire.</p>
          
          {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
`;

const AffaireLink = styled.div`
  font-size: 16px;
  color: #3f51b5;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => props.status === 'deces' ? `
    background-color: #ffebee;
    color: #c62828;
  ` : props.status === 'blesse' ? `
    background-color: #e8f5e9;
    color: #388e3c;
  ` : props.status === 'archived' ? `
    background-color: #f5f5f5;
    color: #757575;
  ` : props.status === 'active' ? `
    background-color: #e8f5e9;
    color: #388e3c;
  ` : ''}
`;

const StatsCard = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
`;

const StatsHeader = styled.div`
  margin-bottom: 16px;
`;

const StatsTitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  margin: 0;
  
  svg {
    margin-right: 8px;
    color: #3f51b5;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const StatsItem = styled.div``;

const StatsLabel = styled.div`
  font-size: 14px;
  color: #757575;
  margin-bottom: 4px;
`;

const StatsValue = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: #3f51b5;
  margin-bottom: 8px;
`;

const StatsDetails = styled.div`
  font-size: 14px;
`;

const StatDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
`;

const StatDetailLabel = styled.span`
  color: #757575;
`;

const StatDetailValue = styled.span`
  font-weight: 500;
  color: #333;
`;

const Section = styled.section`
  margin-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

const AddButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
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

const BeneficiairesList = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
`;

const BeneficiaireItem = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BeneficiaireHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
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
  color: #333;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #3f51b5;
    font-size: 16px;
  }
`;

const BeneficiaireQualite = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  padding: 4px 8px;
  background-color: #e3f2fd;
  color: #0d47a1;
  border-radius: 4px;
  height: 24px;
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
  color: #757575;
  min-width: 100px;
  margin-right: 10px;
`;

const DetailValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #757575;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background-color: #fff;
  color: #3f51b5;
  border: 1px solid #3f51b5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #3f51b5;
    color: #fff;
  }
  
  &.delete {
    color: #f44336;
    border-color: #f44336;
    
    &:hover {
      background-color: #f44336;
      color: #fff;
    }
  }
  
  svg {
    margin-right: 6px;
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const DeleteConfirmContent = styled.div`
  p {
    margin-bottom: 16px;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-top: 12px;
  font-size: 14px;
`;

const CancelButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const DeleteButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: #757575;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export default DetailMilitaire;