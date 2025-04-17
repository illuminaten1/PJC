import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const ExpandableSection = ({ title, children, defaultExpanded = false, headerAction = null }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Container expanded={expanded}>
      <Header onClick={toggleExpand}>
        <HeaderLeft>
          <ExpandIcon>
            {expanded ? <FaChevronDown /> : <FaChevronRight />}
          </ExpandIcon>
          <Title>{title}</Title>
        </HeaderLeft>
        
        {headerAction && <ActionContainer onClick={e => e.stopPropagation()}>{headerAction}</ActionContainer>}
      </Header>
      
      {expanded && <Content>{children}</Content>}
    </Container>
  );
};

const Container = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: #fff;
  box-shadow: ${props => props.expanded ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
  transition: box-shadow 0.2s;
`;

const Header = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  background-color: #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const ExpandIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  width: 16px;
  color: #3f51b5;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ActionContainer = styled.div`
  margin-left: 16px;
`;

const Content = styled.div`
  padding: 16px;
  border-top: 1px solid #eee;
`;

export default ExpandableSection;