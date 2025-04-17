import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container>
      <IconContainer>
        <FaExclamationTriangle />
      </IconContainer>
      <Title>Page non trouvée</Title>
      <Message>La page que vous recherchez n'existe pas ou a été déplacée.</Message>
      <HomeLink to="/">
        <FaHome />
        <span>Retour à l'accueil</span>
      </HomeLink>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
`;

const IconContainer = styled.div`
  font-size: 80px;
  color: #ff9800;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 18px;
  color: #757575;
  margin-bottom: 32px;
  max-width: 500px;
`;

const HomeLink = styled(Link)`
  display: flex;
  align-items: center;
  background-color: #3f51b5;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 500;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #303f9f;
    text-decoration: none;
  }
`;

export default NotFound;