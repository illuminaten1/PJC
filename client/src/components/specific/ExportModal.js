import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileExcel, FaFilePdf, FaTimes, FaToggleOn, FaToggleOff, FaFileExport } from 'react-icons/fa';

/**
 * Composant de modal pour configurer l'export des statistiques
 */
const ExportModal = ({ show, onClose, onExport, annee, isAllYears = false }) => {
  // États pour les options d'export
  const [format, setFormat] = useState('excel');
  const [includeAnnualStats, setIncludeAnnualStats] = useState(true);
  const [includeRedacteurTable, setIncludeRedacteurTable] = useState(true);
  const [includeCirconstanceTable, setIncludeCirconstanceTable] = useState(true);
  const [includeRegionTable, setIncludeRegionTable] = useState(true);

  // État pour le chargement
  const [isExporting, setIsExporting] = useState(false);
  
  // Gestionnaire pour lancer l'export
  const handleExport = () => {
    setIsExporting(true);
    
    const exportOptions = {
      format,
      includeAnnualStats,
      includeRedacteurTable: includeAnnualStats && includeRedacteurTable,
      includeCirconstanceTable: includeAnnualStats && includeCirconstanceTable,
      includeRegionTable: includeAnnualStats && includeRegionTable,
      annee,
      isAllYears // Passer cette information aux fonctions d'export
    };
    
    onExport(exportOptions)
      .then(() => {
        setIsExporting(false);
        onClose();
      })
      .catch(() => {
        setIsExporting(false);
      });
  };
  
  // Ne pas rendre si la modal n'est pas visible
  if (!show) {
    return null;
  }
  
  return (
    <ModalOverlay>
      <ModalContent>
        {/* Indicateur de chargement */}
        {isExporting && (
          <LoadingWrapper>
            <DotsContainer>
              <Dot />
              <Dot />
              <Dot />
            </DotsContainer>
            <LoadingText>Export en cours</LoadingText>
          </LoadingWrapper>
        )}
        
        <ModalHeader>
          <ModalTitle>
            <FaFileExport style={{ marginRight: '10px' }} />
            Exporter les statistiques
          </ModalTitle>
          <CloseButton onClick={onClose} disabled={isExporting}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FormatSection>
            <Label>Format d'export</Label>
            <FormatOptions>
              <FormatCard 
                active={format === 'excel'} 
                onClick={() => !isExporting && setFormat('excel')}
                disabled={isExporting}
              >
                <FormatIcon>
                  <FaFileExcel />
                </FormatIcon>
                <FormatTitle>Excel</FormatTitle>
                <FormatDesc>Fichier tableur avec plusieurs feuilles</FormatDesc>
              </FormatCard>
              
              <FormatCard 
                active={format === 'pdf'} 
                onClick={() => !isExporting && setFormat('pdf')}
                disabled={isExporting}
              >
                <FormatIcon>
                  <FaFilePdf />
                </FormatIcon>
                <FormatTitle>PDF</FormatTitle>
                <FormatDesc>Document formaté pour impression</FormatDesc>
              </FormatCard>
            </FormatOptions>
          </FormatSection>
          
          <OptionsSection>
            <ToggleField disabled={isExporting}>
              <ToggleIcon 
                checked={includeAnnualStats}
                onClick={() => !isExporting && setIncludeAnnualStats(!includeAnnualStats)}
              >
                {includeAnnualStats ? <FaToggleOn /> : <FaToggleOff />}
              </ToggleIcon>
              <label onClick={() => !isExporting && setIncludeAnnualStats(!includeAnnualStats)}>
                {isAllYears 
                  ? "Inclure les statistiques détaillées pour toutes les années" 
                  : `Inclure les statistiques de l'année ${annee}`
                }
              </label>
            </ToggleField>
            
            {includeAnnualStats && (
              <IndentedSection>
                <SubToggleField disabled={isExporting}>
                  <ToggleIcon 
                    checked={includeRedacteurTable}
                    onClick={() => !isExporting && setIncludeRedacteurTable(!includeRedacteurTable)}
                  >
                    {includeRedacteurTable ? <FaToggleOn /> : <FaToggleOff />}
                  </ToggleIcon>
                  <label onClick={() => !isExporting && setIncludeRedacteurTable(!includeRedacteurTable)}>
                    Inclure la répartition par rédacteur
                  </label>
                </SubToggleField>
                
                <SubToggleField disabled={isExporting}>
                  <ToggleIcon 
                    checked={includeCirconstanceTable}
                    onClick={() => !isExporting && setIncludeCirconstanceTable(!includeCirconstanceTable)}
                  >
                    {includeCirconstanceTable ? <FaToggleOn /> : <FaToggleOff />}
                  </ToggleIcon>
                  <label onClick={() => !isExporting && setIncludeCirconstanceTable(!includeCirconstanceTable)}>
                    Inclure la répartition par circonstance
                  </label>
                </SubToggleField>
                
                {/* Nouvelle option pour la répartition par région */}
                <SubToggleField disabled={isExporting}>
                  <ToggleIcon 
                    checked={includeRegionTable}
                    onClick={() => !isExporting && setIncludeRegionTable(!includeRegionTable)}
                  >
                    {includeRegionTable ? <FaToggleOn /> : <FaToggleOff />}
                  </ToggleIcon>
                  <label onClick={() => !isExporting && setIncludeRegionTable(!includeRegionTable)}>
                    Inclure la répartition par région
                  </label>
                </SubToggleField>
              </IndentedSection>
            )}
          </OptionsSection>
        </ModalBody>
        
        <ModalFooter>
          <CancelButton onClick={onClose} disabled={isExporting}>
            Annuler
          </CancelButton>
          <ExportButton onClick={handleExport} disabled={isExporting}>
            Exporter
          </ExportButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styles du composant
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

// Styles pour l'indicateur de chargement
const LoadingWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  z-index: 10;
`;

const DotsContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  margin: 0 5px;
  background: #3f51b5;
  border-radius: 50%;
  
  &:nth-child(1) { animation: pulse 1s infinite; }
  &:nth-child(2) { animation: pulse 1s infinite 0.2s; }
  &:nth-child(3) { animation: pulse 1s infinite 0.4s; }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f7ff;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #3f51b5;
  display: flex;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #757575;
  font-size: 18px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : '#f5f5f5'};
    color: ${props => props.disabled ? '#757575' : '#333'};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  flex-grow: 1;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  gap: 12px;
`;

const FormatSection = styled.div`
  margin-bottom: 24px;
`;

const OptionsSection = styled.div`
  margin-top: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 16px;
  font-weight: 500;
  color: #333;
  font-size: 16px;
`;

const FormatOptions = styled.div`
  display: flex;
  gap: 16px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const FormatCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid ${props => props.active ? '#3f51b5' : '#e0e0e0'};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.2s ease;
  background-color: ${props => props.active ? '#e8eaf6' : 'white'};
  
  &:hover {
    border-color: ${props => props.disabled ? (props.active ? '#3f51b5' : '#e0e0e0') : '#3f51b5'};
    background-color: ${props => props.disabled ? (props.active ? '#e8eaf6' : 'white') : (props.active ? '#e8eaf6' : '#f5f7ff')};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.05)'};
  }
`;

const FormatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  color: #3f51b5;
`;

const FormatTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const FormatDesc = styled.p`
  margin: 0;
  font-size: 14px;
  color: #757575;
  text-align: center;
`;

const ToggleField = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  padding: 12px 16px;
  background-color: #f5f7ff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  label {
    margin-left: 12px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    font-weight: 500;
    color: #333;
  }
`;

const SubToggleField = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 10px 16px;
  background-color: white;
  border-radius: 8px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  label {
    margin-left: 12px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    color: #333;
  }
`;

const ToggleIcon = styled.span`
  font-size: 24px;
  color: ${props => props.checked ? '#3f51b5' : '#aaaaaa'};
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const IndentedSection = styled.div`
  margin-left: 12px;
  padding: 5px 5px 5px 12px;
  border-left: 2px solid #e0e0e0;
`;

const CancelButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? '#f5f5f5' : '#e0e0e0'};
  }
`;

const ExportButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? '#3f51b5' : '#303f9f'};
  }
`;

export default ExportModal;