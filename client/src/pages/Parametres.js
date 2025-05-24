import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaExchangeAlt, FaHistory, FaArrowLeft, FaDownload, FaUpload, FaUndo, FaUserPlus, FaUserEdit, FaKey, FaSave, FaGripVertical } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { parametresAPI, templatesAPI } from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // Import du hook de thème
import PageHeader from '../components/common/PageHeader';
import ExpandableSection from '../components/common/ExpandableSection';
import Modal from '../components/common/Modal';

const Parametres = () => {
  const { colors } = useTheme(); // Hook de thème
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
    convention: { name: 'Convention d\'honoraires', filename: 'convention_template.docx', status: 'default' },
    reglement: { name: 'Fiche de règlement', filename: 'reglement_template.docx', status: 'default' }
  });
  const [templateLoading, setTemplateLoading] = useState(false);
  const conventionInputRef = useRef(null);
  const reglementInputRef = useRef(null);
  const [templateRestoreModalOpen, setTemplateRestoreModalOpen] = useState(false);
  const [templateToRestore, setTemplateToRestore] = useState('');
  
  // Nouveaux états pour la gestion des utilisateurs
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [utilisateursLoading, setUtilisateursLoading] = useState(false);
  const [utilisateurModalOpen, setUtilisateurModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentUtilisateur, setCurrentUtilisateur] = useState({
    id: '',
    username: '',
    password: '',
    nom: '',
    role: 'redacteur'
  });
  const [passwordChangeData, setPasswordChangeData] = useState({
    id: '',
    username: '',
    password: ''
  });

  // États pour la gestion des régions et départements
  const [regionInput, setRegionInput] = useState('');
  const [departementInput, setDepartementInput] = useState('');

  // États pour le mode de réorganisation
  const [reorderingRegions, setReorderingRegions] = useState(false);
  const [reorderingDepartements, setReorderingDepartements] = useState(false);
  const [hasReorderedRegions, setHasReorderedRegions] = useState(false);
  const [hasReorderedDepartements, setHasReorderedDepartements] = useState(false);

  // Fonction de gestion des régions
  const handleAddRegion = async () => {
  if (!regionInput.trim()) return;
  
  try {
    await parametresAPI.addValue('regions', regionInput);
    setRegionInput('');
    showSuccessMessage('Région ajoutée avec succès');
    fetchParametres();
  } catch (err) {
    console.error("Erreur lors de l'ajout de la région", err);
    setError("Impossible d'ajouter la région");
  }
};

// Fonction de gestion des départements
const handleAddDepartement = async () => {
  if (!departementInput.trim()) return;
  
  try {
    await parametresAPI.addValue('departements', departementInput);
    setDepartementInput('');
    showSuccessMessage('Département ajouté avec succès');
    fetchParametres();
  } catch (err) {
    console.error("Erreur lors de l'ajout du département", err);
    setError("Impossible d'ajouter le département");
  }
};

// Gestionnaires pour la touche Entrée
const handleRegionKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAddRegion();
  }
};

const handleDepartementKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAddDepartement();
  }
};

  // Fonction pour gérer la fin du drag & drop
  const handleDragEnd = (result, type) => {
    // Abandonner si dropped ailleurs que dans une zone valide
    if (!result.destination) return;
    
    // Ne rien faire si l'élément est déposé à la même position
    if (result.destination.index === result.source.index) return;
    
    // Créer une copie du tableau des valeurs
    const items = Array.from(parametres[type]);
    
    // Retirer l'élément de sa position d'origine
    const [reorderedItem] = items.splice(result.source.index, 1);
    
    // Insérer l'élément à sa nouvelle position
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Mettre à jour l'état local
    setParametres(prev => ({
      ...prev,
      [type]: items
    }));
    
    // Indiquer qu'il y a eu des modifications
    if (type === 'regions') {
      setHasReorderedRegions(true);
    } else if (type === 'departements') {
      setHasReorderedDepartements(true);
    }
  };
  
  // Fonction pour sauvegarder le nouvel ordre
  const saveReorderedValues = async (type) => {
    try {
      await parametresAPI.reorderValues(type, parametres[type]);
      showSuccessMessage(`Ordre des ${type === 'regions' ? 'régions' : 'départements'} sauvegardé avec succès`);
      
      // Réinitialiser les drapeaux de modification
      if (type === 'regions') {
        setReorderingRegions(false);
        setHasReorderedRegions(false);
      } else if (type === 'departements') {
        setReorderingDepartements(false);
        setHasReorderedDepartements(false);
      }
    } catch (err) {
      console.error(`Erreur lors de la sauvegarde de l'ordre des ${type}:`, err);
      setError(`Impossible de sauvegarder l'ordre des ${type === 'regions' ? 'régions' : 'départements'}`);
    }
  };

  // Récupérer le contexte d'authentification pour vérifier si l'utilisateur est admin
  const { user, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    fetchParametres();
    fetchTemplatesStatus();
    
    // Charger la liste des utilisateurs si l'utilisateur est administrateur
    if (isAdmin()) {
      fetchUtilisateurs();
    }
  }, [isAdmin]);

  // Hook pour déboguer les changements de successMessage pour les transferts de portefeuille
  useEffect(() => {
    console.log("successMessage a changé:", successMessage);
  }, [successMessage]);
  
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

  // Nouveau: Récupérer la liste des utilisateurs (admin uniquement)
  const fetchUtilisateurs = async () => {
    if (!isAdmin()) return;
    
    setUtilisateursLoading(true);
    try {
      const response = await fetch('/api/utilisateurs', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      
      const data = await response.json();
      setUtilisateurs(data.utilisateurs || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs", err);
      setError("Impossible de charger la liste des utilisateurs");
    } finally {
      setUtilisateursLoading(false);
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
      } else if (itemToDelete.type === 'utilisateur') {
        // Nouveau: Supprimer un utilisateur
        await fetch(`/api/utilisateurs/${itemToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        showSuccessMessage('Utilisateur supprimé avec succès');
        fetchUtilisateurs();
      }
      
      setConfirmModalOpen(false);
      fetchParametres();
    } catch (err) {
      console.error(`Erreur lors de la suppression`, err);
      
      if (itemToDelete.type === 'utilisateur' && err.response && err.response.status === 400) {
        setError(err.response.data.message || "Impossible de supprimer cet utilisateur");
      } else {
        setError(`Impossible de supprimer ${
          itemToDelete.type === 'circonstances' ? 'la circonstance' : 
          itemToDelete.type === 'redacteurs' ? 'le rédacteur' : 'l\'utilisateur'
        }`);
      }
      
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
    console.log("Fonction showSuccessMessage appelée avec message:", message);
    setSuccessMessage(message);
    
    // Augmenter considérablement la durée d'affichage
    setTimeout(() => {
      console.log("setTimeout exécuté, suppression du message");
      setSuccessMessage('');
    }, 10000); // 10 secondes au lieu de 3 ou 5
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
    console.log("Démarrage du transfert de portefeuille");
    const response = await parametresAPI.transferPortfolio(sourceRedacteur, targetRedacteur);
    console.log("Réponse reçue:", response);
    
    const affairesModifiees = response.data?.affairesModifiees || 0;
    console.log("Affaires modifiées:", affairesModifiees);
    
    console.log("Avant showSuccessMessage");
    showSuccessMessage(`Portefeuille transféré avec succès de "${sourceRedacteur}" à "${targetRedacteur}". ${affairesModifiees} affaires modifiées.`);
    console.log("Après showSuccessMessage, message:", successMessage);
   
    // Faire défiler vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fermer le modal
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
    if (fileExt !== 'docx') {
      setError(`Le fichier doit être au format DOCX (.docx)`);
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
  
  // NOUVELLES FONCTIONS POUR LA GESTION DES UTILISATEURS
  
  // Ouvrir le modal pour ajouter/modifier un utilisateur
  const openUtilisateurModal = (utilisateur = null) => {
    if (utilisateur) {
      // Modification d'un utilisateur existant
      setCurrentUtilisateur({
        id: utilisateur._id,
        username: utilisateur.username,
        password: '', // Ne pas afficher le mot de passe actuel
        nom: utilisateur.nom,
        role: utilisateur.role
      });
    } else {
      // Nouvel utilisateur
      setCurrentUtilisateur({
        id: '',
        username: '',
        password: '',
        nom: '',
        role: 'redacteur'
      });
    }
    setUtilisateurModalOpen(true);
  };
  
  // Ouvrir le modal pour changer le mot de passe
  const openPasswordModal = (utilisateur) => {
    setPasswordChangeData({
      id: utilisateur._id,
      username: utilisateur.username,
      password: ''
    });
    setPasswordModalOpen(true);
  };
  
  // Gérer la soumission du formulaire utilisateur (création/modification)
  const handleUtilisateurSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!currentUtilisateur.username.trim() || (!currentUtilisateur.id && !currentUtilisateur.password.trim()) || !currentUtilisateur.nom.trim()) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      if (currentUtilisateur.id) {
        // Mise à jour d'un utilisateur existant
        const requestBody = {
          username: currentUtilisateur.username,
          nom: currentUtilisateur.nom,
          role: currentUtilisateur.role
        };
        
        // Ajouter le mot de passe seulement s'il a été saisi
        if (currentUtilisateur.password.trim()) {
          requestBody.password = currentUtilisateur.password;
        }
        
        const response = await fetch(`/api/utilisateurs/${currentUtilisateur.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'utilisateur');
        }
        
        showSuccessMessage('Utilisateur mis à jour avec succès');
      } else {
        // Création d'un nouvel utilisateur
        const response = await fetch('/api/utilisateurs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify({
            username: currentUtilisateur.username,
            password: currentUtilisateur.password,
            nom: currentUtilisateur.nom,
            role: currentUtilisateur.role
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
        }
        
        showSuccessMessage('Utilisateur créé avec succès');
      }
      
      // Fermer le modal et rafraîchir la liste
      setUtilisateurModalOpen(false);
      fetchUtilisateurs();
    } catch (err) {
      console.error('Erreur lors de la gestion de l\'utilisateur:', err);
      setError(err.message || 'Une erreur est survenue lors de la gestion de l\'utilisateur');
    }
  };
  
  // Gérer le changement de mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordChangeData.password.trim()) {
      setError("Veuillez saisir un nouveau mot de passe");
      return;
    }
    
    try {
      const response = await fetch(`/api/utilisateurs/${passwordChangeData.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          password: passwordChangeData.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de mot de passe');
      }
      
      showSuccessMessage('Mot de passe modifié avec succès');
      setPasswordModalOpen(false);
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      setError(err.message || 'Une erreur est survenue lors du changement de mot de passe');
    }
  };
  
  // Activer/désactiver un utilisateur
  const toggleUtilisateurActif = async (utilisateur) => {
    try {
      const response = await fetch(`/api/utilisateurs/${utilisateur._id}/toggle-actif`, {
        method: 'PATCH',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de statut de l\'utilisateur');
      }
      
      showSuccessMessage(`Utilisateur ${utilisateur.actif ? 'désactivé' : 'activé'} avec succès`);
      fetchUtilisateurs();
    } catch (err) {
      console.error('Erreur lors du changement de statut de l\'utilisateur:', err);
      setError(err.message || 'Une erreur est survenue lors du changement de statut de l\'utilisateur');
    }
  };
  
  // Supprimer un utilisateur
  const confirmerSuppressionUtilisateur = (utilisateur) => {
    setItemToDelete({
      type: 'utilisateur',
      id: utilisateur._id,
      value: utilisateur.username
    });
    setConfirmModalOpen(true);
  };

  if (loading) {
    return (
      <Container colors={colors}>
        <PageHeader title="Paramètres" />
        <Loading colors={colors}>Chargement des paramètres...</Loading>
      </Container>
    );
  }
  
  return (
    <Container colors={colors}>
      <PageHeader 
        title="Paramètres" 
        subtitle="Configuration de l'application"
      />
      
      {error && <ErrorMessage colors={colors}>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage colors={colors}>{successMessage}</SuccessMessage>}
      <Section colors={colors}>
        <ExpandableSection
          title="Documentation"
          defaultExpanded={false}
        >
          <DocumentationContent colors={colors}>
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
              <li>Utilisez LibreOffice ou Microsoft Word pour modifier les templates (format DOCX)</li>
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
  <Section colors={colors}>
    <HistoriqueHeader colors={colors}>
      <h2>Historique des transferts de portefeuille (30 derniers jours)</h2>
      <BackButton onClick={() => setHistoriqueModeOpen(false)} colors={colors}>
        <FaArrowLeft style={{ marginRight: '8px' }} />
        Retour aux paramètres
      </BackButton>
    </HistoriqueHeader>
    
    {historiqueLoading ? (
      <Loading colors={colors}>Chargement de l'historique...</Loading>
    ) : historiqueTransferts.length === 0 ? (
      <EmptyHistorique colors={colors}>
        Aucun transfert de portefeuille n'a été effectué durant les 30 derniers jours.
      </EmptyHistorique>
    ) : (
      <HistoriqueList>
        {historiqueTransferts.map((transfert, index) => (
          <HistoriqueItem key={index} status={transfert.statut} colors={colors}>
            <HistoriqueDate colors={colors}>{formatDate(transfert.dateTransfert)}</HistoriqueDate>
            <HistoriqueContent colors={colors}>
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
                <HistoriqueMessage colors={colors}>
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
    {isAdmin() && (
      <>
        {/* Section des templates de documents */}
        <Section colors={colors}>
          <ExpandableSection
            title="Templates de documents (voir la documentation avant de modifier)"
            defaultExpanded={false}
          >
            <TemplatesList>
              {/* Template de convention */}
              <TemplateItem colors={colors}>
                <TemplateInfo>
                  <TemplateName colors={colors}>{templates.convention.name}</TemplateName>
                  <TemplateStatus status={templates.convention.status} colors={colors}>
                    {templates.convention.status === 'custom' ? 'Personnalisé' : 'Par défaut'}
                  </TemplateStatus>
                </TemplateInfo>
                <TemplateActions>
                  <TemplateButton 
                    title="Télécharger le template actuel"
                    onClick={() => handleDownloadTemplate('convention')}
                    disabled={templateLoading}
                    className="download"
                    colors={colors}
                  >
                    <FaDownload />
                    <span>Télécharger</span>
                  </TemplateButton>
                  
                  <TemplateButton 
                    title="Uploader un template personnalisé"
                    onClick={() => triggerFileInput(conventionInputRef)}
                    disabled={templateLoading}
                    className="upload"
                    colors={colors}
                  >
                    <FaUpload />
                    <span>Uploader</span>
                  </TemplateButton>
                  
                  <input
                    type="file"
                    ref={conventionInputRef}
                    style={{ display: 'none' }}
                    accept=".docx"
                    onChange={(e) => handleUploadTemplate(e, 'convention')}
                  />
                  
                  {templates.convention.status === 'custom' && (
                    <TemplateButton 
                      title="Restaurer le template par défaut"
                      onClick={() => openRestoreConfirmation('convention')}
                      disabled={templateLoading}
                      className="restore"
                      colors={colors}
                    >
                      <FaUndo />
                      <span>Restaurer</span>
                    </TemplateButton>
                  )}
                </TemplateActions>
              </TemplateItem>
              
              {/* Template de règlement */}
              <TemplateItem colors={colors}>
                <TemplateInfo>
                  <TemplateName colors={colors}>{templates.reglement.name}</TemplateName>
                  <TemplateStatus status={templates.reglement.status} colors={colors}>
                    {templates.reglement.status === 'custom' ? 'Personnalisé' : 'Par défaut'}
                  </TemplateStatus>
                </TemplateInfo>
                <TemplateActions>
                  <TemplateButton 
                    title="Télécharger le template actuel"
                    onClick={() => handleDownloadTemplate('reglement')}
                    disabled={templateLoading}
                    className="download"
                    colors={colors}
                  >
                    <FaDownload />
                    <span>Télécharger</span>
                  </TemplateButton>
                  
                  <TemplateButton 
                    title="Uploader un template personnalisé"
                    onClick={() => triggerFileInput(reglementInputRef)}
                    disabled={templateLoading}
                    className="upload"
                    colors={colors}
                  >
                    <FaUpload />
                    <span>Uploader</span>
                  </TemplateButton>
                  
                  <input
                    type="file"
                    ref={reglementInputRef}
                    style={{ display: 'none' }}
                    accept=".docx"
                    onChange={(e) => handleUploadTemplate(e, 'reglement')}
                  />
                  
                  {templates.reglement.status === 'custom' && (
                    <TemplateButton 
                      title="Restaurer le template par défaut"
                      onClick={() => openRestoreConfirmation('reglement')}
                      disabled={templateLoading}
                      className="restore"
                      colors={colors}
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

        {/* Section pour la gestion des utilisateurs (admin uniquement) */}
        <Section colors={colors}>
          <ExpandableSection
            title="Gestion des utilisateurs"
            defaultExpanded={false}
          >
            {utilisateursLoading ? (
              <Loading colors={colors}>Chargement des utilisateurs...</Loading>
            ) : (
              <>
                <UserActionButton onClick={() => openUtilisateurModal()} colors={colors}>
                  <FaUserPlus />
                  <span>Ajouter un utilisateur</span>
                </UserActionButton>
                
                <UsersList>
                  {utilisateurs.map((utilisateur) => (
                    <UserItem key={utilisateur._id} active={utilisateur.actif} colors={colors}>
                      <UserInfo colors={colors}>
                        <UserName colors={colors}>{utilisateur.nom}</UserName>
                        <UserUsername colors={colors}>@{utilisateur.username}</UserUsername>
                        <UserRole colors={colors}>
                          {utilisateur.role === 'administrateur' ? 'Administrateur' : 'Rédacteur'}
                        </UserRole>
                        <UserStatus active={utilisateur.actif} colors={colors}>
                          {utilisateur.actif ? 'Actif' : 'Inactif'}
                        </UserStatus>
                      </UserInfo>
                      <UserActions>
                        <UserActionButton 
                          title="Modifier l'utilisateur" 
                          onClick={() => openUtilisateurModal(utilisateur)}
                          small
                          colors={colors}
                        >
                          <FaUserEdit />
                        </UserActionButton>
                        
                        <UserActionButton 
                          title="Changer le mot de passe" 
                          onClick={() => openPasswordModal(utilisateur)}
                          small
                          colors={colors}
                        >
                          <FaKey />
                        </UserActionButton>
                        
                        <UserActionButton 
                          title={utilisateur.actif ? "Désactiver l'utilisateur" : "Activer l'utilisateur"} 
                          onClick={() => toggleUtilisateurActif(utilisateur)}
                          small
                          status={utilisateur.actif ? 'warning' : 'success'}
                          colors={colors}
                        >
                          {utilisateur.actif ? <FaTrash /> : <FaUndo />}
                        </UserActionButton>
                        
                        {/* Ne pas permettre de supprimer son propre compte */}
                        {user && user.id !== utilisateur._id && (
                          <UserActionButton 
                            title="Supprimer l'utilisateur" 
                            onClick={() => confirmerSuppressionUtilisateur(utilisateur)}
                            small
                            status="danger"
                            colors={colors}
                          >
                            <FaTrash />
                          </UserActionButton>
                        )}
                      </UserActions>
                    </UserItem>
                  ))}
                </UsersList>
                
                {utilisateurs.length === 0 && (
                  <EmptyUsers colors={colors}>
                    Aucun utilisateur trouvé. Cliquez sur "Ajouter un utilisateur" pour créer le premier compte.
                  </EmptyUsers>
                )}
              </>
            )}
          </ExpandableSection>
        </Section>
      

        <Section colors={colors}>
          <ExpandableSection
            title="Circonstances (voir la documentation avant de modifier)"
            defaultExpanded={false}
          >
            <ParametersList>
              {parametres.circonstances && parametres.circonstances.map((circonstance, index) => (
                <ParameterItem key={index} colors={colors}>
                  <ParameterText colors={colors}>{circonstance}</ParameterText>
                  <DeleteButton onClick={() => openDeleteConfirmation('circonstances', index, circonstance)} colors={colors}>
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
                colors={colors}
              />
              <AddButton onClick={handleAddCirconstance} colors={colors}>
                <FaPlus />
                <span>Ajouter</span>
              </AddButton>
            </AddParameterForm>
          </ExpandableSection>
        </Section>
        
        <Section colors={colors}>
          <ExpandableSection
            title="Régions (voir la documentation avant de modifier)"
            defaultExpanded={false}
          >
            <SectionHeader colors={colors}>
              <SectionTitle colors={colors}>Liste des régions</SectionTitle>
              <ReorderToggle 
                active={reorderingRegions}
                onClick={() => setReorderingRegions(!reorderingRegions)}
                colors={colors}
              >
                {reorderingRegions ? 'Annuler' : 'Réorganiser'}
              </ReorderToggle>
              
              {hasReorderedRegions && (
                <SaveOrderButton onClick={() => saveReorderedValues('regions')} colors={colors}>
                  <FaSave style={{ marginRight: '8px' }} />
                  Sauvegarder l'ordre
                </SaveOrderButton>
              )}
            </SectionHeader>
            
            {reorderingRegions ? (
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'regions')}>
                <Droppable droppableId="regions-list">
                  {(provided) => (
                    <DraggableList
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {parametres.regions && parametres.regions.map((region, index) => (
                        <Draggable key={region} draggableId={`region-${region}`} index={index}>
                          {(provided) => (
                            <DraggableItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              colors={colors}
                            >
                              <DragHandle {...provided.dragHandleProps} colors={colors}>
                                <FaGripVertical />
                              </DragHandle>
                              <ItemText colors={colors}>{region}</ItemText>
                            </DraggableItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </DraggableList>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <>
                <ParametersList>
                  {parametres.regions && parametres.regions.map((region, index) => (
                    <ParameterItem key={index} colors={colors}>
                      <ParameterText colors={colors}>{region}</ParameterText>
                      <DeleteButton onClick={() => openDeleteConfirmation('regions', index, region)} colors={colors}>
                        <FaTrash />
                      </DeleteButton>
                    </ParameterItem>
                  ))}
                </ParametersList>
                
                <AddParameterForm>
                  <AddParameterInput
                    type="text"
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    onKeyDown={handleRegionKeyDown}
                    placeholder="Nouvelle région..."
                    colors={colors}
                  />
                  <AddButton onClick={handleAddRegion} colors={colors}>
                    <FaPlus />
                    <span>Ajouter</span>
                  </AddButton>
                </AddParameterForm>
              </>
            )}
          </ExpandableSection>
        </Section>

        <Section colors={colors}>
          <ExpandableSection
            title="Départements (voir la documentation avant de modifier)"
            defaultExpanded={false}
          >
            <SectionHeader colors={colors}>
              <SectionTitle colors={colors}>Liste des départements</SectionTitle>
              <ReorderToggle 
                active={reorderingDepartements}
                onClick={() => setReorderingDepartements(!reorderingDepartements)}
                colors={colors}
              >
                {reorderingDepartements ? 'Annuler' : 'Réorganiser'}
              </ReorderToggle>
              
              {hasReorderedDepartements && (
                <SaveOrderButton onClick={() => saveReorderedValues('departements')} colors={colors}>
                  <FaSave style={{ marginRight: '8px' }} />
                  Sauvegarder l'ordre
                </SaveOrderButton>
              )}
            </SectionHeader>
            
            {reorderingDepartements ? (
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'departements')}>
                <Droppable droppableId="departements-list">
                  {(provided) => (
                    <DraggableList
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {parametres.departements && parametres.departements.map((departement, index) => (
                        <Draggable key={departement} draggableId={`departement-${departement}`} index={index}>
                          {(provided) => (
                            <DraggableItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              colors={colors}
                            >
                              <DragHandle {...provided.dragHandleProps} colors={colors}>
                                <FaGripVertical />
                              </DragHandle>
                              <ItemText colors={colors}>{departement}</ItemText>
                            </DraggableItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </DraggableList>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <>
                <ParametersList>
                  {parametres.departements && parametres.departements.map((departement, index) => (
                    <ParameterItem key={index} colors={colors}>
                      <ParameterText colors={colors}>{departement}</ParameterText>
                      <DeleteButton onClick={() => openDeleteConfirmation('departements', index, departement)} colors={colors}>
                        <FaTrash />
                      </DeleteButton>
                    </ParameterItem>
                  ))}
                </ParametersList>
                
                <AddParameterForm>
                  <AddParameterInput
                    type="text"
                    value={departementInput}
                    onChange={(e) => setDepartementInput(e.target.value)}
                    onKeyDown={handleDepartementKeyDown}
                    placeholder="Nouveau département..."
                    colors={colors}
                  />
                  <AddButton onClick={handleAddDepartement} colors={colors}>
                    <FaPlus />
                    <span>Ajouter</span>
                  </AddButton>
                </AddParameterForm>
              </>
            )}
          </ExpandableSection>
        </Section>
        
        <Section colors={colors}>
          <ExpandableSection
            title="Rédacteurs (voir la documentation avant de modifier)"
            defaultExpanded={false}
          >
            <ParametersList>
              {parametres.redacteurs && parametres.redacteurs.map((redacteur, index) => (
                <ParameterItem key={index} colors={colors}>
                  <ParameterText colors={colors}>{redacteur}</ParameterText>
                  <DeleteButton onClick={() => openDeleteConfirmation('redacteurs', index, redacteur)} colors={colors}>
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
                colors={colors}
              />
              <AddButton onClick={handleAddRedacteur} colors={colors}>
                <FaPlus />
                <span>Ajouter</span>
              </AddButton>
            </AddParameterForm>
            
            {/* Boutons pour le transfert et l'historique */}
            <ActionButtonsContainer>
              <TransferButton onClick={openTransferModal} colors={colors}>
                <FaExchangeAlt />
                <span>Transférer un portefeuille</span>
              </TransferButton>
              
              <HistoryButton onClick={openHistoriqueMode} colors={colors}>
                <FaHistory />
                <span>Voir l'historique des transferts</span>
              </HistoryButton>
            </ActionButtonsContainer>
          </ExpandableSection>
        </Section>
      </>
    )}
  </>  
)}
      
      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={
          itemToDelete.type === 'circonstances' ? "Supprimer la circonstance" : 
          itemToDelete.type === 'redacteurs' ? "Supprimer le rédacteur" :
          "Supprimer l'utilisateur"
        }
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setConfirmModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <DeleteConfirmButton onClick={handleConfirmDelete} colors={colors}>
              Supprimer
            </DeleteConfirmButton>
          </>
        }
      >
        <ConfirmContent colors={colors}>
          <p>
            Êtes-vous sûr de vouloir supprimer 
            {itemToDelete.type === 'circonstances' ? ' la circonstance ' : 
             itemToDelete.type === 'redacteurs' ? ' le rédacteur ' :
             " l'utilisateur "}
            <strong>"{itemToDelete.value}"</strong> ?
          </p>
          <WarningText colors={colors}>
            {itemToDelete.type === 'circonstances' 
              ? "Cette circonstance ne sera plus disponible pour les nouvelles affaires, mais les affaires existantes ne seront pas modifiées."
              : itemToDelete.type === 'redacteurs'
              ? "Ce rédacteur ne sera plus disponible pour les nouvelles affaires, mais les affaires existantes ne seront pas modifiées."
              : "Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées."
            }
          </WarningText>
          <WarningText colors={colors}>
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
              colors={colors}
            >
              Annuler
            </CancelButton>
            <ConfirmButton 
              onClick={handleTransferPortfolio}
              disabled={!sourceRedacteur || !targetRedacteur || sourceRedacteur === targetRedacteur || transferInProgress}
              colors={colors}
            >
              {transferInProgress ? 'Transfert en cours...' : 'Transférer'}
            </ConfirmButton>
          </>
        }
      >
        <TransferContent colors={colors}>
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
              colors={colors}
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
              colors={colors}
            >
              <option value="">Sélectionner un rédacteur</option>
              {parametres.redacteurs && parametres.redacteurs.map((redacteur, index) => (
                <option key={index} value={redacteur}>{redacteur}</option>
              ))}
            </Select>
          </SelectGroup>
          
          <WarningText colors={colors}>
            Cette opération est irréversible. Assurez-vous d'avoir sélectionné les bons rédacteurs.
          </WarningText>
          
          {sourceRedacteur === targetRedacteur && sourceRedacteur !== '' && (
            <ErrorText colors={colors}>
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
            <CancelButton onClick={() => setTemplateRestoreModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <RestoreButton onClick={handleRestoreTemplate} colors={colors}>
              Restaurer
            </RestoreButton>
          </>
        }
      >
        <ConfirmContent colors={colors}>
          <p>
            Êtes-vous sûr de vouloir restaurer le template par défaut pour 
            <strong> {templateToRestore ? templates[templateToRestore].name : ''}</strong> ?
          </p>
          <WarningText colors={colors}>
            Cette action remplacera définitivement votre template personnalisé par le template par défaut.
          </WarningText>
        </ConfirmContent>
      </Modal>
      
      {/* Nouvelles modales pour la gestion des utilisateurs */}
      {/* Modal de création/modification d'utilisateur */}
      <Modal
        isOpen={utilisateurModalOpen}
        onClose={() => setUtilisateurModalOpen(false)}
        title={currentUtilisateur.id ? "Modifier un utilisateur" : "Ajouter un utilisateur"}
        size="medium"
        actions={
          <>
            <CancelButton onClick={() => setUtilisateurModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <ConfirmButton 
              onClick={handleUtilisateurSubmit}
              colors={colors}
            >
              {currentUtilisateur.id ? 'Enregistrer' : 'Créer'}
            </ConfirmButton>
          </>
        }
      >
        <UserForm>
          <FormGroup>
            <FormLabel colors={colors}>Nom d'utilisateur</FormLabel>
            <FormInput 
              type="text" 
              value={currentUtilisateur.username} 
              onChange={(e) => setCurrentUtilisateur({...currentUtilisateur, username: e.target.value})}
              placeholder="ex: jdupont"
              required
              colors={colors}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel colors={colors}>
              {currentUtilisateur.id ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            </FormLabel>
            <FormInput 
              type="password" 
              value={currentUtilisateur.password} 
              onChange={(e) => setCurrentUtilisateur({...currentUtilisateur, password: e.target.value})}
              placeholder={currentUtilisateur.id ? '••••••••' : 'Mot de passe'}
              required={!currentUtilisateur.id}
              colors={colors}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel colors={colors}>Nom complet</FormLabel>
            <FormInput 
              type="text" 
              value={currentUtilisateur.nom} 
              onChange={(e) => setCurrentUtilisateur({...currentUtilisateur, nom: e.target.value})}
              placeholder="ex: Jean Dupont"
              required
              colors={colors}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel colors={colors}>Rôle</FormLabel>
            <FormSelect
              value={currentUtilisateur.role}
              onChange={(e) => setCurrentUtilisateur({...currentUtilisateur, role: e.target.value})}
              colors={colors}
            >
              <option value="redacteur">Rédacteur</option>
              <option value="administrateur">Administrateur</option>
            </FormSelect>
            <FormHelpText colors={colors}>
              Les administrateurs peuvent gérer les utilisateurs et accéder à toutes les fonctionnalités.
              Les rédacteurs ne peuvent pas gérer les utilisateurs.
            </FormHelpText>
          </FormGroup>
        </UserForm>
      </Modal>
      
      {/* Modal de changement de mot de passe */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title={`Changer le mot de passe - ${passwordChangeData.username}`}
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setPasswordModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <ConfirmButton 
              onClick={handlePasswordChange}
              colors={colors}
            >
              Changer le mot de passe
            </ConfirmButton>
          </>
        }
      >
        <UserForm>
          <FormGroup>
            <FormLabel colors={colors}>Nouveau mot de passe</FormLabel>
            <FormInput 
              type="password" 
              value={passwordChangeData.password} 
              onChange={(e) => setPasswordChangeData({...passwordChangeData, password: e.target.value})}
              placeholder="Nouveau mot de passe"
              required
              colors={colors}
            />
          </FormGroup>
        </UserForm>
      </Modal>
    </Container>
  );
};

// Styles existants avec thématisation
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

const Section = styled.section`
  margin-bottom: 24px;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  padding: 20px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
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
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    border-color: ${props => props.colors.border};
  }
`;

const ParameterText = styled.span`
  font-size: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.colors.error};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.errorBg};
    transform: scale(1.1);
  }
`;

const AddParameterForm = styled.div`
  display: flex;
  gap: 12px;
`;

const AddParameterInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.colors.textMuted};
  }
`;

const AddButton = styled.button`
  background-color: ${props => props.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
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
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.colors.successBg};
  color: ${props => props.colors.success};
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.colors.success}40;
  transition: all 0.3s ease;
`;

const DocumentationContent = styled.div`
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  h3 {
    font-size: 18px;
    font-weight: 500;
    margin-top: 0;
    margin-bottom: 16px;
    color: ${props => props.colors.textPrimary};
  }
  
  h4 {
    font-size: 16px;
    font-weight: 500;
    margin-top: 16px;
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
  }
  
  p {
    margin-bottom: 16px;
    line-height: 1.6;
    color: ${props => props.colors.textPrimary};
  }
  
  ul {
    padding-left: 24px;
    margin-bottom: 16px;
    
    li {
      margin-bottom: 8px;
      color: ${props => props.colors.textPrimary};
    }
  }
  
  strong {
    color: ${props => props.colors.textPrimary};
  }
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const ConfirmContent = styled.div`
  margin-bottom: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 16px;
    color: ${props => props.colors.textPrimary};
  }
  
  strong {
    color: ${props => props.colors.textPrimary};
  }
`;

const WarningText = styled.p`
  color: ${props => props.colors.warning};
  font-size: 14px;
  margin-bottom: 8px;
  transition: color 0.3s ease;
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
    background-color: ${props => props.colors.navActive};
    border-color: ${props => props.colors.border};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteConfirmButton = styled.button`
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

const ActionButtonsContainer = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const TransferButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const HistoryButton = styled.button`
  background-color: ${props => props.colors.textSecondary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.colors.textSecondary}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const TransferContent = styled.div`
  margin-bottom: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 20px;
    line-height: 1.6;
    color: ${props => props.colors.textPrimary};
  }
`;

const SelectGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: ${props => props.colors.textPrimary};
    transition: color 0.3s ease;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  &:disabled {
    background-color: ${props => props.colors.surfaceHover};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const ConfirmButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: ${props => props.colors.error};
  font-size: 14px;
  margin-top: 4px;
  transition: color 0.3s ease;
`;

const HistoriqueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0;
    color: ${props => props.colors.textPrimary};
  }
`;

const BackButton = styled.button`
  background-color: ${props => props.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    box-shadow: ${props => props.colors.shadowHover};
    transform: translateY(-1px);
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
  box-shadow: ${props => props.colors.shadow};
  border-left: 5px solid ${props => props.status === 'succès' ? props.colors.success : props.colors.error};
  background-color: ${props => props.colors.surface};
  transition: all 0.3s ease;
`;

const HistoriqueDate = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  padding: 10px 16px;
  font-weight: 500;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  transition: all 0.3s ease;
`;

const HistoriqueContent = styled.div`
  padding: 16px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  div {
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
  }
  
  strong {
    margin-right: 8px;
    color: ${props => props.colors.textPrimary};
  }
`;

const HistoriqueMessage = styled.div`
  margin-top: 8px;
  padding: 8px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  font-style: italic;
  color: ${props => props.colors.textMuted};
  transition: all 0.3s ease;
`;

const EmptyHistorique = styled.div`
  padding: 40px;
  text-align: center;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  color: ${props => props.colors.textMuted};
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
`;

const TemplatesList = styled.div`
  margin-bottom: 16px;
`;

const TemplateItem = styled.div`
  padding: 16px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    border-color: ${props => props.colors.border};
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
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const TemplateStatus = styled.div`
  display: inline-block;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: ${props => props.status === 'custom' ? props.colors.successBg : props.colors.warningBg};
  color: ${props => props.status === 'custom' ? props.colors.success : props.colors.warning};
  border: 1px solid ${props => props.status === 'custom' ? props.colors.success + '40' : props.colors.warning + '40'};
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
  
  &.download {
    background-color: ${props => props.colors.primary};
    color: white;
    
    &:hover {
      background-color: ${props => props.colors.primaryDark};
      transform: translateY(-1px);
      box-shadow: ${props => props.colors.shadowHover};
    }
  }
  
  &.upload {
    background-color: ${props => props.colors.warning};
    color: white;
    
    &:hover {
      background-color: ${props => props.colors.warning}dd;
      transform: translateY(-1px);
      box-shadow: ${props => props.colors.shadowHover};
    }
  }
  
  &.restore {
    background-color: ${props => props.colors.textMuted};
    color: white;
    
    &:hover {
      background-color: ${props => props.colors.textMuted}dd;
      transform: translateY(-1px);
      box-shadow: ${props => props.colors.shadowHover};
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RestoreButton = styled.button`
  background-color: ${props => props.colors.warning};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.warning}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

// Nouveaux styles pour la gestion des utilisateurs
const UsersList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  border-left: 4px solid ${props => props.active ? props.colors.success : props.colors.error};
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    border-color: ${props => props.colors.border};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const UserUsername = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const UserRole = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textPrimary};
  margin-top: 4px;
  transition: color 0.3s ease;
`;

const UserStatus = styled.div`
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: ${props => props.active ? props.colors.successBg : props.colors.errorBg};
  color: ${props => props.active ? props.colors.success : props.colors.error};
  border: 1px solid ${props => props.active ? props.colors.success + '40' : props.colors.error + '40'};
  transition: all 0.3s ease;
`;

const UserActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const UserActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.small ? '0' : '8px'};
  padding: ${props => props.small ? '8px' : '8px 12px'};
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => {
    if (props.status === 'danger') return props.colors.error;
    if (props.status === 'warning') return props.colors.warning;
    if (props.status === 'success') return props.colors.success;
    return props.colors.primary;
  }};
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => {
      if (props.status === 'danger') return props.colors.error + 'dd';
      if (props.status === 'warning') return props.colors.warning + 'dd';
      if (props.status === 'success') return props.colors.success + 'dd';
      return props.colors.primaryDark;
    }};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const EmptyUsers = styled.div`
  padding: 40px;
  text-align: center;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  color: ${props => props.colors.textMuted};
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
`;

const UserForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.colors.textMuted};
  }
`;

const FormSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const FormHelpText = styled.div`
  font-size: 12px;
  color: ${props => props.colors.textMuted};
  margin-top: 4px;
  transition: color 0.3s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const ReorderToggle = styled.button`
  background-color: ${props => props.active ? props.colors.error : props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? props.colors.error + 'dd' : props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const SaveOrderButton = styled.button`
  background-color: ${props => props.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const DraggableList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
`;

const DraggableItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    border-color: ${props => props.colors.border};
  }
`;

const DragHandle = styled.div`
  color: ${props => props.colors.textMuted};
  cursor: grab;
  margin-right: 12px;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  
  &:active {
    cursor: grabbing;
  }
  
  &:hover {
    color: ${props => props.colors.primary};
  }
`;

const ItemText = styled.span`
  font-size: 16px;
  color: ${props => props.colors.textPrimary};
  flex: 1;
  transition: color 0.3s ease;
`;

export default Parametres;