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
  }
});

// Méthode pour vérifier si l'utilisateur est un administrateur
utilisateurSchema.methods.isAdmin = function() {
  return this.role === 'administrateur';
};

// Méthode pour vérifier un mot de passe - SÉCURISÉ (seulement bcrypt)
utilisateurSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword) {
    return false; // Retourner false si pas de mot de passe fourni
  }
  
  // Vérifier que le mot de passe stocké est bien haché avec bcrypt
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$') && !this.password.startsWith('$2y$')) {
    console.error('SÉCURITÉ: Mot de passe non haché détecté pour l\'utilisateur:', this.username);
    return false; // Refuser la connexion si le mot de passe n'est pas haché
  }
  
  try {
    // Utiliser bcrypt pour comparer
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error('Erreur bcrypt.compare pour l\'utilisateur:', this.username, '- Erreur:', err.message);
    return false;
  }
};

// Middleware pré-sauvegarde pour hacher le mot de passe - SÉCURISÉ
utilisateurSchema.pre('save', async function(next) {
  const user = this;
  
  // Si le mot de passe n'a pas été modifié, passer au middleware suivant
  if (!user.isModified('password')) {
    return next();
  }
  
  try {
    // Vérifier si le mot de passe est déjà haché
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      // Le mot de passe est déjà haché, ne pas le hacher à nouveau
      return next();
    }
    
    // Hacher le mot de passe avec un salt sécurisé
    const salt = await bcrypt.genSalt(12); // Augmentation du coût pour plus de sécurité
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    
    console.log('Mot de passe haché avec succès pour l\'utilisateur:', user.username);
    next();
  } catch (err) {
    console.error('Erreur lors du hachage du mot de passe pour:', user.username, '- Erreur:', err.message);
    next(err);
  }
});

// Création du modèle à partir du schéma
const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;