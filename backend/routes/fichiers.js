const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const authMiddleware = require('../middleware/auth');
const Fichier = require('../models/fichier');
const LogService = require('../services/logService');
const { sendErrorResponse } = require('../utils/errorHandler');

// Création du storage engine pour multer avec GridFS
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/protection-juridique',
  options: { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  },
  file: (req, file) => {
    const acceptedMimeTypes = [
      'application/pdf', 
      'application/vnd.oasis.opendocument.text', 
      'message/rfc822',
      'application/odt',
      'message/eml'
    ];
    
    if (!acceptedMimeTypes.includes(file.mimetype)) {
      return Promise.reject(
        new Error('Type de fichier non accepté. Seuls les fichiers PDF, ODT et EML sont autorisés.')
      );
    }
    
    const filename = `${Date.now()}-${file.originalname}`;
    
    return {
      bucketName: 'uploads',
      filename: filename,
      metadata: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }
    };
  }
});

// Middleware multer configuré avec GridFS storage
const upload = multer({ storage });

// Route de test simple sans authentification
router.get('/test', (req, res) => {
  res.json({ message: 'La route de test fonctionne!' });
});

// Route de débogage sans authentification
router.get('/debug-public', async (req, res) => {
  try {
    // Compter les fichiers et les chunks dans chaque collection
    const filesCount = await mongoose.connection.db.collection('uploads.files').countDocuments();
    const chunksCount = await mongoose.connection.db.collection('uploads.chunks').countDocuments();
    const fichierCount = await Fichier.countDocuments();
    
    // Liste simplifiée des 5 derniers fichiers
    const recentFiles = await mongoose.connection.db.collection('uploads.files')
      .find({})
      .sort({ uploadDate: -1 })
      .limit(5)
      .toArray();

    // Liste simplifiée des métadonnées
    const fichiers = await Fichier.find({})
      .sort({ uploadDate: -1 })
      .limit(5);
    
    res.json({
      counters: {
        'uploads.files': filesCount,
        'uploads.chunks': chunksCount,
        'fichiers': fichierCount
      },
      recentFiles: recentFiles.map(f => ({ 
        _id: f._id, 
        filename: f.filename, 
        contentType: f.contentType,
        uploadDate: f.uploadDate 
      })),
      fichiers: fichiers.map(f => ({ 
        _id: f._id, 
        fileId: f.fileId, 
        originalname: f.originalname
      })),
      message: 'Si ces nombres ne correspondent pas, il y a peut-être des fichiers orphelins'
    });
  } catch (error) {
    console.error('Erreur lors du débogage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour télécharger un fichier
router.post('/:beneficiaireId', [authMiddleware, upload.single('file')], async (req, res) => {
  const startTime = Date.now();
  let fichier = null;
  
  try {
    if (!req.file) {
      await LogService.logCRUD('create', 'fichier', req.user, req, null, null, false, 
        new Error('Aucun fichier téléchargé'), { beneficiaireId: req.params.beneficiaireId });
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }
    
    console.log('File info:', req.file);
    
    // S'assurer que l'ID est bien un ObjectId valide
    let fileId;
    try {
      fileId = new mongoose.Types.ObjectId(req.file.id);
    } catch (err) {
      console.error('Erreur de conversion d\'ObjectId:', err);
      await LogService.logCRUD('create', 'fichier', req.user, req, null, req.file.originalname, false, err, 
        { beneficiaireId: req.params.beneficiaireId, error: 'ObjectId conversion error' });
      return res.status(500).json({ message: 'Erreur de format d\'ID', error: err.message });
    }
    
    // Vérifier que le fichier existe dans la collection uploads.files
    const fileExists = await mongoose.connection.db.collection('uploads.files').findOne({
      _id: fileId
    });
    
    if (!fileExists) {
      const error = new Error('Le fichier n\'a pas été correctement enregistré dans GridFS');
      await LogService.logCRUD('create', 'fichier', req.user, req, null, req.file.originalname, false, error, 
        { beneficiaireId: req.params.beneficiaireId, fileId: fileId.toString() });
      return res.status(500).json({ message: 'Erreur: Le fichier n\'a pas été correctement enregistré dans GridFS' });
    }
    
    // Créer une entrée de métadonnées
    fichier = new Fichier({
      filename: req.file.filename,
      originalname: req.file.originalname,
      contentType: req.file.contentType || req.file.mimetype,
      size: req.file.size,
      beneficiaire: req.params.beneficiaireId,
      description: req.body.description || '',
      fileId: fileId
    });
    
    await fichier.save();
    
    // Logger le succès
    await LogService.logCRUD('create', 'fichier', req.user, req, fichier._id.toString(), req.file.originalname, true, null, {
      beneficiaireId: req.params.beneficiaireId,
      filename: req.file.filename,
      originalname: req.file.originalname,
      contentType: req.file.contentType || req.file.mimetype,
      size: req.file.size,
      duration: Date.now() - startTime
    });
    
    res.json(fichier);
  } catch (error) {
    console.error('Erreur détaillée lors du téléchargement du fichier:', error);
    
    // Logger l'erreur
    await LogService.logCRUD('create', 'fichier', req.user, req, 
      fichier ? fichier._id.toString() : null, 
      req.file ? req.file.originalname : 'unknown', 
      false, error, {
        beneficiaireId: req.params.beneficiaireId,
        duration: Date.now() - startTime
      });
    
    sendErrorResponse(res, error, 'Erreur lors du téléchargement du fichier');
  }
});

// Route pour récupérer tous les fichiers d'un bénéficiaire
router.get('/beneficiaire/:beneficiaireId', authMiddleware, async (req, res) => {
  try {
    console.log('Récupération des fichiers pour le bénéficiaire:', req.params.beneficiaireId);
    const fichiers = await Fichier.find({ beneficiaire: req.params.beneficiaireId })
                                  .sort({ uploadDate: -1 });
    console.log(`Nombre de fichiers trouvés: ${fichiers.length}`);
    res.json(fichiers);
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des fichiers', error: error.message });
  }
});

// Route pour prévisualiser un fichier - sans authentification
router.get('/preview/:id', async (req, res) => {
  try {
    const fichier = await Fichier.findById(req.params.id);
    if (!fichier) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    // Utiliser GridFSBucket directement pour le streaming
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    
    // Configurer les en-têtes
    res.set('Content-Type', fichier.contentType);
    
    // Vérifier que le fichier existe dans GridFS
    const file = await mongoose.connection.db.collection('uploads.files').findOne({
      _id: new mongoose.Types.ObjectId(fichier.fileId)
    });
    
    if (!file) {
      return res.status(404).json({ message: 'Contenu du fichier non trouvé' });
    }
    
    // Stream le fichier directement
    bucket.openDownloadStream(new mongoose.Types.ObjectId(fichier.fileId)).pipe(res);
    
  } catch (error) {
    console.error('Erreur lors de la prévisualisation:', error);
    res.status(500).json({ message: 'Erreur de prévisualisation', error: error.message });
  }
});

// Route pour télécharger un fichier - sans authentification
router.get('/download/:id', async (req, res) => {
  try {
    const fichier = await Fichier.findById(req.params.id);
    if (!fichier) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    // Utiliser GridFSBucket directement pour le streaming
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    
    // Configurer les en-têtes
    res.set({
      'Content-Type': fichier.contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fichier.originalname)}"`,
    });
    
    // Vérifier que le fichier existe dans GridFS
    const file = await mongoose.connection.db.collection('uploads.files').findOne({
      _id: new mongoose.Types.ObjectId(fichier.fileId)
    });
    
    if (!file) {
      return res.status(404).json({ message: 'Contenu du fichier non trouvé' });
    }
    
    // Stream le fichier directement
    bucket.openDownloadStream(new mongoose.Types.ObjectId(fichier.fileId)).pipe(res);
    
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({ message: 'Erreur de téléchargement', error: error.message });
  }
});

// Route pour mettre à jour la description d'un fichier
router.patch('/:id/description', authMiddleware, async (req, res) => {
  try {
    const { description } = req.body;
    
    if (description === undefined) {
      return res.status(400).json({ message: 'La description est requise' });
    }
    
    const fichier = await Fichier.findById(req.params.id);
    if (!fichier) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    fichier.description = description;
    await fichier.save();
    
    res.json({ message: 'Description mise à jour avec succès', fichier });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la description:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la description', error: error.message });
  }
});

// Route pour supprimer un fichier
router.delete('/:id', authMiddleware, async (req, res) => {
  const startTime = Date.now();
  let fichier = null;
  
  try {
    console.log('Suppression demandée pour ID:', req.params.id);
    
    fichier = await Fichier.findById(req.params.id);
    if (!fichier) {
      await LogService.logCRUD('delete', 'fichier', req.user, req, req.params.id, null, false, 
        new Error('Fichier non trouvé'), { fileId: req.params.id });
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    console.log('Fichier trouvé, fileId:', fichier.fileId);
    
    let gridfsError = null;
    try {
      // Supprimer les chunks
      const chunksDeleted = await mongoose.connection.db.collection('uploads.chunks').deleteMany({
        files_id: new mongoose.Types.ObjectId(fichier.fileId)
      });
      
      console.log(`Chunks supprimés: ${chunksDeleted.deletedCount}`);
      
      // Supprimer le fichier
      const fileDeleted = await mongoose.connection.db.collection('uploads.files').deleteOne({
        _id: new mongoose.Types.ObjectId(fichier.fileId)
      });
      
      console.log(`Fichier supprimé: ${fileDeleted.deletedCount}`);
      
      if (fileDeleted.deletedCount === 0) {
        console.log('Aucun fichier GridFS trouvé, possible que le fichier ait déjà été supprimé');
      }
    } catch (err) {
      gridfsError = err;
      console.error('Erreur lors de la suppression des données GridFS:', err);
      // Continuer quand même pour supprimer les métadonnées
    }
    
    // Supprimer les métadonnées
    await Fichier.deleteOne({ _id: req.params.id });
    console.log('Métadonnées du fichier supprimées avec succès');
    
    // Logger le succès (même si il y a eu des erreurs GridFS mineures)
    await LogService.logCRUD('delete', 'fichier', req.user, req, req.params.id, fichier.originalname, true, gridfsError, {
      filename: fichier.filename,
      originalname: fichier.originalname,
      beneficiaire: fichier.beneficiaire,
      contentType: fichier.contentType,
      size: fichier.size,
      duration: Date.now() - startTime,
      gridfsWarning: gridfsError ? 'Erreur lors de la suppression GridFS mais métadonnées supprimées' : null
    });
    
    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    
    // Logger l'erreur
    await LogService.logCRUD('delete', 'fichier', req.user, req, req.params.id, 
      fichier ? fichier.originalname : 'unknown', false, error, {
        filename: fichier ? fichier.filename : 'unknown',
        beneficiaire: fichier ? fichier.beneficiaire : 'unknown',
        duration: Date.now() - startTime
      });
    
    res.status(500).json({ message: 'Erreur lors de la suppression du fichier', error: error.message });
  }
});

// Route de nettoyage - supprime les fichiers orphelins
router.get('/clean-orphans', async (req, res) => {
  try {
    console.log('Nettoyage des fichiers orphelins...');
    const fichiers = await Fichier.find({});
    let orphansCount = 0;
    
    for (const fichier of fichiers) {
      const fileExists = await mongoose.connection.db.collection('uploads.files').findOne({
        _id: new mongoose.Types.ObjectId(fichier.fileId)
      });
      
      if (!fileExists) {
        console.log(`Fichier orphelin trouvé: ${fichier._id} (fileId: ${fichier.fileId})`);
        await Fichier.deleteOne({ _id: fichier._id });
        orphansCount++;
      }
    }
    
    res.json({
      message: `Nettoyage terminé. ${orphansCount} références orphelines supprimées.`
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour prévisualiser un email - sans authentification
router.get('/preview-email/:id', async (req, res) => {
  try {
    const fichier = await Fichier.findById(req.params.id);
    if (!fichier) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    // Vérifier que c'est bien un email
    if (fichier.contentType !== 'message/rfc822' && fichier.contentType !== 'message/eml') {
      return res.status(400).json({ message: 'Ce fichier n\'est pas un email' });
    }
    
    // Utiliser GridFSBucket pour obtenir le contenu du fichier
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    
    // Vérifier que le fichier existe dans GridFS
    const file = await mongoose.connection.db.collection('uploads.files').findOne({
      _id: new mongoose.Types.ObjectId(fichier.fileId)
    });
    
    if (!file) {
      return res.status(404).json({ message: 'Contenu du fichier non trouvé' });
    }
    
    // Récupérer le contenu complet du fichier
    const chunks = [];
    return new Promise((resolve, reject) => {
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fichier.fileId));
      
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      downloadStream.on('error', (error) => {
        console.error('Erreur lors de la lecture du fichier:', error);
        reject(error);
      });
      
      downloadStream.on('end', async () => {
        try {
          // Concaténer tous les chunks en un seul buffer
          const emailBuffer = Buffer.concat(chunks);
          
          // Importer mailparser
          const { simpleParser } = require('mailparser');
          
          // Parser l'email
          const parsedEmail = await simpleParser(emailBuffer);
          
          // Préparer la réponse
          const emailData = {
            subject: parsedEmail.subject || 'Sans objet',
            from: parsedEmail.from ? parsedEmail.from.text : 'Expéditeur inconnu',
            to: parsedEmail.to ? parsedEmail.to.text : 'Destinataire inconnu',
            cc: parsedEmail.cc ? parsedEmail.cc.text : '',
            date: parsedEmail.date ? parsedEmail.date.toISOString() : new Date().toISOString(),
            html: parsedEmail.html || '',
            text: parsedEmail.text || '',
            hasHtml: !!parsedEmail.html,
            attachments: []
          };
          
          // Traiter les pièces jointes
          if (parsedEmail.attachments && parsedEmail.attachments.length > 0) {
            // Stocker les métadonnées des pièces jointes
            emailData.attachments = parsedEmail.attachments.map(attachment => ({
              filename: attachment.filename,
              contentType: attachment.contentType,
              contentDisposition: attachment.contentDisposition,
              size: attachment.size,
              // Générer un ID unique pour cette pièce jointe
              id: `${req.params.id}_${Buffer.from(attachment.filename).toString('base64')}`
            }));
            
            // Stocker temporairement les pièces jointes en mémoire pour récupération ultérieure
            // Attention: dans une application de production, vous voudriez plutôt les stocker dans GridFS
            if (!global.emailAttachments) {
              global.emailAttachments = new Map();
            }
            
            // Stocker les pièces jointes avec une clé unique basée sur l'ID du fichier
            // Avec un TTL (Time To Live) de 30 minutes
            const attachmentMap = new Map();
            parsedEmail.attachments.forEach(attachment => {
              const attachmentId = `${req.params.id}_${Buffer.from(attachment.filename).toString('base64')}`;
              attachmentMap.set(attachmentId, {
                data: attachment.content,
                contentType: attachment.contentType,
                filename: attachment.filename,
                expires: Date.now() + 30 * 60 * 1000 // 30 minutes
              });
            });
            
            global.emailAttachments.set(req.params.id, {
              attachments: attachmentMap,
              expires: Date.now() + 30 * 60 * 1000 // 30 minutes
            });
          }
          
          // Si l'email n'a pas de HTML, convertir le texte en HTML
          if (!emailData.html && emailData.text) {
            emailData.html = emailData.text
              .replace(/\n/g, '<br>')
              .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
            emailData.hasHtml = true;
          }
          
          // Répondre avec les données de l'email
          res.json(emailData);
        } catch (parseError) {
          console.error('Erreur lors du parsing de l\'email:', parseError);
          res.status(500).json({ 
            message: 'Erreur lors du parsing de l\'email', 
            error: parseError.message
          });
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de la prévisualisation de l\'email:', error);
    res.status(500).json({ message: 'Erreur de prévisualisation', error: error.message });
  }
});

// Route pour récupérer une pièce jointe d'un email - sans authentification
router.get('/email-attachment/:fileId/:attachmentId', async (req, res) => {
  try {
    const { fileId, attachmentId } = req.params;
    
    // Vérifier si les pièces jointes sont en mémoire
    if (!global.emailAttachments || !global.emailAttachments.has(fileId)) {
      return res.status(404).json({ message: 'Pièce jointe non trouvée ou expirée' });
    }
    
    const emailAttachmentsData = global.emailAttachments.get(fileId);
    
    // Vérifier si l'entrée a expiré
    if (emailAttachmentsData.expires < Date.now()) {
      global.emailAttachments.delete(fileId);
      return res.status(404).json({ message: 'Les pièces jointes ont expiré, veuillez rafraîchir l\'email' });
    }
    
    // Récupérer la pièce jointe spécifique
    if (!emailAttachmentsData.attachments.has(attachmentId)) {
      return res.status(404).json({ message: 'Pièce jointe spécifique non trouvée' });
    }
    
    const attachment = emailAttachmentsData.attachments.get(attachmentId);
    
    // Vérifier si la pièce jointe a expiré
    if (attachment.expires < Date.now()) {
      emailAttachmentsData.attachments.delete(attachmentId);
      return res.status(404).json({ message: 'Cette pièce jointe a expiré' });
    }
    
    // Configurer les en-têtes
    res.set({
      'Content-Type': attachment.contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.filename)}"`,
    });
    
    // Envoyer les données de la pièce jointe
    res.send(attachment.data);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la pièce jointe:', error);
    res.status(500).json({ message: 'Erreur de récupération', error: error.message });
  }
});

// Nettoyage périodique des pièces jointes en mémoire (toutes les 10 minutes)
setInterval(() => {
  if (global.emailAttachments) {
    const now = Date.now();
    for (const [fileId, emailAttachmentsData] of global.emailAttachments.entries()) {
      if (emailAttachmentsData.expires < now) {
        global.emailAttachments.delete(fileId);
      } else {
        // Vérifier chaque pièce jointe individuellement
        for (const [attachmentId, attachment] of emailAttachmentsData.attachments.entries()) {
          if (attachment.expires < now) {
            emailAttachmentsData.attachments.delete(attachmentId);
          }
        }
        
        // Si toutes les pièces jointes ont été supprimées, supprimer l'entrée entière
        if (emailAttachmentsData.attachments.size === 0) {
          global.emailAttachments.delete(fileId);
        }
      }
    }
  }
}, 10 * 60 * 1000); // 10 minutes

module.exports = router;