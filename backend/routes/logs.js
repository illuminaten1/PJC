const express = require('express');
const router = express.Router();
const Log = require('../models/log');
const authMiddleware = require('../middleware/auth');

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
 * @route   GET /api/logs
 * @desc    Récupérer les logs avec filtres et pagination
 * @access  Admin
 */
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      level,
      action,
      userId,
      username,
      resourceType,
      dateStart,
      dateEnd,
      success,
      search
    } = req.query;

    // Construction de la requête de filtrage
    let query = {};

    // Filtres de base
    if (level) query.level = level;
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (resourceType) query.resourceType = resourceType;
    if (success !== undefined) query.success = success === 'true';

    // Filtre par nom d'utilisateur (recherche partielle)
    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }

    // Filtre par plage de dates
    if (dateStart || dateEnd) {
      query.timestamp = {};
      if (dateStart) {
        query.timestamp.$gte = new Date(dateStart);
      }
      if (dateEnd) {
        query.timestamp.$lte = new Date(dateEnd);
      }
    }

    // Recherche textuelle dans les détails ou les erreurs
    if (search) {
      query.$or = [
        { 'details': { $regex: search, $options: 'i' } },
        { 'error.message': { $regex: search, $options: 'i' } },
        { 'resourceName': { $regex: search, $options: 'i' } },
        { 'url': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Requête avec pagination et tri
    const logs = await Log.find(query)
      .populate('userId', 'username nom role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Compter le total pour la pagination
    const total = await Log.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des logs'
    });
  }
});

/**
 * @route   GET /api/logs/stats
 * @desc    Récupérer les statistiques des logs
 * @access  Admin
 */
router.get('/stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { dateStart, dateEnd } = req.query;

    // Construire le filtre de date
    let dateFilter = {};
    if (dateStart || dateEnd) {
      dateFilter.timestamp = {};
      if (dateStart) dateFilter.timestamp.$gte = new Date(dateStart);
      if (dateEnd) dateFilter.timestamp.$lte = new Date(dateEnd);
    }

    // Agrégations pour les statistiques
    const [
      totalLogs,
      logsByLevel,
      logsByAction,
      logsByUser,
      logsByResourceType,
      recentErrors
    ] = await Promise.all([
      // Total des logs
      Log.countDocuments(dateFilter),

      // Répartition par niveau
      Log.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Top 10 des actions
      Log.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Top 10 des utilisateurs les plus actifs
      Log.aggregate([
        { $match: { ...dateFilter, userId: { $exists: true } } },
        { $group: { _id: '$userId', username: { $first: '$username' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Répartition par type de ressource
      Log.aggregate([
        { $match: { ...dateFilter, resourceType: { $exists: true } } },
        { $group: { _id: '$resourceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Dernières erreurs (24h)
      Log.find({
        level: 'error',
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean()
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalLogs,
          period: {
            start: dateStart || 'Début',
            end: dateEnd || 'Maintenant'
          }
        },
        charts: {
          byLevel: logsByLevel,
          byAction: logsByAction,
          byUser: logsByUser,
          byResourceType: logsByResourceType
        },
        recentErrors
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

/**
 * @route   GET /api/logs/actions
 * @desc    Récupérer la liste des actions disponibles
 * @access  Admin
 */
router.get('/actions', authMiddleware, isAdmin, async (req, res) => {
  try {
    const actions = await Log.distinct('action');
    res.json({
      success: true,
      data: actions.sort()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des actions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * @route   GET /api/logs/users
 * @desc    Récupérer la liste des utilisateurs qui ont des logs
 * @access  Admin
 */
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await Log.aggregate([
      { $match: { userId: { $exists: true } } },
      { $group: { 
        _id: '$userId', 
        username: { $first: '$username' },
        userRole: { $first: '$userRole' },
        lastActivity: { $max: '$timestamp' },
        logCount: { $sum: 1 }
      }},
      { $sort: { lastActivity: -1 } }
    ]);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * @route   DELETE /api/logs/cleanup
 * @desc    Nettoyer les anciens logs (plus de 3 ans)
 * @access  Admin
 */
router.delete('/cleanup', authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await Log.cleanOldLogs();
    
    res.json({
      success: true,
      message: `Nettoyage terminé: ${result.deletedCount} logs supprimés`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Erreur lors du nettoyage des logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du nettoyage'
    });
  }
});

/**
 * @route   GET /api/logs/:id
 * @desc    Récupérer un log spécifique
 * @access  Admin
 */
router.get('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id)
      .populate('userId', 'username nom role')
      .lean();

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log non trouvé'
      });
    }

    res.json({
      success: true,
      data: log
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du log:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;