import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { affairesAPI, parametresAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import AffaireForm from '../components/forms/AffaireForm';

// Composant pour afficher les compteurs d'affaires
const AffairesCounter = ({ total, actives, archived }) => {
  return (
    <CounterContainer>
      <CounterItem>
        <CounterValue>{total}</CounterValue>
        <CounterLabel>Total</CounterLabel>
      </CounterItem>
      <CounterDivider />
      <CounterItem>
        <CounterValue>{actives}</CounterValue>
        <CounterLabel>Actives</CounterLabel>
      </CounterItem>
      <CounterDivider />
      <CounterItem>
        <CounterValue>{archived}</CounterValue>
        <CounterLabel>Archivées</CounterLabel>
      </CounterItem>
    </CounterContainer>
  );
};

const Affaires = () => {
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterArchived, setFilterArchived] = useState('false');
  const [filterRedacteur, setFilterRedacteur] = useState('');
  const [redacteurs, setRedacteurs] = useState([]);
  
  // Nouveaux états pour les compteurs
  const [totalAffaires, setTotalAffaires] = useState(0);
  const [activesAffaires, setActivesAffaires] = useState(0);
  const [archivedAffaires, setArchivedAffaires] = useState(0);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchAffaires();
    fetchRedacteurs();
  }, [searchTerm, filterYear, filterArchived, filterRedacteur]);
  
  const fetchAffaires = async () => {
    setLoading(true);
    try {
      // Préparer les paramètres pour la requête filtrée
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterYear) params.year = filterYear;
      if (filterArchived !== '') params.archived = filterArchived;
      if (filterRedacteur) params.redacteur = filterRedacteur;
      
      // Récupérer les affaires filtrées
      const response = await affairesAPI.getAll(params);
      setAffaires(response.data);
      
      // Si aucun filtre n'est appliqué, utilisez directement cette réponse pour les compteurs
      if (!searchTerm && !filterYear && filterArchived === '' && !filterRedacteur) {
        const allAffaires = response.data;
        setTotalAffaires(allAffaires.length);
        setActivesAffaires(allAffaires.filter(a => !a.archive).length);
        setArchivedAffaires(allAffaires.filter(a => a.archive).length);
      } else {
        // Sinon, faites une requête supplémentaire pour les statistiques globales
        const statsResponse = await affairesAPI.getAll({});
        const allAffaires = statsResponse.data;
        setTotalAffaires(allAffaires.length);
        setActivesAffaires(allAffaires.filter(a => !a.archive).length);
        setArchivedAffaires(allAffaires.filter(a => a.archive).length);
      }
      
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des affaires", err);
      setError("Impossible de charger la liste des affaires");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRedacteurs = async () => {
    try {
      const response = await parametresAPI.getByType('redacteurs');
      setRedacteurs(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des rédacteurs", err);
    }
  };
  
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const handleCreateAffaire = async (data) => {
    try {
      await affairesAPI.create(data);
      handleCloseModal();
      fetchAffaires();
    } catch (err) {
      console.error("Erreur lors de la création de l'affaire", err);
      // Gérer l'erreur
    }
  };
  
  const handleRowClick = (affaire) => {
    navigate(`/affaires/${affaire._id}`);
  };
  
  // Générer les années pour le filtre
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const years = [];
    
    for (let year = startYear; year <= currentYear + 1; year++) {
      years.push(year.toString());
    }
    
    return years;
  };

  // Fonction pour extraire l'année d'une date
  const getYearFromDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };
  
  const columns = useMemo(() => [
    {
      Header: 'Nom de l\'affaire',
      accessor: 'nom',
    },
    {
      Header: 'Date des faits',
      accessor: 'dateFaits',
      Cell: ({ value }) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('fr-FR');
      },
      // Ajoutez un sortType personnalisé pour les dates
      sortType: (rowA, rowB, columnId) => {
        const dateA = rowA.original.dateFaits ? new Date(rowA.original.dateFaits).getTime() : 0;
        const dateB = rowB.original.dateFaits ? new Date(rowB.original.dateFaits).getTime() : 0;
        return dateA - dateB;
      }
    },
    {
      Header: 'Lieu',
      accessor: 'lieu',
    },
    {
      Header: 'Année',
      accessor: row => getYearFromDate(row.dateFaits),
    },
    {
      Header: 'Rédacteur',
      accessor: 'redacteur',
      // Une fonction de tri personnalisée pour garantir un tri alphabétique correct
      sortType: (rowA, rowB) => {
        // Extraire les valeurs à comparer
        const redacteurA = rowA.original.redacteur || '';
        const redacteurB = rowB.original.redacteur || '';
        
        // Effectuer une comparaison alphabétique standard
        return redacteurA.localeCompare(redacteurB, 'fr', { sensitivity: 'base' });
      }
    },
    {
      Header: 'Archive',
      accessor: row => row.archive ? 'Archivé' : 'Actif',
      Cell: ({ value }) => (
        <StatusTag status={value === 'Archivé' ? 'archived' : 'active'}>
          {value}
        </StatusTag>
      ),
    },
  ], []);
  
  return (
    <Container>
      <PageHeader 
        title="Affaires" 
        subtitle="Gestion des dossiers de protection juridique complémentaire"
        actionButton={
          <ActionButton onClick={handleOpenModal}>
            <FaPlus />
            <span>Nouvelle affaire</span>
          </ActionButton>
        }
      />
      
      {/* Ajout du compteur d'affaires ici */}
      <AffairesCounter 
        total={totalAffaires} 
        actives={activesAffaires} 
        archived={archivedAffaires} 
      />
      
      <FiltersContainer>
        <FiltersGroup>
          <FilterLabel>
            <FaFilter />
            <span>Filtres:</span>
          </FilterLabel>
          
          <Select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">Toutes les années</option>
            {generateYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
          
          <Select
            value={filterRedacteur}
            onChange={(e) => setFilterRedacteur(e.target.value)}
          >
            <option value="">Tous les rédacteurs</option>
            {redacteurs.map((redacteur, index) => (
              <option key={index} value={redacteur}>{redacteur}</option>
            ))}
          </Select>
          
          <Select
            value={filterArchived}
            onChange={(e) => setFilterArchived(e.target.value)}
          >
            <option value="false">Actives</option>
            <option value="true">Archivées</option>
            <option value="">Toutes</option>
          </Select>
        </FiltersGroup>
      </FiltersContainer>
      
      {loading ? (
        <Loading>Chargement des affaires...</Loading>
      ) : error ? (
        <Error>{error}</Error>
      ) : (
        <DataTable
          columns={columns}
          data={affaires}
          onRowClick={handleRowClick}
          searchPlaceholder="Rechercher une affaire..."
          initialState={{
            sortBy: [
              {
                id: 'nom',
                desc: false
              }
            ]
          }}
        />
      )}
      
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Créer une nouvelle affaire"
        size="large"
      >
        <AffaireForm onSubmit={handleCreateAffaire} />
      </Modal>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
`;

const ActionButton = styled.button`
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #303f9f;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const FiltersGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  color: #757575;
  font-size: 14px;
  
  svg {
    margin-right: 4px;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  min-width: 150px;
  
  &:focus {
    border-color: #3f51b5;
  }
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => props.status === 'archived' ? `
    background-color: #f5f5f5;
    color: #757575;
  ` : props.status === 'active' ? `
    background-color: #e8f5e9;
    color: #388e3c;
  ` : ''}
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: #757575;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Styles pour le compteur d'affaires
const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  margin-bottom: 16px;
`;

const CounterItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
`;

const CounterValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #3f51b5;
`;

const CounterLabel = styled.div`
  font-size: 12px;
  color: #757575;
  margin-top: 4px;
`;

const CounterDivider = styled.div`
  width: 1px;
  height: 30px;
  background-color: #e0e0e0;
`;

export default Affaires;