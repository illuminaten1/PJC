/**
 * Utilitaire pour gérer les réponses d'erreur de manière sécurisée
 */

/**
 * Nettoie le message d'erreur pour éviter l'exposition d'informations sensibles
 * @param {Error} error - L'objet d'erreur
 * @returns {string} - Message d'erreur sécurisé
 */
const getSafeErrorMessage = (error) => {
  if (process.env.NODE_ENV === 'development') {
    return error.message;
  }

  // En production, ne pas exposer les détails internes
  // Mapper certains types d'erreurs connus vers des messages génériques
  if (error.name === 'ValidationError') {
    return 'Données de requête invalides';
  }
  
  if (error.name === 'CastError') {
    return 'Identifiant invalide';
  }
  
  if (error.code === 11000) { // Erreur de duplication MongoDB
    return 'Cette ressource existe déjà';
  }
  
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return 'Erreur de base de données';
  }

  // Message générique pour toutes les autres erreurs
  return 'Une erreur interne est survenue';
};

/**
 * Envoie une réponse d'erreur sécurisée
 * @param {Object} res - L'objet de réponse Express
 * @param {Error} error - L'objet d'erreur
 * @param {string} customMessage - Message personnalisé (optionnel)
 * @param {number} statusCode - Code de statut HTTP (défaut: 500)
 */
const sendErrorResponse = (res, error, customMessage = null, statusCode = 500) => {
  const message = customMessage || getSafeErrorMessage(error);
  
  const response = {
    success: false,
    message
  };

  // Ajouter les détails uniquement en développement
  if (process.env.NODE_ENV === 'development') {
    response.error = error.message;
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  getSafeErrorMessage,
  sendErrorResponse
};