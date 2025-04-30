const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
  // Mot de passe (haché)
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
  },
  // Flag pour indiquer si le mot de passe est encore en clair
  passwordNeedsHash: {
    type: Boolean,
    default: false
  }
});

// Méthode pour vérifier si l'utilisateur est un administrateur
utilisateurSchema.methods.isAdmin = function() {
  return this.role === 'administrateur';
};

// Méthode pour vérifier un mot de passe
utilisateurSchema.methods.comparePassword = async function(candidatePassword) {
  // Si le mot de passe a besoin d'être haché (mot de passe en clair)
  if (this.passwordNeedsHash) {
    return this.password === candidatePassword;
  }
  
  // Sinon, comparer avec bcrypt
  return await bcrypt.compare(candidatePassword, this.password);
};

// Middleware pré-sauvegarde pour hacher le mot de passe
utilisateurSchema.pre('save', async function(next) {
  const user = this;
  
  // Si le mot de passe n'a pas été modifié, passer au middleware suivant
  if (!user.isModified('password')) {
    return next();
  }
  
  try {
    // Si le mot de passe doit être haché
    if (!user.passwordNeedsHash) {
      // Générer un sel
      const salt = await bcrypt.genSalt(10);
      // Hacher le mot de passe avec le sel
      const hashedPassword = await bcrypt.hash(user.password, salt);
      // Remplacer le mot de passe en clair par le mot de passe haché
      user.password = hashedPassword;
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Création du modèle à partir du schéma
const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;