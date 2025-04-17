import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaExchangeAlt, FaHistory, FaArrowLeft, FaDownload, FaUpload, FaUndo } from 'react-icons/fa';
import { parametresAPI, templatesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import ExpandableSection from '../components/common/ExpandableSection';
import Modal from '../components/common/Modal';

const Parametres = () => {
  const [parametres, setParametres] = useState({
    circonstances: [],
    redacteurs: [],
    templateConvention: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [circonstanceInput, setCirconstanceInput] = useState('');
  const [redacteurInput, setRedacteurInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // États pour le modal de confirmation
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ type: '', index: -1, value: '' });
  
  // États pour le modal de transfert de portefeuille
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceRedacteur, setSourceRedacteur] = useState('');
  const [targetRedacteur, setTargetRedacteur] = useState('');
  const [transferInProgress, setTransferInProgress] = useState(false);
  
  // États pour l'historique des transferts
  const [historiqueModeOpen, setHistoriqueModeOpen] = useState(false);
  const [historiqueTransferts, setHistoriqueTransferts] = useState([]);
  const [historiqueLoading, setHistoriqueLoading] = useState(false);

  // Nouveaux états pour les templates
  const [templates, setTemplates] = useState({
    convention: { name: 'Convention d\'honoraires', filename: 'convention_template.odt', status: 'default' },
    reglement: { name: 'Fiche de règlement', filename: 'reglement_template.odt', status: 'default' }
  });
  const [templateLoading, setTemplateLoading] = useState(false);
  const conventionInputRef = useRef(null);
  const reglementInputRef = useRef(null);
  const [templateRestoreModalOpen, setTemplateRestoreModalOpen] = useState(false);
  const [templateToRestore, setTemplateToRestore] = useState('');

  useEffect(() => {
    fetchParametres();
    fetchTemplatesStatus();
  }, []);
  
  const fetchParametres = async () => {
    setLoading(true);
    try {
      const response = await parametresAPI.getAll();
      setParametres(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des paramètres", err);
      setError("Impossible de charger les paramètres");
    } finally {
      setLoading(false);
    }
  };
  
  // Récupérer le statut des templates (personnalisé ou par défaut)
  const fetchTemplatesStatus = async () => {
    try {
      const response = await templatesAPI.getStatus();
      setTemplates(prevTemplates => ({
        ...prevTemplates,
        convention: { 
          ...prevTemplates.convention, 
          status: response.data.convention || 'default' 
        },
        reglement: { 
          ...prevTemplates.reglement, 
          status: response.data.reglement || 'default' 
        }
      }));
    } catch (err) {
      console.error("Erreur lors de la récupération du statut des templates", err);
    }
  };
  
  const handleAddCirconstance = async () => {
    if (!circonstanceInput.trim()) return;
    
    try {
      await parametresAPI.addValue('circonstances', circonstanceInput);
      setCirconstanceInput('');
      showSuccessMessage('Circonstance ajoutée avec succès');
      fetchParametres();
    } catch (err) {
      console.error("Erreur lors de l'ajout de la circonstance", err);
      setError("Impossible d'ajouter la circonstance");
    }
  };
  
  const openDeleteConfirmation = (type, index, value) => {
    setItemToDelete({ type, index, value });
    setConfirmModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      if (itemToDelete.type === 'circonstances') {
        await parametresAPI.deleteValue('circonstances', itemToDelete.index);
        showSuccessMessage('Circonstance supprimée avec succès');
      } else if (itemToDelete.type === 'redacteurs') {
        await parametresAPI.deleteValue('redacteurs', itemToDelete.index);
        showSuccessMessage('Rédacteur supprimé avec succès');
      }
      
      setConfirmModalOpen(false);
      fetchParametres();
    } catch (err) {
      console.error(`Erreur lors de la suppression du ${itemToDelete.type}`, err);
      setError(`Impossible de supprimer ${itemToDelete.type === 'circonstances' ? 'la circonstance' : 'le rédacteur'}`);
      setConfirmModalOpen(false);
    }
  };
  
  const handleAddRedacteur = async () => {
    if (!redacteurInput.trim()) return;
    
    try {
      await parametresAPI.addValue('redacteurs', redacteurInput);
      setRedacteurInput('');
      showSuccessMessage('Rédacteur ajouté avec succès');
      fetchParametres();
    } catch (err) {
      console.error("Erreur lors de l'ajout du rédacteur", err);
      setError("Impossible d'ajouter le rédacteur");
    }
  };
  
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Gestionnaires pour la touche Entrée
  const handleCirconstanceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCirconstance();
    }
  };

  const handleRedacteurKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRedacteur();
    }
  };
  
  // Ouvrir le modal de transfert de portefeuille
  const openTransferModal = () => {
    setSourceRedacteur('');
    setTargetRedacteur('');
    setTransferModalOpen(true);
  };
  
  // Ouvrir le mode historique et charger les données
  const openHistoriqueMode = async () => {
    setHistoriqueModeOpen(true);
    setHistoriqueLoading(true);
    
    try {
      const response = await parametresAPI.getTransferHistory();
      setHistoriqueTransferts(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique des transferts", err);
      setError("Impossible de charger l'historique des transferts");
    } finally {
      setHistoriqueLoading(false);
    }
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Effectuer le transfert de portefeuille
  const handleTransferPortfolio = async () => {
    if (!sourceRedacteur || !targetRedacteur || sourceRedacteur === targetRedacteur) {
      setError("Veuillez sélectionner deux rédacteurs différents pour le transfert");
      return;
    }
    
    setTransferInProgress(true);
    
    try {
      // Appel à l'API pour effectuer le transfert
      const response = await parametresAPI.transferPortfolio(sourceRedacteur, targetRedacteur);
      showSuccessMessage(`Portefeuille transféré avec succès de "${sourceRedacteur}" à "${targetRedacteur}". ${response.data.affairesModifiees} affaires modifiées.`);
      setTransferModalOpen(false);
    } catch (err) {
      console.error("Erreur lors du transfert de portefeuille", err);
      setError("Impossible de transférer le portefeuille. Veuillez réessayer.");
    } finally {
      setTransferInProgress(false);
    }
  };
  
  // Télécharger un template
  const handleDownloadTemplate = async (templateType) => {
    console.log(`Tentative de téléchargement du template ${templateType}`);
    setTemplateLoading(true);
    try {
      console.log(`Appel de templatesAPI.downloadTemplate('${templateType}')`);
      const response = await templatesAPI.downloadTemplate(templateType);
      console.log('Réponse reçue:', response);
      
      // Créer un lien pour télécharger le document
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', templates[templateType].filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccessMessage(`Template ${templates[templateType].name} téléchargé avec succès`);
    } catch (err) {
      console.error(`Erreur lors du téléchargement du template ${templateType}:`, err);
      console.error('Détails:', err.response?.data || err.message);
      setError(`Impossible de télécharger le template ${templates[templateType].name}`);
    } finally {
      setTemplateLoading(false);
    }
  };
  
  // Restaurer un template par défaut
  const handleRestoreTemplate = async () => {
    if (!templateToRestore) return;
    
    setTemplateLoading(true);
    try {
      await templatesAPI.restoreTemplate(templateToRestore);
      
      setTemplates(prevTemplates => ({
        ...prevTemplates,
        [templateToRestore]: {
          ...prevTemplates[templateToRestore],
          status: 'default'
        }
      }));
      
      setTemplateRestoreModalOpen(false);
      showSuccessMessage(`Template ${templates[templateToRestore].name} restauré avec succès`);
    } catch (err) {
      console.error(`Erreur lors de la restauration du template ${templateToRestore}`, err);
      setError(`Impossible de restaurer le template ${templates[templateToRestore].name}`);
    } finally {
      setTemplateLoading(false);
    }
  };
  
  // Déclencher le clic sur l'input file
  const triggerFileInput = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.click();
    }
  };
  
  // Upload d'un template personnalisé
  const handleUploadTemplate = async (event, templateType) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Vérifier l'extension du fichier
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'odt') {
      setError(`Le fichier doit être au format ODT (.odt)`);
      return;
    }
    
    setTemplateLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('template', file);
      
      console.log(`Envoi du template ${templateType}:`, file.name);
      
      await templatesAPI.uploadTemplate(templateType, formData);
      
      console.log(`Template ${templateType} uploadé avec succès`);
      
      setTemplates(prevTemplates => ({
        ...prevTemplates,
        [templateType]: {
          ...prevTemplates[templateType],
          status: 'custom'
        }
      }));
      
      showSuccessMessage(`Template ${templates[templateType].name} mis à jour avec succès`);
    } catch (err) {
      console.error(`Erreur lors de l'upload du template ${templateType}:`, err);
      setError(`Impossible d'uploader le template ${templates[templateType].name}: ${err.response?.data?.message || err.message}`);
    } finally {
      setTemplateLoading(false);
      // Réinitialiser l'input file
      if (templateType === 'convention' && conventionInputRef.current) {
        conventionInputRef.current.value = '';
      } else if (templateType === 'reglement' && reglementInputRef.current) {
        reglementInputRef.current.value = '';
      }
    }
  };
  
  // Ouvrir le modal de confirmation de restauration
  const openRestoreConfirmation = (templateType) => {
    setTemplateToRestore(templateType);
    setTemplateRestoreModalOpen(true);
  };
  
  if (loading) {
    return (
      <Container>
        <PageHeader title="Paramètres" />
        <Loading>Chargement des paramètres...</Loading>
      </Container>
    );
  }
  
  return (
    <Container>
      <PageHeader 
        title="Paramètres" 
        subtitle="Configuration de l'application"
      />
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      <Section>
        <ExpandableSection
          title="Documentation"
          defaultExpanded={false}
        >
          <DocumentationContent>
            <h3>Guide d'utilisation</h3>
            <p>Cette application permet la gestion des dossiers de protection juridique complémentaire pour les militaires ou leurs ayants-droits.</p>
            
            <h4>Structure des données</h4>
            <ul>
              <li><strong>Affaires</strong> : Regroupements des affaires (ex: accident de l'autoroute A13)</li>
              <li><strong>Militaires</strong> : Les militaires blessés ou décédés en service qui génèrent le droit à cette protection juridique complémentaire</li>
              <li><strong>Bénéficiaires</strong> : Soit le militaire lui-même (s'il est blessé), soit ses ayants-droits</li>
            </ul>
            
            <h4>Fonctionnalités principales</h4>
            <ul>
              <li>Gestion hiérarchique des dossiers</li>
              <li>Suivi des conventions d'honoraires et des paiements</li>
              <li>Génération de documents (conventions, fiches de règlement, fiches de suivi)</li>
              <li>Statistiques et tableaux de bord</li>
            </ul>

            <h4>Modifier les circonstances ou les rédacteurs</h4>
            <ul>
              <li>Pour les <strong>rédacteurs</strong>, ajouter la nouvelle recrue, utiliser l'option "Transférer un portefeuille" pour réaffecter tous les dossiers puis supprimer l'ancien rédacteur.</li>
              <li>Pour les <strong>circonstance</strong> ajouter d'abord la nouvelle sans supprimer l'ancienne et modifier les dossiers en conséquences, puis supprimer l'ancienne.</li>
              <li>La suppression d'une circonstance ou d'un rédacteur ne supprime pas la valeur en question dans les dossiers déjà créés.</li>
            </ul>
            
            <h4>Personnalisation des templates de documents</h4>
            <ul>
              <li>Vous pouvez <strong>télécharger</strong> les templates existants pour voir leur structure</li>
              <li>Utilisez LibreOffice ou OpenOffice pour modifier les templates (format ODT)</li>
              <li>Ne modifiez pas les variables entre accolades comme {"{d.beneficiaire.nom}"} - elles seront remplacées par les données</li>
              <li>Après modification, <strong>uploadez</strong> le template personnalisé</li>
              <li>Si besoin, vous pouvez <strong>restaurer</strong> le template par défaut à tout moment</li>
            </ul>

            <h4>Variables disponibles pour les conventions d'honoraires:</h4>
            <ul>
              <li>{"{d.beneficiaire.prenom}"}</li>
              <li>{"{d.beneficiaire.nom}"}</li>
              <li>{"{d.beneficiaire.qualite}"}</li>
              <li>{"{d.beneficiaire.numeroDecision}"}</li>
              <li>{"{d.beneficiaire.dateDecision}"}</li>

              <li>{"{d.militaire.grade}"}</li>
              <li>{"{d.militaire.prenom}"}</li>
              <li>{"{d.militaire.nom}"}</li>
              <li>{"{d.militaire.unite}"}</li>

              <li>{"{d.affaire.nom}"}</li>
              <li>{"{d.affaire.lieu}"}</li>
              <li>{"{d.affaire.dateFaits}"}</li>
              <li>{"{d.affaire.redacteur}"}</li>

              <li>{"{d.avocat.prenom}"}</li>
              <li>{"{d.avocat.nom}"}</li>
              <li>{"{d.avocat.email}"}</li>

              <li>{"{d.convention.montant}"}</li>
              <li>{"{d.convention.pourcentageResultats}"}</li>

              <li>{"{d.dateDocument}"}</li>
            </ul>

            <h4>Variables disponibles pour les fiches de règlement:</h4>
            <ul>
              <li>{"{d.beneficiaire.prenom}"}</li>
              <li>{"{d.beneficiaire.nom}"}</li>
              <li>{"{d.beneficiaire.qualite}"}</li>
              <li>{"{d.beneficiaire.numeroDecision}"}</li>
              <li>{"{d.beneficiaire.dateDecision}"}</li>

              <li>{"{d.militaire.grade}"}</li>
              <li>{"{d.militaire.prenom}"}</li>
              <li>{"{d.militaire.nom}"}</li>
              <li>{"{d.militaire.unite}"}</li>

              <li>{"{d.affaire.nom}"}</li>
              <li>{"{d.affaire.lieu}"}</li>
              <li>{"{d.affaire.dateFaits}"}</li>
              <li>{"{d.affaire.redacteur}"}</li>

              <li>{"{d.paiement.montant}"}</li>
              <li>{"{d.paiement.type}"}</li>
              <li>{"{d.paiement.date}"}</li>
              <li>{"{d.paiement.referencePiece}"}</li>
              <li>{"{d.paiement.qualiteDestinataire}"}</li>
              <li>{"{d.paiement.identiteDestinataire}"}</li>
              <li>{"{d.paiement.adresseDestinataire}"}</li>
              <li>{"{d.paiement.siretRidet}"}</li>
              <li>{"{d.paiement.titulaireCompte}"}</li>
              <li>{"{d.paiement.codeEtablissement}"}</li>
              <li>{"{d.paiement.codeGuichet}"}</li>
              <li>{"{d.paiement.numeroCompte}"}</li>
              <li>{"{d.paiement.cleVerification}"}</li>

              <li>{"{d.dateDocument}"}</li>
            </ul>

          </DocumentationContent>
        </ExpandableSection>
      </Section>
      
      {/* Afficher le mode historique si activé */}
      {historiqueModeOpen ? (
        <Section>
          <HistoriqueHeader>
            <h2>Historique des transferts de portefeuille (30 derniers jours)</h2>
            <BackButton onClick={() => setHistoriqueModeOpen(false)}>
              <FaArrowLeft style={{ marginRight: '8px' }} />
              Retour aux paramètres
            </BackButton>
          </HistoriqueHeader>
          
          {historiqueLoading ? (
            <Loading>Chargement de l'historique...</Loading>
          ) : historiqueTransferts.length === 0 ? (
            <EmptyHistorique>
              Aucun transfert de portefeuille n'a été effectué durant les 30 derniers jours.
            </EmptyHistorique>
          ) : (
            <HistoriqueList>
              {historiqueTransferts.map((transfert, index) => (
                <HistoriqueItem key={index} status={transfert.statut}>
                  <HistoriqueDate>{formatDate(transfert.dateTransfert)}</HistoriqueDate>
                  <HistoriqueContent>
                    <div>
                      <strong>De:</strong> {transfert.sourceRedacteur}
                    </div>
                    <div>
                      <strong>Vers:</strong> {transfert.targetRedacteur}
                    </div>
                    <div>
                      <strong>Affaires modifiées:</strong> {transfert.affairesModifiees}
                    </div>
                    <div>
                      <strong>Statut:</strong> {transfert.statut}
                    </div>
                    {transfert.message && (
                      <HistoriqueMessage>
                        {transfert.message}
                      </HistoriqueMessage>
                    )}
                  </HistoriqueContent>
                </HistoriqueItem>
              ))}
            </HistoriqueList>
          )}
        </Section>
      ) : (
        <>
          {/* Section des templates de documents */}
          <Section>
            <ExpandableSection
              title="Templates de documents (voir la documentation avant de modifier)"
              defaultExpanded={true}
            >
              <TemplatesList>
                {/* Template de convention */}
                <TemplateItem>
                  <TemplateInfo>
                    <TemplateName>{templates.convention.name}</TemplateName>
                    <TemplateStatus status={templates.convention.status}>
                      {templates.convention.status === 'custom' ? 'Personnalisé' : 'Par défaut'}
                    </TemplateStatus>
                  </TemplateInfo>
                  <TemplateActions>
                    <TemplateButton 
                      title="Télécharger le template actuel"
                      onClick={() => handleDownloadTemplate('convention')}
                      disabled={templateLoading}
                      className="download"
                    >
                      <FaDownload />
                      <span>Télécharger</span>
                    </TemplateButton>
                    
                    <TemplateButton 
                      title="Uploader un template personnalisé"
                      onClick={() => triggerFileInput(conventionInputRef)}
                      disabled={templateLoading}
                      className="upload"
                    >
                      <FaUpload />
                      <span>Uploader</span>
                    </TemplateButton>
                    
                    <input
                      type="file"
                      ref={conventionInputRef}
                      style={{ display: 'none' }}
                      accept=".odt"
                      onChange={(e) => handleUploadTemplate(e, 'convention')}
                    />
                    
                    {templates.convention.status === 'custom' && (
                      <TemplateButton 
                        title="Restaurer le template par défaut"
                        onClick={() => openRestoreConfirmation('convention')}
                        disabled={templateLoading}
                        className="restore"
                      >
                        <FaUndo />
                        <span>Restaurer</span>
                      </TemplateButton>
                    )}
                  </TemplateActions>
                </TemplateItem>
                
                {/* Template de règlement */}
                <TemplateItem>
                  <TemplateInfo>
                    <TemplateName>{templates.reglement.name}</TemplateName>
                    <TemplateStatus status={templates.reglement.status}>
                      {templates.reglement.status === 'custom' ? 'Personnalisé' : 'Par défaut'}
                    </TemplateStatus>
                  </TemplateInfo>
                  <TemplateActions>
                    <TemplateButton 
                      title="Télécharger le template actuel"
                      onClick={() => handleDownloadTemplate('reglement')}
                      disabled={templateLoading}
                      className="download"
                    >
                      <FaDownload />
                      <span>Télécharger</span>
                    </TemplateButton>
                    
                    <TemplateButton 
                      title="Uploader un template personnalisé"
                      onClick={() => triggerFileInput(reglementInputRef)}
                      disabled={templateLoading}
                      className="upload"
                    >
                      <FaUpload />
                      <span>Uploader</span>
                    </TemplateButton>
                    
                    <input
                      type="file"
                      ref={reglementInputRef}
                      style={{ display: 'none' }}
                      accept=".odt"
                      onChange={(e) => handleUploadTemplate(e, 'reglement')}
                    />
                    
                    {templates.reglement.status === 'custom' && (
                      <TemplateButton 
                        title="Restaurer le template par défaut"
                        onClick={() => openRestoreConfirmation('reglement')}
                        disabled={templateLoading}
                        className="restore"
                      >
                        <FaUndo />
                        <span>Restaurer</span>
                      </TemplateButton>
                    )}
                  </TemplateActions>
                </TemplateItem>
              </TemplatesList>
            </ExpandableSection>
          </Section>

          <Section>
            <ExpandableSection
              title="Circonstances (voir la documentation avant de modifier)"
              defaultExpanded={true}
            >
              <ParametersList>
                {parametres.circonstances && parametres.circonstances.map((circonstance, index) => (
                  <ParameterItem key={index}>
                    <ParameterText>{circonstance}</ParameterText>
                    <DeleteButton onClick={() => openDeleteConfirmation('circonstances', index, circonstance)}>
                      <FaTrash />
                    </DeleteButton>
                  </ParameterItem>
                ))}
              </ParametersList>
              
              <AddParameterForm>
                <AddParameterInput
                  type="text"
                  value={circonstanceInput}
                  onChange={(e) => setCirconstanceInput(e.target.value)}
                  onKeyDown={handleCirconstanceKeyDown}
                  placeholder="Nouvelle circonstance..."
                />
                <AddButton onClick={handleAddCirconstance}>
                  <FaPlus />
                  <span>Ajouter</span>
                </AddButton>
              </AddParameterForm>
            </ExpandableSection>
          </Section>
          
          <Section>
            <ExpandableSection
              title="Rédacteurs (voir la documentation avant de modifier)"
              defaultExpanded={true}
            >
              <ParametersList>
                {parametres.redacteurs && parametres.redacteurs.map((redacteur, index) => (
                  <ParameterItem key={index}>
                    <ParameterText>{redacteur}</ParameterText>
                    <DeleteButton onClick={() => openDeleteConfirmation('redacteurs', index, redacteur)}>
                      <FaTrash />
                    </DeleteButton>
                  </ParameterItem>
                ))}
              </ParametersList>
              
              <AddParameterForm>
                <AddParameterInput
                  type="text"
                  value={redacteurInput}
                  onChange={(e) => setRedacteurInput(e.target.value)}
                  onKeyDown={handleRedacteurKeyDown}
                  placeholder="Nouveau rédacteur..."
                />
                <AddButton onClick={handleAddRedacteur}>
                  <FaPlus />
                  <span>Ajouter</span>
                </AddButton>
              </AddParameterForm>
              
              {/* Boutons pour le transfert et l'historique */}
              <ActionButtonsContainer>
                <TransferButton onClick={openTransferModal}>
                  <FaExchangeAlt />
                  <span>Transférer un portefeuille</span>
                </TransferButton>
                
                <HistoryButton onClick={openHistoriqueMode}>
                  <FaHistory />
                  <span>Voir l'historique des transferts</span>
                </HistoryButton>
              </ActionButtonsContainer>
            </ExpandableSection>
          </Section>
        </>
      )}
      
      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={itemToDelete.type === 'circonstances' ? "Supprimer la circonstance" : "Supprimer le rédacteur"}
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setConfirmModalOpen(false)}>
              Annuler
            </CancelButton>
            <DeleteConfirmButton onClick={handleConfirmDelete}>
              Supprimer
            </DeleteConfirmButton>
          </>
        }
      >
        <ConfirmContent>
          <p>
            Êtes-vous sûr de vouloir supprimer 
            {itemToDelete.type === 'circonstances' ? ' la circonstance ' : ' le rédacteur '}
            <strong>"{itemToDelete.value}"</strong> ?
          </p>
          <WarningText>
            {itemToDelete.type === 'circonstances' 
              ? "Cette circonstance ne sera plus disponible pour les nouvelles affaires, mais les affaires existantes ne seront pas modifiées."
              : "Ce rédacteur ne sera plus disponible pour les nouvelles affaires, mais les affaires existantes ne seront pas modifiées."
            }
          </WarningText>
          <WarningText>
            Veuillez consulter la documentation avant de procéder à cette suppression.
          </WarningText>
        </ConfirmContent>
      </Modal>
      
      {/* Modal de transfert de portefeuille */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => !transferInProgress && setTransferModalOpen(false)}
        title="Transférer un portefeuille"
        size="medium"
        actions={
          <>
            <CancelButton 
              onClick={() => setTransferModalOpen(false)}
              disabled={transferInProgress}
            >
              Annuler
            </CancelButton>
            <ConfirmButton 
              onClick={handleTransferPortfolio}
              disabled={!sourceRedacteur || !targetRedacteur || sourceRedacteur === targetRedacteur || transferInProgress}
            >
              {transferInProgress ? 'Transfert en cours...' : 'Transférer'}
            </ConfirmButton>
          </>
        }
      >
        <TransferContent>
          <p>
            Cette opération va transférer tous les dossiers d'un rédacteur vers un autre.
            Les affaires assignées au rédacteur source seront réassignées au rédacteur cible.
          </p>
          
          <SelectGroup>
            <label>Rédacteur source (ancien):</label>
            <Select
              value={sourceRedacteur}
              onChange={(e) => setSourceRedacteur(e.target.value)}
              disabled={transferInProgress}
            >
              <option value="">Sélectionner un rédacteur</option>
              {parametres.redacteurs && parametres.redacteurs.map((redacteur, index) => (
                <option key={index} value={redacteur}>{redacteur}</option>
              ))}
            </Select>
          </SelectGroup>
          
          <SelectGroup>
            <label>Rédacteur cible (nouveau):</label>
            <Select
              value={targetRedacteur}
              onChange={(e) => setTargetRedacteur(e.target.value)}
              disabled={transferInProgress}
            >
              <option value="">Sélectionner un rédacteur</option>
              {parametres.redacteurs && parametres.redacteurs.map((redacteur, index) => (
                <option key={index} value={redacteur}>{redacteur}</option>
              ))}
            </Select>
          </SelectGroup>
          
          <WarningText>
            Cette opération est irréversible. Assurez-vous d'avoir sélectionné les bons rédacteurs.
          </WarningText>
          
          {sourceRedacteur === targetRedacteur && sourceRedacteur !== '' && (
            <ErrorText>
              Les rédacteurs source et cible doivent être différents.
            </ErrorText>
          )}
        </TransferContent>
      </Modal>
      
      {/* Modal de confirmation de restauration de template */}
      <Modal
        isOpen={templateRestoreModalOpen}
        onClose={() => setTemplateRestoreModalOpen(false)}
        title={`Restaurer le template ${templateToRestore ? templates[templateToRestore].name : ''}`}
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setTemplateRestoreModalOpen(false)}>
              Annuler
            </CancelButton>
            <RestoreButton onClick={handleRestoreTemplate}>
              Restaurer
            </RestoreButton>
          </>
        }
      >
        <ConfirmContent>
          <p>
            Êtes-vous sûr de vouloir restaurer le template par défaut pour 
            <strong> {templateToRestore ? templates[templateToRestore].name : ''}</strong> ?
          </p>
          <WarningText>
            Cette action remplacera définitivement votre template personnalisé par le template par défaut.
          </WarningText>
        </ConfirmContent>
      </Modal>
    </Container>
  );
};

// Styles existants
const Container = styled.div`
  padding: 20px;
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const ParametersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
`;

const ParameterItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
  
  &:hover {
    background-color: #eeeeee;
  }
`;

const ParameterText = styled.span`
  font-size: 16px;
  color: #333;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
`;

const AddParameterForm = styled.div`
  display: flex;
  gap: 12px;
`;

const AddParameterInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #3f51b5;
  }
`;

const AddButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #388e3c;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const DocumentationContent = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 500;
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  h4 {
    font-size: 16px;
    font-weight: 500;
    margin-top: 16px;
    margin-bottom: 8px;
  }
  
  p {
    margin-bottom: 16px;
    line-height: 1.6;
  }
  
  ul {
    padding-left: 24px;
    margin-bottom: 16px;
    
    li {
      margin-bottom: 8px;
    }
  }
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: #757575;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ConfirmContent = styled.div`
  margin-bottom: 16px;
  
  p {
    margin-bottom: 16px;
  }
`;

const WarningText = styled.p`
  color: #e65100;
  font-size: 14px;
  margin-bottom: 8px;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteConfirmButton = styled.button`
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

// Nouveaux styles pour le transfert de portefeuille et l'historique
const ActionButtonsContainer = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const TransferButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #303f9f;
  }
`;

const HistoryButton = styled.button`
  background-color: #607d8b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #455a64;
  }
`;

const TransferContent = styled.div`
  margin-bottom: 16px;
  
  p {
    margin-bottom: 20px;
    line-height: 1.6;
  }
`;

const SelectGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #3f51b5;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ConfirmButton = styled.button`
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #c62828;
  font-size: 14px;
  margin-top: 4px;
`;

// Styles pour l'historique des transferts
const HistoriqueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0;
  }
`;

const BackButton = styled.button`
  background-color: #4caf50; /* Vert */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #388e3c; /* Vert plus foncé */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const HistoriqueList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HistoriqueItem = styled.li`
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 5px solid ${props => props.status === 'succès' ? '#4caf50' : '#f44336'};
`;

const HistoriqueDate = styled.div`
  background-color: #f5f5f5;
  padding: 10px 16px;
  font-weight: 500;
  font-size: 14px;
  color: #555;
`;

const HistoriqueContent = styled.div`
  padding: 16px;
  background-color: #fff;
  
  div {
    margin-bottom: 8px;
  }
  
  strong {
    margin-right: 8px;
  }
`;

const HistoriqueMessage = styled.div`
  margin-top: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-style: italic;
  color: #555;
`;

const EmptyHistorique = styled.div`
  padding: 40px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #757575;
`;

// Nouveaux styles pour les templates
const TemplatesList = styled.div`
  margin-bottom: 16px;
`;

const TemplateItem = styled.div`
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TemplateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TemplateName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const TemplateStatus = styled.div`
  display: inline-block;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: ${props => props.status === 'custom' ? '#e8f5e9' : '#e3f2fd'};
  color: ${props => props.status === 'custom' ? '#2e7d32' : '#1565c0'};
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TemplateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &.download {
    background-color: #3f51b5; /* Bleu */
    color: white;
    
    &:hover {
      background-color: #303f9f;
    }
  }
  
  &.upload {
    background-color: #ff9800; /* Orange */
    color: white;
    
    &:hover {
      background-color: #f57c00;
    }
  }
  
  &.restore {
    background-color: #9e9e9e; /* Gris */
    color: white;
    
    &:hover {
      background-color: #757575;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RestoreButton = styled.button`
  background-color: #ff9800; /* Orange */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f57c00;
  }
`;

export default Parametres;