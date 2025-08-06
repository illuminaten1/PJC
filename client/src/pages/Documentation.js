import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../contexts/ThemeContext';
import PageHeader from '../components/common/PageHeader';
import documentationContent from '../assets/documentation.md';

const Documentation = () => {
  const { colors } = useTheme();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  // Charger le contenu markdown
  useEffect(() => {
    fetch(documentationContent)
      .then(response => response.text())
      .then(text => setMarkdownContent(text))
      .catch(error => console.error('Erreur lors du chargement du markdown:', error));
  }, []);

  // Gestion du scroll pour le bouton "retour en haut"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Retour en haut
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container colors={colors}>
      <PageHeader 
        title="Documentation"
        subtitle="Guide d'utilisation de l'application de Protection Juridique Complémentaire"
        backButton
      />

      <Content colors={colors}>
          <MarkdownContainer colors={colors}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Personnalisation des composants Markdown
                h1: ({node, ...props}) => <SectionTitle colors={colors} {...props} />,
                h2: ({node, ...props}) => <SectionTitle colors={colors} {...props} />,
                h3: ({node, ...props}) => <SubsectionTitle colors={colors} {...props} />,
                h4: ({node, ...props}) => <SubsectionTitle colors={colors} {...props} />,
                blockquote: ({node, ...props}) => {
                  const text = node?.children?.[0]?.children?.[0]?.value || '';
                  if (text.includes('⚠️')) {
                    return <WarningBox colors={colors} {...props} />;
                  }
                  return <HighlightBox colors={colors} {...props} />;
                },
                code: ({node, inline, ...props}) => (
                  inline 
                    ? <InlineCode colors={colors} {...props} />
                    : <CodeBlock colors={colors} {...props} />
                ),
                ul: ({node, ...props}) => <StyledList colors={colors} {...props} />,
                ol: ({node, ...props}) => <StyledOrderedList colors={colors} {...props} />,
                li: ({node, ...props}) => <StyledListItem colors={colors} {...props} />,
                p: ({node, ...props}) => <StyledParagraph colors={colors} {...props} />
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </MarkdownContainer>
      </Content>

      {showScrollTop && (
        <ScrollToTopButton onClick={scrollToTop} colors={colors}>
          ↑
        </ScrollToTopButton>
      )}
    </Container>
  );
};

// Styled Components avec responsive design complet

const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Content = styled.main`
  background-color: ${props => props.colors.surface};
  border-radius: 8px;
  box-shadow: ${props => props.colors.shadow};
  padding: 32px;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;


const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  margin-bottom: 16px;
  border-bottom: 3px solid ${props => props.colors.primary};
  padding-bottom: 8px;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    border-bottom-width: 2px;
  }
`;

const SubsectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  margin: 32px 0 16px 0;
  position: relative;
  transition: color 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    left: -16px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background-color: ${props => props.colors.primary};
    border-radius: 2px;
    
    @media (max-width: 480px) {
      left: -12px;
      width: 3px;
      height: 16px;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 24px 0 12px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const HighlightBox = styled.div`
  background: linear-gradient(135deg, ${props => props.colors.primary}10, ${props => props.colors.primary}05);
  border-left: 4px solid ${props => props.colors.primary};
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  p {
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    margin: 16px 0;
  }
`;

const WarningBox = styled.div`
  background-color: ${props => props.colors.warningBg};
  border-left: 4px solid ${props => props.colors.warning};
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  box-shadow: ${props => props.colors.shadow};
  transition: all 0.3s ease;
  
  p {
    margin-bottom: 8px;
    color: ${props => props.colors.textPrimary};
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: #e65100;
    }
  }
  
  code {
    background-color: ${props => props.colors.surfaceHover};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: ${props => props.colors.textPrimary};
    word-break: break-all;
    
    @media (max-width: 480px) {
      font-size: 11px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    margin: 16px 0;
  }
`;


const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  box-shadow: ${props => props.colors.shadowHover};
  transition: all 0.3s ease;
  font-size: 18px;
  font-weight: bold;
  z-index: 100;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.colors.primaryDark};
  }
  
  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    bottom: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
`;

// Nouveaux styled-components pour ReactMarkdown
const MarkdownContainer = styled.div`
  color: ${props => props.colors.textPrimary};
  line-height: 1.7;
  
  & > * {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const StyledParagraph = styled.p`
  color: ${props => props.colors.textPrimary};
  margin-bottom: 16px;
  line-height: 1.7;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledList = styled.ul`
  color: ${props => props.colors.textPrimary};
  margin: 16px 0;
  padding-left: 24px;
  
  @media (max-width: 480px) {
    padding-left: 16px;
  }
`;

const StyledOrderedList = styled.ol`
  color: ${props => props.colors.textPrimary};
  margin: 16px 0;
  padding-left: 24px;
  
  @media (max-width: 480px) {
    padding-left: 16px;
  }
`;

const StyledListItem = styled.li`
  color: ${props => props.colors.textPrimary};
  margin-bottom: 8px;
  line-height: 1.6;
`;

const InlineCode = styled.code`
  background-color: ${props => props.colors.surfaceHover};
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: ${props => props.colors.primary};
  word-break: break-all;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const CodeBlock = styled.pre`
  background-color: ${props => props.colors.surfaceHover};
  padding: 16px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.borderLight};
  overflow-x: auto;
  margin: 16px 0;
  
  @media (max-width: 480px) {
    padding: 12px;
    font-size: 11px;
  }
`;

export default Documentation;