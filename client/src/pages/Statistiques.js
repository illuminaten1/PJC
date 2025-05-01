import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaEuroSign, FaUsers, FaFolder, FaCalendarAlt } from 'react-icons/fa';
import { statistiquesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
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
  
  // Générer les années pour le sélecteur (à partir de 2023 jusqu'à l'année actuelle + 1)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const years = [];
    
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
      const response = await statistiquesAPI.getByAnnee(annee);
      setStatistiques(response.data);
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

      {/* Section des statistiques globales avec 3 tableaux côte à côte */}
      <Section>       
        <TablesRow>
          {/* Premier tableau: Bénéficiaires - Conventions */}
          <TableCard>
            <TableTitle>Bénéficiaires - Conventions</TableTitle>
            <CompactTable>
              <thead>
                <tr className="bg-header">
                  <Th>Année</Th>
                  <Th>Nombre de bénéficiaires</Th>
                  <Th>Nombre de conventions</Th>
                </tr>
              </thead>
              <tbody>
                {years.map(year => (
                  <Tr key={`conventions-${year}`}>
                    <YearCell>{year}</YearCell>
                    <Td>{statsGlobales?.parAnnee?.[year]?.nbBeneficiaires || 0}</Td>
                    <Td>{statsGlobales?.parAnnee?.[year]?.nbConventions || 0}</Td>
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
                  <Th>Année</Th>
                  <Th>Montant total gagé HT</Th>
                  <Th>Montant total gagé TTC</Th>
                </tr>
              </thead>
              <tbody>
                {years.map(year => {
                  const montantHT = statsGlobales?.parAnnee?.[year]?.montantGageHT || 0;
                  const montantTTC = montantHT * 1.2;
                  
                  return (
                    <Tr key={`montants-${year}`}>
                      <YearCell>{year}</YearCell>
                      <Td>{montantHT > 0 ? `${montantHT.toLocaleString('fr-FR')} €` : '0 €'}</Td>
                      <Td>{montantTTC > 0 ? `${montantTTC.toLocaleString('fr-FR')} €` : '0 €'}</Td>
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
                  <Th>Année</Th>
                  <Th>Nombre de règlements</Th>
                  <Th>Montant total ordonné TTC</Th>
                </tr>
              </thead>
              <tbody>
                {years.map(year => (
                  <Tr key={`ordonnes-${year}`}>
                    <YearCell>{year}</YearCell>
                    <Td>{statsGlobales?.parAnnee?.[year]?.nbReglements || 0}</Td>
                    <Td>
                      {(statsGlobales?.parAnnee?.[year]?.montantPaye || 0) > 0 
                        ? `${(statsGlobales?.parAnnee?.[year]?.montantPaye).toLocaleString('fr-FR')} €` 
                        : '0 €'}
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
      <YearSelector>
        <YearLabel>Année budgétaire :</YearLabel>
        <Select
          value={annee}
          onChange={(e) => setAnnee(parseInt(e.target.value))}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
      </YearSelector>
      
      <SummaryCards>
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
            <span>Suivi budgétaire {annee}</span>
          </SectionTitle>
        </SectionHeader>
        
        <StatistiquesBudget annee={annee} />
      </Section>
      
      <ChartsSection>
      <ChartCard>
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
        
      <ChartCard>
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
      </ChartsSection>
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
  margin-bottom: 24px;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
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
`;

const CompactTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: auto;
  
  .bg-header {
    background-color: #f5f5f5;
  }
`;

const Th = styled.th`
  padding: 12px 16px;
  color: #555;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 2px solid #ddd;
  text-align: left;
  
  &:first-child {
    text-align: left;
  }
  
  &:last-child, &:nth-last-child(2) {
    text-align: right;
  }
`;

const Tr = styled.tr`
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const YearCell = styled.td`
  padding: 12px 16px;
  font-weight: 600;
  font-size: 16px;
  color: #3f51b5;
  border-bottom: 1px solid #eee;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px 16px;
  color: #333;
  border-bottom: 1px solid #eee;
  text-align: right;
  
  &:first-child {
    text-align: left;
  }
`;

const TotalRow = styled.tr`
  background-color: #f5f5f5 !important;
  font-weight: 600;
`;

const TotalCell = styled.td`
  padding: 14px 16px;
  color: #333;
  border-top: 2px solid #ddd;
  text-align: right;
  font-weight: 600;
  
  &:first-child {
    text-align: left;
    color: #444;
  }
`;

// Styles non modifiés pour les autres tableaux
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

export default Statistiques;