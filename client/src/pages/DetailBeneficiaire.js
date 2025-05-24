import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaUserTie, FaSearch, FaTimes, FaEnvelope, FaPhone } from 'react-icons/fa';
import { beneficiairesAPI, avocatsAPI, affairesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import BeneficiaireForm from '../components/forms/BeneficiaireForm';
import ConventionForm from '../components/forms/ConventionForm';
import PaiementForm from '../components/forms/PaiementForm';
import ExpandableSection from '../components/common/ExpandableSection';
import ConventionsTable from '../components/specific/ConventionsTable';
import PaiementsTable from '../components/specific/PaiementsTable';
import DocumentsSection from '../components/specific/DocumentsSection';
import AvocatDetail from '../components/specific/AvocatDetail';
import { useTheme } from '../contexts/ThemeContext';
import {
  ThemedHeaderCard,
  HeaderGrid,
  HeaderItem,
  ThemedHeaderLabel,
  ThemedHeaderValue,
  ThemedArchiveNote
} from '../components/common/HeaderComponents';

const DetailBeneficiaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  const [beneficiaire, setBeneficiaire] = useState(null);
  const [affaire, setAffaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [conventionModalOpen, setConventionModalOpen] = useState(false);
  const [paiementModalOpen, setPaiementModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [avocatsModalOpen, setAvocatsModalOpen] = useState(false);
  const [availableAvocats, setAvailableAvocats] = useState([]);
  const [selectedAvocats, setSelectedAvocats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [avocatDetailModalOpen, setAvocatDetailModalOpen] = useState(false);
  const [selectedAvocatDetail, setSelectedAvocatDetail] = useState(null);
  
  useEffect(() => {
    fetchBeneficiaire();
    fetchAvocats();
  }, [id]);
  
  useEffect(() => {
    if (beneficiaire && beneficiaire.avocats) {
      setSelectedAvocats(beneficiaire.avocats);
    }
    
    // Récupérer les détails de l'affaire si le bénéficiaire est chargé
    if (beneficiaire && beneficiaire.militaire && beneficiaire.militaire.affaire) {
      fetchAffaire(beneficiaire.militaire.affaire._id);
    }
  }, [beneficiaire]);
  
  // Effet pour filtrer les avocats lors de la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const results = availableAvocats.filter(avocat => 
      !selectedAvocats.find(selected => selected._id === avocat._id) && // Exclure ceux déjà sélectionnés
      (
        avocat.nom.toLowerCase().includes(term) || 
        avocat.prenom.toLowerCase().includes(term) ||
        avocat.email.toLowerCase().includes(term)
      )
    );
    
    setSearchResults(results);
    setShowSearchResults(true);
  }, [searchTerm, availableAvocats, selectedAvocats]);

  const fetchBeneficiaire = async () => {
    setLoading(true);
    try {
      const response = await beneficiairesAPI.getById(id);
      setBeneficiaire(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération du bénéficiaire", err);
      setError("Impossible de charger les détails du bénéficiaire");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAffaire = async (affaireId) => {
    try {
      const response = await affairesAPI.getById(affaireId);
      setAffaire(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'affaire", err);
    }
  };
  
  const fetchAvocats = async () => {
    try {
      const response = await avocatsAPI.getAll();
      setAvailableAvocats(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des avocats", err);
    }
  };
  
  const handleEditBeneficiaire = async (data) => {
    try {
      await beneficiairesAPI.update(id, data);
      setEditModalOpen(false);
      fetchBeneficiaire();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du bénéficiaire", err);
      // Gérer l'erreur
    }
  };
  
  const handleAddConvention = async (data) => {
    try {
      await beneficiairesAPI.addConvention(id, data);
      setConventionModalOpen(false);
      fetchBeneficiaire();
    } catch (err) {
      console.error("Erreur lors de l'ajout de la convention", err);
      // Gérer l'erreur
    }
  };
  
  const handleAddPaiement = async (data) => {
    try {
      await beneficiairesAPI.addPaiement(id, data);
      setPaiementModalOpen(false);
      fetchBeneficiaire();
    } catch (err) {
      console.error("Erreur lors de l'ajout du paiement", err);
      // Gérer l'erreur
    }
  };
  
  const handleDelete = async () => {
    try {
      await beneficiairesAPI.delete(id);
      navigate('/beneficiaires');
    } catch (err) {
      console.error("Erreur lors de la suppression du bénéficiaire", err);
      setDeleteError("Erreur lors de la suppression");
    }
  };
  
  const addAvocat = (avocat) => {
    // Vérifie si l'avocat est déjà sélectionné
    if (!selectedAvocats.find(selected => selected._id === avocat._id)) {
      setSelectedAvocats([...selectedAvocats, avocat]);
    }
    setSearchTerm('');
    setShowSearchResults(false);
  };
  
  const removeAvocat = (avocatId) => {
    setSelectedAvocats(selectedAvocats.filter(avocat => avocat._id !== avocatId));
  };
  
  const handleAvocatsUpdate = async () => {
    try {
      // Préparez les données pour la mise à jour
      const updatedBeneficiaire = {
        ...beneficiaire,
        avocats: selectedAvocats.map(avocat => avocat._id)
      };
      
      // Mettez à jour le bénéficiaire avec les nouveaux avocats
      await beneficiairesAPI.update(id, updatedBeneficiaire);
      
      // Fermez le modal et rafraîchissez les données
      setAvocatsModalOpen(false);
      fetchBeneficiaire();
    } catch (err) {
      console.error("Erreur lors de la mise à jour des avocats", err);
      alert("Une erreur est survenue lors de la mise à jour des avocats");
    }
  };

  const handleOpenAvocatDetail = (avocat) => {
    setSelectedAvocatDetail(avocat);
    setAvocatDetailModalOpen(true);
  };
  
  const navigateToMilitaire = (militaireId) => {
    navigate(`/militaires/${militaireId}`);
  };
  
  const navigateToAffaire = (affaireId) => {
    navigate(`/affaires/${affaireId}`);
  };

  // Format de date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  // Déterminer si un avocat a la spécialisation RPC pour l'affichage
  const hasRPCSpecialization = (avocat) => {
    return avocat && avocat.specialisationRPC === true;
  };

  if (loading) {
    return (
      <Container colors={colors}>
        <PageHeader 
          title="Détails du bénéficiaire" 
          backButton
        />
        <Loading colors={colors}>Chargement des détails du bénéficiaire...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container colors={colors}>
        <PageHeader 
          title="Détails du bénéficiaire" 
          backButton
        />
        <Error colors={colors}>{error}</Error>
      </Container>
    );
  }
  
  // Calculer les totaux financiers
  const totalConventions = beneficiaire.conventions.reduce((sum, convention) => sum + (convention.montant || 0), 0);
  const totalPaiements = beneficiaire.paiements.reduce((sum, paiement) => sum + (paiement.montant || 0), 0);
  const paiementRatio = totalConventions > 0 ? (totalPaiements / totalConventions) * 100 : 0;

// Styled Components de base
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
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
`;

return (
    <Container colors={colors}>
      <PageHeader 
        title={`${beneficiaire.prenom} ${beneficiaire.nom}`}
        subtitle={`Bénéficiaire ${beneficiaire.qualite} - ${beneficiaire.numeroDecision ? `Décision n°${beneficiaire.numeroDecision}` : 'Sans numéro de décision'}`}
        backButton
        actionButton={
          <ActionButtons>
            <ActionButton onClick={() => setEditModalOpen(true)} title="Modifier le bénéficiaire" colors={colors}>
              <FaEdit />
              <ButtonText>Modifier</ButtonText>
            </ActionButton>
            
            <ActionButton 
              onClick={() => setDeleteModalOpen(true)} 
              title="Supprimer le bénéficiaire"
              className="delete"
              colors={colors}
            >
              <FaTrash />
              <ButtonText>Supprimer</ButtonText>
            </ActionButton>
          </ActionButtons>
        }
      />
      
      <ThemedHeaderCard>
        <HeaderGrid>
          <HeaderItem>
            <ThemedHeaderLabel>Affaire</ThemedHeaderLabel>
            <AffaireLink onClick={() => navigateToAffaire(beneficiaire.militaire.affaire._id)} colors={colors}>
              {beneficiaire.militaire.affaire.nom}
            </AffaireLink>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Militaire créateur de droit</ThemedHeaderLabel>
            <MilitaireLink onClick={() => navigateToMilitaire(beneficiaire.militaire._id)} colors={colors}>
              {beneficiaire.militaire.grade} {beneficiaire.militaire.prenom} {beneficiaire.militaire.nom}
            </MilitaireLink>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Qualité du bénéficiaire</ThemedHeaderLabel>
            <QualiteTag qualite={beneficiaire.qualite} colors={colors}>
              {beneficiaire.qualite}
            </QualiteTag>
          </HeaderItem>

          <HeaderItem>
            <ThemedHeaderLabel>Statut d'archivage</ThemedHeaderLabel>
            <StatusTag status={beneficiaire.archive ? 'archived' : 'active'} colors={colors}>
              {beneficiaire.archive ? 'Archivé' : 'Actif'}
            </StatusTag>
            {beneficiaire.archive && (
              <ThemedArchiveNote>
                Ce bénéficiaire est archivé car il fait partie d'une affaire archivée.
                Pour le désarchiver, veuillez désarchiver l'affaire correspondante.
              </ThemedArchiveNote>
            )}
          </HeaderItem>
        </HeaderGrid>
        
        <HeaderGrid>
          <HeaderItem>
            <ThemedHeaderLabel>Date des faits</ThemedHeaderLabel>
            <ThemedHeaderValue>
              {affaire && affaire.dateFaits ? 
                formatDate(affaire.dateFaits) : 
                'Non définie'}
            </ThemedHeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Numéro de décision</ThemedHeaderLabel>
            {beneficiaire.numeroDecision ? (
              <ThemedHeaderValue>{beneficiaire.numeroDecision}</ThemedHeaderValue>
            ) : (
              <MissingValue colors={colors}>Non attribué</MissingValue>
            )}
          </HeaderItem>

          <HeaderItem>
            <ThemedHeaderLabel>Date de la décision</ThemedHeaderLabel>
            {beneficiaire.dateDecision ? (
              <ThemedHeaderValue>{formatDate(beneficiaire.dateDecision)}</ThemedHeaderValue>
            ) : (
              <MissingValue colors={colors}>Non définie</MissingValue>
            )}
          </HeaderItem>
          
          <HeaderItem>
            <ThemedHeaderLabel>Rédacteur en charge</ThemedHeaderLabel>
            <ThemedHeaderValue>{beneficiaire.militaire.affaire.redacteur}</ThemedHeaderValue>
          </HeaderItem>
        </HeaderGrid>
      </ThemedHeaderCard>
      
      <FinancesSection colors={colors}>
        <FinancesSummary>
          <FinanceCard colors={colors}>
            <FinanceTitle colors={colors}>Montant engagé</FinanceTitle>
            <FinanceValue colors={colors}>{totalConventions.toLocaleString('fr-FR')} € HT</FinanceValue>
            <FinanceDetail colors={colors}>
              <span>Conventions :</span>
              <span>{beneficiaire.conventions.length}</span>
            </FinanceDetail>
          </FinanceCard>
          
          <FinanceCard colors={colors}>
            <FinanceTitle colors={colors}>Montant payé</FinanceTitle>
            <FinanceValue colors={colors}>{totalPaiements.toLocaleString('fr-FR')} € TTC</FinanceValue>
            <FinanceDetail colors={colors}>
              <span>Paiements :</span>
              <span>{beneficiaire.paiements.length}</span>
            </FinanceDetail>
          </FinanceCard>
          
          <FinanceCard colors={colors}>
            <FinanceTitle colors={colors}>Ratio de paiement</FinanceTitle>
            <FinanceValue colors={colors}>{paiementRatio.toFixed(1)} %</FinanceValue>
            <FinanceDetail colors={colors}>
              <span>Reste à payer :</span>
              <span>{(totalConventions - totalPaiements).toLocaleString('fr-FR')} €</span>
            </FinanceDetail>
          </FinanceCard>
        </FinancesSummary>
      </FinancesSection>

      <TabsSection>
        <ExpandableSection
          title="Avocats désignés"
          defaultExpanded={true}
          headerAction={
            <TabActionButton onClick={() => setAvocatsModalOpen(true)} colors={colors}>
              <FaPlus />
              <span>Ajouter / Modifier avocats</span>
            </TabActionButton>
          }
        >
          {beneficiaire.avocats && beneficiaire.avocats.length > 0 ? (
            <AvocatsGrid>
              {beneficiaire.avocats.map((avocat, index) => (
                <AvocatCard key={index} colors={colors}>
                  <AvocatHeader>
                    <FaUserTie />
                    <div>
                      <AvocatName 
                        onClick={() => handleOpenAvocatDetail(avocat)} 
                        colors={colors}
                        style={{ cursor: 'pointer' }}
                      >
                        Me {avocat.prenom} {avocat.nom}
                      </AvocatName>
                      {hasRPCSpecialization(avocat) && (
                        <SpecializationTag colors={colors}>RPC</SpecializationTag>
                      )}
                    </div>
                  </AvocatHeader>
                  <AvocatContent>
                    {avocat.email && (
                      <AvocatEmail href={`mailto:${avocat.email}`} colors={colors}>
                        <FaEnvelope style={{ fontSize: '12px' }} /> {avocat.email}
                      </AvocatEmail>
                    )}
                    {avocat.telephonePublic1 && (
                      <AvocatPhone href={`tel:${avocat.telephonePublic1}`} colors={colors}>
                        <FaPhone /> {avocat.telephonePublic1}
                      </AvocatPhone>
                    )}
                    {avocat.telephonePublic2 && (
                      <AvocatPhone href={`tel:${avocat.telephonePublic2}`} colors={colors}>
                        <FaPhone /> {avocat.telephonePublic2}
                      </AvocatPhone>
                    )}
                    {avocat.telephonePrive && (
                      <AvocatPhone href={`tel:${avocat.telephonePrive}`} isPrivate={true} colors={colors}>
                        <FaPhone /> {avocat.telephonePrive} <PrivateTag colors={colors}>privé</PrivateTag>
                      </AvocatPhone>
                    )}
                  </AvocatContent>
                </AvocatCard>
              ))}
            </AvocatsGrid>
          ) : (
            <EmptyMessage colors={colors}>Aucun avocat désigné</EmptyMessage>
          )}
        </ExpandableSection>
        
        <ExpandableSection
          title="Conventions d'honoraires"
          defaultExpanded={true}
          headerAction={
            <TabActionButton onClick={() => setConventionModalOpen(true)} colors={colors}>
              <FaPlus />
              <span>Nouvelle convention</span>
            </TabActionButton>
          }
        >
          <ConventionsTable 
            conventions={beneficiaire.conventions} 
            beneficiaireId={id}
            avocats={beneficiaire.avocats || []} // Passer les avocats pour afficher leurs noms
            onUpdate={fetchBeneficiaire} // Raffraichir la liste après ajout/suppression
          />
        </ExpandableSection>
        
        <ExpandableSection
          title="Paiements"
          defaultExpanded={true}
          headerAction={
            <TabActionButton onClick={() => setPaiementModalOpen(true)} colors={colors}>
              <FaPlus />
              <span>Nouveau paiement</span>
            </TabActionButton>
          }
        >
          <PaiementsTable 
            paiements={beneficiaire.paiements} 
            beneficiaireId={id}
            onUpdate={fetchBeneficiaire} // Raffraichir la liste après ajout/suppression
          />
        </ExpandableSection>
      </TabsSection>

      <DocumentsSection beneficiaireId={id} />
            
      {/* Modal de modification */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier le bénéficiaire"
        size="medium"
      >
        <BeneficiaireForm 
          onSubmit={handleEditBeneficiaire}
          initialData={beneficiaire}
          isEditing
        />
      </Modal>
      
      {/* Modal d'ajout de convention */}
      <Modal
        isOpen={conventionModalOpen}
        onClose={() => setConventionModalOpen(false)}
        title="Ajouter une convention d'honoraires"
        size="medium"
      >
        <ConventionForm 
          onSubmit={handleAddConvention} 
          avocats={beneficiaire.avocats || []}
        />
      </Modal>
      
      {/* Modal d'ajout de paiement */}
      <Modal
        isOpen={paiementModalOpen}
        onClose={() => setPaiementModalOpen(false)}
        title="Ajouter un paiement"
        size="large"
      >
        <PaiementForm onSubmit={handleAddPaiement} />
      </Modal>
      
      {/* Modal d'ajout/modification d'avocats */}
      <Modal
        isOpen={avocatsModalOpen}
        onClose={() => setAvocatsModalOpen(false)}
        title="Gestion des avocats désignés"
        size="default"
        actions={
          <>
            <CancelButton onClick={() => setAvocatsModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <SaveButton onClick={handleAvocatsUpdate} colors={colors}>
              Enregistrer
            </SaveButton>
          </>
        }
      >
        <AvocatsModalContent colors={colors}>
          <ModalDescription colors={colors}>
            Ajoutez ou supprimez des avocats pour ce bénéficiaire.
          </ModalDescription>
          
          <SelectedAvocatsSection colors={colors}>
            {selectedAvocats.length === 0 ? (
              <EmptyAvocatsMessage colors={colors}>Aucun avocat sélectionné</EmptyAvocatsMessage>
            ) : (
              <SelectedAvocatsList>
                {selectedAvocats.map(avocat => (
                  <SelectedAvocatItem key={avocat._id} colors={colors}>
                    <AvocatInfo>
                      <AvocatIcon colors={colors}><FaUserTie /></AvocatIcon>
                      <AvocatDetails>
                        <AvocatNameRow>
                          <AvocatName colors={colors}>{avocat.nom.toUpperCase()} {avocat.prenom}</AvocatName>
                          {hasRPCSpecialization(avocat) && (
                            <SpecializationTag colors={colors}>RPC</SpecializationTag>
                          )}
                        </AvocatNameRow>
                        <AvocatEmailText colors={colors}>{avocat.email}</AvocatEmailText>
                      </AvocatDetails>
                    </AvocatInfo>
                    <RemoveButton onClick={() => removeAvocat(avocat._id)} colors={colors}>
                      <FaTimes />
                    </RemoveButton>
                  </SelectedAvocatItem>
                ))}
              </SelectedAvocatsList>
            )}
          </SelectedAvocatsSection>
          
          <SearchSection>
            <SearchBarWrapper colors={colors}>
              <SearchIcon colors={colors}><FaSearch /></SearchIcon>
              <SearchInput 
                type="text" 
                placeholder="Rechercher un avocat..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                colors={colors}
              />
            </SearchBarWrapper>
            
            {showSearchResults && (
              <SearchResultsDropdown colors={colors}>
                {searchResults.length === 0 ? (
                  <NoResultsMessage colors={colors}>
                    {searchTerm.trim() === '' ? 'Commencez à taper pour rechercher' : 'Aucun avocat trouvé'}
                  </NoResultsMessage>
                ) : (
                  searchResults.map(avocat => (
                    <SearchResultItem 
                      key={avocat._id} 
                      onClick={() => addAvocat(avocat)}
                      colors={colors}
                    >
                      <AvocatIcon colors={colors}><FaUserTie /></AvocatIcon>
                      <AvocatDetails>
                        <AvocatNameRow>
                          <AvocatName colors={colors}>{avocat.nom.toUpperCase()} {avocat.prenom}</AvocatName>
                          {hasRPCSpecialization(avocat) && (
                            <SpecializationTag colors={colors}>RPC</SpecializationTag>
                          )}
                        </AvocatNameRow>
                        <AvocatEmailText colors={colors}>{avocat.email}</AvocatEmailText>
                      </AvocatDetails>
                    </SearchResultItem>
                  ))
                )}
                <CloseResultsButton onClick={() => setShowSearchResults(false)} colors={colors}>
                  Fermer
                </CloseResultsButton>
              </SearchResultsDropdown>
            )}
          </SearchSection>
        </AvocatsModalContent>
      </Modal>
      
      {/* Modal de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer le bénéficiaire"
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
        <DeleteConfirmContent>
          <p>Êtes-vous sûr de vouloir supprimer définitivement ce bénéficiaire ?</p>
          <p><strong>Attention :</strong> Cette action supprimera également toutes les conventions et paiements associés.</p>
          
          {deleteError && <ErrorMessage colors={colors}>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>

      {/* Modal de détail d'avocat */}
      <Modal
        isOpen={avocatDetailModalOpen}
        onClose={() => setAvocatDetailModalOpen(false)}
        title="Détails de l'avocat"
        size="large"
      >
        {selectedAvocatDetail && (
          <AvocatDetail 
            avocat={selectedAvocatDetail} 
            onEditClick={() => {}}
            showEditButton={false} // Désactiver l'affichage du bouton Modifier
          />
        )}
      </Modal>
    </Container>
  );
};

// Styled Components avec thématisation complète

const AffaireLink = styled.div`
  font-size: 16px;
  color: ${props => props.colors.primary};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    text-decoration: underline;
    color: ${props => props.colors.primaryDark};
  }
`;

const MilitaireLink = styled.div`
  font-size: 16px;
  color: ${props => props.colors.primary};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    text-decoration: underline;
    color: ${props => props.colors.primaryDark};
  }
`;

const QualiteTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => {
    switch(props.qualite) {
      case 'Militaire':
        return `
          background-color: ${props.colors.successBg};
          color: ${props.colors.success};
          border: 1px solid ${props.colors.success}40;
        `;
      case 'Conjoint':
        return `
          background-color: ${props.colors.cardIcon.affaires.bg};
          color: ${props.colors.cardIcon.affaires.color};
          border: 1px solid ${props.colors.cardIcon.affaires.color}40;
        `;
      case 'Enfant':
        return `
          background-color: ${props.colors.warningBg};
          color: ${props.colors.warning};
          border: 1px solid ${props.colors.warning}40;
        `;
      case 'Parent':
        return `
          background-color: ${props.colors.cardIcon.finances.bg};
          color: ${props.colors.cardIcon.finances.color};
          border: 1px solid ${props.colors.cardIcon.finances.color}40;
        `;
      default:
        return `
          background-color: ${props.colors.surfaceHover};
          color: ${props.colors.textMuted};
          border: 1px solid ${props.colors.borderLight};
        `;
    }
  }}
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => props.status === 'archived' ? `
    background-color: ${props.colors.surfaceHover};
    color: ${props.colors.textMuted};
    border: 1px solid ${props.colors.borderLight};
  ` : props.status === 'active' ? `
    background-color: ${props.colors.successBg};
    color: ${props.colors.success};
    border: 1px solid ${props.colors.success}40;
  ` : ''}
`;

const MissingValue = styled.div`
  color: ${props => props.colors.error};
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s ease;
`;

const SpecializationTag = styled.span`
  display: inline-block;
  background-color: ${props => props.colors.error};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 8px;
  transition: all 0.3s ease;
`;

const FinancesSection = styled.section`
  margin-bottom: 24px;
`;

const FinancesSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const FinanceCard = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.colors.shadowHover};
    transform: translateY(-1px);
  }
`;

const FinanceTitle = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 8px;
  transition: color 0.3s ease;
`;

const FinanceValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${props => props.colors.primary};
  margin-bottom: 8px;
  transition: color 0.3s ease;
`;

const FinanceDetail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  padding-top: 8px;
  border-top: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
`;

const TabsSection = styled.section`
  margin-bottom: 24px;
`;

const TabActionButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: ${props => props.colors.shadow};
  
  svg {
    margin-right: 4px;
  }
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const AvocatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const AvocatCard = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.colors.shadowHover};
    transform: translateY(-1px);
  }
`;

const AvocatContent = styled.div`
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid ${props => props.colors.borderLight};
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.3s ease;
`;

const AvocatPhone = styled.a`
  font-size: 14px;
  color: ${props => props.isPrivate ? props.colors.error : props.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  
  svg {
    font-size: 12px;
  }
  
  &:hover {
    text-decoration: underline;
    color: ${props => props.isPrivate ? props.colors.error + 'dd' : props.colors.primaryDark};
  }
`;

const PrivateTag = styled.span`
  font-size: 10px;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-weight: 500;
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
`;

const AvocatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  
  svg {
    color: ${props => props.colors.primary};
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const AvocatName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => props.colors.primary};
  }
`;

const AvocatNameRow = styled.div`
  display: flex;
  align-items: center;
`;

const AvocatEmail = styled.a`
  font-size: 14px;
  color: ${props => props.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    text-decoration: underline;
    color: ${props => props.colors.primaryDark};
  }
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  border: 1px solid ${props => props.colors.borderLight};
  font-style: italic;
  transition: all 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
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
  box-shadow: ${props => props.colors.shadow};
  
  &:hover {
    background-color: ${props => props.colors.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  &.delete {
    color: ${props => props.colors.error};
    border-color: ${props => props.colors.error};
    
    &:hover {
      background-color: ${props => props.colors.error};
      color: white;
    }
  }
  
  svg {
    margin-right: 6px;
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const DeleteConfirmContent = styled.div`
  color: ${props => props.colors ? props.colors.textPrimary : '#333'};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 16px;
    color: ${props => props.colors ? props.colors.textPrimary : '#333'};
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
  
  &:hover {
    background-color: ${props => props.colors.borderLight};
    border-color: ${props => props.colors.primary};
    color: ${props => props.colors.primary};
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
  box-shadow: ${props => props.colors.shadow};
  
  &:hover {
    background-color: ${props => props.colors.error}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const SaveButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.colors.shadow};
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const AvocatsModalContent = styled.div`
  padding: 16px 0;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const ModalDescription = styled.p`
  margin-bottom: 16px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const SelectedAvocatsSection = styled.div`
  margin-bottom: 16px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 12px;
  background-color: ${props => props.colors.surfaceHover};
  transition: all 0.3s ease;
`;

const SelectedAvocatsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const SelectedAvocatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.colors.surface};
    border-radius: 4px;
  }
`;

const AvocatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AvocatIcon = styled.div`
  color: ${props => props.colors.primary};
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
`;

const AvocatDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AvocatEmailText = styled.div`
  font-size: 12px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.colors.error};
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.colors.error}dd;
    background-color: ${props => props.colors.errorBg};
  }
`;

const SearchSection = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchBarWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  overflow: hidden;
  background-color: ${props => props.colors.surface};
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  padding: 10px 0;
  font-size: 14px;
  outline: none;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &::placeholder {
    color: ${props => props.colors.textMuted};
  }
`;

const SearchResultsDropdown = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadowHover};
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NoResultsMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  font-style: italic;
  transition: color 0.3s ease;
`;

const CloseResultsButton = styled.button`
  width: 100%;
  padding: 8px;
  text-align: center;
  background-color: ${props => props.colors.surfaceHover};
  border: none;
  border-top: 1px solid ${props => props.colors.borderLight};
  color: ${props => props.colors.textSecondary};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const EmptyAvocatsMessage = styled.div`
  padding: 16px;
  text-align: center;
  font-style: italic;
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
`;

export default DetailBeneficiaire;