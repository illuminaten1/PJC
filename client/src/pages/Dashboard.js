import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { statistiquesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DashboardSummary from '../components/specific/DashboardSummary';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
import { FaChartBar } from 'react-icons/fa';

const Dashboard = () => {
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const anneeActuelle = new Date().getFullYear();
  
  useEffect(() => {
    fetchStatistiques();
  }, []);
  
  const fetchStatistiques = async () => {
    setLoading(true);
    try {
      const response = await statistiquesAPI.getAll();
      setStatistiques(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques", err);
      setError("Impossible de charger les statistiques globales");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Container>
        <PageHeader title="Tableau de bord" />
        <Loading>Chargement du tableau de bord...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <PageHeader title="Tableau de bord" />
        <Error>{error}</Error>
      </Container>
    );
  }
  
  return (
    <Container>
      <PageHeader 
        title="Tableau de bord" 
        subtitle="Aperçu général de la protection juridique"
      />
      
      <DashboardSummary statistiques={statistiques} />
      
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FaChartBar />
            <span>Suivi budgétaire {anneeActuelle}</span>
          </SectionTitle>
        </SectionHeader>
        
        <StatistiquesBudget annee={anneeActuelle} />
      </Section>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
`;

const Section = styled.section`
  margin-bottom: 30px;
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
  
  svg {
    margin-right: 8px;
    color: #3f51b5;
  }
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

export default Dashboard;