const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Utilisateur = require('../models/utilisateur');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pjc', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connecté');
  
  try {
    // Vérifier si des utilisateurs existent déjà
    const count = await Utilisateur.countDocuments();
    
    if (count > 0) {
      console.log('Des utilisateurs existent déjà dans la base de données');
    } else {
      // Hacher le mot de passe par défaut
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Créer un nouvel utilisateur administrateur
      const admin = new Utilisateur({
        username: 'admin',
        password: hashedPassword, // Mot de passe haché
        nom: 'Administrateur',
        role: 'administrateur',
        dateCreation: new Date(),
        actif: true,
        passwordNeedsHash: false // Le mot de passe est déjà haché
      });
      
      await admin.save();
      console.log('Utilisateur administrateur créé avec succès');
      console.log('Username: admin');
      console.log('Password: admin');
    }
  } catch (err) {
    console.error('Erreur:', err);
  } finally {
    mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
})
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
});