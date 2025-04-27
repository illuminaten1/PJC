// components/common/ExportButton.js - version mise à jour
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileExcel, FaSpinner } from 'react-icons/fa';
import { exportAPI } from '../../utils/api';

const ExportButton = ({ 
  params = {}, 
  beneficiaireId = null, // Nouvelle prop pour l'ID du bénéficiaire
  className,
  label = "Exporter Excel",
  tooltipText = "Exporter les données au format Excel" 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleExport = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Si un ID de bénéficiaire est fourni, utiliser l'export spécifique
      if (beneficiaireId) {
        await exportAPI.exportBeneficiaireById(beneficiaireId);
      } else {
        await exportAPI.exportBeneficiaires(params);
      }
    } catch (err) {
      console.error("Erreur lors de l'export Excel", err);
      setError("Erreur lors de l'export Excel");
      
      // Réinitialiser l'erreur après 4 secondes
      setTimeout(() => {
        setError(null);
      }, 4000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ButtonContainer className={className}>
      <ExportButtonStyled onClick={handleExport} disabled={loading} title={tooltipText}>
        {loading ? (
          <SpinnerIcon />
        ) : (
          <ExcelIcon />
        )}
        <ButtonText>{loading ? 'Exportation...' : label}</ButtonText>
      </ExportButtonStyled>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </ButtonContainer>
  );
};

// Styles
const ButtonContainer = styled.div`
  position: relative;
`;

const ExportButtonStyled = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #1d6f42; /* Couleur verte de Excel */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #174d2f;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ExcelIcon = styled(FaFileExcel)`
  font-size: 16px;
`;

const SpinnerIcon = styled(FaSpinner)`
  font-size: 16px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 200px;
  background-color: #f44336;
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
  z-index: 100;
  
  &:before {
    content: '';
    position: absolute;
    top: -6px;
    left: 10px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #f44336;
  }
`;

export default ExportButton;