const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffaireSchema = new Schema({
  nom: { type: String, required: true, index: true },
  description: { type: String },
  lieu: { type: String },
  dateFaits: { type: Date, required: true, index: true },
  notes: { 
    type: String,
    default: '' 
  },
  dateCreation: { type: Date, default: Date.now },
  archive: { type: Boolean, default: false },
  redacteur: { type: String, required: true },
  // Référence aux militaires impliqués dans cette affaire
  militaires: [{ type: Schema.Types.ObjectId, ref: 'Militaire' }]
});

// Création d'index pour améliorer les performances des recherches
AffaireSchema.index({ nom: 'text', description: 'text' });

module.exports = mongoose.model('Affaire', AffaireSchema);