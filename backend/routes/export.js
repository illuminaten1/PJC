// backend/routes/export.js
const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Beneficiaire = require('../models/beneficiaire');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/export/beneficiaires
 * @desc    Exporte les bénéficiaires au format Excel
 * @access  Private
 */
router.get('/beneficiaires', auth, async (req, res) => {
  try {
    // Récupération des bénéficiaires avec toutes les données associées
    const beneficiaires = await Beneficiaire.find(req.query)
      .populate({
        path: 'militaire',
        populate: {
          path: 'affaire',
          select: 'nom description lieu dateFaits redacteur'
        }
      })
      .populate('avocats')
      .populate('conventions.avocat')
      .lean();

    if (!beneficiaires.length) {
      return res.status(404).json({ message: 'Aucun bénéficiaire trouvé avec ces critères' });
    }

    // Création du workbook (fichier Excel)
    const workbook = XLSX.utils.book_new();
    
    // 1. Feuille des bénéficiaires
    const beneficiaireData = beneficiaires.map(b => {
      return {
        'ID': b._id.toString(),
        'Prénom': b.prenom,
        'Nom': b.nom,
        'Qualité': b.qualite,
        'N° Décision': b.numeroDecision || 'Non défini',
        'Date Décision': b.dateDecision ? new Date(b.dateDecision).toLocaleDateString('fr-FR') : 'Non définie',
        'Date Création': new Date(b.dateCreation).toLocaleDateString('fr-FR'),
        'Archivé': b.archive ? 'Oui' : 'Non',
        'Militaire': b.militaire ? `${b.militaire.grade} ${b.militaire.prenom} ${b.militaire.nom}` : 'Non défini',
        'Affaire': b.militaire && b.militaire.affaire ? b.militaire.affaire.nom : 'Non définie',
        'Date des Faits': b.militaire && b.militaire.affaire && b.militaire.affaire.dateFaits 
          ? new Date(b.militaire.affaire.dateFaits).toLocaleDateString('fr-FR') 
          : 'Non définie',
        'Lieu': b.militaire && b.militaire.affaire ? b.militaire.affaire.lieu : 'Non défini',
        'Rédacteur': b.militaire && b.militaire.affaire ? b.militaire.affaire.redacteur : 'Non défini',
        'Avocats': b.avocats && b.avocats.length 
          ? b.avocats.map(a => `Me ${a.prenom} ${a.nom}`).join(', ') 
          : 'Aucun avocat désigné',
        'Nb Conventions': b.conventions ? b.conventions.length : 0,
        'Montant Total Conventions': b.conventions 
          ? b.conventions.reduce((sum, c) => sum + (c.montant || 0), 0).toLocaleString('fr-FR') + ' €' 
          : '0 €',
        'Nb Paiements': b.paiements ? b.paiements.length : 0,
        'Montant Total Paiements': b.paiements 
          ? b.paiements.reduce((sum, p) => sum + (p.montant || 0), 0).toLocaleString('fr-FR') + ' €' 
          : '0 €',
      };
    });
    
    // Création de la feuille des bénéficiaires
    const beneficiaireSheet = XLSX.utils.json_to_sheet(beneficiaireData);
    XLSX.utils.book_append_sheet(workbook, beneficiaireSheet, 'Bénéficiaires');
    
    // 2. Feuille des conventions
    const conventionsData = [];
    beneficiaires.forEach(b => {
      if (b.conventions && b.conventions.length > 0) {
        b.conventions.forEach(c => {
          conventionsData.push({
            'Bénéficiaire': `${b.prenom} ${b.nom}`,
            'Qualité': b.qualite,
            'ID Bénéficiaire': b._id.toString(),
            'Montant': (c.montant || 0).toLocaleString('fr-FR') + ' €',
            'Pourcentage Résultats': `${c.pourcentageResultats || 0} %`,
            'Date Envoi Avocat': c.dateEnvoiAvocat ? new Date(c.dateEnvoiAvocat).toLocaleDateString('fr-FR') : 'Non définie',
            'Date Envoi Bénéficiaire': c.dateEnvoiBeneficiaire ? new Date(c.dateEnvoiBeneficiaire).toLocaleDateString('fr-FR') : 'Non définie',
            'Date Validation FMG': c.dateValidationFMG ? new Date(c.dateValidationFMG).toLocaleDateString('fr-FR') : 'Non définie',
            'Avocat': c.avocat ? `Me ${c.avocat.prenom} ${c.avocat.nom}` : 'Non défini',
            'Affaire': b.militaire && b.militaire.affaire ? b.militaire.affaire.nom : 'Non définie',
          });
        });
      }
    });
    
    // Création de la feuille des conventions
    if (conventionsData.length > 0) {
      const conventionsSheet = XLSX.utils.json_to_sheet(conventionsData);
      XLSX.utils.book_append_sheet(workbook, conventionsSheet, 'Conventions');
    } else {
      // Créer une feuille vide si aucune convention
      const emptyConventionsSheet = XLSX.utils.aoa_to_sheet([['Aucune convention trouvée']]);
      XLSX.utils.book_append_sheet(workbook, emptyConventionsSheet, 'Conventions');
    }
    
    // 3. Feuille des paiements
    const paiementsData = [];
    beneficiaires.forEach(b => {
      if (b.paiements && b.paiements.length > 0) {
        b.paiements.forEach(p => {
          paiementsData.push({
            'Bénéficiaire': `${b.prenom} ${b.nom}`,
            'Qualité': b.qualite,
            'ID Bénéficiaire': b._id.toString(),
            'Type': p.type,
            'Montant': (p.montant || 0).toLocaleString('fr-FR') + ' €',
            'Date': p.date ? new Date(p.date).toLocaleDateString('fr-FR') : 'Non définie',
            'Qualité Destinataire': p.qualiteDestinataire,
            'Identité Destinataire': p.identiteDestinataire,
            'Référence Pièce': p.referencePiece || 'Non définie',
            'Adresse Destinataire': p.adresseDestinataire || 'Non définie',
            'SIRET/RIDET': p.siretRidet || 'Non défini',
            'Titulaire Compte': p.titulaireCompte || 'Non défini',
            'Code Établissement': p.codeEtablissement || 'Non défini',
            'Code Guichet': p.codeGuichet || 'Non défini',
            'Numéro Compte': p.numeroCompte || 'Non défini',
            'Clé Vérification': p.cleVerification || 'Non définie',
            'Affaire': b.militaire && b.militaire.affaire ? b.militaire.affaire.nom : 'Non définie',
          });
        });
      }
    });
    
    // Création de la feuille des paiements
    if (paiementsData.length > 0) {
      const paiementsSheet = XLSX.utils.json_to_sheet(paiementsData);
      XLSX.utils.book_append_sheet(workbook, paiementsSheet, 'Paiements');
    } else {
      // Créer une feuille vide si aucun paiement
      const emptyPaiementsSheet = XLSX.utils.aoa_to_sheet([['Aucun paiement trouvé']]);
      XLSX.utils.book_append_sheet(workbook, emptyPaiementsSheet, 'Paiements');
    }
    
    // Génération du buffer Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    // Configuration des en-têtes pour le téléchargement
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=beneficiaires.xlsx');
    
    // Envoi du fichier au client
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export Excel', error: error.message });
  }
});

// Route à ajouter dans export.js pour exporter un seul bénéficiaire

/**
 * @route   GET /api/export/beneficiaires/:id
 * @desc    Exporte un bénéficiaire spécifique au format Excel
 * @access  Private
 */
router.get('/beneficiaires/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupération d'un bénéficiaire spécifique avec toutes les données associées
    const beneficiaire = await Beneficiaire.findById(id)
      .populate({
        path: 'militaire',
        populate: {
          path: 'affaire',
          select: 'nom description lieu dateFaits redacteur'
        }
      })
      .populate('avocats')
      .populate('conventions.avocat')
      .lean();

    if (!beneficiaire) {
      return res.status(404).json({ message: 'Bénéficiaire non trouvé' });
    }

    // Création du workbook (fichier Excel)
    const workbook = XLSX.utils.book_new();
    
    // 1. Feuille des informations du bénéficiaire
    const beneficiaireInfo = [
      ['INFORMATIONS DU BÉNÉFICIAIRE', ''],
      ['', ''],
      ['Informations générales', ''],
      ['ID', beneficiaire._id.toString()],
      ['Prénom', beneficiaire.prenom],
      ['Nom', beneficiaire.nom],
      ['Qualité', beneficiaire.qualite],
      ['N° Décision', beneficiaire.numeroDecision || 'Non défini'],
      ['Date Décision', beneficiaire.dateDecision ? new Date(beneficiaire.dateDecision).toLocaleDateString('fr-FR') : 'Non définie'],
      ['Date Création', new Date(beneficiaire.dateCreation).toLocaleDateString('fr-FR')],
      ['Archivé', beneficiaire.archive ? 'Oui' : 'Non'],
      ['', ''],
      ['Militaire créateur de droit', ''],
      ['Grade', beneficiaire.militaire ? beneficiaire.militaire.grade : 'Non défini'],
      ['Prénom', beneficiaire.militaire ? beneficiaire.militaire.prenom : 'Non défini'],
      ['Nom', beneficiaire.militaire ? beneficiaire.militaire.nom : 'Non défini'],
      ['Unité', beneficiaire.militaire ? beneficiaire.militaire.unite : 'Non définie'],
      ['Région', beneficiaire.militaire ? beneficiaire.militaire.region : 'Non définie'],
      ['Département', beneficiaire.militaire ? beneficiaire.militaire.departement : 'Non défini'],
      ['Circonstance', beneficiaire.militaire ? beneficiaire.militaire.circonstance : 'Non définie'],
      ['Nature des blessures', beneficiaire.militaire ? beneficiaire.militaire.natureDesBlessures : 'Non définie'],
      ['ITT (jours)', beneficiaire.militaire ? (beneficiaire.militaire.itt || 'Non défini') : 'Non défini'],
      ['Décédé', beneficiaire.militaire ? (beneficiaire.militaire.decede ? 'Oui' : 'Non') : 'Non défini'],
      ['', ''],
      ['Affaire', ''],
      ['Nom', beneficiaire.militaire && beneficiaire.militaire.affaire ? beneficiaire.militaire.affaire.nom : 'Non définie'],
      ['Description', beneficiaire.militaire && beneficiaire.militaire.affaire ? beneficiaire.militaire.affaire.description : 'Non définie'],
      ['Lieu', beneficiaire.militaire && beneficiaire.militaire.affaire ? beneficiaire.militaire.affaire.lieu : 'Non défini'],
      ['Date des faits', beneficiaire.militaire && beneficiaire.militaire.affaire && beneficiaire.militaire.affaire.dateFaits 
        ? new Date(beneficiaire.militaire.affaire.dateFaits).toLocaleDateString('fr-FR') 
        : 'Non définie'],
      ['Rédacteur', beneficiaire.militaire && beneficiaire.militaire.affaire ? beneficiaire.militaire.affaire.redacteur : 'Non défini'],
      ['', ''],
      ['Avocats désignés', '']
    ];
    
    // Ajouter les avocats à la feuille principale s'il y en a
    if (beneficiaire.avocats && beneficiaire.avocats.length > 0) {
      beneficiaire.avocats.forEach((avocat, index) => {
        beneficiaireInfo.push([`Avocat ${index + 1}`, `Me ${avocat.prenom} ${avocat.nom}`]);
        beneficiaireInfo.push(['Spécialisation RPC', avocat.specialisationRPC ? 'Oui' : 'Non']);
        beneficiaireInfo.push(['Email', avocat.email || 'Non défini']);
        beneficiaireInfo.push(['Cabinet', avocat.cabinet || 'Non défini']);
        beneficiaireInfo.push(['Région', avocat.region || 'Non définie']);
        beneficiaireInfo.push(['Téléphone principal', avocat.telephonePublic1 || 'Non défini']);
        if (index < beneficiaire.avocats.length - 1) {
          beneficiaireInfo.push(['', '']);
        }
      });
    } else {
      beneficiaireInfo.push(['', 'Aucun avocat désigné']);
    }
    
    // Créer la feuille des informations du bénéficiaire
    const infoSheet = XLSX.utils.aoa_to_sheet(beneficiaireInfo);
    
    // Ajouter quelques styles (largeur de colonne)
    infoSheet['!cols'] = [{ wch: 30 }, { wch: 50 }];
    
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Infos Bénéficiaire');
    
    // 2. Feuille des conventions
    if (beneficiaire.conventions && beneficiaire.conventions.length > 0) {
      const conventionsData = beneficiaire.conventions.map(c => {
        return {
          'Montant': (c.montant || 0).toLocaleString('fr-FR') + ' €',
          'Pourcentage Résultats': `${c.pourcentageResultats || 0} %`,
          'Date Envoi Avocat': c.dateEnvoiAvocat ? new Date(c.dateEnvoiAvocat).toLocaleDateString('fr-FR') : 'Non définie',
          'Date Envoi Bénéficiaire': c.dateEnvoiBeneficiaire ? new Date(c.dateEnvoiBeneficiaire).toLocaleDateString('fr-FR') : 'Non définie',
          'Date Validation FMG': c.dateValidationFMG ? new Date(c.dateValidationFMG).toLocaleDateString('fr-FR') : 'Non définie',
          'Avocat': c.avocat ? `Me ${c.avocat.prenom} ${c.avocat.nom}` : 'Non défini'
        };
      });
      
      const conventionsSheet = XLSX.utils.json_to_sheet(conventionsData);
      XLSX.utils.book_append_sheet(workbook, conventionsSheet, 'Conventions');
    } else {
      // Créer une feuille vide si aucune convention
      const emptyConventionsSheet = XLSX.utils.aoa_to_sheet([['Aucune convention trouvée']]);
      XLSX.utils.book_append_sheet(workbook, emptyConventionsSheet, 'Conventions');
    }
    
    // 3. Feuille des paiements
    if (beneficiaire.paiements && beneficiaire.paiements.length > 0) {
      const paiementsData = beneficiaire.paiements.map(p => {
        return {
          'Type': p.type,
          'Montant': (p.montant || 0).toLocaleString('fr-FR') + ' €',
          'Date': p.date ? new Date(p.date).toLocaleDateString('fr-FR') : 'Non définie',
          'Qualité Destinataire': p.qualiteDestinataire,
          'Identité Destinataire': p.identiteDestinataire,
          'Référence Pièce': p.referencePiece || 'Non définie',
          'Adresse Destinataire': p.adresseDestinataire || 'Non définie',
          'SIRET/RIDET': p.siretRidet || 'Non défini',
          'Titulaire Compte': p.titulaireCompte || 'Non défini',
          'Code Établissement': p.codeEtablissement || 'Non défini',
          'Code Guichet': p.codeGuichet || 'Non défini',
          'Numéro Compte': p.numeroCompte || 'Non défini',
          'Clé Vérification': p.cleVerification || 'Non définie'
        };
      });
      
      const paiementsSheet = XLSX.utils.json_to_sheet(paiementsData);
      XLSX.utils.book_append_sheet(workbook, paiementsSheet, 'Paiements');
    } else {
      // Créer une feuille vide si aucun paiement
      const emptyPaiementsSheet = XLSX.utils.aoa_to_sheet([['Aucun paiement trouvé']]);
      XLSX.utils.book_append_sheet(workbook, emptyPaiementsSheet, 'Paiements');
    }
    
    // Génération du buffer Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    // Configuration des en-têtes pour le téléchargement
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=beneficiaire_${beneficiaire.nom}_${beneficiaire.prenom}.xlsx`);
    
    // Envoi du fichier au client
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Erreur lors de l\'export Excel d\'un bénéficiaire:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export Excel', error: error.message });
  }
});

module.exports = router;