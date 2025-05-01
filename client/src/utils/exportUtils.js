import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Capture un élément HTML spécifique pour le PDF
 * @param {HTMLElement} element L'élément à capturer
 * @param {number} scale Facteur d'échelle (plus élevé = meilleure qualité)
 * @returns {Promise<string>} L'URL de données de l'image
 */
const captureElement = async (element, scale = 2) => {
  if (!element) return null;
  
  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    return canvas.toDataURL('image/png');
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
      const annualSheet = workbook.addWorksheet(`Statistiques ${options.annee}`);
      
      // Titre
      annualSheet.mergeCells('A1:D1');
      annualSheet.getCell('A1').value = `Statistiques pour l'année ${options.annee}`;
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
      
      // Si l'option est activée pour la répartition par rédacteur
      if (options.includeRedacteurTable && Object.keys(data.annual.parRedacteur).length > 0) {
        // Titre de la section rédacteurs
        annualSheet.mergeCells('A11:C11');
        annualSheet.getCell('A11').value = 'Répartition par rédacteur';
        annualSheet.getCell('A11').font = { bold: true, size: 14 };
        
        // En-têtes du tableau
        annualSheet.getCell('A12').value = 'Rédacteur';
        annualSheet.getCell('B12').value = 'Bénéficiaires';
        annualSheet.getCell('C12').value = 'Pourcentage';
        
        // Style d'en-tête
        ['A12', 'B12', 'C12'].forEach(cell => {
          Object.assign(annualSheet.getCell(cell), headerStyle);
        });
        
        // Largeur de colonne supplémentaire
        annualSheet.getColumn('C').width = 15;
        
        // Calcul du total
        const totalRedacteurs = Object.values(data.annual.parRedacteur).reduce((a, b) => a + b, 0);
        
        // Données
        let redRow = 13;
        Object.entries(data.annual.parRedacteur)
          .sort((a, b) => b[1] - a[1]) // Tri par nombre décroissant
          .forEach(([redacteur, count]) => {
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
        // Titre de la section circonstances
        annualSheet.mergeCells('A15:C15');
        annualSheet.getCell('A15').value = 'Répartition par circonstance';
        annualSheet.getCell('A15').font = { bold: true, size: 14 };
        
        // En-têtes du tableau
        annualSheet.getCell('A16').value = 'Circonstance';
        annualSheet.getCell('B16').value = 'Militaires';
        annualSheet.getCell('C16').value = 'Pourcentage';
        
        // Style d'en-tête
        ['A16', 'B16', 'C16'].forEach(cell => {
          Object.assign(annualSheet.getCell(cell), headerStyle);
        });
        
        // Calcul du total
        const totalCirconstances = Object.values(data.annual.parCirconstance).reduce((a, b) => a + b, 0);
        
        // Données
        let circRow = 17;
        Object.entries(data.annual.parCirconstance)
          .sort((a, b) => b[1] - a[1]) // Tri par nombre décroissant
          .forEach(([circonstance, count]) => {
            const percentage = totalCirconstances > 0 ? (count / totalCirconstances) * 100 : 0;
            
            annualSheet.getCell(`A${circRow}`).value = circonstance;
            annualSheet.getCell(`B${circRow}`).value = count;
            annualSheet.getCell(`C${circRow}`).value = percentage / 100; // Format pourcentage
            annualSheet.getCell(`C${circRow}`).numFmt = '0.0%';
            
            circRow++;
          });
      }
      
      // Ajouter une nouvelle feuille pour les données budgétaires si disponibles
      if (data.annual.budget && data.annual.budget.parMois && data.annual.budget.parMois.length > 0) {
        const budgetSheet = workbook.addWorksheet(`Budget ${options.annee}`);
        
        // Titre
        budgetSheet.mergeCells('A1:E1');
        budgetSheet.getCell('A1').value = `Suivi budgétaire ${options.annee}`;
        budgetSheet.getCell('A1').font = { bold: true, size: 16 };
        budgetSheet.getCell('A1').alignment = { horizontal: 'center' };
        
        // Espacement
        budgetSheet.getRow(2).height = 20;
        
        // Synthèse annuelle
        budgetSheet.mergeCells('A3:C3');
        budgetSheet.getCell('A3').value = `Synthèse annuelle ${options.annee}`;
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
 * Exporte les données au format PDF
 * @param {HTMLElement} element L'élément HTML à capturer pour le PDF
 * @param {Object} data Les données exportées (pour les titres)
 * @param {Object} options Les options d'export
 */
export const exportToPDF = async (element, data, options) => {
  try {
    if (!element) {
      throw new Error("Élément DOM non trouvé pour la capture PDF");
    }
    
    // Créer un document PDF au format paysage A4
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
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
    
    // 1. Capture de la section des statistiques globales
    const globalStatsSection = element.querySelector('section');
    
    if (globalStatsSection) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Synthèse globale depuis la mise en place du dispositif', 20, 35);
      
      const globalCanvas = await html2canvas(globalStatsSection, {
        scale: 2, // Échelle plus élevée pour une meilleure qualité
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const globalImgData = globalCanvas.toDataURL('image/png');
      
      // Ajuster la taille pour s'adapter à la page
      const imgWidth = 260;
      const imgHeight = (globalCanvas.height * imgWidth) / globalCanvas.width;
      
      pdf.addImage(globalImgData, 'PNG', 20, 40, imgWidth, imgHeight);
      
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
          
          const summaryCanvas = await html2canvas(annualStatsSummary, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          
          const summaryImgData = summaryCanvas.toDataURL('image/png');
          
          // Ajuster la taille
          const summaryWidth = 260;
          const summaryHeight = (summaryCanvas.height * summaryWidth) / summaryCanvas.width;
          
          yOffset += 5;
          pdf.addImage(summaryImgData, 'PNG', 20, yOffset, summaryWidth, summaryHeight);
          
          yOffset += summaryHeight + 15;
        }
        
        if (budgetSection) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`Suivi budgétaire ${options.annee}`, 20, yOffset);
          
          // Capturer séparément le graphique et le tableau
          const budgetChart = budgetSection.querySelector('.budget-chart');
          const budgetSummary = budgetSection.querySelector('.budget-summary');
          const budgetTable = budgetSection.querySelector('.budget-detail-table');
          
          // 1. Ajouter le graphique (haute qualité)
          if (budgetChart) {
            const chartImgData = await captureElement(budgetChart, 3); // Échelle plus élevée pour les graphiques
            
            if (chartImgData) {
              const chartAspectRatio = budgetChart.offsetHeight / budgetChart.offsetWidth;
              const chartWidth = 260;
              const chartHeight = chartWidth * chartAspectRatio;
              
              yOffset += 10;
              pdf.addImage(chartImgData, 'PNG', 20, yOffset, chartWidth, chartHeight);
              
              yOffset += chartHeight + 15;
            }
          }
          
          // 2. Ajouter la synthèse
          if (budgetSummary) {
            const summaryImgData = await captureElement(budgetSummary);
            
            if (summaryImgData) {
              const summaryAspectRatio = budgetSummary.offsetHeight / budgetSummary.offsetWidth;
              const summaryWidth = 260;
              const summaryHeight = summaryWidth * summaryAspectRatio;
              
              pdf.addImage(summaryImgData, 'PNG', 20, yOffset, summaryWidth, summaryHeight);
              
              yOffset += summaryHeight + 15;
            }
          }
          
          // 3. Ajouter le tableau
          if (budgetTable) {
            if (yOffset > 180) { // Si l'espace est insuffisant, ajouter une page
              pdf.addPage();
              yOffset = 15;
              
              pdf.setFontSize(14);
              pdf.setTextColor(0, 0, 0);
              pdf.text(`Détail mensuel du budget ${options.annee}`, 20, yOffset);
              yOffset += 10;
            }
            
            const tableImgData = await captureElement(budgetTable);
            
            if (tableImgData) {
              const tableAspectRatio = budgetTable.offsetHeight / budgetTable.offsetWidth;
              const tableWidth = 260;
              const tableHeight = tableWidth * tableAspectRatio;
              
              pdf.addImage(tableImgData, 'PNG', 20, yOffset, tableWidth, tableHeight);
              
              yOffset += tableHeight + 15;
            }
          }
        } else {
          // Capturer la section entière si on ne peut pas la découper
          const budgetCanvas = await html2canvas(budgetSection, {
            scale: 2,
            useCORS: true,
            logging: false
          });
          
          const budgetImgData = budgetCanvas.toDataURL('image/png');
          
          // Ajuster la taille
          const budgetWidth = 260;
          const budgetHeight = (budgetCanvas.height * budgetWidth) / budgetCanvas.width;
          
          yOffset += 5;
          pdf.addImage(budgetImgData, 'PNG', 20, yOffset, budgetWidth, budgetHeight);
          
          yOffset += budgetHeight + 15;
        }
        
        // Si demandé, ajouter les tableaux de répartition
        if ((options.includeRedacteurTable || options.includeCirconstanceTable) && 
            yOffset > 180) { // Si l'espace est insuffisant, ajouter une page
          pdf.addPage();
          yOffset = 15;
        }
        
        if (options.includeRedacteurTable) {
          const redacteurTable = element.querySelector('.redacteur-table');
          
          if (redacteurTable) {
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text('Répartition par rédacteur', 20, yOffset);
            
            const redacteurCanvas = await html2canvas(redacteurTable, {
              scale: 2,
              useCORS: true,
              logging: false,
              allowTaint: true,
              backgroundColor: '#ffffff'
            });
            
            const redacteurImgData = redacteurCanvas.toDataURL('image/png');
            
            // Ajuster la taille
            const redacteurWidth = 130;
            const redacteurHeight = (redacteurCanvas.height * redacteurWidth) / redacteurCanvas.width;
            
            yOffset += 5;
            pdf.addImage(redacteurImgData, 'PNG', 20, yOffset, redacteurWidth, redacteurHeight);
            
            yOffset += redacteurHeight + 15;
          }
        }
        
        if (options.includeCirconstanceTable) {
          const circonstanceTable = element.querySelector('.circonstance-table');
          
          if (circonstanceTable) {
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            
            // Placement à droite ou en dessous selon l'espace disponible
            let circX = 20;
            let circY = yOffset;
            
            if (options.includeRedacteurTable && yOffset < 180) {
              // Placer à droite du tableau précédent
              circX = 160;
              circY = yOffset - (yOffset - 15); // Revenir au même niveau que le tableau précédent
            }
            
            pdf.text('Répartition par circonstance', circX, circY);
            
            const circonstanceCanvas = await html2canvas(circonstanceTable, {
              scale: 2,
              useCORS: true,
              logging: false,
              allowTaint: true,
              backgroundColor: '#ffffff'
            });
            
            const circonstanceImgData = circonstanceCanvas.toDataURL('image/png');
            
            // Ajuster la taille
            const circonstanceWidth = 130;
            const circonstanceHeight = (circonstanceCanvas.height * circonstanceWidth) / circonstanceCanvas.width;
            
            circY += 5;
            pdf.addImage(circonstanceImgData, 'PNG', circX, circY, circonstanceWidth, circonstanceHeight);
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