const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // ou bcryptjs
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

// Méthode pour vérifier un mot de passe avec meilleure détection d'erreurs
utilisateurSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword) {
    return false; // Retourner false si pas de mot de passe fourni
  }
  
  // Si le mot de passe est en clair (migration)
  if (this.passwordNeedsHash === true) {
    return this.password === candidatePassword;
  }
  
  // Vérifier si le mot de passe a le format d'un hachage bcrypt
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) {
    try {
      // Utiliser bcrypt pour comparer
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
      console.error('Erreur bcrypt.compare:', err);
      // En cas d'erreur, on ne fait pas de fallback et on retourne false
      return false;
    }
  } else {
    // Si le mot de passe n'a pas le format d'un hachage bcrypt, comparer en clair
    return this.password === candidatePassword;
  }
};

// Middleware pré-sauvegarde pour hacher le mot de passe
utilisateurSchema.pre('save', async function(next) {
  const user = this;
  
  // Si le mot de passe n'a pas été modifié, passer au middleware suivant
  if (!user.isModified('password')) {
    return next();
  }
  
  try {
    // Si le mot de passe est marqué explicitement pour ne pas être haché
    if (user.passwordNeedsHash === true) {
      return next();
    }
    
    // Vérifier si le mot de passe est déjà haché
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      // Le mot de passe est déjà haché, ne pas le hacher à nouveau
      return next();
    }
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    
    next();
  } catch (err) {
    next(err);
  }
});

// Création du modèle à partir du schéma
const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;