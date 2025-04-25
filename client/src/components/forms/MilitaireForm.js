import React, { useState, useEffect } from 'react';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import styled from 'styled-components';
import FormField from '../common/FormField';
import { parametresAPI } from '../../utils/api';

// Liste des grades
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

// Liste des régions
const regions = ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val-de-Loire', 'Corse', 'Grand Est', 'Hauts-de-France', 'Ile-de-France', 'Nouvelle-Aquitaine', 'Normandie', 'Occitanie', 'Pays-de-la-Loire', 'Provence-Alpes-Côte-d\'Azur', 'Guadeloupe', 'Guyane', 'Martinique', 'Mayotte', 'Nouvelle-Calédonie', 'Wallis-et-Futuna', 'Polynésie française', 'La Réunion', 'Saint-Pierre-et-Miquelon', 'IGAG', 'IGGN', 'DGGN', 'GR', 'GIGN', 'COMSOPGN', 'PJGN', 'CEGN', 'CGOM', 'CRJ', 'ANFSI', 'COSSEN', 'COMCYBER-MI', 'CESAN', 'SAILMI', 'GSAN', 'GTA', 'GARM', 'CFAGN', 'GMAR', 'GAIR'];

// Liste des départements
const departements = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '971', '972', '973', '974', '976', '986', '987', '988', '975', '978', 'GGM I/3', 'GGM I/5', 'GGM I/6', 'GGM I/7', 'GGM I/9', 'GGM II/1', 'GGM II/2', 'GGM II/3', 'GGM II/5', 'GGM II/6', 'GGM II/7', 'GGM III/3', 'GGM III/6', 'GGM III/7', 'GGM IV/2', 'GGM IV/3', 'GGM IV/7', 'GBGM'];

const MilitaireForm = ({ onSubmit, initialData = {}, isEditing = false, affaireId = null, affairesList = [], affaireNom = '' }) => {
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
  
  // Récupérer la liste des circonstances depuis l'API
  useEffect(() => {
    const fetchCirconstances = async () => {
      try {
        const response = await parametresAPI.getByType('circonstances');
        setCirconstances(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des circonstances", error);
      }
    };
    
    fetchCirconstances();
  }, []);

  // Récupérer la liste des rédacteurs lorsque l'option de créer un bénéficiaire est cochée
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
    
    // Validation du rédacteur si l'option de créer un bénéficiaire est cochée (supprimé, le rédacteur est entré à la création de l'affaire)
    // if (militaire.creerBeneficiaire && !militaire.redacteur) {
    //   newErrors.redacteur = 'Le rédacteur est requis pour créer un bénéficiaire';
    // }
    
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
      // Si affaireId est fourni, assurez-vous qu'il est bien inclus dans les données
      const dataToSubmit = {
        ...militaire,
        affaire: affaireId || militaire.affaire
      };
      
      onSubmit(dataToSubmit);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {/* Affichage de l'affaire en haut */}
      {affaireId ? (
        <FormRow>
          <InfoItem>
            <InfoLabel>Affaire</InfoLabel>
            <InfoValue>{affaireNom || 'Affaire actuelle'}</InfoValue>
            <input type="hidden" name="affaire" value={affaireId} />
          </InfoItem>
        </FormRow>
      ) : (
        // Sélecteur d'affaire normal
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
          options={regions}
          error={errors.region}
        />
        
        <FormField
          label="Département"
          name="departement"
          type="select"
          value={militaire.departement}
          onChange={handleChange}
          options={departements}
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

      {/* Option pour créer également comme bénéficiaire */}
      <ToggleField>
        <ToggleIcon 
          checked={militaire.creerBeneficiaire}
          onClick={() => setMilitaire(prev => ({
            ...prev,
            creerBeneficiaire: !prev.creerBeneficiaire
          }))}
        >
          {militaire.creerBeneficiaire ? <FaToggleOn /> : <FaToggleOff />}
        </ToggleIcon>
        <label onClick={() => setMilitaire(prev => ({
          ...prev,
          creerBeneficiaire: !prev.creerBeneficiaire
        }))}>
          Créer également comme bénéficiaire (seul un militaire blessé peut être bénéficiaire, en cas de décès ce sont ses ayants-droit qui le sont)
        </label>
      </ToggleField>
      
      {/* Afficher ces champs conditionnellement lorsque creerBeneficiaire est coché */}
      {militaire.creerBeneficiaire && (
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
        <SubmitButton type="submit">
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
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  
  &.itt-row {
    .checkbox-container {
      display: flex;
      align-items: center;
      margin-top: 24px; /* Ajustez cette valeur pour aligner verticalement */
    }
  }
`;

// Styles pour l'affichage de l'affaire
const InfoItem = styled.div`
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: #757575;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;
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

const ToggleField = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  
  label {
    margin-left: 10px;
    cursor: pointer;
  }
`;

const ToggleIcon = styled.span`
  font-size: 24px;
  color: ${props => props.checked ? '#3f51b5' : '#aaaaaa'};
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export default MilitaireForm;