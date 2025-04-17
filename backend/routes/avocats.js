const express = require('express');
const router = express.Router();
const Avocat = require('../models/avocat');

// Récupérer tous les avocats
router.get('/', async (req, res) => {
  try {
    const avocats = await Avocat.find().sort({ prenom: 1, nom: 1 });
    res.json(avocats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer un avocat par son ID
router.get('/:id', async (req, res) => {
  try {
    const avocat = await Avocat.findById(req.params.id);
    if (!avocat) return res.status(404).json({ message: 'Avocat non trouvé' });
    res.json(avocat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Créer un avocat
router.post('/', async (req, res) => {
  try {
    const avocat = new Avocat(req.body);
    const newAvocat = await avocat.save();
    res.status(201).json(newAvocat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mettre à jour un avocat
router.put('/:id', async (req, res) => {
  try {
    const avocat = await Avocat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!avocat) return res.status(404).json({ message: 'Avocat non trouvé' });
    res.json(avocat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer un avocat
router.delete('/:id', async (req, res) => {
  try {
    const avocat = await Avocat.findByIdAndDelete(req.params.id);
    if (!avocat) return res.status(404).json({ message: 'Avocat non trouvé' });
    res.json({ message: 'Avocat supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;