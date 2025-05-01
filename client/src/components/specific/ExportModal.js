import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileExcel, FaFilePdf, FaTimes } from 'react-icons/fa';

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
          <ModalTitle>Exporter les statistiques</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FormGroup>
            <Label>Format d'export</Label>
            <RadioGroup>
              <RadioOption
                active={format === 'excel'}
                onClick={() => setFormat('excel')}
              >
                <FaFileExcel />
                <RadioLabel>Excel</RadioLabel>
              </RadioOption>
              
              <RadioOption
                active={format === 'pdf'}
                onClick={() => setFormat('pdf')}
              >
                <FaFilePdf />
                <RadioLabel>PDF</RadioLabel>
              </RadioOption>
            </RadioGroup>
          </FormGroup>
          
          <FormGroup>
            <Checkbox
              checked={includeAnnualStats}
              onChange={() => setIncludeAnnualStats(!includeAnnualStats)}
              label={`Inclure les statistiques de l'année ${annee}`}
            />
          </FormGroup>
          
          {includeAnnualStats && (
            <IndentedSection>
              <FormGroup>
                <Checkbox
                  checked={includeRedacteurTable}
                  onChange={() => setIncludeRedacteurTable(!includeRedacteurTable)}
                  label="Inclure la répartition par rédacteur"
                />
              </FormGroup>
              
              <FormGroup>
                <Checkbox
                  checked={includeCirconstanceTable}
                  onChange={() => setIncludeCirconstanceTable(!includeCirconstanceTable)}
                  label="Inclure la répartition par circonstance"
                />
              </FormGroup>
            </IndentedSection>
          )}
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

// Composant pour les options de case à cocher
const Checkbox = ({ checked, onChange, label }) => {
  return (
    <CheckboxWrapper>
      <CheckboxInput
        type="checkbox"
        checked={checked}
        onChange={onChange}
        id={`checkbox-${label}`}
      />
      <CheckboxLabel htmlFor={`checkbox-${label}`}>{label}</CheckboxLabel>
    </CheckboxWrapper>
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
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
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
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

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const RadioOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid ${props => props.active ? '#3f51b5' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? '#e8eaf6' : 'transparent'};
  
  svg {
    font-size: 24px;
    margin-bottom: 8px;
    color: ${props => props.active ? '#3f51b5' : '#757575'};
  }
  
  &:hover {
    border-color: #3f51b5;
    background-color: #f5f7ff;
  }
`;

const RadioLabel = styled.span`
  font-size: 14px;
  color: #333;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxInput = styled.input`
  margin: 0;
  margin-right: 8px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const IndentedSection = styled.div`
  margin-left: 24px;
  padding-left: 12px;
  border-left: 2px solid #e0e0e0;
`;

const CancelButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ExportButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #303f9f;
  }
`;

export default ExportModal;