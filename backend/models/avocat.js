const mongoose = require('mongoose');

const AvocatSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  specialisationRPC: {
    type: Boolean,
    default: false
  },
  // Nouvelles propriétés
  cabinet: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  villesIntervention: [{
    type: String,
    trim: true
  }],
  adresse: {
    numero: {
      type: String,
      trim: true
    },
    rue: {
      type: String,
      trim: true
    },
    codePostal: {
      type: String,
      trim: true
    },
    ville: {
      type: String,
      trim: true
    }
  },
  telephonePublic1: {
    type: String,
    trim: true
  },
  telephonePublic2: {
    type: String,
    trim: true
  },
  telephonePrive: {
    type: String,
    trim: true
  },
  siretRidet: {
    type: String,
    trim: true
  },
  commentaires: {
    type: String,
    trim: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Avocat', AvocatSchema);