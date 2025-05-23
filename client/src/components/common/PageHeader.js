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
      <HeaderContent>
        <TitleSection>
          {backButton && (
            <BackButton onClick={handleBack}>
              <FaArrowLeft />
            </BackButton>
          )}
          <TitleContent>
            <Title>{title}</Title>
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </TitleContent>
        </TitleSection>
        
        {actionButton && <ActionSection>{actionButton}</ActionSection>}
      </HeaderContent>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #dee2e6;
  padding: 32px 20px;
  margin-bottom: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 14px;
  color: #495057;
  margin-right: 16px;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
    color: #212529;
  }

  &:focus {
    outline: none;
    border-color: #495057;
    box-shadow: 0 0 0 2px rgba(73, 80, 87, 0.1);
  }
`;

const TitleContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #212529;
  margin: 0 0 4px 0;
  font-weight: 600;
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  color: #6c757d;
  font-size: 16px;
  line-height: 1.4;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export default PageHeader;