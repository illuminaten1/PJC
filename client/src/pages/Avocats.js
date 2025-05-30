import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown, FaFilter, FaEye } from 'react-icons/fa';
import { avocatsAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import AvocatForm from '../components/forms/AvocatForm';
import AvocatDetail from '../components/specific/AvocatDetail';
import { useTheme } from '../contexts/ThemeContext';

// Fonction utilitaire pour surligner le terme dans le texte
const highlightMatch = (text, term) => {
  if (!text || !term || term.trim() === '') return text;

  const regex = new RegExp(`(${term.trim()})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const HighlightedText = ({ text, searchTerm }) => {
  if (!searchTerm.trim() || !text) return text;
  
  // Créer le HTML avec les termes surlignés
  const highlightedHTML = highlightMatch(text, searchTerm.trim());
  
  // Utiliser dangerouslySetInnerHTML pour interpréter les balises HTML
  return <span dangerouslySetInnerHTML={{ __html: highlightedHTML }} />;
};

const Avocats = () => {
  const [avocats, setAvocats] = useState([]);
  const [filteredAvocats, setFilteredAvocats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingAvocat, setEditingAvocat] = useState(null);
  const [selectedAvocat, setSelectedAvocat] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAvocatId, setSelectedAvocatId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  
  // État pour les filtres
  const [filters, setFilters] = useState({
    region: '',
    specialisationRPC: false,
    ville: '',
    cabinet: '' // Nouveau filtre pour cabinet
  });
  
  // Modifier pour afficher les filtres par défaut
  const [showFilters, setShowFilters] = useState(true);
  
  // États pour les listes de filtres
  const [cabinets, setCabinets] = useState([]); // State pour les cabinets
  
  // État pour le tri
  const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'asc' });

  // Import du thème
  const { colors } = useTheme();

  useEffect(() => {
    fetchAvocats();
    fetchCabinets(); // Fonction pour récupérer les cabinets
  }, []);

  const fetchAvocats = async () => {
    setLoading(true);
    try {
      const response = await avocatsAPI.getAll();
      setAvocats(response.data);
      setFilteredAvocats(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des avocats", err);
      setError("Impossible de charger la liste des avocats");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer la liste des cabinets
  const fetchCabinets = async () => {
    try {
      const response = await avocatsAPI.getCabinets();
      setCabinets(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des cabinets", err);
    }
  };

  // Extraire toutes les régions uniques des avocats
  const regions = [...new Set(avocats.filter(a => a.region).map(a => a.region))].sort();
  
  // Extraire toutes les villes d'intervention uniques
  const villesIntervention = avocats.reduce((acc, avocat) => {
    if (avocat.villesIntervention && Array.isArray(avocat.villesIntervention)) {
      avocat.villesIntervention.forEach(ville => {
        if (ville && !acc.includes(ville)) {
          acc.push(ville);
        }
      });
    }
    return acc;
  }, []).sort();

  // Effet pour la recherche et les filtres
  useEffect(() => {
    let result = avocats;
    
    // Appliquer la recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(avocat => 
        `${avocat.nom} ${avocat.prenom}`.toLowerCase().includes(term) ||
        (avocat.cabinet && avocat.cabinet.toLowerCase().includes(term)) ||
        (avocat.villesIntervention && Array.isArray(avocat.villesIntervention) && 
        avocat.villesIntervention.some(ville => ville.toLowerCase().includes(term)))
      );
    }
    
    // Appliquer les filtres
    if (filters.region) {
      result = result.filter(avocat => avocat.region === filters.region);
    }
    
    if (filters.specialisationRPC) {
      result = result.filter(avocat => avocat.specialisationRPC);
    }
    
    if (filters.ville) {
      result = result.filter(avocat => 
        avocat.villesIntervention && 
        Array.isArray(avocat.villesIntervention) && 
        avocat.villesIntervention.includes(filters.ville)
      );
    }
    
    // Filtre par cabinet
    if (filters.cabinet) {
      result = result.filter(avocat => 
        avocat.cabinet === filters.cabinet
      );
    }
    
    setFilteredAvocats(result);
  }, [searchTerm, filters, avocats]);
  
  // Effet pour le tri
  useEffect(() => {
    let sortedAvocats = [...filteredAvocats];
    if (sortConfig.key) {
      sortedAvocats.sort((a, b) => {
        // Gestion spéciale pour les champs imbriqués comme adresse.ville
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          let valueA = a;
          let valueB = b;
          
          for (const key of keys) {
            valueA = valueA?.[key];
            valueB = valueB?.[key];
          }
          
          if (!valueA) return sortConfig.direction === 'asc' ? -1 : 1;
          if (!valueB) return sortConfig.direction === 'asc' ? 1 : -1;
          
          if (valueA < valueB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        } else {
          // Tri normal pour les champs simples
          if (!a[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
          if (!b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
          
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    setFilteredAvocats(sortedAvocats);
  }, [sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      region: '',
      specialisationRPC: false,
      ville: '',
      cabinet: '' // Réinitialiser le filtre cabinet
    });
  };

  const handleOpenModal = (avocat = null) => {
    setEditingAvocat(avocat);
    setModalOpen(true);
  };
  
  const handleOpenDetailModal = (avocat) => {
    setSelectedAvocat(avocat);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingAvocat) {
        await avocatsAPI.update(editingAvocat._id, data);
      } else {
        await avocatsAPI.create(data);
      }
      setModalOpen(false);
      fetchAvocats();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'avocat", err);
      alert("Erreur: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    try {
      await avocatsAPI.delete(selectedAvocatId);
      setDeleteModalOpen(false);
      setDeleteError('');
      fetchAvocats();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'avocat", err);
      setDeleteError("Erreur lors de la suppression: " + (err.response?.data?.message || err.message));
    }
  };

  const openDeleteModal = (avocatId) => {
    setSelectedAvocatId(avocatId);
    setDeleteModalOpen(true);
  };

  if (loading && avocats.length === 0) {
    return (
      <Container colors={colors}>
        <PageHeader title="Annuaire des avocats" />
        <Loading colors={colors}>Chargement des avocats...</Loading>
      </Container>
    );
  }

  return (
    <Container colors={colors}>
      <PageHeader 
        title="Annuaire des avocats" 
        actionButton={
          <AddButton onClick={() => handleOpenModal()} colors={colors}>
            <FaPlus />
            <span>Ajouter un avocat</span>
          </AddButton>
        }
      />

      <ControlsPanel colors={colors}>
        <SearchFilterContainer>
          <SearchBar colors={colors}>
            <SearchIcon colors={colors}><FaSearch /></SearchIcon>
            <SearchInput
              type="text"
              placeholder="Rechercher par nom, cabinet ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              colors={colors}
            />
          </SearchBar>
          
          <FilterToggle onClick={() => setShowFilters(!showFilters)} colors={colors}>
            <FaFilter />
            <span>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</span>
          </FilterToggle>
        </SearchFilterContainer>
        
        <ResultCount colors={colors}>
          {filteredAvocats.length} avocat{filteredAvocats.length !== 1 ? 's' : ''} trouvé{filteredAvocats.length !== 1 ? 's' : ''}
        </ResultCount>
      </ControlsPanel>
      
      {showFilters && (
        <FiltersPanel colors={colors}>
          <FilterGroup>
            <FilterLabel colors={colors}>Région</FilterLabel>
            <FilterSelect 
              name="region" 
              value={filters.region} 
              onChange={handleFilterChange}
              colors={colors}
            >
              <option value="">Toutes les régions</option>
              {regions.map((region, index) => (
                <option key={index} value={region}>{region}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          {/* Filtre pour cabinet */}
          <FilterGroup>
            <FilterLabel colors={colors}>Cabinet</FilterLabel>
            <FilterSelect 
              name="cabinet" 
              value={filters.cabinet} 
              onChange={handleFilterChange}
              colors={colors}
            >
              <option value="">Tous les cabinets</option>
              {cabinets.map((cabinet, index) => (
                <option key={index} value={cabinet}>{cabinet}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel colors={colors}>Ville d'intervention</FilterLabel>
            <FilterSelect 
              name="ville" 
              value={filters.ville} 
              onChange={handleFilterChange}
              colors={colors}
            >
              <option value="">Toutes les villes</option>
              {villesIntervention.map((ville, index) => (
                <option key={index} value={ville}>{ville}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          {/* Mise à jour pour mieux aligner le bouton RPC */}
          <FilterGroup>
            <FilterLabel colors={colors}>Spécialisation</FilterLabel>
            <FilterCheckboxContainer colors={colors}>
              <input
                type="checkbox"
                name="specialisationRPC"
                id="filter-rpc"
                checked={filters.specialisationRPC}
                onChange={handleFilterChange}
              />
              <FilterCheckboxLabel htmlFor="filter-rpc" colors={colors}>
                Spécialisation RPC uniquement
              </FilterCheckboxLabel>
            </FilterCheckboxContainer>
          </FilterGroup>
          
          <ResetButton onClick={resetFilters} title="Réinitialiser les filtres" colors={colors}>
            Réinitialiser
          </ResetButton>
        </FiltersPanel>
      )}

      {error ? (
        <Error colors={colors}>{error}</Error>
      ) : (
        <TableContainer colors={colors}>
          {filteredAvocats.length > 0 ? (
            <Table colors={colors}>
              <TableHead colors={colors}>
                <tr>
                  <Th onClick={() => handleSort('nom')} colors={colors}>
                    <ThContent>
                      Nom
                      <SortIcon colors={colors}>{getSortIcon('nom')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('prenom')} colors={colors}>
                    <ThContent>
                      Prénom
                      <SortIcon colors={colors}>{getSortIcon('prenom')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('cabinet')} colors={colors}>
                    <ThContent>
                      Cabinet
                      <SortIcon colors={colors}>{getSortIcon('cabinet')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('region')} colors={colors}>
                    <ThContent>
                      Région
                      <SortIcon colors={colors}>{getSortIcon('region')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('villesIntervention')} colors={colors}>
                    <ThContent>
                      Villes d'intervention
                      <SortIcon colors={colors}>{getSortIcon('villesIntervention')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('specialisationRPC')} colors={colors}>
                    <ThContent>
                      Spé.
                      <SortIcon colors={colors}>{getSortIcon('specialisationRPC')}</SortIcon>
                    </ThContent>
                  </Th>
                  <ThActions colors={colors}>Actions</ThActions>
                </tr>
              </TableHead>
              <TableBody colors={colors}>
                {filteredAvocats.map((avocat) => (
                  <tr 
                    key={avocat._id}
                    onClick={() => handleOpenDetailModal(avocat)}
                    className="clickable-row"
                  >
                    <Td colors={colors} data-label="Nom">
                      <HighlightedText text={avocat.nom} searchTerm={searchTerm} />
                    </Td>
                    <Td colors={colors} data-label="Prénom">
                      <HighlightedText text={avocat.prenom} searchTerm={searchTerm} />
                    </Td>
                    <Td colors={colors} data-label="Cabinet">
                      <HighlightedText text={avocat.cabinet || '-'} searchTerm={searchTerm} />
                    </Td>
                    <Td colors={colors} data-label="Région">
                      {avocat.region ? (
                        <RegionBadge colors={colors}>
                          {avocat.region}
                        </RegionBadge>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td colors={colors} data-label="Villes d'intervention">
                      {avocat.villesIntervention && avocat.villesIntervention.length > 0 ? (
                        <VillesContainer>
                          {avocat.villesIntervention.slice(0, 2).map((ville, index) => (
                            <VilleTag 
                              key={index}
                              className={searchTerm.trim() !== "" && ville.toLowerCase().includes(searchTerm.toLowerCase()) ? "highlighted" : ""}
                              colors={colors}
                            >
                              <HighlightedText text={ville} searchTerm={searchTerm} />
                            </VilleTag>
                          ))}
                          {avocat.villesIntervention.length > 2 && (
                            <VilleTag 
                              className={`more ${searchTerm.trim() !== "" && 
                                avocat.villesIntervention.slice(2).some(v => v.toLowerCase().includes(searchTerm.toLowerCase())) 
                                ? "highlighted" : ""}`}
                              colors={colors}
                            >
                              +{avocat.villesIntervention.length - 2}
                              {searchTerm.trim() !== "" && 
                              avocat.villesIntervention.slice(2).some(v => v.toLowerCase().includes(searchTerm.toLowerCase())) && 
                              <span className="match-indicator"> (✓)</span>}
                            </VilleTag>
                          )}
                        </VillesContainer>
                      ) : '-'}
                    </Td>
                    <Td colors={colors} data-label="Spécialisation">
                      {avocat.specialisationRPC && (
                        <RPCTag colors={colors}>RPC</RPCTag>
                      )}
                    </Td>
                    <TdActions onClick={(e) => e.stopPropagation()} colors={colors} data-label="Actions">
                      <ActionButton title="Voir le détail" onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailModal(avocat);
                      }} colors={colors}>
                        <FaEye />
                      </ActionButton>
                      <ActionButton onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(avocat);
                      }} title="Modifier" colors={colors}>
                        <FaEdit />
                      </ActionButton>
                      <ActionButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(avocat._id);
                        }} 
                        title="Supprimer"
                        className="delete"
                        colors={colors}
                      >
                        <FaTrash />
                      </ActionButton>
                    </TdActions>
                  </tr>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyMessage colors={colors}>Aucun avocat trouvé</EmptyMessage>
          )}
        </TableContainer>
      )}

      {/* Modal de formulaire d'ajout/modification */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAvocat ? "Modifier un avocat" : "Ajouter un avocat"}
        size="large"
      >
        <AvocatForm 
          onSubmit={handleSubmit}
          initialData={editingAvocat}
          isEditing={!!editingAvocat}
        />
      </Modal>
      
      {/* Modal de détail d'avocat */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Détails de l'avocat"
        size="large"
      >
        {selectedAvocat && (
          <AvocatDetail 
            avocat={selectedAvocat} 
            onEditClick={() => {
              setDetailModalOpen(false);
              handleOpenModal(selectedAvocat);
            }}
          />
        )}
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer l'avocat"
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setDeleteModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={handleDelete} colors={colors}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent>
          <p>Êtes-vous sûr de vouloir supprimer définitivement cet avocat ?</p>
          {deleteError && <ErrorMessage colors={colors}>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>
    </Container>
  );
};

// Styled Components avec thématisation complète et responsive
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ControlsPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    margin-bottom: 16px;
  }
`;

const SearchFilterContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: stretch;
  flex-grow: 1;
  max-width: 700px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100%;
  }
`;

const SearchBar = styled.div`
  position: relative;
  flex-grow: 1;
  
  .highlight {
    background-color: ${props => props.colors.warning};
    color: ${props => props.colors.textPrimary};
    padding: 0 2px;
    border-radius: 2px;
    font-weight: 500;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  height: 100%;
  box-sizing: border-box;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.colors.textMuted};
  }
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  font-weight: 500;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    text-align: center;
    margin-top: 8px;
  }
`;

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primary}10;
    border-color: ${props => props.colors.primary};
    color: ${props => props.colors.primary};
  }
  
  svg {
    color: ${props => props.colors.primary};
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const FiltersPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  align-items: flex-end;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    margin-bottom: 16px;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  height: 40px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
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

const FilterCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 0 10px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.colors.primary}80;
  }
  
  input[type="checkbox"] {
    accent-color: ${props => props.colors.primary};
  }
`;

const FilterCheckboxLabel = styled.label`
  margin-left: 8px;
  font-size: 14px;
  color: ${props => props.colors.textPrimary};
  cursor: pointer;
  transition: color 0.3s ease;
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
  justify-content: center;
  transition: all 0.3s ease;
  height: 40px;
  font-weight: 500;
  
  &:hover {
    background-color: ${props => props.colors.error}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    overflow-x: visible;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  background-color: ${props => props.colors.surface};
  
  /* Responsive: Mobile Card Layout */
  @media (max-width: 768px) {
    display: block;
    min-width: auto;
    
    thead {
      display: none;
    }
    
    tbody {
      display: block;
      background: ${props => props.colors.surfaceHover}20;
      padding: 16px;
      border-radius: 8px;
    }
    
    tr {
      display: block;
      margin-bottom: 20px;
      background: ${props => props.colors.surface};
      border: 2px solid ${props => props.colors.border};
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      
      /* Ligne de séparation décorative en haut */
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 20px;
        right: 20px;
        height: 3px;
        background: linear-gradient(90deg, ${props => props.colors.primary}, ${props => props.colors.primary}80);
        border-radius: 0 0 2px 2px;
      }
      
      &:hover {
        background-color: ${props => props.colors.surfaceHover};
        transform: translateY(-3px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        border-color: ${props => props.colors.primary}40;
        cursor: pointer;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &.clickable-row {
        cursor: pointer;
      }
    }
    
    td {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      text-align: left;
      border: none;
      padding: 8px 0;
      border-bottom: 1px solid ${props => props.colors.borderLight};
      
      &:last-child {
        border-bottom: none;
      }
      
      &:before {
        content: attr(data-label);
        font-weight: 600;
        color: ${props => props.colors.textSecondary};
        flex: 0 0 40%;
        margin-right: 16px;
        font-size: 13px;
      }
      
      /* Contenu de la cellule */
      > * {
        flex: 1;
        text-align: right;
      }
    }
  }

  /* Responsive: Tablet */
  @media (max-width: 1024px) and (min-width: 769px) {
    min-width: 100%;
    
    th, td {
      padding: 10px 12px;
      font-size: 14px;
    }
  }
`;

const TableHead = styled.thead`
  background-color: ${props => props.colors.surfaceHover};
  border-bottom: 2px solid ${props => props.colors.borderLight};
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primary}10;
    color: ${props => props.colors.primary};
  }
  
  @media (max-width: 1024px) {
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const ThActions = styled.th`
  padding: 12px 16px;
  text-align: center;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  width: 120px;
  transition: color 0.3s ease;
  
  @media (max-width: 1024px) {
    padding: 10px 12px;
    width: 100px;
  }
`;

const ThContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${props => props.colors.borderLight};
    transition: all 0.3s ease;
    
    &:hover {
      background-color: ${props => props.colors.surfaceHover};
    }
    
    &.clickable-row {
      cursor: pointer;
    }
  }
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  .highlight {
    background-color: ${props => props.colors.warning};
    color: ${props => props.colors.textPrimary};
    padding: 0 2px;
    border-radius: 2px;
    font-weight: 500;
  }
  
  @media (max-width: 1024px) and (min-width: 769px) {
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const TdActions = styled.td`
  padding: 8px 16px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    justify-content: flex-end;
    gap: 12px;
    
    &:before {
      flex: 0 0 40% !important;
    }
  }
  
  @media (max-width: 1024px) and (min-width: 769px) {
    padding: 8px 12px;
    gap: 6px;
  }
`;

const RegionBadge = styled.span`
  display: inline-block;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #bbdefb;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

const RPCTag = styled.span`
  display: inline-block;
  background-color: ${props => props.colors.error};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primary}10;
    transform: scale(1.1);
  }
  
  &.delete {
    color: ${props => props.colors.error};
    
    &:hover {
      background-color: ${props => props.colors.errorBg};
    }
  }
  
  @media (max-width: 768px) {
    padding: 8px;
    font-size: 18px;
    border-radius: 6px;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const AddButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: ${props => props.colors.shadow};
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
    margin-top: 12px;
  }
`;

const DeleteConfirmContent = styled.div`
  p {
    margin-bottom: 16px;
    color: ${props => props.colors ? props.colors.textPrimary : '#333'};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 14px;
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
`;

const CancelButton = styled.button`
  background-color: ${props => props.colors.surfaceHover};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.borderLight};
    border-color: ${props => props.colors.primary};
  }
`;

const DeleteButton = styled.button`
  background-color: ${props => props.colors.error};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.error}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
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
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
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
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const EmptyMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surface};
  font-style: italic;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    
    &:before {
      display: none !important;
    }
  }
`;

const VillesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  
  @media (max-width: 768px) {
    justify-content: flex-end;
    gap: 3px;
  }
`;

const VilleTag = styled.span`
  background-color: #e3f2fd;
  border-radius: 12px;
  padding: 3px 8px;
  font-size: 12px;
  color: #1976d2;
  white-space: nowrap;
  transition: all 0.3s ease;
  border: 1px solid #bbdefb;
  
  &.more {
    background-color: #f5f5f5;
    color: #666;
    border: 1px solid #ddd;
    
    &.highlighted {
      background-color: ${props => props.colors.warningBg};
      border: 1px solid ${props => props.colors.warning};
      color: ${props => props.colors.textPrimary};
    }
    
    .match-indicator {
      color: ${props => props.colors.warning};
      font-weight: bold;
    }
  }
  
  &.highlighted {
    border: 1px solid ${props => props.colors.warning};
    background-color: ${props => props.colors.warningBg};
  }
  
  .highlight {
    background-color: ${props => props.colors.warning};
    color: ${props => props.colors.textPrimary};
    padding: 0 2px;
    border-radius: 2px;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
  }
`;

export default Avocats;