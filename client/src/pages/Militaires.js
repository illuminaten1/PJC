import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import { militairesAPI, affairesAPI, parametresAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import { useTheme } from '../contexts/ThemeContext';

const Militaires = () => {
  const [militaires, setMilitaires] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [redacteurs, setRedacteurs] = useState([]);
  const [regions, setRegions] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAffaire, setFilterAffaire] = useState('');
  const [filterRedacteur, setFilterRedacteur] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('');
  const [filterArchive, setFilterArchive] = useState('false');
  const [totalMilitaires, setTotalMilitaires] = useState(0);
  const [activesMilitaires, setActivesMilitaires] = useState(0);
  const [archivedMilitaires, setArchivedMilitaires] = useState(0);
  
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  useEffect(() => {
    fetchMilitaires();
    fetchAffaires();
    fetchRedacteurs();
    fetchRegionsAndDepartements();
  }, [searchTerm, filterAffaire, filterRedacteur, filterRegion, filterDepartement, filterArchive]);
  
  const fetchMilitaires = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (searchTerm) params.search = searchTerm;
      if (filterAffaire) params.affaire = filterAffaire;
      if (filterRedacteur) params.redacteur = filterRedacteur;
      if (filterRegion) params.region = filterRegion;
      if (filterDepartement) params.departement = filterDepartement;
      if (filterArchive !== '') params.archive = filterArchive;
      
      const response = await militairesAPI.getAll(params);
      setMilitaires(response.data);
      
      // Si aucun filtre n'est appliqué, utilisez directement cette réponse pour les compteurs
      if (!searchTerm && !filterAffaire && !filterRedacteur && !filterRegion && !filterDepartement && filterArchive === '') {
        const allMilitaires = response.data;
        setTotalMilitaires(allMilitaires.length);
        setActivesMilitaires(allMilitaires.filter(m => !m.archive).length);
        setArchivedMilitaires(allMilitaires.filter(m => m.archive).length);
      } else {
        // Sinon, faites une requête supplémentaire pour les statistiques globales
        const statsResponse = await militairesAPI.getAll({});
        const allMilitaires = statsResponse.data;
        setTotalMilitaires(allMilitaires.length);
        setActivesMilitaires(allMilitaires.filter(m => !m.archive).length);
        setArchivedMilitaires(allMilitaires.filter(m => m.archive).length);
      }
      
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

  const fetchRegionsAndDepartements = async () => {
    try {
      // Récupérer tous les militaires pour extraire les régions et départements uniques
      const response = await militairesAPI.getAll({});
      const allMilitaires = response.data;
      
      // Extraire les régions uniques (non nulles/vides)
      const uniqueRegions = [...new Set(
        allMilitaires
          .map(m => m.region)
          .filter(region => region && region.trim() !== '')
      )].sort();
      
      // Extraire les départements uniques (non nulles/vides)
      const uniqueDepartements = [...new Set(
        allMilitaires
          .map(m => m.departement)
          .filter(dept => dept && dept.trim() !== '')
      )].sort();
      
      setRegions(uniqueRegions);
      setDepartements(uniqueDepartements);
    } catch (err) {
      console.error("Erreur lors de la récupération des régions et départements", err);
    }
  };

  const resetFilters = () => {
    setFilterAffaire('');
    setFilterRedacteur('');
    setFilterRegion('');
    setFilterDepartement('');
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
      Header: 'Unité',
      accessor: 'unite',
    },
    {
      Header: 'Région / Département',
      accessor: row => `${row.region || '-'} / ${row.departement || '-'}`,
    },
    {
      Header: 'Circonstance',
      accessor: 'circonstance',
    },
    {
      Header: 'Statut',
      accessor: row => row.decede ? 'Décédé' : 'Blessé',
      Cell: ({ value }) => (
        <StatusTag status={value === 'Décédé' ? 'deces' : 'blesse'} colors={colors}>
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
        <ArchiveTag status={value === 'Archivé' ? 'archived' : 'active'} colors={colors}>
          {value}
        </ArchiveTag>
      ),
    },
  ], [colors]);
  
  return (
    <Container colors={colors}>
      <HeaderContainer colors={colors}> 
        <TitleArea>
          <Title colors={colors}>Militaires</Title>
          <Subtitle colors={colors}>Gestion des militaires créateurs de droit</Subtitle>
          <StatPills>
            <StatPill colors={colors}>{totalMilitaires} au total</StatPill>
            <StatPill className="active" colors={colors}>{activesMilitaires} actifs</StatPill>
            <StatPill className="archived" colors={colors}>{archivedMilitaires} archivés</StatPill>
          </StatPills>
        </TitleArea>
      </HeaderContainer>

      <FiltersContainer colors={colors}>
        <FiltersGroup>
          <FilterLabel colors={colors}>
            <FaFilter />
            <span>Filtres:</span>
          </FilterLabel>
          
          <Select
            value={filterAffaire}
            onChange={(e) => setFilterAffaire(e.target.value)}
            colors={colors}
          >
            <option value="">Toutes les affaires</option>
            {affaires.map(affaire => (
              <option key={affaire._id} value={affaire._id}>{affaire.nom}</option>
            ))}
          </Select>
          
          <Select
            value={filterRedacteur}
            onChange={(e) => setFilterRedacteur(e.target.value)}
            colors={colors}
          >
            <option value="">Tous les rédacteurs</option>
            {redacteurs.map((redacteur, index) => (
              <option key={index} value={redacteur}>{redacteur}</option>
            ))}
          </Select>
          
          <Select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            colors={colors}
          >
            <option value="">Toutes les régions</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </Select>
          
          <Select
            value={filterDepartement}
            onChange={(e) => setFilterDepartement(e.target.value)}
            colors={colors}
          >
            <option value="">Tous les départements</option>
            {departements.map((departement, index) => (
              <option key={index} value={departement}>{departement}</option>
            ))}
          </Select>
          
          <Select
            value={filterArchive}
            onChange={(e) => setFilterArchive(e.target.value)}
            colors={colors}
          >
            <option value="false">Actifs</option>
            <option value="true">Archivés</option>
            <option value="">Tous</option>
          </Select>

          <ResetButton onClick={resetFilters} title="Réinitialiser les filtres" colors={colors}>
            Réinitialiser
          </ResetButton>
        </FiltersGroup>

        <ResultCount colors={colors}>
          {militaires.length} militaire{militaires.length !== 1 ? 's' : ''} trouvé{militaires.length !== 1 ? 's' : ''}
        </ResultCount>
      </FiltersContainer>
      
      {loading ? (
        <Loading colors={colors}>Chargement des militaires...</Loading>
      ) : error ? (
        <Error colors={colors}>{error}</Error>
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

// Styled Components avec thématisation complète
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const TitleArea = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  margin: 4px 0 0;
  transition: color 0.3s ease;
`;

const StatPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const StatPill = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  background-color: ${props => props.colors.surfaceHover};
  padding: 4px 12px;
  border-radius: 12px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  &.active {
    background-color: ${props => props.colors.successBg};
    color: ${props => props.colors.success};
    border-color: ${props => props.colors.success + '40'};
  }
  
  &.archived {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.textMuted};
    border-color: ${props => props.colors.borderLight};
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
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
  color: ${props => props.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
  
  svg {
    margin-right: 6px;
    color: ${props => props.colors.primary};
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  min-width: 150px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary + '20'};
  }
  
  &:hover {
    border-color: ${props => props.colors.primary + '80'};
  }
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const ResetButton = styled.button`
  background-color: ${props => props.colors.error};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: ${props => props.colors.shadow};
  
  &:hover {
    background-color: ${props => props.colors.error + 'dd'};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const StatusTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => props.status === 'deces' ? `
    background-color: ${props.colors.errorBg};
    color: ${props.colors.error};
    border: 1px solid ${props.colors.error + '40'};
  ` : props.status === 'blesse' ? `
    background-color: ${props.colors.successBg};
    color: ${props.colors.success};
    border: 1px solid ${props.colors.success + '40'};
  ` : ''}
`;

const ArchiveTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => props.status === 'archived' ? `
    background-color: ${props.colors.surfaceHover};
    color: ${props.colors.textMuted};
    border: 1px solid ${props.colors.borderLight};
  ` : props.status === 'active' ? `
    background-color: ${props.colors.successBg};
    color: ${props.colors.success};
    border: 1px solid ${props.colors.success + '40'};
  ` : ''}
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textSecondary};
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const Error = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.error + '40'};
  transition: all 0.3s ease;
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

export default Militaires;