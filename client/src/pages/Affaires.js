import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { affairesAPI, parametresAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import AffaireForm from '../components/forms/AffaireForm';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors } = useTheme();
  
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

  const resetFilters = () => {
    setFilterYear('');
    setFilterRedacteur('');
    setFilterArchived('false');
    setSearchTerm('');
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
      Header: 'Lieu des faits',
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
        <StatusTag status={value === 'Archivé' ? 'archived' : 'active'} colors={colors}>
          {value}
        </StatusTag>
      ),
    },
  ], [colors]);
  
  return (
    <Container colors={colors}>
      <HeaderContainer colors={colors}>
        <TitleArea>
          <Title colors={colors}>Affaires</Title>
          <Subtitle colors={colors}>Gestion des dossiers de protection juridique complémentaire</Subtitle>
          <StatPills>
            <StatPill colors={colors}>{totalAffaires} au total</StatPill>
            <StatPill className="active" colors={colors}>{activesAffaires} actives</StatPill>
            <StatPill className="archived" colors={colors}>{archivedAffaires} archivées</StatPill>
          </StatPills>
        </TitleArea>
        
        <ActionButton onClick={handleOpenModal} colors={colors}>
          <FaPlus />
          <span className="action-text-long">Nouvelle affaire</span>
          <span className="action-text-short">Nouvelle</span>
        </ActionButton>
      </HeaderContainer>
      
      <FiltersContainer colors={colors}>
        <FiltersGroup>
          <FilterLabel colors={colors}>
            <FaFilter />
            <span>Filtres:</span>
          </FilterLabel>
          
          <Select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            colors={colors}
          >
            <option value="">Toutes les années</option>
            {generateYears().map(year => (
              <option key={year} value={year}>{year}</option>
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
            value={filterArchived}
            onChange={(e) => setFilterArchived(e.target.value)}
            colors={colors}
          >
            <option value="false">Actives</option>
            <option value="true">Archivées</option>
            <option value="">Toutes</option>
          </Select>

          <ResetButton onClick={resetFilters} title="Réinitialiser les filtres" colors={colors}>
            Réinitialiser
          </ResetButton>

          <ResultCount colors={colors}>
            {affaires.length} affaire{affaires.length !== 1 ? 's' : ''} trouvée{affaires.length !== 1 ? 's' : ''}
          </ResultCount>

        </FiltersGroup>
      </FiltersContainer>
      
      {loading ? (
        <Loading colors={colors}>Chargement des affaires...</Loading>
      ) : error ? (
        <Error colors={colors}>{error}</Error>
      ) : (
        <DataTable
          columns={columns}
          data={affaires}
          onRowClick={handleRowClick}
          searchPlaceholder="Rechercher une affaire..."
          initialState={{ sortBy: [{ id: 'nom', desc: false }] }}
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

// Styled Components avec thématisation
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
  
  // Responsive design pour mobile
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    gap: 12px;
  }
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
    border-color: ${props => props.colors.success}40;
  }
  
  &.archived {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.textMuted};
    border-color: ${props => props.colors.borderLight};
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.colors.shadow};
  white-space: nowrap;
  
  svg {
    flex-shrink: 0;
    font-size: 16px;
  }
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  // Styles responsive pour mobile
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
    gap: 6px;
    
    // Masquer le mot "affaire" sur très petits écrans
    .action-text-long {
      display: none;
    }
    
    .action-text-short {
      display: inline;
    }
    
    svg {
      font-size: 14px;
    }
  }
  
  @media (min-width: 481px) {
    .action-text-long {
      display: inline;
    }
    
    .action-text-short {
      display: none;
    }
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
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  &:hover {
    border-color: ${props => props.colors.primary}80;
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
  
  &:hover {
    background-color: ${props => props.colors.error}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
`;

const StatusTag = styled.span`
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
    border: 1px solid ${props.colors.success}40;
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
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

export default Affaires;