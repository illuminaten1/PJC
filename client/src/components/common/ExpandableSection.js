import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const ExpandableSection = ({ title, children, defaultExpanded = false, headerAction = null }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { colors } = useTheme();
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Container colors={colors} expanded={expanded}>
      <Header colors={colors} onClick={toggleExpand}>
        <HeaderLeft>
          <ExpandIcon colors={colors}>
            {expanded ? <FaChevronDown /> : <FaChevronRight />}
          </ExpandIcon>
          <Title colors={colors}>{title}</Title>
        </HeaderLeft>
        
        {headerAction && <ActionContainer onClick={e => e.stopPropagation()}>{headerAction}</ActionContainer>}
      </Header>
      
      {expanded && <Content colors={colors}>{children}</Content>}
    </Container>
  );
};

const Container = styled.div`
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: ${props => props.colors.surface};
  box-shadow: ${props => props.expanded ? props.colors.shadow : 'none'};
  transition: all 0.3s ease;
`;

const Header = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  background-color: ${props => props.colors.surfaceHover};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
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
  color: ${props => props.colors.primary};
  transition: color 0.3s ease;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const ActionContainer = styled.div`
  margin-left: 16px;
`;

const Content = styled.div`
  padding: 16px;
  border-top: 1px solid ${props => props.colors.borderLight};
  background-color: ${props => props.colors.surface};
  transition: all 0.3s ease;
`;

export default ExpandableSection;