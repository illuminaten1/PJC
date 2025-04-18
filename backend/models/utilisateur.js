const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma pour les utilisateurs
const utilisateurSchema = new Schema({
  // Nom d'utilisateur (unique)
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Mot de passe (stocké en clair pour la simplicité comme demandé)
  password: {
    type: String,
    required: true
  },
  // Rôle: administrateur ou rédacteur
  role: {
    type: String,
    enum: ['administrateur', 'redacteur'],
    default: 'redacteur'
  },
  // Nom complet de l'utilisateur
  nom: {
    type: String,
    required: true
  },
  // Date de création du compte
  dateCreation: {
    type: Date,
    default: Date.now
  },
  // Date de dernière connexion
  dernierLogin: {
    type: Date
  },
  // Si le compte est actif ou non
  actif: {
    type: Boolean,
    default: true
  }
});

// Méthode pour vérifier si l'utilisateur est un administrateur
utilisateurSchema.methods.isAdmin = function() {
  return this.role === 'administrateur';
};

// Création du modèle à partir du schéma
const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;