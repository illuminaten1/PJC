const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utilisateur = require('../models/utilisateur');
const authMiddleware = require('../middleware/auth');
const LogService = require('../services/logService');

/**
 * Middleware pour vérifier les droits administrateur
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'administrateur') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Accès refusé: droits administrateur requis' 
  });
};

/**
 * @route   GET /api/utilisateurs
 * @desc    Récupérer tous les utilisateurs
 * @access  Admin
 */
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find()
      .select('-password -passwordNeedsHash')
      .sort({ username: 1 });
    
    res.json({
      success: true,
      utilisateurs
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des utilisateurs' 
    });
  }
});

/**
 * @route   GET /api/utilisateurs/:id
 * @desc    Récupérer un utilisateur par son ID
 * @access  Admin
 */
router.get('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id)
      .select('-password -passwordNeedsHash');
    
    if (!utilisateur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({
      success: true,
      utilisateur
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération de l\'utilisateur' 
    });
  }
});

/**
 * @route   POST /api/utilisateurs
 * @desc    Créer un nouvel utilisateur
 * @access  Admin
 */
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { username, password, nom, role } = req.body;
    
    // Vérifier que tous les champs requis sont présents
    if (!username || !password || !nom || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis' 
      });
    }
    
    // Vérifier que le rôle est valide
    if (role !== 'administrateur' && role !== 'redacteur') {
      return res.status(400).json({ 
        success: false, 
        message: 'Rôle invalide. Les rôles autorisés sont: administrateur, redacteur' 
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ username });
    if (utilisateurExistant) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce nom d\'utilisateur existe déjà' 
      });
    }
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Créer le nouvel utilisateur
    const nouvelUtilisateur = new Utilisateur({
      username,
      password: hashedPassword,
      nom,
      role,
      dateCreation: new Date(),
      actif: true,
      passwordNeedsHash: false
    });
    
    await nouvelUtilisateur.save();
    
    // Logger la création
    await LogService.logCRUD('create', 'utilisateur', req.user, req, nouvelUtilisateur._id,
      nouvelUtilisateur.username, true, null, { role: nouvelUtilisateur.role });
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      utilisateur: {
        id: nouvelUtilisateur._id,
        username: nouvelUtilisateur.username,
        nom: nouvelUtilisateur.nom,
        role: nouvelUtilisateur.role,
        actif: nouvelUtilisateur.actif
      }
    });
  } catch (err) {
    console.error('Erreur lors de la création de l\'utilisateur:', err);
    
    // Logger l'erreur
    await LogService.logCRUD('create', 'utilisateur', req.user, req, null,
      req.body.username, false, err);
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la création de l\'utilisateur' 
    });
  }
});

/**
 * @route   PUT /api/utilisateurs/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Admin
 */
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { username, password, nom, role, actif } = req.body;
    
    // Chercher l'utilisateur à mettre à jour
    const utilisateur = await Utilisateur.findById(req.params.id);
    
    if (!utilisateur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Vérifier que l'administrateur ne désactive pas son propre compte
    if (req.user.id === utilisateur._id.toString() && actif === false) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vous ne pouvez pas désactiver votre propre compte' 
      });
    }
    
    // Vérifier que l'administrateur ne change pas son rôle s'il est le dernier admin
    if (req.user.id === utilisateur._id.toString() && 
        utilisateur.role === 'administrateur' && 
        role === 'redacteur') {
      
      // Compter le nombre d'administrateurs actifs
      const nombreAdmins = await Utilisateur.countDocuments({ 
        role: 'administrateur', 
        actif: true 
      });
      
      if (nombreAdmins <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vous ne pouvez pas changer votre rôle car vous êtes le dernier administrateur actif' 
        });
      }
    }
    
    // Vérifier si le nouveau nom d'utilisateur existe déjà (si modifié)
    if (username !== utilisateur.username) {
      const utilisateurExistant = await Utilisateur.findOne({ username });
      if (utilisateurExistant) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ce nom d\'utilisateur existe déjà' 
        });
      }
    }
    
    // Mettre à jour les champs
    if (username) utilisateur.username = username;
    if (password) {
      // Hacher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      utilisateur.password = await bcrypt.hash(password, salt);
      utilisateur.passwordNeedsHash = false;
    }
    if (nom) utilisateur.nom = nom;
    if (role) utilisateur.role = role;
    if (actif !== undefined) utilisateur.actif = actif;
    
    await utilisateur.save();
    
    // Logger la mise à jour
    await LogService.logCRUD('update', 'utilisateur', req.user, req, utilisateur._id,
      utilisateur.username, true, null, { role: utilisateur.role, actif: utilisateur.actif });
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      utilisateur: {
        id: utilisateur._id,
        username: utilisateur.username,
        nom: utilisateur.nom,
        role: utilisateur.role,
        actif: utilisateur.actif
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    
    // Logger l'erreur
    await LogService.logCRUD('update', 'utilisateur', req.user, req, req.params.id,
      'Utilisateur', false, err);
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la mise à jour de l\'utilisateur' 
    });
  }
});

/**
 * @route   DELETE /api/utilisateurs/:id
 * @desc    Supprimer un utilisateur
 * @access  Admin
 */
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    // Empêcher la suppression de son propre compte
    if (req.user.id === req.params.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vous ne pouvez pas supprimer votre propre compte' 
      });
    }
    
    const utilisateur = await Utilisateur.findById(req.params.id);
    
    if (!utilisateur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    await Utilisateur.findByIdAndDelete(req.params.id);
    
    // Logger la suppression
    await LogService.logCRUD('delete', 'utilisateur', req.user, req, req.params.id,
      utilisateur.username, true);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    
    // Logger l'erreur
    await LogService.logCRUD('delete', 'utilisateur', req.user, req, req.params.id,
      'Utilisateur', false, err);
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la suppression de l\'utilisateur' 
    });
  }
});

/**
 * @route   PATCH /api/utilisateurs/:id/password
 * @desc    Changer le mot de passe d'un utilisateur
 * @access  Admin
 */
router.patch('/:id/password', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nouveau mot de passe est requis' 
      });
    }
    
    const utilisateur = await Utilisateur.findById(req.params.id);
    
    if (!utilisateur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    utilisateur.password = await bcrypt.hash(password, salt);
    utilisateur.passwordNeedsHash = false;
    
    await utilisateur.save();
    
    // Logger le changement de mot de passe
    await LogService.logUserAction({
      action: 'PASSWORD_CHANGE',
      user: req.user,
      req,
      resourceType: 'utilisateur',
      resourceId: utilisateur._id,
      resourceName: utilisateur.username,
      success: true,
      details: { targetUser: utilisateur.username }
    });
    
    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (err) {
    console.error('Erreur lors du changement de mot de passe:', err);
    
    // Logger l'erreur
    await LogService.logUserAction({
      action: 'PASSWORD_CHANGE',
      user: req.user,
      req,
      resourceType: 'utilisateur',
      resourceId: req.params.id,
      success: false,
      error: err
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors du changement de mot de passe' 
    });
  }
});

/**
 * @route   PATCH /api/utilisateurs/:id/toggle-actif
 * @desc    Activer/désactiver un utilisateur
 * @access  Admin
 */
router.patch('/:id/toggle-actif', authMiddleware, isAdmin, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    
    if (!utilisateur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Empêcher la désactivation de son propre compte
    if (req.user.id === utilisateur._id.toString() && utilisateur.actif) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vous ne pouvez pas désactiver votre propre compte' 
      });
    }
    
    utilisateur.actif = !utilisateur.actif;
    await utilisateur.save();
    
    // Logger l'activation/désactivation
    await LogService.logUserAction({
      action: utilisateur.actif ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      user: req.user,
      req,
      resourceType: 'utilisateur',
      resourceId: utilisateur._id,
      resourceName: utilisateur.username,
      success: true,
      details: { newStatus: utilisateur.actif ? 'active' : 'inactive' }
    });
    
    res.json({
      success: true,
      message: `Utilisateur ${utilisateur.actif ? 'activé' : 'désactivé'} avec succès`,
      actif: utilisateur.actif
    });
  } catch (err) {
    console.error('Erreur lors du changement de statut de l\'utilisateur:', err);
    
    // Logger l'erreur
    await LogService.logUserAction({
      action: 'USER_ACTIVATE',
      user: req.user,
      req,
      resourceType: 'utilisateur',
      resourceId: req.params.id,
      success: false,
      error: err
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors du changement de statut de l\'utilisateur' 
    });
  }
});

module.exports = router;