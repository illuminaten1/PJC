// Toast.js - Composant de notification flottante
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const Toast = ({ message, type, onClose, isClosing, colors }) => {
  return (
    <ToastContainer type={type} isClosing={isClosing} colors={colors}>
      <ToastIcon colors={colors}>
        {type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
      </ToastIcon>
      <ToastMessage colors={colors}>{message}</ToastMessage>
      <CloseButton onClick={onClose} colors={colors}>
        <FaTimes />
      </CloseButton>
    </ToastContainer>
  );
};

const ToastContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 500px;
  animation: ${props => props.isClosing ? slideOut : slideIn} 0.3s ease-in-out;
  background-color: ${props => props.type === 'success' ? props.colors.successBg : props.colors.errorBg};
  border: 1px solid ${props => props.type === 'success' ? props.colors.success + '40' : props.colors.error + '40'};
  border-left: 4px solid ${props => props.type === 'success' ? props.colors.success : props.colors.error};
`;

const ToastIcon = styled.div`
  margin-right: 12px;
  font-size: 16px;
  color: ${props => props.colors.success};
  display: flex;
  align-items: center;
`;

const ToastMessage = styled.div`
  flex: 1;
  color: ${props => props.colors.textPrimary};
  font-size: 14px;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.colors.textMuted};
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    color: ${props => props.colors.textPrimary};
  }
`;

// ToastContainer.js - Conteneur pour gérer plusieurs toasts
export const ToastProvider = ({ children, colors }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, isClosing: false };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    // Auto-remove après 4 secondes
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prevToasts => 
      prevToasts.map(toast => 
        toast.id === id ? { ...toast, isClosing: true } : toast
      )
    );
    
    // Supprimer définitivement après animation
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const contextValue = React.useMemo(() => ({
    showSuccessToast: (message) => addToast(message, 'success'),
    showErrorToast: (message) => addToast(message, 'error'),
  }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainerStyled>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isClosing={toast.isClosing}
            onClose={() => removeToast(toast.id)}
            colors={colors}
          />
        ))}
      </ToastContainerStyled>
    </ToastContext.Provider>
  );
};

const ToastContainerStyled = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    right: 10px;
    left: 10px;
    top: 70px;
  }
`;

// Context pour utiliser les toasts
export const ToastContext = React.createContext();

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;