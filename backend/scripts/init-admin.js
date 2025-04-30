const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // ou bcryptjs selon votre configuration
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
      // Hacher directement le mot de passe (sans utiliser le middleware pre-save)
      console.log('Génération du hachage pour le mot de passe admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Vérifier que le hachage fonctionne
      const verificationTest = await bcrypt.compare('admin', hashedPassword);
      if (!verificationTest) {
        console.error('ERREUR: Le hachage généré ne peut pas être vérifié!');
        throw new Error('Échec de vérification du hachage bcrypt');
      }
      
      // Créer un nouvel utilisateur administrateur en contournant les middlewares
      console.log('Création du compte administrateur...');
      const adminData = {
        username: 'admin',
        password: hashedPassword, // Mot de passe déjà haché
        nom: 'Administrateur',
        role: 'administrateur',
        dateCreation: new Date(),
        actif: true,
        passwordNeedsHash: false // Le mot de passe est déjà haché
      };
      
      // Utiliser directement la collection pour éviter le middleware
      await mongoose.connection.db.collection('utilisateurs').insertOne(adminData);
      
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