import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { 
  generateInvitationCode, 
  getOrganizationMembers, 
  leaveOrganization 
} from '@/services/firebase-service';
import Card from '@/components/ui/Card';
import './ParametresOrganisations.module.css';

const ParametresOrganisations = () => {
  const { currentUser } = useAuth();
  const { 
    userOrgs: organizations, 
    currentOrg, 
    switchOrganization, 
    needsOnboarding
  } = useOrganization();
  
  const [members, setMembers] = useState([]);
  const [invitationCodes, setInvitationCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger les membres de l'organisation courante
  useEffect(() => {
    const loadMembers = async () => {
      if (!currentOrg?.id) return;
      
      try {
        setLoading(true);
        const membersData = await getOrganizationMembers(currentOrg.id);
        setMembers(membersData);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
        setError('Impossible de charger les membres de l\'organisation');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [currentOrg?.id]);

  // Générer un code d'invitation
  const handleGenerateInvitation = async (role = 'member') => {
    try {
      setLoading(true);
      setError(null);
      
      const code = await generateInvitationCode(currentOrg.id, currentUser.uid, role);
      
      const newInvitation = {
        code,
        role,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      };
      
      setInvitationCodes(prev => [newInvitation, ...prev]);
      setSuccess(`Code d'invitation généré : ${code}`);
    } catch (error) {
      console.error('Erreur génération invitation:', error);
      setError('Impossible de générer le code d\'invitation');
    } finally {
      setLoading(false);
    }
  };

  // Quitter une organisation
  const handleLeaveOrganization = async (orgId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir quitter cette organisation ?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await leaveOrganization(orgId, currentUser.uid);
      setSuccess('Vous avez quitté l\'organisation avec succès');
      
      // Recharger les organisations
      window.location.reload(); // Simple reload pour cette démo
    } catch (error) {
      console.error('Erreur pour quitter l\'organisation:', error);
      setError(error.message || 'Impossible de quitter l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  // Changer d'organisation par défaut
  const handleSetDefaultOrganization = (orgId) => {
    switchOrganization(orgId);
    setSuccess('Organisation par défaut mise à jour');
  };

  const getRoleLabel = (role) => {
    const roles = {
      owner: 'Propriétaire',
      admin: 'Administrateur',
      member: 'Membre'
    };
    return roles[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      owner: 'bg-primary',
      admin: 'bg-warning',
      member: 'bg-secondary'
    };
    return `badge ${classes[role] || 'bg-secondary'}`;
  };

  // Si l'utilisateur n'a pas d'organisations, afficher un message d'accueil
  if (needsOnboarding || (!organizations || organizations.length === 0)) {
    return (
      <div className="parametres-organisations">
        <h3 className="mb-4">Gestion des organisations</h3>
        
        <Card title="Bienvenue ! 🎭">
          <div className="text-center">
            <p className="text-muted mb-4">
              Vous n'avez pas encore d'organisation. Pour commencer à utiliser TourCraft, 
              vous devez créer une organisation ou rejoindre une organisation existante.
            </p>
            
            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/onboarding?action=create'}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Créer une organisation
              </button>
              
              <button 
                className="btn btn-outline-primary"
                onClick={() => window.location.href = '/onboarding?action=join'}
              >
                <i className="bi bi-people me-2"></i>
                Rejoindre une organisation
              </button>
            </div>
            
            <p className="text-muted small mt-3">
              Ces options sont également disponibles sur la page d'accueil de l'application.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <Card title="Gestion des organisations">
        <p className="text-muted">Chargement de votre organisation...</p>
      </Card>
    );
  }

  return (
    <div className="parametres-organisations">
      <h3 className="mb-4">Gestion des organisations</h3>

      {/* Alertes */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* Liste des organisations */}
      <Card title="Mes organisations" className="mb-4">
        {!organizations || organizations.length === 0 ? (
          <p className="text-muted">Aucune organisation trouvée.</p>
        ) : (
          <div className="list-group list-group-flush">
            {organizations.map(org => (
              <div key={org.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">{org.name}</h6>
                  <p className="mb-1 text-muted small">{org.description || 'Aucune description'}</p>
                  <div className="d-flex gap-2">
                    <span className={getRoleBadgeClass(org.userRole)}>
                      {getRoleLabel(org.userRole)}
                    </span>
                    {org.id === currentOrg?.id && (
                      <span className="badge bg-success">Actuelle</span>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {org.id !== currentOrg?.id && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleSetDefaultOrganization(org.id)}
                    >
                      Définir par défaut
                    </button>
                  )}
                  {org.userRole !== 'owner' && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleLeaveOrganization(org.id)}
                      disabled={loading}
                    >
                      Quitter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Boutons d'action */}
        <div className="mt-3 d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/onboarding?action=create'}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Créer une organisation
          </button>
          
          <button
            className="btn btn-outline-primary"
            onClick={() => window.location.href = '/onboarding?action=join'}
          >
            <i className="bi bi-people me-2"></i>
            Rejoindre une organisation
          </button>
        </div>
      </Card>

      {/* Gestion de l'organisation courante */}
      {currentOrg && (
        <>
          {/* Membres de l'organisation */}
          <Card title={`Membres de "${currentOrg.name}"`} className="mb-4">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : members.length === 0 ? (
              <p className="text-muted">Aucun membre trouvé.</p>
            ) : (
              <div className="list-group list-group-flush">
                {members.map(member => (
                  <div key={member.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{member.displayName || 'Nom non disponible'}</h6>
                      <p className="mb-0 text-muted small">{member.email}</p>
                    </div>
                    <span className={getRoleBadgeClass(member.role)}>
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Invitations */}
          {(currentOrg.userRole === 'owner' || currentOrg.userRole === 'admin') && (
            <Card title="Invitations" className="mb-4">
              <div className="mb-3">
                <h6>Générer un code d'invitation</h6>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGenerateInvitation('member')}
                    disabled={loading}
                  >
                    Membre
                  </button>
                  {currentOrg.userRole === 'owner' && (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleGenerateInvitation('admin')}
                      disabled={loading}
                    >
                      Administrateur
                    </button>
                  )}
                </div>
              </div>

              {invitationCodes.length > 0 && (
                <div>
                  <h6>Codes d'invitation récents</h6>
                  <div className="list-group list-group-flush">
                    {invitationCodes.map((invitation, index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <code className="h5">{invitation.code}</code>
                            <p className="mb-0 text-muted small">
                              Rôle: {getRoleLabel(invitation.role)} | 
                              Expire le: {invitation.expiresAt.toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigator.clipboard.writeText(invitation.code)}
                          >
                            Copier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ParametresOrganisations;