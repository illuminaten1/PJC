import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FaUserEdit, FaKey, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Composant qui affiche la liste des utilisateurs sous forme de tableau
 * avec des options pour les gérer (modifier, supprimer, etc.)
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.utilisateurs - Liste des utilisateurs à afficher
 * @param {Function} props.onEdit - Fonction appelée pour modifier un utilisateur
 * @param {Function} props.onChangePassword - Fonction appelée pour changer le mot de passe
 * @param {Function} props.onToggleStatus - Fonction appelée pour activer/désactiver un utilisateur
 * @param {Function} props.onDelete - Fonction appelée pour supprimer un utilisateur
 */
const UtilisateursTable = ({ 
  utilisateurs, 
  onEdit, 
  onChangePassword, 
  onToggleStatus, 
  onDelete 
}) => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  
  // Si aucun utilisateur n'est fourni ou si la liste est vide
  if (!utilisateurs || utilisateurs.length === 0) {
    return (
      <EmptyState colors={colors}>
        Aucun utilisateur trouvé.
      </EmptyState>
    );
  }
  
  return (
    <TableContainer colors={colors}>
      <Table colors={colors}>
        <TableHead colors={colors}>
          <TableRow>
            <TableHeader colors={colors}>Nom d'utilisateur</TableHeader>
            <TableHeader colors={colors}>Nom complet</TableHeader>
            <TableHeader colors={colors}>Rôle</TableHeader>
            <TableHeader colors={colors}>Statut</TableHeader>
            <TableHeader colors={colors}>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody colors={colors}>
          {utilisateurs.map(utilisateur => (
            <TableRow key={utilisateur._id} active={utilisateur.actif} colors={colors}>
              <TableCell colors={colors}>{utilisateur.username}</TableCell>
              <TableCell colors={colors}>{utilisateur.nom}</TableCell>
              <TableCell colors={colors}>
                <RoleBadge isAdmin={utilisateur.role === 'administrateur'} colors={colors}>
                  {utilisateur.role === 'administrateur' ? 'Administrateur' : 'Rédacteur'}
                </RoleBadge>
              </TableCell>
              <TableCell colors={colors}>
                <StatusBadge active={utilisateur.actif} colors={colors}>
                  {utilisateur.actif ? 'Actif' : 'Inactif'}
                </StatusBadge>
              </TableCell>
              <TableCell colors={colors}>
                <ActionsContainer>
                  <ActionButton 
                    title="Modifier" 
                    onClick={() => onEdit(utilisateur)}
                    colors={colors}
                  >
                    <FaUserEdit />
                  </ActionButton>
                  
                  <ActionButton 
                    title="Changer le mot de passe" 
                    onClick={() => onChangePassword(utilisateur)}
                    colors={colors}
                  >
                    <FaKey />
                  </ActionButton>
                  
                  <ActionButton 
                    title={utilisateur.actif ? "Désactiver" : "Activer"} 
                    onClick={() => onToggleStatus(utilisateur)}
                    variant={utilisateur.actif ? "warning" : "success"}
                    colors={colors}
                  >
                    {utilisateur.actif ? <FaToggleOff /> : <FaToggleOn />}
                  </ActionButton>
                  
                  {/* Ne pas permettre de supprimer son propre compte */}
                  {user && user.id !== utilisateur._id && (
                    <ActionButton 
                      title="Supprimer" 
                      onClick={() => onDelete(utilisateur)}
                      variant="danger"
                      colors={colors}
                    >
                      <FaTrash />
                    </ActionButton>
                  )}
                </ActionsContainer>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

UtilisateursTable.propTypes = {
  utilisateurs: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

// Styles avec thématisation
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  background-color: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
`;

const TableHead = styled.thead`
  background-color: ${props => props.colors.surfaceHover};
  transition: background-color 0.3s ease;
`;

const TableBody = styled.tbody`
  background-color: ${props => props.colors.surface};
  transition: background-color 0.3s ease;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.colors.borderLight};
  background-color: ${props => props.active ? props.colors.surface : props.colors.surface + 'f0'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.isAdmin ? props.colors.success : props.colors.primary};
  color: white;
  transition: background-color 0.3s ease;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.active ? props.colors.successBg : props.colors.errorBg};
  color: ${props => props.active ? props.colors.success : props.colors.error};
  border: 1px solid ${props => props.active ? props.colors.success + '40' : props.colors.error + '40'};
  transition: all 0.3s ease;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: ${props => {
    switch (props.variant) {
      case 'danger':
        return props.colors.error;
      case 'warning':
        return props.colors.warning;
      case 'success':
        return props.colors.success;
      default:
        return props.colors.primary;
    }
  }};
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => {
      switch (props.variant) {
        case 'danger':
          return props.colors.error + 'dd';
        case 'warning':
          return props.colors.warning + 'dd';
        case 'success':
          return props.colors.success + 'dd';
        default:
          return props.colors.primaryDark;
      }
    }};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
  
  &:active {
    transform: translateY(0) scale(0.95);
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 4px;
  color: ${props => props.colors.textMuted};
  transition: all 0.3s ease;
`;

export default UtilisateursTable;