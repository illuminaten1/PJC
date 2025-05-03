import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaFileAlt, FaCaretDown, FaFilePdf, FaFileWord } from 'react-icons/fa';

// Composant du bouton Synthèse avec menu déroulant
const SyntheseDropdownButton = ({ onGenerateSynthese }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le menu si on clique ailleurs sur la page
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton onClick={() => setMenuOpen(!menuOpen)}>
        <FaFileAlt style={{ marginRight: '6px' }} />
        <span>Synthèse</span>
        <FaCaretDown style={{ marginLeft: '6px' }} />
      </DropdownButton>
      
      {menuOpen && (
        <DropdownMenu>
          <DropdownItem onClick={() => {
            onGenerateSynthese('pdf');
            setMenuOpen(false);
          }}>
            <FaFilePdf style={{ color: '#dc3545', marginRight: '8px' }} />
            <span>Format PDF</span>
          </DropdownItem>
          <DropdownItem onClick={() => {
            onGenerateSynthese('docx');
            setMenuOpen(false);
          }}>
            <FaFileWord style={{ color: '#007bff', marginRight: '8px' }} />
            <span>Format DOCX</span>
          </DropdownItem>
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

// Styles (utilisant styled-components comme le reste de votre application)
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: #fff;
  color: #3f51b5;
  border: 1px solid #3f51b5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background-color: #3f51b5;
    color: #fff;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 160px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

export default SyntheseDropdownButton;