import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

// Hook personnalisé pour utiliser les couleurs du thème
const useThemedColors = () => {
  const { colors } = useTheme();
  return colors;
};

export const HeaderCard = styled.div`
  background-color: ${props => props.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.colors?.border || '#e0e0e0'};
  border-radius: 4px;
  box-shadow: ${props => props.colors?.shadow || '0 2px 4px rgba(0, 0, 0, 0.1)'};
  padding: 20px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
`;

export const HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 16px;
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const HeaderItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

export const HeaderLabel = styled.div`
  font-size: 14px;
  color: ${props => props.colors?.textSecondary || '#757575'};
  margin-bottom: 4px;
  transition: color 0.3s ease;
`;

export const HeaderValue = styled.div`
  font-size: 16px;
  color: ${props => props.colors?.textPrimary || '#333'};
  font-weight: 500;
  transition: color 0.3s ease;
`;

export const HeaderFullWidth = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 16px;
`;

export const ArchiveNote = styled.div`
  font-size: 12px;
  color: ${props => props.colors?.textMuted || '#757575'};
  margin-top: 4px;
  font-style: italic;
  transition: color 0.3s ease;
`;

// Composant wrapper pour injecter automatiquement les couleurs du thème
export const ThemedHeaderCard = (props) => {
  const colors = useThemedColors();
  return <HeaderCard colors={colors} {...props} />;
};

export const ThemedHeaderLabel = (props) => {
  const colors = useThemedColors();
  return <HeaderLabel colors={colors} {...props} />;
};

export const ThemedHeaderValue = (props) => {
  const colors = useThemedColors();
  return <HeaderValue colors={colors} {...props} />;
};

export const ThemedArchiveNote = (props) => {
  const colors = useThemedColors();
  return <ArchiveNote colors={colors} {...props} />;
};