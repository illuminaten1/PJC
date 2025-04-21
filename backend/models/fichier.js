const mongoose = require('mongoose');

const fichierSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true // 'application/pdf', 'application/vnd.oasis.opendocument.text', 'message/rfc822'
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  beneficiaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beneficiaire',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  // Référence à l'ID du fichier stocké dans GridFS
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = mongoose.model('Fichier', fichierSchema);