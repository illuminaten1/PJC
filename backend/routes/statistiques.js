// routes/statistiques.js
const express = require('express');
const router = express.Router();
const Affaire = require('../models/affaire');
const Militaire = require('../models/militaire');
const Beneficiaire = require('../models/beneficiaire');

// GET - Statistiques globales
router.get('/', async (req, res) => {
  try {
    const { annee } = req.query;
    let query = {};
    
    // Filtre par année si spécifiée
    if (annee) {
      const anneeInt = parseInt(annee);
      const debutAnnee = new Date(anneeInt, 0, 1);
      const finAnnee = new Date(anneeInt + 1, 0, 1);
      
      query.$or = [
        { dateFaits: { $gte: debutAnnee, $lt: finAnnee } },
        { 'conventions.dateValidationFMG': { $gte: debutAnnee, $lt: finAnnee } },
        { 'paiements.date': { $gte: debutAnnee, $lt: finAnnee } }
      ];
    }
    
    // Récupérer les statistiques des affaires
    const statsAffaires = await Affaire.aggregate([
      { $match: annee ? { 
        dateFaits: { 
          $gte: new Date(parseInt(annee), 0, 1), 
          $lt: new Date(parseInt(annee) + 1, 0, 1) 
        } 
      } : {} },
      { $group: { 
        _id: null, 
        total: { $sum: 1 },
        enCours: { $sum: { $cond: [{ $ne: ["$archive", true] }, 1, 0] } },
        archivees: { $sum: { $cond: [{ $eq: ["$archive", true] }, 1, 0] } }
      } }
    ]);
    
    // Statistiques des militaires
    const statsMilitaires = await Militaire.aggregate([
      { $group: { 
        _id: null, 
        total: { $sum: 1 },
        blesses: { $sum: { $cond: [{ $eq: ["$decede", false] }, 1, 0] } },
        decedes: { $sum: { $cond: [{ $eq: ["$decede", true] }, 1, 0] } }
      } }
    ]);
    
    // Statistiques des bénéficiaires par qualité
    const statsBeneficiaires = await Beneficiaire.aggregate([
      // Si filtrage par année, filtrer via des jointures
      ...(annee ? [
        // Joindre le militaire
        { $lookup: {
          from: 'militaires',
          localField: 'militaire',
          foreignField: '_id',
          as: 'militaireInfo'
        }},
        { $unwind: { path: "$militaireInfo", preserveNullAndEmptyArrays: false } },
        // Joindre l'affaire
        { $lookup: {
          from: 'affaires',
          localField: 'militaireInfo.affaire',
          foreignField: '_id',
          as: 'affaireInfo'
        }},
        { $unwind: { path: "$affaireInfo", preserveNullAndEmptyArrays: false } },
        // Filtrer par date des faits de l'affaire
        { $match: { 
          'affaireInfo.dateFaits': { 
            $gte: new Date(parseInt(annee), 0, 1), 
            $lt: new Date(parseInt(annee) + 1, 0, 1) 
          } 
        }}
      ] : []),
      // Grouper par qualité
      { $group: { 
        _id: "$qualite", 
        count: { $sum: 1 } 
      } }
    ]);
    
    // Calcul des montants financiers des conventions
    const statsFinancieres = await Beneficiaire.aggregate([
      { $unwind: { path: "$conventions", preserveNullAndEmptyArrays: false } },
      ...(annee ? [
        { $match: { 
          'conventions.dateValidationFMG': { 
            $gte: new Date(parseInt(annee), 0, 1), 
            $lt: new Date(parseInt(annee) + 1, 0, 1) 
          } 
        }}
      ] : []),
      { $group: { 
        _id: { $year: "$conventions.dateValidationFMG" }, 
        montantGage: { $sum: "$conventions.montant" }
      } }
    ]);
    
    // Calcul des montants financiers des paiements
    const statsPaiements = await Beneficiaire.aggregate([
      { $unwind: { path: "$paiements", preserveNullAndEmptyArrays: false } },
      ...(annee ? [
        { $match: { 
          'paiements.date': { 
            $gte: new Date(parseInt(annee), 0, 1), 
            $lt: new Date(parseInt(annee) + 1, 0, 1) 
          } 
        }}
      ] : []),
      { $group: { 
        _id: { $year: "$paiements.date" }, 
        montantPaye: { $sum: "$paiements.montant" }
      } }
    ]);
    
    // Formatage des statistiques de bénéficiaires par qualité
    const beneficiairesParQualite = {};
    statsBeneficiaires.forEach(stat => {
      beneficiairesParQualite[stat._id] = stat.count;
    });
    
    // Formatage des statistiques financières par année
    const financesParAnnee = {};
    statsFinancieres.forEach(stat => {
      if (!financesParAnnee[stat._id]) {
        financesParAnnee[stat._id] = { montantGage: 0, montantPaye: 0 };
      }
      financesParAnnee[stat._id].montantGage = stat.montantGage;
    });
    
    statsPaiements.forEach(stat => {
      if (!financesParAnnee[stat._id]) {
        financesParAnnee[stat._id] = { montantGage: 0, montantPaye: 0 };
      }
      financesParAnnee[stat._id].montantPaye = stat.montantPaye;
    });
    
    res.json({
      affaires: statsAffaires.length > 0 ? statsAffaires[0].total : 0,
      affairesEnCours: statsAffaires.length > 0 ? statsAffaires[0].enCours : 0,
      affairesArchivees: statsAffaires.length > 0 ? statsAffaires[0].archivees : 0,
      militaires: statsMilitaires.length > 0 ? {
        total: statsMilitaires[0].total,
        blesses: statsMilitaires[0].blesses,
        decedes: statsMilitaires[0].decedes
      } : { total: 0, blesses: 0, decedes: 0 },
      beneficiaires: beneficiairesParQualite,
      finances: financesParAnnee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Statistiques par année
router.get('/annee/:annee', async (req, res) => {
  try {
    const { annee } = req.params;
    const anneeInt = parseInt(annee);
    
    if (isNaN(anneeInt)) {
      return res.status(400).json({ message: 'Année invalide' });
    }
    
    // Définir la plage de dates pour cette année
    const debutAnnee = new Date(anneeInt, 0, 1);
    const finAnnee = new Date(anneeInt + 1, 0, 1);
    
    // Statistiques des affaires pour cette année
    const statsAffaires = await Affaire.aggregate([
      { $match: { 
        dateFaits: { $gte: debutAnnee, $lt: finAnnee }
      }},
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);
    
    // Statistiques des conventions pour cette année
    const statsConventions = await Beneficiaire.aggregate([
      { $unwind: { path: "$conventions", preserveNullAndEmptyArrays: false } },
      { $match: { 
        'conventions.dateValidationFMG': { $gte: debutAnnee, $lt: finAnnee }
      }},
      { $group: { 
        _id: null, 
        montantGage: { $sum: "$conventions.montant" },
        count: { $sum: 1 }
      } }
    ]);
    
    // Statistiques des paiements pour cette année
    const statsPaiements = await Beneficiaire.aggregate([
      { $unwind: { path: "$paiements", preserveNullAndEmptyArrays: false } },
      { $match: { 
        'paiements.date': { $gte: debutAnnee, $lt: finAnnee }
      }},
      { $group: { 
        _id: null, 
        montantPaye: { $sum: "$paiements.montant" },
        count: { $sum: 1 }
      } }
    ]);
    
    // Statistiques par rédacteur (basées sur la date de décision de chaque bénéficiaire)
const statsByRedacteur = await Beneficiaire.aggregate([
  // Filtrer d'abord par année de la décision du bénéficiaire
  { $match: {
    'dateDecision': { $gte: debutAnnee, $lt: finAnnee }
  }},
  // Faire un lookup pour joindre le militaire
  { $lookup: {
    from: 'militaires',
    localField: 'militaire',
    foreignField: '_id',
    as: 'militaireInfo'
  }},
  // Joindre l'affaire depuis le militaire
  { $unwind: { path: "$militaireInfo", preserveNullAndEmptyArrays: false } },
  { $lookup: {
    from: 'affaires',
    localField: 'militaireInfo.affaire',
    foreignField: '_id',
    as: 'affaireInfo'
  }},
  { $unwind: { path: "$affaireInfo", preserveNullAndEmptyArrays: false } },
  // Grouper par rédacteur de l'affaire
  { $group: {
    _id: "$affaireInfo.redacteur",
    countDossiers: { $sum: 1 }
  }}
]);
    
    // Statistiques par circonstance
    const statsByCirconstance = await Militaire.aggregate([
      { $lookup: {
        from: 'affaires',
        localField: 'affaire',
        foreignField: '_id',
        as: 'affaireInfo'
      } },
      { $unwind: { path: "$affaireInfo", preserveNullAndEmptyArrays: false } },
      { $match: { 'affaireInfo.dateFaits': { $gte: debutAnnee, $lt: finAnnee } }},
      { $group: { 
        _id: "$circonstance", 
        count: { $sum: 1 } 
      } }
    ]);

    // Statistiques par région
    const statsByRegion = await Militaire.aggregate([
      // Joindre l'affaire
      { $lookup: {
        from: 'affaires',
        localField: 'affaire',
        foreignField: '_id',
        as: 'affaireInfo'
      } },
      { $unwind: { path: "$affaireInfo", preserveNullAndEmptyArrays: false } },
      // Filtrer par année
      { $match: { 'affaireInfo.dateFaits': { $gte: debutAnnee, $lt: finAnnee } }},
      // Joindre les bénéficiaires pour chaque militaire
      { $lookup: {
        from: 'beneficiaires',
        localField: '_id',
        foreignField: 'militaire',
        as: 'beneficiairesInfo'
      } },
      // Grouper par région
      { $group: { 
        _id: "$region", 
        nbMilitaires: { $sum: 1 },
        nbBeneficiaires: { $sum: { $size: "$beneficiairesInfo" } }
      } },
      // Gérer les régions non définies
      { $addFields: {
        region: { $ifNull: ["$_id", "Non spécifiée"] }
      } },
      // Trier par nombre de militaires décroissant
      { $sort: { nbMilitaires: -1 } }
    ]);
    
    const statsByDepartement = await Militaire.aggregate([
      // Joindre l'affaire
      { $lookup: {
        from: 'affaires',
        localField: 'affaire',
        foreignField: '_id',
        as: 'affaireInfo'
      } },
      { $unwind: { path: "$affaireInfo", preserveNullAndEmptyArrays: false } },
      // Filtrer par année
      { $match: { 'affaireInfo.dateFaits': { $gte: debutAnnee, $lt: finAnnee } }},
      // Joindre les bénéficiaires pour chaque militaire
      { $lookup: {
        from: 'beneficiaires',
        localField: '_id',
        foreignField: 'militaire',
        as: 'beneficiairesInfo'
      } },
      // Grouper par département
      { $group: { 
        _id: "$departement", 
        nbMilitaires: { $sum: 1 },
        nbBeneficiaires: { $sum: { $size: "$beneficiairesInfo" } }
      } },
      // Gérer les départements non définis
      { $addFields: {
        departement: { $ifNull: ["$_id", "Non spécifié"] }
      } },
      // Trier par nombre de militaires décroissant
      { $sort: { nbMilitaires: -1 } }
    ]);

    res.json({
      annee: anneeInt,
      affaires: {
        total: statsAffaires.length > 0 ? statsAffaires[0].total : 0
      },
      finances: {
        montantGage: statsConventions.length > 0 ? statsConventions[0].montantGage : 0,
        nbConventions: statsConventions.length > 0 ? statsConventions[0].count : 0,
        montantPaye: statsPaiements.length > 0 ? statsPaiements[0].montantPaye : 0,
        nbPaiements: statsPaiements.length > 0 ? statsPaiements[0].count : 0
      },
      parRedacteur: statsByRedacteur.reduce((acc, stat) => {
        acc[stat._id] = stat.countDossiers;
        return acc;
      }, {}),
      parCirconstance: statsByCirconstance.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      parRegion: statsByRegion.reduce((acc, stat) => {
        // Utiliser "Non spécifiée" si la région est null ou undefined
        const regionKey = stat._id || "Non spécifiée";
        acc[regionKey] = {
          nbMilitaires: stat.nbMilitaires,
          nbBeneficiaires: stat.nbBeneficiaires
        };
        return acc;
      }, {}),
      parDepartement: statsByDepartement.reduce((acc, stat) => {
        const departementKey = stat._id || "Non spécifié";
        acc[departementKey] = {
          nbMilitaires: stat.nbMilitaires,
          nbBeneficiaires: stat.nbBeneficiaires
        };
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Statistiques par affaire
router.get('/affaire/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier l'ID de l'affaire
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID d\'affaire invalide' });
    }
    
    // Récupérer l'affaire
    const affaire = await Affaire.findById(id);
    if (!affaire) {
      return res.status(404).json({ message: 'Affaire non trouvée' });
    }
    
    // Statistiques des militaires impliqués
    const militaires = await Militaire.find({ affaire: id });
    const militaireIds = militaires.map(m => m._id);
    
    // Statistiques des bénéficiaires
    const beneficiaires = await Beneficiaire.find({ militaire: { $in: militaireIds } });
    
    // Calcul des montants financiers
    let montantTotalGage = 0;
    let montantTotalPaye = 0;
    let nombreConventions = 0;
    let nombrePaiements = 0;
    
    beneficiaires.forEach(beneficiaire => {
      beneficiaire.conventions.forEach(convention => {
        montantTotalGage += convention.montant || 0;
        nombreConventions++;
      });
      
      beneficiaire.paiements.forEach(paiement => {
        montantTotalPaye += paiement.montant || 0;
        nombrePaiements++;
      });
    });
    
    // Statistiques par qualité de bénéficiaire
    const beneficiairesParQualite = beneficiaires.reduce((acc, beneficiaire) => {
      if (!acc[beneficiaire.qualite]) {
        acc[beneficiaire.qualite] = 0;
      }
      acc[beneficiaire.qualite]++;
      return acc;
    }, {});
    
    // Année de la date des faits pour remplacer anneeBudgetaire
    const anneeFaits = affaire.dateFaits ? affaire.dateFaits.getFullYear() : 'Non définie';
    
    res.json({
      affaire: {
        id: affaire._id,
        nom: affaire.nom,
        dateFaits: affaire.dateFaits,
        anneeFaits: anneeFaits
      },
      militaires: {
        total: militaires.length,
        blesses: militaires.filter(m => !m.decede).length,
        decedes: militaires.filter(m => m.decede).length
      },
      beneficiaires: {
        total: beneficiaires.length,
        parQualite: beneficiairesParQualite
      },
      finances: {
        montantGage: montantTotalGage,
        montantPaye: montantTotalPaye,
        nombreConventions,
        nombrePaiements,
        ratio: montantTotalGage > 0 ? (montantTotalPaye / montantTotalGage) * 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Statistiques par militaire
router.get('/militaire/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier l'ID du militaire
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de militaire invalide' });
    }
    
    // Récupérer le militaire
    const militaire = await Militaire.findById(id).populate('affaire', 'nom dateFaits');
    if (!militaire) {
      return res.status(404).json({ message: 'Militaire non trouvé' });
    }
    
    // Statistiques des bénéficiaires
    const beneficiaires = await Beneficiaire.find({ militaire: id });
    
    // Calcul des montants financiers
    let montantTotalGage = 0;
    let montantTotalPaye = 0;
    let nombreConventions = 0;
    let nombrePaiements = 0;
    
    beneficiaires.forEach(beneficiaire => {
      beneficiaire.conventions.forEach(convention => {
        montantTotalGage += convention.montant || 0;
        nombreConventions++;
      });
      
      beneficiaire.paiements.forEach(paiement => {
        montantTotalPaye += paiement.montant || 0;
        nombrePaiements++;
      });
    });
    
    // Statistiques par qualité de bénéficiaire
    const beneficiairesParQualite = beneficiaires.reduce((acc, beneficiaire) => {
      if (!acc[beneficiaire.qualite]) {
        acc[beneficiaire.qualite] = 0;
      }
      acc[beneficiaire.qualite]++;
      return acc;
    }, {});
    
    res.json({
      militaire: {
        id: militaire._id,
        grade: militaire.grade,
        nom: militaire.nom,
        prenom: militaire.prenom,
        decede: militaire.decede,
        affaire: militaire.affaire
      },
      beneficiaires: {
        total: beneficiaires.length,
        parQualite: beneficiairesParQualite
      },
      finances: {
        montantGage: montantTotalGage,
        montantPaye: montantTotalPaye,
        nombreConventions,
        nombrePaiements,
        ratio: montantTotalGage > 0 ? (montantTotalPaye / montantTotalGage) * 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Statistiques budgétaires par année
router.get('/budget/:annee', async (req, res) => {
  try {
    const { annee } = req.params;
    const anneeInt = parseInt(annee);
    
    if (isNaN(anneeInt)) {
      return res.status(400).json({ message: 'Année invalide' });
    }
    
    // Définir la plage de dates pour cette année
    const debutAnnee = new Date(anneeInt, 0, 1);
    const finAnnee = new Date(anneeInt + 1, 0, 1);
    
    // Montants engagés par mois (conventions)
    const conventionsParMois = await Beneficiaire.aggregate([
      { $unwind: { path: "$conventions", preserveNullAndEmptyArrays: false } },
      { $match: { 
        'conventions.dateValidationFMG': { $gte: debutAnnee, $lt: finAnnee } 
      }},
      { $project: {
        mois: { $month: "$conventions.dateValidationFMG" },
        montant: "$conventions.montant"
      }},
      { $group: { 
        _id: "$mois", 
        montantGage: { $sum: "$montant" },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Montants payés par mois (paiements)
    const paiementsParMois = await Beneficiaire.aggregate([
      { $unwind: { path: "$paiements", preserveNullAndEmptyArrays: false } },
      { $match: { 
        'paiements.date': { $gte: debutAnnee, $lt: finAnnee }
      }},
      { $project: {
        mois: { $month: "$paiements.date" },
        montant: "$paiements.montant"
      }},
      { $group: { 
        _id: "$mois", 
        montantPaye: { $sum: "$montant" },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Construire l'objet de résultat
    const resultatParMois = [];
    
    for (let mois = 1; mois <= 12; mois++) {
      const conventionMois = conventionsParMois.find(c => c._id === mois);
      const paiementMois = paiementsParMois.find(p => p._id === mois);
      
      resultatParMois.push({
        mois,
        nomMois: new Date(2000, mois - 1, 1).toLocaleString('fr-FR', { month: 'long' }),
        gage: {
          montant: conventionMois ? conventionMois.montantGage : 0,
          nombre: conventionMois ? conventionMois.count : 0
        },
        paye: {
          montant: paiementMois ? paiementMois.montantPaye : 0,
          nombre: paiementMois ? paiementMois.count : 0
        }
      });
    }
    
    // Totaux annuels
    const totalGage = resultatParMois.reduce((sum, mois) => sum + mois.gage.montant, 0);
    const totalPaye = resultatParMois.reduce((sum, mois) => sum + mois.paye.montant, 0);
    
    res.json({
      annee: anneeInt,
      parMois: resultatParMois,
      totaux: {
        montantGage: totalGage,
        montantPaye: totalPaye,
        ratio: totalGage > 0 ? (totalPaye / totalGage) * 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;