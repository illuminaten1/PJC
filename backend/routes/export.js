const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const authMiddleware = require('../middleware/auth');
const Beneficiaire = require('../models/beneficiaire');
const Militaire = require('../models/militaire');
const Affaire = require('../models/affaire');

/**
 * @route   GET /api/export/beneficiaires
 * @desc    Exporter les bénéficiaires, conventions et paiements au format Excel
 * @access  Privé
 */
router.get('/beneficiaires', authMiddleware, async (req, res) => {
  try {
    // Récupérer tous les bénéficiaires avec leurs conventions et paiements
    const beneficiaires = await Beneficiaire.find({ archive: false })
      .populate('militaire')
      .populate('avocats')
      .lean();

    // Récupérer les militaires avec leurs affaires pour avoir accès au rédacteur
    const militaireIds = [...new Set(beneficiaires.map(b => b.militaire?._id))].filter(id => id);
    const militaires = await Militaire.find({ _id: { $in: militaireIds } })
      .populate('affaire')
      .lean();

    // Créer un mapping des militaires vers leurs affaires pour faciliter l'accès
    const militaireAffaireMap = {};
    militaires.forEach(m => {
      if (m._id && m.affaire) {
        militaireAffaireMap[m._id.toString()] = m.affaire;
      }
    });

    // Fonction pour formater une date en format français
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('fr-FR');
    };

    // Préparation des données pour l'onglet Bénéficiaires
    const beneficiairesData = beneficiaires.map(b => {
      const militaire = b.militaire || {};
      const affaire = militaire._id ? militaireAffaireMap[militaire._id.toString()] || {} : {};
      
      return {
        'Prénom': b.prenom || '',
        'NOM': b.nom || '',
        'Qualité': b.qualite || '',
        'Militaire créateur de droit': militaire ? `${militaire.grade || ''} ${militaire.prenom || ''} ${militaire.nom || ''}`.trim() : '',
        'Affaire': affaire.nom || '',
        'Date des faits': formatDate(affaire.dateFaits),
        'Lieu des faits': affaire.lieu || '',
        'N° de décision': b.numeroDecision || '',
        'Date de décision': formatDate(b.dateDecision),
        'Avocats': (b.avocats && b.avocats.length) ? 
          b.avocats.map(a => `${a.prenom || ''} ${a.nom || ''}`).join(', ') : '',
        'Rédacteur': affaire.redacteur || '',
        'Nb. Conventions': b.conventions ? b.conventions.length : 0,
        'Nb. Paiements': b.paiements ? b.paiements.length : 0,
        'Date de création': formatDate(b.dateCreation)
      };
    });

    // Préparation des données pour l'onglet Conventions
    let conventionsData = [];
    beneficiaires.forEach(b => {
      if (b.conventions && b.conventions.length > 0) {
        b.conventions.forEach(c => {
          const avocat = c.avocat && b.avocats ? 
            b.avocats.find(a => a._id.toString() === c.avocat.toString()) : null;
          
          conventionsData.push({
            'Bénéficiaire': `${b.prenom || ''} ${b.nom || ''}`.trim(),
            'Qualité': b.qualite || '',
            'Militaire': b.militaire ? `${b.militaire.grade || ''} ${b.militaire.prenom || ''} ${b.militaire.nom || ''}`.trim() : '',
            'Avocat': avocat ? `${avocat.prenom || ''} ${avocat.nom || ''}`.trim() : '',
            'Cabinet': avocat ? avocat.cabinet || '' : '',
            'Montant': c.montant ? `${c.montant.toLocaleString('fr-FR')} €` : '',
            'Pourcentage Résultats': c.pourcentageResultats ? `${c.pourcentageResultats}%` : '',
            'Date Envoi Avocat': formatDate(c.dateEnvoiAvocat),
            'Date Envoi Bénéficiaire': formatDate(c.dateEnvoiBeneficiaire),
            'Date Validation FMG': formatDate(c.dateValidationFMG)
          });
        });
      }
    });

    // Préparation des données pour l'onglet Paiements
    let paiementsData = [];
    beneficiaires.forEach(b => {
      if (b.paiements && b.paiements.length > 0) {
        b.paiements.forEach(p => {
          paiementsData.push({
            'Bénéficiaire': `${b.prenom || ''} ${b.nom || ''}`.trim(),
            'Qualité': b.qualite || '',
            'Type': p.type || '',
            'Montant': p.montant ? `${p.montant.toLocaleString('fr-FR')} €` : '',
            'Date': formatDate(p.date),
            'Qualité Destinataire': p.qualiteDestinataire || '',
            'Identité Destinataire': p.identiteDestinataire || '',
            'Référence Pièce': p.referencePiece || '',
            'Adresse Destinataire': p.adresseDestinataire || '',
            'SIRET/RIDET': p.siretRidet || '',
            'Titulaire Compte': p.titulaireCompte || '',
            'Code Établissement': p.codeEtablissement || '',
            'Code Guichet': p.codeGuichet || '',
            'Numéro Compte': p.numeroCompte || '',
            'Clé Vérification': p.cleVerification || ''
          });
        });
      }
    });

    // Création du workbook Excel
    const wb = XLSX.utils.book_new();
    
    // Style des en-têtes
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3F51B5" } },
      alignment: { horizontal: "center" }
    };

    // Ajout de l'onglet Bénéficiaires
    const wsBeneficiaires = XLSX.utils.json_to_sheet(beneficiairesData);
    XLSX.utils.book_append_sheet(wb, wsBeneficiaires, "Bénéficiaires");

    // Ajout de l'onglet Conventions
    const wsConventions = XLSX.utils.json_to_sheet(conventionsData);
    XLSX.utils.book_append_sheet(wb, wsConventions, "Conventions");

    // Ajout de l'onglet Paiements
    const wsPaiements = XLSX.utils.json_to_sheet(paiementsData);
    XLSX.utils.book_append_sheet(wb, wsPaiements, "Paiements");

    // Générer le buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Définir les headers de la réponse
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=beneficiaires-export.xlsx');
    
    // Envoyer le fichier
    res.send(excelBuffer);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du fichier Excel' 
    });
  }
});

module.exports = router;