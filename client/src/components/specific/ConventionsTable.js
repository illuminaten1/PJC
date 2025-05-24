import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaFileWord, FaFilePdf } from 'react-icons/fa';
import { documentsAPI } from '../../utils/api';
import Modal from '../common/Modal';
import ConventionForm from '../forms/ConventionForm';
import { useTheme } from '../../contexts/ThemeContext';

const ConventionsTable = ({ conventions = [], beneficiaireId, onUpdate, avocats = [] }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedConvention, setSelectedConvention] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [downloadError, setDownloadError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const { colors } = useTheme();

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
    return <EmptyMessage colors={colors}>Aucune convention d'honoraires</EmptyMessage>;
  }
  
  return (
    <TableContainer colors={colors}>
      {downloadError && <ErrorMessage colors={colors}>{downloadError}</ErrorMessage>}
      <Table colors={colors}>
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
                    convention.pourcentageResultats + ' %' : '-'}</td>
              <td>{formatDate(convention.dateEnvoiAvocat)}</td>
              <td>{formatDate(convention.dateEnvoiBeneficiaire)}</td>
              <td>{formatDate(convention.dateValidationFMG)}</td>
              <td>
                <ActionButtons>
                  <ActionButton 
                    onClick={() => handleEditConvention(convention, index)} 
                    title="Modifier la convention"
                    colors={colors}
                  >
                    <FaEdit />
                  </ActionButton>
                  
                  {/* Bouton pour télécharger en PDF */}
                  <ActionButton 
                    onClick={() => handleDownloadConvention(index, 'pdf')} 
                    title="Télécharger la convention en PDF"
                    className="pdf"
                    colors={colors}
                  >
                    <FaFilePdf />
                  </ActionButton>
                  
                  {/* Nouveau bouton pour télécharger en DOCX */}
                  <ActionButton 
                    onClick={() => handleDownloadConvention(index, 'docx')} 
                    title="Télécharger la convention en DOCX"
                    className="docx"
                    colors={colors}
                  >
                    <FaFileWord />
                  </ActionButton>
                  
                  <ActionButton 
                    onClick={() => handleDeleteConvention(convention, index)} 
                    title="Supprimer la convention"
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
            <CancelButton colors={colors} onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </CancelButton>
            <DeleteButton colors={colors} onClick={confirmDeleteConvention}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent colors={colors}>
          <p>Êtes-vous sûr de vouloir supprimer cette convention d'honoraires ?</p>
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

export default ConventionsTable;