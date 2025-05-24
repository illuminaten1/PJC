import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaTrash, FaExchangeAlt, FaHistory, FaArrowLeft, FaGripVertical, FaSave } from 'react-icons/fa';
import { parametresAPI } from '../../utils/api';
import Modal from '../common/Modal';

const RedacteursTab = ({ showSuccessMessage, setErrorMessage, colors }) => {
  const [redacteurs, setRedacteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redacteurInput, setRedacteurInput] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ index: -1, value: '' });
  
  // États pour la réorganisation
  const [reordering, setReordering] = useState(false);
  const [hasReordered, setHasReordered] = useState(false);
  
  // États pour le modal de transfert de portefeuille
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceRedacteur, setSourceRedacteur] = useState('');
  const [targetRedacteur, setTargetRedacteur] = useState('');
  const [transferInProgress, setTransferInProgress] = useState(false);
  
  // États pour l'historique des transferts
  const [historiqueModeOpen, setHistoriqueModeOpen] = useState(false);
  const [historiqueTransferts, setHistoriqueTransferts] = useState([]);
  const [historiqueLoading, setHistoriqueLoading] = useState(false);

  useEffect(() => {
    fetchRedacteurs();
  }, []);

  const fetchRedacteurs = async () => {
    setLoading(true);
    try {
      const response = await parametresAPI.getAll();
      setRedacteurs(response.data.redacteurs || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des rédacteurs", err);
      setErrorMessage("Impossible de charger les rédacteurs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRedacteur = async () => {
    if (!redacteurInput.trim()) return;
    
    try {
      await parametresAPI.addValue('redacteurs', redacteurInput);
      setRedacteurInput('');
      showSuccessMessage('Rédacteur ajouté avec succès');
      fetchRedacteurs();
    } catch (err) {
      console.error("Erreur lors de l'ajout du rédacteur", err);
      setErrorMessage("Impossible d'ajouter le rédacteur");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRedacteur();
    }
  };

  const openDeleteConfirmation = (index, value) => {
    setItemToDelete({ index, value });
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await parametresAPI.deleteValue('redacteurs', itemToDelete.index);
      showSuccessMessage('Rédacteur supprimé avec succès');
      setConfirmModalOpen(false);
      fetchRedacteurs();
    } catch (err) {
      console.error(`Erreur lors de la suppression`, err);
      setErrorMessage("Impossible de supprimer le rédacteur");
      setConfirmModalOpen(false);
    }
  };

  // Fonction pour gérer la fin du drag & drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    
    const newRedacteurs = Array.from(redacteurs);
    const [reorderedItem] = newRedacteurs.splice(result.source.index, 1);
    newRedacteurs.splice(result.destination.index, 0, reorderedItem);
    
    setRedacteurs(newRedacteurs);
    setHasReordered(true);
  };

  // Fonction pour sauvegarder le nouvel ordre
  const saveReorderedValues = async () => {
    try {
      await parametresAPI.reorderValues('redacteurs', redacteurs);
      showSuccessMessage('Ordre des rédacteurs sauvegardé avec succès');
      setReordering(false);
      setHasReordered(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'ordre:', err);
      setErrorMessage('Impossible de sauvegarder l\'ordre des rédacteurs');
    }
  };

  // Ouvrir le modal de transfert de portefeuille
  const openTransferModal = () => {
    setSourceRedacteur('');
    setTargetRedacteur('');
    setTransferModalOpen(true);
  };

  // Effectuer le transfert de portefeuille
  const handleTransferPortfolio = async () => {
    if (!sourceRedacteur || !targetRedacteur || sourceRedacteur === targetRedacteur) {
      setErrorMessage("Veuillez sélectionner deux rédacteurs différents pour le transfert");
      return;
    }
    
    setTransferInProgress(true);
    
    try {
      const response = await parametresAPI.transferPortfolio(sourceRedacteur, targetRedacteur);
      const affairesModifiees = response.data?.affairesModifiees || 0;
      
      showSuccessMessage(`Portefeuille transféré avec succès de "${sourceRedacteur}" à "${targetRedacteur}". ${affairesModifiees} affaires modifiées.`);
      setTransferModalOpen(false);
    } catch (err) {
      console.error("Erreur lors du transfert de portefeuille", err);
      setErrorMessage("Impossible de transférer le portefeuille. Veuillez réessayer.");
    } finally {
      setTransferInProgress(false);
    }
  };

  // Ouvrir le mode historique et charger les données
  const openHistoriqueMode = async () => {
    setHistoriqueModeOpen(true);
    setHistoriqueLoading(true);
    
    try {
      const response = await parametresAPI.getTransferHistory();
      setHistoriqueTransferts(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique des transferts", err);
      setErrorMessage("Impossible de charger l'historique des transferts");
    } finally {
      setHistoriqueLoading(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <LoadingContainer colors={colors}>
        Chargement des rédacteurs...
      </LoadingContainer>
    );
  }

  // Affichage du mode historique
  if (historiqueModeOpen) {
    return (
      <Container>
        <HistoriqueHeader colors={colors}>
          <HistoriqueTitle colors={colors}>Historique des transferts de portefeuille (30 derniers jours)</HistoriqueTitle>
          <BackButton onClick={() => setHistoriqueModeOpen(false)} colors={colors}>
            <FaArrowLeft style={{ marginRight: '8px' }} />
            Retour aux rédacteurs
          </BackButton>
        </HistoriqueHeader>
        
        {historiqueLoading ? (
          <LoadingContainer colors={colors}>
            Chargement de l'historique...
          </LoadingContainer>
        ) : historiqueTransferts.length === 0 ? (
          <EmptyHistorique colors={colors}>
            Aucun transfert de portefeuille n'a été effectué durant les 30 derniers jours.
          </EmptyHistorique>
        ) : (
          <HistoriqueList>
            {historiqueTransferts.map((transfert, index) => (
              <HistoriqueItem key={index} status={transfert.statut} colors={colors}>
                <HistoriqueDate colors={colors}>{formatDate(transfert.dateTransfert)}</HistoriqueDate>
                <HistoriqueContent colors={colors}>
                  <div>
                    <strong>De:</strong> {transfert.sourceRedacteur}
                  </div>
                  <div>
                    <strong>Vers:</strong> {transfert.targetRedacteur}
                  </div>
                  <div>
                    <strong>Affaires modifiées:</strong> {transfert.affairesModifiees}
                  </div>
                  <div>
                    <strong>Statut:</strong> {transfert.statut}
                  </div>
                  {transfert.message && (
                    <HistoriqueMessage colors={colors}>
                      {transfert.message}
                    </HistoriqueMessage>
                  )}
                </HistoriqueContent>
              </HistoriqueItem>
            ))}
          </HistoriqueList>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Description colors={colors}>
        <strong>Important :</strong> Consultez la documentation avant de modifier les rédacteurs.
        Les rédacteurs sont utilisés pour assigner les affaires et générer les rapports.
      </Description>

      {/* En-tête de section avec bouton de réorganisation */}
      <SectionHeader>
        <SectionTitle colors={colors}>Liste des rédacteurs</SectionTitle>
        <HeaderButtons>
          <ReorderToggle 
            active={reordering}
            onClick={() => setReordering(!reordering)}
            colors={colors}
          >
            {reordering ? 'Annuler' : 'Réorganiser'}
          </ReorderToggle>
          
          {hasReordered && (
            <SaveOrderButton onClick={saveReorderedValues} colors={colors}>
              <FaSave style={{ marginRight: '8px' }} />
              Sauvegarder l'ordre
            </SaveOrderButton>
          )}
        </HeaderButtons>
      </SectionHeader>

      {/* Liste des rédacteurs avec drag & drop conditionnel */}
      {reordering ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="redacteurs-list">
            {(provided) => (
              <DraggableList
                {...provided.droppableProps}
                ref={provided.innerRef}
                colors={colors}
              >
                {redacteurs.map((redacteur, index) => (
                  <Draggable key={redacteur} draggableId={`redacteur-${redacteur}`} index={index}>
                    {(provided) => (
                      <DraggableItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        colors={colors}
                      >
                        <DragHandle {...provided.dragHandleProps} colors={colors}>
                          <FaGripVertical />
                        </DragHandle>
                        <RedacteurText colors={colors}>{redacteur}</RedacteurText>
                      </DraggableItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </DraggableList>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <RedacteursList>
          {redacteurs.map((redacteur, index) => (
            <RedacteurItem key={index} colors={colors}>
              <RedacteurText colors={colors}>{redacteur}</RedacteurText>
              <DeleteButton onClick={() => openDeleteConfirmation(index, redacteur)} colors={colors}>
                <FaTrash />
              </DeleteButton>
            </RedacteurItem>
          ))}
        </RedacteursList>
      )}
      
      {/* Formulaire d'ajout (masqué en mode réorganisation) */}
      {!reordering && (
        <AddForm>
          <AddInput
            type="text"
            value={redacteurInput}
            onChange={(e) => setRedacteurInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nouveau rédacteur..."
            colors={colors}
          />
          <AddButton onClick={handleAddRedacteur} colors={colors}>
            <FaPlus />
            <span>Ajouter</span>
          </AddButton>
        </AddForm>
      )}
      
      {/* Boutons pour le transfert et l'historique (masqués en mode réorganisation) */}
      {!reordering && (
        <ActionButtonsContainer>
          <TransferButton onClick={openTransferModal} colors={colors}>
            <FaExchangeAlt />
            <span>Transférer un portefeuille</span>
          </TransferButton>
          
          <HistoryButton onClick={openHistoriqueMode} colors={colors}>
            <FaHistory />
            <span>Voir l'historique des transferts</span>
          </HistoryButton>
        </ActionButtonsContainer>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Supprimer le rédacteur"
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setConfirmModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <DeleteConfirmButton onClick={handleConfirmDelete} colors={colors}>
              Supprimer
            </DeleteConfirmButton>
          </>
        }
      >
        <ConfirmContent colors={colors}>
          <p>
            Êtes-vous sûr de vouloir supprimer le rédacteur 
            <strong> "{itemToDelete.value}"</strong> ?
          </p>
          <WarningText colors={colors}>
            Ce rédacteur ne sera plus disponible pour les nouvelles affaires, mais les affaires existantes ne seront pas modifiées.
          </WarningText>
          <WarningText colors={colors}>
            Veuillez consulter la documentation avant de procéder à cette suppression.
          </WarningText>
        </ConfirmContent>
      </Modal>
      
      {/* Modal de transfert de portefeuille */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => !transferInProgress && setTransferModalOpen(false)}
        title="Transférer un portefeuille"
        size="medium"
        actions={
          <>
            <CancelButton 
              onClick={() => setTransferModalOpen(false)}
              disabled={transferInProgress}
              colors={colors}
            >
              Annuler
            </CancelButton>
            <ConfirmButton 
              onClick={handleTransferPortfolio}
              disabled={!sourceRedacteur || !targetRedacteur || sourceRedacteur === targetRedacteur || transferInProgress}
              colors={colors}
            >
              {transferInProgress ? 'Transfert en cours...' : 'Transférer'}
            </ConfirmButton>
          </>
        }
      >
        <TransferContent colors={colors}>
          <p>
            Cette opération va transférer tous les dossiers d'un rédacteur vers un autre.
            Les affaires assignées au rédacteur source seront réassignées au rédacteur cible.
          </p>
          
          <SelectGroup>
            <label>Rédacteur source (ancien):</label>
            <Select
              value={sourceRedacteur}
              onChange={(e) => setSourceRedacteur(e.target.value)}
              disabled={transferInProgress}
              colors={colors}
            >
              <option value="">Sélectionner un rédacteur</option>
              {redacteurs.map((redacteur, index) => (
                <option key={index} value={redacteur}>{redacteur}</option>
              ))}
            </Select>
          </SelectGroup>
          
          <SelectGroup>
            <label>Rédacteur cible (nouveau):</label>
            <Select
              value={targetRedacteur}
              onChange={(e) => setTargetRedacteur(e.target.value)}
              disabled={transferInProgress}
              colors={colors}
            >
              <option value="">Sélectionner un rédacteur</option>
              {redacteurs.map((redacteur, index) => (
                <option key={index} value={redacteur}>{redacteur}</option>
              ))}
            </Select>
          </SelectGroup>
          
          <WarningText colors={colors}>
            Cette opération est irréversible. Assurez-vous d'avoir sélectionné les bons rédacteurs.
          </WarningText>
          
          {sourceRedacteur === targetRedacteur && sourceRedacteur !== '' && (
            <ErrorText colors={colors}>
              Les rédacteurs source et cible doivent être différents.
            </ErrorText>
          )}
        </TransferContent>
      </Modal>
    </Container>
  );
};

// Styles avec thématisation
const Container = styled.div``;

const LoadingContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const Description = styled.div`
  padding: 16px;
  background-color: ${props => props.colors.warningBg};
  color: ${props => props.colors.textPrimary};
  border-radius: 4px;
  margin-bottom: 24px;
  border-left: 4px solid ${props => props.colors.warning};
  transition: all 0.3s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ReorderToggle = styled.button`
  background-color: ${props => props.active ? props.colors.error : props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? props.colors.error + 'dd' : props.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const SaveOrderButton = styled.button`
  background-color: ${props => props.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const RedacteursList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const RedacteurItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 6px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
`;

const RedacteurText = styled.span`
  font-size: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  flex: 1;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.colors.error};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.errorBg};
    transform: scale(1.1);
  }
`;

const AddForm = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const AddInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 1px ${props => props.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.colors.textMuted};
  }
`;

const AddButton = styled.button`
  background-color: ${props => props.colors.success};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
`;

const TransferButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const HistoryButton = styled.button`
  background-color: ${props => props.colors.textMuted};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.textSecondary};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

// Styles pour le drag & drop
const DraggableList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const DraggableItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 6px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
  }
`;

const DragHandle = styled.div`
  color: ${props => props.colors.textMuted};
  cursor: grab;
  margin-right: 12px;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  
  &:active {
    cursor: grabbing;
  }
  
  &:hover {
    color: ${props => props.colors.primary};
  }
`;

// Styles pour l'historique
const HistoriqueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HistoriqueTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const BackButton = styled.button`
  background-color: ${props => props.colors.success};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const HistoriqueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HistoriqueItem = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: ${props => props.colors.shadow};
  border-left: 5px solid ${props => props.status === 'succès' ? props.colors.success : props.colors.error};
  background-color: ${props => props.colors.surface};
  transition: all 0.3s ease;
`;

const HistoriqueDate = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  padding: 12px 16px;
  font-weight: 500;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  border-bottom: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const HistoriqueContent = styled.div`
  padding: 16px;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
  
  div {
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
    transition: color 0.3s ease;
  }
  
  strong {
    margin-right: 8px;
    color: ${props => props.colors.textPrimary};
  }
  
  div:last-child {
    margin-bottom: 0;
  }
`;

const HistoriqueMessage = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: ${props => props.colors.background};
  border-radius: 4px;
  font-style: italic;
  color: ${props => props.colors.textMuted};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const EmptyHistorique = styled.div`
  padding: 40px;
  text-align: center;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  color: ${props => props.colors.textMuted};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

// Styles pour les modals
const ConfirmContent = styled.div`
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 16px;
    line-height: 1.6;
  }
`;

const TransferContent = styled.div`
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 20px;
    line-height: 1.6;
  }
`;

const SelectGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: ${props => props.colors?.textPrimary || '#333'};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 1px ${props => props.colors.primary};
  }
  
  &:disabled {
    background-color: ${props => props.colors.background};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const WarningText = styled.p`
  color: ${props => props.colors.warning};
  font-size: 14px;
  margin-bottom: 8px;
  transition: color 0.3s ease;
`;

const ErrorText = styled.p`
  color: ${props => props.colors.error};
  font-size: 14px;
  margin-top: 8px;
  transition: color 0.3s ease;
`;

const CancelButton = styled.button`
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.colors.surfaceHover};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteConfirmButton = styled.button`
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
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const ConfirmButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default RedacteursTab;