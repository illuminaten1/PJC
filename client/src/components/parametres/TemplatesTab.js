import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaDownload, FaUpload, FaUndo } from 'react-icons/fa';
import { templatesAPI } from '../../utils/api';
import Modal from '../common/Modal';

const TemplatesTab = ({ showSuccessMessage, setErrorMessage, colors }) => {
  const [templates, setTemplates] = useState({
    convention: { name: 'Convention d\'honoraires', filename: 'convention_template.docx', status: 'default' },
    reglement: { name: 'Fiche de règlement', filename: 'reglement_template.docx', status: 'default' }
  });
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateRestoreModalOpen, setTemplateRestoreModalOpen] = useState(false);
  const [templateToRestore, setTemplateToRestore] = useState('');
  
  const conventionInputRef = useRef(null);
  const reglementInputRef = useRef(null);

  useEffect(() => {
    fetchTemplatesStatus();
  }, []);

  const fetchTemplatesStatus = async () => {
    try {
      const response = await templatesAPI.getStatus();
      setTemplates(prevTemplates => ({
        ...prevTemplates,
        convention: { 
          ...prevTemplates.convention, 
          status: response.data.convention || 'default' 
        },
        reglement: { 
          ...prevTemplates.reglement, 
          status: response.data.reglement || 'default' 
        }
      }));
    } catch (err) {
      console.error("Erreur lors de la récupération du statut des templates", err);
    }
  };

  const handleDownloadTemplate = async (templateType) => {
    setTemplateLoading(true);
    try {
      const response = await templatesAPI.downloadTemplate(templateType);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', templates[templateType].filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccessMessage(`Template ${templates[templateType].name} téléchargé avec succès`);
    } catch (err) {
      console.error(`Erreur lors du téléchargement du template ${templateType}:`, err);
      setErrorMessage(`Impossible de télécharger le template ${templates[templateType].name}`);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleUploadTemplate = async (event, templateType) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'docx') {
      setErrorMessage(`Le fichier doit être au format DOCX (.docx)`);
      return;
    }
    
    setTemplateLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('template', file);
      
      await templatesAPI.uploadTemplate(templateType, formData);
      
      setTemplates(prevTemplates => ({
        ...prevTemplates,
        [templateType]: {
          ...prevTemplates[templateType],
          status: 'custom'
        }
      }));
      
      showSuccessMessage(`Template ${templates[templateType].name} mis à jour avec succès`);
    } catch (err) {
      console.error(`Erreur lors de l'upload du template ${templateType}:`, err);
      setErrorMessage(`Impossible d'uploader le template ${templates[templateType].name}: ${err.response?.data?.message || err.message}`);
    } finally {
      setTemplateLoading(false);
      if (templateType === 'convention' && conventionInputRef.current) {
        conventionInputRef.current.value = '';
      } else if (templateType === 'reglement' && reglementInputRef.current) {
        reglementInputRef.current.value = '';
      }
    }
  };

  const handleRestoreTemplate = async () => {
    if (!templateToRestore) return;
    
    setTemplateLoading(true);
    try {
      await templatesAPI.restoreTemplate(templateToRestore);
      
      setTemplates(prevTemplates => ({
        ...prevTemplates,
        [templateToRestore]: {
          ...prevTemplates[templateToRestore],
          status: 'default'
        }
      }));
      
      setTemplateRestoreModalOpen(false);
      showSuccessMessage(`Template ${templates[templateToRestore].name} restauré avec succès`);
    } catch (err) {
      console.error(`Erreur lors de la restauration du template ${templateToRestore}`, err);
      setErrorMessage(`Impossible de restaurer le template ${templates[templateToRestore].name}`);
    } finally {
      setTemplateLoading(false);
    }
  };

  const triggerFileInput = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.click();
    }
  };

  const openRestoreConfirmation = (templateType) => {
    setTemplateToRestore(templateType);
    setTemplateRestoreModalOpen(true);
  };

  return (
    <Container>
      <Description colors={colors}>
        <strong>Important :</strong> Consultez la documentation avant de modifier les templates.
        Les templates personnalisés remplacent les templates par défaut pour la génération des documents.
      </Description>
      
      <TemplatesList>
        {/* Template de convention */}
        <TemplateItem colors={colors}>
          <TemplateInfo>
            <TemplateName colors={colors}>{templates.convention.name}</TemplateName>
            <TemplateStatus status={templates.convention.status} colors={colors}>
              {templates.convention.status === 'custom' ? 'Personnalisé' : 'Par défaut'}
            </TemplateStatus>
          </TemplateInfo>
          <TemplateActions>
            <TemplateButton 
              title="Télécharger le template actuel"
              onClick={() => handleDownloadTemplate('convention')}
              disabled={templateLoading}
              variant="download"
              colors={colors}
            >
              <FaDownload />
              <span>Télécharger</span>
            </TemplateButton>
            
            <TemplateButton 
              title="Uploader un template personnalisé"
              onClick={() => triggerFileInput(conventionInputRef)}
              disabled={templateLoading}
              variant="upload"
              colors={colors}
            >
              <FaUpload />
              <span>Uploader</span>
            </TemplateButton>
            
            <input
              type="file"
              ref={conventionInputRef}
              style={{ display: 'none' }}
              accept=".docx"
              onChange={(e) => handleUploadTemplate(e, 'convention')}
            />
            
            {templates.convention.status === 'custom' && (
              <TemplateButton 
                title="Restaurer le template par défaut"
                onClick={() => openRestoreConfirmation('convention')}
                disabled={templateLoading}
                variant="restore"
                colors={colors}
              >
                <FaUndo />
                <span>Restaurer</span>
              </TemplateButton>
            )}
          </TemplateActions>
        </TemplateItem>
        
        {/* Template de règlement */}
        <TemplateItem colors={colors}>
          <TemplateInfo>
            <TemplateName colors={colors}>{templates.reglement.name}</TemplateName>
            <TemplateStatus status={templates.reglement.status} colors={colors}>
              {templates.reglement.status === 'custom' ? 'Personnalisé' : 'Par défaut'}
            </TemplateStatus>
          </TemplateInfo>
          <TemplateActions>
            <TemplateButton 
              title="Télécharger le template actuel"
              onClick={() => handleDownloadTemplate('reglement')}
              disabled={templateLoading}
              variant="download"
              colors={colors}
            >
              <FaDownload />
              <span>Télécharger</span>
            </TemplateButton>
            
            <TemplateButton 
              title="Uploader un template personnalisé"
              onClick={() => triggerFileInput(reglementInputRef)}
              disabled={templateLoading}
              variant="upload"
              colors={colors}
            >
              <FaUpload />
              <span>Uploader</span>
            </TemplateButton>
            
            <input
              type="file"
              ref={reglementInputRef}
              style={{ display: 'none' }}
              accept=".docx"
              onChange={(e) => handleUploadTemplate(e, 'reglement')}
            />
            
            {templates.reglement.status === 'custom' && (
              <TemplateButton 
                title="Restaurer le template par défaut"
                onClick={() => openRestoreConfirmation('reglement')}
                disabled={templateLoading}
                variant="restore"
                colors={colors}
              >
                <FaUndo />
                <span>Restaurer</span>
              </TemplateButton>
            )}
          </TemplateActions>
        </TemplateItem>
      </TemplatesList>

      {/* Modal de confirmation de restauration */}
      <Modal
        isOpen={templateRestoreModalOpen}
        onClose={() => setTemplateRestoreModalOpen(false)}
        title={`Restaurer le template ${templateToRestore ? templates[templateToRestore].name : ''}`}
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setTemplateRestoreModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <RestoreButton onClick={handleRestoreTemplate} colors={colors}>
              Restaurer
            </RestoreButton>
          </>
        }
      >
        <ConfirmContent colors={colors}>
          <p>
            Êtes-vous sûr de vouloir restaurer le template par défaut pour 
            <strong> {templateToRestore ? templates[templateToRestore].name : ''}</strong> ?
          </p>
          <WarningText colors={colors}>
            Cette action remplacera définitivement votre template personnalisé par le template par défaut.
          </WarningText>
        </ConfirmContent>
      </Modal>
    </Container>
  );
};

const Container = styled.div``;

const Description = styled.div`
  padding: 16px;
  background-color: ${props => props.colors.warningBg};
  color: ${props => props.colors.textPrimary};
  border-radius: 4px;
  margin-bottom: 24px;
  border-left: 4px solid ${props => props.colors.warning};
  transition: all 0.3s ease;
`;

const TemplatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TemplateItem = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  border: 1px solid ${props => props.colors.border};
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TemplateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TemplateName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const TemplateStatus = styled.div`
  display: inline-block;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 500;
  background-color: ${props => props.status === 'custom' ? props.colors.successBg : props.colors.primary + '20'};
  color: ${props => props.status === 'custom' ? props.colors.success : props.colors.primary};
  border: 1px solid ${props => props.status === 'custom' ? props.colors.success + '40' : props.colors.primary + '40'};
  transition: all 0.3s ease;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const TemplateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  ${props => {
    switch (props.variant) {
      case 'download':
        return `
          background-color: ${props.colors.primary};
          color: white;
          &:hover:not(:disabled) {
            background-color: ${props.colors.primaryDark};
            transform: translateY(-1px);
            box-shadow: ${props.colors.shadowHover};
          }
        `;
      case 'upload':
        return `
          background-color: ${props.colors.warning};
          color: white;
          &:hover:not(:disabled) {
            background-color: ${props.colors.warning}dd;
            transform: translateY(-1px);
            box-shadow: ${props.colors.shadowHover};
          }
        `;
      case 'restore':
        return `
          background-color: ${props.colors.textMuted};
          color: white;
          &:hover:not(:disabled) {
            background-color: ${props.colors.textSecondary};
            transform: translateY(-1px);
            box-shadow: ${props.colors.shadowHover};
          }
        `;
      default:
        return `
          background-color: ${props.colors.surface};
          color: ${props.colors.textPrimary};
          border: 1px solid ${props.colors.border};
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ConfirmContent = styled.div`
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 16px;
    line-height: 1.6;
  }
`;

const WarningText = styled.p`
  color: ${props => props.colors.warning};
  font-size: 14px;
  margin-bottom: 8px;
  transition: color 0.3s ease;
`;

const CancelButton = styled.button`
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    transform: translateY(-1px);
  }
`;

const RestoreButton = styled.button`
  background-color: ${props => props.colors.warning};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.warning}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

export default TemplatesTab;