import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaTrash, FaGripVertical, FaSave } from 'react-icons/fa';
import { parametresAPI } from '../../utils/api';
import Modal from '../common/Modal';

const SimpleListTab = ({ 
  apiKey, 
  title, 
  placeholder, 
  showSuccessMessage, 
  setErrorMessage, 
  colors,
  canReorder = false 
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ index: -1, value: '' });
  
  // États pour la réorganisation
  const [reordering, setReordering] = useState(false);
  const [hasReordered, setHasReordered] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [apiKey]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await parametresAPI.getAll();
      setItems(response.data[apiKey] || []);
    } catch (err) {
      console.error(`Erreur lors de la récupération des ${title.toLowerCase()}`, err);
      setErrorMessage(`Impossible de charger les ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    
    try {
      await parametresAPI.addValue(apiKey, inputValue);
      setInputValue('');
      showSuccessMessage(`${title.slice(0, -1)} ajouté${title.slice(-1) === 's' ? 'e' : ''} avec succès`);
      fetchItems();
    } catch (err) {
      console.error(`Erreur lors de l'ajout`, err);
      setErrorMessage(`Impossible d'ajouter l'élément : ${title.slice(0, -1).toLowerCase()}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const openDeleteConfirmation = (index, value) => {
    setItemToDelete({ index, value });
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await parametresAPI.deleteValue(apiKey, itemToDelete.index);
      showSuccessMessage(`${title.slice(0, -1)} supprimé${title.slice(-1) === 's' ? 'e' : ''} avec succès`);
      setConfirmModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(`Erreur lors de la suppression`, err);
      setErrorMessage(`Impossible de supprimer ${title.slice(0, -1).toLowerCase()}`);
      setConfirmModalOpen(false);
    }
  };

  // Fonction pour gérer la fin du drag & drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    setItems(newItems);
    setHasReordered(true);
  };

  // Fonction pour sauvegarder le nouvel ordre
  const saveReorderedValues = async () => {
    try {
      await parametresAPI.reorderValues(apiKey, items);
      showSuccessMessage(`Ordre des ${title.toLowerCase()} sauvegardé avec succès`);
      setReordering(false);
      setHasReordered(false);
    } catch (err) {
      console.error(`Erreur lors de la sauvegarde de l'ordre:`, err);
      setErrorMessage(`Impossible de sauvegarder l'ordre des ${title.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <LoadingContainer colors={colors}>
        Chargement des {title.toLowerCase()}...
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Description colors={colors}>
        <strong>Important :</strong> Consultez la documentation avant de modifier les {title.toLowerCase()}.
        Les modifications peuvent affecter les formulaires et les rapports existants.
      </Description>

      {canReorder && (
        <SectionHeader>
          <SectionTitle colors={colors}>Liste des {title.toLowerCase()}</SectionTitle>
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
        </SectionHeader>
      )}
      
      {canReorder && reordering ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`${apiKey}-list`}>
            {(provided) => (
              <DraggableList
                {...provided.droppableProps}
                ref={provided.innerRef}
                colors={colors}
              >
                {items.map((item, index) => (
                  <Draggable key={item} draggableId={`${apiKey}-${item}`} index={index}>
                    {(provided) => (
                      <DraggableItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        colors={colors}
                      >
                        <DragHandle {...provided.dragHandleProps} colors={colors}>
                          <FaGripVertical />
                        </DragHandle>
                        <ItemText colors={colors}>{item}</ItemText>
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
        <ItemsList>
          {items.map((item, index) => (
            <ItemRow key={index} colors={colors}>
              <ItemText colors={colors}>{item}</ItemText>
              <DeleteButton onClick={() => openDeleteConfirmation(index, item)} colors={colors}>
                <FaTrash />
              </DeleteButton>
            </ItemRow>
          ))}
        </ItemsList>
      )}
      
      {(!canReorder || !reordering) && (
        <AddForm>
          <AddInput
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            colors={colors}
          />
          <AddButton onClick={handleAdd} colors={colors}>
            <FaPlus />
            <span>Ajouter</span>
          </AddButton>
        </AddForm>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={`Supprimer ${title.slice(0, -1).toLowerCase()}`}
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
            Êtes-vous sûr de vouloir supprimer 
            <strong> "{itemToDelete.value}"</strong> ?
          </p>
          <WarningText colors={colors}>
            Cet élément ne sera plus disponible pour les nouvelles affaires, mais les affaires existantes ne seront pas modifiées.
          </WarningText>
          <WarningText colors={colors}>
            Veuillez consulter la documentation avant de procéder à cette suppression.
          </WarningText>
        </ConfirmContent>
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

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const ItemRow = styled.div`
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

const ItemText = styled.span`
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
  margin-top: 16px;
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

const ConfirmContent = styled.div`
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 16px;
    line-height: 1.6;
  }
`;

const WarningText = styled.p`
  color: ${props => props.colors.warning};
  font-size: 14px;
  margin-bottom: 8px;
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
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    transform: translateY(-1px);
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

export default SimpleListTab;