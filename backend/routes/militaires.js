const express = require('express');
const router = express.Router();
const Militaire = require('../models/militaire');
const Beneficiaire = require('../models/beneficiaire');
const authMiddleware = require('../middleware/auth');
const Affaire = require('../models/affaire');

// Middleware de vérification d'ID
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'ID militaire invalide' });
  }
  next();
};

// GET - Récupérer tous les militaires avec filtres
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, affaire, redacteur, region, departement, archive } = req.query;
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (affaire) {
      query.affaire = affaire;
    }
    
    // Gestion du filtre par région
    if (region) {
      query.region = region;
    }
    
    // Gestion du filtre par département
    if (departement) {
      query.departement = departement;
    }
    
    // Gestion du filtre par rédacteur
    if (redacteur) {
      // Trouver d'abord les affaires avec ce rédacteur
      const affaires = await Affaire.find({ redacteur: redacteur }).select('_id');
      const affaireIds = affaires.map(a => a._id);
      
      // Si un filtre par affaire existe déjà, faire une intersection
      if (query.affaire) {
        // Si l'affaire est déjà un ID spécifique
        if (typeof query.affaire === 'string') {
          // Vérifier si cet ID est dans la liste des affaires filtrées par rédacteur
          if (!affaireIds.some(id => id.toString() === query.affaire)) {
            // Si ce n'est pas le cas, aucun résultat ne sera retourné
            return res.json([]);
          }
        } else {
          // Sinon, appliquer le filtre $in
          query.affaire = { $in: affaireIds };
        }
      } else {
        // Si aucun filtre d'affaire n'existe, l'ajouter
        query.affaire = { $in: affaireIds };
      }
    }
    
    // Gestion du filtre par statut d'archivage
    if (archive !== undefined) {
      const archiveBool = archive === 'true';
      
      // Trouver les affaires avec ce statut d'archivage
      const affaires = await Affaire.find({ archive: archiveBool }).select('_id');
      const affaireIds = affaires.map(a => a._id);
      
      // Appliquer le filtre en fonction des filtres précédents
      if (query.affaire) {
        if (typeof query.affaire === 'string') {
          // Pour un ID d'affaire spécifique
          if (!affaireIds.some(id => id.toString() === query.affaire)) {
            return res.json([]);
          }
        } else if (query.affaire.$in) {
          // Pour une liste d'IDs d'affaires, faire l'intersection
          const filteredIds = query.affaire.$in.filter(id => 
            affaireIds.some(aId => aId.toString() === id.toString())
          );
          query.affaire = { $in: filteredIds };
          
          if (filteredIds.length === 0) {
            return res.json([]);
          }
        }
      } else {
        // Si aucun filtre d'affaire n'existe, l'ajouter
        query.affaire = { $in: affaireIds };
      }
    }
    
    // Récupérer les militaires avec les informations complètes de l'affaire
    const militaires = await Militaire.find(query).populate('affaire', 'nom redacteur archive');
    res.json(militaires);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer un militaire spécifique avec ses bénéficiaires
router.get('/:id', authMiddleware, validateObjectId, async (req, res) => {
  try {
    const militaire = await Militaire.findById(req.params.id).populate('affaire');
    
    if (!militaire) {
      return res.status(404).json({ message: 'Militaire non trouvé' });
    }
    
    // Récupérer les bénéficiaires associés avec leurs avocats
    const beneficiaires = await Beneficiaire.find({ militaire: req.params.id })
      .populate('avocats');
    
    res.json({
      ...militaire.toObject(),
      beneficiaires
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Créer un nouveau militaire
router.post('/', authMiddleware, async (req, res) => {
  try {
    const nouveauMilitaire = new Militaire(req.body);
    const militaireSauvegarde = await nouveauMilitaire.save();
    
    // Ajouter ce militaire à l'affaire correspondante
    await Affaire.findByIdAndUpdate(
      req.body.affaire,
      { $push: { militaires: militaireSauvegarde._id } }
    );
    
    res.status(201).json(militaireSauvegarde);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour un militaire
router.put('/:id', authMiddleware, validateObjectId, async (req, res) => {
  try {
    const militaireMaj = await Militaire.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!militaireMaj) {
      return res.status(404).json({ message: 'Militaire non trouvé' });
    }
    
    res.json(militaireMaj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer un militaire
router.delete('/:id', authMiddleware, validateObjectId, async (req, res) => {
  try {
        
    // Supprimer les bénéficiaires associés
    await Beneficiaire.deleteMany({ militaire: req.params.id });
    
    // Supprimer le militaire
    const militaireSupprime = await Militaire.findByIdAndDelete(req.params.id);
    
    if (!militaireSupprime) {
      return res.status(404).json({ message: 'Militaire non trouvé' });
    }
    
    // Retirer la référence de ce militaire dans l'affaire
    await Affaire.findByIdAndUpdate(
      militaireSupprime.affaire,
      { $pull: { militaires: req.params.id } }
    );
    
    res.json({ message: 'Militaire et bénéficiaires associés supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;