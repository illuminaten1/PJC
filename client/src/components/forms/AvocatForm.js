import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AvocatForm = ({ onSubmit, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialisationRPC: false
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        email: initialData.email || '',
        specialisationRPC: initialData.specialisationRPC || false
      });
    }
  }, [initialData]);
  
  const validate = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    
    // Validation basique de l'email si présent
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Traitement spécial pour les champs checkbox
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } 
    // Si le champ modifié est "nom", convertir en majuscules
    else if (name === 'nom') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <FormGroup>
          <Label htmlFor="nom">NOM <Required>*</Required></Label>
          <Input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            error={!!errors.nom}
          />
          {errors.nom && <ErrorText>{errors.nom}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="prenom">Prénom <Required>*</Required></Label>
          <Input
            type="text"
            id="prenom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            error={!!errors.prenom}
          />
          {errors.prenom && <ErrorText>{errors.prenom}</ErrorText>}
        </FormGroup>
      </FormRow>
      
      <FormGroup>
        <Label htmlFor="email">Email <Required>*</Required></Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
        />
        {errors.email && <ErrorText>{errors.email}</ErrorText>}
      </FormGroup>
      
      <FormGroup inline>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            id="specialisationRPC"
            name="specialisationRPC"
            checked={formData.specialisationRPC}
            onChange={handleChange}
          />
          <Label htmlFor="specialisationRPC" inline>
            Spécialisé en réparation du préjudice corporel (RPC)
          </Label>
        </CheckboxContainer>
        <SpecializationInfo>
          Cette spécialisation sera affichée sous forme de badge.
        </SpecializationInfo>
      </FormGroup>
      
      <FormActions>
        <SubmitButton type="submit">
          {isEditing ? 'Mettre à jour' : 'Ajouter'} l'avocat
        </SubmitButton>
      </FormActions>
    </Form>
  );
};

// Styles
const Form = styled.form`
  padding: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  flex: 1;
  
  ${props => props.inline && `
    display: flex;
    flex-direction: column;
  `}
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  
  ${props => props.inline && `
    margin-bottom: 0;
    margin-left: 8px;
  `}
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.error ? '#f44336' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#f44336' : '#3f51b5'};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
  cursor: pointer;
`;

const SpecializationInfo = styled.div`
  font-size: 12px;
  color: #757575;
  margin-top: 4px;
  margin-left: 24px;
`;

const Required = styled.span`
  color: #f44336;
`;

const ErrorText = styled.div`
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #303f9f;
  }
`;

export default AvocatForm;