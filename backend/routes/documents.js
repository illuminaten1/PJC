const express = require('express');
const router = express.Router();
const documentGenerator = require('../utils/DocumentGenerator');
const Beneficiaire = require('../models/beneficiaire');
const Militaire = require('../models/militaire');
const Affaire = require('../models/affaire');

router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Middleware amélioré pour vérifier n'importe quel ID MongoDB dans les paramètres
const validateMongoId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: `ID ${paramName} invalide` });
    }
    next();
  };
};

// Pour maintenir la compatibilité avec l'ancien middleware
const validateObjectId = (req, res, next) => {
  // Vérifier tous les paramètres qui pourraient être des IDs MongoDB
  for (const [key, value] of Object.entries(req.params)) {
    if (key.toLowerCase().includes('id') && value) {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: `ID ${key} invalide` });
      }
    }
  }
  next();
};

// POST - Générer une convention d'honoraires (avec support ODT)
router.post('/convention/:beneficiaireId/:conventionIndex', validateMongoId('beneficiaireId'), async (req, res) => {
  try {
    const { beneficiaireId, conventionIndex } = req.params;
    const { format = 'pdf' } = req.query; // Nouveau paramètre pour spécifier le format
    
    // Vérifier que le format est valide
    if (format !== 'pdf' && format !== 'odt') {
      return res.status(400).json({ message: 'Format non valide. Formats supportés: pdf, odt' });
    }
    
    // Récupérer les données nécessaires avec vérification à chaque étape
    const beneficiaire = await Beneficiaire.findById(beneficiaireId)
      .populate('avocats'); // Populer les avocats pour avoir accès à leurs informations complètes
    
    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    // Vérifier l'index de convention
    if (!beneficiaire.conventions[conventionIndex]) {
      return res.status(404).json({ message: 'Convention non trouvée' });
    }
    
    const militaire = await Militaire.findById(beneficiaire.militaire);
    if (!militaire) {
      return res.status(404).json({ message: 'Militaire non trouvé' });
    }
    
    const affaire = await Affaire.findById(militaire.affaire);
    if (!affaire) {
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    // Récupérer l'avocat lié à cette convention spécifique
    const convention = beneficiaire.conventions[conventionIndex];
    const avocatId = convention.avocat;
    
    // Trouver l'avocat correspondant dans la liste des avocats du bénéficiaire
    let avocat = { nom: '[NOM AVOCAT]', prenom: '[PRÉNOM]', email: '[EMAIL]' };
    if (avocatId) {
      const foundAvocat = beneficiaire.avocats.find(a => a._id.toString() === avocatId.toString());
      if (foundAvocat) {
        avocat = foundAvocat;
      } else {
        console.log(`Avocat ID ${avocatId} non trouvé dans la liste des avocats du bénéficiaire`);
      }
    } else {
      console.log(`Pas d'avocat spécifié pour cette convention`);
    }
    
    // Log de débogage
    console.log("Génération de convention - Données :", {
      beneficiaire: beneficiaire._id,
      militaire: militaire._id,
      affaire: affaire._id,
      convention: convention,
      avocat: {
        id: avocat._id,
        nom: avocat.nom,
        prenom: avocat.prenom,
        email: avocat.email
      },
      format: format
    });
    
    // Données pour la génération du document
    const data = {
      beneficiaire: beneficiaire,
      militaire: militaire,
      affaire: affaire,
      avocat: avocat,
      convention: convention
    };
    
    // Générer le document dans le format demandé
    const documentBuffer = await documentGenerator.genererConventionHonoraires(data, format);
    
    // Configuration des en-têtes selon le format
    let contentType;
    let fileName = `convention_${beneficiaire.numeroDecision || 'sans_numero'}.${format}`;
    
    if (format === 'pdf') {
      contentType = 'application/pdf';
    } else if (format === 'odt') {
      contentType = 'application/vnd.oasis.opendocument.text';
    }
    
    // Envoyer le document
    res.contentType(contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(documentBuffer);
  } catch (error) {
    console.error("Erreur détaillée lors de la génération de la convention:", error);
    res.status(500).json({ 
      message: "Erreur lors de la génération du document", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST - Générer une fiche de règlement (avec support ODT)
router.post('/reglement/:beneficiaireId/:paiementIndex', validateMongoId('beneficiaireId'), async (req, res) => {
  try {
    const { beneficiaireId, paiementIndex } = req.params;
    const { format = 'pdf' } = req.query;
    
    console.log(`=== DÉBOGAGE: Début génération fiche règlement ===`);
    console.log(`Format demandé: ${format}`);
    console.log(`beneficiaireId: ${beneficiaireId}, paiementIndex: ${paiementIndex}`);
    
    // Vérifier si le format est valide
    if (format !== 'pdf' && format !== 'odt') {
      return res.status(400).json({ 
        message: `Format non pris en charge. Formats supportés: pdf, odt` 
      });
    }
    
    // Récupérer les données nécessaires avec population complète
    console.log(`Recherche du bénéficiaire...`);
    const beneficiaire = await Beneficiaire.findById(beneficiaireId)
      .populate({
        path: 'militaire',
        populate: {
          path: 'affaire'
        }
      })
      .populate('avocats');
    
    if (!beneficiaire) {
      console.log(`Erreur: Bénéficiaire non trouvé (id: ${beneficiaireId})`);
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    console.log(`Bénéficiaire trouvé: ${beneficiaire.prenom} ${beneficiaire.nom}`);
    
    // Vérifier que l'index de paiement est valide
    if (!beneficiaire.paiements || !beneficiaire.paiements[paiementIndex]) {
      console.log(`Erreur: Paiement non trouvé (index: ${paiementIndex})`);
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    console.log(`Paiement trouvé: ${JSON.stringify(beneficiaire.paiements[paiementIndex])}`);
    
    // Vérifier les informations du militaire et de l'affaire
    if (!beneficiaire.militaire) {
      console.log(`Erreur: Militaire non trouvé`);
      return res.status(404).json({ message: 'Militaire non trouvé' });
    }
    
    console.log(`Militaire trouvé: ${beneficiaire.militaire.grade} ${beneficiaire.militaire.prenom} ${beneficiaire.militaire.nom}`);
    
    if (!beneficiaire.militaire.affaire) {
      console.log(`Erreur: Affaire non trouvée`);
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    console.log(`Affaire trouvée: ${beneficiaire.militaire.affaire.nom}`);
    console.log(`Date des faits: ${beneficiaire.militaire.affaire.dateFaits}`);
    
    // Préparer les données pour le générateur de document
    const data = {
      beneficiaire: {
        prenom: beneficiaire.prenom,
        nom: beneficiaire.nom,
        qualite: beneficiaire.qualite,
        numeroDecision: beneficiaire.numeroDecision,
        dateDecision: beneficiaire.dateDecision
      },
      militaire: {
        grade: beneficiaire.militaire.grade,
        prenom: beneficiaire.militaire.prenom,
        nom: beneficiaire.militaire.nom,
        unite: beneficiaire.militaire.unite
      },
      affaire: {
        nom: beneficiaire.militaire.affaire.nom,
        lieu: beneficiaire.militaire.affaire.lieu,
        // Ajout de la date des faits
        dateFaits: beneficiaire.militaire.affaire.dateFaits,
        redacteur: beneficiaire.militaire.affaire.redacteur
      },
      paiement: beneficiaire.paiements[paiementIndex]
    };
    
    // Si le bénéficiaire a des conventions, ajouter les informations de la première convention
    if (beneficiaire.conventions && beneficiaire.conventions.length > 0) {
      data.convention = beneficiaire.conventions[0]; 
      console.log(`Convention trouvée: ${JSON.stringify(data.convention)}`);
    } else {
      console.log(`Aucune convention trouvée pour ce bénéficiaire`);
    }
    
    console.log(`Données préparées pour la génération: ${JSON.stringify(data, null, 2)}`);
    console.log(`Appel de la fonction genererFicheReglement avec format ${format}...`);
    
    try {
      // Générer le document dans le format demandé
      const buffer = await documentGenerator.genererFicheReglement(data, format);
      console.log(`Document généré avec succès (taille: ${buffer.length} octets)`);
      
      // Configurer l'en-tête et renvoyer le document
      const fileName = `reglement_${beneficiaire.numeroDecision || 'sans_numero'}.${format}`;
      
      // Déterminer le type MIME selon le format
      let contentType;
      if (format === 'pdf') {
        contentType = 'application/pdf';
      } else if (format === 'odt') {
        contentType = 'application/vnd.oasis.opendocument.text';
      }
      
      res.contentType(contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.send(buffer);
      console.log(`=== Document envoyé avec succès ===`);
    } catch (generationError) {
      console.error(`Erreur lors de la génération du document:`, generationError);
      throw new Error(`Erreur de génération: ${generationError.message}`);
    }
  } catch (error) {
    console.error('Erreur détaillée lors de la génération de la fiche de règlement:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération du document', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      // Informations supplémentaires pour le débogage
      params: {
        beneficiaireId: req.params.beneficiaireId,
        paiementIndex: req.params.paiementIndex,
        format: req.query.format
      }
    });
  }
});

// POST - Générer une synthèse d'affaire complète
router.post('/synthese-affaire/:id', validateMongoId('id'), async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query; // Format pdf ou odt
    
    // Vérifier que le format est valide
    if (format !== 'pdf' && format !== 'odt') {
      return res.status(400).json({ message: 'Format non valide. Formats supportés: pdf, odt' });
    }
    
    // Récupérer l'affaire avec toutes ses données associées
    const affaire = await Affaire.findById(id);
    if (!affaire) {
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    // Récupérer tous les militaires liés à cette affaire
    const militaires = await Militaire.find({ affaire: id });
    
    // Récupérer tous les bénéficiaires de ces militaires
    const militaireIds = militaires.map(m => m._id);
    const beneficiaires = await Beneficiaire.find({ militaire: { $in: militaireIds } })
      .populate('avocats');
    
    // Préparer les données pour la génération du document
    const data = {
      affaire: affaire,
      militaires: militaires,
      beneficiaires: beneficiaires
    };
    
    // Générer le document
    const documentBuffer = await documentGenerator.genererSyntheseAffaire(data, format);
    
    // Configuration des en-têtes selon le format
    let contentType;
    let fileName = `synthese_${affaire.nom.replace(/\s+/g, '_')}.${format}`;
    
    if (format === 'pdf') {
      contentType = 'application/pdf';
    } else if (format === 'odt') {
      contentType = 'application/vnd.oasis.opendocument.text';
    }
    
    // Envoyer le document
    res.contentType(contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(documentBuffer);
  } catch (error) {
    console.error("Erreur détaillée lors de la génération de la synthèse:", error);
    res.status(500).json({ 
      message: "Erreur lors de la génération du document", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST - Générer une fiche d'information thématique
router.post('/fiche-information', async (req, res) => {
  try {
    const { titre, theme, sections, format } = req.body;
    
    // Vérifier les données requises
    if (!titre || !theme || !sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: 'Données incomplètes pour générer la fiche d\'information' });
    }
    
    // Données pour la génération du document
    const data = {
      titre,
      theme,
      sections
    };
    
    // Générer le document (ODT ou DOCX)
    const docBuffer = await documentGenerator.genererFicheInformation(data, format || 'docx');
    
    // Déterminer le type MIME en fonction du format
    const contentType = format === 'odt' ? 'application/vnd.oasis.opendocument.text' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const extension = format === 'odt' ? 'odt' : 'docx';
    
    // Envoyer le document
    res.contentType(contentType);
    res.setHeader('Content-Disposition', `attachment; filename=fiche_${titre.replace(/\s+/g, '_').toLowerCase()}.${extension}`);
    res.send(docBuffer);
  } catch (error) {
    console.error("Erreur détaillée lors de la génération de la fiche d'information:", error);
    res.status(500).json({ 
      message: "Erreur lors de la génération du document", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;