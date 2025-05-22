const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const authMiddleware = require('../middleware/auth');
const Beneficiaire = require('../models/beneficiaire');
const Militaire = require('../models/militaire');
const Affaire = require('../models/affaire');

/**
 * @route   GET /api/export/beneficiaires
 * @desc    Exporter les bénéficiaires, conventions et paiements au format Excel avec styling avancé
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

    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();
    
    // Ajouter des propriétés au document
    workbook.creator = 'Protection Juridique Complémentaire';
    workbook.lastModifiedBy = 'Protection Juridique Complémentaire';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Style d'en-tête commun à toutes les feuilles
    const headerStyle = {
      font: { 
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: 'FFFFFF' }
      },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3F51B5' }
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle'
      },
      border: {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      }
    };
    
    // Style pour les cellules de données
    const dataCellStyle = {
      border: {
        top: { style: 'thin', color: { argb: 'D0D0D0' } },
        left: { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        right: { style: 'thin', color: { argb: 'D0D0D0' } }
      },
      font: {
        name: 'Calibri',
        size: 11
      }
    };
    
    // Style pour les lignes alternées (pour améliorer la lisibilité)
    const altRowStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F5F5F5' }
      }
    };
    
    // Fonction utilitaire pour appliquer les styles d'en-tête
    const applyHeaderRow = (worksheet, headers) => {
      // Ajouter les en-têtes
      const headerRow = worksheet.addRow(headers);
      
      // Appliquer le style à chaque cellule d'en-tête
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });
      
      // Figer la première ligne (en-têtes)
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    };
    
    // Fonction utilitaire pour appliquer les styles aux cellules de données
    const applyDataStyles = (worksheet) => {
      // Appliquer les styles aux cellules de données
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        
        // Appliquer le style de base à toutes les cellules
        row.eachCell((cell) => {
          cell.style = dataCellStyle;
        });
        
        // Appliquer le style alterné pour les lignes paires
        if (i % 2 === 0) {
          row.eachCell((cell) => {
            cell.style = {...dataCellStyle, ...altRowStyle};
          });
        }
      }
      
      // Ajuster la largeur des colonnes
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50); // Maximum 50 caractères
      });
    };
    
    // ------------------ ONGLET BÉNÉFICIAIRES ------------------
    const wsBeneficiaires = workbook.addWorksheet('Bénéficiaires');
    
    // Définir les en-têtes de l'onglet Bénéficiaires (avec nouvelles colonnes)
    const beneficiairesHeaders = [
      'Prénom', 'NOM', 'Qualité', 'Militaire créateur de droit', 'Unité', 'Région', 'Département',
      'Affaire', 'Date des faits', 'Lieu des faits', 'N° de décision', 'Date de décision',
      'Avocats', 'Rédacteur', 'Nb. Conventions', 'Nb. Paiements', 'Date de création'
    ];
    
    // Appliquer les en-têtes
    applyHeaderRow(wsBeneficiaires, beneficiairesHeaders);
    
    // Ajouter les données (avec nouvelles colonnes)
    beneficiaires.forEach(b => {
      const militaire = b.militaire || {};
      const affaire = militaire._id ? militaireAffaireMap[militaire._id.toString()] || {} : {};
      
      wsBeneficiaires.addRow([
        b.prenom || '',
        b.nom || '',
        b.qualite || '',
        militaire ? `${militaire.grade || ''} ${militaire.prenom || ''} ${militaire.nom || ''}`.trim() : '',
        militaire.unite || '',        // Nouvelle colonne
        militaire.region || '',       // Nouvelle colonne
        militaire.departement || '',  // Nouvelle colonne
        affaire.nom || '',
        formatDate(affaire.dateFaits),
        affaire.lieu || '',
        b.numeroDecision || '',
        formatDate(b.dateDecision),
        (b.avocats && b.avocats.length) ? 
          b.avocats.map(a => `${a.prenom || ''} ${a.nom || ''}`).join(', ') : '',
        affaire.redacteur || '',
        b.conventions ? b.conventions.length : 0,
        b.paiements ? b.paiements.length : 0,
        formatDate(b.dateCreation)
      ]);
    });
    
    // Appliquer les styles aux cellules de données
    applyDataStyles(wsBeneficiaires);
    
    // ------------------ ONGLET CONVENTIONS ------------------
    const wsConventions = workbook.addWorksheet('Conventions');
    
    // Définir les en-têtes de l'onglet Conventions
    const conventionsHeaders = [
      'Bénéficiaire', 'Qualité', 'Militaire', 'Avocat', 'Cabinet',
      'Montant', 'Pourcentage Résultats', 'Date Envoi Avocat',
      'Date Envoi Bénéficiaire', 'Date Validation FMG'
    ];
    
    // Appliquer les en-têtes
    applyHeaderRow(wsConventions, conventionsHeaders);
    
    // Ajouter les données avec formatage correct des nombres
    beneficiaires.forEach(b => {
      if (b.conventions && b.conventions.length > 0) {
        b.conventions.forEach(c => {
          const avocat = c.avocat && b.avocats ? 
            b.avocats.find(a => a._id.toString() === c.avocat.toString()) : null;
          
          wsConventions.addRow([
            `${b.prenom || ''} ${b.nom || ''}`.trim(),
            b.qualite || '',
            b.militaire ? `${b.militaire.grade || ''} ${b.militaire.prenom || ''} ${b.militaire.nom || ''}`.trim() : '',
            avocat ? `${avocat.prenom || ''} ${avocat.nom || ''}`.trim() : '',
            avocat ? avocat.cabinet || '' : '',
            c.montant || 0,  // Valeur numérique
            c.pourcentageResultats || 0,  // Valeur numérique (garder le nombre original)
            formatDate(c.dateEnvoiAvocat),
            formatDate(c.dateEnvoiBeneficiaire),
            formatDate(c.dateValidationFMG)
          ]);
        });
      }
    });
    
    // Appliquer d'abord les styles de base
    applyDataStyles(wsConventions);
    
    // PUIS appliquer le formatage spécifique aux colonnes numériques
    for (let i = 2; i <= wsConventions.rowCount; i++) {
      const row = wsConventions.getRow(i);
      
      // Colonne 6 : Montant (format euro)
      const montantCell = row.getCell(6);
      if (montantCell.value && typeof montantCell.value === 'number') {
        montantCell.numFmt = '#,##0.00 "€"';
      }
      
      // Colonne 7 : Pourcentage (format pourcentage)
      const pourcentageCell = row.getCell(7);
      if (pourcentageCell.value && typeof pourcentageCell.value === 'number') {
        // Convertir en décimal pour Excel (15 devient 0.15)
        pourcentageCell.value = pourcentageCell.value / 100;
        pourcentageCell.numFmt = '0.00%';
      }
    }
    
    // ------------------ ONGLET PAIEMENTS ------------------
    const wsPaiements = workbook.addWorksheet('Paiements');
    
    // Définir les en-têtes de l'onglet Paiements (retour à une seule colonne montant)
    const paiementsHeaders = [
      'Bénéficiaire', 'Qualité', 'Type', 'Montant', 'Date',
      'Qualité Destinataire', 'Identité Destinataire', 'Référence Pièce',
      'Adresse Destinataire', 'SIRET/RIDET', 'Titulaire Compte',
      'Code Établissement', 'Code Guichet', 'Numéro Compte', 'Clé Vérification'
    ];
    
    // Appliquer les en-têtes
    applyHeaderRow(wsPaiements, paiementsHeaders);
    
    // Ajouter les données
    beneficiaires.forEach(b => {
      if (b.paiements && b.paiements.length > 0) {
        b.paiements.forEach(p => {
          wsPaiements.addRow([
            `${b.prenom || ''} ${b.nom || ''}`.trim(),
            b.qualite || '',
            p.type || '',
            p.montant || 0,  // Valeur numérique
            formatDate(p.date),
            p.qualiteDestinataire || '',
            p.identiteDestinataire || '',
            p.referencePiece || '',
            p.adresseDestinataire || '',
            p.siretRidet || '',
            p.titulaireCompte || '',
            p.codeEtablissement || '',
            p.codeGuichet || '',
            p.numeroCompte || '',
            p.cleVerification || ''
          ]);
        });
      }
    });
    
    // Appliquer d'abord les styles de base
    applyDataStyles(wsPaiements);
    
    // PUIS appliquer le formatage spécifique à la colonne montant
    for (let i = 2; i <= wsPaiements.rowCount; i++) {
      const row = wsPaiements.getRow(i);
      
      // Colonne 4 : Montant (format euro)
      const montantCell = row.getCell(4);
      if (montantCell.value && typeof montantCell.value === 'number') {
        montantCell.numFmt = '#,##0.00 "€"';
      }
    }
    
    // Générer le fichier et l'envoyer comme réponse HTTP
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=beneficiaires-export.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du fichier Excel' 
    });
  }
});

module.exports = router;