import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { documentsAPI } from '../../utils/api';
import Modal from '../common/Modal';
import PaiementForm from '../forms/PaiementForm';
import { useTheme } from '../../contexts/ThemeContext';

const PaiementsTable = ({ paiements = [], beneficiaireId, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [downloadError, setDownloadError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const { colors } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const handleEditPaiement = (paiement, index) => {
    setSelectedPaiement(paiement);
    setSelectedIndex(index);
    setEditModalOpen(true);
  };
  
  const handleDeletePaiement = (paiement, index) => {
    setSelectedPaiement(paiement);
    setSelectedIndex(index);
    setDeleteModalOpen(true);
  };
  
  const handleUpdatePaiement = async (updatedData) => {
    try {
      // Appel API pour mettre à jour le paiement
      const response = await fetch(`/api/beneficiaires/${beneficiaireId}/paiements/${selectedIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du paiement');
      }
      
      // Fermer le modal et actualiser les données
      setEditModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement", error);
      alert("Erreur: " + error.message);
    }
  };

  const confirmDeletePaiement = async () => {
    try {
      setDeleteError('');
      // Appel API pour supprimer le paiement
      const response = await fetch(`/api/beneficiaires/${beneficiaireId}/paiements/${selectedIndex}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression du paiement');
      }
      
      // Fermer le modal et actualiser les données
      setDeleteModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement", error);
      setDeleteError(error.message || "Une erreur est survenue lors de la suppression");
    }
  };
  
  const handleDownloadReglement = async (paiementIndex, format = 'pdf') => {
    setDownloadError('');
    try {
      const response = await documentsAPI.genererReglement(beneficiaireId, paiementIndex, format);
      
      // Créer un lien pour télécharger le document
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reglement_${paiementIndex + 1}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de la fiche de règlement en ${format}`, error);
      setDownloadError(`Erreur lors de la génération du document: ${error.response?.data?.message || error.message}`);
    }
  };
  
   
  if (!paiements || paiements.length === 0) {
    return <EmptyMessage colors={colors}>Aucun paiement enregistré</EmptyMessage>;
  }
  
  return (
    <TableContainer colors={colors}>
      {downloadError && <ErrorMessage colors={colors}>{downloadError}</ErrorMessage>}
      <Table colors={colors}>
        <thead>
          <tr>
            <th>Qualité du destinataire</th>
            <th>Identité du destinataire</th>
            <th>Type</th>
            <th>Montant TTC</th>
            <th>Date</th>
            <th>Référence pièce</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paiements.map((paiement, index) => (
            <tr key={index}>
              <td>{paiement.qualiteDestinataire || '-'}</td>
              <td>{paiement.identiteDestinataire || '-'}</td>
              <td>{paiement.type || '-'}</td>
              <td>{paiement.montant ? paiement.montant.toLocaleString('fr-FR') + ' €' : '-'}</td>
              <td>{formatDate(paiement.date)}</td>
              <td>{paiement.referencePiece || '-'}</td>
              <td>
                <ActionButtons>
                  <ActionButton 
                    onClick={() => handleEditPaiement(paiement, index)} 
                    title="Modifier le paiement"
                    colors={colors}
                  >
                    <FaEdit />
                  </ActionButton>
                               
                  {/* Bouton pour PDF */}
                  <ActionButton 
                    onClick={() => handleDownloadReglement(index, 'pdf')} 
                    title="Télécharger en PDF"
                    className="pdf"
                    colors={colors}
                  >
                    <FaFilePdf />
                  </ActionButton>
                  
                  {/* Nouveau bouton pour DOCX */}
                  <ActionButton 
                    onClick={() => handleDownloadReglement(index, 'docx')} 
                    title="Télécharger en DOCX"
                    className="docx"
                    colors={colors}
                  >
                    <FaFileWord />
                  </ActionButton>
                                  
                  <ActionButton 
                    onClick={() => handleDeletePaiement(paiement, index)} 
                    title="Supprimer le paiement"
                    className="delete"
                    colors={colors}
                  >
                    <FaTrash />
                  </ActionButton>
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal d'édition de paiement */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier le paiement"
        size="large"
      >
        {selectedPaiement && (
          <PaiementForm 
            onSubmit={handleUpdatePaiement} 
            initialData={selectedPaiement} 
            isEditing={true}
          />
        )}
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer le paiement"
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setDeleteModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={confirmDeletePaiement} colors={colors}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent colors={colors}>
          <p>Êtes-vous sûr de vouloir supprimer ce paiement ?</p>
          <p><strong>Attention :</strong> Cette action est irréversible.</p>
          
          {deleteError && <ErrorMessage colors={colors}>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>
    </TableContainer>
  );
};

// Styled Components avec thématisation
const TableContainer = styled.div`
  margin-top: 16px;
  overflow-x: auto;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  transition: background-color 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  transition: all 0.3s ease;
  
  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid ${props => props.colors.borderLight};
    color: ${props => props.colors.textPrimary};
    transition: all 0.3s ease;
  }
  
  th {
    background-color: ${props => props.colors.surfaceHover};
    font-weight: 500;
    color: ${props => props.colors.textPrimary};
    border-bottom: 1px solid ${props => props.colors.border};
  }
  
  tbody tr {
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: ${props => props.colors.navActive};
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primary}20;
    transform: scale(1.1);
  }
  
  &.delete {
    color: ${props => props.colors.error};
    
    &:hover {
      background-color: ${props => props.colors.error}20;
    }
  }
  
  &.pdf {
    color: ${props => props.colors.error};
    
    &:hover {
      background-color: ${props => props.colors.error}20;
    }
  }
  
  &.docx {
    color: ${props => props.colors.cardIcon.affaires.color};
    
    &:hover {
      background-color: ${props => props.colors.cardIcon.affaires.color}20;
    }
  }
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  margin-top: 16px;
  transition: all 0.3s ease;
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.colors.errorBg};
  color: ${props => props.colors.error};
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
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
    border-color: ${props => props.colors.primary};
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
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const DeleteConfirmContent = styled.div`
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 16px;
    
    strong {
      color: ${props => props.colors.warning};
    }
  }
`;

export default PaiementsTable;