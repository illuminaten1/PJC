import React, { useState, useEffect } from 'react';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import styled from 'styled-components';
import FormField from '../common/FormField';
import { parametresAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

const grades = [
  'Général',
  'Colonel',
  'Lieutenant-colonel',
  'Chef d\'escadron',
  'Commandant',
  'Capitaine',
  'Lieutenant',
  'Sous-lieutenant',
  'Aspirant',
  'Major',
  'Adjudant-chef',
  'Adjudant',
  'Maréchal des logis-chef',
  'Gendarme',
  'Elève-Gendarme',
  'Maréchal des logis',
  'Brigadier-chef',
  'Brigadier',
  'Gendarme adjoint volontaire',
  'Autre'
];

const MilitaireForm = ({ onSubmit, initialData = {}, isEditing = false, affaireId = null, affairesList = [], affaireNom = '' }) => {
  const { colors } = useTheme();
  
  const [militaire, setMilitaire] = useState({
    grade: initialData.grade || '',
    prenom: initialData.prenom || '',
    nom: initialData.nom || '',
    unite: initialData.unite || '',
    region: initialData.region || '',
    departement: initialData.departement || '',
    affaire: initialData.affaire || affaireId || '',
    circonstance: initialData.circonstance || '',
    natureDesBlessures: initialData.natureDesBlessures || '',
    itt: initialData.itt || 0,
    decede: initialData.decede || false,
    creerBeneficiaire: initialData.creerBeneficiaire || false,
    redacteur: initialData.redacteur || '',
    numeroDecisionBeneficiaire: initialData.numeroDecisionBeneficiaire || '',
    dateDecisionBeneficiaire: initialData.dateDecisionBeneficiaire || ''
  });
  
  const [errors, setErrors] = useState({});
  const [circonstances, setCirconstances] = useState([]);
  const [redacteurs, setRedacteurs] = useState([]);
  const [regions, setRegions] = useState([]);
  const [departements, setDepartements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCirconstances = await parametresAPI.getByType('circonstances');
        setCirconstances(responseCirconstances.data);
        
        const responseRegions = await parametresAPI.getByType('regions');
        if (responseRegions.data && responseRegions.data.length > 0) {
          setRegions(responseRegions.data);
        }
        
        const responseDepartements = await parametresAPI.getByType('departements');
        if (responseDepartements.data && responseDepartements.data.length > 0) {
          setDepartements(responseDepartements.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };
    
    fetchData();
  }, []);

  const regionsHardcoded = ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val-de-Loire', 'Corse', 'Grand Est', 'Hauts-de-France', 'Ile-de-France', 'Nouvelle-Aquitaine', 'Normandie', 'Occitanie', 'Pays-de-la-Loire', 'Provence-Alpes-Côte-d\'Azur', 'Guadeloupe', 'Guyane', 'Martinique', 'Mayotte', 'Nouvelle-Calédonie', 'Wallis-et-Futuna', 'Polynésie française', 'La Réunion', 'Saint-Pierre-et-Miquelon', 'IGAG', 'IGGN', 'DGGN', 'GR', 'GIGN', 'COMSOPGN', 'PJGN', 'CEGN', 'CGOM', 'CRJ', 'ANFSI', 'COSSEN', 'COMCYBER-MI', 'CESAN', 'SAILMI', 'GSAN', 'GTA', 'GARM', 'CFAGN', 'GMAR', 'GAIR'];
  
  const departementsHardcoded = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '971', '972', '973', '974', '976', '986', '987', '988', '975', '978', 'GGM I/3', 'GGM I/5', 'GGM I/6', 'GGM I/7', 'GGM I/9', 'GGM II/1', 'GGM II/2', 'GGM II/3', 'GGM II/5', 'GGM II/6', 'GGM II/7', 'GGM III/3', 'GGM III/6', 'GGM III/7', 'GGM IV/2', 'GGM IV/3', 'GGM IV/7', 'GBGM'];

  useEffect(() => {
    if (militaire.creerBeneficiaire) {
      const fetchRedacteurs = async () => {
        try {
          const response = await parametresAPI.getByType('redacteurs');
          setRedacteurs(response.data);
        } catch (error) {
          console.error("Erreur lors de la récupération des rédacteurs", error);
        }
      };
      
      fetchRedacteurs();
    }
  }, [militaire.creerBeneficiaire]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!militaire.grade.trim()) {
      newErrors.grade = 'Le grade est requis';
    }
    
    if (!militaire.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    
    if (!militaire.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    
    if (!militaire.unite.trim()) {
      newErrors.unite = 'L\'unité d\'affectation est requise';
    }
    
    if (!militaire.circonstance.trim()) {
      newErrors.circonstance = 'La circonstance est requise';
    }
    
    if (militaire.itt && (isNaN(militaire.itt) || militaire.itt < 0)) {
      newErrors.itt = 'Le nombre de jours d\'ITT doit être un nombre positif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setMilitaire(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'itt' ? (value === '' ? '' : parseInt(value) || 0) : 
              name === 'nom' ? value.toUpperCase() :
              value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = {
        ...militaire,
        affaire: affaireId || militaire.affaire
      };
      
      onSubmit(dataToSubmit);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit} colors={colors}>
      {affaireId ? (
        <FormRow>
          <InfoItem colors={colors}>
            <InfoLabel colors={colors}>Affaire</InfoLabel>
            <InfoValue colors={colors}>{affaireNom || 'Affaire actuelle'}</InfoValue>
            <input type="hidden" name="affaire" value={affaireId} />
          </InfoItem>
        </FormRow>
      ) : (
        <FormField
          label="Affaire"
          name="affaire"
          type="select"
          value={militaire.affaire}
          onChange={handleChange}
          options={affairesList.map(a => ({ value: a._id, label: a.nom }))}
          required
          error={errors.affaire}
        />
      )}
      
      <FormRow>
        <FormField
          label="Grade"
          name="grade"
          type="select"
          value={militaire.grade}
          onChange={handleChange}
          options={grades}
          required
          error={errors.grade}
        />
        
        <FormField
          label="Prénom"
          name="prenom"
          value={militaire.prenom}
          onChange={handleChange}
          placeholder="Prénom du militaire"
          required
          error={errors.prenom}
        />
        
        <FormField
          label="Nom"
          name="nom"
          value={militaire.nom}
          onChange={handleChange}
          placeholder="Nom du militaire"
          required
          error={errors.nom}
        />
      </FormRow>
      
      <FormRow>
        <FormField
          label="Unité d'affectation"
          name="unite"
          value={militaire.unite}
          onChange={handleChange}
          placeholder="Ex: COB LIMOUX"
          required
          error={errors.unite}
        />
        
        <FormField
          label="Région"
          name="region"
          type="select"
          value={militaire.region}
          onChange={handleChange}
          options={regions.length > 0 ? regions : regionsHardcoded}
          error={errors.region}
        />
        
        <FormField
          label="Département"
          name="departement"
          type="select"
          value={militaire.departement}
          onChange={handleChange}
          options={departements.length > 0 ? departements : departementsHardcoded}
          error={errors.departement}
        />
      </FormRow>
      
      <FormField
        label="Circonstance"
        name="circonstance"
        type="select"
        value={militaire.circonstance}
        onChange={handleChange}
        options={circonstances}
        required
        error={errors.circonstance}
      />
      
      <FormField
        label="Nature des blessures"
        name="natureDesBlessures"
        type="textarea"
        value={militaire.natureDesBlessures}
        onChange={handleChange}
        placeholder="Description détaillée des blessures..."
      />
      
      <FormRow className="itt-row">
        <FormField
          label="Nombre de jours d'ITT"
          name="itt"
          type="number"
          value={militaire.itt}
          onChange={handleChange}
          placeholder="0"
          error={errors.itt}
        />
        
        <FormField
          label="Décédé"
          name="decede"
          type="select"
          value={militaire.decede.toString()}
          onChange={(e) => {
            const newValue = e.target.value === "true";
            setMilitaire(prev => ({
              ...prev,
              decede: newValue
            }));
          }}
          options={[
            { value: "false", label: "NON" },
            { value: "true", label: "OUI" }
          ]}
        />
      </FormRow>

      {!isEditing && (
        <ToggleField colors={colors}>
          <ToggleIcon 
            checked={militaire.creerBeneficiaire}
            onClick={() => setMilitaire(prev => ({
              ...prev,
              creerBeneficiaire: !prev.creerBeneficiaire
            }))}
            colors={colors}
          >
            {militaire.creerBeneficiaire ? <FaToggleOn /> : <FaToggleOff />}
          </ToggleIcon>
          <ToggleLabel 
            onClick={() => setMilitaire(prev => ({
              ...prev,
              creerBeneficiaire: !prev.creerBeneficiaire
            }))}
            colors={colors}
          >
            Créer également comme bénéficiaire (seul un militaire blessé peut être bénéficiaire, en cas de décès ce sont ses ayants-droit qui le sont)
          </ToggleLabel>
        </ToggleField>
      )}

      {militaire.creerBeneficiaire && !isEditing && (
        <FormRow>
          <FormField
            label="Numéro de décision du bénéficiaire"
            name="numeroDecisionBeneficiaire"
            value={militaire.numeroDecisionBeneficiaire}
            onChange={handleChange}
            placeholder="Numéro de la décision d'attribution"
          />
          
          <FormField
            label="Date de la décision"
            name="dateDecisionBeneficiaire"
            type="date"
            value={militaire.dateDecisionBeneficiaire || ''}
            onChange={handleChange}
          />
        </FormRow>
      )}

      <ButtonGroup>
        <SubmitButton type="submit" colors={colors}>
          {isEditing ? 'Mettre à jour' : 'Créer le militaire'}
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
  
  &.itt-row {
    .checkbox-container {
      display: flex;
      align-items: center;
      margin-top: 24px;
    }
  }
`;

const InfoItem = styled.div`
  padding: 12px;
  background-color: ${props => props.colors.background};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 4px;
  transition: color 0.3s ease;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 500;
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

const ToggleField = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 12px;
  background-color: ${props => props.colors.background};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const ToggleIcon = styled.span`
  font-size: 24px;
  color: ${props => props.checked ? props.colors.primary : props.colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
`;

const ToggleLabel = styled.label`
  margin-left: 10px;
  cursor: pointer;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

export default MilitaireForm;