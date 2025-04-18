const express = require('express');
const router = express.Router();
const Parametre = require('../models/parametre');
const Affaire = require('../models/affaire');
const TransfertHistorique = require('../models/transfertHistorique');

// GET - Récupérer tous les paramètres
router.get('/', async (req, res) => {
  try {
    const parametres = await Parametre.find();
    
    // Transformer en objet pour faciliter l'utilisation côté client
    const parametresFormates = parametres.reduce((acc, param) => {
      acc[param.type] = param.valeurs;
      return acc;
    }, {});
    
    res.json(parametresFormates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST - Transférer un portefeuille d'un rédacteur à un autre
 * Cette route met à jour toutes les affaires qui référencent le rédacteur source
 * pour les faire pointer vers le rédacteur cible
 */
router.post('/transfert-portefeuille', async (req, res) => {
  try {
    console.log('Requête reçue:', req.body);
    const { sourceRedacteur, targetRedacteur } = req.body;
    
    console.log('Paramètres extraits:', { sourceRedacteur, targetRedacteur });

    if (!sourceRedacteur || !targetRedacteur) {
      return res.status(400).json({ message: 'Les rédacteurs source et cible sont requis' });
    }
    
    if (sourceRedacteur === targetRedacteur) {
      return res.status(400).json({ message: 'Les rédacteurs source et cible doivent être différents' });
    }
    
    // Mettre à jour les affaires
    const updateResult = await Affaire.updateMany(
      { redacteur: sourceRedacteur },
      { redacteur: targetRedacteur }
    );
    
    // Créer un enregistrement dans l'historique des transferts
    const historique = new TransfertHistorique({
      sourceRedacteur,
      targetRedacteur,
      affairesModifiees: updateResult.modifiedCount,
      statut: 'succès',
      message: `Transfert effectué avec succès. ${updateResult.modifiedCount} affaires modifiées.`
    });
    
    await historique.save();
    
    res.status(200).json({ 
      message: 'Transfert effectué avec succès',
      affairesModifiees: updateResult.modifiedCount,
      historique: historique
    });
    
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({ message: 'Erreur lors du transfert de portefeuille', error: error.message });
    
    // Enregistrer l'échec dans l'historique
    try {
      const historique = new TransfertHistorique({
        sourceRedacteur: req.body.sourceRedacteur || 'inconnu',
        targetRedacteur: req.body.targetRedacteur || 'inconnu',
        affairesModifiees: 0,
        statut: 'échec',
        message: error.message || 'Erreur inconnue lors du transfert'
      });
      
      await historique.save();
    } catch (histError) {
      console.error('Erreur lors de l\'enregistrement de l\'historique:', histError);
    }
    
    // Retourner une seule réponse d'erreur
    return res.status(500).json({ message: 'Erreur lors du transfert de portefeuille', error: error.message });
  }
});

/**
 * GET - Récupérer l'historique des transferts des 30 derniers jours
 */
router.get('/historique-transferts', async (req, res) => {
  console.log('Requête d\'historique reçue');
  
  try {
    // Vérifier si le modèle existe
    console.log('Modèle TransfertHistorique :', typeof TransfertHistorique);
    
    // Calculer la date il y a 30 jours
    const trenteDernierJours = new Date();
    trenteDernierJours.setDate(trenteDernierJours.getDate() - 30);
    console.log('Recherche depuis :', trenteDernierJours);
    
    // Tentative de requête
    const historique = await TransfertHistorique.find({
      dateTransfert: { $gte: trenteDernierJours }
    }).sort({ dateTransfert: -1 });
    
    console.log('Historique trouvé :', historique.length, 'entrées');
    res.json(historique);
  } catch (error) {
    console.error('Erreur détaillée historique :', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de l\'historique des transferts', 
      error: error.message 
    });
  }
});

// GET - Récupérer un type de paramètre spécifique
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    // Vérifier que le type est valide
    if (!['circonstances', 'redacteurs', 'templateConvention'].includes(type)) {
      return res.status(400).json({ message: 'Type de paramètre invalide' });
    }
    
    const parametre = await Parametre.findOne({ type });
    
    if (!parametre) {
      // Si le paramètre n'existe pas, retourner un tableau vide
      return res.json([]);
    }
    
    res.json(parametre.valeurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer les paramètres par type
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const parametre = await Parametre.findOne({ type });
    
    if (!parametre) {
      return res.status(200).json([]);  // Retourner un tableau vide si aucun paramètre trouvé
    }
    
    res.status(200).json(parametre.valeurs);
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des paramètres" });
  }
});

// POST - Mettre à jour un type de paramètre
router.post('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { valeurs } = req.body;
    
    // Vérifier que le type est valide
    if (!['circonstances', 'redacteurs', 'templateConvention'].includes(type)) {
      return res.status(400).json({ message: 'Type de paramètre invalide' });
    }
    
    // Vérifier que les valeurs sont au bon format
    if (!Array.isArray(valeurs)) {
      return res.status(400).json({ message: 'Les valeurs doivent être un tableau' });
    }
    
    // Mettre à jour ou créer le paramètre
    const parametre = await Parametre.findOneAndUpdate(
      { type },
      { 
        type,
        valeurs,
        derniereMiseAJour: new Date()
      },
      { new: true, upsert: true }
    );
    
    res.json(parametre.valeurs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Ajouter une valeur à un type de paramètre
router.put('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { valeur } = req.body;
    
    // Vérifier que le type est valide
    if (!['circonstances', 'redacteurs', 'templateConvention'].includes(type)) {
      return res.status(400).json({ message: 'Type de paramètre invalide' });
    }
    
    // Vérifier que la valeur n'est pas vide
    if (!valeur) {
      return res.status(400).json({ message: 'La valeur ne peut pas être vide' });
    }
    
    // Récupérer le paramètre existant ou en créer un nouveau
    let parametre = await Parametre.findOne({ type });
    
    if (!parametre) {
      parametre = new Parametre({
        type,
        valeurs: [valeur],
        derniereMiseAJour: new Date()
      });
    } else {
      // Vérifier si la valeur existe déjà
      if (parametre.valeurs.includes(valeur)) {
        return res.status(400).json({ message: 'Cette valeur existe déjà' });
      }
      
      // Ajouter la nouvelle valeur
      parametre.valeurs.push(valeur);
      parametre.derniereMiseAJour = new Date();
    }
    
    await parametre.save();
    
    res.json(parametre.valeurs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Supprimer une valeur d'un type de paramètre
router.delete('/:type/:index', async (req, res) => {
  try {
    const { type, index } = req.params;
    const idx = parseInt(index);
    
    // Vérifier que le type est valide
    if (!['circonstances', 'redacteurs', 'templateConvention'].includes(type)) {
      return res.status(400).json({ message: 'Type de paramètre invalide' });
    }
    
    // Vérifier que l'index est un nombre
    if (isNaN(idx)) {
      return res.status(400).json({ message: 'Index invalide' });
    }
    
    // Récupérer le paramètre
    const parametre = await Parametre.findOne({ type });
    
    if (!parametre) {
      return res.status(404).json({ message: 'Paramètre non trouvé' });
    }
    
    // Vérifier que l'index est valide
    if (idx < 0 || idx >= parametre.valeurs.length) {
      return res.status(400).json({ message: 'Index hors limites' });
    }
    
    // Supprimer la valeur
    parametre.valeurs.splice(idx, 1);
    parametre.derniereMiseAJour = new Date();
    
    await parametre.save();
    
    res.json(parametre.valeurs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;