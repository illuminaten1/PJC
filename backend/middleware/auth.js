const jwt = require('jsonwebtoken');

// Clé secrète pour les tokens JWT depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;

// Vérifier que JWT_SECRET est défini
if (!JWT_SECRET) {
  console.error('❌ ERREUR CRITIQUE: JWT_SECRET n\'est pas défini dans les variables d\'environnement');
  console.error('💡 Solution: Copiez .env.example vers .env et générez un secret avec: openssl rand -base64 48');
  process.exit(1);
}

/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT
 * Si valide, ajoute les informations de l'utilisateur à req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token depuis les headers uniquement (sécurisé)
    const token = req.header('x-auth-token');
    
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