import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Capture un élément HTML spécifique pour le PDF avec compression optimisée
 * @param {HTMLElement} element L'élément à capturer
 * @param {number} scale Facteur d'échelle (1 = taille originale)
 * @param {number} quality Qualité de l'image (0-1)
 * @returns {Promise<string>} L'URL de données de l'image
 */
const captureElementOptimized = async (element, scale = 1.5, quality = 0.6) => {
  if (!element) return null;
  
  try {
    // Créer temporairement une copie allégée de l'élément si nécessaire
    const tempElement = element.cloneNode(true);
    
    // Simplifier les styles pour la capture si nécessaire
    const simplifyStyles = (el) => {
      // Supprimer les ombres, animations et effets lourds pour la capture
      const allElements = el.querySelectorAll('*');
      allElements.forEach(node => {
        if (node.style) {
          node.style.boxShadow = 'none';
          node.style.textShadow = 'none';
          node.style.animation = 'none';
          node.style.transition = 'none';
        }
      });
    };
    
    // Appliquer les optimisations aux grands éléments seulement
    if (element.offsetWidth > 500 || element.offsetHeight > 500) {
      simplifyStyles(tempElement);
    }
    
    // Utiliser une échelle réduite pour la capture
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Utiliser un format JPEG plutôt que PNG pour les grandes images
    // (PNG est sans perte mais beaucoup plus lourd)
    return canvas.toDataURL('image/jpeg', quality);
  } catch (error) {
    console.error("Erreur lors de la capture de l'élément:", error);
    return null;
  }
};

/**
 * Exporte les données au format Excel
 * @param {Object} data Les données à exporter
 * @param {Object} options Les options d'export
 */
export const exportToExcel = async (data, options) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PJC Application';
    workbook.lastModifiedBy = 'PJC Application';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Styles communs pour les tableaux
    const headerStyle = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3F51B5' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };
    
    // Style pour les cellules d'année
    const yearStyle = {
      font: { bold: true, color: { argb: 'FF3F51B5' } },
      alignment: { horizontal: 'center' },
      border: {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      }
    };
    
    // Style pour les cellules de données
    const dataStyle = {
      alignment: { horizontal: 'right' },
      border: {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      }
    };
    
    // Style pour les totaux
    const totalStyle = {
      font: { bold: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } },
      alignment: { horizontal: 'right' },
      border: {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      }
    };

    // Feuille des statistiques globales
    const globalSheet = workbook.addWorksheet('Statistiques Globales');
    
    // 1. Tableau Bénéficiaires - Conventions
    globalSheet.mergeCells('A1:C1');
    globalSheet.getCell('A1').value = 'Bénéficiaires - Conventions';
    globalSheet.getCell('A1').font = { bold: true, size: 14 };
    globalSheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // En-têtes
    globalSheet.getCell('A2').value = 'Année';
    globalSheet.getCell('B2').value = 'Nombre de bénéficiaires';
    globalSheet.getCell('C2').value = 'Nombre de conventions';
    
    // Appliquer le style d'en-tête
    ['A2', 'B2', 'C2'].forEach(cell => {
      Object.assign(globalSheet.getCell(cell), headerStyle);
    });
    
    // Largeur des colonnes
    globalSheet.getColumn('A').width = 15;
    globalSheet.getColumn('B').width = 25;
    globalSheet.getColumn('C').width = 25;
    
    // Données
    let row = 3;
    const years = Object.keys(data.global.parAnnee).sort((a, b) => parseInt(a) - parseInt(b));
    
    years.forEach(year => {
      const yearData = data.global.parAnnee[year];
      
      globalSheet.getCell(`A${row}`).value = parseInt(year);
      globalSheet.getCell(`B${row}`).value = yearData.nbBeneficiaires || 0;
      globalSheet.getCell(`C${row}`).value = yearData.nbConventions || 0;
      
      // Appliquer les styles
      globalSheet.getCell(`A${row}`).style = yearStyle;
      globalSheet.getCell(`B${row}`).style = dataStyle;
      globalSheet.getCell(`C${row}`).style = dataStyle;
      
      row++;
    });
    
    // Totaux
    globalSheet.getCell(`A${row}`).value = 'TOTAL';
    globalSheet.getCell(`B${row}`).value = data.global.totals.nbBeneficiaires;
    globalSheet.getCell(`C${row}`).value = data.global.totals.nbConventions;
    
    // Appliquer le style total
    globalSheet.getCell(`A${row}`).style = totalStyle;
    globalSheet.getCell(`B${row}`).style = totalStyle;
    globalSheet.getCell(`C${row}`).style = totalStyle;
    
    // Ajouter un peu d'espace
    row += 2;
    
    // 2. Tableau Montant Total Gagé
    globalSheet.mergeCells(`A${row}:C${row}`);
    globalSheet.getCell(`A${row}`).value = 'Montant Total Gagé';
    globalSheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    globalSheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
    
    row++;
    
    // En-têtes
    globalSheet.getCell(`A${row}`).value = 'Année';
    globalSheet.getCell(`B${row}`).value = 'Montant total gagé HT';
    globalSheet.getCell(`C${row}`).value = 'Montant total gagé TTC';
    
    // Appliquer le style d'en-tête
    [`A${row}`, `B${row}`, `C${row}`].forEach(cell => {
      Object.assign(globalSheet.getCell(cell), headerStyle);
    });
    
    row++;
    
    // Données
    years.forEach(year => {
      const yearData = data.global.parAnnee[year];
      const montantHT = yearData.montantGageHT || 0;
      const montantTTC = montantHT * 1.2;
      
      globalSheet.getCell(`A${row}`).value = parseInt(year);
      globalSheet.getCell(`B${row}`).value = montantHT;
      globalSheet.getCell(`C${row}`).value = montantTTC;
      
      // Format monétaire
      globalSheet.getCell(`B${row}`).numFmt = '#,##0.00 €';
      globalSheet.getCell(`C${row}`).numFmt = '#,##0.00 €';
      
      // Appliquer les styles
      globalSheet.getCell(`A${row}`).style = yearStyle;
      globalSheet.getCell(`B${row}`).style = dataStyle;
      globalSheet.getCell(`C${row}`).style = dataStyle;
      
      row++;
    });
    
    // Totaux
    globalSheet.getCell(`A${row}`).value = 'TOTAL';
    globalSheet.getCell(`B${row}`).value = data.global.totals.montantGageHT;
    globalSheet.getCell(`C${row}`).value = data.global.totals.montantGageHT * 1.2;
    
    // Format monétaire
    globalSheet.getCell(`B${row}`).numFmt = '#,##0.00 €';
    globalSheet.getCell(`C${row}`).numFmt = '#,##0.00 €';
    
    // Appliquer le style total
    globalSheet.getCell(`A${row}`).style = totalStyle;
    globalSheet.getCell(`B${row}`).style = totalStyle;
    globalSheet.getCell(`C${row}`).style = totalStyle;
    
    // Ajouter un peu d'espace
    row += 2;
    
    // 3. Tableau Dépenses Ordonnées
    globalSheet.mergeCells(`A${row}:C${row}`);
    globalSheet.getCell(`A${row}`).value = 'Dépenses Ordonnées';
    globalSheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    globalSheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
    
    row++;
    
    // En-têtes
    globalSheet.getCell(`A${row}`).value = 'Année';
    globalSheet.getCell(`B${row}`).value = 'Nombre de règlements';
    globalSheet.getCell(`C${row}`).value = 'Montant total ordonné TTC';
    
    // Appliquer le style d'en-tête
    [`A${row}`, `B${row}`, `C${row}`].forEach(cell => {
      Object.assign(globalSheet.getCell(cell), headerStyle);
    });
    
    row++;
    
    // Données
    years.forEach(year => {
      const yearData = data.global.parAnnee[year];
      
      globalSheet.getCell(`A${row}`).value = parseInt(year);
      globalSheet.getCell(`B${row}`).value = yearData.nbReglements || 0;
      globalSheet.getCell(`C${row}`).value = yearData.montantPaye || 0;
      
      // Format monétaire
      globalSheet.getCell(`C${row}`).numFmt = '#,##0.00 €';
      
      // Appliquer les styles
      globalSheet.getCell(`A${row}`).style = yearStyle;
      globalSheet.getCell(`B${row}`).style = dataStyle;
      globalSheet.getCell(`C${row}`).style = dataStyle;
      
      row++;
    });
    
    // Totaux
    globalSheet.getCell(`A${row}`).value = 'TOTAL';
    globalSheet.getCell(`B${row}`).value = data.global.totals.nbReglements;
    globalSheet.getCell(`C${row}`).value = data.global.totals.montantPaye;
    
    // Format monétaire
    globalSheet.getCell(`C${row}`).numFmt = '#,##0.00 €';
    
    // Appliquer le style total
    globalSheet.getCell(`A${row}`).style = totalStyle;
    globalSheet.getCell(`B${row}`).style = totalStyle;
    globalSheet.getCell(`C${row}`).style = totalStyle;
    
    // Si les statistiques annuelles sont demandées
    if (options.includeAnnualStats && data.annual) {
      // Créer une nouvelle feuille pour l'année sélectionnée
      const anneeSheetName = options.annee === -1 ? 'Statistiques Toutes Années' : `Statistiques ${options.annee}`;
      const annualSheet = workbook.addWorksheet(anneeSheetName);
      
      // Titre
      annualSheet.mergeCells('A1:D1');
      const anneeText = options.annee === -1 ? 'toutes les années' : `l'année ${options.annee}`;
      annualSheet.getCell('A1').value = `Statistiques pour ${anneeText}`;
      annualSheet.getCell('A1').font = { bold: true, size: 16 };
      annualSheet.getCell('A1').alignment = { horizontal: 'center' };
      
      // Espacement
      annualSheet.getRow(2).height = 20;
      
      // 1. Finances
      annualSheet.mergeCells('A3:B3');
      annualSheet.getCell('A3').value = 'Finances';
      annualSheet.getCell('A3').font = { bold: true, size: 14 };
      
      // Données finances
      annualSheet.getCell('A4').value = 'Budget engagé (HT)';
      annualSheet.getCell('B4').value = data.annual.finances.montantGage || 0;
      annualSheet.getCell('B4').numFmt = '#,##0.00 €';
      
      annualSheet.getCell('A5').value = 'Nombre de conventions';
      annualSheet.getCell('B5').value = data.annual.finances.nbConventions || 0;
      
      annualSheet.getCell('A6').value = 'Montant payé (TTC)';
      annualSheet.getCell('B6').value = data.annual.finances.montantPaye || 0;
      annualSheet.getCell('B6').numFmt = '#,##0.00 €';
      
      // Style
      ['A4', 'A5', 'A6'].forEach(cell => {
        annualSheet.getCell(cell).font = { bold: true };
      });
      
      // Largeur des colonnes
      annualSheet.getColumn('A').width = 30;
      annualSheet.getColumn('B').width = 20;
      
      // Espacement
      annualSheet.getRow(7).height = 20;
      
      // 2. Affaires
      annualSheet.mergeCells('A8:B8');
      annualSheet.getCell('A8').value = 'Affaires';
      annualSheet.getCell('A8').font = { bold: true, size: 14 };
      
      annualSheet.getCell('A9').value = 'Nombre total d\'affaires';
      annualSheet.getCell('B9').value = data.annual.affaires.total || 0;
      annualSheet.getCell('A9').font = { bold: true };
      
      // Espacement
      annualSheet.getRow(10).height = 20;
      
      // Créer une ligne de titre commune pour les répartitions
        annualSheet.mergeCells('A11:H11');
        annualSheet.getCell('A11').value = 'Répartitions détaillées';
        annualSheet.getCell('A11').font = { bold: true, size: 16 };
        annualSheet.getCell('A11').alignment = { horizontal: 'center' };

        // Espacement
        annualSheet.getRow(12).height = 10;

        // Si l'option est activée pour la répartition par rédacteur
        if (options.includeRedacteurTable && Object.keys(data.annual.parRedacteur).length > 0) {
        // Titre de la section rédacteurs (colonne A)
        annualSheet.mergeCells('A13:C13');
        annualSheet.getCell('A13').value = 'Répartition par rédacteur';
        annualSheet.getCell('A13').font = { bold: true, size: 14 };

        // En-têtes du tableau
        annualSheet.getCell('A14').value = 'Rédacteur';
        annualSheet.getCell('B14').value = 'Bénéficiaires';
        annualSheet.getCell('C14').value = 'Pourcentage';

        // Style d'en-tête
        ['A14', 'B14', 'C14'].forEach(cell => {
            Object.assign(annualSheet.getCell(cell), headerStyle);
        });

        // Largeur de colonne
        annualSheet.getColumn('A').width = 30;
        annualSheet.getColumn('B').width = 15;
        annualSheet.getColumn('C').width = 15;

        // Calcul du total
        const totalRedacteurs = Object.values(data.annual.parRedacteur).reduce((a, b) => a + b, 0);

        // Données
        let redRow = 15;
        const redacteurEntries = Object.entries(data.annual.parRedacteur)
            .sort((a, b) => b[1] - a[1]); // Tri par nombre décroissant

        // Assurez-vous d'afficher tous les rédacteurs
        redacteurEntries.forEach(([redacteur, count]) => {
            const percentage = totalRedacteurs > 0 ? (count / totalRedacteurs) * 100 : 0;
            
            annualSheet.getCell(`A${redRow}`).value = redacteur;
            annualSheet.getCell(`B${redRow}`).value = count;
            annualSheet.getCell(`C${redRow}`).value = percentage / 100; // Format pourcentage
            annualSheet.getCell(`C${redRow}`).numFmt = '0.0%';
            
            redRow++;
        });
        }

        // Si l'option est activée pour la répartition par circonstance
        if (options.includeCirconstanceTable && Object.keys(data.annual.parCirconstance).length > 0) {
        // Titre de la section circonstances (colonne E)
        annualSheet.mergeCells('E13:G13');
        annualSheet.getCell('E13').value = 'Répartition par circonstance';
        annualSheet.getCell('E13').font = { bold: true, size: 14 };

        // En-têtes du tableau
        annualSheet.getCell('E14').value = 'Circonstance';
        annualSheet.getCell('F14').value = 'Militaires';
        annualSheet.getCell('G14').value = 'Pourcentage';

        // Style d'en-tête
        ['E14', 'F14', 'G14'].forEach(cell => {
            Object.assign(annualSheet.getCell(cell), headerStyle);
        });

        // Largeur de colonne
        annualSheet.getColumn('E').width = 30;
        annualSheet.getColumn('F').width = 15;
        annualSheet.getColumn('G').width = 15;

        // Calcul du total
        const totalCirconstances = Object.values(data.annual.parCirconstance).reduce((a, b) => a + b, 0);

        // Données
        let circRow = 15;
        const circonstanceEntries = Object.entries(data.annual.parCirconstance)
            .sort((a, b) => b[1] - a[1]); // Tri par nombre décroissant

        // Assurez-vous d'afficher toutes les circonstances
        circonstanceEntries.forEach(([circonstance, count]) => {
            const percentage = totalCirconstances > 0 ? (count / totalCirconstances) * 100 : 0;
            
            annualSheet.getCell(`E${circRow}`).value = circonstance;
            annualSheet.getCell(`F${circRow}`).value = count;
            annualSheet.getCell(`G${circRow}`).value = percentage / 100; // Format pourcentage
            annualSheet.getCell(`G${circRow}`).numFmt = '0.0%';
            
            circRow++;
        });
        }
      
      // Ajouter une nouvelle feuille pour les données budgétaires si disponibles
      if (data.annual.budget && data.annual.budget.parMois && data.annual.budget.parMois.length > 0) {
        const budgetSheetName = options.annee === -1 ? 'Budget Toutes Années' : `Budget ${options.annee}`;
        const budgetSheet = workbook.addWorksheet(budgetSheetName);
        
        // Titre
        budgetSheet.mergeCells('A1:E1');
        const budgetAnneeText = options.annee === -1 ? 'toutes années' : options.annee;
        budgetSheet.getCell('A1').value = `Suivi budgétaire ${budgetAnneeText}`;
        budgetSheet.getCell('A1').font = { bold: true, size: 16 };
        budgetSheet.getCell('A1').alignment = { horizontal: 'center' };
        
        // Espacement
        budgetSheet.getRow(2).height = 20;
        
        // Synthèse annuelle
        budgetSheet.mergeCells('A3:C3');
        const syntheseAnneeText = options.annee === -1 ? 'toutes années' : options.annee;
        budgetSheet.getCell('A3').value = `Synthèse annuelle ${syntheseAnneeText}`;
        budgetSheet.getCell('A3').font = { bold: true, size: 14 };
        
        // Données de synthèse
        budgetSheet.getCell('A4').value = 'Total engagé (HT)';
        budgetSheet.getCell('B4').value = data.annual.budget.totaux.montantGage || 0;
        budgetSheet.getCell('B4').numFmt = '#,##0.00 €';
        
        budgetSheet.getCell('A5').value = 'Total payé (TTC)';
        budgetSheet.getCell('B5').value = data.annual.budget.totaux.montantPaye || 0;
        budgetSheet.getCell('B5').numFmt = '#,##0.00 €';
        
        budgetSheet.getCell('A6').value = 'Ratio payé/engagé';
        budgetSheet.getCell('B6').value = data.annual.budget.totaux.ratio || 0;
        budgetSheet.getCell('B6').numFmt = '0.00 %';
        
        // Style des titres de la synthèse
        ['A4', 'A5', 'A6'].forEach(cell => {
          budgetSheet.getCell(cell).font = { bold: true };
        });
        
        // Largeur des colonnes
        budgetSheet.getColumn('A').width = 20;
        budgetSheet.getColumn('B').width = 15;
        budgetSheet.getColumn('C').width = 20;
        budgetSheet.getColumn('D').width = 15;
        budgetSheet.getColumn('E').width = 20;
        
        // Espacement
        budgetSheet.getRow(7).height = 20;
        
        // Tableau des données mensuelles
        budgetSheet.mergeCells('A8:E8');
        budgetSheet.getCell('A8').value = 'Répartition mensuelle des dépenses';
        budgetSheet.getCell('A8').font = { bold: true, size: 14 };
        budgetSheet.getCell('A8').alignment = { horizontal: 'center' };
        
        // En-têtes du tableau
        budgetSheet.getCell('A9').value = 'Mois';
        budgetSheet.getCell('B9').value = 'Montant engagé HT';
        budgetSheet.getCell('C9').value = 'Nombre de conventions';
        budgetSheet.getCell('D9').value = 'Montant payé TTC';
        budgetSheet.getCell('E9').value = 'Nombre de paiements';
        
        // Style des en-têtes
        ['A9', 'B9', 'C9', 'D9', 'E9'].forEach(cell => {
          Object.assign(budgetSheet.getCell(cell), headerStyle);
        });
        
        // Données mensuelles
        let row = 10;
        data.annual.budget.parMois.forEach(mois => {
          budgetSheet.getCell(`A${row}`).value = mois.nomMois;
          budgetSheet.getCell(`B${row}`).value = mois.gage.montant || 0;
          budgetSheet.getCell(`B${row}`).numFmt = '#,##0.00 €';
          budgetSheet.getCell(`C${row}`).value = mois.gage.nombre || 0;
          budgetSheet.getCell(`D${row}`).value = mois.paye.montant || 0;
          budgetSheet.getCell(`D${row}`).numFmt = '#,##0.00 €';
          budgetSheet.getCell(`E${row}`).value = mois.paye.nombre || 0;
          
          row++;
        });
        
        // Ligne des totaux
        budgetSheet.getCell(`A${row}`).value = 'Total';
        budgetSheet.getCell(`B${row}`).value = data.annual.budget.totaux.montantGage || 0;
        budgetSheet.getCell(`B${row}`).numFmt = '#,##0.00 €';
        budgetSheet.getCell(`C${row}`).value = data.annual.budget.parMois.reduce((sum, mois) => sum + (mois.gage.nombre || 0), 0);
        budgetSheet.getCell(`D${row}`).value = data.annual.budget.totaux.montantPaye || 0;
        budgetSheet.getCell(`D${row}`).numFmt = '#,##0.00 €';
        budgetSheet.getCell(`E${row}`).value = data.annual.budget.parMois.reduce((sum, mois) => sum + (mois.paye.nombre || 0), 0);
        
        // Style de la ligne des totaux
        [`A${row}`, `B${row}`, `C${row}`, `D${row}`, `E${row}`].forEach(cell => {
          Object.assign(budgetSheet.getCell(cell), totalStyle);
        });
      }
    }
    
    // Générer le fichier Excel et le télécharger
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `statistiques_pjc_${options.includeAnnualStats ? `avec_${options.annee}_` : ''}${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw error;
  }
};

/**
 * Exporte les données au format PDF avec une taille optimisée
 * @param {HTMLElement} element L'élément HTML à capturer pour le PDF
 * @param {Object} data Les données exportées (pour les titres)
 * @param {Object} options Les options d'export
 */
export const exportToPDF = async (element, data, options) => {
  try {
    if (!element) {
      throw new Error("Élément DOM non trouvé pour la capture PDF");
    }
    
    // Créer un document PDF au format paysage A4 avec compression
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true  // Activer la compression PDF
    });
    
    // Ajouter un titre au document
    pdf.setFontSize(20);
    pdf.setTextColor(63, 81, 181); // Couleur primaire #3f51b5
    pdf.text('Statistiques Protection Juridique Complémentaire', 149, 15, { align: 'center' });
    
    // Date de génération
    const dateStr = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120); // Gris
    pdf.text(`Généré le ${dateStr}`, 149, 22, { align: 'center' });
    
    // 1. Capture de la section des statistiques globales avec qualité réduite
    const globalStatsSection = element.querySelector('section');
    
    if (globalStatsSection) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Synthèse globale depuis la mise en place du dispositif', 20, 35);
      
      // Utiliser une échelle inférieure et une compression d'image
      const globalImgData = await captureElementOptimized(globalStatsSection, 1.5, 0.7);
      
      if (globalImgData) {
        // Créer une image temporaire pour obtenir les dimensions
        const img = new Image();
        img.src = globalImgData;
        
        await new Promise(resolve => {
          img.onload = resolve;
        });
        
        // Ajuster la taille pour s'adapter à la page
        const imgWidth = 260;
        const imgHeight = (img.height * imgWidth) / img.width;
        
        pdf.addImage(globalImgData, 'JPEG', 20, 40, imgWidth, imgHeight);
      }
      
      // Si les stats annuelles sont demandées, ajouter une page
      if (options.includeAnnualStats) {
        pdf.addPage();
        
        pdf.setFontSize(20);
        pdf.setTextColor(63, 81, 181);
        pdf.text(`Statistiques détaillées - Année ${options.annee}`, 149, 15, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`Généré le ${dateStr}`, 149, 22, { align: 'center' });
        
        // Trouver les cartes de statistiques annuelles
        const annualStatsSummary = element.querySelector('.summary-cards');
        const budgetSection = element.querySelector('.budget-section');
        
        let yOffset = 35;
        
        if (annualStatsSummary) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`Synthèse des statistiques ${options.annee}`, 20, yOffset);
          
          const summaryImgData = await captureElementOptimized(annualStatsSummary, 1.5, 0.7);
          
          if (summaryImgData) {
            // Créer une image temporaire pour obtenir les dimensions
            const img = new Image();
            img.src = summaryImgData;
            
            await new Promise(resolve => {
              img.onload = resolve;
            });
            
            // Ajuster la taille
            const summaryWidth = 260;
            const summaryHeight = (img.height * summaryWidth) / img.width;
            
            yOffset += 5;
            pdf.addImage(summaryImgData, 'JPEG', 20, yOffset, summaryWidth, summaryHeight);
            
            yOffset += summaryHeight + 15;
          }
        }
        
        // Optimisation pour la section budget: capturer en une seule fois si possible
        if (budgetSection) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`Suivi budgétaire ${options.annee}`, 20, yOffset);
          
          // Capture d'abord le graphique et la synthèse
          const budgetChart = budgetSection.querySelector('.budget-chart');
          const budgetSummary = budgetSection.querySelector('.budget-summary');
          const budgetTable = budgetSection.querySelector('.budget-detail-table');
          
          // Capture le graphique (qualité légèrement meilleure)
          if (budgetChart) {
            const chartImgData = await captureElementOptimized(budgetChart, 1.5, 0.7);
            
            if (chartImgData) {
              const chartImg = new Image();
              chartImg.src = chartImgData;
              
              await new Promise(resolve => {
                chartImg.onload = resolve;
              });
              
              const chartWidth = 260;
              const chartHeight = (chartImg.height * chartWidth) / chartImg.width;
              
              yOffset += 5;
              pdf.addImage(chartImgData, 'JPEG', 20, yOffset, chartWidth, chartHeight);
              
              yOffset += chartHeight + 10;
            }
          }
          
          // Capture le résumé (cartes de synthèse)
          if (budgetSummary) {
            // Vérifier si nous avons assez d'espace sur la page actuelle
            if (yOffset > 160) { // Si espace insuffisant après le graphique, ajouter une page
              pdf.addPage();
              yOffset = 20;
            }
            
            const summaryImgData = await captureElementOptimized(budgetSummary, 1.3, 0.7);
            
            if (summaryImgData) {
              const summaryImg = new Image();
              summaryImg.src = summaryImgData;
              
              await new Promise(resolve => {
                summaryImg.onload = resolve;
              });
              
              const summaryWidth = 260;
              const summaryHeight = (summaryImg.height * summaryWidth) / summaryImg.width;
              
              pdf.addImage(summaryImgData, 'JPEG', 20, yOffset, summaryWidth, summaryHeight);
              
              yOffset += summaryHeight + 10;
            }
          }
          
          // Toujours mettre le tableau sur une nouvelle page
          if (budgetTable) {
            pdf.addPage();
            
            // Titre de la page du tableau
            pdf.setFontSize(16);
            pdf.setTextColor(63, 81, 181);
            pdf.text(`Détail mensuel du budget ${options.annee}`, 149, 15, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(120, 120, 120);
            const dateStr = new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            pdf.text(`Généré le ${dateStr}`, 149, 22, { align: 'center' });
            
            const tableImgData = await captureElementOptimized(budgetTable, 1.3, 0.75); // Légère augmentation de qualité
            
            if (tableImgData) {
              const tableImg = new Image();
              tableImg.src = tableImgData;
              
              await new Promise(resolve => {
                tableImg.onload = resolve;
              });
              
              const tableWidth = 260;
              const tableHeight = (tableImg.height * tableWidth) / tableImg.width;
              
              // Centrer sur la page avec un peu plus d'espace en haut
              pdf.addImage(tableImgData, 'JPEG', 20, 30, tableWidth, tableHeight);
            }
          }
        }
        
        // Si demandé, ajouter les tableaux de répartition
        if (options.includeRedacteurTable || options.includeCirconstanceTable) {
          // Toujours ajouter une nouvelle page pour les tableaux de répartition
          pdf.addPage();
          
          // Ajouter le titre en haut de la page avec un espacement suffisant
          pdf.setFontSize(16);
          pdf.setTextColor(63, 81, 181);
          pdf.text('Répartitions détaillées', 149, 15, { align: 'center' });
          
          pdf.setFontSize(10);
          pdf.setTextColor(120, 120, 120);
          pdf.text(`Année ${options.annee}`, 149, 22, { align: 'center' });
          
          // Commencer les tableaux plus bas pour laisser de l'espace au titre
          let yOffset = 35;
          
          // Optimisation: Capture combinée si les deux tableaux sont inclus
          if (options.includeRedacteurTable && options.includeCirconstanceTable) {
            const tableContainer = element.querySelector('.tables-container') || element.querySelector('.charts-container');
            
            if (tableContainer) {
              // Essayer de capturer les deux tableaux en une seule fois
              const tableImgData = await captureElementOptimized(tableContainer, 1.2, 0.7);
              
              if (tableImgData) {
                const img = new Image();
                img.src = tableImgData;
                
                await new Promise(resolve => {
                  img.onload = resolve;
                });
                
                const tableWidth = 260;
                const tableHeight = (img.height * tableWidth) / img.width;
                
                // Centrer sur la page
                const xOffset = (297 - tableWidth) / 2;
                pdf.addImage(tableImgData, 'JPEG', xOffset, yOffset, tableWidth, tableHeight);
              }
            } else {
              // Fallback: capturer les tableaux séparément
              const redacteurTable = element.querySelector('.redacteur-table');
              const circonstanceTable = element.querySelector('.circonstance-table');
              
              if (redacteurTable && circonstanceTable) {
                // Titres des tableaux
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                pdf.text('Répartition par rédacteur', 70, yOffset, { align: 'center' });
                pdf.text('Répartition par circonstance', 230, yOffset, { align: 'center' });
                
                yOffset += 10;
                
                // Capture et rendu des tableaux avec compression
                const redacteurImgData = await captureElementOptimized(redacteurTable, 1.2, 0.7);
                const circonstanceImgData = await captureElementOptimized(circonstanceTable, 1.2, 0.7);
                
                if (redacteurImgData && circonstanceImgData) {
                  // Créer des images temporaires pour obtenir les dimensions
                  const redImg = new Image();
                  redImg.src = redacteurImgData;
                  
                  const circImg = new Image();
                  circImg.src = circonstanceImgData;
                  
                  await Promise.all([
                    new Promise(resolve => { redImg.onload = resolve; }),
                    new Promise(resolve => { circImg.onload = resolve; })
                  ]);
                  
                  // Calculer les dimensions optimales pour les tableaux côte à côte
                  const redacteurWidth = 120;
                  const redacteurHeight = (redImg.height * redacteurWidth) / redImg.width;
                  
                  const circonstanceWidth = 120;
                  const circonstanceHeight = (circImg.height * circonstanceWidth) / circImg.width;
                  
                  // Ajouter les images avec un espacement horizontal
                  pdf.addImage(redacteurImgData, 'JPEG', 10, yOffset, redacteurWidth, redacteurHeight);
                  pdf.addImage(circonstanceImgData, 'JPEG', 170, yOffset, circonstanceWidth, circonstanceHeight);
                }
              }
            }
          } 
          // Traiter un seul tableau
          else {
            // Trouver le tableau à inclure
            const table = options.includeRedacteurTable 
              ? element.querySelector('.redacteur-table') 
              : element.querySelector('.circonstance-table');
            
            const tableTitle = options.includeRedacteurTable 
              ? 'Répartition par rédacteur' 
              : 'Répartition par circonstance';
            
            if (table) {
              pdf.setFontSize(14);
              pdf.setTextColor(0, 0, 0);
              pdf.text(tableTitle, 149, yOffset, { align: 'center' });
              
              yOffset += 10;
              
              const tableImgData = await captureElementOptimized(table, 1.3, 0.7);
              
              if (tableImgData) {
                const img = new Image();
                img.src = tableImgData;
                
                await new Promise(resolve => {
                  img.onload = resolve;
                });
                
                const tableWidth = 200;
                const tableHeight = (img.height * tableWidth) / img.width;
                
                // Centrer sur la page
                const xOffset = (297 - tableWidth) / 2;
                pdf.addImage(tableImgData, 'JPEG', xOffset, yOffset, tableWidth, tableHeight);
              }
            }
          }
        }
      }
    }
    
    // Télécharger le PDF
    pdf.save(`statistiques_pjc_${options.includeAnnualStats ? `avec_${options.annee}_` : ''}${new Date().toISOString().split('T')[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    throw error;
  }
};