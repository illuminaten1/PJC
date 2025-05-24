import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FaUserPlus, FaUserEdit, FaKey, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../common/Modal';

const UtilisateursTab = ({ showSuccessMessage, setErrorMessage, colors }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [utilisateursLoading, setUtilisateursLoading] = useState(false);
  const [utilisateurModalOpen, setUtilisateurModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  
  const [currentUtilisateur, setCurrentUtilisateur] = useState({
    id: '',
    username: '',
    password: '',
    nom: '',
    role: 'redacteur'
  });
  
  const [passwordChangeData, setPasswordChangeData] = useState({
    id: '',
    username: '',
    password: ''
  });
  
  const [utilisateurToDelete, setUtilisateurToDelete] = useState(null);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    setUtilisateursLoading(true);
    try {
      const response = await fetch('/api/utilisateurs', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      
      const data = await response.json();
      setUtilisateurs(data.utilisateurs || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs", err);
      setErrorMessage("Impossible de charger la liste des utilisateurs");
    } finally {
      setUtilisateursLoading(false);
    }
  };

  const openUtilisateurModal = (utilisateur = null) => {
    if (utilisateur) {
      setCurrentUtilisateur({
        id: utilisateur._id,
        username: utilisateur.username,
        password: '',
        nom: utilisateur.nom,
        role: utilisateur.role
      });
    } else {
      setCurrentUtilisateur({
        id: '',
        username: '',
        password: '',
        nom: '',
        role: 'redacteur'
      });
    }
    setUtilisateurModalOpen(true);
  };

  const openPasswordModal = (utilisateur) => {
    setPasswordChangeData({
      id: utilisateur._id,
      username: utilisateur.username,
      password: ''
    });
    setPasswordModalOpen(true);
  };

  const handleUtilisateurSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUtilisateur.username.trim() || (!currentUtilisateur.id && !currentUtilisateur.password.trim()) || !currentUtilisateur.nom.trim()) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      if (currentUtilisateur.id) {
        const requestBody = {
          username: currentUtilisateur.username,
          nom: currentUtilisateur.nom,
          role: currentUtilisateur.role
        };
        
        if (currentUtilisateur.password.trim()) {
          requestBody.password = currentUtilisateur.password;
        }
        
        const response = await fetch(`/api/utilisateurs/${currentUtilisateur.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'utilisateur');
        }
        
        showSuccessMessage('Utilisateur mis à jour avec succès');
      } else {
        const response = await fetch('/api/utilisateurs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify({
            username: currentUtilisateur.username,
            password: currentUtilisateur.password,
            nom: currentUtilisateur.nom,
            role: currentUtilisateur.role
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
        }
        
        showSuccessMessage('Utilisateur créé avec succès');
      }
      
      setUtilisateurModalOpen(false);
      fetchUtilisateurs();
    } catch (err) {
      console.error('Erreur lors de la gestion de l\'utilisateur:', err);
      setErrorMessage(err.message || 'Une erreur est survenue lors de la gestion de l\'utilisateur');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordChangeData.password.trim()) {
      setErrorMessage("Veuillez saisir un nouveau mot de passe");
      return;
    }
    
    try {
      const response = await fetch(`/api/utilisateurs/${passwordChangeData.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          password: passwordChangeData.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de mot de passe');
      }
      
      showSuccessMessage('Mot de passe modifié avec succès');
      setPasswordModalOpen(false);
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      setErrorMessage(err.message || 'Une erreur est survenue lors du changement de mot de passe');
    }
  };

  const toggleUtilisateurActif = async (utilisateur) => {
    try {
      const response = await fetch(`/api/utilisateurs/${utilisateur._id}/toggle-actif`, {
        method: 'PATCH',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de statut de l\'utilisateur');
      }
      
      showSuccessMessage(`Utilisateur ${utilisateur.actif ? 'désactivé' : 'activé'} avec succès`);
      fetchUtilisateurs();
    } catch (err) {
      console.error('Erreur lors du changement de statut de l\'utilisateur:', err);
      setErrorMessage(err.message || 'Une erreur est survenue lors du changement de statut de l\'utilisateur');
    }
  };

  const confirmerSuppressionUtilisateur = (utilisateur) => {
    setUtilisateurToDelete(utilisateur);
    setConfirmModalOpen(true);
  };

  const handleDeleteUtilisateur = async () => {
    if (!utilisateurToDelete) return;
    
    try {
      const response = await fetch(`/api/utilisateurs/${utilisateurToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
      
      showSuccessMessage('Utilisateur supprimé avec succès');
      setConfirmModalOpen(false);
      fetchUtilisateurs();
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      setErrorMessage(err.message || 'Une erreur est survenue lors de la suppression de l\'utilisateur');
      setConfirmModalOpen(false);
    }
  };

  if (utilisateursLoading) {
    return (
      <LoadingContainer colors={colors}>
        Chargement des utilisateurs...
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <HeaderSection>
        <AddButton onClick={() => openUtilisateurModal()} colors={colors}>
          <FaUserPlus />
          <span>Ajouter un utilisateur</span>
        </AddButton>
      </HeaderSection>
      
      {utilisateurs.length === 0 ? (
        <EmptyState colors={colors}>
          Aucun utilisateur trouvé. Cliquez sur "Ajouter un utilisateur" pour créer le premier compte.
        </EmptyState>
      ) : (
        <UsersList>
          {utilisateurs.map((utilisateur) => (
            <UserItem key={utilisateur._id} active={utilisateur.actif} colors={colors}>
              <UserInfo>
                <UserName colors={colors}>{utilisateur.nom}</UserName>
                <UserUsername colors={colors}>@{utilisateur.username}</UserUsername>
                <UserRole isAdmin={utilisateur.role === 'administrateur'} colors={colors}>
                  {utilisateur.role === 'administrateur' ? 'Administrateur' : 'Rédacteur'}
                </UserRole>
                <UserStatus active={utilisateur.actif} colors={colors}>
                  {utilisateur.actif ? 'Actif' : 'Inactif'}
                </UserStatus>
              </UserInfo>
              <UserActions>
                <ActionButton 
                  title="Modifier l'utilisateur" 
                  onClick={() => openUtilisateurModal(utilisateur)}
                  colors={colors}
                >
                  <FaUserEdit />
                </ActionButton>
                
                <ActionButton 
                  title="Changer le mot de passe" 
                  onClick={() => openPasswordModal(utilisateur)}
                  colors={colors}
                >
                  <FaKey />
                </ActionButton>
                
                <ActionButton 
                  title={utilisateur.actif ? "Désactiver l'utilisateur" : "Activer l'utilisateur"} 
                  onClick={() => toggleUtilisateurActif(utilisateur)}
                  variant={utilisateur.actif ? "warning" : "success"}
                  colors={colors}
                >
                  {utilisateur.actif ? <FaToggleOff /> : <FaToggleOn />}
                </ActionButton>
                
                {user && user.id !== utilisateur._id && (
                  <ActionButton 
                    title="Supprimer l'utilisateur" 
                    onClick={() => confirmerSuppressionUtilisateur(utilisateur)}
                    variant="danger"
                    colors={colors}
                  >
                    <FaTrash />
                  </ActionButton>
                )}
              </UserActions>
            </UserItem>
          ))}
        </UsersList>
      )}

      {/* Modal de création/modification d'utilisateur */}
      <Modal
        isOpen={utilisateurModalOpen}
        onClose={() => setUtilisateurModalOpen(false)}
        title={currentUtilisateur.id ? "Modifier un utilisateur" : "Ajouter un utilisateur"}
        size="medium"
        actions={
          <>
            <CancelButton onClick={() => setUtilisateurModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <SubmitButton onClick={handleUtilisateurSubmit} colors={colors}>
              {currentUtilisateur.id ? 'Enregistrer' : 'Créer'}
            </SubmitButton>
          </>
        }
      >
        <UserForm onSubmit={handleUtilisateurSubmit}>
          <FormGroup>
            <FormLabel colors={colors}>Nom d'utilisateur</FormLabel>
            <FormInput 
              type="text" 
              value={currentUtilisateur.username} 
              onChange={(e) => setCurrentUtilisateur({...currentUtilisateur, username: e.target.value})}
              placeholder="ex: jdupont"
              required
              colors={colors}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel colors={colors}>
              {currentUtilisateur.id ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            </FormLabel>
            <FormInput 
              type="password" 
              value={currentUtilisateur.password} 
              onChange={(e) => setCurrentUtilisateur({...currentUtilisateur, password: e.target.value})}
              placeholder={currentUtilisateur.id ? '••••••••' : 'Mot de passe'}
              required={!currentUtilisateur.id}
              colors={colors}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel colors={colors}>Nom complet</FormLabel>
            <FormInput 
              type="text" 
              value={currentUtilisateur.nom} 
              onChange={(e) => setCurrentUtilisateur({...currentUtilisateur, nom: e.target.value})}
              placeholder="ex: Jean Dupont"
              required
              colors={colors}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel colors={colors}>Rôle</FormLabel>
            <FormSelect
              value={currentUtilisateur.role}
              onChange={(e) => setCurrentUtilisateur({...currentUtilisateur, role: e.target.value})}
              colors={colors}
            >
              <option value="redacteur">Rédacteur</option>
              <option value="administrateur">Administrateur</option>
            </FormSelect>
            <FormHelpText colors={colors}>
              Les administrateurs peuvent gérer les utilisateurs et accéder à toutes les fonctionnalités.
              Les rédacteurs ne peuvent pas gérer les utilisateurs.
            </FormHelpText>
          </FormGroup>
        </UserForm>
      </Modal>
      
      {/* Modal de changement de mot de passe */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title={`Changer le mot de passe - ${passwordChangeData.username}`}
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setPasswordModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <SubmitButton onClick={handlePasswordChange} colors={colors}>
              Changer le mot de passe
            </SubmitButton>
          </>
        }
      >
        <UserForm onSubmit={handlePasswordChange}>
          <FormGroup>
            <FormLabel colors={colors}>Nouveau mot de passe</FormLabel>
            <FormInput 
              type="password" 
              value={passwordChangeData.password} 
              onChange={(e) => setPasswordChangeData({...passwordChangeData, password: e.target.value})}
              placeholder="Nouveau mot de passe"
              required
              colors={colors}
            />
          </FormGroup>
        </UserForm>
      </Modal>
      
      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Supprimer l'utilisateur"
        size="small"
        actions={
          <>
            <CancelButton onClick={() => setConfirmModalOpen(false)} colors={colors}>
              Annuler
            </CancelButton>
            <DeleteButton onClick={handleDeleteUtilisateur} colors={colors}>
              Supprimer
            </DeleteButton>
          </>
        }
      >
        <ConfirmContent colors={colors}>
          <p>
            Êtes-vous sûr de vouloir supprimer l'utilisateur 
            <strong> "{utilisateurToDelete?.username}"</strong> ?
          </p>
          <WarningText colors={colors}>
            Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
          </WarningText>
        </ConfirmContent>
      </Modal>
    </Container>
  );
};

// Styles avec thématisation
const Container = styled.div``;

const LoadingContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.colors.textMuted};
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: ${props => props.colors.success};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.success}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: ${props => props.colors.surfaceHover};
  border-radius: 8px;
  border: 1px solid ${props => props.colors.border};
  border-left: 4px solid ${props => props.active ? props.colors.success : props.colors.error};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.navActive};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadow};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const UserName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const UserUsername = styled.div`
  font-size: 14px;
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
`;

const UserRole = styled.div`
  display: inline-block;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  background-color: ${props => props.isAdmin ? props.colors.successBg : props.colors.primary + '20'};
  color: ${props => props.isAdmin ? props.colors.success : props.colors.primary};
  border: 1px solid ${props => props.isAdmin ? props.colors.success + '40' : props.colors.primary + '40'};
  transition: all 0.3s ease;
  width: fit-content;
  margin-top: 4px;
`;

const UserStatus = styled.div`
  display: inline-block;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  background-color: ${props => props.active ? props.colors.successBg : props.colors.errorBg};
  color: ${props => props.active ? props.colors.success : props.colors.error};
  border: 1px solid ${props => props.active ? props.colors.success + '40' : props.colors.error + '40'};
  transition: all 0.3s ease;
  width: fit-content;
  margin-top: 4px;
`;

const UserActions = styled.div`
  display: flex;
  gap: 8px;
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
  width: 36px;
  height: 36px;
  border-radius: 6px;
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
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  background-color: ${props => props.colors.surfaceHover};
  border: 1px solid ${props => props.colors.borderLight};
  border-radius: 8px;
  color: ${props => props.colors.textMuted};
  transition: all 0.3s ease;
`;

const UserForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 1px ${props => props.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.colors.textMuted};
  }
`;

const FormSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 1px ${props => props.colors.primary};
  }
  
  option {
    background-color: ${props => props.colors.surface};
    color: ${props => props.colors.textPrimary};
  }
`;

const FormHelpText = styled.div`
  font-size: 12px;
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
  line-height: 1.4;
`;

const ConfirmContent = styled.div`
  color: ${props => props.colors.textPrimary};
  transition: color 0.3s ease;
  
  p {
    margin-bottom: 16px;
    line-height: 1.6;
  }
`;

const WarningText = styled.p`
  color: ${props => props.colors.warning};
  font-size: 14px;
  margin-bottom: 8px;
  transition: color 0.3s ease;
`;

const CancelButton = styled.button`
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.surfaceHover};
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled.button`
  background-color: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

const DeleteButton = styled.button`
  background-color: ${props => props.colors.error};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.colors.error}dd;
    transform: translateY(-1px);
    box-shadow: ${props => props.colors.shadowHover};
  }
`;

export default UtilisateursTab;