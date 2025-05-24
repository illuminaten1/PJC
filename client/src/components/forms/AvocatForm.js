import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { avocatsAPI } from '../../utils/api';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const AvocatForm = ({ onSubmit, initialData, isEditing }) => {
  const { colors } = useTheme();
  
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
    const fetchCabinets = async () => {
      try {
        const response = await avocatsAPI.getCabinets();
        setCabinetsSuggestions(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des cabinets", err);
      }
    };
    
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
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
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
    
    if (formData.siretRidet && !/^[0-9]{9,14}$/.test(formData.siretRidet.replace(/\s/g, ''))) {
      newErrors.siretRidet = 'Format de SIRET/RIDET invalide (9 à 14 chiffres)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'nom') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else if (name.startsWith('adresse.')) {
      const adresseField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        adresse: {
          ...prev.adresse,
          [adresseField]: value
        }
      }));
    } else if (name === 'cabinet') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      setShowCabinetsSuggestions(true);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
      <FormSection $colors={colors}>
        <SectionTitle $colors={colors}>Identité</SectionTitle>
        <FormRow>
          <FormGroup>
            <Label htmlFor="nom" $colors={colors}>NOM <Required $colors={colors}>*</Required></Label>
            <Input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              $error={!!errors.nom}
              $colors={colors}
            />
            {errors.nom && <ErrorText $colors={colors}>{errors.nom}</ErrorText>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="prenom" $colors={colors}>Prénom <Required $colors={colors}>*</Required></Label>
            <Input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              $error={!!errors.prenom}
              $colors={colors}
            />
            {errors.prenom && <ErrorText $colors={colors}>{errors.prenom}</ErrorText>}
          </FormGroup>
        </FormRow>
        
        <FormGroup>
          <Label htmlFor="email" $colors={colors}>Email <Required $colors={colors}>*</Required></Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            $error={!!errors.email}
            $colors={colors}
          />
          {errors.email && <ErrorText $colors={colors}>{errors.email}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="cabinet" $colors={colors}>Cabinet</Label>
          <div style={{ position: 'relative' }}>
            <Input
              type="text"
              id="cabinet"
              name="cabinet"
              value={formData.cabinet}
              onChange={handleChange}
              onFocus={() => setShowCabinetsSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCabinetsSuggestions(false), 200)}
              $colors={colors}
            />
            {showCabinetsSuggestions && getFilteredCabinetsSuggestions().length > 0 && (
              <SuggestionList $colors={colors}>
                {getFilteredCabinetsSuggestions().map((suggestion, index) => (
                  <SuggestionItem 
                    key={index} 
                    onClick={() => handleCabinetSuggestionClick(suggestion)}
                    $colors={colors}
                  >
                    {suggestion}
                  </SuggestionItem>
                ))}
              </SuggestionList>
            )}
          </div>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="region" $colors={colors}>Région</Label>
          <Select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            $colors={colors}
          >
            <option value="">Sélectionnez une région</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="siretRidet" $colors={colors}>SIRET/RIDET</Label>
          <Input
            type="text"
            id="siretRidet"
            name="siretRidet"
            value={formData.siretRidet}
            onChange={handleChange}
            $error={!!errors.siretRidet}
            placeholder="Ex: 123 456 789 00012"
            $colors={colors}
          />
          {errors.siretRidet && <ErrorText $colors={colors}>{errors.siretRidet}</ErrorText>}
        </FormGroup>
      </FormSection>
      
      <FormSection $colors={colors}>
        <SectionTitle $colors={colors}>Villes d'intervention</SectionTitle>
        <FormRow>
          <FormGroup $flex={3}>
            <Label htmlFor="nouvelleVille" $colors={colors}>Ajouter une ville d'intervention</Label>
            <div style={{ position: 'relative' }}>
              <Input
                type="text"
                id="nouvelleVille"
                value={nouvelleVille}
                onChange={handleNouvelleVilleChange}
                onFocus={() => setShowVillesSuggestions(true)}
                onBlur={() => setTimeout(() => setShowVillesSuggestions(false), 200)}
                placeholder="Saisissez le nom d'une ville"
                $colors={colors}
              />
              {showVillesSuggestions && getFilteredVillesSuggestions().length > 0 && (
                <SuggestionList $colors={colors}>
                  {getFilteredVillesSuggestions().map((suggestion, index) => (
                    <SuggestionItem 
                      key={index} 
                      onClick={() => handleVilleSuggestionClick(suggestion)}
                      $colors={colors}
                    >
                      {suggestion}
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </div>
          </FormGroup>
          <FormGroup $flex={1} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <AddButton type="button" onClick={addVille} $colors={colors}>
              <FaPlus />
              <span>Ajouter</span>
            </AddButton>
          </FormGroup>
        </FormRow>
        
        <VillesContainer $colors={colors}>
          {formData.villesIntervention.map((ville, index) => (
            <VilleTag key={index} $colors={colors}>
              {ville}
              <RemoveButton type="button" onClick={() => removeVille(index)} $colors={colors}>
                <FaTimes />
              </RemoveButton>
            </VilleTag>
          ))}
          {formData.villesIntervention.length === 0 && (
            <EmptyVilles $colors={colors}>Aucune ville d'intervention ajoutée</EmptyVilles>
          )}
        </VillesContainer>
      </FormSection>
      
      <FormSection $colors={colors}>
        <SectionTitle $colors={colors}>Adresse</SectionTitle>
        <FormRow>
          <FormGroup $flex={1}>
            <Label htmlFor="adresse.numero" $colors={colors}>N°</Label>
            <Input
              type="text"
              id="adresse.numero"
              name="adresse.numero"
              value={formData.adresse.numero}
              onChange={handleChange}
              $colors={colors}
            />
          </FormGroup>
          
          <FormGroup $flex={3}>
            <Label htmlFor="adresse.rue" $colors={colors}>Rue</Label>
            <Input
              type="text"
              id="adresse.rue"
              name="adresse.rue"
              value={formData.adresse.rue}
              onChange={handleChange}
              $colors={colors}
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="adresse.codePostal" $colors={colors}>Code postal</Label>
            <Input
              type="text"
              id="adresse.codePostal"
              name="adresse.codePostal"
              value={formData.adresse.codePostal}
              onChange={handleChange}
              $colors={colors}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="adresse.ville" $colors={colors}>Ville</Label>
            <Input
              type="text"
              id="adresse.ville"
              name="adresse.ville"
              value={formData.adresse.ville}
              onChange={handleChange}
              $colors={colors}
            />
          </FormGroup>
        </FormRow>
      </FormSection>
      
      <FormSection $colors={colors}>
        <SectionTitle $colors={colors}>Contacts</SectionTitle>
        <FormRow>
          <FormGroup>
            <Label htmlFor="telephonePublic1" $colors={colors}>Téléphone public 1</Label>
            <Input
              type="tel"
              id="telephonePublic1"
              name="telephonePublic1"
              value={formData.telephonePublic1}
              onChange={handleChange}
              $error={!!errors.telephonePublic1}
              placeholder="Ex: 06 12 34 56 78"
              $colors={colors}
            />
            {errors.telephonePublic1 && <ErrorText $colors={colors}>{errors.telephonePublic1}</ErrorText>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="telephonePublic2" $colors={colors}>Téléphone public 2</Label>
            <Input
              type="tel"
              id="telephonePublic2"
              name="telephonePublic2"
              value={formData.telephonePublic2}
              onChange={handleChange}
              $error={!!errors.telephonePublic2}
              placeholder="Ex: 01 23 45 67 89"
              $colors={colors}
            />
            {errors.telephonePublic2 && <ErrorText $colors={colors}>{errors.telephonePublic2}</ErrorText>}
          </FormGroup>
        </FormRow>
        
        <FormGroup>
          <Label htmlFor="telephonePrive" $colors={colors}>
            Téléphone privé
            <PrivateNote $colors={colors}> (non communiqué aux bénéficiaires)</PrivateNote>
          </Label>
          <Input
            type="tel"
            id="telephonePrive"
            name="telephonePrive"
            value={formData.telephonePrive}
            onChange={handleChange}
            $error={!!errors.telephonePrive}
            placeholder="Ex: 07 98 76 54 32"
            $colors={colors}
          />
          {errors.telephonePrive && <ErrorText $colors={colors}>{errors.telephonePrive}</ErrorText>}
        </FormGroup>
      </FormSection>
      
      <FormSection $colors={colors}>
        <SectionTitle $colors={colors}>Spécialisation et commentaires</SectionTitle>
        <FormGroup $inline>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id="specialisationRPC"
              name="specialisationRPC"
              checked={formData.specialisationRPC}
              onChange={handleChange}
            />
            <Label htmlFor="specialisationRPC" $inline $colors={colors}>
              Spécialisé en réparation du préjudice corporel (RPC)
            </Label>
          </CheckboxContainer>
          <SpecializationInfo $colors={colors}>
            Cette spécialisation sera affichée sous forme de badge.
          </SpecializationInfo>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="commentaires" $colors={colors}>Commentaires</Label>
          <Textarea
            id="commentaires"
            name="commentaires"
            value={formData.commentaires}
            onChange={handleChange}
            rows={4}
            placeholder="Informations complémentaires sur l'avocat..."
            $colors={colors}
          />
        </FormGroup>
      </FormSection>
      
      <FloatingSubmitButton type="submit" $colors={colors}>
        {isEditing ? 'Mettre à jour' : 'Ajouter'} l'avocat
      </FloatingSubmitButton>
    </Form>
  );
};

// Styles thématisés avec props transients ($colors)
const FormSection = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background-color: ${props => props.$colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.$colors.shadow};
  border: 1px solid ${props => props.$colors.border};
  transition: all 0.3s ease;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: ${props => props.$colors.textPrimary};
  border-bottom: 1px solid ${props => props.$colors.borderLight};
  padding-bottom: 8px;
  transition: color 0.3s ease;
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
  flex: ${props => props.$flex || 1};
  
  ${props => props.$inline && `
    display: flex;
    flex-direction: column;
  `}
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${props => props.$colors.textPrimary};
  transition: color 0.3s ease;
  
  ${props => props.$inline && `
    margin-bottom: 0;
    margin-left: 8px;
  `}
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.$error ? props.$colors.error : props.$colors.border};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.$colors.surface};
  color: ${props => props.$colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? props.$colors.error : props.$colors.primary};
    box-shadow: 0 0 0 1px ${props => props.$error ? props.$colors.error : props.$colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.$colors.textMuted};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.$error ? props.$colors.error : props.$colors.border};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.$colors.surface};
  color: ${props => props.$colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? props.$colors.error : props.$colors.primary};
    box-shadow: 0 0 0 1px ${props => props.$error ? props.$colors.error : props.$colors.primary};
  }
  
  option {
    background-color: ${props => props.$colors.surface};
    color: ${props => props.$colors.textPrimary};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.$error ? props.$colors.error : props.$colors.border};
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  background-color: ${props => props.$colors.surface};
  color: ${props => props.$colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? props.$colors.error : props.$colors.primary};
    box-shadow: 0 0 0 1px ${props => props.$error ? props.$colors.error : props.$colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.$colors.textMuted};
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
  color: ${props => props.$colors.textMuted};
  margin-top: 4px;
  margin-left: 24px;
  transition: color 0.3s ease;
`;

const Required = styled.span`
  color: ${props => props.$colors.error};
`;

const PrivateNote = styled.span`
  font-size: 12px;
  color: ${props => props.$colors.textMuted};
  font-style: italic;
  transition: color 0.3s ease;
`;

const ErrorText = styled.div`
  color: ${props => props.$colors.error};
  font-size: 12px;
  margin-top: 4px;
  transition: color 0.3s ease;
`;

const AddButton = styled.button`
  background-color: ${props => props.$colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$colors.success};
    filter: brightness(0.9);
    transform: translateY(-1px);
    box-shadow: ${props => props.$colors.shadowHover};
  }
`;

const VillesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  min-height: 40px;
  padding: 10px;
  background-color: ${props => props.$colors.background};
  border-radius: 4px;
  border: 1px solid ${props => props.$colors.borderLight};
  transition: all 0.3s ease;
`;

const VilleTag = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.$colors.primary}20;
  border: 1px solid ${props => props.$colors.primary}40;
  border-radius: 16px;
  padding: 5px 10px;
  font-size: 14px;
  color: ${props => props.$colors.primary};
  transition: all 0.3s ease;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 5px;
  padding: 0;
  font-size: 12px;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => props.$colors.error};
  }
`;

const EmptyVilles = styled.div`
  color: ${props => props.$colors.textMuted};
  font-style: italic;
  font-size: 14px;
  transition: color 0.3s ease;
`;

const SuggestionList = styled.ul`
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${props => props.$colors.border};
  border-top: none;
  border-radius: 0 0 4px 4px;
  background-color: ${props => props.$colors.surface};
  z-index: 10;
  margin: 0;
  padding: 0;
  list-style: none;
  box-shadow: ${props => props.$colors.shadow};
  transition: all 0.3s ease;
`;

const SuggestionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  color: ${props => props.$colors.textPrimary};
  border-bottom: 1px solid ${props => props.$colors.borderLight};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$colors.surfaceHover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Form = styled.form`
  padding: 20px;
  position: relative;
  padding-bottom: 60px;
  background-color: ${props => props.theme?.colors?.background || '#f5f5f5'};
  transition: background-color 0.3s ease;
`;

const FloatingSubmitButton = styled.button`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.$colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  z-index: 10;
  box-shadow: ${props => props.$colors.shadowHover};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$colors.primaryDark};
    transform: translateY(-1px);
  }
`;

export default AvocatForm;