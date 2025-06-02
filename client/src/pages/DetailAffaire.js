import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArchive, FaTrash, FaChartBar, FaStickyNote, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { affairesAPI, statistiquesAPI, documentsAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import AffaireForm from '../components/forms/AffaireForm';
import AffaireTree from '../components/specific/AffaireTree';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
import SyntheseDropdownButton from '../components/specific/SyntheseDropdownButton';
import { MarkdownEditor, MarkdownDisplay } from '../components/common/MarkdownEditor';
import { useTheme } from '../contexts/ThemeContext';
import {
  ThemedHeaderCard,
  HeaderGrid,
  HeaderItem,
  ThemedHeaderLabel,
  ThemedHeaderValue,
  HeaderFullWidth,
  ThemedArchiveNote
} from '../components/common/HeaderComponents';

const DetailAffaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  
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
      // Utiliser archive au lieu de toggleArchive
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
  
  const handleGenerateSynthese = async (format = 'pdf') => {
    try {
      // Afficher un message pour informer l'utilisateur
      setLoading(true);
      
      // Appeler l'API pour générer la synthèse avec le format spécifié
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
      <Container colors={colors}>
        <PageHeader 
          title="Détails de l'affaire" 
          backButton
        />
        <Loading colors={colors}>Chargement des détails de l'affaire...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container colors={colors}>
        <PageHeader 
          title="Détails de l'affaire" 
          backButton
        />
        <Error colors={colors}>{error}</Error>
      </Container>
    );
  }

  return (
    <Container colors={colors}>
      <PageHeader 
        title={affaire.nom}
        subtitle={`Affaire créée le ${new Date(affaire.dateCreation).toLocaleDateString('fr-FR')}`}
        backButton
        actionButton={
          <ActionButtons>
            <ActionButton onClick={() => setEditModalOpen(true)} title="Modifier l'affaire" colors={colors}>
              <FaEdit />
              <ButtonText>Modifier</ButtonText>
            </ActionButton>
            
            <ActionButton 
              onClick={handleArchiveToggle} 
              title={affaire.archive ? "Désarchiver l'affaire et tous ses éléments" : "Archiver l'affaire et tous ses éléments"}
              colors={colors}
              className={affaire.archive ? "archived" : ""}
            >
              <FaArchive />
              <ButtonText>{affaire.archive ? "Désarchiver tout" : "Archiver tout"}</ButtonText>
            </ActionButton>

            <SyntheseDropdownButton onGenerateSynthese={handleGenerateSynthese} />
            
            <ActionButton 
              onClick={() => setDeleteModalOpen(true)} 
              title="Supprimer l'affaire"
              className="delete"
              colors={colors}
            >
              <FaTrash />
              <ButtonText>Supprimer</ButtonText>
            </ActionButton>
          </ActionButtons>
        }
      />
      
      <ResponsiveHeaderCard>
        <HeaderFullWidth>
          <ThemedHeaderLabel>Description</ThemedHeaderLabel>
          <ThemedHeaderValue>{affaire.description || 'Aucune description'}</ThemedHeaderValue>
        </HeaderFullWidth>
        
        <ResponsiveHeaderGrid>
          <HeaderItem>
            <ThemedHeaderLabel>Lieu</ThemedHeaderLabel>
            <ThemedHeaderValue>{affaire.lieu || 'Non spécifié'}</ThemedHeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Date des faits</ThemedHeaderLabel>
            <ThemedHeaderValue>{formatDateFaits(affaire.dateFaits)}</ThemedHeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Rédacteur</ThemedHeaderLabel>
            <ThemedHeaderValue>{affaire.redacteur}</ThemedHeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Statut</ThemedHeaderLabel>
            <StatusTag status={affaire.archive ? 'archived' : 'active'} colors={colors}>
              {affaire.archive ? 'Archivé' : 'Actif'}
            </StatusTag>
            {affaire.archive && (
              <ThemedArchiveNote>
                Cette affaire est archivée. Tous les militaires et bénéficiaires associés sont également archivés.
              </ThemedArchiveNote>
            )}
          </HeaderItem>
        </ResponsiveHeaderGrid>
      </ResponsiveHeaderCard>

      {/* Section Notes */}
      <Section colors={colors}>
        <ResponsiveSectionHeader>
          <SectionTitle colors={colors}>
            <FaStickyNote />
            <span>Notes du dossier</span>
          </SectionTitle>
          <ResponsiveSectionActions>
            {editingNotes ? (
              <>
                <ActionButton 
                  onClick={handleNotesSave} 
                  disabled={notesUpdating}
                  title="Enregistrer les modifications"
                  colors={colors}
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
                  colors={colors}
                >
                  Annuler
                </ActionButton>
              </>
            ) : (
              <ActionButton 
                onClick={() => setEditingNotes(true)} 
                title="Modifier les notes"
                colors={colors}
              >
                <FaEdit />
                <ButtonText>Modifier les notes</ButtonText>
              </ActionButton>
            )}
          </ResponsiveSectionActions>
        </ResponsiveSectionHeader>
        
        <ResponsiveNotesContainer colors={colors}>
          {editingNotes ? (
            <MarkdownEditor 
              value={notes} 
              onChange={handleNotesChange} 
              placeholder="Saisissez vos notes ici... (supporte le formatage Markdown)"
              key="notes-editor"
            />
          ) : (
            <MarkdownDisplay content={notes} />
          )}
        </ResponsiveNotesContainer>
      </Section>
      
      <Section colors={colors}>
        <ResponsiveSectionHeader>
          <SectionTitle colors={colors}>Structure de l'affaire</SectionTitle>
        </ResponsiveSectionHeader>
        
        <ResponsiveTreeContainer>
          <AffaireTree 
            affaireId={id} 
            onUpdate={() => {
              fetchAffaire();
              fetchStatistiques();
            }}
          />
        </ResponsiveTreeContainer>
      </Section>
      
      {statistiques && (
        <Section colors={colors}>
          <ResponsiveSectionHeader>
            <SectionTitle colors={colors}>
              <FaChartBar />
              <span>Statistiques de l'affaire</span>
            </SectionTitle>
          </ResponsiveSectionHeader>
          
          <ResponsiveStatsGrid>
            <StatsCard colors={colors}>
              <StatsTitle colors={colors}>Militaires</StatsTitle>
              <StatsValue colors={colors}>{statistiques.militaires.total}</StatsValue>
              <StatsDetails colors={colors}>
                <StatDetail>
                  <StatDetailLabel colors={colors}>Blessés :</StatDetailLabel>
                  <StatDetailValue colors={colors}>{statistiques.militaires.blesses}</StatDetailValue>
                </StatDetail>
                <StatDetail>
                  <StatDetailLabel colors={colors}>Décédés :</StatDetailLabel>
                  <StatDetailValue colors={colors}>{statistiques.militaires.decedes}</StatDetailValue>
                </StatDetail>
              </StatsDetails>
            </StatsCard>
            
            <StatsCard colors={colors}>
              <StatsTitle colors={colors}>Bénéficiaires</StatsTitle>
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
              <StatsTitle colors={colors}>Finances</StatsTitle>
              <ResponsiveStatsValue colors={colors}>
                {statistiques.finances.montantGage.toLocaleString('fr-FR')} € HT
              </ResponsiveStatsValue>
              <StatsDetails colors={colors}>
                <StatDetail>
                  <StatDetailLabel colors={colors}>Engagé :</StatDetailLabel>
                  <ResponsiveStatDetailValue colors={colors}>
                    {statistiques.finances.montantGage.toLocaleString('fr-FR')} € HT
                  </ResponsiveStatDetailValue>
                </StatDetail>
                <StatDetail>
                  <StatDetailLabel colors={colors}>Payé :</StatDetailLabel>
                  <ResponsiveStatDetailValue colors={colors}>
                    {statistiques.finances.montantPaye.toLocaleString('fr-FR')} € TTC
                  </ResponsiveStatDetailValue>
                </StatDetail>
                <StatDetail>
                  <StatDetailLabel colors={colors}>Ratio :</StatDetailLabel>
                  <StatDetailValue colors={colors}>{statistiques.finances.ratio.toFixed(1)}%</StatDetailValue>
                </StatDetail>
              </StatsDetails>
            </StatsCard>
          </ResponsiveStatsGrid>
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
            <CancelButton onClick={() => setDeleteModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={handleDelete} colors={colors}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent colors={colors}>
          <p>Êtes-vous sûr de vouloir supprimer définitivement cette affaire ?</p>
          <p><strong>Attention :</strong> Cette action supprimera également tous les militaires et bénéficiaires associés à cette affaire.</p>
          
          {deleteError && <ErrorMessage colors={colors}>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>
    </Container>
  );
};

// Styled Components avec thématisation complète et responsivité
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const ResponsiveHeaderCard = styled(ThemedHeaderCard)`
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    padding: 12px;
  }
`;

const ResponsiveHeaderGrid = styled(HeaderGrid)`
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const ResponsiveNotesContainer = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
  
  .CodeMirror {
    height: 250px;
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
    
    @media (max-width: 768px) {
      height: 200px;
    }
    
    @media (max-width: 480px) {
      height: 150px;
      font-size: 14px;
    }
    
    .CodeMirror-cursor {
      border-left: 1px solid ${props => props.colors.primary};
    }
    
    .CodeMirror-selected {
      background-color: ${props => props.colors.primary}20;
    }
    
    .CodeMirror-gutters {
      background-color: ${props => props.colors.surfaceHover};
      border-right: 1px solid ${props => props.colors.borderLight};
    }
    
    .CodeMirror-linenumber {
      color: ${props => props.colors.textMuted};
    }
  }
  
  .markdown-display {
    padding: 20px;
    color: ${props => props.colors.textPrimary};
    
    @media (max-width: 768px) {
      padding: 16px;
    }
    
    @media (max-width: 480px) {
      padding: 12px;
      font-size: 14px;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: ${props => props.colors.textPrimary};
      border-bottom-color: ${props => props.colors.borderLight};
      
      @media (max-width: 480px) {
        font-size: 1.2em;
      }
    }
    
    code {
      background-color: ${props => props.colors.surfaceHover};
      color: ${props => props.colors.textPrimary};
      border: 1px solid ${props => props.colors.borderLight};
      font-size: 0.9em;
      
      @media (max-width: 480px) {
        font-size: 0.8em;
      }
    }
    
    pre {
      background-color: ${props => props.colors.surfaceHover};
      border: 1px solid ${props => props.colors.borderLight};
      overflow-x: auto;
    }
    
    blockquote {
      border-left-color: ${props => props.colors.primary};
      background-color: ${props => props.colors.surfaceHover};
    }
  }
`;

const ResponsiveTreeContainer = styled.div`
  @media (max-width: 768px) {
    overflow-x: auto;
    
    /* Styles pour améliorer l'affichage de l'arbre sur mobile */
    .tree-container {
      min-width: 600px;
    }
  }
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 3px 6px;
  }
  
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
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding: 12px;
  }
`;

const ResponsiveSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.colors ? props.colors.borderLight : '#e0e0e0'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    padding-bottom: 8px;
    gap: 8px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  display: flex;
  align-items: center;
  margin: 0;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.primary};
    
    @media (max-width: 480px) {
      margin-right: 6px;
      font-size: 14px;
    }
  }
`;

const ResponsiveSectionActions = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    flex-wrap: wrap;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 4px;
    width: 100%;
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
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0 8px;
    height: 32px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    height: 40px;
    width: 100%;
    font-size: 13px;
  }
  
  &:hover:not(:disabled) {
    background-color: ${props => props.colors.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  &.archived {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.textMuted};
    border-color: ${props => props.colors.textMuted};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.colors.textMuted};
      color: white;
    }
  }
  
  &.delete {
    color: ${props => props.colors.error};
    border-color: ${props => props.colors.error};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.colors.error};
      color: white;
    }
  }
  
  &.cancel {
    color: ${props => props.colors.textSecondary};
    border-color: ${props => props.colors.textSecondary};
    
    &:hover:not(:disabled) {
      background-color: ${props => props.colors.textSecondary};
      color: white;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    margin-right: 6px;
    
    @media (max-width: 480px) {
      margin-right: 4px;
      font-size: 12px;
    }
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
  
  @media (max-width: 320px) {
    display: none;
  }
`;

const ResponsiveStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const StatsCard = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  padding: 20px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
  
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
  
  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 6px;
  }
`;

const StatsValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.colors.primary};
  margin-bottom: 16px;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 10px;
  }
`;

const ResponsiveStatsValue = styled(StatsValue)`
  @media (max-width: 480px) {
    font-size: 16px;
    word-break: break-all;
  }
  
  @media (max-width: 320px) {
    font-size: 14px;
  }
`;

const StatsDetails = styled.div`
  border-top: 1px solid ${props => props.colors.borderLight};
  padding-top: 12px;
  
  @media (max-width: 480px) {
    padding-top: 8px;
  }
`;

const StatDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 6px;
  }
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

const ResponsiveStatDetailValue = styled(StatDetailValue)`
  @media (max-width: 480px) {
    word-break: break-all;
  }
`;

const DeleteConfirmContent = styled.div`
  p {
    margin-bottom: 16px;
    color: ${props => props.colors.textPrimary};
    transition: color 0.3s ease;
    
    @media (max-width: 480px) {
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    strong {
      color: ${props => props.colors.error};
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
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 6px 10px;
    margin-top: 8px;
  }
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
  
  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 14px;
  }
  
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
  
  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 14px;
  }
  
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
  
  @media (max-width: 768px) {
    padding: 30px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    font-size: 13px;
  }
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
  
  @media (max-width: 768px) {
    padding: 16px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    font-size: 13px;
  }
`;

export default DetailAffaire;