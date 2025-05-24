import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FormField from '../common/FormField';
import { militairesAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

const BeneficiaireForm = ({ onSubmit, initialData = {}, isEditing = false, militaireId = null }) => {
  const { colors } = useTheme();
  
  const formatDateForInput = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  };

  const [beneficiaire, setBeneficiaire] = useState({
    ...initialData,
    prenom: initialData.prenom || '',
    nom: initialData.nom || '',
    qualite: initialData.qualite || 'Militaire',
    militaire: initialData.militaire || militaireId || '',
    numeroDecision: initialData.numeroDecision || '',
    dateDecision: formatDateForInput(initialData.dateDecision),
    avocats: Array.isArray(initialData.avocats) ? initialData.avocats : []
  });
  
  const [errors, setErrors] = useState({});
  const [militaire, setMilitaire] = useState(null);
  
  useEffect(() => {
    if (militaireId) {
      const fetchMilitaire = async () => {
        try {
          const response = await militairesAPI.getById(militaireId);
          setMilitaire(response.data);
          
          if (beneficiaire.qualite === 'Militaire') {
            setBeneficiaire(prev => ({
              ...prev,
              prenom: response.data.prenom,
              nom: response.data.nom
            }));
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du militaire", error);
        }
      };
      
      fetchMilitaire();
    }
  }, [militaireId, beneficiaire.qualite]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!beneficiaire.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    
    if (!beneficiaire.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    
    if (!beneficiaire.qualite) {
      newErrors.qualite = 'La qualité est requise';
    }
    
    if (!beneficiaire.militaire) {
      newErrors.militaire = 'Le militaire créateur de droit est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'qualite' && value === 'Militaire' && militaire) {
      setBeneficiaire(prev => ({
        ...prev,
        qualite: value,
        prenom: militaire.prenom,
        nom: militaire.nom
      }));
    } else {
      setBeneficiaire(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formattedData = {
        ...beneficiaire,
        dateDecision: beneficiaire.dateDecision ? new Date(beneficiaire.dateDecision) : undefined
      };
      
      onSubmit(formattedData);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit} colors={colors}>
      <FormField
        label="Qualité"
        name="qualite"
        type="select"
        value={beneficiaire.qualite}
        onChange={handleChange}
        options={[
          { value: 'Militaire', label: 'Militaire (lui-même)' },
          { value: 'Conjoint', label: 'Conjoint' },
          { value: 'Enfant', label: 'Enfant' },
          { value: 'Parent', label: 'Parent' },
          { value: 'Autre', label: 'Autre' }
        ]}
        required
        error={errors.qualite}
      />
      
      <FormRow>
        <FormField
          label="Prénom"
          name="prenom"
          value={beneficiaire.prenom}
          onChange={handleChange}
          placeholder="Prénom du bénéficiaire"
          required
          error={errors.prenom}
        />
        
        <FormField
          label="Nom"
          name="nom"
          value={beneficiaire.nom}
          onChange={handleChange}
          placeholder="Nom du bénéficiaire"
          required
          error={errors.nom}
        />
      </FormRow>
      
      <FormRow>
        <FormField
          label="Numéro de décision"
          name="numeroDecision"
          value={beneficiaire.numeroDecision}
          onChange={handleChange}
          placeholder="Ex: 18456 (optionnel)"
          required={false}
          error={errors.numeroDecision}
        />
        
        <FormField
          label="Date de la décision"
          name="dateDecision"
          type="date"
          value={beneficiaire.dateDecision}
          onChange={handleChange}
          placeholder="Date de la décision (optionnel)"
          required={false}
          error={errors.dateDecision}
        />
      </FormRow>
      
      <ButtonGroup>
        <SubmitButton type="submit" colors={colors}>
          {isEditing ? 'Mettre à jour' : 'Créer le bénéficiaire'}
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 12px;
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

export default BeneficiaireForm;