import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bar } from 'react-chartjs-2';
import { FaSpinner } from 'react-icons/fa';
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
    return (
      <LoadingContainer>
        <LoadingSpinner>
          <FaSpinner />
        </LoadingSpinner>
        <LoadingText>Chargement des statistiques...</LoadingText>
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={fetchStatistiques}>
          Réessayer
        </RetryButton>
      </ErrorContainer>
    );
  }
  
  if (!statistiques) {
    return (
      <EmptyContainer>
        <EmptyText>Aucune donnée disponible pour l'année {annee}</EmptyText>
      </EmptyContainer>
    );
  }
  
  // Préparation des données pour le graphique
  const chartData = {
    labels: statistiques.parMois.map(mois => mois.nomMois),
    datasets: [
      {
        label: 'Montants engagés (€)',
        data: statistiques.parMois.map(mois => mois.gage.montant),
        backgroundColor: '#495057',
        borderColor: '#495057',
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        label: 'Montants payés (€)',
        data: statistiques.parMois.map(mois => mois.paye.montant),
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        borderWidth: 1,
        borderRadius: 2,
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
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            size: 12
          },
          color: '#495057',
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#212529',
        bodyColor: '#495057',
        borderColor: '#dee2e6',
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y.toLocaleString('fr-FR') + ' €';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            size: 11
          },
          color: '#6c757d'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e9ecef',
          borderDash: [2, 2]
        },
        ticks: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            size: 11
          },
          color: '#6c757d',
          callback: function(value) {
            return value.toLocaleString('fr-FR') + ' €';
          }
        }
      }
    }
  };
  
  return (
    <Container>
      <ChartSection>
        <ChartContainer>
          <Bar data={chartData} options={chartOptions} />
        </ChartContainer>
      </ChartSection>
      
      <SummarySection>
        <SummaryTitle>Synthèse annuelle {annee}</SummaryTitle>
        
        <SummaryGrid>
          <SummaryCard>
            <CardHeader>
              <SummaryLabel>Total engagé</SummaryLabel>
              <SummaryValue primary>{statistiques.totaux.montantGage.toLocaleString('fr-FR')} €</SummaryValue>
              <SummaryUnit>HT</SummaryUnit>
            </CardHeader>
          </SummaryCard>
          
          <SummaryCard>
            <CardHeader>
              <SummaryLabel>Total payé</SummaryLabel>
              <SummaryValue success>{statistiques.totaux.montantPaye.toLocaleString('fr-FR')} €</SummaryValue>
              <SummaryUnit>TTC</SummaryUnit>
            </CardHeader>
          </SummaryCard>
          
          <SummaryCard>
            <CardHeader>
              <SummaryLabel>Ratio payé/engagé</SummaryLabel>
              <SummaryValue>{statistiques.totaux.ratio.toFixed(1)} %</SummaryValue>
              <SummaryUnit>Réalisation</SummaryUnit>
            </CardHeader>
          </SummaryCard>
        </SummaryGrid>
      </SummarySection>
      
      <TableSection>
        <TableTitle>Détail mensuel</TableTitle>
        <TableContainer>
          <DetailTable>
            <thead>
              <tr>
                <th>Mois</th>
                <th>Engagé (HT)</th>
                <th>Conventions</th>
                <th>Payé (TTC)</th>
                <th>Paiements</th>
              </tr>
            </thead>
            <tbody>
              {statistiques.parMois.map((mois, index) => (
                <tr key={index}>
                  <td><strong>{mois.nomMois}</strong></td>
                  <td>{mois.gage.montant.toLocaleString('fr-FR')} €</td>
                  <td>{mois.gage.nombre}</td>
                  <td>{mois.paye.montant.toLocaleString('fr-FR')} €</td>
                  <td>{mois.paye.nombre}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>{statistiques.totaux.montantGage.toLocaleString('fr-FR')} €</strong></td>
                <td><strong>{statistiques.parMois.reduce((sum, mois) => sum + mois.gage.nombre, 0)}</strong></td>
                <td><strong>{statistiques.totaux.montantPaye.toLocaleString('fr-FR')} €</strong></td>
                <td><strong>{statistiques.parMois.reduce((sum, mois) => sum + mois.paye.nombre, 0)}</strong></td>
              </tr>
            </tfoot>
          </DetailTable>
        </TableContainer>
      </TableSection>
    </Container>
  );
};

const Container = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
`;

const ChartSection = styled.div`
  margin-bottom: 32px;
`;

const ChartContainer = styled.div`
  height: 400px;
  width: 100%;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
`;

const SummarySection = styled.div`
  margin-bottom: 32px;
`;

const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #212529;
  letter-spacing: -0.025em;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SummaryCard = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px;
  text-align: center;
`;

const SummaryLabel = styled.div`
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  letter-spacing: -0.025em;
  
  ${props => props.primary && `color: #495057;`}
  ${props => props.success && `color: #28a745;`}
  ${props => !props.primary && !props.success && `color: #212529;`}
`;

const SummaryUnit = styled.div`
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableSection = styled.div`
  margin-bottom: 32px;
`;

const TableTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #212529;
  letter-spacing: -0.025em;
`;

const TableContainer = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
`;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th {
    background: #f8f9fa;
    padding: 16px 12px;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 1px solid #dee2e6;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  td {
    padding: 12px;
    border-bottom: 1px solid #e9ecef;
    color: #495057;
  }
  
  tbody tr:hover {
    background: #f8f9fa;
  }
  
  tfoot tr {
    background: #f8f9fa;
    
    td {
      border-bottom: none;
      color: #212529;
    }
  }
`;

const LoadingContainer = styled.div`
  padding: 64px 24px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  font-size: 20px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #6c757d;
  font-size: 16px;
  margin: 0;
`;

const ErrorContainer = styled.div`
  padding: 48px 24px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 16px 20px;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 24px;
  font-size: 14px;
`;

const RetryButton = styled.button`
  background: #495057;
  color: #ffffff;
  border: 1px solid #495057;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background: #343a40;
    border-color: #343a40;
  }
`;

const EmptyContainer = styled.div`
  padding: 48px 24px;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
`;

const EmptyText = styled.p`
  color: #6c757d;
  font-size: 16px;
  margin: 0;
`;

export default StatistiquesBudget;