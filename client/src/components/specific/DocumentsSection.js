import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaFile, FaFilePdf, FaFileAlt, FaEnvelope, FaDownload, FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ExpandableSection from '../common/ExpandableSection';
import Modal from '../common/Modal';
import api, { fichiersAPI } from '../../utils/api';
import EmailPreview from './EmailPreview';

const FileUploadArea = styled.div`
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover, &.drag-active {
    border-color: #0056b3;
    background-color: rgba(0, 86, 179, 0.05);
  }
`;

const FileList = styled.div`
  margin-top: 20px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const FileIcon = styled.div`
  margin-right: 15px;
  font-size: 24px;
  color: ${props => props.color || '#666'};
`;

const FileInfo = styled.div`
  flex-grow: 1;
  cursor: pointer;
`;

const FileName = styled.div`
  font-weight: 500;
`;

const FileDetails = styled.div`
  font-size: 12px;
  color: #666;
`;

const FileActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  padding: 5px;
  
  &:hover {
    color: ${props => props.danger ? '#dc3545' : '#0056b3'};
  }
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: 80vh;
  margin-top: 10px;
  border: 1px solid #ddd;
  overflow: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const UploadForm = styled.div`
  margin-top: 20px;
`;

const FileInput = styled.input`
  display: none;
`;

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
      // Utiliser directement l'URL absolue
      window.open(`http://localhost:5002/api/fichiers/download/${fileId}`, '_blank');
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
        return <FaFilePdf color="#e74c3c" />;
      case 'application/vnd.oasis.opendocument.text':
      case 'application/odt':
        return <FaFileAlt color="#3498db" />;
      case 'message/rfc822':
      case 'message/eml':
        return <FaEnvelope color="#2ecc71" />;
      default:
        return <FaFile color="#95a5a6" />;
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
      >
        <FaPlus style={{ fontSize: '24px', marginBottom: '10px' }} />
        <div>
          Glissez-déposez un fichier ici ou cliquez pour sélectionner
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Formats acceptés: PDF, ODT, EML
          </div>
        </div>
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept=".pdf,.odt,.eml,application/pdf,application/vnd.oasis.opendocument.text,message/rfc822"
        />
        <UploadForm>
          <input
            type="text"
            placeholder="Description (optionnelle)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '8px', width: '100%', maxWidth: '300px', marginTop: '10px' }}
          />
        </UploadForm>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{ marginTop: '10px', width: '100%' }}>
            <progress value={uploadProgress} max="100" style={{ width: '100%', maxWidth: '300px' }} />
            <div>{uploadProgress}%</div>
          </div>
        )}
      </FileUploadArea>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <FileList>
        {loading ? (
          <div>Chargement des fichiers...</div>
        ) : files.length === 0 ? (
          <EmptyState>
            <FaFile style={{ fontSize: '32px', opacity: 0.5, marginBottom: '10px' }} />
            <div>Aucun document disponible</div>
          </EmptyState>
        ) : (
          files.map((file) => (
            <FileItem key={file._id} onClick={() => handleFileClick(file)}>
              <FileIcon>{getFileIcon(file.contentType)}</FileIcon>
              <FileInfo>
                <FileName>{file.originalname}</FileName>
                <FileDetails>
                  {file.description && `${file.description} - `}
                  {formatFileSize(file.size)} - Ajouté le {format(new Date(file.uploadDate), 'dd MMMM yyyy', { locale: fr })}
                </FileDetails>
              </FileInfo>
              <FileActions>
                <ActionButton onClick={(e) => handleEditDescription(file, e)} title="Modifier la description">
                  <FaEdit />
                </ActionButton>
                <ActionButton onClick={(e) => handleDownload(file._id, e)} title="Télécharger">
                  <FaDownload />
                </ActionButton>
                <ActionButton danger onClick={(e) => handleDelete(file._id, e)} title="Supprimer">
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <ActionButton onClick={() => handleDownload(selectedFile._id)} title="Télécharger">
                <FaDownload /> Télécharger
              </ActionButton>
            </div>
          }
        >
          <PreviewContainer>
            {selectedFile.contentType === 'application/pdf' ? (
              <iframe
                src={`http://localhost:5002/api/fichiers/preview/${selectedFile._id}`}
                width="100%"
                height="100%"
                title={`Aperçu de ${selectedFile.originalname}`}
                style={{ border: 'none' }}
              />
            ) : selectedFile.contentType === 'message/rfc822' || selectedFile.contentType === 'message/eml' ? (
              <EmailPreview fileId={selectedFile._id} />
            ) : selectedFile.contentType === 'application/vnd.oasis.opendocument.text' || selectedFile.contentType === 'application/odt' ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <FaFileAlt style={{ fontSize: '48px', color: '#3498db', marginBottom: '20px' }} />
                <h3>Aperçu ODT</h3>
                <p>La prévisualisation des fichiers ODT n'est pas disponible directement dans le navigateur.</p>
                <p>
                  <button 
                    onClick={() => handleDownload(selectedFile._id)}
                    style={{ padding: '10px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <FaDownload style={{ marginRight: '5px' }} /> Télécharger le fichier
                  </button>
                </p>
              </div>
            ) : (
              <div>Impossible de prévisualiser ce type de fichier</div>
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
              <button 
                onClick={() => setEditingFile(null)}
                style={{ padding: '8px 16px', background: '#f5f5f5', border: 'none', borderRadius: '4px', marginRight: '8px', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={saveDescription}
                style={{ padding: '8px 16px', background: '#3f51b5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Enregistrer
              </button>
            </>
          }
        >
          <div style={{ padding: '16px 0' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <textarea
              id="description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              style={{ width: '100%', padding: '8px', minHeight: '100px', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="Saisissez une description pour ce fichier..."
            />
          </div>
        </Modal>
      )}
    </ExpandableSection>
  );
};

export default DocumentsSection;