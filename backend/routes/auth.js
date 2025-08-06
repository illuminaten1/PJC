const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // ou bcryptjs
const Utilisateur = require('../models/utilisateur');
const LogService = require('../services/logService');
const { loginValidation } = require('../middleware/validation');
// const { sendErrorResponse } = require('../utils/errorHandler'); // Disponible si nécessaire

// Clé secrète pour les tokens JWT depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;

// Vérifier que JWT_SECRET est défini
if (!JWT_SECRET) {
  console.error('❌ ERREUR CRITIQUE: JWT_SECRET n\'est pas défini dans les variables d\'environnement');
  console.error('💡 Solution: Copiez .env.example vers .env et générez un secret avec: openssl rand -base64 48');
  process.exit(1);
}

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur et génération de token
 * @access  Public
 */
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Rechercher l'utilisateur dans la base de données
    const utilisateur = await Utilisateur.findOne({ username });

    // Vérifier si l'utilisateur existe
    if (!utilisateur) {
      await LogService.logLogin(username, false, req, new Error('Utilisateur non trouvé'));
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants incorrects' 
      });
    }

    // Vérifier si le compte est actif
    if (!utilisateur.actif) {
      await LogService.logLogin(username, false, req, new Error('Compte désactivé'));
      return res.status(401).json({ 
        success: false, 
        message: 'Ce compte a été désactivé' 
      });
    }

    // Vérifier le mot de passe avec la méthode comparePassword
    let isMatch = false;
    
    try {
      isMatch = await utilisateur.comparePassword(password);
    } catch (error) {
      console.error('Erreur lors de comparePassword:', error);
      
      // Fallback en cas d'erreur: essayer la comparaison directe avec bcrypt
      try {
        // Si le mot de passe a le format bcrypt, essayer bcrypt.compare directement
        if (utilisateur.password.startsWith('$2')) {
          isMatch = await bcrypt.compare(password, utilisateur.password);
        } else if (utilisateur.passwordNeedsHash === true) {
          // Si marqué explicitement comme non haché, essayer comparaison directe
          isMatch = utilisateur.password === password;
        }
      } catch (innerError) {
        console.error('Erreur secondaire lors de la vérification:', innerError);
      }
    }
    
    if (!isMatch) {
      await LogService.logLogin(username, false, req, new Error('Mot de passe incorrect'));
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants incorrects' 
      });
    }

    // Si le mot de passe était en clair, le hacher pour les prochaines connexions
    if (utilisateur.passwordNeedsHash === true || 
       (!utilisateur.password.startsWith('$2a$') && 
        !utilisateur.password.startsWith('$2b$') && 
        !utilisateur.password.startsWith('$2y$'))) {
      
      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      utilisateur.password = await bcrypt.hash(password, salt);
      utilisateur.passwordNeedsHash = false;
      await utilisateur.save();
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

    // Logger la connexion réussie
    await LogService.logLogin(username, true, req, null, utilisateur);

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
      const utilisateur = await Utilisateur.findById(decoded.id).select('-password -passwordNeedsHash');
      
      if (!utilisateur || !utilisateur.actif) {
        await LogService.logUserAction({
          action: 'TOKEN_VERIFICATION_FAILURE',
          req,
          success: false,
          error: new Error('Utilisateur invalide ou désactivé'),
          details: { reason: 'user_invalid_or_disabled' }
        });
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

    // Hacher le mot de passe par défaut de manière explicite
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);
    
    // Vérifier que le hachage fonctionne
    const testVerification = await bcrypt.compare('admin', hashedPassword);
    if (!testVerification) {
      throw new Error('Échec de vérification du hachage - problème avec bcrypt');
    }

    // Créer le premier administrateur directement dans la base de données
    const adminData = {
      username: 'admin',
      password: hashedPassword,
      role: 'administrateur',
      nom: 'Administrateur',
      dateCreation: new Date(),
      actif: true,
      passwordNeedsHash: false
    };
    
    // Utiliser l'insertion directe pour éviter middleware
    const result = await mongoose.connection.db.collection('utilisateurs').insertOne(adminData);
    
    // Vérifier si l'insertion a réussi
    if (!result.acknowledged) {
      throw new Error('Échec de création de l\'administrateur');
    }

    res.status(201).json({
      success: true,
      message: 'Administrateur initial créé avec succès (username: admin, password: admin)',
      utilisateur: {
        id: result.insertedId,
        username: 'admin',
        nom: 'Administrateur'
      }
    });
  } catch (err) {
    console.error('Erreur d\'initialisation:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'initialisation',
      error: err.message
    });
  }
});

module.exports = router;