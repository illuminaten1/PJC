import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArchive, FaTrash, FaChartBar, FaStickyNote, FaFileAlt } from 'react-icons/fa';
import { affairesAPI, statistiquesAPI, documentsAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import AffaireForm from '../components/forms/AffaireForm';
import AffaireTree from '../components/specific/AffaireTree';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
import { MarkdownEditor, MarkdownDisplay } from '../components/common/MarkdownEditor';
import {
  HeaderCard,
  HeaderGrid,
  HeaderItem,
  HeaderLabel,
  HeaderValue,
  HeaderFullWidth,
  ArchiveNote
} from '../components/common/HeaderComponents';

const DetailAffaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [affaire, setAffaire] = useState(null);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesUpdating, setNotesUpdating] = useState(false);
  
  useEffect(() => {
    fetchAffaire();
    fetchStatistiques();
  }, [id]);
  
  useEffect(() => {
    if (affaire) {
      setNotes(affaire.notes || '');
    }
  }, [affaire]);
  
  const fetchAffaire = async () => {
    setLoading(true);
    try {
      const response = await affairesAPI.getById(id);
      setAffaire(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'affaire", err);
      setError("Impossible de charger les détails de l'affaire");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStatistiques = async () => {
    try {
      const response = await statistiquesAPI.getByAffaire(id);
      setStatistiques(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques", err);
      // Ne pas bloquer l'affichage de la page si les statistiques échouent
    }
  };
  
  const handleEditAffaire = async (data) => {
    try {
      await affairesAPI.update(id, data);
      setEditModalOpen(false);
      fetchAffaire();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'affaire", err);
      // Gérer l'erreur
    }
  };
  
  const handleArchiveToggle = async () => {
    try {
      const newStatus = !affaire.archive;
      await affairesAPI.archive(id, newStatus);
      setAffaire(prev => ({
        ...prev,
        archive: newStatus
      }));
    } catch (err) {
      console.error("Erreur lors de l'archivage/désarchivage de l'affaire", err);
      // Gérer l'erreur
    }
  };
  
  const handleDelete = async () => {
    try {
      await affairesAPI.delete(id);
      navigate('/affaires');
    } catch (err) {
      console.error("Erreur lors de la suppression de l'affaire:", err);
      setDeleteError("Erreur lors de la suppression");
    }
  };
  
  const handleNotesChange = useCallback((e) => {
    setNotes(e.target.value);
  }, []);
  
  const handleNotesSave = async () => {
    setNotesUpdating(true);
    try {
      await affairesAPI.update(id, { notes });
      setEditingNotes(false);
      
      // Mettre à jour l'objet affaire local avec les nouvelles notes
      setAffaire(prev => ({
        ...prev,
        notes
      }));
    } catch (err) {
      console.error("Erreur lors de la mise à jour des notes", err);
    } finally {
      setNotesUpdating(false);
    }
  };
  
  const formatDateFaits = (date) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR');
  };
  
  const handleGenerateSynthese = async () => {
    try {
      // Afficher un message pour informer l'utilisateur
      setLoading(true);
      
      // Définir le format souhaité (pdf ou odt)
      const format = 'pdf'; // Vous pourriez ajouter une option dans l'interface pour choisir
      
      // Appeler l'API pour générer la synthèse
      const response = await documentsAPI.genererSyntheseAffaire(id, format);
      
      // Créer un URL pour le blob reçu
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Créer un lien temporaire pour le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `synthese_${affaire.nom.replace(/\s+/g, '_')}.${format}`);
      
      // Ajouter le lien au document, cliquer dessus puis le supprimer
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erreur lors de la génération de la synthèse", err);
      // Afficher un message d'erreur à l'utilisateur
      alert("Erreur lors de la génération de la synthèse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <PageHeader 
          title="Détails de l'affaire" 
          backButton
        />
        <Loading>Chargement des détails de l'affaire...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <PageHeader 
          title="Détails de l'affaire" 
          backButton
        />
        <Error>{error}</Error>
      </Container>
    );
  }
  
  return (
    <Container>
      <PageHeader 
        title={affaire.nom}
        subtitle={`Affaire créée le ${new Date(affaire.dateCreation).toLocaleDateString('fr-FR')}`}
        backButton
        actionButton={
          <ActionButtons>
            <ActionButton onClick={() => setEditModalOpen(true)} title="Modifier l'affaire">
              <FaEdit />
              <ButtonText>Modifier</ButtonText>
            </ActionButton>
            
            <ActionButton 
              onClick={handleArchiveToggle} 
              title={affaire.archive ? "Désarchiver l'affaire et tous ses éléments" : "Archiver l'affaire et tous ses éléments"}
            >
              <FaArchive />
              <ButtonText>{affaire.archive ? "Désarchiver tout" : "Archiver tout"}</ButtonText>
            </ActionButton>

            {/* Nouveau bouton pour générer la synthèse */}
            <ActionButton 
              onClick={handleGenerateSynthese} 
              title="Générer une synthèse complète de l'affaire"
            >
              <FaFileAlt />
              <ButtonText>Synthèse</ButtonText>
            </ActionButton>
            
            <ActionButton 
              onClick={() => setDeleteModalOpen(true)} 
              title="Supprimer l'affaire"
              className="delete"
            >
              <FaTrash />
              <ButtonText>Supprimer</ButtonText>
            </ActionButton>
          </ActionButtons>
        }
      />
      
      <HeaderCard>
        <HeaderFullWidth>
          <HeaderLabel>Description</HeaderLabel>
          <HeaderValue>{affaire.description || 'Aucune description'}</HeaderValue>
        </HeaderFullWidth>
        
        <HeaderGrid>
          <HeaderItem>
            <HeaderLabel>Lieu</HeaderLabel>
            <HeaderValue>{affaire.lieu || 'Non spécifié'}</HeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Date des faits</HeaderLabel>
            <HeaderValue>{formatDateFaits(affaire.dateFaits)}</HeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Rédacteur</HeaderLabel>
            <HeaderValue>{affaire.redacteur}</HeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Statut</HeaderLabel>
            <StatusTag status={affaire.archive ? 'archived' : 'active'}>
              {affaire.archive ? 'Archivé' : 'Actif'}
            </StatusTag>
            {affaire.archive && (
              <ArchiveNote>
                Cette affaire est archivée. Tous les militaires et bénéficiaires associés sont également archivés.
              </ArchiveNote>
            )}
          </HeaderItem>
        </HeaderGrid>
      </HeaderCard>
      
      {/* Section Notes */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FaStickyNote />
            <span>Notes du dossier</span>
          </SectionTitle>
          <SectionActions>
            {editingNotes ? (
              <>
                <ActionButton 
                  onClick={handleNotesSave} 
                  disabled={notesUpdating}
                  title="Enregistrer les modifications"
                >
                  {notesUpdating ? 'Enregistrement...' : 'Enregistrer'}
                </ActionButton>
                <ActionButton 
                  onClick={() => {
                    setNotes(affaire.notes || '');
                    setEditingNotes(false);
                  }}
                  disabled={notesUpdating}
                  title="Annuler les modifications"
                  className="cancel"
                >
                  Annuler
                </ActionButton>
              </>
            ) : (
              <ActionButton 
                onClick={() => setEditingNotes(true)} 
                title="Modifier les notes"
              >
                <FaEdit />
                <ButtonText>Modifier les notes</ButtonText>
              </ActionButton>
            )}
          </SectionActions>
        </SectionHeader>
        
        <NotesContainer>
          {editingNotes ? (
            <MarkdownEditor 
              value={notes} 
              onChange={handleNotesChange} 
              placeholder="Saisissez vos notes ici... (supporte le formatage Markdown)"
              key="notes-editor" // Clé pour forcer la recréation de l'éditeur
            />
          ) : (
            <MarkdownDisplay content={notes} />
          )}
        </NotesContainer>
      </Section>
      
      <Section>
        <SectionHeader>
          <SectionTitle>Structure de l'affaire</SectionTitle>
        </SectionHeader>
        
        <AffaireTree 
          affaireId={id} 
          onUpdate={() => {
            fetchAffaire();
            fetchStatistiques();
          }}
        />
      </Section>
      
      {statistiques && (
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FaChartBar />
              <span>Statistiques de l'affaire</span>
            </SectionTitle>
          </SectionHeader>
          
          <StatsGrid>
            <StatsCard>
              <StatsTitle>Militaires</StatsTitle>
              <StatsValue>{statistiques.militaires.total}</StatsValue>
              <StatsDetails>
                <StatDetail>
                  <StatDetailLabel>Blessés :</StatDetailLabel>
                  <StatDetailValue>{statistiques.militaires.blesses}</StatDetailValue>
                </StatDetail>
                <StatDetail>
                  <StatDetailLabel>Décédés :</StatDetailLabel>
                  <StatDetailValue>{statistiques.militaires.decedes}</StatDetailValue>
                </StatDetail>
              </StatsDetails>
            </StatsCard>
            
            <StatsCard>
              <StatsTitle>Bénéficiaires</StatsTitle>
              <StatsValue>{statistiques.beneficiaires.total}</StatsValue>
              <StatsDetails>
                {Object.entries(statistiques.beneficiaires.parQualite).map(([qualite, nombre]) => (
                  <StatDetail key={qualite}>
                    <StatDetailLabel>{qualite} :</StatDetailLabel>
                    <StatDetailValue>{nombre}</StatDetailValue>
                  </StatDetail>
                ))}
              </StatsDetails>
            </StatsCard>
            
            <StatsCard>
              <StatsTitle>Finances</StatsTitle>
              <StatsValue>{statistiques.finances.montantGage.toLocaleString('fr-FR')} € HT</StatsValue>
              <StatsDetails>
                <StatDetail>
                  <StatDetailLabel>Engagé :</StatDetailLabel>
                  <StatDetailValue>{statistiques.finances.montantGage.toLocaleString('fr-FR')} € HT</StatDetailValue>
                </StatDetail>
                <StatDetail>
                  <StatDetailLabel>Payé :</StatDetailLabel>
                  <StatDetailValue>{statistiques.finances.montantPaye.toLocaleString('fr-FR')} € TTC</StatDetailValue>
                </StatDetail>
                <StatDetail>
                  <StatDetailLabel>Ratio :</StatDetailLabel>
                  <StatDetailValue>{statistiques.finances.ratio.toFixed(1)}%</StatDetailValue>
                </StatDetail>
              </StatsDetails>
            </StatsCard>
          </StatsGrid>
        </Section>
      )}
      
      {/* Modal de modification */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier l'affaire"
        size="large"
      >
        <AffaireForm 
          onSubmit={handleEditAffaire}
          initialData={affaire}
          isEditing
        />
      </Modal>
      
      {/* Modal de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer l'affaire"
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
          <p>Êtes-vous sûr de vouloir supprimer définitivement cette affaire ?</p>
          <p><strong>Attention :</strong> Cette action supprimera également tous les militaires et bénéficiaires associés à cette affaire.</p>
          
          {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
`;

const NotesContainer = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
  
  .CodeMirror {
    height: 250px;
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
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #3f51b5;
  }
`;

const SectionActions = styled.div`
  display: flex;
  gap: 8px;
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
  
  &.archived {
    background-color: #f5f5f5;
    color: #757575;
    border-color: #757575;
    
    &:hover {
      background-color: #757575;
      color: #fff;
    }
  }
  
  &.delete {
    color: #f44336;
    border-color: #f44336;
    
    &:hover {
      background-color: #f44336;
      color: #fff;
    }
  }
  
  &.cancel {
    color: #757575;
    border-color: #757575;
    
    &:hover {
      background-color: #757575;
      color: #fff;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 6px;
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatsCard = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const StatsTitle = styled.div`
  font-size: 14px;
  color: #757575;
  margin-bottom: 8px;
`;

const StatsValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #3f51b5;
  margin-bottom: 16px;
`;

const StatsDetails = styled.div`
  border-top: 1px solid #eee;
  padding-top: 12px;
`;

const StatDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 14px;
`;

const StatDetailLabel = styled.span`
  color: #757575;
`;

const StatDetailValue = styled.span`
  font-weight: 500;
  color: #333;
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

export default DetailAffaire;