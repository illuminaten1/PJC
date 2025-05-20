// scripts/initRegionsDepartements.js
const mongoose = require('mongoose');
const Parametre = require('../models/parametre');
require('dotenv').config();

// Récupérer les listes hardcodées
const regions = ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val-de-Loire', 'Corse', 'Grand Est', 'Hauts-de-France', 'Ile-de-France', 'Nouvelle-Aquitaine', 'Normandie', 'Occitanie', 'Pays-de-la-Loire', 'Provence-Alpes-Côte-d\'Azur', 'Guadeloupe', 'Guyane', 'Martinique', 'Mayotte', 'Nouvelle-Calédonie', 'Wallis-et-Futuna', 'Polynésie française', 'La Réunion', 'Saint-Pierre-et-Miquelon', 'IGAG', 'IGGN', 'DGGN', 'GR', 'GIGN', 'COMSOPGN', 'PJGN', 'CEGN', 'CGOM', 'CRJ', 'ANFSI', 'COSSEN', 'COMCYBER-MI', 'CESAN', 'SAILMI', 'GSAN', 'GTA', 'GARM', 'CFAGN', 'GMAR', 'GAIR'];
const departements = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '971', '972', '973', '974', '976', '986', '987', '988', '975', '978', 'GGM I/3', 'GGM I/5', 'GGM I/6', 'GGM I/7', 'GGM I/9', 'GGM II/1', 'GGM II/2', 'GGM II/3', 'GGM II/5', 'GGM II/6', 'GGM II/7', 'GGM III/3', 'GGM III/6', 'GGM III/7', 'GGM IV/2', 'GGM IV/3', 'GGM IV/7', 'GBGM'];

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à la base de données MongoDB');

    // Initialiser les régions
    let paramRegions = await Parametre.findOne({ type: 'regions' });
    if (!paramRegions) {
      paramRegions = new Parametre({
        type: 'regions',
        valeurs: regions,
        derniereMiseAJour: new Date()
      });
      await paramRegions.save();
      console.log('Régions initialisées avec succès');
    } else {
      console.log('Les régions existent déjà dans les paramètres');
    }

    // Initialiser les départements
    let paramDepts = await Parametre.findOne({ type: 'departements' });
    if (!paramDepts) {
      paramDepts = new Parametre({
        type: 'departements',
        valeurs: departements,
        derniereMiseAJour: new Date()
      });
      await paramDepts.save();
      console.log('Départements initialisés avec succès');
    } else {
      console.log('Les départements existent déjà dans les paramètres');
    }

    console.log('Initialisation terminée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des paramètres:', error);
    process.exit(1);
  }
}

main();