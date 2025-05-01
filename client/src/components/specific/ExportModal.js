import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileExcel, FaFilePdf, FaTimes, FaToggleOn, FaToggleOff, FaFileExport } from 'react-icons/fa';

/**
 * Composant de modal pour configurer l'export des statistiques
 */
const ExportModal = ({ show, onClose, onExport, annee }) => {
  // États pour les options d'export
  const [format, setFormat] = useState('excel');
  const [includeAnnualStats, setIncludeAnnualStats] = useState(true);
  const [includeRedacteurTable, setIncludeRedacteurTable] = useState(true);
  const [includeCirconstanceTable, setIncludeCirconstanceTable] = useState(true);
  
  // Gestionnaire pour lancer l'export
  const handleExport = () => {
    onExport({
      format,
      includeAnnualStats,
      includeRedacteurTable: includeAnnualStats && includeRedacteurTable,
      includeCirconstanceTable: includeAnnualStats && includeCirconstanceTable,
      annee
    });
    onClose();
  };
  
  // Ne pas rendre si la modal n'est pas visible
  if (!show) {
    return null;
  }
  
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FaFileExport style={{ marginRight: '10px' }} />
            Exporter les statistiques
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FormatSection>
            <Label>Format d'export</Label>
            <FormatOptions>
              <FormatCard 
                active={format === 'excel'} 
                onClick={() => setFormat('excel')}
              >
                <FormatIcon>
                  <FaFileExcel />
                </FormatIcon>
                <FormatTitle>Excel</FormatTitle>
                <FormatDesc>Fichier tableur avec plusieurs feuilles</FormatDesc>
              </FormatCard>
              
              <FormatCard 
                active={format === 'pdf'} 
                onClick={() => setFormat('pdf')}
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
            <ToggleField>
              <ToggleIcon 
                checked={includeAnnualStats}
                onClick={() => setIncludeAnnualStats(!includeAnnualStats)}
              >
                {includeAnnualStats ? <FaToggleOn /> : <FaToggleOff />}
              </ToggleIcon>
              <label onClick={() => setIncludeAnnualStats(!includeAnnualStats)}>
                Inclure les statistiques de l'année {annee}
              </label>
            </ToggleField>
            
            {includeAnnualStats && (
              <IndentedSection>
                <SubToggleField>
                  <ToggleIcon 
                    checked={includeRedacteurTable}
                    onClick={() => setIncludeRedacteurTable(!includeRedacteurTable)}
                  >
                    {includeRedacteurTable ? <FaToggleOn /> : <FaToggleOff />}
                  </ToggleIcon>
                  <label onClick={() => setIncludeRedacteurTable(!includeRedacteurTable)}>
                    Inclure la répartition par rédacteur
                  </label>
                </SubToggleField>
                
                <SubToggleField>
                  <ToggleIcon 
                    checked={includeCirconstanceTable}
                    onClick={() => setIncludeCirconstanceTable(!includeCirconstanceTable)}
                  >
                    {includeCirconstanceTable ? <FaToggleOn /> : <FaToggleOff />}
                  </ToggleIcon>
                  <label onClick={() => setIncludeCirconstanceTable(!includeCirconstanceTable)}>
                    Inclure la répartition par circonstance
                  </label>
                </SubToggleField>
              </IndentedSection>
            )}
          </OptionsSection>
        </ModalBody>
        
        <ModalFooter>
          <CancelButton onClick={onClose}>
            Annuler
          </CancelButton>
          <ExportButton onClick={handleExport}>
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  
  &:hover {
    background-color: #f5f5f5;
    color: #333;
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
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? '#e8eaf6' : 'white'};
  
  &:hover {
    border-color: #3f51b5;
    background-color: ${props => props.active ? '#e8eaf6' : '#f5f7ff'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
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
  
  label {
    margin-left: 12px;
    cursor: pointer;
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
  
  label {
    margin-left: 12px;
    cursor: pointer;
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
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ExportButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #303f9f;
  }
`;

export default ExportModal;