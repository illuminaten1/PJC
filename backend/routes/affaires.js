const express = require('express');
const router = express.Router();
const Affaire = require('../models/affaire');
const Militaire = require('../models/militaire');
const Beneficiaire = require('../models/beneficiaire');

// Middleware de vérification d'ID valide
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'ID d\'affaire invalide' });
  }
  next();
};

// GET - Récupérer toutes les affaires avec filtres
router.get('/', async (req, res) => {
  try {
    const { search, year, archived } = req.query;
    let query = {};
    
    // Filtre par recherche textuelle
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filtre par année de date des faits (remplace anneeBudgetaire)
    if (year) {
      const yearInt = parseInt(year);
      query.dateFaits = {
        $gte: new Date(yearInt, 0, 1),
        $lt: new Date(yearInt + 1, 0, 1)
      };
    }
    
    // Filtre par statut d'archivage
    if (archived !== undefined) {
      query.archive = archived === 'true';
    }
    
    const affaires = await Affaire.find(query).sort({ dateCreation: -1 });
    res.json(affaires);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer une affaire avec ses militaires
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const affaire = await Affaire.findById(req.params.id);
    if (!affaire) {
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    // Récupérer les militaires associés à cette affaire
    const militaires = await Militaire.find({ affaire: req.params.id });
    
    res.json({
      ...affaire.toObject(),
      militaires
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Créer une nouvelle affaire
router.post('/', async (req, res) => {
  try {
    const nouvelleAffaire = new Affaire(req.body);
    const affaireSauvegardee = await nouvelleAffaire.save();
    res.status(201).json(affaireSauvegardee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Mettre à jour une affaire
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    const affaireMaj = await Affaire.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!affaireMaj) {
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    res.json(affaireMaj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer une affaire (avec mot de passe)
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const { password } = req.body;
    
    // Log pour déboguer
    console.log("Tentative de suppression avec mot de passe:", password);
    console.log("Mot de passe attendu:", process.env.DELETE_PASSWORD);
    
    // Vérification du mot de passe (BRPF)
    //if (password !== process.env.DELETE_PASSWORD) {
    //  return res.status(401).json({ message: 'Mot de passe incorrect' });
    //}
    
    // Trouver les militaires liés à cette affaire
    const militaires = await Militaire.find({ affaire: req.params.id });
    const militaireIds = militaires.map(m => m._id);
    
    // Supprimer les bénéficiaires liés à ces militaires
    await Beneficiaire.deleteMany({ militaire: { $in: militaireIds } });
    
    // Supprimer les militaires
    await Militaire.deleteMany({ affaire: req.params.id });
    
    // Supprimer l'affaire
    const affaireSupprimee = await Affaire.findByIdAndDelete(req.params.id);
    
    if (!affaireSupprimee) {
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    res.json({ message: 'Affaire et données associées supprimées avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ message: error.message });
  }
});

// PATCH - Archiver/Désarchiver une affaire
router.patch('/:id/archive', validateObjectId, async (req, res) => {
  try {
    const { archive } = req.body;
    
    if (archive === undefined) {
      return res.status(400).json({ message: 'Le statut d\'archive doit être spécifié' });
    }
    
    // 1. Mettre à jour l'affaire
    const affaireMaj = await Affaire.findByIdAndUpdate(
      req.params.id,
      { archive },
      { new: true }
    );
    
    if (!affaireMaj) {
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    // 2. Récupérer tous les militaires associés à cette affaire
    const militaires = await Militaire.find({ affaire: req.params.id });
    const militaireIds = militaires.map(m => m._id);
    
    // 3. Mettre à jour tous les militaires avec le même statut d'archive
    await Militaire.updateMany(
      { affaire: req.params.id },
      { archive }
    );
    
    // 4. Mettre à jour tous les bénéficiaires associés à ces militaires
    await Beneficiaire.updateMany(
      { militaire: { $in: militaireIds } },
      { archive }
    );
    
    // 5. Préparer un résumé de ce qui a été mis à jour
    const summary = {
      affaire: 1,
      militaires: militaires.length,
      beneficiaires: await Beneficiaire.countDocuments({ militaire: { $in: militaireIds } })
    };
    
    // 6. Renvoyer l'affaire mise à jour avec un message de succès
    res.json({
      ...affaireMaj.toObject(),
      message: `L'affaire et tous ses éléments associés ont été ${archive ? 'archivés' : 'désarchivés'} avec succès`,
      summary
    });
  } catch (error) {
    console.error('Erreur lors de l\'opération d\'archivage:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer toute l'arborescence d'une affaire (militaires + bénéficiaires)
router.get('/:id/arborescence', validateObjectId, async (req, res) => {
  try {
    const affaire = await Affaire.findById(req.params.id);
    
    if (!affaire) {
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    // Récupérer les militaires associés
    const militaires = await Militaire.find({ affaire: req.params.id });
    
    // Pour chaque militaire, récupérer ses bénéficiaires
    const militairesAvecBeneficiaires = await Promise.all(
      militaires.map(async (militaire) => {
        const beneficiaires = await Beneficiaire.find({ militaire: militaire._id });
        return {
          ...militaire.toObject(),
          beneficiaires
        };
      })
    );
    
    res.json({
      ...affaire.toObject(),
      militaires: militairesAvecBeneficiaires
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;