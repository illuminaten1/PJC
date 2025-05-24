import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

const StatusTag = ({ status, text }) => {
  const { colors } = useTheme();
  
  return (
    <Tag colors={colors} status={status}>
      {text}
    </Tag>
  );
};

const Tag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  ${props => {
    switch(props.status) {
      case 'success':
        return `
          background-color: ${props.colors.successBg};
          color: ${props.colors.success};
          border: 1px solid ${props.colors.success}40;
        `;
      case 'warning':
        return `
          background-color: ${props.colors.warningBg};
          color: ${props.colors.warning};
          border: 1px solid ${props.colors.warning}40;
        `;
      case 'error':
        return `
          background-color: ${props.colors.errorBg};
          color: ${props.colors.error};
          border: 1px solid ${props.colors.error}40;
        `;
      case 'info':
      default:
        return `
          background-color: ${props.colors.primary}20;
          color: ${props.colors.primary};
          border: 1px solid ${props.colors.primary}40;
        `;
    }
  }}
`;

export default StatusTag;