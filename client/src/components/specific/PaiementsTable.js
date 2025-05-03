import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { documentsAPI } from '../../utils/api';
import Modal from '../common/Modal';
import PaiementForm from '../forms/PaiementForm';

const PaiementsTable = ({ paiements = [], beneficiaireId, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [downloadError, setDownloadError] = useState('');
  const [deleteError, setDeleteError] = useState('');

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
    return <EmptyMessage>Aucun paiement enregistré</EmptyMessage>;
  }
  
  return (
    <TableContainer>
      {downloadError && <ErrorMessage>{downloadError}</ErrorMessage>}
      <Table>
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
                  >
                    <FaEdit />
                  </ActionButton>
                               
                  {/* Bouton pour PDF */}
                  <ActionButton 
                    onClick={() => handleDownloadReglement(index, 'pdf')} 
                    title="Télécharger en PDF"
                    className="pdf"
                  >
                    <FaFilePdf />
                  </ActionButton>
                  
                  {/* Nouveau bouton pour DOCX */}
                  <ActionButton 
                    onClick={() => handleDownloadReglement(index, 'docx')} 
                    title="Télécharger en DOCX"
                    className="docx"
                  >
                    <FaFileWord />
                  </ActionButton>
                                  
                  <ActionButton 
                    onClick={() => handleDeletePaiement(paiement, index)} 
                    title="Supprimer le paiement"
                    className="delete"
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
            <CancelButton onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={confirmDeletePaiement}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent>
          <p>Êtes-vous sûr de vouloir supprimer ce paiement ?</p>
          <p><strong>Attention :</strong> Cette action est irréversible.</p>
          
          {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>
    </TableContainer>
  );
};

const TableContainer = styled.div`
  margin-top: 16px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 500;
    color: #333;
  }
  
  tr:hover {
    background-color: #f9f9f9;
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
  color: #3f51b5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(63, 81, 181, 0.1);
  }
  
  &.delete {
    color: #f44336;
    
    &:hover {
      background-color: rgba(244, 67, 54, 0.1);
    }
  }
  
  &.pdf {
    color: #d32f2f;
    
    &:hover {
      background-color: rgba(211, 47, 47, 0.1);
    }
  }
  
  &.docx {
    color: #2196f3;
    
    &:hover {
      background-color: rgba(33, 150, 243, 0.1);
    }
  }
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #757575;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-top: 16px;
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
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

const DeleteConfirmContent = styled.div`
  p {
    margin-bottom: 16px;
  }
`;

export default PaiementsTable;