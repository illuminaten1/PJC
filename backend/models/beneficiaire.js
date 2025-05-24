// Modèle proposé pour beneficiaire.js avec validation conditionnelle pour les paiements

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sous-schéma pour les conventions
const conventionSchema = new Schema({
  montant: { type: Number, required: true },
  pourcentageResultats: { type: Number, default: 0 },
  dateEnvoiAvocat: Date,
  dateEnvoiBeneficiaire: Date,
  dateValidationFMG: Date,
  avocat: { type: Schema.Types.ObjectId, ref: 'Avocat' }
});

// Sous-schéma pour les paiements avec validation conditionnelle
const paiementSchema = new Schema({
  type: { type: String, required: true },
  montant: { type: Number, required: true },
  date: { type: Date, required: true },
  qualiteDestinataire: { type: String, required: true },
  identiteDestinataire: { type: String, required: true },
  referencePiece: String,
  adresseDestinataire: String,
  siretRidet: String,
  titulaireCompte: String,
  // Validation conditionnelle pour les coordonnées bancaires
  codeEtablissement: {
    type: String,
    validate: {
      validator: function(v) {
        // Valide seulement si une valeur est fournie
        return v === '' || v === null || v === undefined || /^\d{5}$/.test(v);
      },
      message: props => `${props.value} n'est pas un code établissement valide (5 chiffres requis)`
    }
  },
  codeGuichet: {
    type: String,
    validate: {
      validator: function(v) {
        return v === '' || v === null || v === undefined || /^\d{5}$/.test(v);
      },
      message: props => `${props.value} n'est pas un code guichet valide (5 chiffres requis)`
    }
  },
  numeroCompte: {
    type: String,
    validate: {
      validator: function(v) {
        return v === '' || v === null || v === undefined || /^[A-Za-z0-9]{11}$/.test(v);
      },
      message: props => `${props.value} n'est pas un numéro de compte valide (11 caractères alphanumériques requis)`
    }
  },
  cleVerification: {
    type: String,
    validate: {
      validator: function(v) {
        return v === '' || v === null || v === undefined || /^\d{2}$/.test(v);
      },
      message: props => `${props.value} n'est pas une clé de vérification valide (2 chiffres requis)`
    }
  }
});

// Schéma principal du bénéficiaire
const beneficiaireSchema = new Schema({
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  qualite: { 
    type: String, 
    required: true,
    enum: ['Militaire', 'Conjoint', 'Enfant', 'Parent', 'Autre']
  },
  militaire: { 
    type: Schema.Types.ObjectId, 
    ref: 'Militaire', 
    required: true 
  },
  numeroDecision: String,
  dateDecision: Date,
  avocats: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Avocat' 
  }],
  conventions: [conventionSchema],
  paiements: [paiementSchema],
  archive: { 
    type: Boolean, 
    default: false 
  },
  dateCreation: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexation pour la recherche texte
beneficiaireSchema.index({ 
  nom: 'text', 
  prenom: 'text' 
});

module.exports = mongoose.model('Beneficiaire', beneficiaireSchema);