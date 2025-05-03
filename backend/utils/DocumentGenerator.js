const fs = require('fs');
const path = require('path');
const carbone = require('carbone');

// Configuration de Carbone
// carbone.config({
//   tempPath: path.join(__dirname, '../temp'),  // Dossier temporaire pour les fichiers générés
//   templatePath: path.join(__dirname, '../templates') // Dossier contenant les templates
// });

// Création des dossiers nécessaires
const tempPath = path.join(__dirname, '../temp');
const templatePath = path.join(__dirname, '../templates');

if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
  console.log(`Dossier temp créé : ${tempPath}`);
}

if (!fs.existsSync(templatePath)) {
  fs.mkdirSync(templatePath, { recursive: true });
  console.log(`Dossier templates créé : ${templatePath}`);
}

/**
 * Convertit un nombre en lettres (en français)
 * @param {Number} nombre - Le nombre à convertir en lettres
 * @returns {String} - Le nombre en lettres
 */
const nombreEnLettres = (nombre) => {
  if (nombre === undefined || nombre === null) return 'non défini';
  
  // Conversion en nombre entier
  nombre = Math.floor(nombre);
  
  // Tableaux pour conversion
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  // Fonction récursive pour convertir les nombres
  const convertir = (num) => {
    // Gestion de zéro
    if (num === 0) return '';
    
    // Moins de 20
    if (num < 20) return units[num];
    
    // Moins de 100
    if (num < 100) {
      if (num === 71 || num === 81 || num === 91) return tens[Math.floor(num / 10)] + '-et-' + units[num % 10];
      if (num % 10 === 0) return tens[Math.floor(num / 10)];
      if (num >= 70 && num < 80) return tens[6] + '-' + units[num % 10 + 10];
      if (num >= 90) return tens[8] + '-' + units[num % 10 + 10];
      return tens[Math.floor(num / 10)] + '-' + units[num % 10];
    }
    
    // Moins de 1000
    if (num < 1000) {
      if (num === 100) return 'cent';
      if (Math.floor(num / 100) === 1) {
        const reste = convertir(num % 100);
        return 'cent' + (reste ? ' ' + reste : '');
      }
      const reste = convertir(num % 100);
      return units[Math.floor(num / 100)] + ' cents' + (reste ? ' ' + reste : '');
    }
    
    // Moins d'un million
    if (num < 1000000) {
      if (num === 1000) return 'mille';
      if (Math.floor(num / 1000) === 1) {
        const reste = convertir(num % 1000);
        return 'mille' + (reste ? ' ' + reste : '');
      }
      const reste = convertir(num % 1000);
      return convertir(Math.floor(num / 1000)) + ' mille' + (reste ? ' ' + reste : '');
    }
    
    // Moins d'un milliard
    if (num < 1000000000) {
      if (num === 1000000) return 'un million';
      const reste = convertir(num % 1000000);
      return convertir(Math.floor(num / 1000000)) + ' millions' + (reste ? ' ' + reste : '');
    }
    
    // Au-delà
    const reste = convertir(num % 1000000000);
    return convertir(Math.floor(num / 1000000000)) + ' milliards' + (reste ? ' ' + reste : '');
  };

  // Cas spécial pour zéro
  if (nombre === 0) return 'zéro euro';
  
  // Retourne le montant en lettres suivi de "euros"
  return convertir(nombre) + ' euros';
};

/**
 * Fonction utilitaire pour formater les montants de manière fiable
 * @param {Number} montant - Montant à formater
 * @param {Boolean} withTTC - Ajouter "TTC" après le montant
 * @returns {String} - Montant formaté
 */
const formatMontant = (montant, withTTC = false) => {
  if (montant === undefined || montant === null) return 'N/A';
  // Formater avec un espace comme séparateur de milliers
  return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' €' + (withTTC ? ' TTC' : '');
};

/**
 * Formater une date en format français
 * @param {Date|String} date - Date à formater
 * @returns {String} - Date formatée en FR ou "N/A" si non définie
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('fr-FR');
  } catch (e) {
    console.error("Erreur lors du formatage de la date:", e);
    return 'N/A';
  }
};

/**
 * Génère un document de convention d'honoraires dans le format demandé
 * @param {Object} data - Données pour la convention
 * @param {String} format - Format de sortie ('pdf' ou 'docx')
 * @returns {Promise<Buffer>} - Document généré
 */
exports.genererConventionHonoraires = async (data, format = 'pdf') => {
  try {
    // Préparer les données pour Carbone
    const dataForTemplate = {
      beneficiaire: {
        prenom: data.beneficiaire.prenom || 'N/A',
        nom: (data.beneficiaire.nom || 'N/A').toUpperCase(),
        qualite: data.beneficiaire.qualite || 'N/A',
        numeroDecision: data.beneficiaire.numeroDecision || 'N/A',
        dateDecision: formatDate(data.beneficiaire.dateDecision)
      },
      militaire: {
        grade: data.militaire.grade || 'N/A',
        prenom: data.militaire.prenom || 'N/A',
        nom: (data.militaire.nom || 'N/A').toUpperCase(),
        unite: data.militaire.unite || 'N/A'
      },
      affaire: {
        nom: data.affaire.nom || 'N/A',
        lieu: data.affaire.lieu || 'N/A',
        dateFaits: formatDate(data.affaire.dateFaits),
        redacteur: data.affaire.redacteur || 'N/A'
      },
      avocat: {
        prenom: data.avocat.prenom || 'N/A',
        nom: data.avocat.nom || 'N/A',
        email: data.avocat.email || 'N/A'
      },
      convention: {
        montant: formatMontant(data.convention.montant),
        montantEnLettres: nombreEnLettres(data.convention.montant),
        montantTTC: formatMontant(data.convention.montant * 1.2),
        pourcentageResultats: data.convention.pourcentageResultats !== undefined && 
        data.convention.pourcentageResultats !== null ? 
        data.convention.pourcentageResultats + '%' : 'N/A'      },
        dateDocument: formatDate(new Date())
    };

    // Vérifier si le template personnalisé existe
    const templatePath = path.join(__dirname, '../templates/convention_template.docx');
    const defaultTemplatePath = path.join(__dirname, '../templates/default_convention_template.docx');
    
    let actualTemplatePath;
    
    if (fs.existsSync(templatePath)) {
      actualTemplatePath = templatePath;
    } else if (fs.existsSync(defaultTemplatePath)) {
      actualTemplatePath = defaultTemplatePath;
    } else {
      throw new Error("Aucun template de convention d'honoraires n'est disponible");
    }
    
    return new Promise((resolve, reject) => {
      // Générer le document avec Carbone (format selon le paramètre)
      const options = {
        convertTo: format.toLowerCase() === 'pdf' ? 'pdf' : null
      };
      
      carbone.render(actualTemplatePath, dataForTemplate, options, function(err, result) {
        if (err) {
          console.error(`Erreur lors de la génération du document ${format}:`, err);
          return reject(err);
        }
        resolve(result);
      });
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la convention d'honoraires:", error);
    throw error;
  }
};

/**
 * Génère une fiche de règlement dans le format demandé
 * @param {Object} data - Données pour la fiche de règlement
 * @param {String} format - Format du document ('pdf' ou 'docx')
 * @returns {Promise<Buffer>} - Document généré
 */
exports.genererFicheReglement = async (data, format = 'pdf') => {
  try {
    // Préparer les données pour Carbone
    const dataForTemplate = {
      beneficiaire: {
        prenom: data.beneficiaire.prenom || 'N/A',
        nom: (data.beneficiaire.nom || 'N/A').toUpperCase(),
        qualite: data.beneficiaire.qualite || 'N/A',
        numeroDecision: data.beneficiaire.numeroDecision || 'N/A',
        dateDecision: formatDate(data.beneficiaire.dateDecision)
      },
      militaire: {
        grade: data.militaire.grade || 'N/A',
        prenom: data.militaire.prenom || 'N/A',
        nom: (data.militaire.nom || 'N/A').toUpperCase(),
        unite: data.militaire.unite || 'N/A'
      },
      affaire: {
        nom: data.affaire.nom || 'N/A',
        lieu: data.affaire.lieu || 'N/A',
        dateFaits: formatDate(data.affaire.dateFaits),
        redacteur: data.affaire.redacteur || 'N/A'
      },
      paiement: {
        montant: formatMontant(data.paiement.montant, true),
        montantEnLettres: nombreEnLettres(data.paiement.montant),
        type: data.paiement.type || 'N/A',
        date: formatDate(data.paiement.date),
        referencePiece: data.paiement.referencePiece || 'N/A',
        qualiteDestinataire: data.paiement.qualiteDestinataire || 'N/A',
        identiteDestinataire: data.paiement.identiteDestinataire || 'N/A',
        adresseDestinataire: data.paiement.adresseDestinataire || 'N/A',
        siretRidet: data.paiement.siretRidet || 'N/A',
        titulaireCompte: data.paiement.titulaireCompte || 'N/A',
        codeEtablissement: data.paiement.codeEtablissement || 'N/A',
        codeGuichet: data.paiement.codeGuichet || 'N/A',
        numeroCompte: data.paiement.numeroCompte || 'N/A',
        cleVerification: data.paiement.cleVerification || 'N/A'
      },
      dateDocument: formatDate(new Date())
    };

    // Vérifier si le template personnalisé existe
    const templatePath = path.join(__dirname, '../templates/reglement_template.docx');
    const defaultTemplatePath = path.join(__dirname, '../templates/default_reglement_template.docx');
    
    let actualTemplatePath;
    
    if (fs.existsSync(templatePath)) {
      actualTemplatePath = templatePath;
    } else if (fs.existsSync(defaultTemplatePath)) {
      actualTemplatePath = defaultTemplatePath;
    } else {
      throw new Error("Aucun template de fiche de règlement n'est disponible");
    }
    
    return new Promise((resolve, reject) => {
      // Générer le document avec Carbone (format selon le paramètre)
      const options = {
        convertTo: format.toLowerCase() === 'pdf' ? 'pdf' : null
      };
      
      carbone.render(actualTemplatePath, dataForTemplate, options, function(err, result) {
        if (err) {
          console.error(`Erreur lors de la génération du document ${format}:`, err);
          return reject(err);
        }
        resolve(result);
      });
    });
  } catch (error) {
    console.error(`Erreur dans la génération de la fiche de règlement:`, error);
    throw error;
  }
};

/**
 * Génère un document de synthèse d'une affaire complète
 * @param {Object} data - Données pour la synthèse (affaire, militaires, bénéficiaires)
 * @param {String} format - Format de sortie ('pdf' ou 'docx')
 * @returns {Promise<Buffer>} - Document généré
 */
exports.genererSyntheseAffaire = async (data, format = 'pdf') => {
  try {
    // Préparer les données pour Carbone en utilisant des boucles
    const templateData = {
      affaire: {
        nom: data.affaire.nom || 'N/A',
        description: data.affaire.description || 'N/A',
        lieu: data.affaire.lieu || 'N/A',
        dateFaits: formatDate(data.affaire.dateFaits),
        dateCreation: formatDate(data.affaire.dateCreation),
        redacteur: data.affaire.redacteur || 'N/A',
        archive: data.affaire.archive ? 'Oui' : 'Non',
        notes: data.affaire.notes || 'Aucune note'
      },
      
      // Statistiques générales
      stats: {
        nbMilitaires: data.militaires.length,
        nbMilitairesDecedes: data.militaires.filter(m => m.decede).length,
        nbMilitairesBlesses: data.militaires.filter(m => !m.decede).length,
        nbBeneficiaires: data.beneficiaires.length,
        montantTotalConventions: formatMontant(
          data.beneficiaires.reduce((total, benef) => 
            total + benef.conventions.reduce((t, conv) => 
              t + (conv.montant || 0), 0
            ), 0
          )
        ),
        montantTotalPaiements: formatMontant(
          data.beneficiaires.reduce((total, benef) => 
            total + benef.paiements.reduce((t, paie) => 
              t + (paie.montant || 0), 0
            ), 0
          )
        )
      },
      
      // Préparation des militaires pour itération
      militaires: data.militaires.map(militaire => {
        // Trouver les bénéficiaires de ce militaire
        const militaireBeneficiaires = data.beneficiaires.filter(
          b => b.militaire.toString() === militaire._id.toString()
        );
        
        // Calculer les montants totaux pour ce militaire
        const totalConventionsMilitaire = militaireBeneficiaires.reduce(
          (sum, benef) => sum + benef.conventions.reduce(
            (convSum, conv) => convSum + (conv.montant || 0), 0
          ), 0
        );
        
        const totalPaiementsMilitaire = militaireBeneficiaires.reduce(
          (sum, benef) => sum + benef.paiements.reduce(
            (paySum, pay) => paySum + (pay.montant || 0), 0
          ), 0
        );
        
        return {
          grade: militaire.grade || 'N/A',
          prenom: militaire.prenom || 'N/A',
          nom: (militaire.nom || 'N/A').toUpperCase(),
          unite: militaire.unite || 'N/A',
          region: militaire.region || 'N/A',
          departement: militaire.departement || 'N/A',
          circonstance: militaire.circonstance || 'N/A',
          natureDesBlessures: militaire.natureDesBlessures || 'N/A',
          itt: militaire.itt ? `${militaire.itt} jours` : 'N/A',
          decede: militaire.decede ? 'Oui' : 'Non',
          dateCreation: formatDate(militaire.dateCreation),
          
          // Ajouter des résumés financiers pour ce militaire
          nbBeneficiaires: militaireBeneficiaires.length,
          totalConventions: formatMontant(totalConventionsMilitaire),
          totalPaiements: formatMontant(totalPaiementsMilitaire),
          
          // Liste des bénéficiaires de ce militaire
          beneficiaires: militaireBeneficiaires.map(beneficiaire => {
            // Formater les conventions
            const conventions = beneficiaire.conventions.map(convention => {
              let avocatNom = 'N/A';
              if (convention.avocat && beneficiaire.avocats) {
                const avocat = beneficiaire.avocats.find(a => 
                  a._id.toString() === convention.avocat.toString()
                );
                if (avocat) {
                  avocatNom = `${avocat.prenom} ${avocat.nom}`;
                }
              }

              return {
                montant: formatMontant(convention.montant),
                pourcentageResultats: convention.pourcentageResultats > 0 ? 
                  convention.pourcentageResultats + '%' : 'N/A',
                dateEnvoiAvocat: formatDate(convention.dateEnvoiAvocat),
                dateEnvoiBeneficiaire: formatDate(convention.dateEnvoiBeneficiaire),
                dateValidationFMG: formatDate(convention.dateValidationFMG),
                avocat: avocatNom
              };
            });
            
            // Formater les paiements
            const paiements = beneficiaire.paiements.map(paiement => ({
              type: paiement.type || 'N/A',
              montant: formatMontant(paiement.montant),
              date: formatDate(paiement.date),
              qualiteDestinataire: paiement.qualiteDestinataire || 'N/A',
              identiteDestinataire: paiement.identiteDestinataire || 'N/A',
              referencePiece: paiement.referencePiece || 'N/A'
            }));
            
            // Formater les avocats
            const avocats = (beneficiaire.avocats || []).map(avocat => ({
              nomComplet: `${avocat.prenom || 'N/A'} ${(avocat.nom || 'N/A').toUpperCase()}`,
              email: avocat.email || 'N/A',
              specialisationRPC: avocat.specialisationRPC ? 'Oui' : 'Non'
            }));
            
            return {
              prenom: beneficiaire.prenom || 'N/A',
              nom: (beneficiaire.nom || 'N/A').toUpperCase(),
              qualite: beneficiaire.qualite || 'N/A',
              numeroDecision: beneficiaire.numeroDecision || 'Non attribué',
              dateDecision: formatDate(beneficiaire.dateDecision) || 'Non définie',
              dateCreation: formatDate(beneficiaire.dateCreation),
              archive: beneficiaire.archive ? 'Oui' : 'Non',
              avocats: avocats.length ? avocats : [{ nomComplet: 'Aucun', email: 'N/A', specialisationRPC: 'N/A' }],
              conventions: conventions.length ? conventions : [{ 
                montant: 'Aucune', 
                pourcentageResultats: 'N/A',
                dateEnvoiAvocat: 'N/A',
                dateEnvoiBeneficiaire: 'N/A',
                dateValidationFMG: 'N/A',
                avocat: 'N/A'
              }],
              paiements: paiements.length ? paiements : [{ 
                type: 'Aucun', 
                montant: 'N/A',
                date: 'N/A',
                qualiteDestinataire: 'N/A',
                identiteDestinataire: 'N/A',
                referencePiece: 'N/A'
              }],
              montantTotalConventions: formatMontant(
                beneficiaire.conventions.reduce((total, conv) => 
                  total + (conv.montant || 0), 0
                )
              ),
              montantTotalPaiements: formatMontant(
                beneficiaire.paiements.reduce((total, paie) => 
                  total + (paie.montant || 0), 0
                )
              )
            };
          })
        };
      }),
      
      // Date du document
      dateDocument: formatDate(new Date())
    };
    
    // Ajouter un militaire vide si aucun militaire
    if (templateData.militaires.length === 0) {
      templateData.militaires.push({
        grade: 'Aucun militaire',
        prenom: '',
        nom: '',
        unite: 'N/A',
        region: 'N/A',
        departement: 'N/A',
        circonstance: 'N/A',
        natureDesBlessures: 'N/A',
        itt: 'N/A',
        decede: 'N/A',
        nbBeneficiaires: 0,
        totalConventions: 'N/A',
        totalPaiements: 'N/A',
        beneficiaires: []
      });
    }
    
    // Utiliser le template de boucle
    const templatePath = path.join(__dirname, '../templates/synthese_affaire_template.docx');
    const defaultTemplatePath = path.join(__dirname, '../templates/default_synthese_affaire_template.docx');
    
    let actualTemplatePath;
    
    if (fs.existsSync(templatePath)) {
      actualTemplatePath = templatePath;
    } else if (fs.existsSync(defaultTemplatePath)) {
      actualTemplatePath = defaultTemplatePath;
    } else {
      throw new Error("Aucun template de synthèse d'affaire n'est disponible");
    }
    
    return new Promise((resolve, reject) => {
      const options = {
        convertTo: format.toLowerCase() === 'pdf' ? 'pdf' : null
      };
      
      carbone.render(actualTemplatePath, templateData, options, function(err, result) {
        if (err) {
          console.error(`Erreur lors de la génération du document ${format}:`, err);
          return reject(err);
        }
        resolve(result);
      });
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la synthèse d'affaire:", error);
    throw error;
  }
};

/**
 * Convertit une date au format français
 * @param {Date} date - Date à formater
 * @returns {String} - Date au format "2 avril 2025"
 */
const formatDateLong = (date) => {
  if (!date) return 'N/A';
  
  try {
    // Liste des mois en français
    const mois = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    const dateObj = new Date(date);
    return `${dateObj.getDate()} ${mois[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  } catch (e) {
    console.error("Erreur lors du formatage de la date:", e);
    return 'N/A';
  }
};