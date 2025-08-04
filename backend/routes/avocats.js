const express = require('express');
const router = express.Router();
const Avocat = require('../models/avocat');
const authMiddleware = require('../middleware/auth');
const LogService = require('../services/logService');

// Récupérer tous les avocats
router.get('/', authMiddleware, async (req, res) => {
  try {
    const avocats = await Avocat.find().sort({ prenom: 1, nom: 1 });
    res.json(avocats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer un avocat par son ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const avocat = await Avocat.findById(req.params.id);
    if (!avocat) return res.status(404).json({ message: 'Avocat non trouvé' });
    res.json(avocat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer tous les noms de cabinet (pour l'autocomplétion)
router.get('/utils/cabinets', authMiddleware, async (req, res) => {
  try {
    const cabinets = await Avocat.distinct('cabinet');
    // Filtrer pour enlever les cabinets vides ou null
    const filteredCabinets = cabinets.filter(cabinet => cabinet && cabinet.trim() !== '');
    res.json(filteredCabinets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer toutes les villes d'intervention (pour l'autocomplétion)
router.get('/utils/villes', authMiddleware, async (req, res) => {
  try {
    const avocats = await Avocat.find({}, 'villesIntervention');
    // Extraire toutes les villes d'intervention de tous les avocats
    const villesSet = new Set();
    avocats.forEach(avocat => {
      if (avocat.villesIntervention && Array.isArray(avocat.villesIntervention)) {
        avocat.villesIntervention.forEach(ville => {
          if (ville && ville.trim() !== '') {
            villesSet.add(ville.trim());
          }
        });
      }
    });
    
    const villes = Array.from(villesSet).sort();
    res.json(villes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des avocats par ville d'intervention
router.get('/search/ville/:ville', authMiddleware, async (req, res) => {
  try {
    const ville = req.params.ville;
    const avocats = await Avocat.find({ 
      villesIntervention: { $regex: new RegExp(ville, 'i') } 
    }).sort({ prenom: 1, nom: 1 });
    
    res.json(avocats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Créer un avocat
router.post('/', authMiddleware, async (req, res) => {
  try {
    const avocat = new Avocat(req.body);
    const newAvocat = await avocat.save();
    
    // Logger la création
    await LogService.logCRUD('create', 'avocat', req.user, req, newAvocat._id,
      `${newAvocat.prenom} ${newAvocat.nom}`);
    
    res.status(201).json(newAvocat);
  } catch (err) {
    // Logger l'erreur
    await LogService.logCRUD('create', 'avocat', req.user, req, null, 'Avocat', false, err);
    res.status(400).json({ message: err.message });
  }
});

// Mettre à jour un avocat
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const avocat = await Avocat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!avocat) return res.status(404).json({ message: 'Avocat non trouvé' });
    
    // Logger la mise à jour
    await LogService.logCRUD('update', 'avocat', req.user, req, avocat._id,
      `${avocat.prenom} ${avocat.nom}`);
    
    res.json(avocat);
  } catch (err) {
    // Logger l'erreur
    await LogService.logCRUD('update', 'avocat', req.user, req, req.params.id, 'Avocat', false, err);
    res.status(400).json({ message: err.message });
  }
});

// Supprimer un avocat
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const avocat = await Avocat.findByIdAndDelete(req.params.id);
    if (!avocat) return res.status(404).json({ message: 'Avocat non trouvé' });
    
    // Logger la suppression
    await LogService.logCRUD('delete', 'avocat', req.user, req, req.params.id,
      `${avocat.prenom} ${avocat.nom}`);
    
    res.json({ message: 'Avocat supprimé' });
  } catch (err) {
    // Logger l'erreur
    await LogService.logCRUD('delete', 'avocat', req.user, req, req.params.id, 'Avocat', false, err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;