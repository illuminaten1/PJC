import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaFileWord, FaFilePdf, FaEye, FaGavel } from 'react-icons/fa';
import { documentsAPI } from '../../utils/api';
import Modal from '../common/Modal';
import ConventionForm from '../forms/ConventionForm';
import { useTheme } from '../../contexts/ThemeContext';

const ConventionsTable = ({ conventions = [], beneficiaireId, onUpdate, avocats = [] }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
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

  // Version courte du nom d'avocat pour mobile
  const getAvocatShortName = (avocatId) => {
    if (!avocatId) return '-';
    const avocat = avocats.find(a => a._id === avocatId);
    if (!avocat) return 'Inconnu';
    return `Me ${avocat.nom}`;
  };

  // Calcul du statut de la convention
  const getConventionStatus = (convention) => {
    if (convention.dateValidationFMG) return { status: 'validated', label: 'Validée' };
    if (convention.dateEnvoiBeneficiaire && convention.dateEnvoiAvocat) return { status: 'sent', label: 'Envoyée' };
    if (convention.dateEnvoiAvocat) return { status: 'partial', label: 'En cours' };
    return { status: 'draft', label: 'Brouillon' };
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

  const handleViewDetails = (convention, index) => {
    setSelectedConvention(convention);
    setSelectedIndex(index);
    setDetailModalOpen(true);
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
      
      // Créer un lien pour télécharger le document
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
      
      {/* Vue Desktop - Tableau classique */}
      <DesktopTable colors={colors}>
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
                    
                    {/* Bouton pour télécharger en DOCX */}
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
      </DesktopTable>

      {/* Vue Mobile - Cards */}
      <MobileView colors={colors}>
        {conventions.map((convention, index) => {
          const status = getConventionStatus(convention);
          return (
            <ConventionCard key={index} colors={colors}>
              <CardHeader colors={colors}>
                <CardTitle colors={colors}>
                  <div className="avocat-info">
                    <FaGavel />
                    <span className="avocat-name">{getAvocatShortName(convention.avocat)}</span>
                  </div>
                  <StatusBadge status={status.status} colors={colors}>
                    {status.label}
                  </StatusBadge>
                </CardTitle>
                <CardAmount colors={colors}>
                  {convention.montant ? convention.montant.toLocaleString('fr-FR') + ' €' : 'Non défini'}
                </CardAmount>
              </CardHeader>
              
              <CardContent colors={colors}>
                <CardRow>
                  <CardLabel colors={colors}>Pourcentage :</CardLabel>
                  <CardValue colors={colors}>
                    {convention.pourcentageResultats !== undefined && 
                     convention.pourcentageResultats !== null ? 
                     convention.pourcentageResultats + ' %' : '-'}
                  </CardValue>
                </CardRow>
                
                {convention.dateValidationFMG && (
                  <CardRow>
                    <CardLabel colors={colors}>Validée le :</CardLabel>
                    <CardValue colors={colors}>{formatDate(convention.dateValidationFMG)}</CardValue>
                  </CardRow>
                )}
                
                {(convention.dateEnvoiAvocat || convention.dateEnvoiBeneficiaire) && (
                  <CardDates colors={colors}>
                    {convention.dateEnvoiAvocat && (
                      <DateItem>
                        <DateLabel colors={colors}>Envoi avocat</DateLabel>
                        <DateValue colors={colors}>{formatDate(convention.dateEnvoiAvocat)}</DateValue>
                      </DateItem>
                    )}
                    {convention.dateEnvoiBeneficiaire && (
                      <DateItem>
                        <DateLabel colors={colors}>Envoi bénéficiaire</DateLabel>
                        <DateValue colors={colors}>{formatDate(convention.dateEnvoiBeneficiaire)}</DateValue>
                      </DateItem>
                    )}
                  </CardDates>
                )}
              </CardContent>
              
              <CardActions colors={colors}>
                <MobileActionButton 
                  onClick={() => handleViewDetails(convention, index)}
                  className="view"
                  colors={colors}
                >
                  <FaEye />
                  <span>Voir</span>
                </MobileActionButton>
                
                <MobileActionButton 
                  onClick={() => handleEditConvention(convention, index)}
                  className="edit"
                  colors={colors}
                >
                  <FaEdit />
                  <span>Modifier</span>
                </MobileActionButton>
                
                <MobileActionButton 
                  onClick={() => handleDownloadConvention(index, 'pdf')}
                  className="pdf"
                  colors={colors}
                >
                  <FaFilePdf />
                  <span>PDF</span>
                </MobileActionButton>
                
                <MobileActionButton 
                  onClick={() => handleDeleteConvention(convention, index)}
                  className="delete"
                  colors={colors}
                >
                  <FaTrash />
                  <span>Suppr.</span>
                </MobileActionButton>
              </CardActions>
            </ConventionCard>
          );
        })}
      </MobileView>

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

      {/* Modal de détails (mobile) */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Détails de la convention"
        size="medium"
      >
        {selectedConvention && (
          <DetailContent colors={colors}>
            <DetailRow>
              <DetailLabel colors={colors}>Avocat :</DetailLabel>
              <DetailValue colors={colors}>{getAvocatName(selectedConvention.avocat)}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel colors={colors}>Montant HT :</DetailLabel>
              <DetailValue colors={colors}>
                {selectedConvention.montant ? selectedConvention.montant.toLocaleString('fr-FR') + ' €' : '-'}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel colors={colors}>Pourcentage des résultats :</DetailLabel>
              <DetailValue colors={colors}>
                {selectedConvention.pourcentageResultats !== undefined && 
                 selectedConvention.pourcentageResultats !== null ? 
                 selectedConvention.pourcentageResultats + ' %' : '-'}
              </DetailValue>
            </DetailRow>
            
            <DetailSection colors={colors}>
              <DetailSectionTitle colors={colors}>Dates importantes</DetailSectionTitle>
              
              <DetailRow>
                <DetailLabel colors={colors}>Envoi à l'avocat :</DetailLabel>
                <DetailValue colors={colors}>{formatDate(selectedConvention.dateEnvoiAvocat)}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel colors={colors}>Envoi au bénéficiaire :</DetailLabel>
                <DetailValue colors={colors}>{formatDate(selectedConvention.dateEnvoiBeneficiaire)}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel colors={colors}>Validation FMG :</DetailLabel>
                <DetailValue colors={colors}>{formatDate(selectedConvention.dateValidationFMG)}</DetailValue>
              </DetailRow>
            </DetailSection>
            
            <DetailActions colors={colors}>
              <MobileActionButton 
                onClick={() => handleDownloadConvention(selectedIndex, 'pdf')}
                className="pdf"
                colors={colors}
              >
                <FaFilePdf />
                <span>Télécharger PDF</span>
              </MobileActionButton>
              
              <MobileActionButton 
                onClick={() => handleDownloadConvention(selectedIndex, 'docx')}
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

const ConventionCard = styled.div`
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
  align-items: flex-start;
  gap: 12px;
`;

const CardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  
  .avocat-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: ${props => props.colors.cardIcon.affaires.color};
      flex-shrink: 0;
    }
    
    .avocat-name {
      font-weight: 500;
      color: ${props => props.colors.textPrimary};
      font-size: 16px;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  ${props => {
    switch(props.status) {
      case 'validated':
        return `
          background-color: ${props.colors.successBg};
          color: ${props.colors.success};
        `;
      case 'sent':
        return `
          background-color: ${props.colors.cardIcon.affaires.bg};
          color: ${props.colors.cardIcon.affaires.color};
        `;
      case 'partial':
        return `
          background-color: ${props.colors.warningBg};
          color: ${props.colors.warning};
        `;
      default:
        return `
          background-color: ${props.colors.surfaceHover};
          color: ${props.colors.textMuted};
        `;
    }
  }}
`;

const CardAmount = styled.div`
  font-weight: 600;
  color: ${props => props.colors.primary};
  font-size: 18px;
  text-align: right;
  flex-shrink: 0;
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
  min-width: 100px;
`;

const CardValue = styled.span`
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  text-align: right;
  word-break: break-word;
`;

const CardDates = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.colors.borderLight};
`;

const DateItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DateLabel = styled.span`
  color: ${props => props.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
`;

const DateValue = styled.span`
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
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

const DetailSection = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.colors.borderLight};
`;

const DetailSectionTitle = styled.h4`
  margin: 0 0 16px 0;
  color: ${props => props.colors.textPrimary};
  font-size: 16px;
  font-weight: 600;
`;

const DetailActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
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
`;

export default ConventionsTable;