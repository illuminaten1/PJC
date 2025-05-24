import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors } = useTheme();
  
  // Détermine si les options sont des objets ou des chaînes simples
  const hasObjectOptions = options.length > 0 && typeof options[0] === 'object' && 'value' in options[0];

  return (
    <FieldContainer hasError={!!error}>
      <FieldLabel colors={colors} htmlFor={name}>
        {label}
        {required && <Required colors={colors}>*</Required>}
      </FieldLabel>
      
      {type === 'select' ? (
        <SelectWrapper colors={colors} hasError={!!error}>
          <SelectField
            colors={colors}
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
          colors={colors}
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
          colors={colors}
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
      
      {error && <ErrorMessage colors={colors}>{error}</ErrorMessage>}
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
  color: ${props => props.colors.textPrimary};
  font-weight: 500;
  transition: color 0.3s ease;
`;

const Required = styled.span`
  color: ${props => props.colors.error};
  margin-left: 4px;
  transition: color 0.3s ease;
`;

const baseFieldStyles = (colors, hasError) => `
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 14px;
  border: 1px solid ${hasError ? colors.error : colors.border};
  background-color: ${colors.surface};
  color: ${colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${hasError ? colors.error : colors.primary};
    box-shadow: 0 0 0 2px ${hasError ? colors.error + '20' : colors.primary + '20'};
  }
  
  &:disabled {
    background-color: ${colors.surfaceHover};
    cursor: not-allowed;
    color: ${colors.textMuted};
  }
  
  &::placeholder {
    color: ${colors.textMuted};
  }
`;

const InputField = styled.input`
  ${props => baseFieldStyles(props.colors, props.hasError)}
  height: 40px;
`;

const TextareaField = styled.textarea`
  ${props => baseFieldStyles(props.colors, props.hasError)}
  min-height: 100px;
  resize: vertical;
`;

const SelectWrapper = styled.div`
  position: relative;
  
  &:after {
    content: '▼';
    font-size: 12px;
    position: absolute;
    right: 12px;
    top: 14px;
    color: ${props => props.colors.textMuted};
    pointer-events: none;
    transition: color 0.3s ease;
  }
`;

const SelectField = styled.select`
  ${props => baseFieldStyles(props.colors, props.hasError)}
  height: 40px;
  appearance: none;
  padding-right: 30px;
  cursor: pointer;
  width: 100%;
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.colors.error};
  font-size: 12px;
  margin-top: 4px;
  transition: color 0.3s ease;
`;

export default FormField;