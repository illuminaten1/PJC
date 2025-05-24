import React, { useState } from 'react';
import styled from 'styled-components';
import FormField from '../common/FormField';
import { useTheme } from '../../contexts/ThemeContext';

const PaiementForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const { colors } = useTheme();
  const today = new Date().toISOString().split('T')[0];
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return today;
    
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return today;
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return today;
    }
  };
  
  const [paiement, setPaiement] = useState({
    type: initialData.type || 'Facture',
    montant: initialData.montant || '',
    date: formatDateForInput(initialData.date),
    qualiteDestinataire: initialData.qualiteDestinataire || 'Avocat',
    identiteDestinataire: initialData.identiteDestinataire || '',
    referencePiece: initialData.referencePiece || '',
    adresseDestinataire: initialData.adresseDestinataire || '',
    siretRidet: initialData.siretRidet || '',
    titulaireCompte: initialData.titulaireCompte || '',
    codeEtablissement: initialData.codeEtablissement || '',
    codeGuichet: initialData.codeGuichet || '',
    numeroCompte: initialData.numeroCompte || '',
    cleVerification: initialData.cleVerification || ''
  });
  
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!paiement.type.trim()) {
      newErrors.type = 'Le type de paiement est requis';
    }
    
    if (!paiement.montant) {
      newErrors.montant = 'Le montant est requis';
    } else if (isNaN(paiement.montant) || parseFloat(paiement.montant) <= 0) {
      newErrors.montant = 'Le montant doit être un nombre positif';
    }
    
    if (!paiement.date) {
      newErrors.date = 'La date est requise';
    }
    
    if (!paiement.qualiteDestinataire) {
      newErrors.qualiteDestinataire = 'La qualité du destinataire est requise';
    }
    
    if (!paiement.identiteDestinataire.trim()) {
      newErrors.identiteDestinataire = 'L\'identité du destinataire est requise';
    }
    
    if (paiement.codeEtablissement && !/^\d{5}$/.test(paiement.codeEtablissement)) {
      newErrors.codeEtablissement = 'Le code établissement doit comporter 5 chiffres';
    }
    
    if (paiement.codeGuichet && !/^\d{5}$/.test(paiement.codeGuichet)) {
      newErrors.codeGuichet = 'Le code guichet doit comporter 5 chiffres';
    }
    
    if (paiement.numeroCompte && !/^[A-Za-z0-9]{11}$/.test(paiement.numeroCompte)) {
      newErrors.numeroCompte = 'Le numéro de compte doit comporter 11 caractères alphanumériques';
    }
    
    if (paiement.cleVerification && !/^\d{2}$/.test(paiement.cleVerification)) {
      newErrors.cleVerification = 'La clé de vérification doit comporter 2 chiffres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setPaiement(prev => ({
      ...prev,
      [name]: name === 'montant' ? (value === '' ? '' : parseFloat(value) || 0) : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formattedData = {
        ...paiement,
        date: new Date(paiement.date)
      };
      
      onSubmit(formattedData);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit} colors={colors}>
      <FormRow>
        <FormField
          label="Type de paiement"
          name="type"
          type="select"
          value={paiement.type}
          onChange={handleChange}
          options={[
            'Facture',
            'Remboursement',
            'Consignation',
            'Autre'
          ]}
          required
          error={errors.type}
        />
        
        <FormField
          label="Montant (TTC)"
          name="montant"
          type="number"
          value={paiement.montant}
          onChange={handleChange}
          placeholder="Ex: 1500"
          required
          error={errors.montant}
        />
      </FormRow>
      
      <FormField
        label="Date de paiement"
        name="date"
        type="date"
        value={paiement.date}
        onChange={handleChange}
        required
        error={errors.date}
      />
      
      <Section colors={colors}>
        <SectionTitle colors={colors}>Informations sur le destinataire</SectionTitle>
        
        <FormRow>
          <FormField
            label="Qualité du destinataire"
            name="qualiteDestinataire"
            type="select"
            value={paiement.qualiteDestinataire}
            onChange={handleChange}
            options={[
              'Avocat',
              'Commissaire de justice',
              'Militaire de la gendarmerie nationale',
              'Régisseur du TJ',
              'Médecin',
              'Autre'
            ]}
            required
            error={errors.qualiteDestinataire}
          />
          
          <FormField
            label="Identité du destinataire"
            name="identiteDestinataire"
            value={paiement.identiteDestinataire}
            onChange={handleChange}
            placeholder="Ex: Me Jean Dupont"
            required
            error={errors.identiteDestinataire}
          />
        </FormRow>
        
        <FormField
          label="Adresse du destinataire"
          name="adresseDestinataire"
          value={paiement.adresseDestinataire}
          onChange={handleChange}
          placeholder="Ex: 1 rue de la Paix, 75001 Paris"
          error={errors.adresseDestinataire}
        />
        
        <FormField
          label="SIRET ou RIDET"
          name="siretRidet"
          value={paiement.siretRidet}
          onChange={handleChange}
          placeholder="Ex: 123 456 789 00012"
          error={errors.siretRidet}
        />
        
        <FormField
          label="Référence de la pièce justificative"
          name="referencePiece"
          value={paiement.referencePiece}
          onChange={handleChange}
          placeholder="Ex: Facture n°2023-001"
          error={errors.referencePiece}
        />
      </Section>
      
      <Section colors={colors}>
        <SectionTitle colors={colors}>Coordonnées bancaires</SectionTitle>
        
        <FormField
          label="Titulaire du compte"
          name="titulaireCompte"
          value={paiement.titulaireCompte}
          onChange={handleChange}
          placeholder="Ex: SCP DUPONT ET ASSOCIES"
          error={errors.titulaireCompte}
        />
        
        <FormRow>
          <FormField
            label="Code établissement (5 chiffres)"
            name="codeEtablissement"
            value={paiement.codeEtablissement}
            onChange={handleChange}
            placeholder="Ex: 10278"
            error={errors.codeEtablissement}
          />
          
          <FormField
            label="Code guichet (5 chiffres)"
            name="codeGuichet"
            value={paiement.codeGuichet}
            onChange={handleChange}
            placeholder="Ex: 00001"
            error={errors.codeGuichet}
          />
        </FormRow>
        
        <FormRow>
          <FormField
            label="Numéro de compte (11 caractères)"
            name="numeroCompte"
            value={paiement.numeroCompte}
            onChange={handleChange}
            placeholder="Ex: 00012345678"
            error={errors.numeroCompte}
          />
          
          <FormField
            label="Clé de vérification (2 chiffres)"
            name="cleVerification"
            value={paiement.cleVerification}
            onChange={handleChange}
            placeholder="Ex: 42"
            error={errors.cleVerification}
          />
        </FormRow>
      </Section>
      
      <ButtonGroup>
        <SubmitButton type="submit" colors={colors}>
          {isEditing ? 'Mettre à jour le paiement' : 'Ajouter le paiement'}
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

const Section = styled.section`
  margin-top: 16px;
  border-top: 1px solid ${props => props.colors.borderLight};
  padding-top: 16px;
  transition: border-color 0.3s ease;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
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

export default PaiementForm;