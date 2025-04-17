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
    return <Loading>Chargement des statistiques...</Loading>;
  }
  
  if (error) {
    return <Error>{error}</Error>;
  }
  
  if (!statistiques) {
    return <Empty>Aucune donnée disponible</Empty>;
  }
  
  // Préparation des données pour le graphique
  const chartData = {
    labels: statistiques.parMois.map(mois => mois.nomMois),
    datasets: [
      {
        label: 'Montants engagés (€)',
        data: statistiques.parMois.map(mois => mois.gage.montant),
        backgroundColor: 'rgba(63, 81, 181, 0.6)',
        borderColor: 'rgba(63, 81, 181, 1)',
        borderWidth: 1,
      },
      {
        label: 'Montants payés (€)',
        data: statistiques.parMois.map(mois => mois.paye.montant),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
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
      },
      title: {
        display: true,
        text: `Répartition budgétaire par mois - ${annee}`,
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('fr-FR') + ' €';
          }
        }
      }
    }
  };
  
  return (
    <Container>
      <FullWidthChartContainer>
        <Bar data={chartData} options={chartOptions} />
      </FullWidthChartContainer>
      
      <SummaryContainer>
        <SummaryTitle>Synthèse annuelle {annee}</SummaryTitle>
        
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>Total engagé</SummaryLabel>
            <SummaryValue>{statistiques.totaux.montantGage.toLocaleString('fr-FR')} € HT</SummaryValue>
          </SummaryCard>
          
          <SummaryCard>
            <SummaryLabel>Total payé</SummaryLabel>
            <SummaryValue>{statistiques.totaux.montantPaye.toLocaleString('fr-FR')} € TTC</SummaryValue>
          </SummaryCard>
          
          <SummaryCard>
            <SummaryLabel>Ratio payé/engagé</SummaryLabel>
            <SummaryValue>{statistiques.totaux.ratio.toFixed(2)} %</SummaryValue>
          </SummaryCard>
        </SummaryGrid>
      </SummaryContainer>
      
      <DetailTable>
        <thead>
          <tr>
            <th>Mois</th>
            <th>Montant engagé</th>
            <th>Nombre de conventions</th>
            <th>Montant payé</th>
            <th>Nombre de paiements</th>
          </tr>
        </thead>
        <tbody>
          {statistiques.parMois.map((mois, index) => (
            <tr key={index}>
              <td>{mois.nomMois}</td>
              <td>{mois.gage.montant.toLocaleString('fr-FR')} €</td>
              <td>{mois.gage.nombre}</td>
              <td>{mois.paye.montant.toLocaleString('fr-FR')} €</td>
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
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
  width: 100%;
`;

const FullWidthChartContainer = styled.div`
  margin-bottom: 24px;
  height: 400px;
  width: 100%;
`;

const SummaryContainer = styled.div`
  margin-bottom: 24px;
  width: 100%;
`;

const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SummaryCard = styled.div`
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #3f51b5;
`;

const DetailTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 500;
    color: #333;
  }
  
  tr:hover {
    background-color: #f9f9f9;
  }
  
  .total-row {
    font-weight: 500;
    background-color: #f5f5f5;
  }
`;

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: #757575;
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
`;

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  color: #757575;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

export default StatistiquesBudget;