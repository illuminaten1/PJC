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
  const [showTable, setShowTable] = useState(false);
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
          boxWidth: window.innerWidth < 768 ? 15 : 20
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
          minRotation: window.innerWidth < 768 ? 45 : 0
        },
        grid: {
          color: darkMode ? '#495057' : colors.border
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
              return value > 1000 ? (value / 1000) + 'k€' : value + '€';
            }
            return value.toLocaleString('fr-FR') + ' €';
          }
        },
        grid: {
          color: darkMode ? '#495057' : colors.border
        }
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
              <MobileValue>
                {statistiques.totaux.montantGage > 1000000 
                  ? `${(statistiques.totaux.montantGage / 1000000).toFixed(1)} M€`
                  : `${(statistiques.totaux.montantGage / 1000).toFixed(0)} k€`
                }
              </MobileValue>
              <DesktopValue>
                {statistiques.totaux.montantGage.toLocaleString('fr-FR')} € HT
              </DesktopValue>
            </SummaryValue>
          </SummaryCard>
          
          <SummaryCard colors={colors}>
            <SummaryLabel colors={colors}>Total payé</SummaryLabel>
            <SummaryValue colors={colors}>
              <MobileValue>
                {statistiques.totaux.montantPaye > 1000000 
                  ? `${(statistiques.totaux.montantPaye / 1000000).toFixed(1)} M€`
                  : `${(statistiques.totaux.montantPaye / 1000).toFixed(0)} k€`
                }
              </MobileValue>
              <DesktopValue>
                {statistiques.totaux.montantPaye.toLocaleString('fr-FR')} € TTC
              </DesktopValue>
            </SummaryValue>
          </SummaryCard>
          
          <SummaryCard colors={colors}>
            <SummaryLabel colors={colors}>Ratio payé/engagé</SummaryLabel>
            <SummaryValue colors={colors}>{statistiques.totaux.ratio.toFixed(2)} %</SummaryValue>
          </SummaryCard>
        </SummaryGrid>
      </SummaryContainer>
      
      <TableSection>
        <TableToggle 
          onClick={() => setShowTable(!showTable)}
          colors={colors}
        >
          {showTable ? 'Masquer le détail' : 'Afficher le détail'}
        </TableToggle>
        
        {showTable && (
          <>
            <TableContainer>
              <DetailTable className="budget-detail-table" colors={colors}>
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th>Engagé HT</th>
                    <th>Conv.</th>
                    <th>Payé TTC</th>
                    <th>Paiem.</th>
                  </tr>
                </thead>
                <tbody>
                  {statistiques.parMois.map((mois, index) => (
                    <tr key={index}>
                      <td data-label="Mois">{mois.nomMois.substring(0, 3)}</td>
                      <td data-label="Engagé">{mois.gage.montant > 1000 ? `${(mois.gage.montant/1000).toFixed(0)}k€` : `${mois.gage.montant}€`}</td>
                      <td data-label="Conv.">{mois.gage.nombre}</td>
                      <td data-label="Payé">{mois.paye.montant > 1000 ? `${(mois.paye.montant/1000).toFixed(0)}k€` : `${mois.paye.montant}€`}</td>
                      <td data-label="Paiem.">{mois.paye.nombre}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td data-label="Mois">Total</td>
                    <td data-label="Engagé">{statistiques.totaux.montantGage > 1000000 ? `${(statistiques.totaux.montantGage/1000000).toFixed(1)}M€` : `${(statistiques.totaux.montantGage/1000).toFixed(0)}k€`}</td>
                    <td data-label="Conv.">{statistiques.parMois.reduce((sum, mois) => sum + mois.gage.nombre, 0)}</td>
                    <td data-label="Payé">{statistiques.totaux.montantPaye > 1000000 ? `${(statistiques.totaux.montantPaye/1000000).toFixed(1)}M€` : `${(statistiques.totaux.montantPaye/1000).toFixed(0)}k€`}</td>
                    <td data-label="Paiem.">{statistiques.parMois.reduce((sum, mois) => sum + mois.paye.nombre, 0)}</td>
                  </tr>
                </tbody>
              </DetailTable>
            </TableContainer>
          </>
        )}
      </TableSection>
    </Container>
  );
};

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
    border-radius: 4px;
  }
`;

const ChartContainer = styled.div`
  margin-bottom: 24px;
  height: 300px;
  width: 100%;
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  padding: 8px;
  transition: background-color 0.3s ease;
  
  @media (min-width: 768px) {
    height: 400px;
    padding: 10px;
    border-radius: 4px;
  }
  
  @media (min-width: 1200px) {
    height: 450px;
  }
`;

const SummaryContainer = styled.div`
  margin-bottom: 24px;
  width: 100%;
`;

const SummaryTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 18px;
    text-align: left;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const SummaryCard = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    padding: 16px;
    border-radius: 4px;
    
    &:hover {
      box-shadow: ${props => props.colors.shadow};
      transform: translateY(-2px);
    }
  }
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 8px;
  transition: color 0.3s ease;
  
  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  @media (min-width: 768px) {
    font-size: 20px;
  }
  
  @media (min-width: 1200px) {
    font-size: 24px;
  }
`;

const MobileValue = styled.span`
  @media (min-width: 768px) {
    display: none;
  }
`;

const DesktopValue = styled.span`
  display: none;
  
  @media (min-width: 768px) {
    display: inline;
  }
`;

const TableSection = styled.div`
  width: 100%;
`;

const TableToggle = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
  width: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  @media (min-width: 768px) {
    width: auto;
    display: none;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
  
  @media (min-width: 768px) {
    border-radius: 4px;
  }
`;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 600px;
  
  @media (min-width: 768px) {
    font-size: 14px;
    min-width: auto;
  }
  
  th, td {
    padding: 8px 6px;
    text-align: left;
    border-bottom: 1px solid ${props => props.colors.border};
    color: ${props => props.colors.textPrimary};
    transition: all 0.3s ease;
    
    @media (min-width: 768px) {
      padding: 10px 12px;
    }
  }
  
  th {
    background-color: ${props => props.colors.surfaceHover};
    font-weight: 500;
    color: ${props => props.colors.textPrimary};
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  @media (max-width: 767px) {
    thead {
      display: none;
    }
    
    tbody tr {
      display: block;
      margin-bottom: 12px;
      background-color: ${props => props.colors.surface};
      border-radius: 8px;
      border: 1px solid ${props => props.colors.border};
      padding: 8px;
      box-sizing: border-box;
      width: 100%;
    }
    
    tbody td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 0;
      border: none;
      border-bottom: 1px solid ${props => props.colors.borderLight};
      font-size: 12px;
      line-height: 1.2;
      width: 100%;
      box-sizing: border-box;
      
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      
      &:before {
        content: attr(data-label);
        font-weight: 500;
        color: ${props => props.colors.textSecondary};
        flex: 0 0 30%;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      
      /* Le contenu de la cellule */
      flex: 1;
      text-align: right;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 4px;
    }
    
    .total-row {
      background-color: ${props => props.colors.surfaceHover} !important;
      border: 2px solid ${props => props.colors.primary} !important;
      
      td:before {
        color: ${props => props.colors.primary};
        font-weight: 600;
      }
      
      td {
        font-weight: 600;
      }
    }
  }
  
  @media (min-width: 768px) {
    tr:hover {
      background-color: ${props => props.colors.surfaceHover};
    }
    
    .total-row {
      font-weight: 500;
      background-color: ${props => props.colors.surfaceHover};
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
  
  @media (min-width: 768px) {
    border-radius: 4px;
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
  
  @media (min-width: 768px) {
    border-radius: 4px;
  }
`;

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    border-radius: 4px;
  }
`;

export default StatistiquesBudget;