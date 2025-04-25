import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaUserTie, FaPlus, FaTimes } from 'react-icons/fa';
import FormField from '../common/FormField';
import { militairesAPI, avocatsAPI } from '../../utils/api';

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
  const [avocats, setAvocats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvocatSelector, setShowAvocatSelector] = useState(false);
  const [filteredAvocats, setFilteredAvocats] = useState([]);
  
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
  
  // Charger les avocats depuis l'annuaire
  useEffect(() => {
    const fetchAvocats = async () => {
      try {
        const response = await avocatsAPI.getAll();
        setAvocats(response.data);
        setFilteredAvocats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des avocats", error);
      }
    };
    
    fetchAvocats();
  }, []);
  
  // Filtrer les avocats en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAvocats(avocats);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = avocats.filter(avocat => 
        `${avocat.nom} ${avocat.prenom}`.toLowerCase().includes(term) ||
        avocat.email.toLowerCase().includes(term)
      );
      setFilteredAvocats(filtered);
    }
  }, [searchTerm, avocats]);
  
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
  
  const addAvocatToSelection = (avocat) => {
    // Vérifier si l'avocat est déjà sélectionné
    if (!beneficiaire.avocats.some(a => a._id === avocat._id)) {
      setBeneficiaire(prev => ({
        ...prev,
        avocats: [...prev.avocats, avocat]
      }));
    }
    
    // Fermer le sélecteur
    setShowAvocatSelector(false);
    setSearchTerm('');
  };
  
  const removeAvocat = (avocatId) => {
    setBeneficiaire(prev => ({
      ...prev,
      avocats: prev.avocats.filter(a => a._id !== avocatId)
    }));
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
      
      <Section>
        <SectionTitle>Avocats désignés (optionnel)</SectionTitle>
        
        {beneficiaire.avocats.length > 0 ? (
          <SelectedAvocatsList>
            {beneficiaire.avocats.map((avocat) => (
              <SelectedAvocatItem key={avocat._id}>
                <AvocatInfo>
                  <FaUserTie />
                  <div>
                    <AvocatName>{avocat.nom} {avocat.prenom}</AvocatName>
                    {avocat.specialisationRPC && (
                      <SpecializationTag>RPC</SpecializationTag>
                    )}
                  </div>
                </AvocatInfo>
                <RemoveButton type="button" onClick={() => removeAvocat(avocat._id)}>
                  <FaTimes />
                </RemoveButton>
              </SelectedAvocatItem>
            ))}
          </SelectedAvocatsList>
        ) : (
          <EmptyMessage>Aucun avocat sélectionné</EmptyMessage>
        )}
        
        <AddButton type="button" onClick={() => setShowAvocatSelector(true)}>
          <FaPlus /> Ajouter un avocat
        </AddButton>
        
        {showAvocatSelector && (
          <AvocatSelector>
            <SearchBar>
              <SearchIcon><FaSearch /></SearchIcon>
              <SearchInput
                type="text"
                placeholder="Rechercher un avocat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </SearchBar>
            
            <AvocatsList>
              {filteredAvocats.length > 0 ? (
                filteredAvocats.map((avocat) => (
                  <AvocatListItem 
                    key={avocat._id}
                    onClick={() => addAvocatToSelection(avocat)}
                    selected={beneficiaire.avocats.some(a => a._id === avocat._id)}
                  >
                    <FaUserTie />
                    <div>
                      <AvocatNameRow>
                        <AvocatName>{avocat.nom} {avocat.prenom}</AvocatName>
                        {avocat.specialisationRPC && (
                          <SpecializationTag>RPC</SpecializationTag>
                        )}
                      </AvocatNameRow>
                      {avocat.email && <AvocatEmail>{avocat.email}</AvocatEmail>}
                    </div>
                  </AvocatListItem>
                ))
              ) : (
                <EmptyMessage>Aucun avocat trouvé</EmptyMessage>
              )}
            </AvocatsList>
            
            <CloseButton onClick={() => setShowAvocatSelector(false)}>
              Fermer
            </CloseButton>
          </AvocatSelector>
        )}
      </Section>
      
      <ButtonGroup>
        <SubmitButton type="submit">
          {isEditing ? 'Mettre à jour' : 'Créer le bénéficiaire'}
        </SubmitButton>
      </ButtonGroup>
    </Form>
  );
};

// Styles existants
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

// Nouveaux styles pour l'interface de sélection d'avocats
const SelectedAvocatsList = styled.div`
  margin-bottom: 16px;
`;

const SelectedAvocatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const AvocatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #3f51b5;
    font-size: 20px;
  }
`;

const AvocatName = styled.div`
  font-weight: 500;
  color: #333;
`;

const AvocatNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SpecializationTag = styled.span`
  display: inline-block;
  background-color: #ff5722;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
`;

const AvocatEmail = styled.div`
  font-size: 12px;
  color: #3f51b5;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  
  &:hover {
    opacity: 0.8;
  }
`;

const AvocatSelector = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 16px;
  padding: 16px;
  background-color: #fff;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
  }
`;

const AvocatsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const AvocatListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  background-color: ${props => props.selected ? '#e8eaf6' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.selected ? '#e8eaf6' : '#f5f5f5'};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  svg {
    color: #3f51b5;
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const EmptyMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #757575;
  font-style: italic;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
`;

export default BeneficiaireForm;