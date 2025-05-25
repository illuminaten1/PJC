import React, { useCallback, useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

// Composant d'édition Markdown
export const MarkdownEditor = ({ value, onChange, name = 'notes', placeholder = 'Saisir vos notes avec formatage...' }) => {
  const { colors, darkMode } = useTheme();
  
  // Utiliser useCallback pour éviter les re-rendus inutiles
  const handleChange = useCallback((value) => {
    onChange({
      target: {
        name,
        value
      }
    });
  }, [onChange, name]);
  
  // Calculer la hauteur dynamique basée sur le contenu
  const dynamicHeight = useMemo(() => {
    if (!value) return 250; // Hauteur minimale
    
    // Compter le nombre de lignes dans le contenu
    const lines = value.split('\n').length;
    // Hauteur par ligne (approximative) + padding
    const lineHeight = 20;
    const padding = 60;
    
    // Hauteur calculée avec un minimum de 250px et un maximum de 500px
    // Au-delà de 500px, on garde le scroll pour éviter des éditeurs trop grands
    const calculatedHeight = Math.max(250, Math.min(500, lines * lineHeight + padding));
    
    return calculatedHeight;
  }, [value]);
  
  const editorOptions = useMemo(() => ({
    spellChecker: false,
    toolbar: ["bold", "italic", "heading", "|", "unordered-list", "ordered-list", "|", "link", "|", "preview"],
    placeholder,
    status: false,
    autofocus: true,
    minHeight: `${dynamicHeight}px`,
  }), [placeholder, dynamicHeight]);
  
  return (
    <EditorContainer colors={colors} darkMode={darkMode} dynamicHeight={dynamicHeight}>
      <SimpleMDE
        value={value}
        onChange={handleChange}
        options={editorOptions}
      />
    </EditorContainer>
  );
};

// Composant d'affichage Markdown
export const MarkdownDisplay = ({ content }) => {
  const { colors } = useTheme();
  
  if (!content) return <EmptyContent colors={colors}>Aucune note</EmptyContent>;
  
  return (
    <MarkdownContainer colors={colors}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </MarkdownContainer>
  );
};

const EditorContainer = styled.div`
  /* Styles pour l'éditeur Markdown */
  .CodeMirror {
    border: 1px solid ${props => props.colors.border};
    border-radius: 4px;
    min-height: ${props => props.dynamicHeight}px !important;
    max-height: 500px !important; /* Hauteur max avec scroll au-delà */
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
    transition: all 0.3s ease;
  }
  
  .CodeMirror-scroll {
    min-height: ${props => props.dynamicHeight}px !important;
    max-height: 500px !important; /* Permet le scroll si le contenu dépasse */
  }
  
  .CodeMirror-focused {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  .CodeMirror-cursor {
    border-left: 1px solid ${props => props.colors.textPrimary};
  }
  
  .CodeMirror-selected {
    background-color: ${props => props.colors.primary}30;
  }
  
  .editor-toolbar {
    border: 1px solid ${props => props.colors.border};
    border-radius: 4px 4px 0 0;
    background-color: ${props => props.colors.surfaceHover};
    transition: all 0.3s ease;
    
    a {
      color: ${props => props.colors.textPrimary} !important;
      transition: color 0.3s ease;
      
      &:hover {
        background-color: ${props => props.colors.navActive};
        border-color: ${props => props.colors.border};
      }
      
      &.active {
        background-color: ${props => props.colors.primary};
        color: white !important;
      }
    }
    
    i.separator {
      border-left: 1px solid ${props => props.colors.border};
    }
  }
  
  .editor-statusbar {
    color: ${props => props.colors.textMuted};
    background-color: ${props => props.colors.surfaceHover};
    border-color: ${props => props.colors.border};
    transition: all 0.3s ease;
  }
  
  /* Mode sombre spécifique pour CodeMirror */
  ${props => props.darkMode && `
    .CodeMirror {
      .cm-header {
        color: ${props.colors.primary};
      }
      
      .cm-quote {
        color: ${props.colors.textSecondary};
      }
      
      .cm-link {
        color: ${props.colors.primaryLight};
      }
      
      .cm-strong {
        color: ${props.colors.textPrimary};
        font-weight: bold;
      }
      
      .cm-em {
        color: ${props.colors.textPrimary};
        font-style: italic;
      }
    }
  `}
`;

const MarkdownContainer = styled.div`
  padding: 16px;
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  background-color: ${props => props.colors.surface};
  line-height: 1.6;
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    color: ${props => props.colors.textPrimary};
  }
  
  h1 {
    font-size: 1.8em;
    border-bottom: 1px solid ${props => props.colors.borderLight};
    padding-bottom: 0.3em;
  }
  
  h2 {
    font-size: 1.5em;
  }
  
  h3 {
    font-size: 1.3em;
  }
  
  p {
    margin-bottom: 1em;
  }
  
  ul, ol {
    margin-left: 2em;
    margin-bottom: 1em;
  }
  
  li {
    margin-bottom: 0.5em;
  }
  
  a {
    color: ${props => props.colors.primary};
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      text-decoration: underline;
      color: ${props => props.colors.primaryLight};
    }
  }
  
  code {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.textPrimary};
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
    border: 1px solid ${props => props.colors.borderLight};
    transition: all 0.3s ease;
  }
  
  pre {
    background-color: ${props => props.colors.surfaceHover};
    border: 1px solid ${props => props.colors.border};
    border-radius: 4px;
    padding: 12px;
    overflow-x: auto;
    transition: all 0.3s ease;
    
    code {
      background: none;
      border: none;
      padding: 0;
    }
  }
  
  blockquote {
    margin-left: 0;
    padding-left: 1em;
    border-left: 4px solid ${props => props.colors.primary};
    color: ${props => props.colors.textSecondary};
    background-color: ${props => props.colors.surfaceHover};
    padding: 8px 16px;
    border-radius: 0 4px 4px 0;
    transition: all 0.3s ease;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    
    th, td {
      border: 1px solid ${props => props.colors.border};
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background-color: ${props => props.colors.surfaceHover};
      font-weight: 600;
    }
  }
`;

const EmptyContent = styled.em`
  color: ${props => props.colors.textMuted};
  display: block;
  padding: 16px;
  text-align: center;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  border: 1px solid ${props => props.colors.borderLight};
  transition: all 0.3s ease;
`;

export default MarkdownEditor;