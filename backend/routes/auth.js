const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateur');

// Clé secrète pour les tokens JWT (à mettre dans .env en production)
const JWT_SECRET = 'pjc_secret_key';

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur et génération de token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier que l'username et le mot de passe sont fournis
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nom d\'utilisateur et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur dans la base de données
    const utilisateur = await Utilisateur.findOne({ username });

    // Vérifier si l'utilisateur existe
    if (!utilisateur) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants incorrects' 
      });
    }

    // Vérifier si le compte est actif
    if (!utilisateur.actif) {
      return res.status(401).json({ 
        success: false, 
        message: 'Ce compte a été désactivé' 
      });
    }

    // Vérifier le mot de passe (comparaison simple car stockage en clair comme demandé)
    if (utilisateur.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants incorrects' 
      });
    }

    // Mettre à jour la date de dernière connexion
    utilisateur.dernierLogin = new Date();
    await utilisateur.save();

    // Créer le payload du token JWT
    const payload = {
      id: utilisateur._id,
      username: utilisateur.username,
      role: utilisateur.role,
      nom: utilisateur.nom
    };

    // Générer le token (expire après 24h)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      utilisateur: {
        id: utilisateur._id,
        username: utilisateur.username,
        nom: utilisateur.nom,
        role: utilisateur.role
      }
    });
  } catch (err) {
    console.error('Erreur de connexion:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la connexion' 
    });
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Vérifier la validité du token JWT
 * @access  Public
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token manquant, accès refusé'
      });
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Vérifier que l'utilisateur existe toujours et est actif
      const utilisateur = await Utilisateur.findById(decoded.id).select('-password');
      
      if (!utilisateur || !utilisateur.actif) {
        return res.status(401).json({ 
          success: false, 
          message: 'Utilisateur invalide ou désactivé' 
        });
      }

      res.json({
        success: true,
        utilisateur: {
          id: utilisateur._id,
          username: utilisateur.username,
          nom: utilisateur.nom,
          role: utilisateur.role
        }
      });
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide' 
      });
    }
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la vérification du token' 
    });
  }
});

/**
 * @route   POST /api/auth/init
 * @desc    Initialiser le premier administrateur si aucun utilisateur n'existe
 * @access  Public
 */
router.post('/init', async (req, res) => {
  try {
    // Vérifier si des utilisateurs existent déjà
    const utilisateurCount = await Utilisateur.countDocuments();
    
    if (utilisateurCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'L\'initialisation n\'est possible que si aucun utilisateur n\'existe' 
      });
    }

    // Créer le premier administrateur
    const adminUtilisateur = new Utilisateur({
      username: 'admin',
      password: 'admin',  // À changer immédiatement après la première connexion
      role: 'administrateur',
      nom: 'Administrateur'
    });

    await adminUtilisateur.save();

    res.status(201).json({
      success: true,
      message: 'Administrateur initial créé avec succès (username: admin, password: admin)',
      utilisateur: {
        id: adminUtilisateur._id,
        username: adminUtilisateur.username,
        nom: adminUtilisateur.nom
      }
    });
  } catch (err) {
    console.error('Erreur d\'initialisation:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'initialisation' 
    });
  }
});

module.exports = router;