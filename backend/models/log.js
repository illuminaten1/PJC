const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 94608000 // 3 ans en secondes (365 * 3 * 24 * 60 * 60)
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    default: 'info'
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Authentification
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE', 
      'LOGOUT',
      'TOKEN_VERIFICATION_FAILURE',
      
      // Gestion des utilisateurs
      'USER_CREATE',
      'USER_VIEW',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_ACTIVATE',
      'USER_DEACTIVATE',
      'PASSWORD_CHANGE',
      
      // Affaires
      'AFFAIRE_CREATE',
      'AFFAIRE_VIEW',
      'AFFAIRE_UPDATE',
      'AFFAIRE_DELETE',
      'AFFAIRE_ARCHIVE',
      
      // Militaires
      'MILITAIRE_CREATE',
      'MILITAIRE_VIEW',
      'MILITAIRE_UPDATE',
      'MILITAIRE_DELETE',
      
      // Bénéficiaires
      'BENEFICIAIRE_CREATE',
      'BENEFICIAIRE_VIEW',
      'BENEFICIAIRE_UPDATE',
      'BENEFICIAIRE_DELETE',
      'CONVENTION_ADD',
      'CONVENTION_VIEW',
      'CONVENTION_UPDATE',
      'CONVENTION_DELETE',
      'PAIEMENT_ADD',
      'PAIEMENT_VIEW',
      'PAIEMENT_UPDATE',
      'PAIEMENT_DELETE',
      
      // Avocats
      'AVOCAT_CREATE',
      'AVOCAT_VIEW',
      'AVOCAT_UPDATE',
      'AVOCAT_DELETE',
      
      // Documents
      'DOCUMENT_GENERATE_CONVENTION',
      'DOCUMENT_GENERATE_REGLEMENT',
      'DOCUMENT_GENERATE_SYNTHESE',
      
      // Exports
      'EXPORT_EXCEL_BENEFICIAIRES',
      'EXPORT_EXCEL_STATISTIQUES',
      'EXPORT_PDF_STATISTIQUES',
      
      // Templates
      'TEMPLATE_UPLOAD',
      'TEMPLATE_DOWNLOAD',
      'TEMPLATE_RESTORE',
      
      // Paramètres
      'PARAMETER_VIEW',
      'PARAMETER_ADD',
      'PARAMETER_DELETE',
      'PORTFOLIO_TRANSFER',
      
      // Statistiques
      'STATISTICS_VIEW',
      
      // Système
      'SYSTEM_ERROR',
      'SYSTEM_WARNING'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: function() {
      return !['SYSTEM_ERROR', 'SYSTEM_WARNING', 'LOGIN_FAILURE'].includes(this.action);
    }
  },
  username: {
    type: String,
    required: false
  },
  userRole: {
    type: String,
    enum: ['administrateur', 'redacteur'],
    required: function() {
      return !['SYSTEM_ERROR', 'SYSTEM_WARNING', 'LOGIN_FAILURE'].includes(this.action);
    }
  },
  resourceType: {
    type: String,
    enum: ['affaire', 'militaire', 'beneficiaire', 'avocat', 'utilisateur', 'document', 'parametre', 'template', 'system', 'convention', 'paiement'],
    required: false
  },
  resourceId: {
    type: String,
    required: false
  },
  resourceName: {
    type: String,
    required: false
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: false
  },
  url: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  error: {
    message: String,
    stack: String,
    code: String
  },
  duration: {
    type: Number, // Durée en millisecondes
    required: false
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: false, // On utilise notre propre timestamp
  collection: 'logs'
});

// Index pour optimiser les requêtes
logSchema.index({ timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ action: 1, timestamp: -1 });
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

// Méthode statique pour nettoyer les anciens logs (en plus de l'expiration automatique)
logSchema.statics.cleanOldLogs = async function() {
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  try {
    const result = await this.deleteMany({ timestamp: { $lt: threeYearsAgo } });
    console.log(`Nettoyage des logs: ${result.deletedCount} entrées supprimées`);
    return result;
  } catch (error) {
    console.error('Erreur lors du nettoyage des logs:', error);
    throw error;
  }
};

// Méthode statique pour créer un log
logSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Erreur lors de la création du log:', error);
    // Ne pas propager l'erreur pour éviter de casser le processus principal
  }
};

module.exports = mongoose.model('Log', logSchema);