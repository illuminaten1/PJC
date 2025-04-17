import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaUserTie } from 'react-icons/fa';
import { beneficiairesAPI, parametresAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';

const Beneficiaires = () => {
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQualite, setFilterQualite] = useState('');
  const [filterRedacteur, setFilterRedacteur] = useState('');
  const [filterArchive, setFilterArchive] = useState('false');
  const [filterDecision, setFilterDecision] = useState('');
  const [filterAvocat, setFilterAvocat] = useState('');
  const [redacteurs, setRedacteurs] = useState([]);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchBeneficiaires();
    fetchRedacteurs();
  }, [searchTerm, filterQualite, filterRedacteur, filterArchive, filterDecision, filterAvocat]);
  
  const fetchBeneficiaires = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (searchTerm) params.search = searchTerm;
      if (filterQualite) params.qualite = filterQualite;
      if (filterRedacteur) params.redacteur = filterRedacteur;
      if (filterArchive !== '') params.archive = filterArchive;
      
      // Récupération de tous les bénéficiaires
      const response = await beneficiairesAPI.getAll(params);
      let filteredData = response.data;
      
      // Filtrage côté client pour la décision et les avocats
      if (filterDecision !== '') {
        const hasDecision = filterDecision === 'true';
        filteredData = filteredData.filter(b => 
          hasDecision ? (b.numeroDecision && b.numeroDecision.trim() !== '') : 
                        (!b.numeroDecision || b.numeroDecision.trim() === '')
        );
      }
      
      if (filterAvocat !== '') {
        const hasAvocat = filterAvocat === 'true';
        filteredData = filteredData.filter(b => 
          hasAvocat ? (b.avocats && b.avocats.length > 0) : 
                      (!b.avocats || b.avocats.length === 0)
        );
      }
      
      setBeneficiaires(filteredData);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des bénéficiaires", err);
      setError("Impossible de charger la liste des bénéficiaires");
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
  
  const handleRowClick = (beneficiaire) => {
    navigate(`/beneficiaires/${beneficiaire._id}`);
  };
  
  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setFilterQualite('');
    setFilterRedacteur('');
    setFilterArchive('false');
    setFilterDecision('');
    setFilterAvocat('');
  };
  
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  // Fonction pour afficher la liste des avocats
  const formatAvocats = (avocats) => {
    if (!avocats || avocats.length === 0) return '-';
    
    return (
      <AvocatsContainer>
        {avocats.map((avocat, index) => (
          <AvocatBadge key={index} 
            title={`${avocat.prenom} ${avocat.nom}`}
          >
            <AvocatContent>
              <FaUserTie />
              <span>{`${avocat.prenom.charAt(0)}. ${avocat.nom}`}</span>
            </AvocatContent>
          </AvocatBadge>
        ))}
      </AvocatsContainer>
    );
  };
  
  // Fonction pour trouver et formater la date FMG la plus ancienne
  const getOldestFMGDate = (conventions) => {
    if (!conventions || conventions.length === 0) return '-';
    
    // Filtre les conventions avec une date d'envoi FMG
    const withFMGDate = conventions.filter(c => c.dateValidationFMG);
    
    if (withFMGDate.length === 0) return '-';
    
    // Trie les conventions par date d'envoi FMG (la plus ancienne en premier)
    withFMGDate.sort((a, b) => new Date(a.dateValidationFMG) - new Date(b.dateValidationFMG));
    
    // Retourne la date formatée de la plus ancienne
    return formatDate(withFMGDate[0].dateValidationFMG);
  };
  
  const columns = useMemo(() => [
    {
      Header: 'Prénom',
      accessor: 'prenom',
    },
    {
      Header: 'NOM',
      accessor: 'nom',
    },
    {
      Header: 'Qualité',
      accessor: 'qualite',
      Cell: ({ value }) => (
        <QualiteTag qualite={value}>{value}</QualiteTag>
      ),
    },
    {
      Header: 'Militaire créateur de droit',
      accessor: row => row.militaire ? `${row.militaire.grade} ${row.militaire.prenom} ${row.militaire.nom}` : '-',
    },
    {
      Header: 'N° et date de décision',
      accessor: row => ({ numero: row.numeroDecision, date: row.dateDecision }),
      Cell: ({ value }) => (
        <DecisionContainer>
          <div>{value.numero || '-'}</div>
          {value.date && <DecisionDate>{formatDate(value.date)}</DecisionDate>}
        </DecisionContainer>
      ),
    },
    {
      Header: 'Date FMG',
      accessor: 'conventions',
      Cell: ({ value }) => <span>{getOldestFMGDate(value)}</span>,
    },
    {
      Header: 'Avocats désignés',
      accessor: 'avocats',
      Cell: ({ value }) => formatAvocats(value),
    },
    {
      Header: 'Rédacteur',
      accessor: row => row.militaire && row.militaire.affaire ? row.militaire.affaire.redacteur : '-',
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
        title="Bénéficiaires" 
        subtitle="Gestion des bénéficiaires de la protection juridique complémentaire"
      />
      
      <FiltersContainer>
        <FiltersGroup>
          <FilterLabel>
            <FaFilter />
            <span>Filtres:</span>
          </FilterLabel>
          
          <Select
            value={filterQualite}
            onChange={(e) => setFilterQualite(e.target.value)}
          >
            <option value="">Toutes les qualités</option>
            <option value="Militaire">Militaire</option>
            <option value="Conjoint">Conjoint</option>
            <option value="Enfant">Enfant</option>
            <option value="Parent">Parent</option>
            <option value="Autre">Autre</option>
          </Select>
          
          <Select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
          >
            <option value="">Avec/sans décision</option>
            <option value="true">Avec décision</option>
            <option value="false">Sans décision</option>
          </Select>
          
          <Select
            value={filterAvocat}
            onChange={(e) => setFilterAvocat(e.target.value)}
          >
            <option value="">Avec/sans avocat</option>
            <option value="true">Avec avocat</option>
            <option value="false">Sans avocat</option>
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
        <Loading>Chargement des bénéficiaires...</Loading>
      ) : error ? (
        <Error>{error}</Error>
      ) : (
        <DataTable
          columns={columns}
          data={beneficiaires}
          onRowClick={handleRowClick}
          searchPlaceholder="Rechercher un bénéficiaire..."
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
  min-width: 150px;
  
  &:focus {
    border-color: #3f51b5;
  }
`;

const QualiteTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch(props.qualite) {
      case 'Militaire':
        return `
          background-color: #e8f5e9;
          color: #388e3c;
        `;
      case 'Conjoint':
        return `
          background-color: #e3f2fd;
          color: #1976d2;
        `;
      case 'Enfant':
        return `
          background-color: #fff8e1;
          color: #f57f17;
        `;
      case 'Parent':
        return `
          background-color: #f3e5f5;
          color: #8e24aa;
        `;
      default:
        return `
          background-color: #f5f5f5;
          color: #757575;
        `;
    }
  }}
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

// Nouveaux composants stylisés pour les dates de décision
const DecisionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DecisionDate = styled.span`
  font-size: 12px;
  color: #757575;
  margin-top: 2px;
`;

// Nouveaux composants stylisés pour les avocats
const AvocatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const AvocatBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #616161;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
  height: 24px;
`;

const AvocatContent = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 4px;
    font-size: 10px;
  }
`;

const RPCIndicator = styled.span`
  background-color: #ff5722;
  color: white;
  font-size: 8px;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 3px;
  margin-left: 6px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
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

export default Beneficiaires;