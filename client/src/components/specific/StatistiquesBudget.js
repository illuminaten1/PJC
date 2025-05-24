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
        backgroundColor: darkMode ? 'rgba(92, 107, 192, 0.8)' : 'rgba(63, 81, 181, 0.6)',
        borderColor: darkMode ? 'rgba(121, 134, 203, 1)' : 'rgba(63, 81, 181, 1)',
        borderWidth: 1,
      },
      {
        label: 'Montants payés (€)',
        data: statistiques.parMois.map(mois => mois.paye.montant),
        backgroundColor: darkMode ? 'rgba(102, 187, 106, 0.8)' : 'rgba(76, 175, 80, 0.6)',
        borderColor: darkMode ? 'rgba(129, 199, 132, 1)' : 'rgba(76, 175, 80, 1)',
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
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: `Répartition budgétaire par mois - ${annee}`,
        color: colors.textPrimary,
        font: {
          size: 16,
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: colors.textSecondary
        },
        grid: {
          color: colors.border
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: colors.textSecondary,
          callback: function(value) {
            return value.toLocaleString('fr-FR') + ' €';
          }
        },
        grid: {
          color: colors.border
        }
      }
    }
  };
  
  return (
    <Container className="budget-section" colors={colors}>
      <FullWidthChartContainer className="budget-chart" colors={colors}>
        <Bar data={chartData} options={chartOptions} />
      </FullWidthChartContainer>
      
      <SummaryContainer>
        <SummaryTitle colors={colors}>Synthèse annuelle {annee}</SummaryTitle>
        
        <SummaryGrid className="budget-summary">
          <SummaryCard colors={colors}>
            <SummaryLabel colors={colors}>Total engagé</SummaryLabel>
            <SummaryValue colors={colors}>{statistiques.totaux.montantGage.toLocaleString('fr-FR')} € HT</SummaryValue>
          </SummaryCard>
          
          <SummaryCard colors={colors}>
            <SummaryLabel colors={colors}>Total payé</SummaryLabel>
            <SummaryValue colors={colors}>{statistiques.totaux.montantPaye.toLocaleString('fr-FR')} € TTC</SummaryValue>
          </SummaryCard>
          
          <SummaryCard colors={colors}>
            <SummaryLabel colors={colors}>Ratio payé/engagé</SummaryLabel>
            <SummaryValue colors={colors}>{statistiques.totaux.ratio.toFixed(2)} %</SummaryValue>
          </SummaryCard>
        </SummaryGrid>
      </SummaryContainer>
      
      <DetailTable className="budget-detail-table" colors={colors}>
        <thead>
          <tr>
            <th>Mois</th>
            <th>Montant engagé HT</th>
            <th>Nombre de conventions</th>
            <th>Montant payé TTC</th>
            <th>Nombre de paiements</th>
          </tr>
        </thead>
        <tbody>
          {statistiques.parMois.map((mois, index) => (
            <tr key={index}>
              <td>{mois.nomMois}</td>
              <td>{mois.gage.montant.toLocaleString('fr-FR')} € HT</td>
              <td>{mois.gage.nombre}</td>
              <td>{mois.paye.montant.toLocaleString('fr-FR')} € TTC</td>
              <td>{mois.paye.nombre}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td>Total</td>
            <td>{statistiques.totaux.montantGage.toLocaleString('fr-FR')} €</td>
            <td>{statistiques.parMois.reduce((sum, mois) => sum + mois.gage.nombre, 0)}</td>
            <td>{statistiques.totaux.montantPaye.toLocaleString('fr-FR')} €</td>
            <td>{statistiques.parMois.reduce((sum, mois) => sum + mois.paye.nombre, 0)}</td>
          </tr>
        </tbody>
      </DetailTable>
    </Container>
  );
};

const Container = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  padding: 20px;
  margin-bottom: 24px;
  width: 100%;
  transition: all 0.3s ease;
`;

const FullWidthChartContainer = styled.div`
  margin-bottom: 24px;
  height: 400px;
  width: 100%;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  padding: 10px;
  transition: background-color 0.3s ease;
`;

const SummaryContainer = styled.div`
  margin-bottom: 24px;
  width: 100%;
`;

const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SummaryCard = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.colors.shadow};
    transform: translateY(-2px);
  }
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 8px;
  transition: color 0.3s ease;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${props => props.colors.primary};
  transition: color 0.3s ease;
`;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid ${props => props.colors.border};
    color: ${props => props.colors.textPrimary};
    transition: all 0.3s ease;
  }
  
  th {
    background-color: ${props => props.colors.surfaceHover};
    font-weight: 500;
    color: ${props => props.colors.textPrimary};
  }
  
  tr:hover {
    background-color: ${props => props.colors.surfaceHover};
  }
  
  .total-row {
    font-weight: 500;
    background-color: ${props => props.colors.surfaceHover};
  }
`;

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  border: 1px solid ${props => props.colors.error};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

export default StatistiquesBudget;