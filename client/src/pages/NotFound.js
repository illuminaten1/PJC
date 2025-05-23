import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFoundContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #212529;
`;

const NotFoundCard = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 48px;
  width: 100%;
  max-width: 440px;
  text-align: center;

  @media (max-width: 576px) {
    padding: 32px 24px;
    margin: 0 16px;
  }
`;

const NotFoundHeader = styled.div`
  margin-bottom: 40px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 32px;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #856404;

  @media (max-width: 576px) {
    width: 64px;
    height: 64px;
    font-size: 24px;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  color: #212529;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: -0.025em;

  @media (max-width: 576px) {
    font-size: 18px;
  }
`;

const Message = styled.p`
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
`;

const ActionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HomeButton = styled(Link)`
  width: 100%;
  background: #495057;
  color: #ffffff;
  border: 1px solid #495057;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #343a40;
    border-color: #343a40;
    color: #ffffff;
    text-decoration: none;
  }
`;

const FooterInfo = styled.div`
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
`;

const HelpText = styled.p`
  color: #6c757d;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
`;

const SecurityNotice = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 16px;
  margin-top: 24px;
  font-size: 12px;
  color: #495057;
  text-align: center;
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <NotFoundCard>
        <NotFoundHeader>
          <IconContainer>
            <FaExclamationTriangle />
          </IconContainer>
          <Title>Page non trouvée</Title>
          <Message>
            La page que vous recherchez n'existe pas ou a été déplacée.
          </Message>
        </NotFoundHeader>
        
        <ActionSection>
          <HomeButton to="/">
            <FaHome />
            <span>Retour à l'accueil</span>
          </HomeButton>
        </ActionSection>
        
        <FooterInfo>
          <HelpText>
            Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur système.
          </HelpText>
        </FooterInfo>
        
        <SecurityNotice>
          <strong>Protection Juridique Complémentaire</strong><br />
          Système de gestion des dossiers juridiques
        </SecurityNotice>
      </NotFoundCard>
    </NotFoundContainer>
  );
};

export default NotFound;