import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaCopy, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding, FaIdCard } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const AvocatDetail = ({ avocat, onEditClick, showEditButton = true }) => {
  const { colors } = useTheme();
  
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
    <Container colors={colors}>
      <HeaderSection colors={colors}>
        <Title colors={colors}>
          <span>Maître {avocat.prenom} {avocat.nom}</span>
          {avocat.specialisationRPC && <RPCTag colors={colors}>RPC</RPCTag>}
        </Title>
        <ActionButtons>
          <Button onClick={copyCoordinates} title="Copier les coordonnées" colors={colors}>
            <FaCopy />
            <span>Copier les coordonnées</span>
          </Button>
        {/* Rendre le bouton modifier conditionnel (réutilisé dans DetailBeneficiaire.js)*/}
        {showEditButton && (
            <Button onClick={onEditClick} title="Modifier" colors={colors}>
              <FaEdit />
              <span>Modifier</span>
            </Button>
          )}
        </ActionButtons>
      </HeaderSection>
      
      <InfoGrid>
        {avocat.cabinet && (
          <InfoItem>
            <IconWrapper colors={colors}>
              <FaBuilding />
            </IconWrapper>
            <InfoContent>
              <InfoLabel colors={colors}>Cabinet</InfoLabel>
              <InfoValue colors={colors}>{avocat.cabinet}</InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.region && (
          <InfoItem>
            <IconWrapper colors={colors}>
              <FaMapMarkerAlt />
            </IconWrapper>
            <InfoContent>
              <InfoLabel colors={colors}>Région</InfoLabel>
              <InfoValue colors={colors}>{avocat.region}</InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {formatAdresseComplete() && (
          <InfoItem span={2}>
            <IconWrapper colors={colors}>
              <FaMapMarkerAlt />
            </IconWrapper>
            <InfoContent>
              <InfoLabel colors={colors}>Adresse</InfoLabel>
              <InfoValue colors={colors}>{formatAdresseComplete()}</InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.telephonePublic1 && (
          <InfoItem>
            <IconWrapper colors={colors}>
              <FaPhone />
            </IconWrapper>
            <InfoContent>
              <InfoLabel colors={colors}>Téléphone public 1</InfoLabel>
              <InfoValue colors={colors}>
                <StyledLink href={`tel:${avocat.telephonePublic1}`} colors={colors}>
                  {avocat.telephonePublic1}
                </StyledLink>
              </InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.telephonePublic2 && (
          <InfoItem>
            <IconWrapper colors={colors}>
              <FaPhone />
            </IconWrapper>
            <InfoContent>
              <InfoLabel colors={colors}>Téléphone public 2</InfoLabel>
              <InfoValue colors={colors}>
                <StyledLink href={`tel:${avocat.telephonePublic2}`} colors={colors}>
                  {avocat.telephonePublic2}
                </StyledLink>
              </InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.telephonePrive && (
          <InfoItem>
            <IconWrapper colors={colors}>
              <FaPhone style={{ color: colors.error }} />
            </IconWrapper>
            <InfoContent>
              <InfoLabel colors={colors}>
                Téléphone privé <PrivateNote colors={colors}>(non communiqué aux clients)</PrivateNote>
              </InfoLabel>
              <InfoValue colors={colors}>
                <StyledLink href={`tel:${avocat.telephonePrive}`} colors={colors}>
                  {avocat.telephonePrive}
                </StyledLink>
              </InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.email && (
          <InfoItem span={2}>
            <IconWrapper colors={colors}>
              <FaEnvelope />
            </IconWrapper>
            <InfoContent>
              <InfoLabel colors={colors}>Email</InfoLabel>
              <InfoValue colors={colors}>
                <StyledLink href={`mailto:${avocat.email}`} colors={colors}>
                  {avocat.email}
                </StyledLink>
              </InfoValue>
            </InfoContent>
          </InfoItem>
        )}
        
        {avocat.siretRidet && (
          <InfoItem span={2}>
            <IconWrapper colors={colors}>
              <FaIdCard />
            </IconWrapper>
            <InfoContent>
              <InfoLabel colors={colors}>SIRET/RIDET</InfoLabel>
              <InfoValue colors={colors}>{avocat.siretRidet}</InfoValue>
            </InfoContent>
          </InfoItem>
        )}
      </InfoGrid>
      
      {avocat.villesIntervention && avocat.villesIntervention.length > 0 && (
        <Section>
          <SectionTitle colors={colors}>Villes d'intervention</SectionTitle>
          <VillesContainer>
            {avocat.villesIntervention.map((ville, index) => (
              <VilleTag key={index} colors={colors}>{ville}</VilleTag>
            ))}
          </VillesContainer>
        </Section>
      )}
      
      {avocat.commentaires && (
        <Section>
          <SectionTitle colors={colors}>Commentaires</SectionTitle>
          <CommentairesContent colors={colors}>{avocat.commentaires}</CommentairesContent>
        </Section>
      )}
    </Container>
  );
};

// Styled Components avec thématisation
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  padding-bottom: 15px;
  transition: border-color 0.3s ease;
  
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
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const RPCTag = styled.span`
  display: inline-block;
  background-color: ${props => props.colors.warning};
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s ease;
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
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
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
  padding: 12px 0;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  color: ${props => props.colors.primary};
  margin-right: 10px;
  padding-top: 2px;
  transition: color 0.3s ease;
`;

const InfoContent = styled.div`
  flex-grow: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: ${props => props.colors.textSecondary};
  margin-bottom: 4px;
  font-weight: 500;
  transition: color 0.3s ease;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const StyledLink = styled.a`
  color: ${props => props.colors.primary};
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    text-decoration: underline;
    color: ${props => props.colors.primaryLight};
  }
`;

const PrivateNote = styled.span`
  font-size: 12px;
  color: ${props => props.colors.error};
  font-style: italic;
  transition: color 0.3s ease;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 12px;
  color: ${props => props.colors.textPrimary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const VillesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const VilleTag = styled.div`
  background-color: ${props => props.colors.cardIcon.affaires.bg};
  border-radius: 16px;
  padding: 5px 12px;
  font-size: 14px;
  color: ${props => props.colors.cardIcon.affaires.color};
  border: 1px solid ${props => props.colors.cardIcon.affaires.color}40;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
`;

const CommentairesContent = styled.div`
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  padding: 15px;
  font-size: 16px;
  line-height: 1.5;
  color: ${props => props.colors.textPrimary};
  white-space: pre-line;
  transition: all 0.3s ease;
`;

export default AvocatDetail;