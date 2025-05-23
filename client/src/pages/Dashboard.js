import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { statistiquesAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DashboardSummary from '../components/specific/DashboardSummary';
import StatistiquesBudget from '../components/specific/StatistiquesBudget';
import { FaChartBar, FaSpinner } from 'react-icons/fa';

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
      <DashboardContainer>
        <PageHeader title="Tableau de bord" />
        <LoadingCard>
          <LoadingContent>
            <LoadingSpinner>
              <FaSpinner />
            </LoadingSpinner>
            <LoadingText>Chargement du tableau de bord...</LoadingText>
          </LoadingContent>
        </LoadingCard>
      </DashboardContainer>
    );
  }
  
  if (error) {
    return (
      <DashboardContainer>
        <PageHeader title="Tableau de bord" />
        <ErrorCard>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={fetchStatistiques}>
            Réessayer
          </RetryButton>
        </ErrorCard>
      </DashboardContainer>
    );
  }
  
    return (
    <DashboardContainer>
      <PageHeader 
        title="Tableau de bord" 
        subtitle="Aperçu général de la protection juridique"
      />
      
      <DashboardContent>
        <DashboardSummary statistiques={statistiques} />
        
        <Section>
          <SectionCard>
            <SectionHeader>
              <SectionTitle>
                <IconContainer>
                  <FaChartBar />
                </IconContainer>
                <span>Suivi budgétaire {anneeActuelle}</span>
              </SectionTitle>
            </SectionHeader>
            
            <SectionContent>
              <StatistiquesBudget annee={anneeActuelle} />
            </SectionContent>
          </SectionCard>
        </Section>
      </DashboardContent>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #212529;
`;

const DashboardContent = styled.div`
  padding: 0 20px;
`;

const Section = styled.section`
  margin-bottom: 32px;
`;

const SectionCard = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 24px 24px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #495057;
  color: #ffffff;
  border-radius: 4px;
  margin-right: 12px;
  font-size: 14px;
`;

const SectionContent = styled.div`
  padding: 24px;
`;

const LoadingCard = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
  margin: 20px;

  @media (min-width: 768px) {
    margin: 20px auto;
  }
`;

const LoadingContent = styled.div`
  padding: 64px 24px;
  text-align: center;
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

const ErrorCard = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 0 20px;
  max-width: 1200px;
  padding: 48px 24px;
  text-align: center;

  @media (min-width: 768px) {
    margin: 20px auto;
  }
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

export default Dashboard;