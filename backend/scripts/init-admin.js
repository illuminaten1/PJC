const mongoose = require('mongoose');
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
      // Créer un nouvel utilisateur administrateur
      const admin = new Utilisateur({
        username: 'admin',
        password: 'admin',
        nom: 'Administrateur',
        role: 'administrateur',
        dateCreation: new Date(),
        actif: true
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