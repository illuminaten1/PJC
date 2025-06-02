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
      
      {/* Vue Desktop */}
      <DesktopTable colors={colors}>
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
      </DesktopTable>
      
      {/* Vue Mobile */}
      <MobileView>
        {paiements.map((paiement, index) => (
          <MobileCard key={index} colors={colors}>
            <CardHeader colors={colors}>
              <CardTitle colors={colors}>
                {paiement.identiteDestinataire || 'Non défini'}
              </CardTitle>
              <CardSubtitle colors={colors}>
                {paiement.qualiteDestinataire || '-'}
              </CardSubtitle>
            </CardHeader>
            
            <CardBody colors={colors}>
              <InfoRow colors={colors}>
                <InfoLabel>Type :</InfoLabel>
                <InfoValue>{paiement.type || '-'}</InfoValue>
              </InfoRow>
              
              <InfoRow colors={colors}>
                <InfoLabel>Montant :</InfoLabel>
                <InfoValue className="amount">
                  {paiement.montant ? paiement.montant.toLocaleString('fr-FR') + ' €' : '-'}
                </InfoValue>
              </InfoRow>
              
              <InfoRow colors={colors}>
                <InfoLabel>Date :</InfoLabel>
                <InfoValue>{formatDate(paiement.date)}</InfoValue>
              </InfoRow>
              
              <InfoRow colors={colors}>
                <InfoLabel>Référence :</InfoLabel>
                <InfoValue>{paiement.referencePiece || '-'}</InfoValue>
              </InfoRow>
            </CardBody>
            
            <CardActions colors={colors}>
              <MobileActionButton 
                onClick={() => handleEditPaiement(paiement, index)} 
                title="Modifier"
                colors={colors}
              >
                <FaEdit />
                <span>Modifier</span>
              </MobileActionButton>
              
              <MobileActionButton 
                onClick={() => handleDownloadReglement(index, 'pdf')} 
                title="PDF"
                className="pdf"
                colors={colors}
              >
                <FaFilePdf />
                <span>PDF</span>
              </MobileActionButton>
              
              <MobileActionButton 
                onClick={() => handleDownloadReglement(index, 'docx')} 
                title="DOCX"
                className="docx"
                colors={colors}
              >
                <FaFileWord />
                <span>DOCX</span>
              </MobileActionButton>
              
              <MobileActionButton 
                onClick={() => handleDeletePaiement(paiement, index)} 
                title="Supprimer"
                className="delete"
                colors={colors}
              >
                <FaTrash />
                <span>Supprimer</span>
              </MobileActionButton>
            </CardActions>
          </MobileCard>
        ))}
      </MobileView>

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

// Styled Components avec thématisation et responsive design
const TableContainer = styled.div`
  margin-top: 16px;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  transition: background-color 0.3s ease;
`;

// Table Desktop
const DesktopTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  transition: all 0.3s ease;
  overflow-x: auto;
  
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
    white-space: nowrap;
  }
  
  tbody tr {
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: ${props => props.colors.navActive};
    }
  }
  
  @media (max-width: 1024px) {
    font-size: 13px;
    
    th, td {
      padding: 8px 10px;
    }
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// Vue Mobile
const MobileView = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileCard = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    box-shadow: ${props => props.colors.shadow};
  }
`;

const CardHeader = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const CardSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const CardBody = styled.div`
  padding: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: ${props => props.colors.textPrimary};
  text-align: right;
  transition: color 0.3s ease;
  
  &.amount {
    font-weight: 600;
    color: ${props => props.colors.success};
  }
`;

const CardActions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background-color: ${props => props.colors.borderLight};
  border-top: 1px solid ${props => props.colors.borderLight};
`;

const MobileActionButton = styled.button`
  background-color: ${props => props.colors.surface};
  border: none;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: ${props => props.colors.primary};
  transition: all 0.3s ease;
  font-size: 12px;
  
  svg {
    font-size: 16px;
  }
  
  span {
    font-size: 11px;
    font-weight: 500;
  }
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
  }
  
  &.delete {
    color: ${props => props.colors.error};
  }
  
  &.pdf {
    color: ${props => props.colors.error};
  }
  
  &.docx {
    color: ${props => props.colors.cardIcon.affaires.color};
  }
  
  @media (max-width: 480px) {
    padding: 10px 4px;
    
    span {
      font-size: 10px;
    }
    
    svg {
      font-size: 14px;
    }
  }
`;

// Boutons d'action Desktop
const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 1024px) {
    gap: 4px;
  }
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
  
  @media (max-width: 1024px) {
    padding: 4px;
    
    svg {
      font-size: 14px;
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
  
  @media (max-width: 768px) {
    padding: 16px;
    font-size: 14px;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.colors.errorBg};
  color: ${props => props.colors.error};
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 14px;
  }
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
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 14px;
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
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 14px;
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
  
  @media (max-width: 768px) {
    font-size: 14px;
    
    p {
      margin-bottom: 12px;
    }
  }
`;

export default PaiementsTable;