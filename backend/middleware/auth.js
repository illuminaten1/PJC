const jwt = require('jsonwebtoken');

// Clé secrète pour les tokens JWT (à mettre dans .env en production)
// Assurez-vous que c'est la même clé que dans routes/auth.js
const JWT_SECRET = 'pjc_secret_key';

/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT
 * Si valide, ajoute les informations de l'utilisateur à req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token depuis les headers ou depuis les paramètres de requête
    const tokenHeader = req.header('x-auth-token');
    const tokenQuery = req.query.token;
    const token = tokenHeader || tokenQuery;
    
    // Si pas de token, refuser l'accès
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Accès refusé. Token manquant.' 
      });
    }
    
    try {
      // Vérifier le token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Ajouter les informations utilisateur à la requête
      req.user = decoded;
      
      // Passer au middleware/contrôleur suivant
      next();
    } catch (err) {
      // Si le token est invalide ou expiré
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide ou expiré.' 
      });
    }
  } catch (err) {
    console.error('Erreur dans le middleware d\'authentification:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur dans le middleware d\'authentification.' 
    });
  }
};

module.exports = authMiddleware;