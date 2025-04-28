// init-data.js
// Script pour initialiser les données du système avec vérification préalable
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/fr');
require('dotenv').config();

// Importer les modèles
const Avocat = require('../models/avocat');
const Affaire = require('../models/affaire');
const Militaire = require('../models/militaire');
const Beneficiaire = require('../models/beneficiaire');
const Parametre = require('../models/parametre');

// Configuration de la connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/protection-juridique', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB établie pour l\'initialisation des données'))
.catch(err => {
  console.error('Erreur de connexion à MongoDB', err);
  process.exit(1);
});

// API URL
const API_URL = process.env.API_URL || 'http://localhost:5002/api';

// Constantes et données de référence
const regions = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur',
  'Guadeloupe',
  'Guyane',
  'Martinique',
  'Mayotte',
  'La Réunion',
  'Nouvelle-Calédonie',
  'Polynésie française',
  'Saint-Barthélemy',
  'Saint-Martin',
  'Saint-Pierre-et-Miquelon',
  'Wallis-et-Futuna'
];

const departements = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', 
  '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', 
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', 
  '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', 
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', 
  '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', 
  '90', '91', '92', '93', '94', '95', '971', '972', '973', '974', '976', '986', '987', '988', 
  'GGM I/3', 'GGM I/5', 'GGM I/6', 'GGM I/7', 'GGM I/9', 'GGM II/1'
];

const grades = [
  'Général',
  'Colonel',
  'Lieutenant-colonel',
  'Chef d\'escadron',
  'Commandant',
  'Capitaine',
  'Lieutenant',
  'Sous-lieutenant',
  'Aspirant',
  'Major',
  'Adjudant-chef',
  'Adjudant',
  'Maréchal des logis-chef',
  'Gendarme',
  'Elève-Gendarme',
  'Maréchal des logis',
  'Brigadier-chef',
  'Brigadier',
  'Gendarme adjoint volontaire'
];

const circonstances = [
  'Accident de service',
  'Accident de trajet',
  'Accident de sport',
  'Accident de voie publique',
  'Agression en service',
  'Blessure en opération',
  'Accident de parachutage',
  'Incident lors d\'un entrainement',
  'Blessure lors d\'une intervention',
  'Attentat',
  'Blessure en OPEX',
  'Maladie professionnelle'
];

const redacteurs = [
  'Commandant MARTIN',
  'Capitaine DUBOIS',
  'Lieutenant PETIT',
  'Major DURAND',
  'Capitaine ROUSSEAU',
  'Lieutenant-colonel BERNARD',
  'Chef d\'escadron THOMAS',
  'Adjudant-chef MOREAU'
];

const typesAffaires = [
  'Accident routier',
  'Accident sur voie publique',
  'Agression',
  'Opération extérieure',
  'Entrainement',
  'Parachutage',
  'Service courant',
  'Intervention',
  'Maintien de l\'ordre',
  'Opération spéciale',
  'Exercice militaire',
  'Navire en mer',
  'Escorte de convoi'
];

const qualitesBeneficiaire = ['Militaire', 'Conjoint', 'Enfant', 'Parent'];

const typesPaiements = ['Facture', 'Remboursement', 'Consignation', 'Autre'];

const qualitesDestinataire = [
  'Avocat',
  'Commissaire de justice',
  'Militaire de la gendarmerie nationale',
  'Régisseur du TJ',
  'Médecin',
  'Autre'
];

// Liste des noms de cabinets d'avocats (fictifs)
const cabinets = [
  'Cabinet Dupont & Associés',
  'SCP Martin, Durand et Petit',
  'SELARL Légal Défense',
  'Cabinet Droit & Justice',
  'Avocats Conseils',
  'AARPI Juristes Associés',
  'Cabinet Juridique International',
  'Expertise Légale',
  'Maîtres du Droit',
  'Justice & Équité',
  'Cabinet Défense Militaire',
  'Avocats Spécialistes',
  'Cabinet Protection Juridique',
  'Conseil & Défense',
  'Avocats du Préjudice Corporel',
  'Cabinet RPC France',
  'Selarl Maillet & Associés',
  'Cabinet Droit des Armées',
  'Juristes de la Défense',
  'SCP Droit & Réparation'
];

// Variables globales pour stocker les IDs générés
let avocatIds = [];
let affaireIds = [];
let militaireIds = [];
let beneficiaireIds = [];

// Fonction pour vérifier si la base de données est déjà peuplée
const checkDatabasePopulated = async () => {
  console.log('Vérification de l\'état de la base de données...');
  
  try {
    const affairesCount = await Affaire.countDocuments();
    const militairesCount = await Militaire.countDocuments();
    const beneficiairesCount = await Beneficiaire.countDocuments();
    const avocatsCount = await Avocat.countDocuments();
    
    console.log(`Statistiques actuelles:
- Affaires: ${affairesCount}
- Militaires: ${militairesCount}
- Bénéficiaires: ${beneficiairesCount}
- Avocats: ${avocatsCount}`);
    
    // Considérer que la base est peuplée si on a au moins quelques éléments
    return (affairesCount > 5 && militairesCount > 5 && beneficiairesCount > 5 && avocatsCount > 5);
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
    return false;
  }
};

// Fonction principale pour la génération des données
const initializeData = async () => {
  try {
    console.log('Début de l\'initialisation des données...');
    
    // 1. Vérifier si la base de données est déjà peuplée
    const isDatabasePopulated = await checkDatabasePopulated();
    
    if (isDatabasePopulated) {
      console.log('La base de données contient déjà des données. Initialisation ignorée.');
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée.');
      return false;
    }
    
    // 2. Initialiser les paramètres (redacteurs et circonstances)
    await initializeParameters();
    
    // 3. Récupérer les nombres spécifiés en arguments ou utiliser des valeurs par défaut
    const nbAvocats = parseInt(process.argv[2]) || 200;
    const nbAffaires = parseInt(process.argv[3]) || 50;
    const nbMilitaires = parseInt(process.argv[4]) || 100;
    const nbBeneficiaires = parseInt(process.argv[5]) || 150;
    
    // 4. Générer les avocats
    await genererAvocats(nbAvocats);
    
    // 5. Générer les affaires
    await genererAffaires(nbAffaires);
    
    // 6. Générer les militaires
    await genererMilitaires(nbMilitaires);
    
    // 7. Générer les bénéficiaires (avec conventions et paiements)
    await genererBeneficiaires(nbBeneficiaires);
    
    console.log('\nInitialisation des données terminée avec succès:');
    console.log(`- ${nbAvocats} avocats`);
    console.log(`- ${nbAffaires} affaires`);
    console.log(`- ${nbMilitaires} militaires`);
    console.log(`- ${nbBeneficiaires} bénéficiaires`);
    console.log('- Paramètres (redacteurs et circonstances)');
    console.log('- Conventions et paiements associés');
    
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée.');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données:', error);
    
    // Fermer la connexion à la base de données en cas d'erreur
    try {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée après erreur.');
    } catch (closeError) {
      console.error('Erreur lors de la fermeture de la connexion MongoDB:', closeError);
    }
    
    return false;
  }
};

// Lancer l'initialisation des données
initializeData()
  .then(success => {
    if (success) {
      console.log('Script d\'initialisation terminé avec succès.');
      process.exit(0);
    } else {
      console.log('Script d\'initialisation terminé sans modification.');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('Erreur générale lors de l\'exécution du script:', error);
    process.exit(1);
  });

// Fonction pour initialiser les paramètres via l'API
const initializeParameters = async () => {
  console.log('Initialisation des paramètres (redacteurs et circonstances)...');
  
  try {
    // Vérifier si les paramètres existent déjà
    const existingParams = await Parametre.find({});
    const hasRedacteurs = existingParams.some(p => p.type === 'redacteurs');
    const hasCirconstances = existingParams.some(p => p.type === 'circonstances');
    
    // Créer les redacteurs via l'API si nécessaire
    if (!hasRedacteurs) {
      console.log('Création des paramètres redacteurs...');
      await Parametre.create({
        type: 'redacteurs',
        valeurs: redacteurs
      });
      console.log('Paramètres redacteurs créés avec succès.');
    } else {
      console.log('Les paramètres redacteurs existent déjà.');
    }
    
    // Créer les circonstances via l'API si nécessaire
    if (!hasCirconstances) {
      console.log('Création des paramètres circonstances...');
      await Parametre.create({
        type: 'circonstances',
        valeurs: circonstances
      });
      console.log('Paramètres circonstances créés avec succès.');
    } else {
      console.log('Les paramètres circonstances existent déjà.');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des paramètres:', error);
    return false;
  }
};

// Fonctions utilitaires 

// Fonction pour générer des villes d'intervention
const genererVillesIntervention = (region) => {
  // Mapping des régions à quelques villes principales
  const villesParRegion = {
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Clermont-Ferrand', 'Annecy', 'Chambéry'],
    'Bourgogne-Franche-Comté': ['Dijon', 'Besançon', 'Belfort', 'Nevers', 'Mâcon', 'Auxerre'],
    'Bretagne': ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Saint-Malo', 'Vannes'],
    'Centre-Val de Loire': ['Orléans', 'Tours', 'Bourges', 'Blois', 'Chartres', 'Châteauroux'],
    'Corse': ['Ajaccio', 'Bastia', 'Porto-Vecchio', 'Calvi', 'Corte'],
    'Grand Est': ['Strasbourg', 'Reims', 'Metz', 'Nancy', 'Mulhouse', 'Troyes'],
    'Hauts-de-France': ['Lille', 'Amiens', 'Calais', 'Dunkerque', 'Valenciennes', 'Beauvais'],
    'Île-de-France': ['Paris', 'Boulogne-Billancourt', 'Versailles', 'Nanterre', 'Évry', 'Créteil', 'Cergy'],
    'Normandie': ['Rouen', 'Caen', 'Le Havre', 'Cherbourg', 'Évreux', 'Dieppe'],
    'Nouvelle-Aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'La Rochelle', 'Pau', 'Bayonne'],
    'Occitanie': ['Toulouse', 'Montpellier', 'Perpignan', 'Nîmes', 'Albi', 'Tarbes'],
    'Pays de la Loire': ['Nantes', 'Angers', 'Le Mans', 'Saint-Nazaire', 'Laval', 'La Roche-sur-Yon'],
    'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon', 'Cannes'],
    'Guadeloupe': ['Pointe-à-Pitre', 'Basse-Terre', 'Le Gosier', 'Sainte-Anne'],
    'Guyane': ['Cayenne', 'Kourou', 'Saint-Laurent-du-Maroni', 'Matoury'],
    'Martinique': ['Fort-de-France', 'Le Lamentin', 'Sainte-Marie', 'Saint-Joseph'],
    'Mayotte': ['Mamoudzou', 'Koungou', 'Dzaoudzi', 'Dembeni'],
    'La Réunion': ['Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon'],
    'Nouvelle-Calédonie': ['Nouméa', 'Mont-Dore', 'Dumbéa', 'Koné'],
    'Polynésie française': ['Papeete', 'Faaa', 'Punaauia', 'Pirae'],
    'Saint-Barthélemy': ['Gustavia'],
    'Saint-Martin': ['Marigot', 'Grand-Case', 'Quartier d\'Orléans'],
    'Saint-Pierre-et-Miquelon': ['Saint-Pierre', 'Miquelon'],
    'Wallis-et-Futuna': ['Mata-Utu', 'Sigave', 'Alo']
  };

  // Si la région existe dans notre mapping, on prend ses villes
  const villes = villesParRegion[region] || [];
  
  // Nombre aléatoire de villes entre 1 et le nombre max de villes disponibles pour cette région
  const nbVilles = Math.max(1, Math.floor(Math.random() * villes.length));
  
  // Sélectionner des villes aléatoirement
  const villesSelectionnees = [];
  for (let i = 0; i < nbVilles; i++) {
    const ville = villes[Math.floor(Math.random() * villes.length)];
    if (!villesSelectionnees.includes(ville)) {
      villesSelectionnees.push(ville);
    }
  }
  
  // Si aucune ville n'a été sélectionnée, on ajoute au moins la première ville de la liste
  if (villesSelectionnees.length === 0 && villes.length > 0) {
    villesSelectionnees.push(villes[0]);
  }
  
  return villesSelectionnees;
};

// Fonction pour générer une adresse
const genererAdresse = (region) => {
  const villesParRegion = {
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Clermont-Ferrand', 'Annecy', 'Chambéry'],
    'Bourgogne-Franche-Comté': ['Dijon', 'Besançon', 'Belfort', 'Nevers', 'Mâcon', 'Auxerre'],
    'Bretagne': ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Saint-Malo', 'Vannes'],
    // ... (autres régions identiques à la fonction genererVillesIntervention)
  };

  // Obtenir une ville aléatoire dans la région
  const villes = villesParRegion[region] || ['Paris'];
  const ville = villes[Math.floor(Math.random() * villes.length)];
  
  // Codes postaux simplifiés par région (premier chiffre du code postal)
  const codePostauxPrefixes = {
    'Auvergne-Rhône-Alpes': '69',
    'Bourgogne-Franche-Comté': '21',
    'Bretagne': '35',
    'Centre-Val de Loire': '45',
    'Corse': '20',
    'Grand Est': '67',
    'Hauts-de-France': '59',
    'Île-de-France': '75',
    'Normandie': '76',
    'Nouvelle-Aquitaine': '33',
    'Occitanie': '31',
    'Pays de la Loire': '44',
    'Provence-Alpes-Côte d\'Azur': '13',
    'Guadeloupe': '971',
    'Guyane': '973',
    'Martinique': '972',
    'Mayotte': '976',
    'La Réunion': '974',
    'Nouvelle-Calédonie': '988',
    'Polynésie française': '987',
    'Saint-Barthélemy': '977',
    'Saint-Martin': '978',
    'Saint-Pierre-et-Miquelon': '975',
    'Wallis-et-Futuna': '986'
  };
  
  // Générer un code postal basé sur la région
  let codePostal = codePostauxPrefixes[region] || '75';
  // Ajouter les 3 derniers chiffres aléatoires pour compléter le code postal
  for (let i = 0; i < 3; i++) {
    codePostal += Math.floor(Math.random() * 10);
  }
  
  return {
    numero: Math.floor(Math.random() * 200) + 1,
    rue: faker.location.street(),
    codePostal: codePostal,
    ville: ville
  };
};

// Fonction pour générer des commentaires
const genererCommentaires = (specialisationRPC) => {
  const commentairesGeneriques = [
    "Avocat expérimenté dans son domaine.",
    "Excellente réputation dans la région.",
    "Intervient régulièrement pour nos bénéficiaires.",
    "Bon retour d'expérience des bénéficiaires précédents.",
    "Communicatif et réactif.",
    "Connu pour sa rigueur et son sérieux.",
    "Avocat de confiance pour les dossiers complexes.",
    "Contact privilégié pour cette région.",
    "Tarifs raisonnables et bonne qualité de service.",
    "Facile à joindre et disponible.",
    "Bonne expertise juridique.",
    "",
    "",
    ""
  ];

  const commentairesRPC = [
    "Spécialiste reconnu en réparation du préjudice corporel.",
    "Formation approfondie en RPC.",
    "A suivi plusieurs formations spécifiques au préjudice corporel militaire.",
    "Expert dans les dossiers d'accidents de service.",
    "Ancien médecin légiste reconverti en avocat, expertise pertinente en RPC.",
    "Auteur d'articles juridiques sur la réparation du préjudice corporel.",
    "Nombreuses victoires dans des dossiers complexes de RPC.",
    "Bonne connaissance du contexte militaire.",
    "Intervient régulièrement auprès des juridictions spécialisées.",
    "Expérience significative en négociation avec les assurances."
  ];

  // Si spécialisé RPC, on combine des commentaires génériques et spécifiques
  if (specialisationRPC && Math.random() < 0.7) {
    const commentaireRPC = commentairesRPC[Math.floor(Math.random() * commentairesRPC.length)];
    const commentaireGenerique = commentairesGeneriques[Math.floor(Math.random() * commentairesGeneriques.length)];
    
    // 50% de chance d'avoir un commentaire combiné, sinon juste le commentaire RPC
    if (commentaireGenerique && Math.random() < 0.5) {
      return `${commentaireRPC} ${commentaireGenerique}`;
    }
    return commentaireRPC;
  }
  
  // Sinon juste un commentaire générique
  return commentairesGeneriques[Math.floor(Math.random() * commentairesGeneriques.length)];
};

// Fonction pour obtenir des dates aléatoires (modifiée pour après octobre 2023)
const getRandomDate = (startYear = 2023, endYear = 2025) => {
  const start = new Date(2023, 9, 1); // 1er octobre 2023
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Fonction pour obtenir une date future aléatoire (modifiée pour après octobre 2023)
const getRandomFutureDate = (startDate, maxDays = 90) => {
  // S'assurer que la date de départ est après octobre 2023
  const minDate = new Date(2023, 9, 1); // 1er octobre 2023
  const actualStartDate = startDate < minDate ? minDate : startDate;
  
  const futureDate = new Date(actualStartDate);
  futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * maxDays));
  return futureDate;
};

// Fonction pour générer un SIRET/RIDET valide
const genererSIRET = () => {
  let siret = '';
  for (let i = 0; i < 14; i++) {
    siret += Math.floor(Math.random() * 10);
  }
  return siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
};

// Fonction pour générer un numéro de téléphone français valide
const genererTelephone = () => {
  let telephone = '0';
  const indicatif = Math.random() < 0.5 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 2) + 6;
  telephone += indicatif;
  for (let i = 0; i < 8; i++) {
    telephone += Math.floor(Math.random() * 10);
  }
  return telephone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
};

// Fonction pour générer aléatoirement un élément d'un tableau
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Fonction pour obtenir une liste aléatoire d'éléments d'un tableau
const getRandomItems = (array, min = 1, max = 3) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const items = [];
  for (let i = 0; i < count; i++) {
    const item = getRandomItem(array);
    if (!items.includes(item)) {
      items.push(item);
    }
  }
  return items;
};

// Fonction pour obtenir un montant aléatoire
const getRandomAmount = (min = 500, max = 5000, step = 100) => {
  return Math.floor(Math.random() * ((max - min) / step + 1)) * step + min;
};

// Fonction pour générer les coordonnées bancaires
const genererCoordonneesBancaires = () => {
  return {
    titulaireCompte: faker.company.name(),
    codeEtablissement: Math.floor(10000 + Math.random() * 90000).toString(),
    codeGuichet: Math.floor(10000 + Math.random() * 90000).toString(),
    numeroCompte: faker.helpers.replaceSymbols('???????????', { '?': () => faker.helpers.arrayElement([...Array(10).keys(), 'A', 'B', 'C', 'D', 'E', 'F']) }),
    cleVerification: Math.floor(10 + Math.random() * 90).toString()
  };
};

// Fonction pour générer des notes aléatoires
const genererNotes = () => {
  const hasNotes = Math.random() < 0.7;
  if (!hasNotes) return '';
  
  const nbParagraphs = Math.floor(Math.random() * 3) + 1;
  let notes = '';
  for (let i = 0; i < nbParagraphs; i++) {
    notes += faker.lorem.paragraph() + '\n\n';
  }
  return notes.trim();
};

// Étape 1: Générer des avocats avec la logique améliorée
const genererAvocats = async (nombreAvocats) => {
  console.log(`Génération de ${nombreAvocats} avocats...`);
  
  // Si RESET_DATA est true, supprimer tous les avocats existants
  if (process.env.RESET_DATA === 'true') {
    try {
      await Avocat.deleteMany({});
      console.log('Tous les avocats existants ont été supprimés.');
    } catch (err) {
      console.error('Erreur lors de la suppression des avocats existants:', err);
      process.exit(1);
    }
  }
  
  // Générer les avocats avec la logique améliorée
  const avocatsPromises = [];
  for (let i = 0; i < nombreAvocats; i++) {
    // 70% de chance d'avoir un cabinet
    const aCabinet = Math.random() < 0.7;
    const cabinet = aCabinet ? getRandomItem(cabinets) : '';
    
    // 30% de chance d'être spécialisé RPC
    const specialisationRPC = Math.random() < 0.3;
    
    // Choisir une région
    const region = getRandomItem(regions);
    
    // Générer les villes d'intervention avec la fonction améliorée
    const villesIntervention = genererVillesIntervention(region);
    
    // Générer adresse avec la fonction améliorée
    const adresse = genererAdresse(region);
    
    // Nom en majuscules
    const nom = faker.person.lastName().toUpperCase();
    
    // Générer des commentaires avec la fonction améliorée
    const commentaires = genererCommentaires(specialisationRPC);
    
    const nouvelAvocat = new Avocat({
      nom: nom,
      prenom: faker.person.firstName(),
      email: faker.internet.email({ firstName: faker.person.firstName(), lastName: nom }).toLowerCase(),
      specialisationRPC: specialisationRPC,
      cabinet: cabinet,
      region: region,
      villesIntervention: villesIntervention,
      adresse: adresse,
      telephonePublic1: genererTelephone(),
      telephonePublic2: Math.random() < 0.4 ? genererTelephone() : '',
      telephonePrive: Math.random() < 0.6 ? genererTelephone() : '',
      siretRidet: Math.random() < 0.7 ? genererSIRET() : '',
      commentaires: commentaires,
      // Date de création toujours après octobre 2023
      dateCreation: faker.date.between({ 
        from: '2023-10-01T00:00:00.000Z', 
        to: new Date() 
      })
    });
    
    avocatsPromises.push(nouvelAvocat.save());
  }
  
  const avocats = await Promise.all(avocatsPromises);
  avocatIds = avocats.map(a => a._id);
  console.log(`${nombreAvocats} avocats générés avec succès.`);
  return avocats;
};

// Étape 2: Générer des affaires
const genererAffaires = async (nombreAffaires) => {
  console.log(`Génération de ${nombreAffaires} affaires...`);
  
  // Si RESET_DATA est true, supprimer toutes les affaires existantes
  if (process.env.RESET_DATA === 'true') {
    try {
      await Affaire.deleteMany({});
      console.log('Toutes les affaires existantes ont été supprimées.');
    } catch (err) {
      console.error('Erreur lors de la suppression des affaires existantes:', err);
      process.exit(1);
    }
  }
  
  // Générer les affaires
  const affairesPromises = [];
  for (let i = 0; i < nombreAffaires; i++) {
    const typeAffaire = getRandomItem(typesAffaires);
    const lieu = faker.location.city();
    // Date des faits après octobre 2023
    const dateFaits = getRandomDate(2023, 2025);
    const archive = Math.random() < 0.2; // 20% des affaires sont archivées
    
    const nouvelleAffaire = new Affaire({
      nom: `${typeAffaire} à ${lieu} (${faker.date.month()})`,
      description: faker.lorem.paragraph(),
      lieu: lieu,
      dateFaits: dateFaits,
      notes: genererNotes(),
      archive: archive,
      redacteur: getRandomItem(redacteurs),
      militaires: []
    });
    
    affairesPromises.push(nouvelleAffaire.save());
  }
  
  const affaires = await Promise.all(affairesPromises);
  affaireIds = affaires.map(a => a._id);
  console.log(`${nombreAffaires} affaires générées avec succès.`);
  return affaires;
};

// Étape 3: Générer des militaires
const genererMilitaires = async (nombreMilitaires) => {
  console.log(`Génération de ${nombreMilitaires} militaires...`);
  
  // Si RESET_DATA est true, supprimer tous les militaires existants
  if (process.env.RESET_DATA === 'true') {
    try {
      await Militaire.deleteMany({});
      console.log('Tous les militaires existants ont été supprimés.');
    } catch (err) {
      console.error('Erreur lors de la suppression des militaires existants:', err);
      process.exit(1);
    }
  }
  
  // Assurer qu'il y a au moins une affaire disponible
  if (affaireIds.length === 0) {
    throw new Error('Aucune affaire disponible pour associer les militaires.');
  }
  
  // Générer les militaires et les associer aux affaires
  const militairesPromises = [];
  for (let i = 0; i < nombreMilitaires; i++) {
    const affaireId = getRandomItem(affaireIds);
    const affaire = await Affaire.findById(affaireId);
    const archive = affaire.archive; // Reprendre le statut d'archivage de l'affaire
    
    // 20% de chance d'être décédé
    const decede = Math.random() < 0.2;
    
    const nouveauMilitaire = new Militaire({
      grade: getRandomItem(grades),
      prenom: faker.person.firstName(),
      nom: faker.person.lastName().toUpperCase(),
      unite: `${getRandomItem(['COB', 'BTA', 'PSIG', 'PGM', 'GAV'])} ${faker.location.city().toUpperCase()}`,
      region: getRandomItem(regions),
      departement: getRandomItem(departements),
      affaire: affaireId,
      archive: archive,
      circonstance: getRandomItem(circonstances),
      natureDesBlessures: faker.lorem.sentences(2),
      itt: Math.floor(Math.random() * 90),
      decede: decede,
      beneficiaires: []
    });
    
    const militaireSauve = await nouveauMilitaire.save();
    
    // Mettre à jour l'affaire correspondante pour ajouter ce militaire
    await Affaire.findByIdAndUpdate(
      affaireId,
      { $push: { militaires: militaireSauve._id } }
    );
    
    militairesPromises.push(militaireSauve);
  }
  
  const militaires = await Promise.all(militairesPromises);
  militaireIds = militaires.map(m => m._id);
  console.log(`${nombreMilitaires} militaires générés avec succès.`);
  return militaires;
};

// Étape 4: Générer des bénéficiaires, conventions et paiements
const genererBeneficiaires = async (nombreBeneficiaires) => {
  console.log(`Génération de ${nombreBeneficiaires} bénéficiaires...`);
  
  // Si RESET_DATA est true, supprimer tous les bénéficiaires existants
  if (process.env.RESET_DATA === 'true') {
    try {
      await Beneficiaire.deleteMany({});
      console.log('Tous les bénéficiaires existants ont été supprimés.');
    } catch (err) {
      console.error('Erreur lors de la suppression des bénéficiaires existants:', err);
      process.exit(1);
    }
  }
  
  // Assurer qu'il y a au moins un militaire disponible
  if (militaireIds.length === 0) {
    throw new Error('Aucun militaire disponible pour associer les bénéficiaires.');
  }
  
  // Assurer qu'il y a au moins un avocat disponible
  if (avocatIds.length === 0) {
    throw new Error('Aucun avocat disponible pour associer aux bénéficiaires.');
  }
  
  // Répartir les militaires selon leur statut (décédé/blessé)
  const militairesDecedes = [];
  const militairesBleases = [];
  
  for (const militaireId of militaireIds) {
    const militaire = await Militaire.findById(militaireId);
    if (militaire.decede) {
      militairesDecedes.push(militaireId);
    } else {
      militairesBleases.push(militaireId);
    }
  }
  
  console.log(`Militaires décédés: ${militairesDecedes.length}`);
  console.log(`Militaires blessés: ${militairesBleases.length}`);
  
  // Générer les bénéficiaires
  const beneficiairesPromises = [];
  let beneficiairesGeneres = 0;
  
  // 1. D'abord, créer un bénéficiaire pour chaque militaire blessé (lui-même)
  for (const militaireId of militairesBleases) {
    if (beneficiairesGeneres >= nombreBeneficiaires) break;
    
    const militaire = await Militaire.findById(militaireId);
    
    // Pour les militaires blessés, le bénéficiaire est le militaire lui-même
    const qualite = 'Militaire';
    const prenom = militaire.prenom;
    const nom = militaire.nom;
    
    // Générer des avocats pour ce bénéficiaire (1 à 3)
    const nbAvocats = Math.floor(Math.random() * 2) + 1;
    const selectedAvocatIds = [];
    for (let j = 0; j < nbAvocats; j++) {
      let randomIndex = Math.floor(Math.random() * avocatIds.length);
      if (!selectedAvocatIds.includes(avocatIds[randomIndex])) {
        selectedAvocatIds.push(avocatIds[randomIndex]);
      }
    }
    
    // Générer les données du bénéficiaire
    const archive = militaire.archive;
    const dateDecision = getRandomDate(2023, 2025); // Date après octobre 2023
    
    const nouveauBeneficiaire = new Beneficiaire({
      prenom: prenom,
      nom: nom,
      qualite: qualite,
      militaire: militaireId,
      numeroDecision: faker.helpers.replaceSymbols('######'),
      dateDecision: dateDecision,
      avocats: selectedAvocatIds,
      conventions: [],
      paiements: [],
      archive: archive,
      dateCreation: faker.date.between({ 
        from: '2023-10-01T00:00:00.000Z', 
        to: new Date() 
      })
    });
    
    // Générer 0 à 3 conventions pour ce bénéficiaire
    const nbConventions = Math.floor(Math.random() * 3);
    for (let j = 0; j < nbConventions; j++) {
      const montant = getRandomAmount(1000, 10000);
      const dateEnvoiAvocat = getRandomFutureDate(dateDecision, 30);
      const dateEnvoiBeneficiaire = getRandomFutureDate(dateEnvoiAvocat, 20);
      const dateValidationFMG = getRandomFutureDate(dateEnvoiBeneficiaire, 45);
      
      nouveauBeneficiaire.conventions.push({
        montant: montant,
        pourcentageResultats: Math.floor(Math.random() * 10) + 1,
        dateEnvoiAvocat: dateEnvoiAvocat,
        dateEnvoiBeneficiaire: dateEnvoiBeneficiaire,
        dateValidationFMG: Math.random() < 0.7 ? dateValidationFMG : null,
        avocat: getRandomItem(selectedAvocatIds)
      });
    }
    
    // Générer 0 à 5 paiements pour ce bénéficiaire
    const nbPaiements = Math.floor(Math.random() * 5);
    for (let j = 0; j < nbPaiements; j++) {
      const coordonneesBancaires = genererCoordonneesBancaires();
      const montant = getRandomAmount(500, 8000);
      
      nouveauBeneficiaire.paiements.push({
        type: getRandomItem(typesPaiements),
        montant: montant,
        date: getRandomDate(2023, 2025), // Date après octobre 2023
        qualiteDestinataire: getRandomItem(qualitesDestinataire),
        identiteDestinataire: Math.random() < 0.7 ? 
          `Me ${faker.person.firstName()} ${faker.person.lastName().toUpperCase()}` : 
          `${faker.person.firstName()} ${faker.person.lastName().toUpperCase()}`,
        referencePiece: `Facture n°${faker.helpers.replaceSymbols('####-##')}`,
        adresseDestinataire: `${Math.floor(Math.random() * 100) + 1} ${faker.location.street()}, ${faker.location.zipCode()} ${faker.location.city()}`,
        siretRidet: Math.random() < 0.6 ? genererSIRET() : '',
        titulaireCompte: coordonneesBancaires.titulaireCompte,
        codeEtablissement: coordonneesBancaires.codeEtablissement,
        codeGuichet: coordonneesBancaires.codeGuichet,
        numeroCompte: coordonneesBancaires.numeroCompte,
        cleVerification: coordonneesBancaires.cleVerification
      });
    }
    
    const beneficiaireSauve = await nouveauBeneficiaire.save();
    
    // Mettre à jour le militaire correspondant pour ajouter ce bénéficiaire
    await Militaire.findByIdAndUpdate(
      militaireId,
      { $push: { beneficiaires: beneficiaireSauve._id } }
    );
    
    beneficiairesPromises.push(beneficiaireSauve);
    beneficiairesGeneres++;
  }
  
  // 2. Ensuite, créer des bénéficiaires pour les militaires décédés (uniquement ayants droits)
  for (const militaireId of militairesDecedes) {
    if (beneficiairesGeneres >= nombreBeneficiaires) break;
    
    const militaire = await Militaire.findById(militaireId);
    
    // Pour les militaires décédés, on génère 1 à 3 ayants droits
    const nombreAyantsDroits = Math.min(Math.floor(Math.random() * 3) + 1, nombreBeneficiaires - beneficiairesGeneres);
    
    for (let i = 0; i < nombreAyantsDroits; i++) {
      // Choisir une qualité parmi Conjoint, Enfant, Parent
      const qualite = getRandomItem(['Conjoint', 'Enfant', 'Parent']);
      const prenom = faker.person.firstName();
      // Si conjoint, même nom que le militaire
      const nom = qualite === 'Conjoint' ? militaire.nom : faker.person.lastName().toUpperCase();
      
      // Générer des avocats pour ce bénéficiaire (1 à 3)
      const nbAvocats = Math.floor(Math.random() * 2) + 1;
      const selectedAvocatIds = [];
      for (let j = 0; j < nbAvocats; j++) {
        let randomIndex = Math.floor(Math.random() * avocatIds.length);
        if (!selectedAvocatIds.includes(avocatIds[randomIndex])) {
          selectedAvocatIds.push(avocatIds[randomIndex]);
        }
      }
      
      // Générer les données du bénéficiaire
      const archive = militaire.archive;
      const dateDecision = getRandomDate(2023, 2025); // Date après octobre 2023
      
      const nouveauBeneficiaire = new Beneficiaire({
        prenom: prenom,
        nom: nom,
        qualite: qualite,
        militaire: militaireId,
        numeroDecision: faker.helpers.replaceSymbols('######'),
        dateDecision: dateDecision,
        avocats: selectedAvocatIds,
        conventions: [],
        paiements: [],
        archive: archive,
        dateCreation: faker.date.between({ 
          from: '2023-10-01T00:00:00.000Z', 
          to: new Date() 
        })
      });
      
      // Générer 0 à 3 conventions pour ce bénéficiaire
      const nbConventions = Math.floor(Math.random() * 3);
      for (let j = 0; j < nbConventions; j++) {
        const montant = getRandomAmount(1000, 10000);
        const dateEnvoiAvocat = getRandomFutureDate(dateDecision, 30);
        const dateEnvoiBeneficiaire = getRandomFutureDate(dateEnvoiAvocat, 20);
        const dateValidationFMG = getRandomFutureDate(dateEnvoiBeneficiaire, 45);
        
        nouveauBeneficiaire.conventions.push({
          montant: montant,
          pourcentageResultats: Math.floor(Math.random() * 10) + 1,
          dateEnvoiAvocat: dateEnvoiAvocat,
          dateEnvoiBeneficiaire: dateEnvoiBeneficiaire,
          dateValidationFMG: Math.random() < 0.7 ? dateValidationFMG : null,
          avocat: getRandomItem(selectedAvocatIds)
        });
      }
      
      // Générer 0 à 5 paiements pour ce bénéficiaire
      const nbPaiements = Math.floor(Math.random() * 5);
      for (let j = 0; j < nbPaiements; j++) {
        const coordonneesBancaires = genererCoordonneesBancaires();
        const montant = getRandomAmount(500, 8000);
        
        nouveauBeneficiaire.paiements.push({
          type: getRandomItem(typesPaiements),
          montant: montant,
          date: getRandomDate(2023, 2025), // Date après octobre 2023
          qualiteDestinataire: getRandomItem(qualitesDestinataire),
          identiteDestinataire: Math.random() < 0.7 ? 
            `Me ${faker.person.firstName()} ${faker.person.lastName().toUpperCase()}` : 
            `${faker.person.firstName()} ${faker.person.lastName().toUpperCase()}`,
          referencePiece: `Facture n°${faker.helpers.replaceSymbols('####-##')}`,
          adresseDestinataire: `${Math.floor(Math.random() * 100) + 1} ${faker.location.street()}, ${faker.location.zipCode()} ${faker.location.city()}`,
          siretRidet: Math.random() < 0.6 ? genererSIRET() : '',
          titulaireCompte: coordonneesBancaires.titulaireCompte,
          codeEtablissement: coordonneesBancaires.codeEtablissement,
          codeGuichet: coordonneesBancaires.codeGuichet,
          numeroCompte: coordonneesBancaires.numeroCompte,
          cleVerification: coordonneesBancaires.cleVerification
        });
      }
      
      const beneficiaireSauve = await nouveauBeneficiaire.save();
      
      // Mettre à jour le militaire correspondant pour ajouter ce bénéficiaire
      await Militaire.findByIdAndUpdate(
        militaireId,
        { $push: { beneficiaires: beneficiaireSauve._id } }
      );
      
      beneficiairesPromises.push(beneficiaireSauve);
      beneficiairesGeneres++;
    }
  }
  
  // 3. Si on n'a pas atteint le nombre demandé, remplir avec des bénéficiaires supplémentaires
  while (beneficiairesGeneres < nombreBeneficiaires) {
    // Choisir aléatoirement entre militaires décédés (pour ayants droits) ou blessés (pour eux-mêmes)
    let militaireId;
    let qualite;
    
    if (militairesDecedes.length > 0 && (militairesBleases.length === 0 || Math.random() < 0.5)) {
      // Créer un ayant droit pour un militaire décédé
      militaireId = getRandomItem(militairesDecedes);
      qualite = getRandomItem(['Conjoint', 'Enfant', 'Parent']);
    } else if (militairesBleases.length > 0) {
      // Pas de nouveaux bénéficiaires pour militaires blessés (déjà eux-mêmes)
      // On va ajouter quand même un ayant droit d'un militaire décédé
      if (militairesDecedes.length > 0) {
        militaireId = getRandomItem(militairesDecedes);
        qualite = getRandomItem(['Conjoint', 'Enfant', 'Parent']);
      } else {
        // Si pas de militaires décédés, on prend un blessé mais on ne génère pas de bénéficiaire
        // On sort de la boucle
        break;
      }
    } else {
      // Ni militaires décédés ni blessés disponibles
      break;
    }
    
    const militaire = await Militaire.findById(militaireId);
    
    let prenom, nom;
    
    if (militaire.decede) {
      // Pour les militaires décédés, le bénéficiaire est un ayant droit
      prenom = faker.person.firstName();
      nom = qualite === 'Conjoint' ? militaire.nom : faker.person.lastName().toUpperCase();
    } else {
      // Pour les militaires blessés, le bénéficiaire est le militaire lui-même
      // (Ne devrait pas arriver dans cette boucle mais par sécurité)
      prenom = militaire.prenom;
      nom = militaire.nom;
      qualite = 'Militaire';
    }
    
    // Générer des avocats pour ce bénéficiaire (1 à 3)
    const nbAvocats = Math.floor(Math.random() * 2) + 1;
    const selectedAvocatIds = [];
    for (let j = 0; j < nbAvocats; j++) {
      let randomIndex = Math.floor(Math.random() * avocatIds.length);
      if (!selectedAvocatIds.includes(avocatIds[randomIndex])) {
        selectedAvocatIds.push(avocatIds[randomIndex]);
      }
    }
    
    // Générer les données du bénéficiaire
    const archive = militaire.archive;
    const dateDecision = getRandomDate(2023, 2025); // Date après octobre 2023
    
    const nouveauBeneficiaire = new Beneficiaire({
      prenom: prenom,
      nom: nom,
      qualite: qualite,
      militaire: militaireId,
      numeroDecision: faker.helpers.replaceSymbols('######'),
      dateDecision: dateDecision,
      avocats: selectedAvocatIds,
      conventions: [],
      paiements: [],
      archive: archive,
      dateCreation: faker.date.between({ 
        from: '2023-10-01T00:00:00.000Z', 
        to: new Date() 
      })
    });
    
    // Générer 0 à 3 conventions pour ce bénéficiaire
    const nbConventions = Math.floor(Math.random() * 3);
    for (let j = 0; j < nbConventions; j++) {
      const montant = getRandomAmount(1000, 10000);
      const dateEnvoiAvocat = getRandomFutureDate(dateDecision, 30);
      const dateEnvoiBeneficiaire = getRandomFutureDate(dateEnvoiAvocat, 20);
      const dateValidationFMG = getRandomFutureDate(dateEnvoiBeneficiaire, 45);
      
      nouveauBeneficiaire.conventions.push({
        montant: montant,
        pourcentageResultats: Math.floor(Math.random() * 10) + 1,
        dateEnvoiAvocat: dateEnvoiAvocat,
        dateEnvoiBeneficiaire: dateEnvoiBeneficiaire,
        dateValidationFMG: Math.random() < 0.7 ? dateValidationFMG : null,
        avocat: getRandomItem(selectedAvocatIds)
      });
    }
    
    // Générer 0 à 5 paiements pour ce bénéficiaire
    const nbPaiements = Math.floor(Math.random() * 5);
    for (let j = 0; j < nbPaiements; j++) {
      const coordonneesBancaires = genererCoordonneesBancaires();
      const montant = getRandomAmount(500, 8000);
      
      nouveauBeneficiaire.paiements.push({
        type: getRandomItem(typesPaiements),
        montant: montant,
        date: getRandomDate(2023, 2025), // Date après octobre 2023
        qualiteDestinataire: getRandomItem(qualitesDestinataire),
        identiteDestinataire: Math.random() < 0.7 ? 
          `Me ${faker.person.firstName()} ${faker.person.lastName().toUpperCase()}` : 
          `${faker.person.firstName()} ${faker.person.lastName().toUpperCase()}`,
        referencePiece: `Facture n°${faker.helpers.replaceSymbols('####-##')}`,
        adresseDestinataire: `${Math.floor(Math.random() * 100) + 1} ${faker.location.street()}, ${faker.location.zipCode()} ${faker.location.city()}`,
        siretRidet: Math.random() < 0.6 ? genererSIRET() : '',
        titulaireCompte: coordonneesBancaires.titulaireCompte,
        codeEtablissement: coordonneesBancaires.codeEtablissement,
        codeGuichet: coordonneesBancaires.codeGuichet,
        numeroCompte: coordonneesBancaires.numeroCompte,
        cleVerification: coordonneesBancaires.cleVerification
      });
    }
    
    const beneficiaireSauve = await nouveauBeneficiaire.save();
    
    // Mettre à jour le militaire correspondant pour ajouter ce bénéficiaire
    await Militaire.findByIdAndUpdate(
      militaireId,
      { $push: { beneficiaires: beneficiaireSauve._id } }
    );
    
    beneficiairesPromises.push(beneficiaireSauve);
    beneficiairesGeneres++;
  }
  
  const beneficiaires = await Promise.all(beneficiairesPromises);
  beneficiaireIds = beneficiaires.map(b => b._id);
  console.log(`${beneficiairesGeneres} bénéficiaires générés avec succès.`);
  return beneficiaires;
};