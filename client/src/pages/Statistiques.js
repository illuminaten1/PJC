import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaEuroSign, FaUsers, FaFolder, FaCalendarAlt, FaFileExport, FaMapMarkerAlt, FaMapMarked, FaExclamationTriangle } from 'react-icons/fa';
import { statistiquesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import ExportModal from '../components/specific/ExportModal';
import { useTheme } from '../contexts/ThemeContext'; // Ajout du hook de thème
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Statistiques = () => {
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [statistiques, setStatistiques] = useState(null);
  const [statsGlobales, setStatsGlobales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Nouveaux états pour la modale d'export
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Référence pour les éléments à exporter en PDF
  const statsRef = useRef(null);
  
  // Hook de thème
  const { colors } = useTheme();
  
  // Générer les années pour le sélecteur (à partir de 2023 jusqu'à l'année actuelle + 1)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const years = [];
    
    // option "Toutes les années" avec la valeur spéciale -1
    years.push(-1);

    for (let year = startYear; year <= currentYear + 1; year++) {
      years.push(year);
    }
    
    return years;
  };

  const years = generateYears();
  
  useEffect(() => {
    fetchStatsGlobales();
  }, []);
  
  useEffect(() => {
    fetchStatistiques();
  }, [annee]);
  
  const fetchStatistiques = async () => {
    setLoading(true);
    try {
      let response;
      
      if (annee === -1) {
        // Si "Toutes les années" est sélectionné, appeler l'API sans paramètre d'année
        response = await statistiquesAPI.getAll();
        
        // Traitement des données retournées pour les adapter au format attendu par le composant
        // Convertir le format global en format similaire à celui d'une année
        if (response.data) {
          // Construction d'un objet compatible avec le format annuel
          const allYearsData = {
            annee: "Toutes",
            affaires: { 
              total: response.data.affaires || 0 
            },
            finances: {
              montantGage: Object.values(response.data.finances || {})
                .reduce((sum, year) => sum + (year.montantGage || 0), 0),
              montantPaye: Object.values(response.data.finances || {})
                .reduce((sum, year) => sum + (year.montantPaye || 0), 0),
              // CORRECTION: Calculer correctement le nombre de conventions
              nbConventions: 0, // Initialiser à 0
              nbPaiements: 0    // Initialiser à 0
            },
            // Agréger les statistiques par rédacteur de toutes les années
            parRedacteur: {},
            // Agréger les statistiques par circonstance de toutes les années
            parCirconstance: {},
            // Agréger les statistiques par région de toutes les années
            parRegion: {}
          };
          
          // Récupérer les données détaillées pour chaque année pour construire 
          // les agrégations par rédacteur, circonstance et région
          for (const year of years.filter(y => y !== -1)) {
            try {
              const yearStats = await statistiquesAPI.getByAnnee(year);
              if (yearStats.data) {
                // CORRECTION: Agréger les données financières
                if (yearStats.data.finances) {
                  allYearsData.finances.nbConventions += yearStats.data.finances.nbConventions || 0;
                  allYearsData.finances.nbPaiements += yearStats.data.finances.nbPaiements || 0;
                }
                
                // Agréger les rédacteurs
                if (yearStats.data.parRedacteur) {
                  Object.entries(yearStats.data.parRedacteur).forEach(([redacteur, count]) => {
                    allYearsData.parRedacteur[redacteur] = (allYearsData.parRedacteur[redacteur] || 0) + count;
                  });
                }
                
                // Agréger les circonstances
                if (yearStats.data.parCirconstance) {
                  Object.entries(yearStats.data.parCirconstance).forEach(([circonstance, count]) => {
                    allYearsData.parCirconstance[circonstance] = (allYearsData.parCirconstance[circonstance] || 0) + count;
                  });
                }
                
                // Agréger les régions
                if (yearStats.data.parRegion) {
                  Object.entries(yearStats.data.parRegion).forEach(([region, data]) => {
                    if (!allYearsData.parRegion[region]) {
                      allYearsData.parRegion[region] = { nbMilitaires: 0, nbBeneficiaires: 0 };
                    }
                    allYearsData.parRegion[region].nbMilitaires += data.nbMilitaires || 0;
                    allYearsData.parRegion[region].nbBeneficiaires += data.nbBeneficiaires || 0;
                  });
                }
              }
            } catch (yearError) {
              console.error(`Erreur lors de la récupération des statistiques pour l'année ${year}:`, yearError);
            }
          }
          
          setStatistiques(allYearsData);
        }
      } else {
        // Si une année spécifique est sélectionnée, utiliser le code existant
        response = await statistiquesAPI.getByAnnee(annee);
        setStatistiques(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques", err);
      setError("Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStatsGlobales = async () => {
    try {
      const response = await statistiquesAPI.getAll();
      console.log("Données brutes de l'API:", response.data);
      
      // Initialiser la structure de données transformée
      const transformedData = {
        parAnnee: {}
      };
      
      // Initialiser toutes les années
      const years = generateYears();
      years.forEach(year => {
        transformedData.parAnnee[year] = {
          montantGageHT: 0,
          montantPaye: 0,
          nbBeneficiaires: 0,
          nbConventions: 0,
          nbReglements: 0
        };
      });

      // Récupérer les données pour chaque année individuellement
      for (const year of years) {
        try {
          const yearStats = await statistiquesAPI.getByAnnee(year);
          console.log(`Données pour l'année ${year}:`, yearStats.data);
          
          if (yearStats.data) {
            // Pour récupérer le nombre de bénéficiaires, nous devons regarder dans les statistiques
            // des militaires, des bénéficiaires ou calculer à partir d'autres données
            
            // Obtenons le total des valeurs dans parRedacteur pour une approximation du nombre de bénéficiaires
            let nbBeneficiairesAnnee = 0;
            if (yearStats.data.parRedacteur) {
              nbBeneficiairesAnnee = Object.values(yearStats.data.parRedacteur).reduce((sum, count) => sum + count, 0);
            }
            
            transformedData.parAnnee[year] = {
              // Données financières
              montantGageHT: yearStats.data.finances?.montantGage || 0,
              montantPaye: yearStats.data.finances?.montantPaye || 0,
              // Autres statistiques
              nbBeneficiaires: nbBeneficiairesAnnee,
              nbConventions: yearStats.data.finances?.nbConventions || 0,
              nbReglements: yearStats.data.finances?.nbPaiements || 0
            };
          }
        } catch (yearError) {
          console.error(`Erreur lors de la récupération des statistiques pour l'année ${year}:`, yearError);
        }
      }
      
      console.log("Données transformées:", transformedData);
      setStatsGlobales(transformedData);
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques globales", err);
    }
  };
  
  // Calcul des totaux pour les tableaux
  const calculateTotals = () => {
    if (!statsGlobales || !statsGlobales.parAnnee) return {
      nbBeneficiaires: 0,
      nbConventions: 0,
      montantGageHT: 0,
      montantPaye: 0,
      nbReglements: 0
    };

    return Object.values(statsGlobales.parAnnee).reduce((totals, yearStats) => {
      return {
        nbBeneficiaires: totals.nbBeneficiaires + (yearStats.nbBeneficiaires || 0),
        nbConventions: totals.nbConventions + (yearStats.nbConventions || 0),
        montantGageHT: totals.montantGageHT + (yearStats.montantGageHT || 0),
        montantPaye: totals.montantPaye + (yearStats.montantPaye || 0),
        nbReglements: totals.nbReglements + (yearStats.nbReglements || 0)
      };
    }, {
      nbBeneficiaires: 0,
      nbConventions: 0,
      montantGageHT: 0,
      montantPaye: 0,
      nbReglements: 0
    });
  };

  const totals = calculateTotals();

  const processDepartementData = (parDepartement) => {
    if (!parDepartement) return [];
    
    // Convertir en array et trier par nombre de militaires
    const departements = Object.entries(parDepartement)
      .map(([dept, data]) => ({
        nom: dept,
        ...data
      }))
      .sort((a, b) => b.nbMilitaires - a.nbMilitaires);
    
    // Prendre les 15 premiers départements
    const topDepartements = departements.slice(0, 15);
    
    // Regrouper le reste dans "Autres"
    const autres = departements.slice(15);
    if (autres.length > 0) {
      const autresData = autres.reduce((acc, dept) => ({
        nbMilitaires: acc.nbMilitaires + dept.nbMilitaires,
        nbBeneficiaires: acc.nbBeneficiaires + dept.nbBeneficiaires
      }), { nbMilitaires: 0, nbBeneficiaires: 0 });
      
      topDepartements.push({
        nom: `Autres (${autres.length} départements)`,
        ...autresData
      });
    }
    
    return topDepartements;
  };
  
  const calculateVariation = (currentValue, previousValue) => {
    if (previousValue === 0) {
      // Cas spécial: si la valeur précédente est 0
      return currentValue > 0 ? { value: 100, direction: 'up' } : null;
    }
    
    const variation = ((currentValue - previousValue) / previousValue) * 100;
    
    // Tous les changements sont considérés comme à afficher
    return {
      value: Math.abs(variation).toFixed(1), // Arrondi à 1 décimale
      direction: variation >= 0 ? 'up' : 'down',
      // Ajouter une classe pour les variations importantes
      significant: Math.abs(variation) >= 5 
    };
  };
  
  const prepareDataWithVariations = () => {
    if (!statsGlobales || !statsGlobales.parAnnee) return [];
    
    // Tri des années dans l'ordre croissant
    const sortedYears = [...years]
      .filter(year => year !== -1) // Filtrer l'année -1
      .sort((a, b) => a - b);
    
    return sortedYears.map((year, index) => {
      const yearData = statsGlobales.parAnnee[year] || {};
      let variations = {};
      
      // Ne pas calculer de variation pour la première année (pas de référence antérieure)
      if (index > 0) {
        const previousYear = sortedYears[index - 1];
        const previousYearData = statsGlobales.parAnnee[previousYear] || {};
        
        variations = {
          nbBeneficiaires: calculateVariation(
            yearData.nbBeneficiaires || 0, 
            previousYearData.nbBeneficiaires || 0
          ),
          nbConventions: calculateVariation(
            yearData.nbConventions || 0, 
            previousYearData.nbConventions || 0
          ),
          montantGageHT: calculateVariation(
            yearData.montantGageHT || 0, 
            previousYearData.montantGageHT || 0
          ),
          montantPaye: calculateVariation(
            yearData.montantPaye || 0, 
            previousYearData.montantPaye || 0
          ),
          nbReglements: calculateVariation(
            yearData.nbReglements || 0, 
            previousYearData.nbReglements || 0
          )
        };
      }
      
      return {
        year,
        data: yearData,
        variations
      };
    });
  };

  const dataWithVariations = prepareDataWithVariations();
  
  // Fonction pour gérer l'export des données
  const handleExport = async (options) => {
    // Préparation des données pour l'export
    const exportData = {
      global: {
        parAnnee: statsGlobales?.parAnnee || {},
        totals: calculateTotals()
      },
      annual: options.includeAnnualStats ? {
        finances: statistiques?.finances || {},
        affaires: statistiques?.affaires || {},
        parRedacteur: options.includeRedacteurTable ? statistiques?.parRedacteur || {} : {},
        parCirconstance: options.includeCirconstanceTable ? statistiques?.parCirconstance || {} : {},
        parRegion: options.includeRegionTable ? statistiques?.parRegion || {} : {},
        budget: null // Initialisé à null
      } : null,
      annee: options.isAllYears ? "Toutes" : options.annee,
      isAllYears: options.isAllYears,
      dataWithVariations: dataWithVariations
    };
    
    // Si les statistiques annuelles sont demandées et ce n'est pas "Toutes les années"
    if (options.includeAnnualStats && !options.isAllYears) {
      try {
        const budgetResponse = await statistiquesAPI.getBudgetByAnnee(options.annee);
        exportData.annual.budget = budgetResponse.data;
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques budgétaires pour l'export", err);
        // Continuer l'export même si les données budgétaires sont indisponibles
      }
    }
    
    try {
      if (options.format === 'excel') {
        await exportToExcel(exportData, options);
      } else if (options.format === 'pdf') {
        await exportToPDF(statsRef.current, exportData, options);
      }
      
      return true; // Retourne une promesse résolue
    } catch (err) {
      console.error("Erreur lors de l'export", err);
      throw err; // Propage l'erreur pour que le .catch() dans le composant modal puisse la gérer
    }
  };

  if (loading && !statistiques) {
    return (
      <Container colors={colors}>
        <PageHeader title="Statistiques" />
        <Loading colors={colors}>Chargement des statistiques...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container colors={colors}>
        <PageHeader title="Statistiques" />
        <Error colors={colors}>{error}</Error>
      </Container>
    );
  }
  
  return (
    <Container colors={colors}>
      <PageHeader 
        title="Statistiques" 
        subtitle="Analyse des données de protection juridique complémentaire"
      />
      
      <SectionHeader colors={colors}>
          <SectionTitle colors={colors}>
            <FaChartBar />
            <span>Synthèse globale depuis la mise en place du dispositif</span>
          </SectionTitle>
        </SectionHeader>

      {/* Ajout de la référence pour l'export PDF */}
      <div ref={statsRef}>
        {/* Section des statistiques globales avec 3 tableaux côte à côte */}
        <Section colors={colors}>       
          <TablesRow>
            {/* Premier tableau: Bénéficiaires - Conventions */}
            <TableCard colors={colors}>
              <TableTitle colors={colors}>Bénéficiaires - Conventions</TableTitle>
              <CompactTable colors={colors}>
                <thead>
                  <tr className="bg-header">
                    <SummaryTableHeader colors={colors}>Année</SummaryTableHeader>
                    <SummaryTableHeader colors={colors}>
                      <span className="full-text">Nombre de bénéficiaires</span>
                      <span className="short-text">Bénéficiaires</span>
                    </SummaryTableHeader>
                    <SummaryTableHeader colors={colors}>
                      <span className="full-text">Nombre de conventions</span>
                      <span className="short-text">Conventions</span>
                    </SummaryTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {dataWithVariations.map(({ year, data, variations }) => (
                    <Tr key={`conventions-${year}`} colors={colors}>
                      <YearCell colors={colors}>{year}</YearCell>
                      <Td colors={colors}>
                        <div className="value-container">
                          <span className="value">{data.nbBeneficiaires || 0}</span>
                          {variations.nbBeneficiaires && (
                            variations.nbBeneficiaires.direction === 'up' 
                              ? <VariationUp className={variations.nbBeneficiaires.significant ? 'significant' : ''}>
                                  ↑ {variations.nbBeneficiaires.value}%
                                </VariationUp>
                              : <VariationDown className={variations.nbBeneficiaires.significant ? 'significant' : ''}>
                                  ↓ {variations.nbBeneficiaires.value}%
                                </VariationDown>
                          )}
                        </div>
                      </Td>
                      <Td colors={colors}>
                        <div className="value-container">
                          <span className="value">{data.nbConventions || 0}</span>
                          {variations.nbConventions && (
                            variations.nbConventions.direction === 'up' 
                              ? <VariationUp className={variations.nbConventions.significant ? 'significant' : ''}>
                                  ↑ {variations.nbConventions.value}%
                                </VariationUp>
                              : <VariationDown className={variations.nbConventions.significant ? 'significant' : ''}>
                                  ↓ {variations.nbConventions.value}%
                                </VariationDown>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                  <TotalRow colors={colors}>
                    <TotalCell colors={colors}>TOTAL</TotalCell>
                    <TotalCell colors={colors}>{totals.nbBeneficiaires}</TotalCell>
                    <TotalCell colors={colors}>{totals.nbConventions}</TotalCell>
                  </TotalRow>
                </tbody>
              </CompactTable>
            </TableCard>
            
            {/* Deuxième tableau: Montants totaux gagés (HT et TTC) */}
            <TableCard colors={colors}>
              <TableTitle colors={colors}>Montant Total Gagé</TableTitle>
              <CompactTable colors={colors}>
                <thead>
                  <tr className="bg-header">
                    <SummaryTableHeader colors={colors}>Année</SummaryTableHeader>
                    <SummaryTableHeader colors={colors}>
                      <span className="full-text">Montant total gagé HT</span>
                      <span className="short-text">Gagé HT</span>
                    </SummaryTableHeader>
                    <SummaryTableHeader colors={colors}>
                      <span className="full-text">Montant total gagé TTC</span>
                      <span className="short-text">Gagé TTC</span>
                    </SummaryTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {dataWithVariations.map(({ year, data, variations }) => {
                    const montantHT = data.montantGageHT || 0;
                    const montantTTC = montantHT * 1.2;
                    
                    return (
                      <Tr key={`montants-${year}`} colors={colors}>
                        <YearCell colors={colors}>{year}</YearCell>
                        <Td colors={colors}>
                          <div className="value-container">
                            <span className="value">{montantHT > 0 ? `${montantHT.toLocaleString('fr-FR')} €` : '0 €'}</span>
                            {variations.montantGageHT && (
                              variations.montantGageHT.direction === 'up' 
                                ? <VariationUp className={variations.montantGageHT.significant ? 'significant' : ''}>
                                    ↑ {variations.montantGageHT.value}%
                                  </VariationUp>
                                : <VariationDown className={variations.montantGageHT.significant ? 'significant' : ''}>
                                    ↓ {variations.montantGageHT.value}%
                                  </VariationDown>
                            )}
                          </div>
                        </Td>
                        <Td colors={colors}>
                          <div className="value-container">
                            <span className="value">{montantTTC > 0 ? `${montantTTC.toLocaleString('fr-FR')} €` : '0 €'}</span>
                            {variations.montantGageHT && (
                              variations.montantGageHT.direction === 'up' 
                                ? <VariationUp className={variations.montantGageHT.significant ? 'significant' : ''}>
                                    ↑ {variations.montantGageHT.value}%
                                  </VariationUp>
                                : <VariationDown className={variations.montantGageHT.significant ? 'significant' : ''}>
                                    ↓ {variations.montantGageHT.value}%
                                  </VariationDown>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                  <TotalRow colors={colors}>
                    <TotalCell colors={colors}>TOTAL</TotalCell>
                    <TotalCell colors={colors}>{totals.montantGageHT > 0 ? `${totals.montantGageHT.toLocaleString('fr-FR')} €` : '0 €'}</TotalCell>
                    <TotalCell colors={colors}>{totals.montantGageHT > 0 ? `${(totals.montantGageHT * 1.2).toLocaleString('fr-FR')} €` : '0 €'}</TotalCell>
                  </TotalRow>
                </tbody>
              </CompactTable>
            </TableCard>
            
            {/* Troisième tableau: Dépenses ordonnées */}
            <TableCard colors={colors}>
              <TableTitle colors={colors}>Dépenses Ordonnées</TableTitle>
              <CompactTable colors={colors}>
                <thead>
                  <tr className="bg-header">
                    <SummaryTableHeader colors={colors}>Année</SummaryTableHeader>
                    <SummaryTableHeader colors={colors}>
                      <span className="full-text">Nombre de règlements</span>
                      <span className="short-text">Règlements</span>
                    </SummaryTableHeader>
                    <SummaryTableHeader colors={colors}>
                      <span className="full-text">Montant total ordonné TTC</span>
                      <span className="short-text">Ordonné TTC</span>
                    </SummaryTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {dataWithVariations.map(({ year, data, variations }) => (
                    <Tr key={`ordonnes-${year}`} colors={colors}>
                      <YearCell colors={colors}>{year}</YearCell>
                      <Td colors={colors}>
                        <div className="value-container">
                          <span className="value">{data.nbReglements || 0}</span>
                          {variations.nbReglements && (
                            variations.nbReglements.direction === 'up' 
                              ? <VariationUp className={variations.nbReglements.significant ? 'significant' : ''}>
                                  ↑ {variations.nbReglements.value}%
                                </VariationUp>
                              : <VariationDown className={variations.nbReglements.significant ? 'significant' : ''}>
                                  ↓ {variations.nbReglements.value}%
                                </VariationDown>
                          )}
                        </div>
                      </Td>
                      <Td colors={colors}>
                        <div className="value-container">
                          <span className="value">
                            {(data.montantPaye || 0) > 0 
                              ? `${(data.montantPaye).toLocaleString('fr-FR')} €` 
                              : '0 €'}
                          </span>
                          {variations.montantPaye && (
                            variations.montantPaye.direction === 'up' 
                              ? <VariationUp className={variations.montantPaye.significant ? 'significant' : ''}>
                                  ↑ {variations.montantPaye.value}%
                                </VariationUp>
                              : <VariationDown className={variations.montantPaye.significant ? 'significant' : ''}>
                                  ↓ {variations.montantPaye.value}%
                                </VariationDown>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                  <TotalRow colors={colors}>
                    <TotalCell colors={colors}>TOTAL</TotalCell>
                    <TotalCell colors={colors}>{totals.nbReglements}</TotalCell>
                    <TotalCell colors={colors}>{totals.montantPaye > 0 ? `${totals.montantPaye.toLocaleString('fr-FR')} €` : '0 €'}</TotalCell>
                  </TotalRow>
                </tbody>
              </CompactTable>
            </TableCard>
          </TablesRow>
        </Section>
        
        <SectionHeader colors={colors}>
            <SectionTitle colors={colors}>
              <FaCalendarAlt/>
              <span>Synthèse par année</span>
            </SectionTitle>
        </SectionHeader>
        
        {/* Remplacer le sélecteur d'année par les actions */}
        <HeaderActions colors={colors}>
          <YearSelector>
            <YearLabel colors={colors}>Année budgétaire :</YearLabel>
            <Select
              value={annee}
              onChange={(e) => setAnnee(parseInt(e.target.value))}
              colors={colors}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === -1 ? "Toutes les années" : year}
                </option>
              ))}
            </Select>
          </YearSelector>
          
          <ExportButton onClick={() => setShowExportModal(true)} colors={colors}>
            <FaFileExport />
            <span>Exporter</span>
          </ExportButton>
        </HeaderActions>

        <SummaryCards className="summary-cards" colors={colors}>
          <StatCard className="finances" colors={colors}>
            <StatIconContainer colors={colors}>
              <FaEuroSign />
            </StatIconContainer>
            <StatContent>
              <StatValue colors={colors}>{statistiques?.finances?.montantGage?.toLocaleString('fr-FR') || '0'} € HT</StatValue>
              <StatLabel colors={colors}>Budget engagé</StatLabel>
              <StatDetail colors={colors}>
                <span>Conventions :</span>
                <span>{statistiques?.finances?.nbConventions || 0}</span>
              </StatDetail>
              <StatDetail colors={colors}>
                <span>Payé :</span>
                <span>{statistiques?.finances?.montantPaye?.toLocaleString('fr-FR') || '0'} € TTC</span>
              </StatDetail>
            </StatContent>
          </StatCard>
          
          <StatCard className="affaires" colors={colors}>
            <StatIconContainer colors={colors}>
              <FaFolder />
            </StatIconContainer>
            <StatContent>
              <StatValue colors={colors}>{statistiques?.affaires?.total || 0}</StatValue>
              <StatLabel colors={colors}>Affaires</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard className="redacteurs" colors={colors}>
            <StatIconContainer colors={colors}>
              <FaUsers />
            </StatIconContainer>
            <StatContent>
              <StatValue colors={colors}>{Object.keys(statistiques?.parRedacteur || {}).length}</StatValue>
              <StatLabel colors={colors}>Rédacteurs actifs</StatLabel>
              <StatDetail colors={colors}>
                <span>Bénéficiaires :</span>
                <span>{Object.values(statistiques?.parRedacteur || {}).reduce((a, b) => a + b, 0)}</span>
              </StatDetail>
            </StatContent>
          </StatCard>
        </SummaryCards>
        
        <Section colors={colors}>
          <SectionHeader colors={colors}>
            <SectionTitle colors={colors}>
              <FaChartBar />
              <span>Suivi budgétaire {annee === -1 ? "toutes années" : annee}</span>
            </SectionTitle>
          </SectionHeader>
          
          {annee === -1 ? (
            <InfoMessage colors={colors}>
              <p>Le suivi budgétaire mensuel n'est pas disponible pour l'option "Toutes les années".</p>
              <p>Veuillez sélectionner une année spécifique pour visualiser le graphique.</p>
            </InfoMessage>
          ) : (
            <StatistiquesBudget annee={annee} />
          )}
        </Section>
        
        <ChartsSection>
        <ChartCard className="redacteur-table" colors={colors}>
          <TableHeader colors={colors}>
            <TableHeaderIcon><FaUsers /></TableHeaderIcon>
            <TableHeaderTitle>Répartition par rédacteur</TableHeaderTitle>
          </TableHeader>
          <TableBody colors={colors}>
            <ResponsiveTable colors={colors}>
              <thead>
                <tr>
                  <th>Rédacteur</th>
                  <th>Bénéficiaires</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(statistiques?.parRedacteur || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([redacteur, count]) => {
                    const total = Object.values(statistiques?.parRedacteur || {})
                      .reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <TableRow key={`redacteur-${redacteur}`} colors={colors}>
                        <TableDataCell colors={colors}>
                          <TooltipText title={redacteur}>
                            {redacteur}
                          </TooltipText>
                        </TableDataCell>
                        <TableDataCell colors={colors} className="text-center">{count}</TableDataCell>
                        <TableDataCell colors={colors} className="text-center">
                          <PercentageBadge colors={colors}>{percentage}%</PercentageBadge>
                        </TableDataCell>
                      </TableRow>
                    );
                  })}
              </tbody>
            </ResponsiveTable>
          </TableBody>
        </ChartCard>
          
        <ChartCard className="circonstance-table" colors={colors}>
          <TableHeader colors={colors}>
            <TableHeaderIcon><FaExclamationTriangle /></TableHeaderIcon>
            <TableHeaderTitle>Répartition par circonstance</TableHeaderTitle>
          </TableHeader>
          <TableBody colors={colors}>
            <ResponsiveTable colors={colors}>
              <thead>
                <tr>
                  <th>Circonstance</th>
                  <th>Militaires</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(statistiques?.parCirconstance || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([circonstance, count]) => {
                    const total = Object.values(statistiques?.parCirconstance || {})
                      .reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <TableRow key={`circonstance-${circonstance}`} colors={colors}>
                        <TableDataCell colors={colors}>
                          <TooltipText title={circonstance}>
                            {circonstance}
                          </TooltipText>
                        </TableDataCell>
                        <TableDataCell colors={colors} className="text-center">{count}</TableDataCell>
                        <TableDataCell colors={colors} className="text-center">
                          <PercentageBadge colors={colors}>{percentage}%</PercentageBadge>
                        </TableDataCell>
                      </TableRow>
                    );
                  })}
              </tbody>
            </ResponsiveTable>
          </TableBody>
        </ChartCard>

        <ChartCard className="region-table" colors={colors}>
          <TableHeader colors={colors}>
            <TableHeaderIcon><FaMapMarked /></TableHeaderIcon>
            <TableHeaderTitle>Répartition par région</TableHeaderTitle>
          </TableHeader>
          <TableBody colors={colors}>
            <ResponsiveTable colors={colors}>
              <thead>
                <tr>
                  <th>Région</th>
                  <th>Militaires</th>
                  <th>Bénéficiaires</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(statistiques?.parRegion || {})
                  .sort((a, b) => b[1].nbMilitaires - a[1].nbMilitaires)
                  .map(([region, data]) => {
                    const totalMilitaires = Object.values(statistiques?.parRegion || {})
                      .reduce((a, b) => a + b.nbMilitaires, 0);
                    const percentage = totalMilitaires > 0 
                      ? ((data.nbMilitaires / totalMilitaires) * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <TableRow key={`region-${region}`} colors={colors}>
                        <TableDataCell colors={colors}>{region}</TableDataCell>
                        <TableDataCell colors={colors} className="text-center">{data.nbMilitaires}</TableDataCell>
                        <TableDataCell colors={colors} className="text-center">{data.nbBeneficiaires}</TableDataCell>
                        <TableDataCell colors={colors} className="text-center">
                          <PercentageBadge colors={colors}>{percentage}%</PercentageBadge>
                        </TableDataCell>
                      </TableRow>
                    );
                  })}
              </tbody>
            </ResponsiveTable>
          </TableBody>
        </ChartCard>

        <ChartCard className="departement-table" colors={colors}>
          <TableHeader colors={colors}>
            <TableHeaderIcon><FaMapMarkerAlt /></TableHeaderIcon>
            <TableHeaderTitle>Top 15 - Répartition par département</TableHeaderTitle>
          </TableHeader>
          <TableBody colors={colors}>
            {!statistiques?.parDepartement || Object.keys(statistiques.parDepartement).length === 0 ? (
              <EmptyState colors={colors}>
                <EmptyStateIcon>🏛️</EmptyStateIcon>
                <EmptyStateText>
                  Données par département non disponibles
                </EmptyStateText>
                <EmptyStateSubtext>
                  Cette fonctionnalité nécessite une mise à jour de l'API
                </EmptyStateSubtext>
              </EmptyState>
            ) : (
              <ResponsiveTable colors={colors}>
                <thead>
                  <tr>
                    <th>Département</th>
                    <th>Militaires</th>
                    <th>Bénéficiaires</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {processDepartementData(statistiques.parDepartement).map((item, index) => {
                    const totalMilitaires = Object.values(statistiques.parDepartement)
                      .reduce((a, b) => a + b.nbMilitaires, 0);
                    const percentage = totalMilitaires > 0 
                      ? ((item.nbMilitaires / totalMilitaires) * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <TableRow key={`departement-${index}`} colors={colors}>
                        <TableDataCell colors={colors}>
                          <DepartementName isAutres={item.nom.includes('Autres')}>
                            {item.nom}
                          </DepartementName>
                        </TableDataCell>
                        <TableDataCell colors={colors} className="text-center">
                          {item.nbMilitaires}
                        </TableDataCell>
                        <TableDataCell colors={colors} className="text-center">
                          {item.nbBeneficiaires}
                        </TableDataCell>
                        <TableDataCell colors={colors} className="text-center">
                          <PercentageBadge colors={colors} isAutres={item.nom.includes('Autres')}>
                            {percentage}%
                          </PercentageBadge>
                        </TableDataCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </ResponsiveTable>
            )}
          </TableBody>
        </ChartCard>

        </ChartsSection>
      </div> {/* Fermeture de la div ref={statsRef} */}
      
      {/* Modal d'export avec mise à jour pour supporter l'option "Toutes les années" */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        annee={annee}
        isAllYears={annee === -1}
      />
    </Container>
  );
};

// Styled Components avec thématisation
const Container = styled.div`
  padding: 20px;
  max-width: 100%;
  overflow-x: hidden;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

const Section = styled.section`
  margin-bottom: 30px;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  padding: 20px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  display: flex;
  align-items: center;
  margin: 0;
  transition: color 0.3s ease;
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.primary};
  }
`;

const YearSelector = styled.div`
  display: flex;
  align-items: center;
`;

const YearLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  margin-right: 12px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  min-width: 120px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  padding: 20px;
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  &.finances {
    border-left: 4px solid ${props => props.colors.primary};
  }
  
  &.affaires {
    border-left: 4px solid ${props => props.colors.success};
  }
  
  &.redacteurs {
    border-left: 4px solid ${props => props.colors.error};
  }
  
  &:hover {
    box-shadow: ${props => props.colors.shadowHover};
    transform: translateY(-2px);
  }
`;

const StatIconContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  transition: all 0.3s ease;
  
  .finances & {
    background-color: ${props => props.colors?.cardIcon?.finances?.bg || '#e3f2fd'};
    color: ${props => props.colors?.cardIcon?.finances?.color || '#1976d2'};
  }
  
  .affaires & {
    background-color: ${props => props.colors?.cardIcon?.militaires?.bg || '#e8f5e9'};
    color: ${props => props.colors?.cardIcon?.militaires?.color || '#388e3c'};
  }
  
  .redacteurs & {
    background-color: ${props => props.colors?.cardIcon?.beneficiaires?.bg || '#fff8e1'};
    color: ${props => props.colors?.cardIcon?.beneficiaires?.color || '#f57f17'};
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 8px;
  transition: color 0.3s ease;
`;

const StatDetail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
`;

const BlockTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: ${props => props.colors.primary};
  margin: 0;
  padding: 10px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: background-color 0.3s ease;
`;

// Styles mis à jour pour le design avec contours accentués
const TableTitle = styled.div`
  padding: 16px;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  background-color: ${props => props.colors.surfaceHover};
  border-bottom: 2px solid ${props => props.colors.primary};
  transition: all 0.3s ease;
`;

const TablesRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TableCard = styled.div`
  background: ${props => props.colors.surface};
  border-radius: 4px;
  overflow: hidden;
  box-shadow: ${props => props.colors.shadow};
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 2px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  @media (max-width: 768px) {
    overflow-x: auto;
    
    table {
      min-width: 450px; /* Garantir une largeur minimale en mobile */
    }
  }
`;

const CompactTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
  
  .bg-header {
    background-color: ${props => props.colors.surfaceHover};
  }
  
  @media (max-width: 1400px) {
    font-size: 12px;
  }
`;

const Tr = styled.tr`
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
  }
`;

const YearCell = styled.td`
  padding: 12px 8px;
  font-weight: 600;
  font-size: 16px;
  color: ${props => props.colors.primary};
  border-bottom: 1px solid ${props => props.colors.borderLight};
  text-align: left;
  transition: all 0.3s ease;
  
  @media (max-width: 1400px) {
    padding: 10px 6px;
    font-size: 14px;
  }
`;

const Td = styled.td`
  padding: 12px 8px;
  color: ${props => props.colors.textPrimary};
  border-bottom: 1px solid ${props => props.colors.borderLight};
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  
  /* Container pour les valeurs et variations */
  .value-container {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }
  
  /* Valeur numérique avec largeur adaptative */
  .value {
    min-width: unset;
    margin-right: 4px;
  }
  
  @media (max-width: 1400px) {
    padding: 10px 6px;
  }
`;

const TotalRow = styled.tr`
  background-color: ${props => props.colors.surfaceHover} !important;
  font-weight: 600;
`;

const TotalCell = styled.td`
  padding: 14px 8px;
  color: ${props => props.colors.textPrimary};
  border-top: 2px solid ${props => props.colors.border};
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  
  @media (max-width: 1400px) {
    padding: 12px 6px;
  }
`;

// Styles pour les tableaux des répartitions
const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  height: 1200px; /* Hauteur fixe pour garder l'alignement */
  
  @media (max-width: 1400px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    height: auto;
  }
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const ChartCard = styled.div`
  background: ${props => props.colors.surface};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 600px; /* Limiter la hauteur */
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;


const TableHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.primary}, ${props => props.colors.primary}dd);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 3px solid ${props => props.colors.primary};
`;

const TableHeaderIcon = styled.div`
  font-size: 20px;
  margin-right: 12px;
  opacity: 0.9;
`;

const TableHeaderTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const TableBody = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    overflow-x: auto;
  }
`;

const ResponsiveTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  table-layout: fixed; /* Important pour contrôler les largeurs */
  
  thead {
    background-color: ${props => props.colors.surfaceHover};
    
    th {
      padding: 16px 8px;
      font-weight: 600;
      color: ${props => props.colors.textPrimary};
      text-align: left;
      border-bottom: 2px solid ${props => props.colors.borderLight};
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      /* Largeurs spécifiques selon le type de tableau */
      &:first-child {
        width: 60%; /* Nom/libellé prend plus de place */
      }
      
      &:nth-child(2) {
        width: 25%; /* Nombre */
        text-align: center;
      }
      
      &:nth-child(3) {
        width: 25%; /* Pourcentage ou autre nombre */
        text-align: center;
      }
      
      &:nth-child(4) {
        width: 15%; /* Pourcentage final */
        text-align: center;
      }
    }
  }
  
  tbody {
    display: block;
    max-height: 400px; /* Hauteur fixe avec scroll */
    overflow-y: auto;
    width: 100%;
    
    tr {
      display: table;
      width: 100%;
      table-layout: fixed;
      transition: all 0.2s ease;
      
      &:nth-child(even) {
        background-color: ${props => props.colors.surfaceHover}40;
      }
      
      &:hover {
        background-color: ${props => props.colors.primary}10;
        transform: scale(1.01);
      }
    }
  }
  
  @media (max-width: 768px) {
    min-width: 400px;
    font-size: 13px;
    
    thead th {
      padding: 12px 6px;
      font-size: 12px;
    }
    
    tbody {
      max-height: 300px;
    }
  }
`;

const TableDataCell = styled.td`
  padding: 12px 8px;
  color: ${props => props.colors.textPrimary};
  border-bottom: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &.text-center {
    text-align: center;
  }
  
  &:first-child {
    font-weight: 500;
    white-space: nowrap;
  }
  
  @media (max-width: 768px) {
    padding: 10px 6px;
    font-size: 12px;
  }
`;


const TableRow = styled.tr`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, ${props => props.colors.primary}, transparent);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
`;

const VariationUp = styled.span`
  color: ${props => props.colors?.success || '#4caf50'};
  font-size: 11px;
  font-weight: 500;
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  min-width: unset;
  
  &.significant {
    font-weight: 600;
  }
  
  @media (max-width: 1400px) {
    font-size: 10px;
  }
`;

const VariationDown = styled.span`
  color: ${props => props.colors?.error || '#f44336'};
  font-size: 11px;
  font-weight: 500;
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  min-width: unset;
  
  &.significant {
    font-weight: 600;
  }
  
  @media (max-width: 1400px) {
    font-size: 10px;
  }
`;

// Nouveaux styles pour l'export
const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  background-color: ${props => props.colors?.success || '#4caf50'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: ${props => props.colors?.shadow || '0 2px 4px rgba(0, 0, 0, 0.1)'};
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.colors?.success ? `${props.colors.success}dd` : '#388e3c'};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors?.shadowHover || '0 4px 8px rgba(0, 0, 0, 0.15)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const InfoMessage = styled.div`
  padding: 20px;
  background-color: ${props => props.colors?.successBg || '#e8f5e9'};
  border-radius: 4px;
  color: ${props => props.colors?.success || '#2e7d32'};
  text-align: center;
  font-size: 16px;
  border: 1px solid ${props => props.colors?.success ? `${props.colors.success}40` : '#4caf5040'};
  transition: all 0.3s ease;
  
  p {
    margin: 8px 0;
  }
`;

const SummaryTableHeader = styled.th`
  padding: 12px 8px;
  color: ${props => props.colors.textPrimary};
  font-weight: 600;
  font-size: 12px;
  border-bottom: 2px solid ${props => props.colors.border};
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  
  .full-text {
    display: inline;
  }
  
  .short-text {
    display: none;
  }
  
  @media (max-width: 1400px) {
    padding: 10px 6px;
    font-size: 11px;
    
    .full-text {
      display: none;
    }
    
    .short-text {
      display: inline;
    }
  }
  
  @media (max-width: 1200px) {
    padding: 8px 4px;
    font-size: 10px;
  }
`;

const DepartementName = styled.span`
  ${props => props.isAutres && `
    font-style: italic;
    color: ${props.colors?.textSecondary || '#666'};
    font-weight: 400;
  `}
`;

const TooltipText = styled.span`
  cursor: help;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PercentageBadge = styled.span`
  background: linear-gradient(135deg, 
    ${props => props.isAutres ? 
      `${props.colors.textSecondary}15` : 
      `${props.colors.primary}20`
    }, 
    ${props => props.isAutres ? 
      `${props.colors.textSecondary}10` : 
      `${props.colors.primary}10`
    });
  color: ${props => props.isAutres ? 
    props.colors.textSecondary : 
    props.colors.primary
  };
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${props => props.isAutres ? 
    `${props.colors.textSecondary}30` : 
    `${props.colors.primary}30`
  };
  white-space: nowrap;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  min-height: 200px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyStateText = styled.h4`
  color: ${props => props.colors.textPrimary};
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
`;

const EmptyStateSubtext = styled.p`
  color: ${props => props.colors.textSecondary};
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
`;

export default Statistiques;