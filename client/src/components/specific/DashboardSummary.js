import React from 'react';
import styled from 'styled-components';
import { FaFolder, FaUser, FaUsers, FaMoneyBill } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DashboardSummary = ({ statistiques = {} }) => {
  const navigate = useNavigate();
  
  const navigateToAffaires = () => {
    navigate('/affaires');
  };
  
  const navigateToMilitaires = () => {
    navigate('/militaires');
  };
  
  const navigateToBeneficiaires = () => {
    navigate('/beneficiaires');
  };
  
  const navigateToStatistiques = () => {
    navigate('/statistiques');
  };
  
  const totalBeneficiaires = statistiques.beneficiaires ? 
    Object.values(statistiques.beneficiaires).reduce((sum, count) => sum + count, 0) : 
    0;
  
  const currentYear = new Date().getFullYear();
  const currentYearFinances = statistiques.finances && statistiques.finances[currentYear] ? 
    statistiques.finances[currentYear] : 
    { montantGage: 0, montantPaye: 0 };
  
  return (
    <Container>
      <CardGrid>
        <StatCard onClick={navigateToAffaires}>
          <CardHeader>
            <IconContainer className="affaires">
              <FaFolder />
            </IconContainer>
            <MainStat>
              <StatValue>{statistiques.affaires || 0}</StatValue>
              <StatLabel>Affaires</StatLabel>
            </MainStat>
          </CardHeader>
        </StatCard>
        
        <StatCard onClick={navigateToMilitaires}>
          <CardHeader>
            <IconContainer className="militaires">
              <FaUser />
            </IconContainer>
            <MainStat>
              <StatValue>{statistiques.militaires?.total || 0}</StatValue>
              <StatLabel>Militaires</StatLabel>
            </MainStat>
          </CardHeader>
          <CardDetails>
            <DetailRow>
              <DetailLabel>Blessés</DetailLabel>
              <DetailValue>{statistiques.militaires?.blesses || 0}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Décédés</DetailLabel>
              <DetailValue>{statistiques.militaires?.decedes || 0}</DetailValue>
            </DetailRow>
          </CardDetails>
        </StatCard>
        
        <StatCard onClick={navigateToBeneficiaires}>
          <CardHeader>
            <IconContainer className="beneficiaires">
              <FaUsers />
            </IconContainer>
            <MainStat>
              <StatValue>{totalBeneficiaires}</StatValue>
              <StatLabel>Bénéficiaires</StatLabel>
            </MainStat>
          </CardHeader>
          <CardDetails>
            {statistiques.beneficiaires && Object.entries(statistiques.beneficiaires).map(([qualite, count]) => (
              <DetailRow key={qualite}>
                <DetailLabel>{qualite}</DetailLabel>
                <DetailValue>{count}</DetailValue>
              </DetailRow>
            ))}
          </CardDetails>
        </StatCard>
        
        <StatCard onClick={navigateToStatistiques}>
          <CardHeader>
            <IconContainer className="finances">
              <FaMoneyBill />
            </IconContainer>
            <MainStat>
              <StatValue>{currentYearFinances.montantGage.toLocaleString('fr-FR')} €</StatValue>
              <StatLabel>Budget {currentYear}</StatLabel>
            </MainStat>
          </CardHeader>
          <CardDetails>
            <DetailRow>
              <DetailLabel>Engagé</DetailLabel>
              <DetailValue>{currentYearFinances.montantGage.toLocaleString('fr-FR')} €</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Payé</DetailLabel>
              <DetailValue>{currentYearFinances.montantPaye.toLocaleString('fr-FR')} €</DetailValue>
            </DetailRow>
          </CardDetails>
        </StatCard>
      </CardGrid>
    </Container>
  );
};

const Container = styled.div`
  margin-bottom: 32px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: #adb5bd;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
  
  &.affaires {
    background: #495057;
    color: #ffffff;
  }
  
  &.militaires {
    background: #28a745;
    color: #ffffff;
  }
  
  &.beneficiaires {
    background: #ffc107;
    color: #ffffff;
  }
  
  &.finances {
    background: #6f42c1;
    color: #ffffff;
  }
`;

const MainStat = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
  letter-spacing: -0.025em;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
`;

const CardDetails = styled.div`
  padding: 16px 24px;
  background: #f8f9fa;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-weight: 600;
  color: #212529;
  font-size: 13px;
`;

export default DashboardSummary;