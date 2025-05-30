import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { statistiquesAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatistiquesBudget = ({ annee = new Date().getFullYear() }) => {
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode, colors } = useTheme();
  
  useEffect(() => {
    fetchStatistiques();
  }, [annee]);
  
  const fetchStatistiques = async () => {
    setLoading(true);
    try {
      const response = await statistiquesAPI.getBudgetByAnnee(annee);
      setStatistiques(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques", err);
      setError("Impossible de charger les statistiques budgétaires");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Loading colors={colors}>Chargement des statistiques...</Loading>;
  }
  
  if (error) {
    return <Error colors={colors}>{error}</Error>;
  }
  
  if (!statistiques) {
    return <Empty colors={colors}>Aucune donnée disponible</Empty>;
  }
  
  // Préparation des données pour le graphique avec support du thème sombre
  const chartData = {
    labels: statistiques.parMois.map(mois => mois.nomMois),
    datasets: [
      {
        label: 'Montants engagés (€)',
        data: statistiques.parMois.map(mois => mois.gage.montant),
        backgroundColor: darkMode ? 'rgba(121, 134, 203, 0.9)' : 'rgba(63, 81, 181, 0.6)',
        borderColor: darkMode ? 'rgba(159, 168, 218, 1)' : 'rgba(63, 81, 181, 1)',
        borderWidth: 1,
      },
      {
        label: 'Montants payés (€)',
        data: statistiques.parMois.map(mois => mois.paye.montant),
        backgroundColor: darkMode ? 'rgba(129, 199, 132, 0.9)' : 'rgba(76, 175, 80, 0.6)',
        borderColor: darkMode ? 'rgba(165, 214, 167, 1)' : 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.textPrimary,
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            size: window.innerWidth < 768 ? 12 : 14
          },
          padding: window.innerWidth < 768 ? 10 : 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: `Répartition budgétaire par mois - ${annee}`,
        color: colors.textPrimary,
        font: {
          size: window.innerWidth < 768 ? 14 : 16,
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#e9ecef' : colors.textSecondary,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          minRotation: 0
        },
        grid: {
          color: darkMode ? '#495057' : colors.border,
          display: window.innerWidth >= 768
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#e9ecef' : colors.textSecondary,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          callback: function(value) {
            if (window.innerWidth < 768) {
              return value >= 1000000 
                ? (value / 1000000).toFixed(1) + 'M€'
                : value >= 1000 
                  ? (value / 1000).toFixed(0) + 'k€'
                  : value.toLocaleString('fr-FR') + '€';
            }
            return value.toLocaleString('fr-FR') + ' €';
          }
        },
        grid: {
          color: darkMode ? '#495057' : colors.border
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      bar: {
        borderRadius: window.innerWidth < 768 ? 2 : 4
      }
    }
  };
  
  return (
    <Container className="budget-section" colors={colors}>
      <ChartContainer className="budget-chart" colors={colors}>
        <Bar data={chartData} options={chartOptions} />
      </ChartContainer>
      
      <SummaryContainer>
        <SummaryTitle colors={colors}>Synthèse annuelle {annee}</SummaryTitle>
        
        <SummaryGrid className="budget-summary">
          <SummaryCard colors={colors}>
            <SummaryLabel colors={colors}>Total engagé</SummaryLabel>
            <SummaryValue colors={colors}>
              <ValueMain>{statistiques.totaux.montantGage.toLocaleString('fr-FR')} €</ValueMain>
              <ValueSub>HT</ValueSub>
            </SummaryValue>
          </SummaryCard>
          
          <SummaryCard colors={colors}>
            <SummaryLabel colors={colors}>Total payé</SummaryLabel>
            <SummaryValue colors={colors}>
              <ValueMain>{statistiques.totaux.montantPaye.toLocaleString('fr-FR')} €</ValueMain>
              <ValueSub>TTC</ValueSub>
            </SummaryValue>
          </SummaryCard>
          
          <SummaryCard colors={colors}>
            <SummaryLabel colors={colors}>Ratio payé/engagé</SummaryLabel>
            <SummaryValue colors={colors}>
              <ValueMain>{statistiques.totaux.ratio.toFixed(2)}</ValueMain>
              <ValueSub>%</ValueSub>
            </SummaryValue>
          </SummaryCard>
        </SummaryGrid>
      </SummaryContainer>
      
      <TableContainer>
        <TableWrapper>
          <DetailTable className="budget-detail-table" colors={colors}>
            <thead>
              <tr>
                <TableHeader colors={colors}>Mois</TableHeader>
                <TableHeader colors={colors}>
                  <span className="full-text">Montant engagé HT</span>
                  <span className="short-text">Engagé HT</span>
                </TableHeader>
                <TableHeader colors={colors}>
                  <span className="full-text">Nombre de conventions</span>
                  <span className="short-text">Conv.</span>
                </TableHeader>
                <TableHeader colors={colors}>
                  <span className="full-text">Montant payé TTC</span>
                  <span className="short-text">Payé TTC</span>
                </TableHeader>
                <TableHeader colors={colors}>
                  <span className="full-text">Nombre de paiements</span>
                  <span className="short-text">Paiem.</span>
                </TableHeader>
              </tr>
            </thead>
            <tbody>
              {statistiques.parMois.map((mois, index) => (
                <TableRow key={index} colors={colors}>
                  <TableCell colors={colors} className="month-cell">
                    <span className="full-month">{mois.nomMois}</span>
                    <span className="short-month">{mois.nomMois.substring(0, 3)}</span>
                  </TableCell>
                  <TableCell colors={colors} className="amount-cell">
                    <AmountWrapper>
                      <span className="amount">{mois.gage.montant.toLocaleString('fr-FR')} €</span>
                      <span className="currency">HT</span>
                    </AmountWrapper>
                  </TableCell>
                  <TableCell colors={colors} className="number-cell">{mois.gage.nombre}</TableCell>
                  <TableCell colors={colors} className="amount-cell">
                    <AmountWrapper>
                      <span className="amount">{mois.paye.montant.toLocaleString('fr-FR')} €</span>
                      <span className="currency">TTC</span>
                    </AmountWrapper>
                  </TableCell>
                  <TableCell colors={colors} className="number-cell">{mois.paye.nombre}</TableCell>
                </TableRow>
              ))}
              <TableRow className="total-row" colors={colors}>
                <TableCell colors={colors} className="month-cell total-cell">Total</TableCell>
                <TableCell colors={colors} className="amount-cell total-cell">
                  <AmountWrapper>
                    <span className="amount">{statistiques.totaux.montantGage.toLocaleString('fr-FR')} €</span>
                  </AmountWrapper>
                </TableCell>
                <TableCell colors={colors} className="number-cell total-cell">
                  {statistiques.parMois.reduce((sum, mois) => sum + mois.gage.nombre, 0)}
                </TableCell>
                <TableCell colors={colors} className="amount-cell total-cell">
                  <AmountWrapper>
                    <span className="amount">{statistiques.totaux.montantPaye.toLocaleString('fr-FR')} €</span>
                  </AmountWrapper>
                </TableCell>
                <TableCell colors={colors} className="number-cell total-cell">
                  {statistiques.parMois.reduce((sum, mois) => sum + mois.paye.nombre, 0)}
                </TableCell>
              </TableRow>
            </tbody>
          </DetailTable>
        </TableWrapper>
      </TableContainer>
    </Container>
  );
};

// Styled Components avec responsive design amélioré
const Container = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  padding: 16px;
  margin-bottom: 24px;
  width: 100%;
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
  
  @media (min-width: 1200px) {
    padding: 24px;
  }
`;

const ChartContainer = styled.div`
  margin-bottom: 20px;
  height: 300px;
  width: 100%;
  background-color: ${props => props.colors.surface};
  border-radius: 6px;
  padding: 8px;
  transition: background-color 0.3s ease;
  
  @media (min-width: 576px) {
    height: 350px;
    padding: 12px;
  }
  
  @media (min-width: 768px) {
    height: 400px;
    padding: 16px;
    margin-bottom: 24px;
    border-radius: 8px;
  }
  
  @media (min-width: 1200px) {
    height: 450px;
    padding: 20px;
  }
`;

const SummaryContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
  
  @media (min-width: 768px) {
    margin-bottom: 24px;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  text-align: center;
  
  @media (min-width: 576px) {
    font-size: 17px;
    text-align: left;
  }
  
  @media (min-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  
  @media (min-width: 576px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  @media (min-width: 1200px) {
    gap: 20px;
  }
`;

const SummaryCard = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.border};
  border-radius: 6px;
  padding: 16px 12px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.colors.shadow};
    transform: translateY(-2px);
  }
  
  @media (min-width: 576px) {
    padding: 16px;
  }
  
  @media (min-width: 768px) {
    border-radius: 8px;
    padding: 18px 16px;
  }
  
  @media (min-width: 1200px) {
    padding: 20px 18px;
  }
`;

const SummaryLabel = styled.div`
  font-size: 13px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 8px;
  transition: color 0.3s ease;
  font-weight: 500;
  
  @media (min-width: 576px) {
    font-size: 14px;
  }
  
  @media (min-width: 768px) {
    margin-bottom: 10px;
  }
`;

const SummaryValue = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const ValueMain = styled.span`
  font-size: 20px;
  font-weight: 600;
  
  @media (min-width: 576px) {
    font-size: 22px;
  }
  
  @media (min-width: 768px) {
    font-size: 24px;
  }
  
  @media (min-width: 1200px) {
    font-size: 26px;
  }
`;

const ValueSub = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.colors.textSecondary};
  opacity: 0.8;
  
  @media (min-width: 576px) {
    font-size: 13px;
  }
  
  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid ${props => props.colors.border};
  
  @media (min-width: 768px) {
    border-radius: 8px;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  /* Style de la scrollbar sur mobile */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.colors?.surfaceHover || '#f1f1f1'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.colors?.textSecondary || '#888'};
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.colors?.textPrimary || '#555'};
  }
`;

const DetailTable = styled.table`
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  font-size: 13px;
  background-color: ${props => props.colors.surface};
  
  @media (min-width: 576px) {
    min-width: 650px;
    font-size: 14px;
  }
  
  @media (min-width: 768px) {
    min-width: 100%;
  }
`;

const TableHeader = styled.th`
  padding: 12px 8px;
  text-align: left;
  border-bottom: 2px solid ${props => props.colors.border};
  color: ${props => props.colors.textPrimary};
  background-color: ${props => props.colors.surfaceHover};
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  transition: all 0.3s ease;
  
  .full-text {
    display: none;
  }
  
  .short-text {
    display: inline;
  }
  
  @media (min-width: 576px) {
    padding: 14px 10px;
    font-size: 13px;
  }
  
  @media (min-width: 768px) {
    padding: 16px 12px;
    
    .full-text {
      display: inline;
    }
    
    .short-text {
      display: none;
    }
  }
  
  @media (min-width: 1200px) {
    padding: 18px 16px;
  }
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;
  
  &:nth-child(even) {
    background-color: ${props => props.colors.surfaceHover}30;
  }
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
  }
  
  &.total-row {
    background-color: ${props => props.colors.surfaceHover} !important;
    font-weight: 600;
    border-top: 2px solid ${props => props.colors.border};
    
    &:hover {
      background-color: ${props => props.colors.surfaceHover} !important;
    }
  }
`;

const TableCell = styled.td`
  padding: 10px 8px;
  border-bottom: 1px solid ${props => props.colors.border};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  vertical-align: middle;
  
  &.month-cell {
    font-weight: 500;
    white-space: nowrap;
    
    .full-month {
      display: none;
    }
    
    .short-month {
      display: inline;
    }
  }
  
  &.amount-cell {
    text-align: right;
    white-space: nowrap;
  }
  
  &.number-cell {
    text-align: center;
    font-weight: 500;
  }
  
  &.total-cell {
    font-weight: 600;
    border-top: 2px solid ${props => props.colors.border};
  }
  
  @media (min-width: 576px) {
    padding: 12px 10px;
    
    &.month-cell {
      .full-month {
        display: inline;
      }
      
      .short-month {
        display: none;
      }
    }
  }
  
  @media (min-width: 768px) {
    padding: 14px 12px;
  }
  
  @media (min-width: 1200px) {
    padding: 16px 16px;
  }
`;

const AmountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  
  .amount {
    font-weight: 500;
    line-height: 1.2;
  }
  
  .currency {
    font-size: 10px;
    color: ${props => props.colors.textSecondary};
    font-weight: 400;
    opacity: 0.8;
  }
  
  @media (min-width: 576px) {
    flex-direction: row;
    align-items: baseline;
    gap: 4px;
    
    .currency {
      font-size: 11px;
    }
  }
  
  @media (min-width: 768px) {
    .currency {
      font-size: 12px;
    }
  }
`;

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  font-size: 14px;
  
  @media (min-width: 768px) {
    padding: 30px;
    font-size: 16px;
  }
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  border: 1px solid ${props => props.colors.error};
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  
  @media (min-width: 768px) {
    padding: 30px;
    font-size: 16px;
  }
`;

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  
  @media (min-width: 768px) {
    padding: 30px;
    font-size: 16px;
  }
`;

export default StatistiquesBudget;