import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const PageHeader = ({ title, subtitle, backButton = false, backTo = -1, actionButton = null }) => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  const handleBack = () => {
    if (typeof backTo === 'number') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };
  
  return (
    <HeaderContainer colors={colors}>
      <TitleSection>
        {backButton && (
          <BackButton onClick={handleBack} colors={colors}>
            <FaArrowLeft />
          </BackButton>
        )}
        <div>
          <Title colors={colors}>{title}</Title>
          {subtitle && <Subtitle colors={colors}>{subtitle}</Subtitle>}
        </div>
      </TitleSection>
      
      {actionButton && <ActionSection>{actionButton}</ActionSection>}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${props => props.colors.primary};
  margin-right: 16px;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    transform: scale(1.1);
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  margin: 4px 0 0;
  transition: color 0.3s ease;
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
`;

export default PageHeader;