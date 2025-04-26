import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaCopy, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding, FaIdCard } from 'react-icons/fa';

const AvocatDetail = ({ avocat, onEditClick, showEditButton = true }) => {
  // Fonction pour copier les coordonnées dans le presse-papier
  const copyCoordinates = () => {
    // Format: Maître Prénom NOM, Adresse postale, Téléphone(s) public(s), Adresse mail
    let coordonnees = `Maître ${avocat.prenom} ${avocat.nom}`;
    
    const adresseComplete = formatAdresseComplete();
    if (adresseComplete) {
      coordonnees += `,\n${adresseComplete}`;
    }
    
    if (avocat.telephonePublic1) {
      coordonnees += `,\n${avocat.telephonePublic1}`;
    }
    
    if (avocat.telephonePublic2) {
      coordonnees += `, ${avocat.telephonePublic2}`;
    }
    
    if (avocat.email) {
      coordonnees += `,\n${avocat.email}`;
    }
    
    navigator.clipboard.writeText(coordonnees)
      .then(() => {
        alert('Coordonnées copiées dans le presse-papier');
      })
      .catch(err => {
        console.error('Erreur lors de la copie des coordonnées', err);
        alert('Impossible de copier les coordonnées');
      });
  };
  
  // Fonction pour formater l'adresse complète
  const formatAdresseComplete = () => {
    const { adresse } = avocat;
    if (!adresse) return null;
    
    const { numero, rue, codePostal, ville } = adresse;
    let adresseComplete = '';
    
    if (numero || rue) {
      adresseComplete += `${numero || ''} ${rue || ''}`.trim();
    }
    
    if (codePostal || ville) {
      if (adresseComplete) adresseComplete += ', ';
      adresseComplete += `${codePostal || ''} ${ville || ''}`.trim();
    }
    
    return adresseComplete || null;
  };
  
  return (
    <Container>
      <HeaderSection>
        <Title>
          <span>Maître {avocat.prenom} {avocat.nom}</span>
          {avocat.specialisationRPC && <RPCTag>RPC</RPCTag>}
        </Title>
        <ActionButtons>
          <Button onClick={copyCoordinates} title="Copier les coordonnées">
            <FaCopy />
            <span>Copier les coordonnées</span>
          </Button>
        {/* Rendre le bouton modifier conditionnel (réutilisé dans DetailBeneficiaire.js)*/}
        {showEditButton && (
            <Button onClick={onEditClick} title="Modifier">
              <FaEdit />
              <span>Modifier</span>
            </Button>
          )}
        </ActionButtons>
      </HeaderSection>
      
      <InfoGrid>
        {avocat.cabinet && (
          <InfoItem>
            <IconWrapper>
              <FaBuilding />
            </IconWrapper>
            <InfoContent>
              <InfoLabel>Cabinet</InfoLabel>
              <InfoValue>{avocat.cabinet}</InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.region && (
          <InfoItem>
            <IconWrapper>
              <FaMapMarkerAlt />
            </IconWrapper>
            <InfoContent>
              <InfoLabel>Région</InfoLabel>
              <InfoValue>{avocat.region}</InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {formatAdresseComplete() && (
          <InfoItem span={2}>
            <IconWrapper>
              <FaMapMarkerAlt />
            </IconWrapper>
            <InfoContent>
              <InfoLabel>Adresse</InfoLabel>
              <InfoValue>{formatAdresseComplete()}</InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.telephonePublic1 && (
          <InfoItem>
            <IconWrapper>
              <FaPhone />
            </IconWrapper>
            <InfoContent>
              <InfoLabel>Téléphone public 1</InfoLabel>
              <InfoValue><a href={`tel:${avocat.telephonePublic1}`}>{avocat.telephonePublic1}</a></InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.telephonePublic2 && (
          <InfoItem>
            <IconWrapper>
              <FaPhone />
            </IconWrapper>
            <InfoContent>
              <InfoLabel>Téléphone public 2</InfoLabel>
              <InfoValue><a href={`tel:${avocat.telephonePublic2}`}>{avocat.telephonePublic2}</a></InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.telephonePrive && (
          <InfoItem>
            <IconWrapper>
              <FaPhone style={{ color: '#f44336' }} />
            </IconWrapper>
            <InfoContent>
              <InfoLabel>Téléphone privé <PrivateNote>(non communiqué aux clients)</PrivateNote></InfoLabel>
              <InfoValue><a href={`tel:${avocat.telephonePrive}`}>{avocat.telephonePrive}</a></InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.email && (
          <InfoItem span={2}>
            <IconWrapper>
              <FaEnvelope />
            </IconWrapper>
            <InfoContent>
              <InfoLabel>Email</InfoLabel>
              <InfoValue><a href={`mailto:${avocat.email}`}>{avocat.email}</a></InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.siretRidet && (
          <InfoItem span={2}>
            <IconWrapper>
              <FaIdCard />
            </IconWrapper>
            <InfoContent>
              <InfoLabel>SIRET/RIDET</InfoLabel>
              <InfoValue>{avocat.siretRidet}</InfoValue>
            </InfoContent>
          </InfoItem>
        )}
      </InfoGrid>
      
      {avocat.villesIntervention && avocat.villesIntervention.length > 0 && (
        <Section>
          <SectionTitle>Villes d'intervention</SectionTitle>
          <VillesContainer>
            {avocat.villesIntervention.map((ville, index) => (
              <VilleTag key={index}>{ville}</VilleTag>
            ))}
          </VillesContainer>
        </Section>
      )}
      
      {avocat.commentaires && (
        <Section>
          <SectionTitle>Commentaires</SectionTitle>
          <CommentairesContent>{avocat.commentaires}</CommentairesContent>
        </Section>
      )}
    </Container>
  );
};

// Styles
const Container = styled.div`
  padding: 20px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RPCTag = styled.span`
  display: inline-block;
  background-color: #ff5722;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #303f9f;
  }
  
  @media (max-width: 480px) {
    span {
      display: none;
    }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  grid-column: span ${props => props.span || 1};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  color: #3f51b5;
  margin-right: 10px;
  padding-top: 2px;
`;

const InfoContent = styled.div`
  flex-grow: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #757575;
  margin-bottom: 4px;
  font-weight: 500;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: #333;
  
  a {
    color: #3f51b5;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PrivateNote = styled.span`
  font-size: 12px;
  color: #f44336;
  font-style: italic;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
  font-weight: 500;
`;

const VillesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const VilleTag = styled.div`
  background-color: #e3f2fd;
  border-radius: 16px;
  padding: 5px 12px;
  font-size: 14px;
  color: #1976d2;
`;

const CommentairesContent = styled.div`
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 15px;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  white-space: pre-line;
`;

export default AvocatDetail;