import React from 'react';
import styled from 'styled-components';

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '', 
  options = [], 
  required = false, 
  disabled = false,
  error = null
}) => {
  // Détermine si les options sont des objets ou des chaînes simples
  const hasObjectOptions = options.length > 0 && typeof options[0] === 'object' && 'value' in options[0];

  return (
    <FieldContainer hasError={!!error}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && <Required>*</Required>}
      </FieldLabel>
      
      {type === 'select' ? (
        <SelectWrapper hasError={!!error}>
          <SelectField
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            hasError={!!error}
          >
            <option value="">-- Sélectionner --</option>
            {hasObjectOptions 
              ? options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))
            }
          </SelectField>
        </SelectWrapper>
      ) : type === 'textarea' ? (
        <TextareaField
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          hasError={!!error}
        />
      ) : (
        <InputField
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          hasError={!!error}
        />
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FieldContainer>
  );
};

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${props => props.hasError ? '2px' : '12px'};
  position: relative;
`;

const FieldLabel = styled.label`
  font-size: 14px;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
`;

const Required = styled.span`
  color: #d32f2f;
  margin-left: 4px;
`;

const baseFieldStyles = `
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 14px;
  border: 1px solid #ddd;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const InputField = styled.input`
  ${baseFieldStyles}
  height: 40px;
  border-color: ${props => props.hasError ? '#d32f2f' : '#ddd'};
  
  &:focus {
    border-color: ${props => props.hasError ? '#d32f2f' : '#3f51b5'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(211, 47, 47, 0.2)' : 'rgba(63, 81, 181, 0.2)'};
  }
`;

const TextareaField = styled.textarea`
  ${baseFieldStyles}
  min-height: 100px;
  resize: vertical;
  border-color: ${props => props.hasError ? '#d32f2f' : '#ddd'};
  
  &:focus {
    border-color: ${props => props.hasError ? '#d32f2f' : '#3f51b5'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(211, 47, 47, 0.2)' : 'rgba(63, 81, 181, 0.2)'};
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  
  &:after {
    content: '▼';
    font-size: 12px;
    position: absolute;
    right: 12px;
    top: 14px;
    color: #666;
    pointer-events: none;
  }
  
  border-color: ${props => props.hasError ? '#d32f2f' : '#ddd'};
`;

const SelectField = styled.select`
  ${baseFieldStyles}
  height: 40px;
  appearance: none;
  padding-right: 30px;
  cursor: pointer;
  width: 100%;
  border-color: ${props => props.hasError ? '#d32f2f' : '#ddd'};
  
  &:focus {
    border-color: ${props => props.hasError ? '#d32f2f' : '#3f51b5'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(211, 47, 47, 0.2)' : 'rgba(63, 81, 181, 0.2)'};
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
`;

export default FormField;