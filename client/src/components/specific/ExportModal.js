import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileExcel, FaFilePdf, FaTimes, FaToggleOn, FaToggleOff, FaFileExport } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

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
  
  const { colors } = useTheme();
  
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
      <ModalContent colors={colors}>
        {/* Indicateur de chargement */}
        {isExporting && (
          <LoadingWrapper colors={colors}>
            <DotsContainer>
              <Dot colors={colors} />
              <Dot colors={colors} />
              <Dot colors={colors} />
            </DotsContainer>
            <LoadingText colors={colors}>Export en cours</LoadingText>
          </LoadingWrapper>
        )}
        
        <ModalHeader colors={colors}>
          <ModalTitle colors={colors}>
            <FaFileExport style={{ marginRight: '10px' }} />
            Exporter les statistiques
          </ModalTitle>
          <CloseButton onClick={onClose} disabled={isExporting} colors={colors}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody colors={colors}>
          <FormatSection>
            <Label colors={colors}>Format d'export</Label>
            <FormatOptions>
              <FormatCard 
                active={format === 'excel'} 
                onClick={() => !isExporting && setFormat('excel')}
                disabled={isExporting}
                colors={colors}
              >
                <FormatIcon colors={colors}>
                  <FaFileExcel />
                </FormatIcon>
                <FormatTitle colors={colors}>Excel</FormatTitle>
                <FormatDesc colors={colors}>Fichier tableur avec plusieurs feuilles</FormatDesc>
              </FormatCard>
              
              <FormatCard 
                active={format === 'pdf'} 
                onClick={() => !isExporting && setFormat('pdf')}
                disabled={isExporting}
                colors={colors}
              >
                <FormatIcon colors={colors}>
                  <FaFilePdf />
                </FormatIcon>
                <FormatTitle colors={colors}>PDF</FormatTitle>
                <FormatDesc colors={colors}>Document formaté pour impression</FormatDesc>
              </FormatCard>
            </FormatOptions>
          </FormatSection>
          
          <OptionsSection>
            <ToggleField disabled={isExporting} colors={colors}>
              <ToggleIcon 
                checked={includeAnnualStats}
                onClick={() => !isExporting && setIncludeAnnualStats(!includeAnnualStats)}
                colors={colors}
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
              <IndentedSection colors={colors}>
                <SubToggleField disabled={isExporting} colors={colors}>
                  <ToggleIcon 
                    checked={includeRedacteurTable}
                    onClick={() => !isExporting && setIncludeRedacteurTable(!includeRedacteurTable)}
                    colors={colors}
                  >
                    {includeRedacteurTable ? <FaToggleOn /> : <FaToggleOff />}
                  </ToggleIcon>
                  <label onClick={() => !isExporting && setIncludeRedacteurTable(!includeRedacteurTable)}>
                    Inclure la répartition par rédacteur
                  </label>
                </SubToggleField>
                
                <SubToggleField disabled={isExporting} colors={colors}>
                  <ToggleIcon 
                    checked={includeCirconstanceTable}
                    onClick={() => !isExporting && setIncludeCirconstanceTable(!includeCirconstanceTable)}
                    colors={colors}
                  >
                    {includeCirconstanceTable ? <FaToggleOn /> : <FaToggleOff />}
                  </ToggleIcon>
                  <label onClick={() => !isExporting && setIncludeCirconstanceTable(!includeCirconstanceTable)}>
                    Inclure la répartition par circonstance
                  </label>
                </SubToggleField>
                
                {/* Nouvelle option pour la répartition par région */}
                <SubToggleField disabled={isExporting} colors={colors}>
                  <ToggleIcon 
                    checked={includeRegionTable}
                    onClick={() => !isExporting && setIncludeRegionTable(!includeRegionTable)}
                    colors={colors}
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
        
        <ModalFooter colors={colors}>
          <CancelButton onClick={onClose} disabled={isExporting} colors={colors}>
            Annuler
          </CancelButton>
          <ExportButton onClick={handleExport} disabled={isExporting} colors={colors}>
            Exporter
          </ExportButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styles du composant avec thématisation
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
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadowHover};
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
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
  background: ${props => props.colors.surface}f0;
  border-radius: 8px;
  z-index: 10;
  backdrop-filter: blur(2px);
  transition: background-color 0.3s ease;
`;

const DotsContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  margin: 0 5px;
  background: ${props => props.colors.primary};
  border-radius: 50%;
  transition: background-color 0.3s ease;
  
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
  color: ${props => props.colors.textPrimary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  background-color: ${props => props.colors.surfaceHover};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  transition: all 0.3s ease;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.colors.primary};
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.colors.textMuted};
  font-size: 18px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : props.colors.navActive};
    color: ${props => props.disabled ? props.colors.textMuted : props.colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  flex-grow: 1;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid ${props => props.colors.borderLight};
  background-color: ${props => props.colors.surfaceHover};
  gap: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  transition: all 0.3s ease;
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
  color: ${props => props.colors.textPrimary};
  font-size: 16px;
  transition: color 0.3s ease;
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
  border: 2px solid ${props => props.active ? props.colors.primary : props.colors.border};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.3s ease;
  background-color: ${props => props.active ? props.colors.primary + '20' : props.colors.surface};
  
  &:hover {
    border-color: ${props => props.disabled ? (props.active ? props.colors.primary : props.colors.border) : props.colors.primary};
    background-color: ${props => props.disabled ? (props.active ? props.colors.primary + '20' : props.colors.surface) : props.colors.primary + '20'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : props.colors.shadowHover};
  }
`;

const FormatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  color: ${props => props.colors.primary};
  transition: color 0.3s ease;
`;

const FormatTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const FormatDesc = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  text-align: center;
  transition: color 0.3s ease;
`;

const ToggleField = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  padding: 12px 16px;
  background-color: ${props => props.colors.primary + '20'};
  border-radius: 8px;
  border: 1px solid ${props => props.colors.primary + '40'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.3s ease;
  
  label {
    margin-left: 12px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    font-weight: 500;
    color: ${props => props.colors.textPrimary};
    transition: color 0.3s ease;
  }
`;

const SubToggleField = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 10px 16px;
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 8px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
  }
  
  label {
    margin-left: 12px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    color: ${props => props.colors.textPrimary};
    transition: color 0.3s ease;
  }
`;

const ToggleIcon = styled.span`
  font-size: 24px;
  color: ${props => props.checked ? props.colors.primary : props.colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => props.colors.primary};
  }
`;

const IndentedSection = styled.div`
  margin-left: 12px;
  padding: 5px 5px 5px 12px;
  border-left: 2px solid ${props => props.colors.borderLight};
  transition: border-color 0.3s ease;
`;

const CancelButton = styled.button`
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  padding: 10px 16px;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? props.colors.surface : props.colors.surfaceHover};
    border-color: ${props => props.disabled ? props.colors.border : props.colors.primary};
  }
`;

const ExportButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? props.colors.primary : props.colors.primaryDark};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : props.colors.shadowHover};
  }
`;

export default ExportModal;