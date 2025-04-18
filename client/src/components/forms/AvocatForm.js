import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { avocatsAPI } from '../../utils/api';
import { FaPlus, FaTimes } from 'react-icons/fa';

const AvocatForm = ({ onSubmit, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialisationRPC: false,
    cabinet: '',
    region: '',
    villesIntervention: [],
    adresse: {
      numero: '',
      rue: '',
      codePostal: '',
      ville: ''
    },
    telephonePublic1: '',
    telephonePublic2: '',
    telephonePrive: '',
    siretRidet: '',
    commentaires: ''
  });
  
  const [nouvelleVille, setNouvelleVille] = useState('');
  const [errors, setErrors] = useState({});
  const [cabinetsSuggestions, setCabinetsSuggestions] = useState([]);
  const [villesSuggestions, setVillesSuggestions] = useState([]);
  const [showCabinetsSuggestions, setShowCabinetsSuggestions] = useState(false);
  const [showVillesSuggestions, setShowVillesSuggestions] = useState(false);

  // Liste des régions de France y compris les Outre-mers
  const regions = [
    'Auvergne-Rhône-Alpes',
    'Bourgogne-Franche-Comté',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Hauts-de-France',
    'Île-de-France',
    'Normandie',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Pays de la Loire',
    'Provence-Alpes-Côte d\'Azur',
    'Guadeloupe',
    'Guyane',
    'Martinique',
    'Mayotte',
    'La Réunion',
    'Nouvelle-Calédonie',
    'Polynésie française',
    'Saint-Barthélemy',
    'Saint-Martin',
    'Saint-Pierre-et-Miquelon',
    'Wallis-et-Futuna'
  ];
  
  useEffect(() => {
    // Charger les cabinets existants
    const fetchCabinets = async () => {
      try {
        const response = await avocatsAPI.getCabinets();
        setCabinetsSuggestions(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des cabinets", err);
      }
    };
    
    // Charger les villes d'intervention existantes
    const fetchVilles = async () => {
      try {
        const response = await avocatsAPI.getVilles();
        setVillesSuggestions(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des villes", err);
      }
    };
    
    fetchCabinets();
    fetchVilles();
  }, []);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        email: initialData.email || '',
        specialisationRPC: initialData.specialisationRPC || false,
        cabinet: initialData.cabinet || '',
        region: initialData.region || '',
        villesIntervention: initialData.villesIntervention || [],
        adresse: {
          numero: initialData.adresse?.numero || '',
          rue: initialData.adresse?.rue || '',
          codePostal: initialData.adresse?.codePostal || '',
          ville: initialData.adresse?.ville || ''
        },
        telephonePublic1: initialData.telephonePublic1 || '',
        telephonePublic2: initialData.telephonePublic2 || '',
        telephonePrive: initialData.telephonePrive || '',
        siretRidet: initialData.siretRidet || '',
        commentaires: initialData.commentaires || ''
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
    
    // Validation téléphone si présent (format français)
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    
    if (formData.telephonePublic1 && !phoneRegex.test(formData.telephonePublic1)) {
      newErrors.telephonePublic1 = 'Format de téléphone invalide';
    }
    
    if (formData.telephonePublic2 && !phoneRegex.test(formData.telephonePublic2)) {
      newErrors.telephonePublic2 = 'Format de téléphone invalide';
    }
    
    if (formData.telephonePrive && !phoneRegex.test(formData.telephonePrive)) {
      newErrors.telephonePrive = 'Format de téléphone invalide';
    }
    
    // Validation SIRET/RIDET si présent
    if (formData.siretRidet && !/^[0-9]{9,14}$/.test(formData.siretRidet.replace(/\s/g, ''))) {
      newErrors.siretRidet = 'Format de SIRET/RIDET invalide (9 à 14 chiffres)';
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
    }
    // Si le champ est dans l'objet adresse
    else if (name.startsWith('adresse.')) {
      const adresseField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        adresse: {
          ...prev.adresse,
          [adresseField]: value
        }
      }));
    }
    // Pour le cabinet, afficher les suggestions
    else if (name === 'cabinet') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      setShowCabinetsSuggestions(true);
    }
    // Pour les autres champs
    else {
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
  
  const handleCabinetSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      cabinet: suggestion
    }));
    setShowCabinetsSuggestions(false);
  };
  
  const handleNouvelleVilleChange = (e) => {
    setNouvelleVille(e.target.value);
    setShowVillesSuggestions(true);
  };
  
  const addVille = () => {
    if (nouvelleVille.trim() !== '' && !formData.villesIntervention.includes(nouvelleVille.trim())) {
      setFormData(prev => ({
        ...prev,
        villesIntervention: [...prev.villesIntervention, nouvelleVille.trim()]
      }));
      setNouvelleVille('');
    }
  };
  
  const removeVille = (index) => {
    setFormData(prev => ({
      ...prev,
      villesIntervention: prev.villesIntervention.filter((_, i) => i !== index)
    }));
  };
  
  const handleVilleSuggestionClick = (suggestion) => {
    setNouvelleVille(suggestion);
    setShowVillesSuggestions(false);
  };
  
  const getFilteredCabinetsSuggestions = () => {
    if (!formData.cabinet) return [];
    return cabinetsSuggestions.filter(cabinet => 
      cabinet.toLowerCase().includes(formData.cabinet.toLowerCase())
    );
  };
  
  const getFilteredVillesSuggestions = () => {
    if (!nouvelleVille) return [];
    return villesSuggestions.filter(ville => 
      ville.toLowerCase().includes(nouvelleVille.toLowerCase()) &&
      !formData.villesIntervention.includes(ville)
    );
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <FormSection>
        <SectionTitle>Identité</SectionTitle>
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
        
        <FormGroup>
          <Label htmlFor="cabinet">Cabinet</Label>
          <div style={{ position: 'relative' }}>
            <Input
              type="text"
              id="cabinet"
              name="cabinet"
              value={formData.cabinet}
              onChange={handleChange}
              onFocus={() => setShowCabinetsSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCabinetsSuggestions(false), 200)}
            />
            {showCabinetsSuggestions && getFilteredCabinetsSuggestions().length > 0 && (
              <SuggestionList>
                {getFilteredCabinetsSuggestions().map((suggestion, index) => (
                  <SuggestionItem 
                    key={index} 
                    onClick={() => handleCabinetSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </SuggestionItem>
                ))}
              </SuggestionList>
            )}
          </div>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="region">Région</Label>
          <Select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
          >
            <option value="">Sélectionnez une région</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="siretRidet">SIRET/RIDET</Label>
          <Input
            type="text"
            id="siretRidet"
            name="siretRidet"
            value={formData.siretRidet}
            onChange={handleChange}
            error={!!errors.siretRidet}
            placeholder="Ex: 123 456 789 00012"
          />
          {errors.siretRidet && <ErrorText>{errors.siretRidet}</ErrorText>}
        </FormGroup>
      </FormSection>
      
      <FormSection>
        <SectionTitle>Villes d'intervention</SectionTitle>
        <FormRow>
          <FormGroup flex={3}>
            <Label htmlFor="nouvelleVille">Ajouter une ville d'intervention</Label>
            <div style={{ position: 'relative' }}>
              <Input
                type="text"
                id="nouvelleVille"
                value={nouvelleVille}
                onChange={handleNouvelleVilleChange}
                onFocus={() => setShowVillesSuggestions(true)}
                onBlur={() => setTimeout(() => setShowVillesSuggestions(false), 200)}
                placeholder="Saisissez le nom d'une ville"
              />
              {showVillesSuggestions && getFilteredVillesSuggestions().length > 0 && (
                <SuggestionList>
                  {getFilteredVillesSuggestions().map((suggestion, index) => (
                    <SuggestionItem 
                      key={index} 
                      onClick={() => handleVilleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </div>
          </FormGroup>
          <FormGroup flex={1} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <AddButton type="button" onClick={addVille}>
              <FaPlus />
              <span>Ajouter</span>
            </AddButton>
          </FormGroup>
        </FormRow>
        
        <VillesContainer>
          {formData.villesIntervention.map((ville, index) => (
            <VilleTag key={index}>
              {ville}
              <RemoveButton type="button" onClick={() => removeVille(index)}>
                <FaTimes />
              </RemoveButton>
            </VilleTag>
          ))}
          {formData.villesIntervention.length === 0 && (
            <EmptyVilles>Aucune ville d'intervention ajoutée</EmptyVilles>
          )}
        </VillesContainer>
      </FormSection>
      
      <FormSection>
        <SectionTitle>Adresse</SectionTitle>
        <FormRow>
          <FormGroup flex={1}>
            <Label htmlFor="adresse.numero">N°</Label>
            <Input
              type="text"
              id="adresse.numero"
              name="adresse.numero"
              value={formData.adresse.numero}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup flex={3}>
            <Label htmlFor="adresse.rue">Rue</Label>
            <Input
              type="text"
              id="adresse.rue"
              name="adresse.rue"
              value={formData.adresse.rue}
              onChange={handleChange}
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="adresse.codePostal">Code postal</Label>
            <Input
              type="text"
              id="adresse.codePostal"
              name="adresse.codePostal"
              value={formData.adresse.codePostal}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="adresse.ville">Ville</Label>
            <Input
              type="text"
              id="adresse.ville"
              name="adresse.ville"
              value={formData.adresse.ville}
              onChange={handleChange}
            />
          </FormGroup>
        </FormRow>
      </FormSection>
      
      <FormSection>
        <SectionTitle>Contacts</SectionTitle>
        <FormRow>
          <FormGroup>
            <Label htmlFor="telephonePublic1">Téléphone public 1</Label>
            <Input
              type="tel"
              id="telephonePublic1"
              name="telephonePublic1"
              value={formData.telephonePublic1}
              onChange={handleChange}
              error={!!errors.telephonePublic1}
              placeholder="Ex: 06 12 34 56 78"
            />
            {errors.telephonePublic1 && <ErrorText>{errors.telephonePublic1}</ErrorText>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="telephonePublic2">Téléphone public 2</Label>
            <Input
              type="tel"
              id="telephonePublic2"
              name="telephonePublic2"
              value={formData.telephonePublic2}
              onChange={handleChange}
              error={!!errors.telephonePublic2}
              placeholder="Ex: 01 23 45 67 89"
            />
            {errors.telephonePublic2 && <ErrorText>{errors.telephonePublic2}</ErrorText>}
          </FormGroup>
        </FormRow>
        
        <FormGroup>
          <Label htmlFor="telephonePrive">
            Téléphone privé
            <PrivateNote> (non communiqué aux aux bénéficiaires)</PrivateNote>
          </Label>
          <Input
            type="tel"
            id="telephonePrive"
            name="telephonePrive"
            value={formData.telephonePrive}
            onChange={handleChange}
            error={!!errors.telephonePrive}
            placeholder="Ex: 07 98 76 54 32"
          />
          {errors.telephonePrive && <ErrorText>{errors.telephonePrive}</ErrorText>}
        </FormGroup>
      </FormSection>
      
      <FormSection>
        <SectionTitle>Spécialisation et commentaires</SectionTitle>
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
        
        <FormGroup>
          <Label htmlFor="commentaires">Commentaires</Label>
          <Textarea
            id="commentaires"
            name="commentaires"
            value={formData.commentaires}
            onChange={handleChange}
            rows={4}
            placeholder="Informations complémentaires sur l'avocat..."
          />
        </FormGroup>
      </FormSection>
      
      <FloatingSubmitButton type="submit">
      {isEditing ? 'Mettre à jour' : 'Ajouter'} l'avocat
    </FloatingSubmitButton>
  </Form>
  );
};

// Styles

const FormSection = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
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
  flex: ${props => props.flex || 1};
  
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

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.error ? '#f44336' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#f44336' : '#3f51b5'};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.error ? '#f44336' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  
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

const PrivateNote = styled.span`
  font-size: 12px;
  color: #757575;
  font-style: italic;
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

const AddButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #388e3c;
  }
`;

const VillesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  min-height: 40px;
`;

const VilleTag = styled.div`
  display: flex;
  align-items: center;
  background-color: #e3f2fd;
  border-radius: 16px;
  padding: 5px 10px;
  font-size: 14px;
  color: #1976d2;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 5px;
  padding: 0;
  font-size: 12px;
  
  &:hover {
    color: #f44336;
  }
`;

const EmptyVilles = styled.div`
  color: #9e9e9e;
  font-style: italic;
  font-size: 14px;
`;

const SuggestionList = styled.ul`
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background-color: white;
  z-index: 10;
  margin: 0;
  padding: 0;
  list-style: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Form = styled.form`
  padding: 20px;
  position: relative;
  padding-bottom: 60px; // Espace pour le bouton flottant
`;

const FloatingSubmitButton = styled.button`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  
  &:hover {
    background-color: #303f9f;
  }
`;

export default AvocatForm;