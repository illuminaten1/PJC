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
import {
  HeaderCard,
  HeaderGrid,
  HeaderItem,
  HeaderLabel,
  HeaderValue,
  ArchiveNote
} from '../components/common/HeaderComponents';

const DetailBeneficiaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
      <Container>
        <PageHeader 
          title="Détails du bénéficiaire" 
          backButton
        />
        <Loading>Chargement des détails du bénéficiaire...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <PageHeader 
          title="Détails du bénéficiaire" 
          backButton
        />
        <Error>{error}</Error>
      </Container>
    );
  }
  
  // Calculer les totaux financiers
  const totalConventions = beneficiaire.conventions.reduce((sum, convention) => sum + (convention.montant || 0), 0);
  const totalPaiements = beneficiaire.paiements.reduce((sum, paiement) => sum + (paiement.montant || 0), 0);
  const paiementRatio = totalConventions > 0 ? (totalPaiements / totalConventions) * 100 : 0;
  
  return (
    <Container>
      <PageHeader 
        title={`${beneficiaire.prenom} ${beneficiaire.nom}`}
        subtitle={`Bénéficiaire ${beneficiaire.qualite} - ${beneficiaire.numeroDecision ? `Décision n°${beneficiaire.numeroDecision}` : 'Sans numéro de décision'}`}
        backButton
        actionButton={
          <ActionButtons>
            <ActionButton onClick={() => setEditModalOpen(true)} title="Modifier le bénéficiaire">
              <FaEdit />
              <ButtonText>Modifier</ButtonText>
            </ActionButton>
            
            <ActionButton 
              onClick={() => setDeleteModalOpen(true)} 
              title="Supprimer le bénéficiaire"
              className="delete"
            >
              <FaTrash />
              <ButtonText>Supprimer</ButtonText>
            </ActionButton>
          </ActionButtons>
        }
      />
      
      <HeaderCard>
        <HeaderGrid>
          <HeaderItem>
            <HeaderLabel>Affaire</HeaderLabel>
            <AffaireLink onClick={() => navigateToAffaire(beneficiaire.militaire.affaire._id)}>
              {beneficiaire.militaire.affaire.nom}
            </AffaireLink>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Militaire créateur de droit</HeaderLabel>
            <MilitaireLink onClick={() => navigateToMilitaire(beneficiaire.militaire._id)}>
              {beneficiaire.militaire.grade} {beneficiaire.militaire.prenom} {beneficiaire.militaire.nom}
            </MilitaireLink>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Qualité du bénéficiaire</HeaderLabel>
            <QualiteTag qualite={beneficiaire.qualite}>
              {beneficiaire.qualite}
            </QualiteTag>
          </HeaderItem>

          <HeaderItem>
            <HeaderLabel>Statut d'archivage</HeaderLabel>
            <StatusTag status={beneficiaire.archive ? 'archived' : 'active'}>
              {beneficiaire.archive ? 'Archivé' : 'Actif'}
            </StatusTag>
            {beneficiaire.archive && (
              <ArchiveNote>
                Ce bénéficiaire est archivé car il fait partie d'une affaire archivée.
                Pour le désarchiver, veuillez désarchiver l'affaire correspondante.
              </ArchiveNote>
            )}
          </HeaderItem>
        </HeaderGrid>
        
        <HeaderGrid>
        <HeaderItem>
            <HeaderLabel>Date des faits</HeaderLabel>
            <HeaderValue>
              {affaire && affaire.dateFaits ? 
                formatDate(affaire.dateFaits) : 
                'Non définie'}
            </HeaderValue>
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Numéro de décision</HeaderLabel>
            {beneficiaire.numeroDecision ? (
              <HeaderValue>{beneficiaire.numeroDecision}</HeaderValue>
            ) : (
              <MissingValue>Non attribué</MissingValue>
            )}
          </HeaderItem>

          <HeaderItem>
            <HeaderLabel>Date de la décision</HeaderLabel>
            {beneficiaire.dateDecision ? (
              <HeaderValue>{formatDate(beneficiaire.dateDecision)}</HeaderValue>
            ) : (
              <MissingValue>Non définie</MissingValue>
            )}
          </HeaderItem>
          
          <HeaderItem>
            <HeaderLabel>Rédacteur en charge</HeaderLabel>
            <HeaderValue>{beneficiaire.militaire.affaire.redacteur}</HeaderValue>
          </HeaderItem>
        </HeaderGrid>
      </HeaderCard>
      
      <FinancesSection>
        <FinancesSummary>
          <FinanceCard>
            <FinanceTitle>Montant engagé</FinanceTitle>
            <FinanceValue>{totalConventions.toLocaleString('fr-FR')} € HT</FinanceValue>
            <FinanceDetail>
              <span>Conventions :</span>
              <span>{beneficiaire.conventions.length}</span>
            </FinanceDetail>
          </FinanceCard>
          
          <FinanceCard>
            <FinanceTitle>Montant payé</FinanceTitle>
            <FinanceValue>{totalPaiements.toLocaleString('fr-FR')} € TTC</FinanceValue>
            <FinanceDetail>
              <span>Paiements :</span>
              <span>{beneficiaire.paiements.length}</span>
            </FinanceDetail>
          </FinanceCard>
          
          <FinanceCard>
            <FinanceTitle>Ratio de paiement</FinanceTitle>
            <FinanceValue>{paiementRatio.toFixed(1)} %</FinanceValue>
            <FinanceDetail>
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
            <TabActionButton onClick={() => setAvocatsModalOpen(true)}>
              <FaPlus />
              <span>Ajouter / Modifier avocats</span>
            </TabActionButton>
          }
        >
        {beneficiaire.avocats && beneficiaire.avocats.length > 0 ? (
          <AvocatsGrid>
            {beneficiaire.avocats.map((avocat, index) => (
              <AvocatCard key={index}>
                <AvocatHeader>
                  <FaUserTie />
                  <div>
                  <AvocatName 
                    onClick={() => handleOpenAvocatDetail(avocat)} 
                    style={{ cursor: 'pointer', color: '#3f51b5' }}
                  >
                    Me {avocat.prenom} {avocat.nom}
                  </AvocatName>
                    {hasRPCSpecialization(avocat) && (
                      <SpecializationTag>RPC</SpecializationTag>
                    )}
                  </div>
                </AvocatHeader>
                <AvocatContent>
                  {avocat.email && (
                    <AvocatEmail href={`mailto:${avocat.email}`}>
                      <FaEnvelope style={{ fontSize: '12px' }} /> {avocat.email}
                    </AvocatEmail>
                  )}
                  {avocat.telephonePublic1 && (
                    <AvocatPhone href={`tel:${avocat.telephonePublic1}`}>
                      <FaPhone /> {avocat.telephonePublic1}
                    </AvocatPhone>
                  )}
                  {avocat.telephonePublic2 && (
                    <AvocatPhone href={`tel:${avocat.telephonePublic2}`}>
                      <FaPhone /> {avocat.telephonePublic2}
                    </AvocatPhone>
                  )}
                  {avocat.telephonePrive && (
                    <AvocatPhone href={`tel:${avocat.telephonePrive}`} isPrivate={true}>
                      <FaPhone /> {avocat.telephonePrive} <PrivateTag>privé</PrivateTag>
                    </AvocatPhone>
                  )}
                </AvocatContent>
              </AvocatCard>
            ))}
          </AvocatsGrid>
        ) : (
          <EmptyMessage>Aucun avocat désigné</EmptyMessage>
        )}
        </ExpandableSection>
        
        <ExpandableSection
          title="Conventions d'honoraires"
          defaultExpanded={true}
          headerAction={
            <TabActionButton onClick={() => setConventionModalOpen(true)}>
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
            <TabActionButton onClick={() => setPaiementModalOpen(true)}>
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
            <CancelButton onClick={() => setAvocatsModalOpen(false)}>
              Annuler
            </CancelButton>
            <SaveButton onClick={handleAvocatsUpdate}>
              Enregistrer
            </SaveButton>
          </>
        }
      >
        <AvocatsModalContent>
          <ModalDescription>
            Ajoutez ou supprimez des avocats pour ce bénéficiaire.
          </ModalDescription>
          
          <SelectedAvocatsSection>
            {selectedAvocats.length === 0 ? (
              <EmptyAvocatsMessage>Aucun avocat sélectionné</EmptyAvocatsMessage>
            ) : (
              <SelectedAvocatsList>
                {selectedAvocats.map(avocat => (
                  <SelectedAvocatItem key={avocat._id}>
                    <AvocatInfo>
                      <AvocatIcon><FaUserTie /></AvocatIcon>
                      <AvocatDetails>
                        <AvocatNameRow>
                          <AvocatName>{avocat.nom.toUpperCase()} {avocat.prenom}</AvocatName>
                          {hasRPCSpecialization(avocat) && (
                            <SpecializationTag>RPC</SpecializationTag>
                          )}
                        </AvocatNameRow>
                        <AvocatEmailText>{avocat.email}</AvocatEmailText>
                      </AvocatDetails>
                    </AvocatInfo>
                    <RemoveButton onClick={() => removeAvocat(avocat._id)}>
                      <FaTimes />
                    </RemoveButton>
                  </SelectedAvocatItem>
                ))}
              </SelectedAvocatsList>
            )}
          </SelectedAvocatsSection>
          
          <SearchSection>
            <SearchBarWrapper>
              <SearchIcon><FaSearch /></SearchIcon>
              <SearchInput 
                type="text" 
                placeholder="Rechercher un avocat..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
              />
            </SearchBarWrapper>
            
            {showSearchResults && (
              <SearchResultsDropdown>
                {searchResults.length === 0 ? (
                  <NoResultsMessage>
                    {searchTerm.trim() === '' ? 'Commencez à taper pour rechercher' : 'Aucun avocat trouvé'}
                  </NoResultsMessage>
                ) : (
                  searchResults.map(avocat => (
                    <SearchResultItem 
                      key={avocat._id} 
                      onClick={() => addAvocat(avocat)}
                    >
                      <AvocatIcon><FaUserTie /></AvocatIcon>
                      <AvocatDetails>
                        <AvocatNameRow>
                          <AvocatName>{avocat.nom.toUpperCase()} {avocat.prenom}</AvocatName>
                          {hasRPCSpecialization(avocat) && (
                            <SpecializationTag>RPC</SpecializationTag>
                          )}
                        </AvocatNameRow>
                        <AvocatEmailText>{avocat.email}</AvocatEmailText>
                      </AvocatDetails>
                    </SearchResultItem>
                  ))
                )}
                <CloseResultsButton onClick={() => setShowSearchResults(false)}>
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
            <CancelButton onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={handleDelete}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent>
          <p>Êtes-vous sûr de vouloir supprimer définitivement ce bénéficiaire ?</p>
          <p><strong>Attention :</strong> Cette action supprimera également toutes les conventions et paiements associés.</p>
          
          {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
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

// Styles des composants

const Container = styled.div`
  padding: 20px;
`;

const AffaireLink = styled.div`
  font-size: 16px;
  color: #3f51b5;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MilitaireLink = styled.div`
  font-size: 16px;
  color: #3f51b5;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const QualiteTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch(props.qualite) {
      case 'Militaire':
        return `
          background-color: #e8f5e9;
          color: #388e3c;
        `;
      case 'Conjoint':
        return `
          background-color: #e3f2fd;
          color: #1976d2;
        `;
      case 'Enfant':
        return `
          background-color: #fff8e1;
          color: #f57f17;
        `;
      case 'Parent':
        return `
          background-color: #f3e5f5;
          color: #8e24aa;
        `;
      default:
        return `
          background-color: #f5f5f5;
          color: #757575;
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
  
  ${props => props.status === 'archived' ? `
    background-color: #f5f5f5;
    color: #757575;
  ` : props.status === 'active' ? `
    background-color: #e8f5e9;
    color: #388e3c;
  ` : ''}
`;

const MissingValue = styled.div`
  color: #f44336;
  font-size: 16px;
  font-weight: 500;
`;

const SpecializationTag = styled.span`
  display: inline-block;
  background-color: #ff5722;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 8px;
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
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  text-align: center;
`;

const FinanceTitle = styled.div`
  font-size: 14px;
  color: #757575;
  margin-bottom: 8px;
`;

const FinanceValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #3f51b5;
  margin-bottom: 8px;
`;

const FinanceDetail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #757575;
  padding-top: 8px;
  border-top: 1px solid #eee;
`;

const TabsSection = styled.section`
  margin-bottom: 24px;
`;

const TabActionButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 4px;
  }
  
  &:hover {
    background-color: #303f9f;
  }
`;

const AvocatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const AvocatCard = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const AvocatContent = styled.div`
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AvocatPhone = styled.a`
  font-size: 14px;
  color: ${props => props.isPrivate ? '#f44336' : '#3f51b5'};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    font-size: 12px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const PrivateTag = styled.span`
  font-size: 10px;
  color: #f44336;
  background-color: #ffebee;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-weight: 500;
`;

const AvocatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  
  svg {
    color: #3f51b5;
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const AvocatName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const AvocatNameRow = styled.div`
  display: flex;
  align-items: center;
`;

const AvocatEmail = styled.a`
  font-size: 14px;
  color: #3f51b5;
  text-decoration: none;
  display: block;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #757575;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background-color: #fff;
  color: #3f51b5;
  border: 1px solid #3f51b5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #3f51b5;
    color: #fff;
  }
  
  &.delete {
    color: #f44336;
    border-color: #f44336;
    
    &:hover {
      background-color: #f44336;
      color: #fff;
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
  p {
    margin-bottom: 16px;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-top: 12px;
  font-size: 14px;
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

const SaveButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #303f9f;
  }
`;

const AvocatsModalContent = styled.div`
  padding: 16px 0;
`;

const ModalDescription = styled.p`
  margin-bottom: 16px;
  color: #757575;
`;

// Styles pour la liste des avocats sélectionnés
const SelectedAvocatsSection = styled.div`
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  background-color: #f9f9f9;
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
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AvocatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AvocatIcon = styled.div`
  color: #3f51b5;
  display: flex;
  align-items: center;
`;

const AvocatDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AvocatEmailText = styled.div`
  font-size: 12px;
  color: #757575;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #d32f2f;
  }
`;

// Styles pour la section de recherche
const SearchSection = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchBarWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: #757575;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  padding: 10px 0;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #3f51b5;
  }
`;

const SearchResultsDropdown = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NoResultsMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #757575;
`;

const CloseResultsButton = styled.button`
  width: 100%;
  padding: 8px;
  text-align: center;
  background-color: #f5f5f5;
  border: none;
  border-top: 1px solid #e0e0e0;
  color: #616161;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const EmptyAvocatsMessage = styled.div`
  padding: 16px;
  text-align: center;
  font-style: italic;
  color: #757575;
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: #757575;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export default DetailBeneficiaire;