import React from 'react';
import styled from 'styled-components';

const StatusTag = ({ status, text }) => {
  return (
    <Tag status={status}>
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
  
  ${props => {
    switch(props.status) {
      case 'success':
        return `
          background-color: #e8f5e9;
          color: #2e7d32;
        `;
      case 'warning':
        return `
          background-color: #fff8e1;
          color: #f57f17;
        `;
      case 'error':
        return `
          background-color: #ffebee;
          color: #c62828;
        `;
      case 'info':
      default:
        return `
          background-color: #e3f2fd;
          color: #0d47a1;
        `;
    }
  }}
`;

export default StatusTag;