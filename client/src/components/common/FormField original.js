import React from 'react';
import styled from 'styled-components';

const FormField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  required = false,
  error = '',
  options = [],
  multiple = false
}) => {
  const renderField = () => {
    switch(type) {
      case 'select':
        return (
          <StyledSelect 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            multiple={multiple}
            hasError={!!error}
          >
            <option value="">Sélectionner</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </StyledSelect>
        );
      
      case 'textarea':
        return (
          <StyledTextarea 
            name={name} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            required={required}
            hasError={!!error}
          />
        );
      
      case 'checkbox':
        return (
          <CheckboxContainer>
            <StyledCheckbox 
              type="checkbox" 
              name={name} 
              checked={value} 
              onChange={onChange} 
              required={required}
            />
            <CheckboxLabel>{label}</CheckboxLabel>
          </CheckboxContainer>
        );
      
      default:
        return (
          <StyledInput 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            required={required}
            hasError={!!error}
          />
        );
    }
  };
  
  return (
    <FieldContainer>
      {type !== 'checkbox' && (
        <FieldLabel>
          {label}
          {required && <Required>*</Required>}
        </FieldLabel>
      )}
      
      {renderField()}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FieldContainer>
  );
};

const FieldContainer = styled.div`
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

const Required = styled.span`
  color: #f44336;
  margin-left: 4px;
`;

const InputStyles = `
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
  }
`;

const StyledInput = styled.input`
  ${InputStyles}
  border-color: ${props => props.hasError ? '#f44336' : '#ddd'};
`;

const StyledSelect = styled.select`
  ${InputStyles}
  border-color: ${props => props.hasError ? '#f44336' : '#ddd'};
  height: ${props => props.multiple ? 'auto' : '40px'};
  min-height: ${props => props.multiple ? '100px' : 'auto'};
`;

const StyledTextarea = styled.textarea`
  ${InputStyles}
  border-color: ${props => props.hasError ? '#f44336' : '#ddd'};
  min-height: 100px;
  resize: vertical;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledCheckbox = styled.input`
  margin-right: 8px;
`;

const CheckboxLabel = styled.span`
  font-size: 14px;
`;

const ErrorMessage = styled.p`
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 0;
`;

export default FormField;