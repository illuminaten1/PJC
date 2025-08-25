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
    // Nouveau mot de passe (vous pouvez le changer ici)
    const newPassword = 'admin123';
    
    // Hacher le nouveau mot de passe
    console.log('Génération du hachage pour le nouveau mot de passe...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mettre à jour le mot de passe de l'administrateur
    const result = await Utilisateur.updateOne(
      { username: 'admin' },
      { 
        password: hashedPassword,
        passwordNeedsHash: false
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Mot de passe administrateur réinitialisé avec succès');
      console.log('Username: admin');
      console.log('Nouveau password: ' + newPassword);
      console.log('⚠️  Pensez à changer ce mot de passe après connexion');
    } else {
      console.log('❌ Aucun utilisateur admin trouvé');
      console.log('Tentative de création d\'un nouvel administrateur...');
      
      // Créer un nouvel admin si il n'existe pas
      const adminData = {
        username: 'admin',
        password: hashedPassword,
        nom: 'Administrateur',
        role: 'administrateur',
        dateCreation: new Date(),
        actif: true,
        passwordNeedsHash: false
      };
      
      await mongoose.connection.db.collection('utilisateurs').insertOne(adminData);
      console.log('✅ Nouvel utilisateur administrateur créé');
      console.log('Username: admin');
      console.log('Password: ' + newPassword);
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
})
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
});