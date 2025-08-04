import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import FormField from '../common/FormField';
import { useTheme } from '../../contexts/ThemeContext';

const UtilisateurForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nom: '',
    role: 'redacteur'
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        password: '',
        confirmPassword: '',
        nom: initialData.nom || '',
        role: initialData.role || 'redacteur'
      });
    }
  }, [initialData]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }
    
    if (!initialData?._id && !formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    }
    
    // Vérifier la correspondance des mots de passe si un mot de passe est fourni
    if (formData.password.trim() && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    // Vérifier que la confirmation est fournie si un mot de passe est fourni
    if (formData.password.trim() && !formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    }
    
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom complet est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <FormContainer onSubmit={handleSubmit} colors={colors}>
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
      
      {(formData.password.trim() || !initialData?._id) && (
        <FormField
          label="Confirmer le mot de passe"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required={!initialData?._id || formData.password.trim()}
          disabled={loading}
        />
      )}
      
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
        <Label htmlFor="role" colors={colors}>Rôle</Label>
        <Select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={loading}
          colors={colors}
        >
          <option value="redacteur">Rédacteur</option>
          <option value="administrateur">Administrateur</option>
        </Select>
        <HelpText colors={colors}>
          Les administrateurs peuvent gérer les utilisateurs et accéder à toutes les fonctionnalités.
          Les rédacteurs ne peuvent pas gérer les utilisateurs.
        </HelpText>
      </FormGroup>
      
      <ButtonGroup>
        <CancelButton 
          type="button" 
          onClick={onCancel}
          disabled={loading}
          colors={colors}
        >
          Annuler
        </CancelButton>
        <SubmitButton 
          type="submit"
          disabled={loading}
          colors={colors}
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

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  background-color: ${props => props.colors.surface};
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 1px ${props => props.colors.primary};
  }
  
  &:disabled {
    background-color: ${props => props.colors.background};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const HelpText = styled.div`
  font-size: 0.875rem;
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
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
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: ${props => props.colors.background};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.colors.surfaceHover};
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled(Button)`
  background-color: ${props => props.colors.primary};
  color: white;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

export default UtilisateurForm;