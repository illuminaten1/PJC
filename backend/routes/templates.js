const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
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

// Configuration pour multer (gestion des uploads de fichiers)
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../templates'));
  },
  filename: function(req, file, cb) {
    // Convention de nommage pour les templates personnalisés
    const templateType = req.params.templateType;
    cb(null, `${templateType}_template.docx`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // N'accepter que les fichiers .docx
    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return cb(new Error('Seuls les fichiers DOCX sont acceptés'));
    }
    cb(null, true);
  }
});

// Vérifier le statut des templates (personnalisé ou par défaut)
router.get('/status', authMiddleware, isAdmin, (req, res) => {
  try {
    const templatesPath = path.join(__dirname, '../templates');
    const templateStatus = {
      convention: fs.existsSync(path.join(templatesPath, 'convention_template.docx')) ? 'custom' : 'default',
      reglement: fs.existsSync(path.join(templatesPath, 'reglement_template.docx')) ? 'custom' : 'default'
    };
    
    res.json(templateStatus);
  } catch (error) {
    console.error('Erreur lors de la vérification du statut des templates:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du statut des templates' });
  }
});

// Télécharger un template
router.get('/download/:templateType', authMiddleware, isAdmin, (req, res) => {
  try {
    const { templateType } = req.params;
    
    // Vérifier que le type est valide
    if (templateType !== 'convention' && templateType !== 'reglement') {
      return res.status(400).json({ message: 'Type de template non valide' });
    }
    
    // Chemins des fichiers
    const customTemplatePath = path.join(__dirname, '../templates', `${templateType}_template.docx`);
    const defaultTemplatePath = path.join(__dirname, '../templates', `default_${templateType}_template.docx`);
    
    // Déterminer quel fichier envoyer
    const filePath = fs.existsSync(customTemplatePath) ? customTemplatePath : defaultTemplatePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Template non trouvé' });
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${templateType}_template.docx`);
    
    // Envoyer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(`Erreur lors du téléchargement du template:`, error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du template' });
  }
});

// Uploader un template personnalisé
router.post('/upload/:templateType', authMiddleware, isAdmin, upload.single('template'), (req, res) => {
  try {
    const { templateType } = req.params;
    
    // Vérifier que le type est valide
    if (templateType !== 'convention' && templateType !== 'reglement') {
      return res.status(400).json({ message: 'Type de template non valide' });
    }
    
    // Si aucun fichier n'a été reçu
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé' });
    }
    
    res.json({ 
      message: `Template ${templateType} mis à jour avec succès`,
      filename: req.file.filename
    });
  } catch (error) {
    console.error(`Erreur lors de l'upload du template:`, error);
    res.status(500).json({ message: 'Erreur lors de l\'upload du template' });
  }
});

// Restaurer un template par défaut
router.post('/restore/:templateType', authMiddleware, isAdmin, (req, res) => {
  try {
    const { templateType } = req.params;
    
    // Vérifier que le type est valide
    if (templateType !== 'convention' && templateType !== 'reglement') {
      return res.status(400).json({ message: 'Type de template non valide' });
    }
    
    const customTemplatePath = path.join(__dirname, '../templates', `${templateType}_template.docx`);
    
    // Supprimer le template personnalisé s'il existe
    if (fs.existsSync(customTemplatePath)) {
      fs.unlinkSync(customTemplatePath);
    }
    
    res.json({ message: `Template ${templateType} restauré avec succès` });
  } catch (error) {
    console.error(`Erreur lors de la restauration du template:`, error);
    res.status(500).json({ message: 'Erreur lors de la restauration du template' });
  }
});

module.exports = router;