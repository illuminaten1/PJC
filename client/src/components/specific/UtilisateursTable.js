import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FaUserEdit, FaKey, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';

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
  
  // Si aucun utilisateur n'est fourni ou si la liste est vide
  if (!utilisateurs || utilisateurs.length === 0) {
    return (
      <EmptyState>
        Aucun utilisateur trouvé.
      </EmptyState>
    );
  }
  
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Nom d'utilisateur</TableHeader>
            <TableHeader>Nom complet</TableHeader>
            <TableHeader>Rôle</TableHeader>
            <TableHeader>Statut</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {utilisateurs.map(utilisateur => (
            <TableRow key={utilisateur._id} active={utilisateur.actif}>
              <TableCell>{utilisateur.username}</TableCell>
              <TableCell>{utilisateur.nom}</TableCell>
              <TableCell>
                <RoleBadge isAdmin={utilisateur.role === 'administrateur'}>
                  {utilisateur.role === 'administrateur' ? 'Administrateur' : 'Rédacteur'}
                </RoleBadge>
              </TableCell>
              <TableCell>
                <StatusBadge active={utilisateur.actif}>
                  {utilisateur.actif ? 'Actif' : 'Inactif'}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <ActionsContainer>
                  <ActionButton 
                    title="Modifier" 
                    onClick={() => onEdit(utilisateur)}
                  >
                    <FaUserEdit />
                  </ActionButton>
                  
                  <ActionButton 
                    title="Changer le mot de passe" 
                    onClick={() => onChangePassword(utilisateur)}
                  >
                    <FaKey />
                  </ActionButton>
                  
                  <ActionButton 
                    title={utilisateur.actif ? "Désactiver" : "Activer"} 
                    onClick={() => onToggleStatus(utilisateur)}
                    variant={utilisateur.actif ? "warning" : "success"}
                  >
                    {utilisateur.actif ? <FaToggleOff /> : <FaToggleOn />}
                  </ActionButton>
                  
                  {/* Ne pas permettre de supprimer son propre compte */}
                  {user && user.id !== utilisateur._id && (
                    <ActionButton 
                      title="Supprimer" 
                      onClick={() => onDelete(utilisateur)}
                      variant="danger"
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

// Styles
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
`;

const TableHead = styled.thead`
  background-color: #f5f5f5;
`;

const TableBody = styled.tbody`
  background-color: white;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  background-color: ${props => props.active ? 'white' : 'rgba(0, 0, 0, 0.02)'};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.isAdmin ? '#4caf50' : '#3f51b5'};
  color: white;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.active ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.active ? '#2e7d32' : '#c62828'};
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
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'success':
        return '#4caf50';
      default:
        return '#3f51b5';
    }
  }};
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
    background-color: ${props => {
      switch (props.variant) {
        case 'danger':
          return '#d32f2f';
        case 'warning':
          return '#f57c00';
        case 'success':
          return '#388e3c';
        default:
          return '#303f9f';
      }
    }};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #666;
`;

export default UtilisateursTable;