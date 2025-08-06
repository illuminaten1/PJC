import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

// Composants réutilisables pour MDX
export const WarningBox = ({ children }) => {
  const { colors } = useTheme();
  return <StyledWarningBox colors={colors}>{children}</StyledWarningBox>;
};

export const HighlightBox = ({ children }) => {
  const { colors } = useTheme();
  return <StyledHighlightBox colors={colors}>{children}</StyledHighlightBox>;
};

export const VariableGroup = ({ title, children }) => {
  const { colors } = useTheme();
  return (
    <StyledVariableGroup colors={colors}>
      <VariableGroupTitle colors={colors}>{title}</VariableGroupTitle>
      <VariableList>{children}</VariableList>
    </StyledVariableGroup>
  );
};

export const VariableItem = ({ children }) => {
  const { colors } = useTheme();
  return <StyledVariableItem colors={colors}>{children}</StyledVariableItem>;
};

export const FeatureCard = ({ icon, title, children }) => {
  const { colors } = useTheme();
  return (
    <StyledFeatureCard colors={colors}>
      <h4>{icon} {title}</h4>
      {children}
    </StyledFeatureCard>
  );
};

export const FeatureGrid = ({ children }) => {
  return <StyledFeatureGrid>{children}</StyledFeatureGrid>;
};

export const VariablesGrid = ({ children }) => {
  return <StyledVariablesGrid>{children}</StyledVariablesGrid>;
};

// Styled Components (repris de votre code existant)
const StyledWarningBox = styled.div`
  background-color: ${props => props.colors.warningBg || props.colors.surfaceHover};
  border-left: 4px solid ${props => props.colors.warning || props.colors.primary};
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  p {
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: #e65100;
    }
  }
  
  code {
    background-color: ${props => props.colors.surfaceHover};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: ${props => props.colors.textPrimary};
    word-break: break-all;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    margin: 16px 0;
  }
`;

const StyledHighlightBox = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.primary}10, ${props => props.colors.primary}05);
  border-left: 4px solid ${props => props.colors.primary};
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  p {
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    margin: 16px 0;
  }
`;

const StyledVariableGroup = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${props => props.colors.borderLight || props.colors.border};
  transition: all 0.3s ease;
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const VariableGroupTitle = styled.h5`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.colors.primary};
  margin-bottom: 12px;
  border-bottom: 1px solid ${props => props.colors.borderLight || props.colors.border};
  padding-bottom: 4px;
  transition: color 0.3s ease;
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 8px;
  }
`;

const VariableList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledVariableItem = styled.li`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.borderLight || props.colors.border};
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: ${props => props.colors.primaryDark || props.colors.primary};
  transition: all 0.3s ease;
  word-break: break-all;
  
  &:hover {
    background-color: ${props => props.colors.primary};
    color: white;
    transform: translateX(4px);
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 6px 8px;
  }
`;

const StyledFeatureCard = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 20px;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.colors.shadowHover || props.colors.shadow};
    border-color: ${props => props.colors.primary};
  }
  
  h4 {
    color: ${props => props.colors.primary};
    margin-bottom: 12px;
    font-size: 18px;
    
    @media (max-width: 480px) {
      font-size: 16px;
      margin-bottom: 8px;
    }
  }
  
  p {
    color: ${props => props.colors.textPrimary};
    margin-bottom: 8px;
    
    @media (max-width: 480px) {
      font-size: 14px;
    }
  }
  
  em {
    color: ${props => props.colors.textSecondary};
    font-size: 14px;
    
    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const StyledFeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 20px 0;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    margin: 16px 0;
  }
`;

const StyledVariablesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin: 16px 0;
  }
`;