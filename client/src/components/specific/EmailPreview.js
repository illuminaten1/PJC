import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaDownload, FaPaperclip, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '../../contexts/ThemeContext';

const EmailPreview = ({ fileId }) => {
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { colors } = useTheme();
  
  useEffect(() => {
    const fetchEmailData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/fichiers/preview-email/${fileId}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setEmailData(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des données de l\'email:', err);
        setError(`Impossible de charger l'email: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (fileId) {
      fetchEmailData();
    }
  }, [fileId]);
  
  const handleAttachmentDownload = (attachmentId, filename) => {
    const url = `/api/fichiers/email-attachment/${fileId}/${attachmentId}`;
    
    // Créer un lien temporaire pour le téléchargement
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', filename);
    tempLink.setAttribute('target', '_blank');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };
  
  if (loading) {
    return (
      <EmailPreviewContainer colors={colors}>
        <LoadingContainer colors={colors}>
          <SpinnerIcon colors={colors}>
            <FaSpinner />
          </SpinnerIcon>
          <LoadingText colors={colors}>Chargement de l'email...</LoadingText>
        </LoadingContainer>
      </EmailPreviewContainer>
    );
  }
  
  if (error) {
    return (
      <EmailPreviewContainer colors={colors}>
        <ErrorContainer colors={colors}>
          {error}
        </ErrorContainer>
      </EmailPreviewContainer>
    );
  }
  
  if (!emailData) {
    return (
      <EmailPreviewContainer colors={colors}>
        <EmptyContainer colors={colors}>
          Aucune donnée d'email disponible
        </EmptyContainer>
      </EmailPreviewContainer>
    );
  }
  
  // Formater la date
  const emailDate = new Date(emailData.date);
  const formattedDate = format(emailDate, 'PPP à HH:mm', { locale: fr });
  
  return (
    <EmailPreviewContainer colors={colors}>
      <EmailHeader colors={colors}>
        <EmailSubject colors={colors}>{emailData.subject}</EmailSubject>
        
        <EmailMetaRow>
          <EmailMetaLabel colors={colors}>De:</EmailMetaLabel>
          <EmailMetaValue colors={colors}>{emailData.from}</EmailMetaValue>
        </EmailMetaRow>
        
        <EmailMetaRow>
          <EmailMetaLabel colors={colors}>À:</EmailMetaLabel>
          <EmailMetaValue colors={colors}>{emailData.to}</EmailMetaValue>
        </EmailMetaRow>
        
        {emailData.cc && (
          <EmailMetaRow>
            <EmailMetaLabel colors={colors}>Cc:</EmailMetaLabel>
            <EmailMetaValue colors={colors}>{emailData.cc}</EmailMetaValue>
          </EmailMetaRow>
        )}
        
        <EmailMetaRow>
          <EmailMetaLabel colors={colors}>Date:</EmailMetaLabel>
          <EmailMetaValue colors={colors}>{formattedDate}</EmailMetaValue>
        </EmailMetaRow>
      </EmailHeader>
      
      <EmailBody 
        colors={colors}
        dangerouslySetInnerHTML={{ __html: emailData.html }} 
      />
      
      {emailData.attachments && emailData.attachments.length > 0 && (
        <EmailAttachments colors={colors}>
          <AttachmentTitle colors={colors}>
            <FaPaperclip /> 
            Pièces jointes ({emailData.attachments.length})
          </AttachmentTitle>
          
          <AttachmentList>
            {emailData.attachments.map((attachment, index) => (
              <AttachmentItem 
                key={index}
                onClick={() => handleAttachmentDownload(attachment.id, attachment.filename)}
                colors={colors}
              >
                <AttachmentName title={attachment.filename} colors={colors}>
                  {attachment.filename}
                </AttachmentName>
                <AttachmentDownload colors={colors}>
                  <FaDownload />
                </AttachmentDownload>
              </AttachmentItem>
            ))}
          </AttachmentList>
        </EmailAttachments>
      )}
    </EmailPreviewContainer>
  );
};

// Styled Components avec thématisation
const EmailPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${props => props.colors.background};
  border-radius: 4px;
  overflow: hidden;
  flex: 1;
  transition: background-color 0.3s ease;
`;

const EmailHeader = styled.div`
  background-color: ${props => props.colors.surface};
  padding: 15px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  flex-shrink: 0;
  transition: all 0.3s ease;
`;

const EmailSubject = styled.h2`
  margin: 0 0 15px 0;
  font-size: 20px;
  color: ${props => props.colors.textPrimary};
  font-weight: 600;
  transition: color 0.3s ease;
`;

const EmailMetaRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
`;

const EmailMetaLabel = styled.div`
  font-weight: 500;
  width: 80px;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const EmailMetaValue = styled.div`
  flex-grow: 1;
  word-break: break-word;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const EmailBody = styled.div`
  flex: 1;
  padding: 15px;
  background-color: ${props => props.colors.surface};
  margin: 15px;
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  overflow: auto;
  min-height: 0;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
  
  /* Styles pour le contenu HTML de l'email */
  p, div, span {
    color: ${props => props.colors.textPrimary} !important;
  }
  
  a {
    color: ${props => props.colors.primary} !important;
    
    &:hover {
      color: ${props => props.colors.primaryLight} !important;
    }
  }
  
  /* Forcer les couleurs pour les emails avec styles inline */
  * {
    color: ${props => props.colors.textPrimary} !important;
  }
  
  /* Exception pour les liens */
  a, a * {
    color: ${props => props.colors.primary} !important;
  }
`;

const EmailAttachments = styled.div`
  padding: 15px;
  background-color: ${props => props.colors.surface};
  margin: 0 15px 15px 15px;
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  flex-shrink: 0;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
`;

const AttachmentTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  svg {
    margin-right: 8px;
    color: ${props => props.colors.primary};
  }
`;

const AttachmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 120px;
  overflow-y: auto;
  
  /* Scrollbar thématisée */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.colors?.surfaceHover || '#f1f1f1'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.colors?.border || '#c1c1c1'};
    border-radius: 3px;
    
    &:hover {
      background: ${props => props.colors?.primary || '#888'};
    }
  }
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  font-size: 14px;
  max-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    border-color: ${props => props.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
`;

const AttachmentName = styled.div`
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  color: ${props => props.colors.primary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const AttachmentDownload = styled.div`
  color: ${props => props.colors.textSecondary};
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.colors.primary};
    transform: scale(1.1);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.colors.textSecondary};
  transition: color 0.3s ease;
`;

const SpinnerIcon = styled.div`
  margin-bottom: 15px;
  color: ${props => props.colors.primary};
  font-size: 32px;
  transition: color 0.3s ease;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: ${props => props.colors.textSecondary};
  font-size: 16px;
  transition: color 0.3s ease;
`;

const ErrorContainer = styled.div`
  padding: 20px;
  color: ${props => props.colors.error};
  background-color: ${props => props.colors.errorBg};
  border: 1px solid ${props => props.colors.error}40;
  border-radius: 4px;
  margin: 15px;
  text-align: center;
  transition: all 0.3s ease;
`;

const EmptyContainer = styled.div`
  padding: 20px;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  margin: 15px;
  text-align: center;
  transition: all 0.3s ease;
`;

export default EmailPreview;