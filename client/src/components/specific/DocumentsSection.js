import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaFile, FaFilePdf, FaFileAlt, FaEnvelope, FaDownload, FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ExpandableSection from '../common/ExpandableSection';
import Modal from '../common/Modal';
import api, { fichiersAPI } from '../../utils/api';
import EmailPreview from './EmailPreview';
import { useTheme } from '../../contexts/ThemeContext';

const DocumentsSection = ({ beneficiaireId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  
  const fileInputRef = useRef(null);
  const { colors } = useTheme();

  useEffect(() => {
    if (beneficiaireId) {
      loadFiles();
    }
  }, [beneficiaireId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fichiersAPI.getByBeneficiaire(beneficiaireId);
      console.log('Fichiers chargés:', response.data);
      
      // Vérifiez si chaque fichier a un _id et un contentType
      response.data.forEach(file => {
        console.log(`Fichier ${file.originalname}:`, {
          _id: file._id,
          fileId: file.fileId,
          contentType: file.contentType
        });
      });
      
      setFiles(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des fichiers:', err);
      setError('Impossible de charger les fichiers. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Vérifier le type MIME du fichier
    const acceptedTypes = [
      'application/pdf', 
      'application/vnd.oasis.opendocument.text', 
      'message/rfc822',
      'application/odt',
      'message/eml'
    ];
    
    if (!acceptedTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Seuls les fichiers PDF, ODT et EML sont acceptés.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      
      console.log('Uploading file to beneficiaire ID:', beneficiaireId);
      
      const response = await fichiersAPI.upload(beneficiaireId, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      console.log('Fichier uploadé avec succès:', response.data);
      
      // Réinitialiser
      setDescription('');
      setUploadProgress(0);
      
      // Recharger la liste des fichiers
      loadFiles();
    } catch (err) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      setError(`Erreur lors du téléchargement: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditDescription = (file, e) => {
    e.stopPropagation();
    setEditingFile(file);
    setEditDescription(file.description || '');
  };

  const saveDescription = async () => {
    try {
      await fichiersAPI.updateDescription(editingFile._id, editDescription);
      
      // Mettre à jour l'affichage localement pour éviter un rechargement
      setFiles(files.map(file => 
        file._id === editingFile._id 
          ? { ...file, description: editDescription } 
          : file
      ));
      
      // Fermer le mode édition
      setEditingFile(null);
      setEditDescription('');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la description:', err);
      setError('Impossible de mettre à jour la description');
    }
  };

  const handleFileClick = (file) => {
    console.log("Fichier sélectionné pour prévisualisation:", file);
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleDownload = (fileId, e) => {
    console.log("Téléchargement du fichier ID:", fileId);
    if (e) e.stopPropagation(); // Vérifiez si e existe avant d'appeler stopPropagation
    try {
      window.open(`/api/fichiers/download/${fileId}`, '_blank');
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Impossible de télécharger le fichier');
    }
  };

  const handleDelete = async (fileId, e) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        await fichiersAPI.delete(fileId);
        console.log('Fichier supprimé avec succès');
        loadFiles();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Impossible de supprimer le fichier');
      }
    }
  };

  const getFileIcon = (contentType) => {
    switch (contentType) {
      case 'application/pdf':
        return <FaFilePdf color={colors.error} />;
      case 'application/vnd.oasis.opendocument.text':
      case 'application/odt':
        return <FaFileAlt color={colors.cardIcon.affaires.color} />;
      case 'message/rfc822':
      case 'message/eml':
        return <FaEnvelope color={colors.success} />;
      default:
        return <FaFile color={colors.textMuted} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getPreviewUrl = (fileId) => {
    return `/api/fichiers/preview/${fileId}`;
  };

  return (
    <ExpandableSection title="Documents" defaultExpanded={true}>
      <FileUploadArea 
        className={dragActive ? 'drag-active' : ''} 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        colors={colors}
        dragActive={dragActive}
      >
        <UploadIcon colors={colors}>
          <FaPlus />
        </UploadIcon>
        <UploadText colors={colors}>
          Glissez-déposez un fichier ici ou cliquez pour sélectionner
          <UploadSubtext colors={colors}>
            Formats acceptés: PDF, ODT, EML
          </UploadSubtext>
        </UploadText>
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept=".pdf,.odt,.eml,application/pdf,application/vnd.oasis.opendocument.text,message/rfc822"
        />
        <UploadForm>
          <DescriptionInput
            type="text"
            placeholder="Description (optionnelle)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            colors={colors}
          />
        </UploadForm>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <ProgressContainer>
            <ProgressBar value={uploadProgress} max="100" colors={colors} />
            <ProgressText colors={colors}>{uploadProgress}%</ProgressText>
          </ProgressContainer>
        )}
      </FileUploadArea>
      
      {error && <ErrorMessage colors={colors}>{error}</ErrorMessage>}
      
      <FileList colors={colors}>
        {loading ? (
          <LoadingMessage colors={colors}>Chargement des fichiers...</LoadingMessage>
        ) : files.length === 0 ? (
          <EmptyState colors={colors}>
            <EmptyIcon colors={colors}>
              <FaFile />
            </EmptyIcon>
            <EmptyText colors={colors}>Aucun document disponible</EmptyText>
          </EmptyState>
        ) : (
          files.map((file) => (
            <FileItem key={file._id} onClick={() => handleFileClick(file)} colors={colors}>
              <FileIcon>{getFileIcon(file.contentType)}</FileIcon>
              <FileInfo>
                <FileName colors={colors}>{file.originalname}</FileName>
                <FileDetails colors={colors}>
                  {file.description && `${file.description} - `}
                  {formatFileSize(file.size)} - Ajouté le {format(new Date(file.uploadDate), 'dd MMMM yyyy', { locale: fr })}
                </FileDetails>
              </FileInfo>
              <FileActions>
                <ActionButton onClick={(e) => handleEditDescription(file, e)} title="Modifier la description" colors={colors}>
                  <FaEdit />
                </ActionButton>
                <ActionButton onClick={(e) => handleDownload(file._id, e)} title="Télécharger" colors={colors}>
                  <FaDownload />
                </ActionButton>
                <ActionButton danger onClick={(e) => handleDelete(file._id, e)} title="Supprimer" colors={colors}>
                  <FaTrash />
                </ActionButton>
              </FileActions>
            </FileItem>
          ))
        )}
      </FileList>
      
      {selectedFile && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={selectedFile.originalname}
          size="fullscreen"
          headerContent={
            <HeaderActions>
              <ActionButton onClick={(e) => handleDownload(selectedFile._id, e)} title="Télécharger" colors={colors}>
                <FaDownload /> Télécharger
              </ActionButton>
            </HeaderActions>
          }
          noPadding={true}
          isPreview={true}
        >
          <PreviewContainer colors={colors}>
          {selectedFile.contentType === 'application/pdf' ? (
            <IframeContainer>
              <iframe
                src={`/api/fichiers/preview/${selectedFile._id}`}
                title={`Aperçu de ${selectedFile.originalname}`}
              />
            </IframeContainer>
          ) : selectedFile.contentType === 'message/rfc822' || selectedFile.contentType === 'message/eml' ? (
            <EmailPreview fileId={selectedFile._id} />
            ) : selectedFile.contentType === 'application/vnd.oasis.opendocument.text' || selectedFile.contentType === 'application/odt' ? (
              <OdtPreview colors={colors}>
                <OdtIcon colors={colors}>
                  <FaFileAlt />
                </OdtIcon>
                <OdtTitle colors={colors}>Aperçu ODT</OdtTitle>
                <OdtDescription colors={colors}>
                  La prévisualisation des fichiers ODT n'est pas disponible directement dans le navigateur.
                </OdtDescription>
                <OdtButton 
                  onClick={(e) => handleDownload(selectedFile._id, e)}
                  colors={colors}
                >
                  <FaDownload style={{ marginRight: '5px' }} /> Télécharger le fichier
                </OdtButton>
              </OdtPreview>
            ) : (
              <NoPreview colors={colors}>Impossible de prévisualiser ce type de fichier</NoPreview>
            )}
          </PreviewContainer>
        </Modal>
      )}

      {/* Modal d'édition de description */}
      {editingFile && (
        <Modal
          isOpen={!!editingFile}
          onClose={() => setEditingFile(null)}
          title="Modifier la description"
          size="small"
          actions={
            <>
              <CancelButton 
                onClick={() => setEditingFile(null)}
                colors={colors}
              >
                Annuler
              </CancelButton>
              <SaveButton 
                onClick={saveDescription}
                colors={colors}
              >
                Enregistrer
              </SaveButton>
            </>
          }
        >
          <EditForm colors={colors}>
            <EditLabel colors={colors} htmlFor="description">Description</EditLabel>
            <EditTextarea
              id="description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Saisissez une description pour ce fichier..."
              colors={colors}
            />
          </EditForm>
        </Modal>
      )}
    </ExpandableSection>
  );
};

// Styled Components avec thématisation
const FileUploadArea = styled.div`
  border: 2px dashed ${props => props.dragActive ? props.colors.primary : props.colors.border};
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.dragActive ? props.colors.primary + '20' : props.colors.surface};
  
  &:hover {
    border-color: ${props => props.colors.primary};
    background-color: ${props => props.colors.primary}20;
  }
`;

const UploadIcon = styled.div`
  font-size: 24px;
  margin-bottom: 10px;
  color: ${props => props.colors.primary};
  transition: color 0.3s ease;
`;

const UploadText = styled.div`
  color: ${props => props.colors.textPrimary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const UploadSubtext = styled.div`
  font-size: 12px;
  margin-top: 5px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadForm = styled.div`
  margin-top: 20px;
`;

const DescriptionInput = styled.input`
  padding: 8px;
  width: 100%;
  max-width: 300px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid ${props => props.colors.border};
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

const ProgressContainer = styled.div`
  margin-top: 10px;
  width: 100%;
`;

const ProgressBar = styled.progress`
  width: 100%;
  max-width: 300px;
  
  &::-webkit-progress-bar {
    background-color: ${props => props.colors.surfaceHover};
    border-radius: 4px;
  }
  
  &::-webkit-progress-value {
    background-color: ${props => props.colors.primary};
    border-radius: 4px;
  }
`;

const ProgressText = styled.div`
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  margin-top: 4px;
  transition: color 0.3s ease;
`;

const ErrorMessage = styled.div`
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  border: 1px solid ${props => props.colors.error}40;
  transition: all 0.3s ease;
`;

const FileList = styled.div`
  margin-top: 20px;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  transition: background-color 0.3s ease;
`;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const FileIcon = styled.div`
  margin-right: 15px;
  font-size: 24px;
`;

const FileInfo = styled.div`
  flex-grow: 1;
  cursor: pointer;
`;

const FileName = styled.div`
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const FileDetails = styled.div`
  font-size: 12px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const FileActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.danger ? props.colors.error : props.colors.primary};
  font-size: 16px;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background-color: ${props => props.danger ? props.colors.error + '20' : props.colors.primary + '20'};
    transform: scale(1.1);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  transition: background-color 0.3s ease;
`;

const EmptyIcon = styled.div`
  font-size: 32px;
  opacity: 0.5;
  margin-bottom: 10px;
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
`;

const EmptyText = styled.div`
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  flex: 1;
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const OdtPreview = styled.div`
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
`;

const OdtIcon = styled.div`
  font-size: 48px;
  color: ${props => props.colors.cardIcon.affaires.color};
  margin-bottom: 20px;
  transition: color 0.3s ease;
`;

const OdtTitle = styled.h3`
  color: ${props => props.colors.textPrimary};
  margin-bottom: 16px;
  transition: color 0.3s ease;
`;

const OdtDescription = styled.p`
  color: ${props => props.colors.textSecondary};
  margin-bottom: 20px;
  transition: color 0.3s ease;
`;

const OdtButton = styled.button`
  padding: 10px 15px;
  background: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const NoPreview = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
`;

const EditForm = styled.div`
  padding: 16px 0;
`;

const EditLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${props => props.colors.textPrimary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  padding: 8px;
  min-height: 100px;
  border-radius: 4px;
  border: 1px solid ${props => props.colors.border};
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  resize: vertical;
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

const CancelButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.colors.surfaceHover};
    border-color: ${props => props.colors.primary};
  }
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

export default DocumentsSection;