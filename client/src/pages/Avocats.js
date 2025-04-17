import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { avocatsAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import AvocatForm from '../components/forms/AvocatForm';

const Avocats = () => {
  const [avocats, setAvocats] = useState([]);
  const [filteredAvocats, setFilteredAvocats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAvocat, setEditingAvocat] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAvocatId, setSelectedAvocatId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  
  // État pour le tri
  const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'asc' });

  useEffect(() => {
    fetchAvocats();
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

  // Effet pour la recherche
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

  // Effet pour le tri
  useEffect(() => {
    let sortedAvocats = [...filteredAvocats];
    if (sortConfig.key) {
      sortedAvocats.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
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

  const handleOpenModal = (avocat = null) => {
    setEditingAvocat(avocat);
    setModalOpen(true);
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
        <SearchBar>
          <SearchIcon><FaSearch /></SearchIcon>
          <SearchInput
            type="text"
            placeholder="Rechercher un avocat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
        <ResultCount>
          {filteredAvocats.length} avocat{filteredAvocats.length !== 1 ? 's' : ''} trouvé{filteredAvocats.length !== 1 ? 's' : ''}
        </ResultCount>
      </ControlsPanel>

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
                  <Th onClick={() => handleSort('email')}>
                    <ThContent>
                      Email
                      <SortIcon>{getSortIcon('email')}</SortIcon>
                    </ThContent>
                  </Th>
                  <Th onClick={() => handleSort('specialisationRPC')}>
                    <ThContent>
                      Spécialisation
                      <SortIcon>{getSortIcon('specialisationRPC')}</SortIcon>
                    </ThContent>
                  </Th>
                  <ThActions>Actions</ThActions>
                </tr>
              </TableHead>
              <TableBody>
                {filteredAvocats.map((avocat) => (
                  <tr key={avocat._id}>
                    <Td>{avocat.nom}</Td>
                    <Td>{avocat.prenom}</Td>
                    <Td>
                      {avocat.email ? (
                        <AvocatEmail href={`mailto:${avocat.email}`}>
                          {avocat.email}
                        </AvocatEmail>
                      ) : (
                        'Non spécifié'
                      )}
                    </Td>
                    <Td>
                      {avocat.specialisationRPC && (
                        <RPCTag>RPC</RPCTag>
                      )}
                    </Td>
                    <TdActions>
                      <ActionButton onClick={() => handleOpenModal(avocat)} title="Modifier">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton 
                        onClick={() => openDeleteModal(avocat._id)} 
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAvocat ? "Modifier un avocat" : "Ajouter un avocat"}
        size="medium"
      >
        <AvocatForm 
          onSubmit={handleSubmit}
          initialData={editingAvocat}
          isEditing={!!editingAvocat}
        />
      </Modal>

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

const SearchBar = styled.div`
  position: relative;
  flex-grow: 1;
  max-width: 500px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: #757575;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
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
  width: 100px;
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
  }
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
`;

const TdActions = styled.td`
  padding: 8px 16px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const AvocatEmail = styled.a`
  font-size: 14px;
  color: #3f51b5;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
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

export default Avocats;