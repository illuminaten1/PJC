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
          <IconContainer className="affaires">
            <FaFolder />
          </IconContainer>
          <StatContent>
            <StatValue>{statistiques.affaires || 0}</StatValue>
            <StatLabel>Affaires</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard onClick={navigateToMilitaires}>
          <IconContainer className="militaires">
            <FaUser />
          </IconContainer>
          <StatContent>
            <StatValue>{statistiques.militaires?.total || 0}</StatValue>
            <StatLabel>Militaires</StatLabel>
            <StatDetail>
              <DetailItem>
                <DetailLabel>Blessés :</DetailLabel>
                <DetailValue>{statistiques.militaires?.blesses || 0}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Décédés :</DetailLabel>
                <DetailValue>{statistiques.militaires?.decedes || 0}</DetailValue>
              </DetailItem>
            </StatDetail>
          </StatContent>
        </StatCard>
        
        <StatCard onClick={navigateToBeneficiaires}>
          <IconContainer className="beneficiaires">
            <FaUsers />
          </IconContainer>
          <StatContent>
            <StatValue>{totalBeneficiaires}</StatValue>
            <StatLabel>Bénéficiaires</StatLabel>
            <StatDetail>
              {statistiques.beneficiaires && Object.entries(statistiques.beneficiaires).map(([qualite, count]) => (
                <DetailItem key={qualite}>
                  <DetailLabel>{qualite} :</DetailLabel>
                  <DetailValue>{count}</DetailValue>
                </DetailItem>
              ))}
            </StatDetail>
          </StatContent>
        </StatCard>
        
        <StatCard onClick={navigateToStatistiques}>
          <IconContainer className="finances">
            <FaMoneyBill />
          </IconContainer>
          <StatContent>
            <StatValue>{currentYearFinances.montantGage.toLocaleString('fr-FR')} € HT engagés</StatValue>
            <StatLabel>Budget {currentYear}</StatLabel>
            <StatDetail>
              <DetailItem>
                <DetailLabel>Engagé :</DetailLabel>
                <DetailValue>{currentYearFinances.montantGage.toLocaleString('fr-FR')} €</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Payé :</DetailLabel>
                <DetailValue>{currentYearFinances.montantPaye.toLocaleString('fr-FR')} €</DetailValue>
              </DetailItem>
            </StatDetail>
          </StatContent>
        </StatCard>
      </CardGrid>
    </Container>
  );
};

const Container = styled.div`
  margin-bottom: 24px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  
  &.affaires {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  &.militaires {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  &.beneficiaires {
    background-color: #fff8e1;
    color: #f57f17;
  }
  
  &.finances {
    background-color: #f3e5f5;
    color: #8e24aa;
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
  font-size: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
`;

const DetailLabel = styled.span`
  color: #757575;
`;

const DetailValue = styled.span`
  font-weight: 500;
  color: #333;
`;

export default DashboardSummary;