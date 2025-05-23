import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaEuroSign, FaUsers, FaFolder, FaCalendarAlt, FaFileExport } from 'react-icons/fa';
import { statistiquesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import ExportModal from '../components/specific/ExportModal';
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
  
  // Nouvel état pour la modale d'export
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Référence pour les éléments à exporter en PDF
  const statsRef = useRef(null);
  
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
              nbConventions: Object.values(response.data.finances || {})
                .reduce((sum, year) => sum + (year.nbConventions || 0), 0),
              nbPaiements: Object.values(response.data.finances || {})
                .reduce((sum, year) => sum + (year.nbPaiements || 0), 0)
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
      <Container>
        <PageHeader title="Statistiques" />
        <Loading>Chargement des statistiques...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <PageHeader title="Statistiques" />
        <Error>{error}</Error>
      </Container>
    );
  }
  
  return (
    <Container>
      <PageHeader 
        title="Statistiques" 
        subtitle="Analyse des données de protection juridique complémentaire"
      />
      
      <SectionHeader>
          <SectionTitle>
            <FaChartBar />
            <span>Synthèse globale depuis la mise en place du dispositif</span>
          </SectionTitle>
        </SectionHeader>

      {/* Ajout de la référence pour l'export PDF */}
      <div ref={statsRef}>
        {/* Section des statistiques globales avec 3 tableaux côte à côte */}
        <Section>       
          <TablesRow>
            {/* Premier tableau: Bénéficiaires - Conventions */}
            <TableCard>
              <TableTitle>Bénéficiaires - Conventions</TableTitle>
              <CompactTable>
                <thead>
                  <tr className="bg-header">
                    <SummaryTableHeader>Année</SummaryTableHeader>
                    <SummaryTableHeader>
                      <span className="full-text">Nombre de bénéficiaires</span>
                      <span className="short-text">Bénéficiaires</span>
                    </SummaryTableHeader>
                    <SummaryTableHeader>
                      <span className="full-text">Nombre de conventions</span>
                      <span className="short-text">Conventions</span>
                    </SummaryTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {dataWithVariations.map(({ year, data, variations }) => (
                    <Tr key={`conventions-${year}`}>
                      <YearCell>{year}</YearCell>
                      <Td>
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
                      <Td>
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
                  <TotalRow>
                    <TotalCell>TOTAL</TotalCell>
                    <TotalCell>{totals.nbBeneficiaires}</TotalCell>
                    <TotalCell>{totals.nbConventions}</TotalCell>
                  </TotalRow>
                </tbody>
              </CompactTable>
            </TableCard>
            {/* Deuxième tableau: Montants totaux gagés (HT et TTC) */}
            <TableCard>
              <TableTitle>Montant Total Gagé</TableTitle>
              <CompactTable>
                <thead>
                  <tr className="bg-header">
                    <SummaryTableHeader>Année</SummaryTableHeader>
                    <SummaryTableHeader>
                      <span className="full-text">Montant total gagé HT</span>
                      <span className="short-text">Gagé HT</span>
                    </SummaryTableHeader>
                    <SummaryTableHeader>
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
                      <Tr key={`montants-${year}`}>
                        <YearCell>{year}</YearCell>
                        <Td>
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
                        <Td>
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
                  <TotalRow>
                    <TotalCell>TOTAL</TotalCell>
                    <TotalCell>{totals.montantGageHT > 0 ? `${totals.montantGageHT.toLocaleString('fr-FR')} €` : '0 €'}</TotalCell>
                    <TotalCell>{totals.montantGageHT > 0 ? `${(totals.montantGageHT * 1.2).toLocaleString('fr-FR')} €` : '0 €'}</TotalCell>
                  </TotalRow>
                </tbody>
              </CompactTable>
            </TableCard>
            {/* Troisième tableau: Dépenses ordonnées */}
            <TableCard>
              <TableTitle>Dépenses Ordonnées</TableTitle>
              <CompactTable>
                <thead>
                  <tr className="bg-header">
                    <SummaryTableHeader>Année</SummaryTableHeader>
                    <SummaryTableHeader>
                      <span className="full-text">Nombre de règlements</span>
                      <span className="short-text">Règlements</span>
                    </SummaryTableHeader>
                    <SummaryTableHeader>
                      <span className="full-text">Montant total ordonné TTC</span>
                      <span className="short-text">Ordonné TTC</span>
                    </SummaryTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {dataWithVariations.map(({ year, data, variations }) => (
                    <Tr key={`ordonnes-${year}`}>
                      <YearCell>{year}</YearCell>
                      <Td>
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
                      <Td>
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
                  <TotalRow>
                    <TotalCell>TOTAL</TotalCell>
                    <TotalCell>{totals.nbReglements}</TotalCell>
                    <TotalCell>{totals.montantPaye > 0 ? `${totals.montantPaye.toLocaleString('fr-FR')} €` : '0 €'}</TotalCell>
                  </TotalRow>
                </tbody>
              </CompactTable>
            </TableCard>
          </TablesRow>
        </Section>
        
        <SectionHeader>
            <SectionTitle>
              <FaCalendarAlt/>
              <span>Synthèse par année</span>
            </SectionTitle>
        </SectionHeader>
        
        {/* Remplacer le sélecteur d'année par les actions */}
        <HeaderActions>
          <YearSelector>
            <YearLabel>Année budgétaire :</YearLabel>
            <Select
              value={annee}
              onChange={(e) => setAnnee(parseInt(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === -1 ? "Toutes les années" : year}
                </option>
              ))}
            </Select>
          </YearSelector>
          
          <ExportButton onClick={() => setShowExportModal(true)}>
            <FaFileExport />
            <span>Exporter</span>
          </ExportButton>
        </HeaderActions>

        <SummaryCards className="summary-cards">
          <StatCard className="finances">
            <StatIconContainer>
              <FaEuroSign />
            </StatIconContainer>
            <StatContent>
              <StatValue>{statistiques?.finances?.montantGage?.toLocaleString('fr-FR') || '0'} € HT</StatValue>
              <StatLabel>Budget engagé</StatLabel>
              <StatDetail>
                <span>Conventions :</span>
                <span>{statistiques?.finances?.nbConventions || 0}</span>
              </StatDetail>
              <StatDetail>
                <span>Payé :</span>
                <span>{statistiques?.finances?.montantPaye?.toLocaleString('fr-FR') || '0'} € TTC</span>
              </StatDetail>
            </StatContent>
          </StatCard>
          
          <StatCard className="affaires">
            <StatIconContainer>
              <FaFolder />
            </StatIconContainer>
            <StatContent>
              <StatValue>{statistiques?.affaires?.total || 0}</StatValue>
              <StatLabel>Affaires</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard className="redacteurs">
            <StatIconContainer>
              <FaUsers />
            </StatIconContainer>
            <StatContent>
              <StatValue>{Object.keys(statistiques?.parRedacteur || {}).length}</StatValue>
              <StatLabel>Rédacteurs actifs</StatLabel>
              <StatDetail>
                <span>Bénéficiaires :</span>
                <span>{Object.values(statistiques?.parRedacteur || {}).reduce((a, b) => a + b, 0)}</span>
              </StatDetail>
            </StatContent>
          </StatCard>
        </SummaryCards>
        
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FaChartBar />
              <span>Suivi budgétaire {annee === -1 ? "toutes années" : annee}</span>
            </SectionTitle>
          </SectionHeader>
          
          {annee === -1 ? (
            <InfoMessage>
              <p>Le suivi budgétaire mensuel n'est pas disponible pour l'option "Toutes les années".</p>
              <p>Veuillez sélectionner une année spécifique pour visualiser le graphique.</p>
            </InfoMessage>
          ) : (
            <StatistiquesBudget annee={annee} />
          )}
        </Section>
        
        <ChartsSection>
        <ChartCard className="redacteur-table">
          <BlockTitle>Répartition par rédacteur</BlockTitle>
          <ResponsiveTable>
            <thead>
              <tr>
                <TableHeader>Rédacteur</TableHeader>
                <TableHeader>Bénéficiaires</TableHeader>
                <TableHeader>Pourcentage</TableHeader>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statistiques?.parRedacteur || {}).sort((a, b) => b[1] - a[1]).map(([redacteur, count]) => {
                const total = Object.values(statistiques?.parRedacteur || {}).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                
                return (
                  <TableRow key={`redacteur-${redacteur}`}>
                    <TableDataCell>{redacteur}</TableDataCell>
                    <TableDataCell>{count}</TableDataCell>
                    <TableDataCell>{percentage}%</TableDataCell>
                  </TableRow>
                );
              })}
            </tbody>
          </ResponsiveTable>
        </ChartCard>
          
        <ChartCard className="circonstance-table">
          <BlockTitle>Répartition par circonstance</BlockTitle>
          <ResponsiveTable>
            <thead>
              <tr>
                <TableHeader>Circonstance</TableHeader>
                <TableHeader>Militaires</TableHeader>
                <TableHeader>Pourcentage</TableHeader>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statistiques?.parCirconstance || {}).sort((a, b) => b[1] - a[1]).map(([circonstance, count]) => {
                const total = Object.values(statistiques?.parCirconstance || {}).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                
                return (
                  <TableRow key={`circonstance-${circonstance}`}>
                    <TableDataCell>{circonstance}</TableDataCell>
                    <TableDataCell>{count}</TableDataCell>
                    <TableDataCell>{percentage}%</TableDataCell>
                  </TableRow>
                );
              })}
            </tbody>
          </ResponsiveTable>
        </ChartCard>

        <ChartCard className="region-table">
          <BlockTitle>Répartition par région</BlockTitle>
          <ResponsiveTable>
            <thead>
              <tr>
                <TableHeader>Région</TableHeader>
                <TableHeader>Militaires</TableHeader>
                <TableHeader>Bénéficiaires</TableHeader>
                <TableHeader>Pourcentage</TableHeader>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statistiques?.parRegion || {}).sort((a, b) => b[1].nbMilitaires - a[1].nbMilitaires).map(([region, data]) => {
                const totalMilitaires = Object.values(statistiques?.parRegion || {}).reduce((a, b) => a + b.nbMilitaires, 0);
                const percentage = totalMilitaires > 0 ? ((data.nbMilitaires / totalMilitaires) * 100).toFixed(1) : 0;
                
                return (
                  <TableRow key={`region-${region}`}>
                    <TableDataCell>{region}</TableDataCell>
                    <TableDataCell>{data.nbMilitaires}</TableDataCell>
                    <TableDataCell>{data.nbBeneficiaires}</TableDataCell>
                    <TableDataCell>{percentage}%</TableDataCell>
                  </TableRow>
                );
              })}
            </tbody>
          </ResponsiveTable>
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

// Styles existants non modifiés
const Section = styled.section`
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
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
  color: #333;
  display: flex;
  align-items: center;
  margin: 0;
  
  svg {
    margin-right: 8px;
    color: #3f51b5;
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
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  min-width: 120px;
  
  &:focus {
    border-color: #3f51b5;
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  
  &.finances {
    border-left: 4px solid #3f51b5;
  }
  
  &.affaires {
    border-left: 4px solid #4caf50;
  }
  
  &.redacteurs {
    border-left: 4px solid #f44336;
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
  
  .finances & {
    background-color: #e8eaf6;
    color: #3f51b5;
  }
  
  .affaires & {
    background-color: #e8f5e9;
    color: #4caf50;
  }
  
  .redacteurs & {
    background-color: #ffebee;
    color: #f44336;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #757575;
  margin-bottom: 8px;
`;

const StatDetail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #757575;
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: #757575;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BlockTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: #3f51b5;
  margin: 0;
  padding: 10px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: rgba(63, 81, 181, 0.05);
  }
`;

// Styles mis à jour pour le design avec contours accentués
const TableTitle = styled.div`
  padding: 16px;
  font-weight: 600;
  color: #424242;
  background-color: #f7f7f7;
  border-bottom: 2px solid #3f51b5;
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
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 2px solid #ddd;
  
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
  
  .bg-header {
    background-color: #f5f5f5;
  }
  
  @media (max-width: 1400px) {
    font-size: 12px;
  }
`;

const Th = styled.th`
  padding: 12px 8px;
  color: #555;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 2px solid #ddd;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 1400px) {
    padding: 10px 6px;
    font-size: 11px;
  }
`;

const Tr = styled.tr`
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const YearCell = styled.td`
  padding: 12px 8px;
  font-weight: 600;
  font-size: 16px;
  color: #3f51b5;
  border-bottom: 1px solid #eee;
  text-align: left;
  
  @media (max-width: 1400px) {
    padding: 10px 6px;
    font-size: 14px;
  }
`;

const Td = styled.td`
  padding: 12px 8px;
  color: #333;
  border-bottom: 1px solid #eee;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
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
  background-color: #f5f5f5 !important;
  font-weight: 600;
`;

const TotalCell = styled.td`
  padding: 14px 8px;
  color: #333;
  border-top: 2px solid #ddd;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 1400px) {
    padding: 12px 6px;
  }
`;

// Styles pour les tableaux des répartitions
const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ChartCard = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: auto;
  min-height: 400px;
  overflow: hidden;
`;

const ResponsiveTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: auto;
`;

const TableHeader = styled.th`
  background-color: #f5f5f5;
  color: #333;
  padding: 8px 12px;
  font-weight: 500;
  border-bottom: 2px solid #e0e0e0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:nth-child(2), &:nth-child(3) {
    text-align: center;
  }
`;

const TableDataCell = styled.td`
  padding: 8px 12px;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:nth-child(2), &:nth-child(3) {
    text-align: center;
  }
`;

const Container = styled.div`
  padding: 20px;
  max-width: 100%;
  overflow-x: hidden;
`;

const VariationUp = styled.span`
  color: #4caf50;
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
  color: #f44336;
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
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #388e3c;
  }
  
  &:active {
    background-color: #2e7d32;
  }
`;

const InfoMessage = styled.div`
  padding: 20px;
  background-color: #e8f5e9;
  border-radius: 4px;
  color: #2e7d32;
  text-align: center;
  font-size: 16px;
  
  p {
    margin: 8px 0;
  }
`;

const SummaryTableHeader = styled.th`
  padding: 12px 8px;
  color: #555;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 2px solid #ddd;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
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

export default Statistiques;