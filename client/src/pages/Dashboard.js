import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { statistiquesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DashboardSummary from '../components/specific/DashboardSummary';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
import { FaChartBar } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { colors } = useTheme();
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
      <Container colors={colors}>
        <PageHeader title="Tableau de bord" />
        <Loading colors={colors}>Chargement du tableau de bord...</Loading>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container colors={colors}>
        <PageHeader title="Tableau de bord" />
        <Error colors={colors}>{error}</Error>
      </Container>
    );
  }
  
  return (
    <Container colors={colors}>
      <PageHeader 
        title="Tableau de bord" 
        subtitle="Aperçu général de la protection juridique"
      />
      
      <DashboardSummary statistiques={statistiques} />
      
      <Section colors={colors}>
        <SectionHeader>
          <SectionTitle colors={colors}>
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
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
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
  color: ${props => props.colors.textPrimary};
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.primary};
  }
`;

const Loading = styled.div`
  padding: 40px;
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
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
`;

export default Dashboard;