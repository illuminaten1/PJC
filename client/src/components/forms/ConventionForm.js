import React, { useState } from 'react';
import styled from 'styled-components';
import FormField from '../common/FormField';
import { useTheme } from '../../contexts/ThemeContext';

const ConventionForm = ({ onSubmit, initialData = {}, isEditing = false, avocats = [] }) => {
  const { colors } = useTheme();
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return '';
    }
  };
  
  const [convention, setConvention] = useState({
    montant: initialData.montant || '',
    pourcentageResultats: initialData.pourcentageResultats !== undefined ? initialData.pourcentageResultats : 5,
    dateEnvoiAvocat: formatDateForInput(initialData.dateEnvoiAvocat),
    dateEnvoiBeneficiaire: formatDateForInput(initialData.dateEnvoiBeneficiaire),
    dateValidationFMG: formatDateForInput(initialData.dateValidationFMG),
    avocat: initialData.avocat || (avocats.length > 0 ? avocats[0]._id : ''),
  });
  
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!convention.montant) {
      newErrors.montant = 'Le montant est requis';
    } else if (isNaN(convention.montant) || parseFloat(convention.montant) <= 0) {
      newErrors.montant = 'Le montant doit être un nombre positif';
    }
    
    if (convention.pourcentageResultats && (isNaN(convention.pourcentageResultats) || parseFloat(convention.pourcentageResultats) < 0 || parseFloat(convention.pourcentageResultats) > 100)) {
      newErrors.pourcentageResultats = 'Le pourcentage doit être entre 0 et 100';
    }
    
    if (!convention.avocat) {
      newErrors.avocat = 'L\'avocat est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setConvention(prev => ({
      ...prev,
      [name]: name === 'montant' || name === 'pourcentageResultats' ? 
              (value === '' ? '' : Number(value)) : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formattedData = {
        ...convention,
        dateEnvoiAvocat: convention.dateEnvoiAvocat ? new Date(convention.dateEnvoiAvocat) : undefined,
        dateEnvoiBeneficiaire: convention.dateEnvoiBeneficiaire ? new Date(convention.dateEnvoiBeneficiaire) : undefined,
        dateValidationFMG: convention.dateValidationFMG ? new Date(convention.dateValidationFMG) : undefined
      };
      
      onSubmit(formattedData);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit} colors={colors}>
      <FormRow>
        <FormField
          label="Montant (HT)"
          name="montant"
          type="number"
          value={convention.montant}
          onChange={handleChange}
          placeholder="Ex: 1500"
          required
          error={errors.montant}
        />
        
        <FormField
          label="Pourcentage sur résultats (%)"
          name="pourcentageResultats"
          type="number"
          value={convention.pourcentageResultats}
          onChange={handleChange}
          placeholder="Ex: 5"
          error={errors.pourcentageResultats}
        />
      </FormRow>
      
      <FormField
        label="Avocat"
        name="avocat"
        type="select"
        value={convention.avocat}
        onChange={handleChange}
        options={avocats.map(avocat => ({
          value: avocat._id,
          label: `Me ${avocat.prenom} ${avocat.nom}${avocat.specialisationRPC ? ' (RPC)' : ''}`
        }))}
        required
        error={errors.avocat}
      />
      
      <FormRow>
        <FormField
          label="Date d'envoi à l'avocat"
          name="dateEnvoiAvocat"
          type="date"
          value={convention.dateEnvoiAvocat}
          onChange={handleChange}
        />
        
        <FormField
          label="Date d'envoi au bénéficiaire"
          name="dateEnvoiBeneficiaire"
          type="date"
          value={convention.dateEnvoiBeneficiaire}
          onChange={handleChange}
        />
        
        <FormField
          label="Date de validation FMG (prise en compte budgétaire)"
          name="dateValidationFMG"
          type="date"
          value={convention.dateValidationFMG}
          onChange={handleChange}
        />
      </FormRow>
      
      <FormHelpText colors={colors}>
        <InfoIcon>ℹ️</InfoIcon>
        La date de validation FMG détermine quand la convention est prise en compte dans le budget.
      </FormHelpText>
      
      <ButtonGroup>
        <SubmitButton type="submit" colors={colors}>
          {isEditing ? 'Mettre à jour la convention' : 'Ajouter la convention'}
        </SubmitButton>
      </ButtonGroup>
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: ${props => props.colors.surface};
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const FormHelpText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: ${props => props.colors.primary}15;
  border: 1px solid ${props => props.colors.primary}30;
  border-radius: 4px;
  color: ${props => props.colors.primary};
  font-size: 14px;
  transition: all 0.3s ease;
`;

const InfoIcon = styled.span`
  font-size: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

const SubmitButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

export default ConventionForm;