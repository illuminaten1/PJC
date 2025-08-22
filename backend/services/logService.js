const winston = require('winston');
const MongoDB = require('winston-mongodb').MongoDB;
const Log = require('../models/log');

// Configuration de winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Transport vers la console en développement
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Transport vers MongoDB
    new MongoDB({
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/protection-juridique',
      collection: 'logs',
      options: {
        useUnifiedTopology: true
      },
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

/**
 * Service de logging pour les actions utilisateur
 */
class LogService {

  /**
   * Récupère la vraie IP de l'utilisateur derrière un proxy
   * @param {Object} req - Objet request Express
   * @returns {string} IP address
   */
  static getRealIP(req) {
    // Ordre de priorité pour récupérer la vraie IP derrière un proxy
    const headers = [
      'x-forwarded-for',      // Standard de facto pour les proxies
      'x-real-ip',            // Nginx proxy
      'x-client-ip',          // Apache mod_proxy
      'cf-connecting-ip',     // Cloudflare
      'x-cluster-client-ip',  // Cluster/load balancer
      'x-forwarded',          // Variante
      'forwarded-for',        // Variante
      'forwarded'             // RFC 7239
    ];

    // Chercher dans les headers de proxy
    for (const header of headers) {
      const value = req.headers[header];
      if (value) {
        // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
        // La première est généralement l'IP originale du client
        const ip = value.split(',')[0].trim();
        if (ip && ip !== 'unknown') {
          return ip;
        }
      }
    }

    // Fallback vers les méthodes Express classiques
    return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  }
  
  /**
   * Log une action utilisateur
   * @param {Object} params - Paramètres du log
   * @param {string} params.action - Type d'action
   * @param {Object} params.user - Utilisateur (avec id, username, role)
   * @param {Object} params.req - Objet request Express
   * @param {string} params.resourceType - Type de ressource
   * @param {string} params.resourceId - ID de la ressource
   * @param {string} params.resourceName - Nom de la ressource
   * @param {Object} params.details - Détails supplémentaires
   * @param {Error} params.error - Erreur le cas échéant
   * @param {boolean} params.success - Succès de l'opération
   * @param {number} params.duration - Durée de l'opération
   */
  static async logUserAction({
    action,
    user = null,
    req = null,
    resourceType = null,
    resourceId = null,
    resourceName = null,
    details = null,
    error = null,
    success = true,
    duration = null
  }) {
    try {
      const logData = {
        timestamp: new Date(),
        level: success ? 'info' : 'error',
        action,
        success
      };

      // Informations utilisateur
      if (user) {
        logData.userId = user.id || user._id;
        logData.username = user.username || user.nom;
        logData.userRole = user.role;
      }

      // Informations de la requête
      if (req) {
        logData.method = req.method;
        logData.url = req.originalUrl || req.url;
        logData.ipAddress = this.getRealIP(req);
        logData.userAgent = req.headers['user-agent'];
      }

      // Informations de la ressource
      if (resourceType) logData.resourceType = resourceType;
      if (resourceId) logData.resourceId = resourceId.toString();
      if (resourceName) logData.resourceName = resourceName;

      // Détails supplémentaires
      if (details) logData.details = details;
      if (duration) logData.duration = duration;

      // Informations d'erreur
      if (error) {
        logData.error = {
          message: error.message,
          stack: error.stack,
          code: error.code
        };
        logData.level = 'error';
        logData.success = false;
      }

      // Créer le log en base
      await Log.createLog(logData);

      // Log aussi dans la console en développement
      if (process.env.NODE_ENV === 'development') {
        const logMessage = `${action} - User: ${logData.username || 'Anonymous'} - Resource: ${resourceType}${resourceId ? `(${resourceId})` : ''}`;
        console.log(`[LOG] ${logMessage}`);
      }

    } catch (err) {
      // Log l'erreur sans interrompre le processus principal
      console.error('Erreur lors du logging:', err);
    }
  }

  /**
   * Log une tentative de connexion
   */
  static async logLogin(username, success, req, error = null, user = null) {
    await this.logUserAction({
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      user: success && user ? user : (success ? null : { username }), // Utiliser l'utilisateur complet si disponible
      req,
      success,
      error,
      details: { 
        username,
        loginAttempt: true
      }
    });
  }

  /**
   * Log une déconnexion
   */
  static async logLogout(user, req) {
    await this.logUserAction({
      action: 'LOGOUT',
      user,
      req,
      details: { logoutAction: true }
    });
  }

  /**
   * Log la génération d'un document
   */
  static async logDocumentGeneration(documentType, user, req, resourceId, resourceName, success = true, error = null) {
    const actionMap = {
      'convention': 'DOCUMENT_GENERATE_CONVENTION',
      'reglement': 'DOCUMENT_GENERATE_REGLEMENT',
      'synthese': 'DOCUMENT_GENERATE_SYNTHESE'
    };

    await this.logUserAction({
      action: actionMap[documentType] || 'DOCUMENT_GENERATE_CONVENTION',
      user,
      req,
      resourceType: 'document',
      resourceId,
      resourceName,
      success,
      error,
      details: { documentType }
    });
  }

  /**
   * Log un export de données
   */
  static async logExport(exportType, user, req, success = true, error = null, details = null) {
    const actionMap = {
      'excel_beneficiaires': 'EXPORT_EXCEL_BENEFICIAIRES',
      'excel_statistiques': 'EXPORT_EXCEL_STATISTIQUES',
      'pdf_statistiques': 'EXPORT_PDF_STATISTIQUES'
    };

    await this.logUserAction({
      action: actionMap[exportType] || 'EXPORT_EXCEL_BENEFICIAIRES',
      user,
      req,
      resourceType: 'system',
      success,
      error,
      details
    });
  }

  /**
   * Log une action CRUD générique
   */
  static async logCRUD(operation, resourceType, user, req, resourceId = null, resourceName = null, success = true, error = null, details = null) {
    // Mapping spécifique pour correspondre aux actions définies dans le schéma Log
    const actionMappings = {
      'utilisateur': {
        'create': 'USER_CREATE',
        'read': 'USER_VIEW',
        'update': 'USER_UPDATE',
        'delete': 'USER_DELETE'
      },
      'affaire': {
        'create': 'AFFAIRE_CREATE',
        'read': 'AFFAIRE_VIEW',
        'update': 'AFFAIRE_UPDATE',
        'delete': 'AFFAIRE_DELETE'
      },
      'militaire': {
        'create': 'MILITAIRE_CREATE',
        'read': 'MILITAIRE_VIEW',
        'update': 'MILITAIRE_UPDATE',
        'delete': 'MILITAIRE_DELETE'
      },
      'beneficiaire': {
        'create': 'BENEFICIAIRE_CREATE',
        'read': 'BENEFICIAIRE_VIEW',
        'update': 'BENEFICIAIRE_UPDATE',
        'delete': 'BENEFICIAIRE_DELETE'
      },
      'avocat': {
        'create': 'AVOCAT_CREATE',
        'read': 'AVOCAT_VIEW',
        'update': 'AVOCAT_UPDATE',
        'delete': 'AVOCAT_DELETE'
      },
      'convention': {
        'create': 'CONVENTION_ADD',
        'read': 'CONVENTION_VIEW',
        'update': 'CONVENTION_UPDATE',
        'delete': 'CONVENTION_DELETE'
      },
      'paiement': {
        'create': 'PAIEMENT_ADD',
        'read': 'PAIEMENT_VIEW',
        'update': 'PAIEMENT_UPDATE',
        'delete': 'PAIEMENT_DELETE'
      },
      'fichier': {
        'create': 'FILE_UPLOAD',
        'read': 'FILE_VIEW',
        'update': 'FILE_UPDATE',
        'delete': 'FILE_DELETE',
        'download': 'FILE_DOWNLOAD'
      }
    };

    // Utiliser le mapping spécifique ou fallback sur l'ancien système
    const action = actionMappings[resourceType]?.[operation] || `${resourceType.toUpperCase()}_${operation.toUpperCase()}`;

    await this.logUserAction({
      action,
      user,
      req,
      resourceType,
      resourceId,
      resourceName,
      success,
      error,
      details
    });
  }

  /**
   * Log une erreur système
   */
  static async logSystemError(error, req = null, details = null) {
    await this.logUserAction({
      action: 'SYSTEM_ERROR',
      req,
      resourceType: 'system',
      success: false,
      error,
      details
    });
  }

  /**
   * Middleware Express pour logger automatiquement les requêtes
   */
  static requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Intercepter la réponse pour logger à la fin
      const originalSend = res.send;
      res.send = function(...args) {
        const duration = Date.now() - startTime;
        const success = res.statusCode < 400;
        
        // Ne pas logger certaines routes (health checks, etc.)
        const skipLogging = ['/api/auth/verify', '/api/templates/status'].includes(req.originalUrl);
        
        if (!skipLogging && req.user) {
          // Déterminer le type d'action basé sur la route et la méthode
          const routeAction = LogService.getActionFromRoute(req);
          if (routeAction) {
            LogService.logUserAction({
              action: routeAction.action,
              user: req.user,
              req,
              resourceType: routeAction.resourceType,
              resourceId: routeAction.resourceId,
              success,
              duration
            }).catch(err => console.error('Request logging error:', err));
          }
        }
        
        return originalSend.apply(this, args);
      };
      
      next();
    };
  }

  /**
   * Détermine l'action à logger basée sur la route et la méthode HTTP
   */
  static getActionFromRoute(req) {
    const { method, originalUrl, params } = req;
    const url = originalUrl.split('?')[0]; // Enlever les query params
    
    // Mapping des routes vers les actions
    const routeMappings = [
      // Affaires
      { pattern: /^\/api\/affaires$/, method: 'GET', action: 'AFFAIRE_VIEW', resourceType: 'affaire' },
      { pattern: /^\/api\/affaires$/, method: 'POST', action: 'AFFAIRE_CREATE', resourceType: 'affaire' },
      { pattern: /^\/api\/affaires\/([^\/]+)$/, method: 'GET', action: 'AFFAIRE_VIEW', resourceType: 'affaire' },
      { pattern: /^\/api\/affaires\/([^\/]+)$/, method: 'PUT', action: 'AFFAIRE_UPDATE', resourceType: 'affaire' },
      { pattern: /^\/api\/affaires\/([^\/]+)$/, method: 'DELETE', action: 'AFFAIRE_DELETE', resourceType: 'affaire' },
      
      // Militaires
      { pattern: /^\/api\/militaires$/, method: 'GET', action: 'MILITAIRE_VIEW', resourceType: 'militaire' },
      { pattern: /^\/api\/militaires$/, method: 'POST', action: 'MILITAIRE_CREATE', resourceType: 'militaire' },
      { pattern: /^\/api\/militaires\/([^\/]+)$/, method: 'GET', action: 'MILITAIRE_VIEW', resourceType: 'militaire' },
      { pattern: /^\/api\/militaires\/([^\/]+)$/, method: 'PUT', action: 'MILITAIRE_UPDATE', resourceType: 'militaire' },
      { pattern: /^\/api\/militaires\/([^\/]+)$/, method: 'DELETE', action: 'MILITAIRE_DELETE', resourceType: 'militaire' },
      
      // Bénéficiaires
      { pattern: /^\/api\/beneficiaires$/, method: 'GET', action: 'BENEFICIAIRE_VIEW', resourceType: 'beneficiaire' },
      { pattern: /^\/api\/beneficiaires$/, method: 'POST', action: 'BENEFICIAIRE_CREATE', resourceType: 'beneficiaire' },
      { pattern: /^\/api\/beneficiaires\/([^\/]+)$/, method: 'GET', action: 'BENEFICIAIRE_VIEW', resourceType: 'beneficiaire' },
      { pattern: /^\/api\/beneficiaires\/([^\/]+)$/, method: 'PUT', action: 'BENEFICIAIRE_UPDATE', resourceType: 'beneficiaire' },
      { pattern: /^\/api\/beneficiaires\/([^\/]+)$/, method: 'DELETE', action: 'BENEFICIAIRE_DELETE', resourceType: 'beneficiaire' },
      
      // Avocats
      { pattern: /^\/api\/avocats$/, method: 'GET', action: 'AVOCAT_VIEW', resourceType: 'avocat' },
      { pattern: /^\/api\/avocats$/, method: 'POST', action: 'AVOCAT_CREATE', resourceType: 'avocat' },
      { pattern: /^\/api\/avocats\/([^\/]+)$/, method: 'GET', action: 'AVOCAT_VIEW', resourceType: 'avocat' },
      { pattern: /^\/api\/avocats\/([^\/]+)$/, method: 'PUT', action: 'AVOCAT_UPDATE', resourceType: 'avocat' },
      { pattern: /^\/api\/avocats\/([^\/]+)$/, method: 'DELETE', action: 'AVOCAT_DELETE', resourceType: 'avocat' },
      
      // Statistiques
      { pattern: /^\/api\/statistiques/, method: 'GET', action: 'STATISTICS_VIEW', resourceType: 'system' },
      
      // Exports
      { pattern: /^\/api\/export\/beneficiaires/, method: 'GET', action: 'EXPORT_EXCEL_BENEFICIAIRES', resourceType: 'system' },
      
      // Fichiers
      { pattern: /^\/api\/fichiers\/([^\/]+)$/, method: 'POST', action: 'FILE_UPLOAD', resourceType: 'fichier' },
      { pattern: /^\/api\/fichiers\/([^\/]+)$/, method: 'DELETE', action: 'FILE_DELETE', resourceType: 'fichier' },
      { pattern: /^\/api\/fichiers\/download\/([^\/]+)$/, method: 'GET', action: 'FILE_DOWNLOAD', resourceType: 'fichier' },
      { pattern: /^\/api\/fichiers\/preview\/([^\/]+)$/, method: 'GET', action: 'FILE_VIEW', resourceType: 'fichier' },
    ];
    
    for (const mapping of routeMappings) {
      if (mapping.method === method && mapping.pattern.test(url)) {
        const match = url.match(mapping.pattern);
        return {
          action: mapping.action,
          resourceType: mapping.resourceType,
          resourceId: match && match[1] ? match[1] : null
        };
      }
    }
    
    return null;
  }
}

module.exports = LogService;