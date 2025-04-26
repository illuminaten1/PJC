import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import { militairesAPI, affairesAPI, parametresAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';

const Militaires = () => {
  const [militaires, setMilitaires] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [redacteurs, setRedacteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAffaire, setFilterAffaire] = useState('');
  const [filterRedacteur, setFilterRedacteur] = useState('');
  const [filterArchive, setFilterArchive] = useState('false');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchMilitaires();
    fetchAffaires();
    fetchRedacteurs();
  }, [searchTerm, filterAffaire, filterRedacteur, filterArchive]);
  
  const fetchMilitaires = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (searchTerm) params.search = searchTerm;
      if (filterAffaire) params.affaire = filterAffaire;
      if (filterRedacteur) params.redacteur = filterRedacteur;
      if (filterArchive !== '') params.archive = filterArchive;
      
      const response = await militairesAPI.getAll(params);
      setMilitaires(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des militaires", err);
      setError("Impossible de charger la liste des militaires");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAffaires = async () => {
    try {
      const response = await affairesAPI.getAll();
      setAffaires(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des affaires", err);
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

  const resetFilters = () => {
    setFilterAffaire('');
    setFilterRedacteur('');
    setFilterArchive('false');
    setSearchTerm('');
  };
  
  const handleRowClick = (militaire) => {
    navigate(`/militaires/${militaire._id}`);
  };
  
  const columns = useMemo(() => [
    {
      Header: 'Grade',
      accessor: 'grade',
    },
    {
      Header: 'Prénom',
      accessor: 'prenom',
    },
    {
      Header: 'NOM',
      accessor: 'nom',
    },
    {
      Header: 'Circonstance',
      accessor: 'circonstance',
    },
    {
      Header: 'Statut',
      accessor: row => row.decede ? 'Décédé' : 'Blessé',
      Cell: ({ value }) => (
        <StatusTag status={value === 'Décédé' ? 'deces' : 'blesse'}>
          {value}
        </StatusTag>
      ),
    },
    {
      Header: 'Affaire',
      accessor: row => row.affaire?.nom || 'Non définie',
    },
    {
      Header: 'Rédacteur',
      accessor: row => row.affaire?.redacteur || '-',
    },
    {
      Header: 'Archive',
      accessor: row => row.archive ? 'Archivé' : 'Actif',
      Cell: ({ value }) => (
        <ArchiveTag status={value === 'Archivé' ? 'archived' : 'active'}>
          {value}
        </ArchiveTag>
      ),
    },
  ], []);
  
  return (
    <Container>
      <PageHeader 
        title="Militaires" 
        subtitle="Gestion des militaires créateurs de droit"
      />
      
      <FiltersContainer>
        <FiltersGroup>
          <FilterLabel>
            <FaFilter />
            <span>Filtres:</span>
          </FilterLabel>
          
          <Select
            value={filterAffaire}
            onChange={(e) => setFilterAffaire(e.target.value)}
          >
            <option value="">Toutes les affaires</option>
            {affaires.map(affaire => (
              <option key={affaire._id} value={affaire._id}>{affaire.nom}</option>
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
            value={filterArchive}
            onChange={(e) => setFilterArchive(e.target.value)}
          >
            <option value="false">Actifs</option>
            <option value="true">Archivés</option>
            <option value="">Tous</option>
          </Select>

          <ResetButton onClick={resetFilters} title="Réinitialiser les filtres">
            Réinitialiser
          </ResetButton>

        </FiltersGroup>
      </FiltersContainer>
      
      {loading ? (
        <Loading>Chargement des militaires...</Loading>
      ) : error ? (
        <Error>{error}</Error>
      ) : (
        <DataTable
          columns={columns}
          data={militaires}
          onRowClick={handleRowClick}
          searchPlaceholder="Rechercher un militaire..."
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
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
  min-width: 200px;
  
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
  
  ${props => props.status === 'deces' ? `
    background-color: #ffebee;
    color: #c62828;
  ` : props.status === 'blesse' ? `
    background-color: #e8f5e9;
    color: #388e3c;
  ` : ''}
`;

const ArchiveTag = styled.span`
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

const ResetButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

export default Militaires;