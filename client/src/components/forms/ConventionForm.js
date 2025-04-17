import React, { useState } from 'react';
import styled from 'styled-components';
import FormField from '../common/FormField';

const ConventionForm = ({ onSubmit, initialData = {}, isEditing = false, avocats = [] }) => {
  // Fonction pour extraire la partie YYYY-MM-DD d'une date ISO
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // Si la date est déjà au format ISO, extraire juste la partie YYYY-MM-DD
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    try {
      // Dans les autres cas, essayer de convertir et formater
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
      // Convertir les dates et autres données au bon format
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
    <Form onSubmit={handleSubmit}>
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
      
      <FormHelpText>
        <InfoIcon>ℹ️</InfoIcon>
        La date de validation FMG détermine quand la convention est prise en compte dans le budget.
      </FormHelpText>
      
      <ButtonGroup>
        <SubmitButton type="submit">
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
  background-color: #e3f2fd;
  border-radius: 4px;
  color: #0d47a1;
  font-size: 14px;
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
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #303f9f;
  }
`;

export default ConventionForm;