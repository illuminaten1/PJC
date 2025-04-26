// generate-avocats.js
// Script pour peupler la base de données avec des avocats fictifs
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/fr');
require('dotenv').config();

// Importer le modèle Avocat
const Avocat = require('./models/avocat');

// Configuration de la connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/protection-juridique', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB établie pour la génération des avocats'))
.catch(err => {
  console.error('Erreur de connexion à MongoDB', err);
  process.exit(1);
});

// Liste des régions françaises y compris les Outre-mers
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
  // On commence par un 0
  let telephone = '0';
  
  // On choisit un indicatif : 1-5 pour fixe, 6-7 pour mobile
  const indicatif = Math.random() < 0.5 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 2) + 6;
  telephone += indicatif;
  
  // On ajoute 8 chiffres aléatoires
  for (let i = 0; i < 8; i++) {
    telephone += Math.floor(Math.random() * 10);
  }
  
  // On formate le numéro
  return telephone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
};

// Fonction pour générer une adresse
const genererAdresse = (region) => {
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

// Fonction pour créer un avocat avec des données aléatoires
const creerAvocat = async () => {
  // 70% de chance d'avoir un cabinet
  const aCabinet = Math.random() < 0.7;
  const cabinet = aCabinet ? cabinets[Math.floor(Math.random() * cabinets.length)] : '';
  
  // 30% de chance d'être spécialisé RPC
  const specialisationRPC = Math.random() < 0.3;
  
  // Choisir une région
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  // Générer les villes d'intervention
  const villesIntervention = genererVillesIntervention(region);
  
  // Générer l'adresse
  const adresse = genererAdresse(region);
  
  // 80% de chance d'avoir un téléphone public 1
  const aTelephonePublic1 = Math.random() < 0.8;
  const telephonePublic1 = aTelephonePublic1 ? genererTelephone() : '';
  
  // 40% de chance d'avoir un téléphone public 2
  const aTelephonePublic2 = Math.random() < 0.4;
  const telephonePublic2 = aTelephonePublic2 ? genererTelephone() : '';
  
  // 60% de chance d'avoir un téléphone privé
  const aTelephonePrive = Math.random() < 0.6;
  const telephonePrive = aTelephonePrive ? genererTelephone() : '';
  
  // 70% de chance d'avoir un SIRET/RIDET
  const aSiretRidet = Math.random() < 0.7;
  const siretRidet = aSiretRidet ? genererSIRET() : '';
  
  // Générer des commentaires
  const commentaires = genererCommentaires(specialisationRPC);
  
  // Générer un nom en majuscules
  const nom = faker.person.lastName().toUpperCase();
  
  // Créer un nouvel avocat
  const avocat = new Avocat({
    nom: nom,
    prenom: faker.person.firstName(),
    email: faker.internet.email({ firstName: faker.person.firstName(), lastName: nom }).toLowerCase(),
    specialisationRPC: specialisationRPC,
    cabinet: cabinet,
    region: region,
    villesIntervention: villesIntervention,
    adresse: adresse,
    telephonePublic1: telephonePublic1,
    telephonePublic2: telephonePublic2,
    telephonePrive: telephonePrive,
    siretRidet: siretRidet,
    commentaires: commentaires,
    dateCreation: faker.date.past({ years: 3 })
  });
  
  // Sauvegarder l'avocat dans la base de données
  await avocat.save();
};

// Fonction principale pour générer tous les avocats
const genererAvocats = async (nombreAvocats) => {
  console.log(`Début de la génération de ${nombreAvocats} avocats...`);
  
  // Supprimer les avocats existants
  if (process.env.RESET_AVOCATS === 'true') {
    try {
      await Avocat.deleteMany({});
      console.log('Tous les avocats existants ont été supprimés.');
    } catch (err) {
      console.error('Erreur lors de la suppression des avocats existants:', err);
      process.exit(1);
    }
  }
  
  // Générer les avocats un par un
  for (let i = 0; i < nombreAvocats; i++) {
    try {
      await creerAvocat();
      if ((i + 1) % 50 === 0) {
        console.log(`${i + 1} avocats générés...`);
      }
    } catch (err) {
      console.error(`Erreur lors de la création de l'avocat ${i}:`, err);
    }
  }
  
  console.log(`Génération de ${nombreAvocats} avocats terminée avec succès.`);
  process.exit(0);
};

// Lancer la génération avec le nombre spécifié en argument
const nombreAvocats = process.argv[2] ? parseInt(process.argv[2]) : 450;

// Vérifier que le nombre d'avocats est valide
if (isNaN(nombreAvocats) || nombreAvocats <= 0) {
  console.error('Le nombre d\'avocats doit être un entier positif.');
  process.exit(1);
}

genererAvocats(nombreAvocats);