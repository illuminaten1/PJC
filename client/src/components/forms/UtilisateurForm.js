import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import FormField from '../common/FormField';

/**
 * Formulaire pour créer ou modifier un utilisateur
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.initialData - Données initiales (vide pour création, rempli pour modification)
 * @param {Function} props.onSubmit - Fonction appelée à la soumission du formulaire
 * @param {Function} props.onCancel - Fonction appelée à l'annulation
 * @param {boolean} props.loading - Indique si une opération est en cours
 */
const UtilisateurForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  // État local pour les données du formulaire
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nom: '',
    role: 'redacteur'
  });
  
  // État pour les erreurs de validation
  const [errors, setErrors] = useState({});
  
  // Mettre à jour l'état local lorsque les données initiales changent
  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        password: '', // Ne pas pré-remplir le mot de passe pour des raisons de sécurité
        nom: initialData.nom || '',
        role: initialData.role || 'redacteur'
      });
    }
  }, [initialData]);
  
  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ s'il y en avait une
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Valider le formulaire avant soumission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }
    
    // Le mot de passe est requis uniquement pour un nouvel utilisateur
    if (!initialData?._id && !formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    }
    
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom complet est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormField
        label="Nom d'utilisateur"
        type="text"
        id="username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        required
        disabled={loading}
      />
      
      <FormField
        label={initialData?._id ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required={!initialData?._id}
        disabled={loading}
      />
      
      <FormField
        label="Nom complet"
        type="text"
        id="nom"
        name="nom"
        value={formData.nom}
        onChange={handleChange}
        error={errors.nom}
        required
        disabled={loading}
      />
      
      <FormGroup>
        <Label htmlFor="role">Rôle</Label>
        <Select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="redacteur">Rédacteur</option>
          <option value="administrateur">Administrateur</option>
        </Select>
        <HelpText>
          Les administrateurs peuvent gérer les utilisateurs et accéder à toutes les fonctionnalités.
          Les rédacteurs ne peuvent pas gérer les utilisateurs.
        </HelpText>
      </FormGroup>
      
      <ButtonGroup>
        <CancelButton 
          type="button" 
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </CancelButton>
        <SubmitButton 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Chargement...' : initialData?._id ? 'Modifier' : 'Créer'}
        </SubmitButton>
      </ButtonGroup>
    </FormContainer>
  );
};

UtilisateurForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

// Styles
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
    box-shadow: 0 0 0 1px #3f51b5;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const HelpText = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f5f5f5;
  color: #333;
  
  &:hover:not(:disabled) {
    background-color: #e0e0e0;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #3f51b5;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #303f9f;
  }
`;

export default UtilisateurForm;