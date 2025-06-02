import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaFilePdf, FaFileWord, FaEye } from 'react-icons/fa';
import { documentsAPI } from '../../utils/api';
import Modal from '../common/Modal';
import PaiementForm from '../forms/PaiementForm';
import { useTheme } from '../../contexts/ThemeContext';

const PaiementsTable = ({ paiements = [], beneficiaireId, onUpdate }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
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

  const handleViewDetails = (paiement, index) => {
    setSelectedPaiement(paiement);
    setSelectedIndex(index);
    setDetailModalOpen(true);
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
      
      {/* Vue Desktop - Tableau classique */}
      <DesktopTable colors={colors}>
        <Table colors={colors}>
          <thead>
            <tr>
              <th>Qualité</th>
              <th>Destinataire</th>
              <th>Type</th>
              <th>Montant TTC</th>
              <th>Date</th>
              <th>Référence</th>
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
                    
                    {/* Bouton pour DOCX */}
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
      </DesktopTable>

      {/* Vue Mobile - Cards */}
      <MobileView colors={colors}>
        {paiements.map((paiement, index) => (
          <PaiementCard key={index} colors={colors}>
            <CardHeader colors={colors}>
              <CardTitle colors={colors}>
                <span className="type">{paiement.type || 'Non spécifié'}</span>
                <span className="amount">{paiement.montant ? paiement.montant.toLocaleString('fr-FR') + ' €' : '-'}</span>
              </CardTitle>
              <CardDate colors={colors}>{formatDate(paiement.date)}</CardDate>
            </CardHeader>
            
            <CardContent colors={colors}>
              <CardRow>
                <CardLabel colors={colors}>Qualité :</CardLabel>
                <CardValue colors={colors}>{paiement.qualiteDestinataire || '-'}</CardValue>
              </CardRow>
              <CardRow>
                <CardLabel colors={colors}>Destinataire :</CardLabel>
                <CardValue colors={colors}>{paiement.identiteDestinataire || '-'}</CardValue>
              </CardRow>
              <CardRow>
                <CardLabel colors={colors}>Référence :</CardLabel>
                <CardValue colors={colors}>{paiement.referencePiece || '-'}</CardValue>
              </CardRow>
            </CardContent>
            
            <CardActions colors={colors}>
              <MobileActionButton 
                onClick={() => handleViewDetails(paiement, index)}
                className="view"
                colors={colors}
              >
                <FaEye />
                <span>Voir</span>
              </MobileActionButton>
              
              <MobileActionButton 
                onClick={() => handleEditPaiement(paiement, index)}
                className="edit"
                colors={colors}
              >
                <FaEdit />
                <span>Modifier</span>
              </MobileActionButton>
              
              <MobileActionButton 
                onClick={() => handleDownloadReglement(index, 'pdf')}
                className="pdf"
                colors={colors}
              >
                <FaFilePdf />
                <span>PDF</span>
              </MobileActionButton>
              
              <MobileActionButton 
                onClick={() => handleDeletePaiement(paiement, index)}
                className="delete"
                colors={colors}
              >
                <FaTrash />
                <span>Suppr.</span>
              </MobileActionButton>
            </CardActions>
          </PaiementCard>
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

      {/* Modal de détails (mobile) */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Détails du paiement"
        size="medium"
      >
        {selectedPaiement && (
          <DetailContent colors={colors}>
            <DetailRow>
              <DetailLabel colors={colors}>Qualité du destinataire :</DetailLabel>
              <DetailValue colors={colors}>{selectedPaiement.qualiteDestinataire || '-'}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel colors={colors}>Identité du destinataire :</DetailLabel>
              <DetailValue colors={colors}>{selectedPaiement.identiteDestinataire || '-'}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel colors={colors}>Type :</DetailLabel>
              <DetailValue colors={colors}>{selectedPaiement.type || '-'}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel colors={colors}>Montant TTC :</DetailLabel>
              <DetailValue colors={colors}>{selectedPaiement.montant ? selectedPaiement.montant.toLocaleString('fr-FR') + ' €' : '-'}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel colors={colors}>Date :</DetailLabel>
              <DetailValue colors={colors}>{formatDate(selectedPaiement.date)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel colors={colors}>Référence pièce :</DetailLabel>
              <DetailValue colors={colors}>{selectedPaiement.referencePiece || '-'}</DetailValue>
            </DetailRow>
            
            <DetailActions colors={colors}>
              <MobileActionButton 
                onClick={() => handleDownloadReglement(selectedIndex, 'pdf')}
                className="pdf"
                colors={colors}
              >
                <FaFilePdf />
                <span>Télécharger PDF</span>
              </MobileActionButton>
              
              <MobileActionButton 
                onClick={() => handleDownloadReglement(selectedIndex, 'docx')}
                className="docx"
                colors={colors}
              >
                <FaFileWord />
                <span>Télécharger DOCX</span>
              </MobileActionButton>
            </DetailActions>
          </DetailContent>
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

// Styled Components avec design responsive

const TableContainer = styled.div`
  margin-top: 16px;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    margin-top: 12px;
  }
`;

// Vue Desktop (tablette et plus)
const DesktopTable = styled.div`
  overflow-x: auto;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  transition: all 0.3s ease;
  
  th, td {
    padding: 12px;
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
    th, td {
      padding: 8px;
      font-size: 13px;
    }
  }
`;

// Vue Mobile
const MobileView = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    padding: 12px;
  }
`;

const PaiementCard = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.colors.shadow};
    border-color: ${props => props.colors.primary}40;
  }
`;

const CardHeader = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const CardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .type {
    font-weight: 500;
    color: ${props => props.colors.textPrimary};
    font-size: 16px;
  }
  
  .amount {
    font-weight: 600;
    color: ${props => props.colors.primary};
    font-size: 18px;
  }
`;

const CardDate = styled.div`
  color: ${props => props.colors.textSecondary};
  font-size: 14px;
  text-align: right;
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardLabel = styled.span`
  color: ${props => props.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 80px;
`;

const CardValue = styled.span`
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  text-align: right;
  word-break: break-word;
`;

const CardActions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid ${props => props.colors.borderLight};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

const MobileActionButton = styled.button`
  background: none;
  border: none;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-right: 1px solid ${props => props.colors.borderLight};
  
  &:last-child {
    border-right: none;
  }
  
  svg {
    font-size: 16px;
  }
  
  span {
    font-size: 12px;
    font-weight: 500;
  }
  
  &.view {
    color: ${props => props.colors.primary};
    
    &:hover {
      background-color: ${props => props.colors.primary}10;
      color: ${props => props.colors.primaryDark};
    }
  }
  
  &.edit {
    color: ${props => props.colors.primary};
    
    &:hover {
      background-color: ${props => props.colors.primary}10;
      color: ${props => props.colors.primaryDark};
    }
  }
  
  &.pdf {
    color: ${props => props.colors.error};
    
    &:hover {
      background-color: ${props => props.colors.error}10;
    }
  }
  
  &.docx {
    color: ${props => props.colors.cardIcon.affaires.color};
    
    &:hover {
      background-color: ${props => props.colors.cardIcon.affaires.color}10;
    }
  }
  
  &.delete {
    color: ${props => props.colors.error};
    
    &:hover {
      background-color: ${props => props.colors.error}10;
    }
  }
`;

// Styles pour le modal de détails
const DetailContent = styled.div`
  color: ${props => props.colors.textPrimary};
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  gap: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: ${props => props.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: ${props => props.colors.textPrimary};
  font-size: 16px;
  word-break: break-word;
`;

const DetailActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.colors.borderLight};
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
    margin-top: 12px;
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
    margin-bottom: 12px;
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
    padding: 10px 16px;
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
    padding: 10px 16px;
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