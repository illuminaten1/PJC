import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FaFilter, 
  FaDownload, 
  FaSync, 
  FaEye,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import axios from 'axios';

const LogsTab = ({ colors, showSuccessMessage, setErrorMessage }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    action: '',
    username: '',
    dateStart: '',
    dateEnd: '',
    success: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableActions, setAvailableActions] = useState([]);
  const [stats, setStats] = useState(null);

  // Charger les logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      const response = await axios.get('/api/logs', { params });
      
      if (response.data.success) {
        setLogs(response.data.data.logs);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage, setErrorMessage]);

  // Charger les actions disponibles
  const loadAvailableActions = useCallback(async () => {
    try {
      const response = await axios.get('/api/logs/actions');
      if (response.data.success) {
        setAvailableActions(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des actions:', error);
    }
  }, []);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      const params = {};
      if (filters.dateStart) params.dateStart = filters.dateStart;
      if (filters.dateEnd) params.dateEnd = filters.dateEnd;

      const response = await axios.get('/api/logs/stats', { params });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }, [filters.dateStart, filters.dateEnd]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadAvailableActions();
    loadStats();
  }, [loadAvailableActions, loadStats]);

  // Gestionnaires d'événements
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      level: '',
      action: '',
      username: '',
      dateStart: '',
      dateEnd: '',
      success: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const exportLogs = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await axios.get('/api/logs', { 
        params: { ...params, limit: 10000 }
      });
      
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.getElementById('download-link') || document.createElement('a');
      link.id = 'download-link';
      link.href = url;
      link.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccessMessage('Export des logs terminé');
    } catch (error) {
      setErrorMessage('Erreur lors de l\'export des logs');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return <FaExclamationTriangle />;
      case 'warn': return <FaExclamationTriangle />;
      case 'info': return <FaInfoCircle />;
      case 'debug': return <FaInfoCircle />;
      default: return <FaInfoCircle />;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <LoadingContainer colors={colors}>
        Chargement des logs...
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title colors={colors}>Journal des Actions</Title>
        <HeaderActions>
          <ActionButton
            onClick={() => setShowFilters(!showFilters)}
            colors={colors}
            active={showFilters}
          >
            <FaFilter /> Filtres
          </ActionButton>
          <ActionButton onClick={loadLogs} colors={colors} disabled={loading}>
            <FaSync /> Actualiser
          </ActionButton>
          <ActionButton onClick={exportLogs} colors={colors}>
            <FaDownload /> Exporter
          </ActionButton>
        </HeaderActions>
      </Header>

      {/* Statistiques rapides */}
      {stats && (
        <StatsContainer>
          <StatCard colors={colors}>
            <StatValue colors={colors}>{stats.summary.totalLogs}</StatValue>
            <StatLabel colors={colors}>Total des logs</StatLabel>
          </StatCard>
          <StatCard colors={colors}>
            <StatValue colors={colors} style={{ color: '#e74c3c' }}>
              {stats.recentErrors?.length || 0}
            </StatValue>
            <StatLabel colors={colors}>Erreurs récentes (24h)</StatLabel>
          </StatCard>
          <StatCard colors={colors}>
            <StatValue colors={colors} style={{ color: '#27ae60' }}>
              {stats.charts.byLevel?.find(l => l._id === 'info')?.count || 0}
            </StatValue>
            <StatLabel colors={colors}>Actions réussies</StatLabel>
          </StatCard>
        </StatsContainer>
      )}

      {/* Filtres */}
      {showFilters && (
        <FiltersContainer colors={colors}>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel colors={colors}>Recherche</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Rechercher dans les détails..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                colors={colors}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel colors={colors}>Niveau</FilterLabel>
              <FilterSelect
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                colors={colors}
              >
                <option value="">Tous</option>
                <option value="info">Info</option>
                <option value="warn">Avertissement</option>
                <option value="error">Erreur</option>
                <option value="debug">Debug</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel colors={colors}>Action</FilterLabel>
              <FilterSelect
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                colors={colors}
              >
                <option value="">Toutes</option>
                {availableActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel colors={colors}>Utilisateur</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Nom d'utilisateur..."
                value={filters.username}
                onChange={(e) => handleFilterChange('username', e.target.value)}
                colors={colors}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel colors={colors}>Date de début</FilterLabel>
              <FilterInput
                type="date"
                value={filters.dateStart}
                onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                colors={colors}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel colors={colors}>Date de fin</FilterLabel>
              <FilterInput
                type="date"
                value={filters.dateEnd}
                onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                colors={colors}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel colors={colors}>Statut</FilterLabel>
              <FilterSelect
                value={filters.success}
                onChange={(e) => handleFilterChange('success', e.target.value)}
                colors={colors}
              >
                <option value="">Tous</option>
                <option value="true">Succès</option>
                <option value="false">Échec</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <ResetButton onClick={resetFilters} colors={colors}>
                <FaTimes /> Réinitialiser
              </ResetButton>
            </FilterGroup>
          </FiltersGrid>
        </FiltersContainer>
      )}

      {/* Liste des logs */}
      <LogsContainer colors={colors}>
        {logs.length === 0 ? (
          <EmptyMessage colors={colors}>Aucun log trouvé</EmptyMessage>
        ) : (
          <LogsList>
            {logs.map(log => (
              <LogItem key={log._id} colors={colors} success={log.success}>
                <LogHeader>
                  <LogLevel colors={colors} level={log.level}>
                    {getLevelIcon(log.level)}
                    <span>{log.level.toUpperCase()}</span>
                  </LogLevel>
                  <LogAction colors={colors}>{log.action || log.metadata?.action}</LogAction>
                  <LogTime colors={colors}>{formatDate(log.timestamp)}</LogTime>
                </LogHeader>
                
                <LogBody>
                  <LogUser colors={colors}>
                    {log.username || log.metadata?.username || 'Système'} 
                    {(log.userRole || log.metadata?.userRole) && 
                      <span> ({log.userRole || log.metadata?.userRole})</span>
                    }
                  </LogUser>
                  {(log.resourceName || log.metadata?.resourceName) && (
                    <LogResource colors={colors}>
                      → {log.resourceType || log.metadata?.resourceType}: {log.resourceName || log.metadata?.resourceName}
                    </LogResource>
                  )}
                  {(log.error || log.metadata?.error) && (
                    <LogError colors={colors}>
                      Erreur: {log.error?.message || log.metadata?.error?.message}
                    </LogError>
                  )}
                  {((log.details && typeof log.details === 'object') || 
                    (log.metadata?.details && typeof log.metadata.details === 'object')) && (
                    <LogDetails colors={colors}>
                      {Object.entries(log.details || log.metadata?.details || {}).map(([key, value]) => (
                        <span key={key}>{key}: {String(value)}</span>
                      ))}
                    </LogDetails>
                  )}
                </LogBody>

                <LogFooter>
                  {(log.ipAddress || log.metadata?.ipAddress) && (
                    <LogIP colors={colors}>IP: {log.ipAddress || log.metadata?.ipAddress}</LogIP>
                  )}
                  {(log.duration || log.metadata?.duration) && (
                    <LogDuration colors={colors}>
                      Durée: {log.duration || log.metadata?.duration}ms
                    </LogDuration>
                  )}
                  <ViewButton
                    onClick={() => setSelectedLog(log)}
                    colors={colors}
                  >
                    <FaEye /> Détails
                  </ViewButton>
                </LogFooter>
              </LogItem>
            ))}
          </LogsList>
        )}
      </LogsContainer>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationContainer colors={colors}>
          <PaginationInfo colors={colors}>
            {pagination.totalItems} logs trouvés - Page {pagination.currentPage} sur {pagination.totalPages}
          </PaginationInfo>
          <PaginationButtons>
            <PaginationButton
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              colors={colors}
            >
              <FaChevronLeft /> Précédent
            </PaginationButton>
            <PaginationButton
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              colors={colors}
            >
              Suivant <FaChevronRight />
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      )}

      {/* Modal de détails */}
      {selectedLog && (
        <Modal colors={colors} onClick={() => setSelectedLog(null)}>
          <ModalContent colors={colors} onClick={(e) => e.stopPropagation()}>
            <ModalHeader colors={colors}>
              <h3>Détails du log</h3>
              <CloseButton onClick={() => setSelectedLog(null)} colors={colors}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalBody colors={colors}>
              <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const Title = styled.h2`
  color: ${props => props.colors.textPrimary};
  margin: 0;
  font-size: 24px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${props => props.colors.border};
  background-color: ${props => props.active ? props.colors.primary : props.colors.surface};
  color: ${props => props.active ? '#fff' : props.colors.textPrimary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${props => props.colors.primary};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${props => props.colors.primary};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: ${props => props.colors.textMuted};
  font-size: 14px;
`;

const FiltersContainer = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 20px;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
  }
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${props => props.colors.border};
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  height: fit-content;

  &:hover {
    background-color: ${props => props.colors.surfaceHover};
  }
`;

const LogsContainer = styled.div`
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const EmptyMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textMuted};
`;

const LogsList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const LogItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.colors.border};
  background-color: ${props => props.success === false ? 'rgba(231, 76, 60, 0.05)' : 'transparent'};
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${props => props.colors.surfaceHover};
  }
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const LogLevel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => {
    switch (props.level) {
      case 'error': return '#e74c3c';
      case 'warn': return '#f39c12';
      case 'info': return '#3498db';
      case 'debug': return '#95a5a6';
      default: return props.colors.textPrimary;
    }
  }};
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
`;

const LogAction = styled.div`
  color: ${props => props.colors.textPrimary};
  font-weight: 500;
  font-size: 14px;
`;

const LogTime = styled.div`
  color: ${props => props.colors.textMuted};
  font-size: 12px;
  margin-left: auto;
`;

const LogBody = styled.div`
  margin-bottom: 12px;
`;

const LogUser = styled.div`
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  margin-bottom: 4px;

  span {
    color: ${props => props.colors.textMuted};
    font-size: 12px;
  }
`;

const LogResource = styled.div`
  color: ${props => props.colors.textMuted};
  font-size: 13px;
  margin-bottom: 4px;
`;

const LogError = styled.div`
  color: #e74c3c;
  font-size: 13px;
  margin-bottom: 4px;
  font-style: italic;
`;

const LogDetails = styled.div`
  color: ${props => props.colors.textMuted};
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  span {
    background-color: ${props => props.colors.surfaceHover};
    padding: 2px 8px;
    border-radius: 12px;
  }
`;

const LogFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const LogIP = styled.div`
  color: ${props => props.colors.textMuted};
  font-size: 11px;
  font-family: monospace;
`;

const LogDuration = styled.div`
  color: ${props => props.colors.textMuted};
  font-size: 11px;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid ${props => props.colors.border};
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  margin-left: auto;

  &:hover {
    background-color: ${props => props.colors.primary};
    color: white;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 12px;
`;

const PaginationInfo = styled.div`
  color: ${props => props.colors.textMuted};
  font-size: 14px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${props => props.colors.border};
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover:not(:disabled) {
    background-color: ${props => props.colors.primary};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  max-width: 800px;
  max-height: 80vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${props => props.colors.border};

  h3 {
    margin: 0;
    color: ${props => props.colors.textPrimary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.colors.textMuted};
  cursor: pointer;
  font-size: 18px;
  padding: 4px;

  &:hover {
    color: ${props => props.colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;

  pre {
    background-color: ${props => props.colors.surfaceHover};
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    color: ${props => props.colors.textPrimary};
    margin: 0;
    white-space: pre-wrap;
  }
`;

export default LogsTab;