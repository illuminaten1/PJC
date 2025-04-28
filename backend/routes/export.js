const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const authMiddleware = require('../middleware/auth');
const Beneficiaire = require('../models/beneficiaire');
const Militaire = require('../models/militaire');
const Affaire = require('../models/affaire');

/**
 * @route   GET /api/export/beneficiaires
 * @desc    Exporter les bénéficiaires, conventions et paiements au format Excel avec styling
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
    
    // Fonctions d'aide pour le styling
    const applyHeaderStyles = (worksheet) => {
      // Obtenir les lettres des colonnes
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const lastCol = range.e.c;
      
      // Créer un style pour les en-têtes (première ligne)
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3F51B5" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
      
      // Appliquer le style d'en-tête à la première ligne
      for (let col = 0; col <= lastCol; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellRef]) continue;
        
        // Définir le style de la cellule
        worksheet[cellRef].s = headerStyle;
      }
      
      // Appliquer des bordures à toutes les cellules du tableau
      const dataCellStyle = {
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      };
      
      // Parcourir toutes les cellules sauf les en-têtes
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = 0; col <= lastCol; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellRef]) continue;
          
          // Définir le style de la cellule de données
          worksheet[cellRef].s = dataCellStyle;
        }
      }
      
      // Ajuster la largeur des colonnes pour qu'elles s'adaptent au contenu
      const wscols = [];
      for (let col = 0; col <= lastCol; col++) {
        let maxLen = 10; // Largeur minimale
        
        // Parcourir toutes les lignes pour trouver la longueur maximale
        for (let row = 0; row <= range.e.r; row++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (worksheet[cellRef] && worksheet[cellRef].v) {
            const cellValue = String(worksheet[cellRef].v);
            if (cellValue.length > maxLen) {
              maxLen = cellValue.length;
            }
          }
        }
        
        // Limiter la largeur maximale à 50 caractères
        maxLen = Math.min(maxLen + 2, 50);
        wscols.push({ wch: maxLen });
      }
      
      worksheet['!cols'] = wscols;
    };
    
    // Ajout de l'onglet Bénéficiaires avec style
    const wsBeneficiaires = XLSX.utils.json_to_sheet(beneficiairesData);
    applyHeaderStyles(wsBeneficiaires);
    XLSX.utils.book_append_sheet(wb, wsBeneficiaires, "Bénéficiaires");
    
    // Ajout de l'onglet Conventions avec style
    const wsConventions = XLSX.utils.json_to_sheet(conventionsData);
    applyHeaderStyles(wsConventions);
    XLSX.utils.book_append_sheet(wb, wsConventions, "Conventions");
    
    // Ajout de l'onglet Paiements avec style
    const wsPaiements = XLSX.utils.json_to_sheet(paiementsData);
    applyHeaderStyles(wsPaiements);
    XLSX.utils.book_append_sheet(wb, wsPaiements, "Paiements");
    
    // Définir des options de mise en forme
    const opts = {
      bookType: 'xlsx',
      bookSST: false,
      type: 'buffer',
      cellStyles: true
    };
    
    // Générer le buffer avec les styles
    const excelBuffer = XLSX.write(wb, opts);
    
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