const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware pour gérer les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validations pour l'authentification
 */
const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Le nom d\'utilisateur est requis')
    .isLength({ min: 3, max: 50 })
    .withMessage('Le nom d\'utilisateur doit faire entre 3 et 50 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 4, max: 100 })
    .withMessage('Le mot de passe doit faire entre 4 et 100 caractères'),
  
  handleValidationErrors
];

/**
 * Validations pour les utilisateurs
 */
const userValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Le nom d\'utilisateur est requis')
    .isLength({ min: 3, max: 50 })
    .withMessage('Le nom d\'utilisateur doit faire entre 3 et 50 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
  
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom complet est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom complet doit faire entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('role')
    .optional()
    .isIn(['administrateur', 'redacteur'])
    .withMessage('Le rôle doit être "administrateur" ou "redacteur"'),
  
  body('password')
    .optional()
    .isLength({ min: 4, max: 100 })
    .withMessage('Le mot de passe doit faire entre 4 et 100 caractères'),
  
  handleValidationErrors
];

/**
 * Validations pour les affaires
 */
const affaireValidation = [
  body('numeroAffaire')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Le numéro d\'affaire ne peut pas dépasser 50 caractères'),
  
  body('circonstances')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Les circonstances ne peuvent pas dépasser 200 caractères'),
  
  body('dateFaits')
    .optional()
    .isISO8601()
    .withMessage('La date des faits doit être au format valide'),
  
  body('redacteur')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le rédacteur ne peut pas dépasser 100 caractères'),
  
  body('observations')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Les observations ne peuvent pas dépasser 2000 caractères'),
  
  handleValidationErrors
];

/**
 * Validations pour les militaires
 */
const militaireValidation = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit faire entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('prenom')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le prénom doit faire entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('grade')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Le grade ne peut pas dépasser 50 caractères'),
  
  body('unite')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('L\'unité ne peut pas dépasser 200 caractères'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('L\'email doit être valide')
    .isLength({ max: 100 })
    .withMessage('L\'email ne peut pas dépasser 100 caractères'),
  
  body('telephone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s\.()]{0,20}$/)
    .withMessage('Le téléphone doit contenir uniquement des chiffres et caractères de formatage'),
  
  handleValidationErrors
];

/**
 * Validations pour les bénéficiaires
 */
const beneficiaireValidation = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit faire entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('prenom')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le prénom doit faire entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  body('dateNaissance')
    .optional()
    .isISO8601()
    .withMessage('La date de naissance doit être au format valide'),
  
  body('adresse')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('L\'adresse ne peut pas dépasser 500 caractères'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('L\'email doit être valide')
    .isLength({ max: 100 })
    .withMessage('L\'email ne peut pas dépasser 100 caractères'),
  
  body('telephone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s\.()]{0,20}$/)
    .withMessage('Le téléphone doit contenir uniquement des chiffres et caractères de formatage'),
  
  handleValidationErrors
];

/**
 * Validation des paramètres d'ID MongoDB
 */
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID invalide'),
  
  handleValidationErrors
];

/**
 * Validation des query parameters de recherche
 */
const searchValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La recherche ne peut pas dépasser 200 caractères')
    .matches(/^[a-zA-Z0-9À-ÿ\s\-'\.]+$/)
    .withMessage('La recherche contient des caractères non autorisés'),
  
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2050 })
    .withMessage('L\'année doit être entre 2000 et 2050'),
  
  query('archived')
    .optional()
    .isBoolean()
    .withMessage('Le paramètre archived doit être true ou false'),
  
  handleValidationErrors
];

module.exports = {
  loginValidation,
  userValidation,
  affaireValidation,
  militaireValidation,
  beneficiaireValidation,
  mongoIdValidation,
  searchValidation,
  handleValidationErrors
};