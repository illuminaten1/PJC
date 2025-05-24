import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium', 
  actions = null,
  headerContent = null,
  noPadding = false,
  isPreview = false
}) => {
  const { colors } = useTheme();
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <Backdrop onClick={handleBackdropClick} size={size}>
      <ModalContainer colors={colors} size={size} isPreview={isPreview}>
        <ModalHeader colors={colors}>
          <ModalTitle colors={colors}>{title}</ModalTitle>
          {headerContent && <HeaderActions>{headerContent}</HeaderActions>}
          <CloseButton colors={colors} onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalContent colors={colors} noPadding={noPadding} isPreview={isPreview}>
          {children}
        </ModalContent>
        
        {actions && <ModalActions colors={colors}>{actions}</ModalActions>}
      </ModalContainer>
    </Backdrop>
  );
};

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => (props.size === 'full' || props.size === 'fullscreen') ? '10px' : '20px'};
`;

const getModalWidth = (size) => {
  switch(size) {
    case 'small':
      return '400px';
    case 'large':
      return '800px';
    case 'full':
    case 'fullscreen':
      return '95%';
    case 'medium':
    default:
      return '600px';
  }
};

const ModalContainer = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadowHover};
  max-width: ${props => getModalWidth(props.size)};
  width: 100%;
  max-height: ${props => (props.size === 'full' || props.size === 'fullscreen') ? '95vh' : '90vh'};
  height: ${props => (props.size === 'full' || props.size === 'fullscreen') && props.isPreview ? '95vh' : 'auto'};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.colors.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background-color: ${props => props.colors.surfaceHover};
  transition: all 0.3s ease;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  flex: 1;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 15px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.colors.textMuted};
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.colors.textPrimary};
    background-color: ${props => props.colors.navActive};
  }
`;

const ModalContent = styled.div`
  padding: ${props => props.noPadding ? '0' : '20px'};
  overflow-y: auto;
  flex: 1;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  /* Styles spécifiques pour les prévisualisations */
  ${props => props.isPreview && `
    padding: 0;
    display: flex;
    flex-direction: column;
    
    /* Pour s'assurer que les containers enfants prennent toute la hauteur */
    & > div {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `}
`;

const ModalActions = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${props => props.colors.borderLight};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  background-color: ${props => props.colors.surfaceHover};
  transition: all 0.3s ease;
`;

export default Modal;