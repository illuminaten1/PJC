import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaFileAlt, FaCaretDown, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

// Composant du bouton Synthèse avec menu déroulant
const SyntheseDropdownButton = ({ onGenerateSynthese }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { colors } = useTheme();

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
      <DropdownButton onClick={() => setMenuOpen(!menuOpen)} colors={colors} menuOpen={menuOpen}>
        <FaFileAlt style={{ marginRight: '6px' }} />
        <span>Synthèse</span>
        <CaretIcon menuOpen={menuOpen} colors={colors}>
          <FaCaretDown />
        </CaretIcon>
      </DropdownButton>
      
      {menuOpen && (
        <DropdownMenu colors={colors}>
          <DropdownItem colors={colors} onClick={() => {
            onGenerateSynthese('pdf');
            setMenuOpen(false);
          }}>
            <IconWrapper>
              <FaFilePdf style={{ color: colors.error }} />
            </IconWrapper>
            <span>Format PDF</span>
          </DropdownItem>
          <DropdownItem colors={colors} onClick={() => {
            onGenerateSynthese('docx');
            setMenuOpen(false);
          }}>
            <IconWrapper>
              <FaFileWord style={{ color: colors.cardIcon.affaires.color }} />
            </IconWrapper>
            <span>Format DOCX</span>
          </DropdownItem>
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

// Styles avec thématisation
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.primary};
  border: 1px solid ${props => props.colors.primary};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 36px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: ${props => props.menuOpen ? props.colors.shadow : 'none'};
  
  &:hover {
    background-color: ${props => props.colors.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CaretIcon = styled.div`
  margin-left: 6px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  transform: ${props => props.menuOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 160px;
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadowHover};
  border: 1px solid ${props => props.colors.border};
  z-index: 10;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Animation d'apparition */
  animation: fadeInDown 0.2s ease-out;
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    color: ${props => props.colors.primary};
    
    /* Effet de highlight sur l'icône au hover */
    svg {
      transform: scale(1.1);
    }
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.colors.borderLight};
  }
  
  span {
    flex-grow: 1;
    font-weight: 500;
  }
`;

const IconWrapper = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  
  svg {
    transition: transform 0.3s ease;
  }
`;

export default SyntheseDropdownButton;