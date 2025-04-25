import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FormField from '../common/FormField';
import { militairesAPI } from '../../utils/api';

const BeneficiaireForm = ({ onSubmit, initialData = {}, isEditing = false, militaireId = null }) => {
  // Formatage de la date pour l'input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  };

  const [beneficiaire, setBeneficiaire] = useState({
    // On étale d'abord les propriétés de initialData
    ...initialData,
    // Ensuite, on écrase avec les valeurs formatées ou les valeurs par défaut
    prenom: initialData.prenom || '',
    nom: initialData.nom || '',
    qualite: initialData.qualite || 'Militaire',
    militaire: initialData.militaire || militaireId || '',
    numeroDecision: initialData.numeroDecision || '',
    // Format correct pour l'input de type date (YYYY-MM-DD)
    dateDecision: formatDateForInput(initialData.dateDecision),
    avocats: Array.isArray(initialData.avocats) ? initialData.avocats : []
  });
  
  const [errors, setErrors] = useState({});
  const [militaire, setMilitaire] = useState(null);
  
  // Récupérer les informations du militaire pour préremplir les champs
  useEffect(() => {
    if (militaireId) {
      const fetchMilitaire = async () => {
        try {
          const response = await militairesAPI.getById(militaireId);
          setMilitaire(response.data);
          
          // Préremplir nom et prénom si qualité est "Militaire"
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
      // Si qualité devient "Militaire", préremplir nom et prénom
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
      // Créer un nouvel objet avec les dates converties si nécessaire
      const formattedData = {
        ...beneficiaire,
        dateDecision: beneficiaire.dateDecision ? new Date(beneficiaire.dateDecision) : undefined
      };
      
      onSubmit(formattedData);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {/* Qualité d'abord */}
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
        <SubmitButton type="submit">
          {isEditing ? 'Mettre à jour' : 'Créer le bénéficiaire'}
        </SubmitButton>
      </ButtonGroup>
    </Form>
  );
};

// Styles
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

const Section = styled.section`
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 12px;
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

const AddButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #388e3c;
  }
`;

export default BeneficiaireForm;