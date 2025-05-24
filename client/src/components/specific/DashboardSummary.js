import React from 'react';
import styled from 'styled-components';
import { FaFolder, FaUser, FaUsers, FaMoneyBill } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardSummary = ({ statistiques = {} }) => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  
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
        <StatCard onClick={navigateToAffaires} colors={colors}>
          <IconContainer className="affaires" colors={colors}>
            <FaFolder />
          </IconContainer>
          <StatContent>
            <StatValue colors={colors}>{statistiques.affaires || 0}</StatValue>
            <StatLabel colors={colors}>Affaires</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard onClick={navigateToMilitaires} colors={colors}>
          <IconContainer className="militaires" colors={colors}>
            <FaUser />
          </IconContainer>
          <StatContent>
            <StatValue colors={colors}>{statistiques.militaires?.total || 0}</StatValue>
            <StatLabel colors={colors}>Militaires</StatLabel>
            <StatDetail>
              <DetailItem>
                <DetailLabel colors={colors}>Blessés :</DetailLabel>
                <DetailValue colors={colors}>{statistiques.militaires?.blesses || 0}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel colors={colors}>Décédés :</DetailLabel>
                <DetailValue colors={colors}>{statistiques.militaires?.decedes || 0}</DetailValue>
              </DetailItem>
            </StatDetail>
          </StatContent>
        </StatCard>
        
        <StatCard onClick={navigateToBeneficiaires} colors={colors}>
          <IconContainer className="beneficiaires" colors={colors}>
            <FaUsers />
          </IconContainer>
          <StatContent>
            <StatValue colors={colors}>{totalBeneficiaires}</StatValue>
            <StatLabel colors={colors}>Bénéficiaires</StatLabel>
            <StatDetail>
              {statistiques.beneficiaires && Object.entries(statistiques.beneficiaires).map(([qualite, count]) => (
                <DetailItem key={qualite}>
                  <DetailLabel colors={colors}>{qualite} :</DetailLabel>
                  <DetailValue colors={colors}>{count}</DetailValue>
                </DetailItem>
              ))}
            </StatDetail>
          </StatContent>
        </StatCard>
        
        <StatCard onClick={navigateToStatistiques} colors={colors}>
          <IconContainer className="finances" colors={colors}>
            <FaMoneyBill />
          </IconContainer>
          <StatContent>
            <StatValue colors={colors}>{currentYearFinances.montantGage.toLocaleString('fr-FR')} € HT</StatValue>
            <StatLabel colors={colors}>Budget {currentYear}</StatLabel>
            <StatDetail>
              <DetailItem>
                <DetailLabel colors={colors}>Engagé :</DetailLabel>
                <DetailValue colors={colors}>{currentYearFinances.montantGage.toLocaleString('fr-FR')} €</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel colors={colors}>Payé :</DetailLabel>
                <DetailValue colors={colors}>{currentYearFinances.montantPaye.toLocaleString('fr-FR')} €</DetailValue>
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
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.colors.shadowHover};
    border-color: ${props => props.colors.primary};
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
  transition: all 0.3s ease;
  
  &.affaires {
    background-color: ${props => props.colors.cardIcon.affaires.bg};
    color: ${props => props.colors.cardIcon.affaires.color};
  }
  
  &.militaires {
    background-color: ${props => props.colors.cardIcon.militaires.bg};
    color: ${props => props.colors.cardIcon.militaires.color};
  }
  
  &.beneficiaires {
    background-color: ${props => props.colors.cardIcon.beneficiaires.bg};
    color: ${props => props.colors.cardIcon.beneficiaires.color};
  }
  
  &.finances {
    background-color: ${props => props.colors.cardIcon.finances.bg};
    color: ${props => props.colors.cardIcon.finances.color};
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 8px;
  transition: color 0.3s ease;
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
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const DetailValue = styled.span`
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

export default DashboardSummary;