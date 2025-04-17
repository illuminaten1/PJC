import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaFileWord, FaFilePdf } from 'react-icons/fa';
import { documentsAPI } from '../../utils/api';
import Modal from '../common/Modal';
import ConventionForm from '../forms/ConventionForm';

const ConventionsTable = ({ conventions = [], beneficiaireId, onUpdate, avocats = [] }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedConvention, setSelectedConvention] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [downloadError, setDownloadError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  // Fonction pour récupérer le nom de l'avocat à partir de son ID
  const getAvocatName = (avocatId) => {
    if (!avocatId) return '-';
    const avocat = avocats.find(a => a._id === avocatId);
    if (!avocat) return 'Avocat inconnu';
    return `Me ${avocat.prenom} ${avocat.nom}${avocat.specialisationRPC ? ' (RPC)' : ''}`;
  };
  
  const handleEditConvention = (convention, index) => {
    setSelectedConvention(convention);
    setSelectedIndex(index);
    setEditModalOpen(true);
  };
  
  const handleDeleteConvention = (convention, index) => {
    setSelectedConvention(convention);
    setSelectedIndex(index);
    setDeleteModalOpen(true);
  };
  
  const handleUpdateConvention = async (updatedData) => {
    try {
      // Appel API pour mettre à jour la convention
      const response = await fetch(`/api/beneficiaires/${beneficiaireId}/conventions/${selectedIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour de la convention');
      }
      
      // Fermer le modal et actualiser les données
      setEditModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la convention", error);
      alert("Erreur: " + error.message);
    }
  };

  const confirmDeleteConvention = async () => {
    try {
      setDeleteError('');
      // Appel API pour supprimer la convention
      const response = await fetch(`/api/beneficiaires/${beneficiaireId}/conventions/${selectedIndex}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression de la convention');
      }
      
      // Fermer le modal et actualiser les données
      setDeleteModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erreur lors de la suppression de la convention", error);
      setDeleteError(error.message || "Une erreur est survenue lors de la suppression");
    }
  };

  const handleDownloadConvention = async (conventionIndex, format = 'pdf') => {
    setDownloadError('');
    try {
      const response = await documentsAPI.genererConvention(beneficiaireId, conventionIndex, format);
      
      // Créer un lien pour télécharger le PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `convention_${conventionIndex + 1}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de la convention en ${format}`, error);
      setDownloadError(`Erreur lors de la génération du document: ${error.response?.data?.message || error.message}`);
    }
  };
  
  if (!conventions || conventions.length === 0) {
    return <EmptyMessage>Aucune convention d'honoraires</EmptyMessage>;
  }
  
  return (
    <TableContainer>
      {downloadError && <ErrorMessage>{downloadError}</ErrorMessage>}
      <Table>
        <thead>
          <tr>
            <th>Avocat</th>
            <th>Montant HT</th>
            <th>Pourcentage</th>
            <th>Envoi avocat</th>
            <th>Envoi bénéficiaire</th>
            <th>Validation FMG</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {conventions.map((convention, index) => (
            <tr key={index}>
              <td>{getAvocatName(convention.avocat)}</td>
              <td>{convention.montant ? convention.montant.toLocaleString('fr-FR') + ' €' : '-'}</td>
              <td>{convention.pourcentageResultats !== undefined && 
                    convention.pourcentageResultats !== null ? 
                    convention.pourcentageResultats + ' %' : '-'}</td>              <td>{formatDate(convention.dateEnvoiAvocat)}</td>
              <td>{formatDate(convention.dateEnvoiBeneficiaire)}</td>
              <td>{formatDate(convention.dateValidationFMG)}</td>
              <td>
                <ActionButtons>
                  <ActionButton 
                    onClick={() => handleEditConvention(convention, index)} 
                    title="Modifier la convention"
                  >
                    <FaEdit />
                  </ActionButton>
                  
                  {/* Bouton pour télécharger en PDF */}
                  <ActionButton 
                    onClick={() => handleDownloadConvention(index, 'pdf')} 
                    title="Télécharger la convention en PDF"
                    className="pdf"
                  >
                    <FaFilePdf />
                  </ActionButton>
                  
                  {/* Nouveau bouton pour télécharger en ODT */}
                  <ActionButton 
                    onClick={() => handleDownloadConvention(index, 'odt')} 
                    title="Télécharger la convention en ODT"
                    className="odt"
                  >
                    <FaFileWord />
                  </ActionButton>
                  
                  <ActionButton 
                    onClick={() => handleDeleteConvention(convention, index)} 
                    title="Supprimer la convention"
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

      {/* Modal d'édition de convention */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier la convention d'honoraires"
        size="medium"
      >
        {selectedConvention && (
          <ConventionForm 
            onSubmit={handleUpdateConvention} 
            initialData={selectedConvention} 
            isEditing={true}
            avocats={avocats}
          />
        )}
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer la convention"
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={confirmDeleteConvention}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent>
          <p>Êtes-vous sûr de vouloir supprimer cette convention d'honoraires ?</p>
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
  
  &.odt {
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

export default ConventionsTable;