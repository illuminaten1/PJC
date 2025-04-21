import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaDownload, FaPaperclip, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EmailPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
`;

const EmailHeader = styled.div`
  background-color: #fff;
  padding: 15px;
  border-bottom: 1px solid #eee;
`;

const EmailSubject = styled.h2`
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #333;
`;

const EmailMetaRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
`;

const EmailMetaLabel = styled.div`
  font-weight: 500;
  width: 80px;
  color: #555;
`;

const EmailMetaValue = styled.div`
  flex-grow: 1;
  word-break: break-word;
`;

const EmailBody = styled.div`
  flex-grow: 1;
  padding: 15px;
  background-color: #fff;
  margin: 15px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: auto;
`;

const EmailAttachments = styled.div`
  padding: 15px;
  background-color: #fff;
  margin: 0 15px 15px 15px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const AttachmentTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  color: #555;
  
  svg {
    margin-right: 8px;
  }
`;

const AttachmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f2f2f2;
  border-radius: 4px;
  font-size: 14px;
  max-width: 200px;
  cursor: pointer;
  
  &:hover {
    background-color: #e8e8e8;
  }
`;

const AttachmentName = styled.div`
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  color: #3f51b5;
`;

const AttachmentDownload = styled.div`
  color: #666;
  
  &:hover {
    color: #3f51b5;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  
  svg {
    margin-bottom: 15px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmailPreview = ({ fileId }) => {
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchEmailData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5002/api/fichiers/preview-email/${fileId}`);
        
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
    const url = `http://localhost:5002/api/fichiers/email-attachment/${fileId}/${attachmentId}`;
    
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
      <EmailPreviewContainer>
        <LoadingContainer>
          <FaSpinner size={32} />
          <div>Chargement de l'email...</div>
        </LoadingContainer>
      </EmailPreviewContainer>
    );
  }
  
  if (error) {
    return (
      <EmailPreviewContainer>
        <div style={{ padding: '20px', color: 'red' }}>
          {error}
        </div>
      </EmailPreviewContainer>
    );
  }
  
  if (!emailData) {
    return (
      <EmailPreviewContainer>
        <div style={{ padding: '20px' }}>
          Aucune donnée d'email disponible
        </div>
      </EmailPreviewContainer>
    );
  }
  
  // Formater la date
  const emailDate = new Date(emailData.date);
  const formattedDate = format(emailDate, 'PPP à HH:mm', { locale: fr });
  
  return (
    <EmailPreviewContainer>
      <EmailHeader>
        <EmailSubject>{emailData.subject}</EmailSubject>
        
        <EmailMetaRow>
          <EmailMetaLabel>De:</EmailMetaLabel>
          <EmailMetaValue>{emailData.from}</EmailMetaValue>
        </EmailMetaRow>
        
        <EmailMetaRow>
          <EmailMetaLabel>À:</EmailMetaLabel>
          <EmailMetaValue>{emailData.to}</EmailMetaValue>
        </EmailMetaRow>
        
        {emailData.cc && (
          <EmailMetaRow>
            <EmailMetaLabel>Cc:</EmailMetaLabel>
            <EmailMetaValue>{emailData.cc}</EmailMetaValue>
          </EmailMetaRow>
        )}
        
        <EmailMetaRow>
          <EmailMetaLabel>Date:</EmailMetaLabel>
          <EmailMetaValue>{formattedDate}</EmailMetaValue>
        </EmailMetaRow>
      </EmailHeader>
      
      <EmailBody 
        dangerouslySetInnerHTML={{ __html: emailData.html }} 
      />
      
      {emailData.attachments && emailData.attachments.length > 0 && (
        <EmailAttachments>
          <AttachmentTitle>
            <FaPaperclip /> 
            Pièces jointes ({emailData.attachments.length})
          </AttachmentTitle>
          
          <AttachmentList>
            {emailData.attachments.map((attachment, index) => (
              <AttachmentItem 
                key={index}
                onClick={() => handleAttachmentDownload(attachment.id, attachment.filename)}
              >
                <AttachmentName title={attachment.filename}>
                  {attachment.filename}
                </AttachmentName>
                <AttachmentDownload>
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

export default EmailPreview;