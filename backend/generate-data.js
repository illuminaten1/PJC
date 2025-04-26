// generate-data.js
// Script pour peupler la base de données avec des données fictives pour toutes les entités
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/fr');
require('dotenv').config();

// Importer les modèles
const Avocat = require('./models/avocat');
const Affaire = require('./models/affaire');
const Militaire = require('./models/militaire');
const Beneficiaire = require('./models/beneficiaire');

// Configuration de la connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/protection-juridique', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB établie pour la génération des données'))
.catch(err => {
  console.error('Erreur de connexion à MongoDB', err);
  process.exit(1);
});

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

// Variables globales pour stocker les IDs générés
let avocatIds = [];
let affaireIds = [];
let militaireIds = [];
let beneficiaireIds = [];

// Fonctions utilitaires

// Fonction pour obtenir des dates aléatoires
const getRandomDate = (startYear = 2020, endYear = 2025) => {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Fonction pour obtenir une date future aléatoire
const getRandomFutureDate = (startDate, maxDays = 90) => {
  const futureDate = new Date(startDate);
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

// Étape 1: Générer des avocats
const genererAvocats = async (nombreAvocats) => {
  console.log(`Génération de ${nombreAvocats} avocats...`);
  
  // Noms fictifs des cabinets d'avocats
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
  
  // Si RESET_AVOCATS est true, supprimer tous les avocats existants
  if (process.env.RESET_DATA === 'true') {
    try {
      await Avocat.deleteMany({});
      console.log('Tous les avocats existants ont été supprimés.');
    } catch (err) {
      console.error('Erreur lors de la suppression des avocats existants:', err);
      process.exit(1);
    }
  }
  
  // Générer les avocats
  const avocatsPromises = [];
  for (let i = 0; i < nombreAvocats; i++) {
    // 70% de chance d'avoir un cabinet
    const aCabinet = Math.random() < 0.7;
    const cabinet = aCabinet ? getRandomItem(cabinets) : '';
    
    // 30% de chance d'être spécialisé RPC
    const specialisationRPC = Math.random() < 0.3;
    
    // Choisir une région
    const region = getRandomItem(regions);
    
    // Générer 1 à 3 villes d'intervention
    const villesIntervention = [];
    const nbVilles = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < nbVilles; j++) {
      villesIntervention.push(faker.location.city());
    }
    
    // Générer adresse
    const adresse = {
      numero: Math.floor(Math.random() * 200) + 1,
      rue: faker.location.street(),
      codePostal: faker.location.zipCode(),
      ville: faker.location.city()
    };
    
    // Nom en majuscules
    const nom = faker.person.lastName().toUpperCase();
    
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
      commentaires: Math.random() < 0.5 ? faker.lorem.sentence() : '',
      dateCreation: faker.date.past({ years: 2 })
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
    const dateFaits = getRandomDate(2021, 2025);
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
  
  // Générer les bénéficiaires
  const beneficiairesPromises = [];
  for (let i = 0; i < nombreBeneficiaires; i++) {
    // Sélectionner un militaire aléatoire
    const militaireId = getRandomItem(militaireIds);
    const militaire = await Militaire.findById(militaireId);
    
    // Si le militaire est décédé, les bénéficiaires sont des ayants droits
    // Sinon, 60% de chance que le bénéficiaire soit le militaire lui-même
    let qualite;
    let prenom;
    let nom;
    
    if (militaire.decede) {
      // Pour les militaires décédés, les bénéficiaires sont des ayants droits
      qualite = getRandomItem(['Conjoint', 'Enfant', 'Parent']);
      prenom = faker.person.firstName();
      nom = qualite === 'Conjoint' ? militaire.nom : faker.person.lastName().toUpperCase();
    } else {
      // Pour les militaires blessés
      if (Math.random() < 0.6) {
        // 60% de chance que le bénéficiaire soit le militaire lui-même
        qualite = 'Militaire';
        prenom = militaire.prenom;
        nom = militaire.nom;
      } else {
        // 40% de chance d'avoir un ayant droit comme bénéficiaire supplémentaire
        qualite = getRandomItem(['Conjoint', 'Enfant', 'Parent']);
        prenom = faker.person.firstName();
        nom = qualite === 'Conjoint' ? militaire.nom : faker.person.lastName().toUpperCase();
      }
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
    const dateDecision = getRandomDate(2021, 2025);
    
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
      dateCreation: faker.date.past({ years: 1 })
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
        date: getRandomDate(2021, 2025),
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
  }
  
  const beneficiaires = await Promise.all(beneficiairesPromises);
  beneficiaireIds = beneficiaires.map(b => b._id);
  console.log(`${nombreBeneficiaires} bénéficiaires générés avec succès.`);
  return beneficiaires;
};

// Fonction principale pour la génération des données
const genererDonnees = async () => {
  try {
    console.log('Début de la génération des données...');
    
    // Récupérer les nombres spécifiés en arguments
    const nbAvocats = parseInt(process.argv[2]) || 200;
    const nbAffaires = parseInt(process.argv[3]) || 50;
    const nbMilitaires = parseInt(process.argv[4]) || 100;
    const nbBeneficiaires = parseInt(process.argv[5]) || 150;
    
    // 1. Générer les avocats
    await genererAvocats(nbAvocats);
    
    // 2. Générer les affaires
    await genererAffaires(nbAffaires);
    
    // 3. Générer les militaires
    await genererMilitaires(nbMilitaires);
    
    // 4. Générer les bénéficiaires (avec conventions et paiements)
    await genererBeneficiaires(nbBeneficiaires);
    
    console.log('\nGénération des données terminée avec succès:');
    console.log(`- ${nbAvocats} avocats`);
    console.log(`- ${nbAffaires} affaires`);
    console.log(`- ${nbMilitaires} militaires`);
    console.log(`- ${nbBeneficiaires} bénéficiaires`);
    console.log('- Conventions et paiements associés');
    
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée.');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la génération des données:', error);
    process.exit(1);
  }
};

// Lancer la génération des données
genererDonnees();