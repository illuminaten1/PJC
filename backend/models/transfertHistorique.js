const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransfertHistoriqueSchema = new Schema({
  sourceRedacteur: { type: String, required: true },
  targetRedacteur: { type: String, required: true },
  dateTransfert: { type: Date, default: Date.now },
  affairesModifiees: { type: Number, default: 0 },
  statut: { type: String, enum: ['succès', 'échec'], required: true },
  message: { type: String }
});

// Index pour faciliter les requêtes sur les dates
TransfertHistoriqueSchema.index({ dateTransfert: -1 });

// Index TTL qui supprimera automatiquement les documents après 30 jours
TransfertHistoriqueSchema.index({ dateTransfert: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('TransfertHistorique', TransfertHistoriqueSchema);