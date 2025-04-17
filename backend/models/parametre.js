const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParametreSchema = new Schema({
  type: { 
    type: String, 
    enum: ['circonstances', 'redacteurs', 'templateConvention'], 
    required: true, 
    unique: true 
  },
  valeurs: [{ type: Schema.Types.Mixed }],
  derniereMiseAJour: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Parametre', ParametreSchema);