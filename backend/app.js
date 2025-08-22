// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const affairesRoutes = require('./routes/affaires');
const avocatsRoutes = require('./routes/avocats');
const militairesRoutes = require('./routes/militaires');
const beneficiairesRoutes = require('./routes/beneficiaires');
const parametresRoutes = require('./routes/parametres');
const documentsRoutes = require('./routes/documents');
const statistiquesRoutes = require('./routes/statistiques');
const templatesRoutes = require('./routes/templates');
const fichiersRoutes = require('./routes/fichiers');
const exportRoutes = require('./routes/export'); // Nouvelle route d'export Excel

const app = express();

// Configuration pour faire confiance au proxy (pour récupérer la vraie IP)
// Ceci permettra à Express de correctement interpréter les headers X-Forwarded-For
app.set('trust proxy', true);

// Rate limiting pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 tentatives max par utilisateur
  message: { 
    success: false, 
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' 
  },
  standardHeaders: true, // Retourne les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*` legacy
  // Limitation par username au lieu de l'IP (proxy partagé)
  keyGenerator: (req) => {
    // Utiliser le username si fourni, sinon fallback sur IP
    const username = req.body?.username;
    if (username && username.trim()) {
      return `user:${username.trim()}`;
    }
    // Fallback sur IP si pas de username (pour autres endpoints)
    return `ip:${req.ip}`;
  },
  // Personnalisation pour le réseau local
  skipSuccessfulRequests: false, // Compter même les connexions réussies
  skipFailedRequests: false, // Compter aussi les connexions échouées
});

// Configuration des headers de sécurité avec Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Nécessaire pour les styles inline de React
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Désactivé pour éviter les conflits avec CORS
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

app.use(cors({
  origin: true, // Autorise toutes les origines
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));

// Servir les fichiers statiques du frontend en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Routes API
app.use('/api/affaires', affairesRoutes);
app.use('/api/avocats', avocatsRoutes);
app.use('/api/militaires', militairesRoutes);
app.use('/api/beneficiaires', beneficiairesRoutes);
app.use('/api/parametres', parametresRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/utilisateurs', require('./routes/utilisateurs'));
app.use('/api/fichiers', require('./routes/fichiers'));
app.use('/api/export', exportRoutes); // Ajout de la route d'export Excel
app.use('/api/logs', require('./routes/logs'));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/protection-juridique', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB établie'))
.catch(err => console.error('Erreur de connexion à MongoDB', err));

// Route "catchall" pour SPA React en production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Vérifier les permissions des dossiers au démarrage
const checkDirectoryPermissions = () => {
  const dirs = ['templates', 'temp'];
  
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Dossier ${dir} créé avec succès`);
      } catch (err) {
        console.error(`❌ Erreur lors de la création du dossier ${dir}:`, err);
      }
    }
    
    // Vérifier les permissions d'écriture
    try {
      const testFile = path.join(dirPath, '.permissions-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`✅ Permissions d'écriture valides pour le dossier ${dir}`);
    } catch (err) {
      console.error(`❌ ERREUR: Pas de permissions d'écriture pour le dossier ${dir}. Carbone ne fonctionnera pas correctement.`, err);
    }
  });
};

// Exécuter la vérification au démarrage
checkDirectoryPermissions();

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

module.exports = app;