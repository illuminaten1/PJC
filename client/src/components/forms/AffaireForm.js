import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FormField from '../common/FormField';
import { parametresAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

const AffaireForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const { colors } = useTheme();
  
  const [affaire, setAffaire] = useState({
    ...initialData,
    nom: initialData.nom || '',
    description: initialData.description || '',
    lieu: initialData.lieu || '',
    dateFaits: initialData.dateFaits ? new Date(initialData.dateFaits).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    redacteur: initialData.redacteur || ''
  });
  
  const [errors, setErrors] = useState({});
  const [redacteurs, setRedacteurs] = useState([]);
  
  useEffect(() => {
    const fetchRedacteurs = async () => {
      try {
        const response = await parametresAPI.getByType('redacteurs');
        setRedacteurs(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rédacteurs", error);
      }
    };
    
    fetchRedacteurs();
  }, []);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!affaire.nom.trim()) {
      newErrors.nom = 'Le nom de l\'affaire est requis';
    }

    if (!affaire.dateFaits) {
      newErrors.dateFaits = 'La date des faits est requise';
    }
    
    if (!affaire.lieu.trim()) {
      newErrors.lieu = 'Le lieu est requis';
    }

    if (!affaire.redacteur) {
      newErrors.redacteur = 'Le rédacteur est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAffaire(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formattedData = {
        ...affaire,
        dateFaits: new Date(affaire.dateFaits)
      };
      
      onSubmit(formattedData);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit} colors={colors}>
      <FormField
        label="Nom de l'affaire"
        name="nom"
        value={affaire.nom}
        onChange={handleChange}
        placeholder="Ex: Accident autoroute A13"
        required
        error={errors.nom}
      />
      
      <FormField
        label="Description des faits"
        name="description"
        type="textarea"
        value={affaire.description}
        onChange={handleChange}
        placeholder="Description détaillée de l'affaire..."
      />
      
      <FormField
        label="Lieu"
        name="lieu"
        value={affaire.lieu}
        onChange={handleChange}
        placeholder="Ex: Toulouse (31)"
        required
        error={errors.lieu}
      />
      
      <FormField
        label="Date des faits"
        name="dateFaits"
        type="date"
        value={affaire.dateFaits}
        onChange={handleChange}
        required
        error={errors.dateFaits}
      />
      
      <FormField
        label="Rédacteur en charge du dossier"
        name="redacteur"
        type="select"
        value={affaire.redacteur}
        onChange={handleChange}
        options={redacteurs}
        required
        error={errors.redacteur}
      />
      
      <ButtonGroup>
        <SubmitButton type="submit" colors={colors}>
          {isEditing ? 'Mettre à jour' : 'Créer l\'affaire'}
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

export default AffaireForm;