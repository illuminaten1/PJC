import React, { useCallback } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

// Composant d'édition Markdown
export const MarkdownEditor = ({ value, onChange, name = 'notes', placeholder = 'Saisir vos notes avec formatage...' }) => {
  // Utiliser useCallback pour éviter les re-rendus inutiles
  const handleChange = useCallback((value) => {
    onChange({
      target: {
        name,
        value
      }
    });
  }, [onChange, name]);
  
  return (
    <EditorContainer>
      <SimpleMDE
        value={value}
        onChange={handleChange}
        options={{
          spellChecker: false,
          toolbar: ["bold", "italic", "heading", "|", "unordered-list", "ordered-list", "|", "link", "|", "preview"],
          placeholder,
          status: false,
          autofocus: true,
        }}
      />
    </EditorContainer>
  );
};

// Composant d'affichage Markdown
export const MarkdownDisplay = ({ content }) => {
  if (!content) return <EmptyContent>Aucune note</EmptyContent>;
  
  return (
    <MarkdownContainer>
      <ReactMarkdown>{content}</ReactMarkdown>
    </MarkdownContainer>
  );
};

const EditorContainer = styled.div`
  .CodeMirror {
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 200px;
  }
  
  .editor-toolbar {
    border: 1px solid #ddd;
    border-radius: 4px 4px 0 0;
  }
`;

const MarkdownContainer = styled.div`
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fff;
  line-height: 1.6;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  
  h1 {
    font-size: 1.8em;
    border-bottom: 1px solid #eee;
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
    color: #3f51b5;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    background-color: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }
  
  blockquote {
    margin-left: 0;
    padding-left: 1em;
    border-left: 4px solid #eee;
    color: #666;
  }
`;

const EmptyContent = styled.em`
  color: #757575;
  display: block;
  padding: 16px;
`;

export default MarkdownEditor;