import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaUserTie, FaFileExcel, FaInfoCircle, FaTable, FaFileContract, FaMoneyBillWave } from 'react-icons/fa';
import { beneficiairesAPI, parametresAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

const BeneficiairesCounter = ({ total, actifs, archived }) => {
  return (
    <CounterContainer>
      <CounterItem>
        <CounterValue>{total}</CounterValue>
        <CounterLabel>Total</CounterLabel>
      </CounterItem>
      <CounterDivider />
      <CounterItem>
        <CounterValue>{actifs}</CounterValue>
        <CounterLabel>Actifs</CounterLabel>
      </CounterItem>
      <CounterDivider />
      <CounterItem>
        <CounterValue>{archived}</CounterValue>
        <CounterLabel>Archivés</CounterLabel>
      </CounterItem>
    </CounterContainer>
  );
};

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
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCount, setExportCount] = useState({
    beneficiaires: 0,
    conventions: 0,
    paiements: 0
  });
  const [totalBeneficiaires, setTotalBeneficiaires] = useState(0);
  const [activesBeneficiaires, setActivesBeneficiaires] = useState(0);
  const [archivedBeneficiaires, setArchivedBeneficiaires] = useState(0);

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
      
      // Récupération des bénéficiaires filtrés
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
      
      // Si aucun filtre substantiel n'est appliqué, utilisez cette réponse pour les compteurs
      const noSubstantialFilters = !searchTerm && !filterQualite && !filterRedacteur && 
                                  !filterDecision && !filterAvocat && filterArchive === '';
      
      if (noSubstantialFilters) {
        const allBeneficiaires = response.data;
        setTotalBeneficiaires(allBeneficiaires.length);
        setActivesBeneficiaires(allBeneficiaires.filter(b => !b.archive).length);
        setArchivedBeneficiaires(allBeneficiaires.filter(b => b.archive).length);
      } else {
        // Sinon, faites une requête supplémentaire pour les statistiques globales
        const statsResponse = await beneficiairesAPI.getAll({});
        const allBeneficiaires = statsResponse.data;
        setTotalBeneficiaires(allBeneficiaires.length);
        setActivesBeneficiaires(allBeneficiaires.filter(b => !b.archive).length);
        setArchivedBeneficiaires(allBeneficiaires.filter(b => b.archive).length);
      }
      
      // Calculer les statistiques pour l'export
      let conventionsCount = 0;
      let paiementsCount = 0;
      
      filteredData.forEach(b => {
        if (b.conventions) conventionsCount += b.conventions.length;
        if (b.paiements) paiementsCount += b.paiements.length;
      });
      
      setExportCount({
        beneficiaires: filteredData.length,
        conventions: conventionsCount,
        paiements: paiementsCount
      });
      
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
  
  // Fonction pour ouvrir le modal d'export
  const handleOpenExportModal = () => {
    setShowExportModal(true);
  };
  
  // Fonction pour fermer le modal d'export
  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };
  
  // Fonction pour exporter les données en Excel
  const handleExportExcel = () => {
    setExportLoading(true);
    handleCloseExportModal();
    
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      
      // Rediriger vers l'URL d'export avec le token
      window.location.href = `/api/export/beneficiaires?token=${token}`;
      
      // Réinitialiser l'état après un délai pour permettre le téléchargement
      setTimeout(() => {
        setExportLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de l'export Excel", err);
      setExportLoading(false);
    }
  };
  
  // Bouton d'export Excel
  const exportButton = (
    <ExportButton 
      onClick={handleOpenExportModal} 
      disabled={exportLoading}
      title="Exporter les données en Excel (XLSX)"
    >
      {exportLoading ? 'Export en cours...' : (
        <>
          <FaFileExcel /> Exporter Excel
        </>
      )}
    </ExportButton>
  );
  
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
  
  // Contenu du modal d'export
  const exportModalContent = (
    <>
      <ModalHeader>
        <ModalTitle>
          <FaFileExcel /> 
          <span>Export Excel</span>
        </ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <InfoBox>
          <FaInfoCircle />
          <InfoText>
            Vous êtes sur le point d'exporter les données suivantes dans un fichier Excel (.xlsx). 
            Le fichier contiendra trois onglets distincts avec toutes les informations associées.
          </InfoText>
        </InfoBox>
        
        <ExportSheets>
          <SheetInfo>
            <SheetIcon className="beneficiaires">
              <FaTable />
            </SheetIcon>
            <SheetDetails>
              <SheetName>Onglet "Bénéficiaires"</SheetName>
              <SheetDescription>
                Liste complète des {exportCount.beneficiaires} bénéficiaires avec leurs informations associées 
                (militaire créateur de droit, numéro de décision, date, etc.)
              </SheetDescription>
            </SheetDetails>
          </SheetInfo>
          
          <SheetInfo>
            <SheetIcon className="conventions">
              <FaFileContract />
            </SheetIcon>
            <SheetDetails>
              <SheetName>Onglet "Conventions"</SheetName>
              <SheetDescription>
                Toutes les {exportCount.conventions} conventions d'honoraires liées aux bénéficiaires 
                (montants, pourcentages, dates d'envoi et de validation, etc.)
              </SheetDescription>
            </SheetDetails>
          </SheetInfo>
          
          <SheetInfo>
            <SheetIcon className="paiements">
              <FaMoneyBillWave />
            </SheetIcon>
            <SheetDetails>
              <SheetName>Onglet "Paiements"</SheetName>
              <SheetDescription>
                Tous les {exportCount.paiements} paiements effectués pour les bénéficiaires
                (montants, dates, références, coordonnées bancaires, etc.)
              </SheetDescription>
            </SheetDetails>
          </SheetInfo>
        </ExportSheets>
      </ModalBody>
      
      <ModalFooter>
        <CancelButton onClick={handleCloseExportModal}>
          Annuler
        </CancelButton>
        <ConfirmExportButton onClick={handleExportExcel}>
          <FaFileExcel /> Lancer l'export
        </ConfirmExportButton>
      </ModalFooter>
    </>
  );
  
  return (
    <Container>
      <PageHeader 
        title="Bénéficiaires" 
        subtitle="Gestion des bénéficiaires de la protection juridique complémentaire"
        actionButton={exportButton}
      />

    <BeneficiairesCounter 
      total={totalBeneficiaires} 
      actifs={activesBeneficiaires} 
      archived={archivedBeneficiaires} 
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
      
      {/* Modal d'export Excel */}
      <Modal
        isOpen={showExportModal}
        onClose={handleCloseExportModal}
        width="600px"
      >
        {exportModalContent}
      </Modal>
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

// Nouveau composant pour le bouton d'export Excel
const ExportButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #388e3c;
  }
  
  &:disabled {
    background-color: #a5d6a7;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 16px;
  }
`;

// Styles pour le modal d'export
const ModalHeader = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  margin: 0;
  color: #333;
  
  svg {
    color: #4caf50;
    font-size: 24px;
  }
`;

const ModalBody = styled.div`
  padding: 20px 0;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: #e3f2fd;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  
  svg {
    color: #1976d2;
    font-size: 18px;
    margin-right: 12px;
    margin-top: 2px;
  }
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
`;

const ExportSheets = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SheetInfo = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 16px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const SheetIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 16px;
  
  svg {
    font-size: 20px;
    color: white;
  }
  
  &.beneficiaires {
    background-color: #3f51b5;
  }
  
  &.conventions {
    background-color: #f57c00;
  }
  
  &.paiements {
    background-color: #4caf50;
  }
`;

const SheetDetails = styled.div`
  flex: 1;
`;

const SheetName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
`;

const SheetDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const CancelButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ConfirmExportButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #388e3c;
  }
  
  svg {
    font-size: 16px;
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

export default Beneficiaires;