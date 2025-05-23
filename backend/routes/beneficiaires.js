const express = require('express');
const router = express.Router();
const Beneficiaire = require('../models/beneficiaire');
const Militaire = require('../models/militaire');

// Middleware de vérification d'ID
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'ID bénéficiaire invalide' });
  }
  next();
};

// GET - Récupérer tous les bénéficiaires avec filtres
router.get('/', async (req, res) => {
  try {
    const { search, militaire, qualite, redacteur, annee, archive } = req.query;
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (militaire) {
      query.militaire = militaire;
    }
    
    if (qualite) {
      query.qualite = qualite;
    }
    
    // Modifier cette partie pour rechercher le redacteur dans l'affaire
    // au lieu du bénéficiaire si redacteur est spécifié
    let affaireFilter = {};
    if (redacteur) {
      affaireFilter = { 'affaire.redacteur': redacteur };
    }
    
    if (annee) {
      // Recherche par année dans les conventions ou paiements
      query.$or = [
        { 'conventions.anneeBudgetaire': parseInt(annee) },
        { 'paiements.anneePaiement': parseInt(annee) }
      ];
    }
    
    if (archive !== undefined) {
      query.archive = archive === 'true';
    }
    
    // Populate 
    const beneficiaires = await Beneficiaire.find(query)
      .populate({
        path: 'militaire',
        select: 'grade prenom nom affaire',
        populate: {
          path: 'affaire',
          select: 'nom redacteur'
        }
      })
      .populate('avocats') // Ajout du populate des avocats
      .sort({ dateCreation: -1 });
    
    // Si on a un filtre de rédacteur, filtrer côté serveur
    // (temporairement, en attendant une meilleure solution avec agrégation)
    const filteredBeneficiaires = redacteur 
      ? beneficiaires.filter(b => 
          b.militaire && 
          b.militaire.affaire && 
          b.militaire.affaire.redacteur === redacteur)
      : beneficiaires;
    
    res.json(filteredBeneficiaires);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET - Récupérer un bénéficiaire spécifique
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const beneficiaire = await Beneficiaire.findById(req.params.id)
      .populate({
        path: 'militaire',
        select: 'grade prenom nom unite region departement affaire',
        populate: {
          path: 'affaire',
          select: 'nom description lieu dateFaits redacteur'
        }
      })
      .populate('avocats');
    
    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    res.json(beneficiaire);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Créer un nouveau bénéficiaire
router.post('/', async (req, res) => {
  try {
    // Supprimer le redacteur des données reçues
    const { redacteur, ...beneficiaireData } = req.body;

    // Vérifier si les avocats sont fournis et les traiter
    if (beneficiaireData.avocats && Array.isArray(beneficiaireData.avocats)) {
      beneficiaireData.avocats = beneficiaireData.avocats.map(avocat => {
        return typeof avocat === 'object' && avocat._id ? avocat._id : avocat;
      });
    }

    const nouveauBeneficiaire = new Beneficiaire(beneficiaireData);
    const beneficiaireSauvegarde = await nouveauBeneficiaire.save();
    
    // Ajouter ce bénéficiaire au militaire correspondant
    await Militaire.findByIdAndUpdate(
      beneficiaireData.militaire,
      { $push: { beneficiaires: beneficiaireSauvegarde._id } }
    );
    
    res.status(201).json(beneficiaireSauvegarde);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour un bénéficiaire
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    const beneficiaireMaj = await Beneficiaire.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!beneficiaireMaj) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    res.json(beneficiaireMaj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer un bénéficiaire (avec mot de passe)
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    // Supprimer la vérification du mot de passe
    // const { password } = req.body;
    // if (password !== process.env.DELETE_PASSWORD) {
    //   return res.status(401).json({ message: 'Mot de passe incorrect' });
    // }
    
    const beneficiaireSupprime = await Beneficiaire.findByIdAndDelete(req.params.id);
    
    if (!beneficiaireSupprime) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    // Retirer la référence de ce bénéficiaire dans le militaire
    await Militaire.findByIdAndUpdate(
      beneficiaireSupprime.militaire,
      { $pull: { beneficiaires: req.params.id } }
    );
    
    res.json({ message: 'Bénéficiaire supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Ajouter une convention d'honoraires
router.post('/:id/conventions', validateObjectId, async (req, res) => {
  try {
    const beneficiaire = await Beneficiaire.findById(req.params.id);
    
    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    beneficiaire.conventions.push(req.body);
    const beneficiaireMaj = await beneficiaire.save();
    
    res.status(201).json(beneficiaireMaj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour une convention d'honoraires
router.put('/:id/conventions/:index', validateObjectId, async (req, res) => {
  try {
    const { id, index } = req.params;
    const conventionIndex = parseInt(index);
    
    // Vérifier que l'index est un nombre valide
    if (isNaN(conventionIndex)) {
      return res.status(400).json({ message: 'Index de convention invalide' });
    }
    
    // Récupérer le bénéficiaire
    const beneficiaire = await Beneficiaire.findById(id);
    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    // Vérifier que la convention existe
    if (!beneficiaire.conventions[conventionIndex]) {
      return res.status(404).json({ message: 'Convention non trouvée' });
    }
    
    // Mettre à jour la convention
    const conventionUpdates = req.body;
    Object.keys(conventionUpdates).forEach(key => {
      if (key !== '_id') { // Ignorer l'ID pour éviter des problèmes
        beneficiaire.conventions[conventionIndex][key] = conventionUpdates[key];
      }
    });
    
    // Sauvegarder les modifications
    await beneficiaire.save();
    
    res.json(beneficiaire);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la convention:", error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer une convention d'honoraires
router.delete('/:id/conventions/:index', validateObjectId, async (req, res) => {
  try {
    const { id, index } = req.params;
    const conventionIndex = parseInt(index);
    
    // Vérifier que l'index est un nombre valide
    if (isNaN(conventionIndex)) {
      return res.status(400).json({ message: 'Index de convention invalide' });
    }
    
    // Récupérer le bénéficiaire
    const beneficiaire = await Beneficiaire.findById(id);
    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    // Vérifier que la convention existe
    if (!beneficiaire.conventions[conventionIndex]) {
      return res.status(404).json({ message: 'Convention non trouvée' });
    }
    
    // Supprimer la convention à l'index spécifié
    beneficiaire.conventions.splice(conventionIndex, 1);
    
    // Sauvegarder les modifications
    await beneficiaire.save();
    
    res.json({ message: 'Convention supprimée avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de la convention:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST - Ajouter un paiement
router.post('/:id/paiements', validateObjectId, async (req, res) => {
  try {
    const beneficiaire = await Beneficiaire.findById(req.params.id);
    
    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    beneficiaire.paiements.push(req.body);
    const beneficiaireMaj = await beneficiaire.save();
    
    res.status(201).json(beneficiaireMaj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour un paiement
router.put('/:id/paiements/:index', validateObjectId, async (req, res) => {
  try {
    const { id, index } = req.params;
    const paiementIndex = parseInt(index);
    
    // Vérifier que l'index est un nombre valide
    if (isNaN(paiementIndex)) {
      return res.status(400).json({ message: 'Index de paiement invalide' });
    }
    
    // Récupérer le bénéficiaire
    const beneficiaire = await Beneficiaire.findById(id);
    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    // Vérifier que le paiement existe
    if (!beneficiaire.paiements[paiementIndex]) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    // Mettre à jour le paiement
    const paiementUpdates = req.body;
    Object.keys(paiementUpdates).forEach(key => {
      if (key !== '_id') { // Ignorer l'ID pour éviter des problèmes
        beneficiaire.paiements[paiementIndex][key] = paiementUpdates[key];
      }
    });
    
    // Sauvegarder les modifications
    await beneficiaire.save();
    
    res.json(beneficiaire);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du paiement:", error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer un paiement
router.delete('/:id/paiements/:index', validateObjectId, async (req, res) => {
  try {
    const { id, index } = req.params;
    const paiementIndex = parseInt(index);
    
    // Vérifier que l'index est un nombre valide
    if (isNaN(paiementIndex)) {
      return res.status(400).json({ message: 'Index de paiement invalide' });
    }
    
    // Récupérer le bénéficiaire
    const beneficiaire = await Beneficiaire.findById(id);
    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }
    
    // Vérifier que le paiement existe
    if (!beneficiaire.paiements[paiementIndex]) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    // Supprimer le paiement à l'index spécifié
    beneficiaire.paiements.splice(paiementIndex, 1);
    
    // Sauvegarder les modifications
    await beneficiaire.save();
    
    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression du paiement:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;