import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown, FaFilter, FaEye } from 'react-icons/fa';
import { avocatsAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import AvocatForm from '../components/forms/AvocatForm';
import AvocatDetail from '../components/specific/AvocatDetail';

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
  
  const getRegionLabel = (region) => {
    if (!region) return '';
    if (region.startsWith('Nouvelle-')) return 'N. ' + region.substring(9);
    if (region.startsWith('Provence-')) return 'PACA';
    if (region.startsWith('Auvergne-')) return 'Auv. R-A';
    if (region.startsWith('Bourgogne-')) return 'B. F-C';
    return region;
  };

  if (loading && avocats.length === 0) {
    return (
      <Container>
        <PageHeader title="Annuaire des avocats" />
        <Loading>Chargement des avocats...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader 
        title="Annuaire des avocats" 
        actionButton={
          <AddButton onClick={() => handleOpenModal()}>
            <FaPlus />
            <span>Ajouter un avocat</span>
          </AddButton>
        }
      />

      <ControlsPanel>
        <SearchFilterContainer>
          <SearchBar>
            <SearchIcon><FaSearch /></SearchIcon>
            <SearchInput
              type="text"
              placeholder="Rechercher par nom, cabinet ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          
          <FilterToggle onClick={() => setShowFilters(!showFilters)}>
            <FaFilter />
            <span>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</span>
          </FilterToggle>
        </SearchFilterContainer>
        
        <ResultCount>
          {filteredAvocats.length} avocat{filteredAvocats.length !== 1 ? 's' : ''} trouvé{filteredAvocats.length !== 1 ? 's' : ''}
        </ResultCount>
      </ControlsPanel>
      
      {showFilters && (
        <FiltersPanel>
          <FilterGroup>
            <FilterLabel>Région</FilterLabel>
            <FilterSelect 
              name="region" 
              value={filters.region} 
              onChange={handleFilterChange}
            >
              <option value="">Toutes les régions</option>
              {regions.map((region, index) => (
                <option key={index} value={region}>{region}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          {/* Filtre pour cabinet */}
          <FilterGroup>
            <FilterLabel>Cabinet</FilterLabel>
            <FilterSelect 
              name="cabinet" 
              value={filters.cabinet} 
              onChange={handleFilterChange}
            >
              <option value="">Tous les cabinets</option>
              {cabinets.map((cabinet, index) => (
                <option key={index} value={cabinet}>{cabinet}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Ville d'intervention</FilterLabel>
            <FilterSelect 
              name="ville" 
              value={filters.ville} 
              onChange={handleFilterChange}
            >
              <option value="">Toutes les villes</option>
              {villesIntervention.map((ville, index) => (
                <option key={index} value={ville}>{ville}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          {/* Mise à jour pour mieux aligner le bouton RPC */}
          <FilterGroup>
            <FilterLabel>Spécialisation</FilterLabel>
            <FilterCheckboxContainer>
              <input
                type="checkbox"
                name="specialisationRPC"
                id="filter-rpc"
                checked={filters.specialisationRPC}
                onChange={handleFilterChange}
              />
              <FilterCheckboxLabel htmlFor="filter-rpc">
                Spécialisation RPC uniquement
              </FilterCheckboxLabel>
            </FilterCheckboxContainer>
          </FilterGroup>
          
          <ResetButton onClick={resetFilters} title="Réinitialiser les filtres">
            Réinitialiser
          </ResetButton>
        </FiltersPanel>
      )}

      {error ? (
        <Error>{error}</Error>
      ) : (
        <TableContainer>
          {filteredAvocats.length > 0 ? (
            <Table>
              <TableHead>
                <tr>
                  <Th onClick={() => handleSort('nom')}>
                    <ThContent>
                      Nom
                      <SortIcon>{getSortIcon('nom')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('prenom')}>
                    <ThContent>
                      Prénom
                      <SortIcon>{getSortIcon('prenom')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('cabinet')}>
                    <ThContent>
                      Cabinet
                      <SortIcon>{getSortIcon('cabinet')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('region')}>
                    <ThContent>
                      Région
                      <SortIcon>{getSortIcon('region')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('villesIntervention')}>
                    <ThContent>
                      Villes d'intervention
                      <SortIcon>{getSortIcon('villesIntervention')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('specialisationRPC')}>
                    <ThContent>
                      Spé.
                      <SortIcon>{getSortIcon('specialisationRPC')}</SortIcon>
                    </ThContent>
                  </Th>
                  <ThActions>Actions</ThActions>
                </tr>
              </TableHead>
              <TableBody>
                {filteredAvocats.map((avocat) => (
                  <tr 
                    key={avocat._id}
                    onClick={() => handleOpenDetailModal(avocat)}
                    className="clickable-row"
                  >
                    <Td><HighlightedText text={avocat.nom} searchTerm={searchTerm} /></Td>
                    <Td><HighlightedText text={avocat.prenom} searchTerm={searchTerm} /></Td>
                    <Td><HighlightedText text={avocat.cabinet || '-'} searchTerm={searchTerm} /></Td>
                    <Td>
                      {avocat.region ? (
                        <RegionBadge title={avocat.region}>
                          {getRegionLabel(avocat.region)}
                        </RegionBadge>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>
                      {avocat.villesIntervention && avocat.villesIntervention.length > 0 ? (
                        <VillesContainer>
                          {avocat.villesIntervention.slice(0, 2).map((ville, index) => (
                            <VilleTag 
                              key={index}
                              className={searchTerm.trim() !== "" && ville.toLowerCase().includes(searchTerm.toLowerCase()) ? "highlighted" : ""}
                            >
                              <HighlightedText text={ville} searchTerm={searchTerm} />
                            </VilleTag>
                          ))}
                          {avocat.villesIntervention.length > 2 && (
                            <VilleTag className="more">
                              +{avocat.villesIntervention.length - 2}
                              {searchTerm.trim() !== "" && 
                              avocat.villesIntervention.slice(2).some(v => v.toLowerCase().includes(searchTerm.toLowerCase())) && 
                              " (✓)"}
                            </VilleTag>
                          )}
                        </VillesContainer>
                      ) : '-'}
                    </Td>                   <Td>
                      {avocat.specialisationRPC && (
                        <RPCTag>RPC</RPCTag>
                      )}
                    </Td>
                    <TdActions onClick={(e) => e.stopPropagation()}>
                      <ActionButton title="Voir le détail" onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailModal(avocat);
                      }}>
                        <FaEye />
                      </ActionButton>
                      <ActionButton onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(avocat);
                      }} title="Modifier">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(avocat._id);
                        }} 
                        title="Supprimer"
                        className="delete"
                      >
                        <FaTrash />
                      </ActionButton>
                    </TdActions>
                  </tr>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyMessage>Aucun avocat trouvé</EmptyMessage>
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
            <CancelButton onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={handleDelete}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <DeleteConfirmContent>
          <p>Êtes-vous sûr de vouloir supprimer définitivement cet avocat ?</p>
          {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
        </DeleteConfirmContent>
      </Modal>
    </Container>
  );
};

// Styles
const Container = styled.div`
  padding: 20px;
`;

const ControlsPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
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
  }
`;

const SearchBar = styled.div`
  position: relative;
  flex-grow: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  height: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
  }
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: #757575;
`;

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const FiltersPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  height: 40px; /* Hauteur fixe pour aligner avec la case à cocher */
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
  }
`;

// Styles pour aligner la case à cocher RPC
const FilterCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  height: 40px; /* Même hauteur que les select */
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 10px;
`;

const FilterCheckboxLabel = styled.label`
  margin-left: 8px;
  font-size: 14px;
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

const TableContainer = styled.div`
  overflow-x: auto;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

const TableHead = styled.thead`
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background-color: #eeeeee;
  }
`;

const ThActions = styled.th`
  padding: 12px 16px;
  text-align: center;
  font-weight: 500;
  color: #333;
  width: 120px;
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
  color: #757575;
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid #e0e0e0;
    
    &:hover {
      background-color: #f9f9f9;
    }
    
    &.clickable-row {
      cursor: pointer;
    }
  }
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  
  .highlight {
    background-color: #ffc107;
    padding: 0 2px;
    border-radius: 2px;
  }
`;

const TdActions = styled.td`
  padding: 8px 16px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const RegionBadge = styled.span`
  display: inline-block;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const RPCTag = styled.span`
  display: inline-block;
  background-color: #ff5722;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #3f51b5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(63, 81, 181, 0.1);
  }
  
  &.delete {
    color: #f44336;
    
    &:hover {
      background-color: rgba(244, 67, 54, 0.1);
    }
  }
`;

const AddButton = styled.button`
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

const DeleteConfirmContent = styled.div`
  p {
    margin-bottom: 16px;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-top: 12px;
  font-size: 14px;
`;

const CancelButton = styled.button`
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

const DeleteButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
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

const EmptyMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #757575;
  background-color: #fff;
`;

const VillesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const VilleTag = styled.span`
  background-color: #e3f2fd;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  color: #1976d2;
  white-space: nowrap;
  
  &.more {
    background-color: #f5f5f5;
    color: #757575;
  }
  
  /* Ajoutez ces styles */
  &.highlighted {
    border: 1px solid #ffc107;
    background-color: #fff8e1;
  }
  
  .highlight {
    background-color: #ffc107;
    padding: 0 2px;
    border-radius: 2px;
  }
`;

export default Avocats;