const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MilitaireSchema = new Schema({
  grade: { type: String, required: true },
  prenom: { type: String, required: true },
  nom: { type: String, required: true, uppercase: true, index: true },
  unite: { type: String, required: true },
  region: { type: String },
  departement: { type: String },
  // Référence à l'affaire liée
  affaire: { type: Schema.Types.ObjectId, ref: 'Affaire', required: true },
  archive: { type: Boolean, default: false },
  circonstance: { type: String, required: true },
  natureDesBlessures: { type: String },
  itt: { type: Number }, // Nombre de jours d'ITT
  decede: { type: Boolean, default: false },
  dateCreation: { type: Date, default: Date.now },
  // Référence aux bénéficiaires liés à ce militaire
  beneficiaires: [{ type: Schema.Types.ObjectId, ref: 'Beneficiaire' }]
});

// Index pour faciliter les recherches
MilitaireSchema.index({ nom: 'text', prenom: 'text' });

module.exports = mongoose.model('Militaire', MilitaireSchema);