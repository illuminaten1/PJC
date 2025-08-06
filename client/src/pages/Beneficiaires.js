import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaUserTie, FaFileExcel, FaInfoCircle, FaTable, FaFileContract, FaMoneyBillWave } from 'react-icons/fa';
import { beneficiairesAPI, parametresAPI, exportAPI } from '../utils/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors } = useTheme();
  
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
            colors={colors}
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
  const handleExportExcel = async () => {
    setExportLoading(true);
    handleCloseExportModal();
    
    try {
      // Utiliser la méthode sécurisée d'export
      await exportAPI.exportBeneficiairesExcel();
      
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
      colors={colors}
    >
      {exportLoading ? 'Export en cours...' : (
        <>
          <FaFileExcel />
          <span className="export-text-long">Exporter Excel</span>
          <span className="export-text-short">Exporter</span>
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
        <QualiteTag qualite={value} colors={colors}>{value}</QualiteTag>
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
        <DecisionContainer colors={colors}>
          <div>{value.numero || '-'}</div>
          {value.date && <DecisionDate colors={colors}>{formatDate(value.date)}</DecisionDate>}
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
        <StatusTag status={value === 'Archivé' ? 'archived' : 'active'} colors={colors}>
          {value}
        </StatusTag>
      ),
    },
  ], [colors]);
  
  // Contenu du modal d'export
  const exportModalContent = (
    <>
      <ModalHeader colors={colors}>
        <ModalTitle colors={colors}>
          <FaFileExcel /> 
          <span>Export Excel</span>
        </ModalTitle>
      </ModalHeader>
      
      <ModalBody colors={colors}>
        <InfoBox colors={colors}>
          <FaInfoCircle />
          <InfoText colors={colors}>
            Vous êtes sur le point d'exporter les données de la page dans un fichier Excel (.xlsx). 
            Le fichier contiendra trois onglets distincts avec toutes les informations associées.
            Vous pouvez choisir quelles informations exporter en appliquant des filtres sur la page.
          </InfoText>
        </InfoBox>
        
        <ExportSheets>
          <SheetInfo colors={colors}>
            <SheetIcon className="beneficiaires" colors={colors}>
              <FaTable />
            </SheetIcon>
            <SheetDetails>
              <SheetName colors={colors}>Onglet "Bénéficiaires"</SheetName>
              <SheetDescription colors={colors}>
                Liste complète des {exportCount.beneficiaires} bénéficiaires avec leurs informations associées 
                (militaire créateur de droit, numéro de décision, date, etc.)
              </SheetDescription>
            </SheetDetails>
          </SheetInfo>
          
          <SheetInfo colors={colors}>
            <SheetIcon className="conventions" colors={colors}>
              <FaFileContract />
            </SheetIcon>
            <SheetDetails>
              <SheetName colors={colors}>Onglet "Conventions"</SheetName>
              <SheetDescription colors={colors}>
                Les {exportCount.conventions} conventions d'honoraires liées aux bénéficiaires 
                (montants, pourcentages, dates d'envoi et de validation, etc.)
              </SheetDescription>
            </SheetDetails>
          </SheetInfo>
          
          <SheetInfo colors={colors}>
            <SheetIcon className="paiements" colors={colors}>
              <FaMoneyBillWave />
            </SheetIcon>
            <SheetDetails>
              <SheetName colors={colors}>Onglet "Paiements"</SheetName>
              <SheetDescription colors={colors}>
                Les {exportCount.paiements} paiements effectués pour les bénéficiaires
                (montants, dates, références, coordonnées bancaires, etc.)
              </SheetDescription>
            </SheetDetails>
          </SheetInfo>
        </ExportSheets>
      </ModalBody>
      
      <ModalFooter colors={colors}>
        <CancelButton onClick={handleCloseExportModal} colors={colors}>
          Annuler
        </CancelButton>
        <ConfirmExportButton onClick={handleExportExcel} colors={colors}>
          <FaFileExcel /> Lancer l'export
        </ConfirmExportButton>
      </ModalFooter>
    </>
  );
  
  return (
    <Container colors={colors}>
      <HeaderContainer colors={colors}>
        <TitleArea>
          <Title colors={colors}>Bénéficiaires</Title>
          <Subtitle colors={colors}>Gestion des bénéficiaires de la protection juridique complémentaire</Subtitle>
          <StatPills>
            <StatPill colors={colors}>{totalBeneficiaires} au total</StatPill>
            <StatPill className="active" colors={colors}>{activesBeneficiaires} actifs</StatPill>
            <StatPill className="archived" colors={colors}>{archivedBeneficiaires} archivés</StatPill>
          </StatPills>
        </TitleArea>
        
        {exportButton && (
          <ExportButtonContainer>
            {exportButton}
          </ExportButtonContainer>
        )}
      </HeaderContainer>
      
      <FiltersContainer colors={colors}>
        <FiltersGroup>
          <FilterLabel colors={colors}>
            <FaFilter />
            <span>Filtres:</span>
          </FilterLabel>
          
          <Select
            value={filterQualite}
            onChange={(e) => setFilterQualite(e.target.value)}
            colors={colors}
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
            colors={colors}
          >
            <option value="">Avec/sans décision</option>
            <option value="true">Avec décision</option>
            <option value="false">Sans décision</option>
          </Select>
          
          <Select
            value={filterAvocat}
            onChange={(e) => setFilterAvocat(e.target.value)}
            colors={colors}
          >
            <option value="">Avec/sans avocat</option>
            <option value="true">Avec avocat</option>
            <option value="false">Sans avocat</option>
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
          {beneficiaires.length} bénéficiaire{beneficiaires.length !== 1 ? 's' : ''} trouvé{beneficiaires.length !== 1 ? 's' : ''}
        </ResultCount>
      </FiltersContainer>
      
      {loading ? (
        <Loading colors={colors}>Chargement des bénéficiaires...</Loading>
      ) : error ? (
        <Error colors={colors}>{error}</Error>
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

const ExportButtonContainer = styled.div`
  display: flex;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    width: 100%;
    align-items: stretch;
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

const QualiteTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => {
    switch(props.qualite) {
      case 'Militaire':
        return `
          background-color: ${props.colors.successBg};
          color: ${props.colors.success};
          border: 1px solid ${props.colors.success}40;
        `;
      case 'Conjoint':
        return `
          background-color: ${props.colors.cardIcon.affaires.bg};
          color: ${props.colors.cardIcon.affaires.color};
          border: 1px solid ${props.colors.cardIcon.affaires.color}40;
        `;
      case 'Enfant':
        return `
          background-color: ${props.colors.warningBg};
          color: ${props.colors.warning};
          border: 1px solid ${props.colors.warning}40;
        `;
      case 'Parent':
        return `
          background-color: ${props.colors.cardIcon.finances.bg};
          color: ${props.colors.cardIcon.finances.color};
          border: 1px solid ${props.colors.cardIcon.finances.color}40;
        `;
      default:
        return `
          background-color: ${props.colors.surfaceHover};
          color: ${props.colors.textMuted};
          border: 1px solid ${props.colors.borderLight};
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

const DecisionContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const DecisionDate = styled.span`
  font-size: 12px;
  color: ${props => props.colors.textSecondary};
  margin-top: 2px;
  transition: color 0.3s ease;
`;

const AvocatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const AvocatBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.borderLight};
  color: ${props => props.colors.textSecondary};
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
  height: 24px;
  transition: all 0.3s ease;
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

const ExportButton = styled.button`
  background-color: ${props => props.colors.success};
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
  transition: all 0.3s ease;
  box-shadow: ${props => props.colors.shadow};
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  &:disabled {
    background-color: ${props => props.colors.successBg};
    color: ${props => props.colors.success};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    font-size: 16px;
    flex-shrink: 0;
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
    
    // Masquer le texte "Excel" sur très petits écrans
    .export-text-long {
      display: none;
    }
    
    .export-text-short {
      display: inline;
    }
    
    svg {
      font-size: 14px;
    }
  }
  
  @media (min-width: 481px) {
    .export-text-long {
      display: inline;
    }
    
    .export-text-short {
      display: none;
    }
  }
`;

const ModalHeader = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  transition: border-color 0.3s ease;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  margin: 0;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  svg {
    color: ${props => props.colors.success};
    font-size: 24px;
  }
`;

const ModalBody = styled.div`
  padding: 20px 0;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: ${props => props.colors.cardIcon.affaires.bg};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.colors.cardIcon.affaires.color}40;
  transition: all 0.3s ease;
  
  svg {
    color: ${props => props.colors.cardIcon.affaires.color};
    font-size: 18px;
    margin-right: 12px;
    margin-top: 2px;
  }
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.colors.textPrimary};
  line-height: 1.5;
  transition: color 0.3s ease;
`;

const ExportSheets = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SheetInfo = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.colors.borderLight};
  
  &:hover {
    background-color: ${props => props.colors.surface};
    border-color: ${props => props.colors.primary}40;
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
    background-color: ${props => props.colors?.primary || '#5c6bc0'};
  }
  
  &.conventions {
    background-color: ${props => props.colors?.warning || '#ffc107'};
  }
  
  &.paiements {
    background-color: ${props => props.colors?.success || '#28a745'};
  }
`;

const SheetDetails = styled.div`
  flex: 1;
`;

const SheetName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const SheetDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  line-height: 1.4;
  transition: color 0.3s ease;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.colors.borderLight};
  transition: border-color 0.3s ease;
`;

const CancelButton = styled.button`
  background-color: ${props => props.colors.surfaceHover};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background-color: ${props => props.colors.borderLight};
    border-color: ${props => props.colors.primary};
    color: ${props => props.colors.primary};
  }
`;

const ConfirmExportButton = styled.button`
  background-color: ${props => props.colors.success};
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
  transition: all 0.3s ease;
  box-shadow: ${props => props.colors.shadow};
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  svg {
    font-size: 16px;
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

export default Beneficiaires;