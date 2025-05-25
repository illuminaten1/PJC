import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaEuroSign, FaUsers, FaFolder, FaCalendarAlt, FaFileExport } from 'react-icons/fa';
import { statistiquesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import ExportModal from '../components/specific/ExportModal';
import { useTheme } from '../contexts/ThemeContext';
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
            parRegion: {},
            // Agréger les statistiques par département de toutes les années
            parDepartement: {}
          };
          
          // Récupérer les données détaillées pour chaque année pour construire 
          // les agrégations par rédacteur, circonstance, région et département
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

                // Agréger les départements
                if (yearStats.data.parDepartement) {
                  Object.entries(yearStats.data.parDepartement).forEach(([departement, data]) => {
                    if (!allYearsData.parDepartement[departement]) {
                      allYearsData.parDepartement[departement] = { nbMilitaires: 0, nbBeneficiaires: 0 };
                    }
                    allYearsData.parDepartement[departement].nbMilitaires += data.nbMilitaires || 0;
                    allYearsData.parDepartement[departement].nbBeneficiaires += data.nbBeneficiaires || 0;
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
        parDepartement: options.includeDepartementTable ? statistiques?.parDepartement || {} : {},
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
        
        {/* Section des tableaux de répartition avec design amélioré */}
        <DistributionSection colors={colors}>
          <SectionHeader colors={colors}>
            <SectionTitle colors={colors}>
              <FaUsers />
              <span>Répartitions détaillées {annee === -1 ? "toutes années" : annee}</span>
            </SectionTitle>
          </SectionHeader>
          
          <DistributionGrid>
            {/* Tableau Rédacteurs */}
            <DistributionCard colors={colors}>
              <DistributionHeader colors={colors}>
                <DistributionTitle>Répartition par rédacteur</DistributionTitle>
                <DistributionBadge colors={colors}>
                  {Object.keys(statistiques?.parRedacteur || {}).length} rédacteurs
                </DistributionBadge>
              </DistributionHeader>
              
              <DistributionTableWrapper>
                <DistributionTable colors={colors}>
                  <thead>
                    <tr>
                      <DistributionTh colors={colors}>Rédacteur</DistributionTh>
                      <DistributionTh colors={colors} className="center">Bénéficiaires</DistributionTh>
                      <DistributionTh colors={colors} className="center">%</DistributionTh>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistiques?.parRedacteur || {}).sort((a, b) => b[1] - a[1]).map(([redacteur, count], index) => {
                      const total = Object.values(statistiques?.parRedacteur || {}).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      
                      return (
                        <DistributionTr key={`redacteur-${redacteur}`} colors={colors} isEven={index % 2 === 0}>
                          <DistributionTd colors={colors}>
                            <DistributionName>{redacteur}</DistributionName>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionValue colors={colors}>{count}</DistributionValue>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionPercentage colors={colors}>{percentage}%</DistributionPercentage>
                          </DistributionTd>
                        </DistributionTr>
                      );
                    })}
                  </tbody>
                </DistributionTable>
              </DistributionTableWrapper>
            </DistributionCard>

            {/* Tableau Circonstances */}
            <DistributionCard colors={colors}>
              <DistributionHeader colors={colors}>
                <DistributionTitle>Répartition par circonstance</DistributionTitle>
                <DistributionBadge colors={colors}>
                  {Object.keys(statistiques?.parCirconstance || {}).length} circonstances
                </DistributionBadge>
              </DistributionHeader>
              
              <DistributionTableWrapper>
                <DistributionTable colors={colors}>
                  <thead>
                    <tr>
                      <DistributionTh colors={colors}>Circonstance</DistributionTh>
                      <DistributionTh colors={colors} className="center">Militaires</DistributionTh>
                      <DistributionTh colors={colors} className="center">%</DistributionTh>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistiques?.parCirconstance || {}).sort((a, b) => b[1] - a[1]).map(([circonstance, count], index) => {
                      const total = Object.values(statistiques?.parCirconstance || {}).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      
                      return (
                        <DistributionTr key={`circonstance-${circonstance}`} colors={colors} isEven={index % 2 === 0}>
                          <DistributionTd colors={colors}>
                            <DistributionName>{circonstance}</DistributionName>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionValue colors={colors}>{count}</DistributionValue>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionPercentage colors={colors}>{percentage}%</DistributionPercentage>
                          </DistributionTd>
                        </DistributionTr>
                      );
                    })}
                  </tbody>
                </DistributionTable>
              </DistributionTableWrapper>
            </DistributionCard>

            {/* Tableau Régions */}
            <DistributionCard colors={colors}>
              <DistributionHeader colors={colors}>
                <DistributionTitle>Répartition par région</DistributionTitle>
                <DistributionBadge colors={colors}>
                  {Object.keys(statistiques?.parRegion || {}).length} régions
                </DistributionBadge>
              </DistributionHeader>
              
              <DistributionTableWrapper>
                <DistributionTable colors={colors}>
                  <thead>
                    <tr>
                      <DistributionTh colors={colors}>Région</DistributionTh>
                      <DistributionTh colors={colors} className="center">Militaires</DistributionTh>
                      <DistributionTh colors={colors} className="center">Bénéficiaires</DistributionTh>
                      <DistributionTh colors={colors} className="center">%</DistributionTh>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistiques?.parRegion || {}).sort((a, b) => b[1].nbMilitaires - a[1].nbMilitaires).map(([region, data], index) => {
                      const totalMilitaires = Object.values(statistiques?.parRegion || {}).reduce((a, b) => a + b.nbMilitaires, 0);
                      const percentage = totalMilitaires > 0 ? ((data.nbMilitaires / totalMilitaires) * 100).toFixed(1) : 0;
                      
                      return (
                        <DistributionTr key={`region-${region}`} colors={colors} isEven={index % 2 === 0}>
                          <DistributionTd colors={colors}>
                            <DistributionName>{region}</DistributionName>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionValue colors={colors}>{data.nbMilitaires}</DistributionValue>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionValue colors={colors}>{data.nbBeneficiaires}</DistributionValue>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionPercentage colors={colors}>{percentage}%</DistributionPercentage>
                          </DistributionTd>
                        </DistributionTr>
                      );
                    })}
                  </tbody>
                </DistributionTable>
              </DistributionTableWrapper>
            </DistributionCard>

            {/* Nouveau tableau Départements */}
            <DistributionCard colors={colors}>
              <DistributionHeader colors={colors}>
                <DistributionTitle>Répartition par département</DistributionTitle>
                <DistributionBadge colors={colors}>
                  {Object.keys(statistiques?.parDepartement || {}).length} départements
                </DistributionBadge>
              </DistributionHeader>
              
              <DistributionTableWrapper>
                <DistributionTable colors={colors}>
                  <thead>
                    <tr>
                      <DistributionTh colors={colors}>Département</DistributionTh>
                      <DistributionTh colors={colors} className="center">Militaires</DistributionTh>
                      <DistributionTh colors={colors} className="center">Bénéficiaires</DistributionTh>
                      <DistributionTh colors={colors} className="center">%</DistributionTh>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistiques?.parDepartement || {}).sort((a, b) => b[1].nbMilitaires - a[1].nbMilitaires).map(([departement, data], index) => {
                      const totalMilitaires = Object.values(statistiques?.parDepartement || {}).reduce((a, b) => a + b.nbMilitaires, 0);
                      const percentage = totalMilitaires > 0 ? ((data.nbMilitaires / totalMilitaires) * 100).toFixed(1) : 0;
                      
                      return (
                        <DistributionTr key={`departement-${departement}`} colors={colors} isEven={index % 2 === 0}>
                          <DistributionTd colors={colors}>
                            <DistributionName>{departement}</DistributionName>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionValue colors={colors}>{data.nbMilitaires}</DistributionValue>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionValue colors={colors}>{data.nbBeneficiaires}</DistributionValue>
                          </DistributionTd>
                          <DistributionTd colors={colors} className="center">
                            <DistributionPercentage colors={colors}>{percentage}%</DistributionPercentage>
                          </DistributionTd>
                        </DistributionTr>
                      );
                    })}
                  </tbody>
                </DistributionTable>
              </DistributionTableWrapper>
            </DistributionCard>
          </DistributionGrid>
        </DistributionSection>
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
  border-radius: 12px;
  box-shadow: ${props => props.colors.shadow};
  padding: 24px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  display: flex;
  align-items: center;
  margin: 0;
  transition: color 0.3s ease;
  
  svg {
    margin-right: 12px;
    color: ${props => props.colors.primary};
    font-size: 18px;
  }
`;

const YearSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const YearLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const Select = styled.select`
  padding: 10px 16px;
  border: 2px solid ${props => props.colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  min-width: 160px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:focus {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.colors.primary}20;
  }
  
  &:hover {
    border-color: ${props => props.colors.primary};
  }
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
    padding: 8px;
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.surface} 0%, ${props => props.colors.surfaceHover} 100%);
  border-radius: 16px;
  box-shadow: ${props => props.colors.shadow};
  padding: 24px;
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${props => props.colors.primary} 0%, 
      ${props => props.colors.success} 50%, 
      ${props => props.colors.error} 100%
    );
  }
  
  &.finances::before {
    background: ${props => props.colors.primary};
  }
  
  &.affaires::before {
    background: ${props => props.colors.success};
  }
  
  &.redacteurs::before {
    background: ${props => props.colors.error};
  }
  
  &:hover {
    box-shadow: ${props => props.colors.shadowHover};
    transform: translateY(-4px) scale(1.02);
  }
`;

const StatIconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 28px;
  transition: all 0.3s ease;
  
  .finances & {
    background: linear-gradient(135deg, ${props => props.colors?.cardIcon?.finances?.bg || '#e3f2fd'} 0%, ${props => props.colors?.cardIcon?.finances?.bg || '#e3f2fd'}80 100%);
    color: ${props => props.colors?.cardIcon?.finances?.color || '#1976d2'};
  }
  
  .affaires & {
    background: linear-gradient(135deg, ${props => props.colors?.cardIcon?.militaires?.bg || '#e8f5e9'} 0%, ${props => props.colors?.cardIcon?.militaires?.bg || '#e8f5e9'}80 100%);
    color: ${props => props.colors?.cardIcon?.militaires?.color || '#388e3c'};
  }
  
  .redacteurs & {
    background: linear-gradient(135deg, ${props => props.colors?.cardIcon?.beneficiaires?.bg || '#fff8e1'} 0%, ${props => props.colors?.cardIcon?.beneficiaires?.bg || '#fff8e1'}80 100%);
    color: ${props => props.colors?.cardIcon?.beneficiaires?.color || '#f57f17'};
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: ${props => props.colors.textSecondary};
  font-weight: 500;
  margin-bottom: 12px;
  transition: color 0.3s ease;
`;

const StatDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  padding: 8px 0;
  border-top: 1px solid ${props => props.colors.borderLight};
  transition: color 0.3s ease;
  
  span:last-child {
    font-weight: 600;
    color: ${props => props.colors.textPrimary};
  }
`;

const Loading = styled.div`
  padding: 60px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surface};
  border-radius: 12px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  font-size: 18px;
`;

const Error = styled.div`
  padding: 32px;
  text-align: center;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  border-radius: 12px;
  box-shadow: ${props => props.colors.shadow};
  border: 2px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
  font-size: 16px;
`;

// Styles mis à jour pour le design avec contours accentués
const TableTitle = styled.div`
  padding: 20px 24px;
  font-weight: 600;
  font-size: 16px;
  color: ${props => props.colors.textPrimary};
  background: linear-gradient(135deg, ${props => props.colors.surfaceHover} 0%, ${props => props.colors.surface} 100%);
  border-bottom: 3px solid ${props => props.colors.primary};
  transition: all 0.3s ease;
`;

const TablesRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const TableCard = styled.div`
  background: ${props => props.colors.surface};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${props => props.colors.shadow};
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 2px solid ${props => props.colors.border};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: ${props => props.colors.shadowHover};
    transform: translateY(-2px);
    border-color: ${props => props.colors.primary}40;
  }
  
  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const CompactTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
  
  .bg-header {
    background: linear-gradient(135deg, ${props => props.colors.surfaceHover} 0%, ${props => props.colors.surface} 100%);
  }
  
  @media (max-width: 1400px) {
    font-size: 13px;
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Tr = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    transform: scale(1.01);
  }
`;

const YearCell = styled.td`
  padding: 16px 12px;
  font-weight: 700;
  font-size: 16px;
  color: ${props => props.colors.primary};
  border-bottom: 1px solid ${props => props.colors.borderLight};
  text-align: left;
  transition: all 0.3s ease;
  
  @media (max-width: 1400px) {
    padding: 14px 10px;
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 13px;
  }
`;

const Td = styled.td`
  padding: 16px 12px;
  color: ${props => props.colors.textPrimary};
  border-bottom: 1px solid ${props => props.colors.borderLight};
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  
  .value-container {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 6px;
  }
  
  .value {
    font-weight: 500;
  }
  
  @media (max-width: 1400px) {
    padding: 14px 10px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 8px;
  }
`;

const TotalRow = styled.tr`
  background: linear-gradient(135deg, ${props => props.colors.surfaceHover} 0%, ${props => props.colors.surface} 100%) !important;
  font-weight: 700;
`;

const TotalCell = styled.td`
  padding: 18px 12px;
  color: ${props => props.colors.textPrimary};
  border-top: 3px solid ${props => props.colors.primary};
  text-align: left;
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  
  @media (max-width: 1400px) {
    padding: 16px 10px;
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 14px 8px;
    font-size: 13px;
  }
`;

const VariationUp = styled.span`
  color: ${props => props.colors?.success || '#4caf50'};
  font-size: 11px;
  font-weight: 600;
  background-color: ${props => props.colors?.success ? `${props.colors.success}20` : '#4caf5020'};
  padding: 2px 6px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  
  &.significant {
    font-weight: 700;
    background-color: ${props => props.colors?.success ? `${props.colors.success}30` : '#4caf5030'};
  }
  
  @media (max-width: 1400px) {
    font-size: 10px;
    padding: 1px 4px;
  }
`;

const VariationDown = styled.span`
  color: ${props => props.colors?.error || '#f44336'};
  font-size: 11px;
  font-weight: 600;
  background-color: ${props => props.colors?.error ? `${props.colors.error}20` : '#f4433620'};
  padding: 2px 6px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  
  &.significant {
    font-weight: 700;
    background-color: ${props => props.colors?.error ? `${props.colors.error}30` : '#f4433630'};
  }
  
  @media (max-width: 1400px) {
    font-size: 10px;
    padding: 1px 4px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px 24px;
  background: linear-gradient(135deg, ${props => props.colors.surface} 0%, ${props => props.colors.surfaceHover} 100%);
  border-radius: 16px;
  box-shadow: ${props => props.colors.shadow};
  border: 2px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, ${props => props.colors?.success || '#4caf50'} 0%, ${props => props.colors?.success ? `${props.colors.success}dd` : '#388e3c'} 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.colors?.shadow || '0 4px 12px rgba(0, 0, 0, 0.15)'};
  
  svg {
    font-size: 16px;
  }
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${props => props.colors?.shadowHover || '0 8px 25px rgba(0, 0, 0, 0.2)'};
  }
  
  &:active {
    transform: translateY(0) scale(1.02);
  }
`;

const InfoMessage = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, ${props => props.colors?.successBg || '#e8f5e9'} 0%, ${props => props.colors?.successBg || '#e8f5e9'}80 100%);
  border-radius: 12px;
  color: ${props => props.colors?.success || '#2e7d32'};
  text-align: center;
  font-size: 16px;
  border: 2px solid ${props => props.colors?.success ? `${props.colors.success}40` : '#4caf5040'};
  transition: all 0.3s ease;
  
  p {
    margin: 8px 0;
    font-weight: 500;
  }
`;

const SummaryTableHeader = styled.th`
  padding: 16px 12px;
  color: ${props => props.colors.textPrimary};
  font-weight: 700;
  font-size: 13px;
  border-bottom: 2px solid ${props => props.colors.border};
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, ${props => props.colors.surfaceHover} 0%, ${props => props.colors.surface} 100%);
  
  .full-text {
    display: inline;
  }
  
  .short-text {
    display: none;
  }
  
  @media (max-width: 1400px) {
    padding: 14px 10px;
    font-size: 12px;
    
    .full-text {
      display: none;
    }
    
    .short-text {
      display: inline;
    }
  }
  
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 11px;
  }
`;

/* Nouveaux styles pour les tableaux de répartition améliorés */
const DistributionSection = styled.section`
  margin-bottom: 30px;
  background-color: ${props => props.colors.surface};
  border-radius: 16px;
  box-shadow: ${props => props.colors.shadow};
  padding: 24px;
  border: 2px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const DistributionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const DistributionCard = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.surface} 0%, ${props => props.colors.surfaceHover} 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${props => props.colors.shadow};
  border: 2px solid ${props => props.colors.border};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: fit-content;
  
  &:hover {
    box-shadow: ${props => props.colors.shadowHover};
    transform: translateY(-4px);
    border-color: ${props => props.colors.primary}60;
  }
`;

const DistributionHeader = styled.div`
  padding: 20px 24px;
  background: linear-gradient(135deg, ${props => props.colors.primary} 0%, ${props => props.colors.primary}dd 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid ${props => props.colors.primary};
`;

const DistributionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DistributionBadge = styled.span`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const DistributionTableWrapper = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  /* Scrollbar personnalisée */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.colors?.borderLight || '#f1f1f1'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.colors?.primary || '#1976d2'};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.colors?.primary ? `${props.colors.primary}dd` : '#1565c0'};
    }
  }
`;

const DistributionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const DistributionTh = styled.th`
  padding: 16px 20px;
  background: linear-gradient(135deg, ${props => props.colors.surfaceHover} 0%, ${props => props.colors.surface} 100%);
  color: ${props => props.colors.textPrimary};
  font-weight: 600;
  font-size: 13px;
  text-align: left;
  border-bottom: 2px solid ${props => props.colors.borderLight};
  position: sticky;
  top: 0;
  z-index: 1;
  transition: all 0.3s ease;
  
  &.center {
    text-align: center;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 12px;
  }
`;

const DistributionTr = styled.tr`
  background-color: ${props => props.isEven ? props.colors.surface : props.colors.surfaceHover};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    transform: scale(1.01);
    box-shadow: 0 2px 8px ${props => props.colors.primary}20;
  }
`;

const DistributionTd = styled.td`
  padding: 14px 20px;
  color: ${props => props.colors.textPrimary};
  border-bottom: 1px solid ${props => props.colors.borderLight};
  text-align: left;
  transition: all 0.3s ease;
  
  &.center {
    text-align: center;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const DistributionName = styled.div`
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const DistributionValue = styled.div`
  font-weight: 600;
  color: ${props => props.colors.primary};
  font-size: 15px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const DistributionPercentage = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.primary}20 0%, ${props => props.colors.primary}10 100%);
  color: ${props => props.colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
  display: inline-block;
  min-width: 40px;
  text-align: center;
  border: 1px solid ${props => props.colors.primary}30;
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

export default Statistiques;