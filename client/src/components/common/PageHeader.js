import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const PageHeader = ({ title, subtitle, backButton = false, backTo = -1, actionButton = null }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (typeof backTo === 'number') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };
  
  return (
    <HeaderContainer>
      <TitleSection>
        {backButton && (
          <BackButton onClick={handleBack}>
            <FaArrowLeft />
          </BackButton>
        )}
        <div>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
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
  color: #3f51b5;
  margin-right: 16px;
  padding: 8px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(63, 81, 181, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  color: #212121;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #757575;
  margin: 4px 0 0;
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
`;

export default PageHeader;