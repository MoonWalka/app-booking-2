import React, { useState } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';
import './OrganizationSelector.css';

const OrganizationSelector = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { 
    currentOrg, 
    userOrgs, 
    switchOrganization, 
    loading 
  } = useOrganization();

  const [showDropdown, setShowDropdown] = useState(false);

  // Obtenir le nom d'utilisateur (displayName ou email sans @domain)
  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Utilisateur';
  };

  // Si l'utilisateur n'a pas d'organisations
  if (!userOrgs || userOrgs.length === 0) {
    return null;
  }

  const handleOrganizationChange = async (orgId) => {
    if (orgId && orgId !== currentOrg?.id) {
      await switchOrganization(orgId);
      setShowDropdown(false);
      // Recharger la page pour s'assurer que toutes les données sont mises à jour
      window.location.reload();
    }
  };

  const handleCreateOrganization = () => {
    setShowDropdown(false);
    // Rediriger vers la page d'onboarding en mode création
    window.location.href = '/?action=create';
  };

  const handleJoinOrganization = () => {
    setShowDropdown(false);
    // Rediriger vers la page d'onboarding en mode rejoindre
    window.location.href = '/?action=join';
  };

  if (loading) {
    return (
      <div className={`organization-selector ${className}`}>
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // Interface utilisateur avec dropdown d'organisations
  return (
    <div className={`organization-selector user-profile ${className}`}>
      <div className="dropdown">
        <button
          className="btn btn-link text-light p-0 dropdown-toggle user-profile-button"
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ border: 'none', textDecoration: 'none', width: '100%' }}
        >
          <div className="d-flex align-items-center">
            {/* Avatar utilisateur */}
            <div className="user-avatar me-3">
              <i className="bi bi-person-circle"></i>
            </div>
            
            <div className="user-info text-start flex-grow-1">
              {/* Nom d'utilisateur */}
              <div className="user-name fw-medium">
                {getUserDisplayName()}
              </div>
              
              {/* Organisation courante */}
              <small className="text-muted d-block">
                {currentOrg ? (
                  <>
                    <i className="bi bi-building me-1"></i>
                    {currentOrg.name}
                    {currentOrg.userRole === 'owner' && ' (Propriétaire)'}
                    {currentOrg.userRole === 'admin' && ' (Admin)'}
                  </>
                ) : (
                  'Aucune organisation'
                )}
              </small>
            </div>
            
            {/* Icône dropdown */}
            <i className="bi bi-chevron-up ms-2" style={{ fontSize: '0.8rem' }}></i>
          </div>
        </button>

        {showDropdown && (
          <div className="dropdown-menu dropdown-menu-end show" style={{ minWidth: '280px', bottom: '100%', top: 'auto' }}>
            {/* Informations utilisateur */}
            <div className="dropdown-header d-flex align-items-center">
              <div className="user-avatar me-2">
                <i className="bi bi-person-circle"></i>
              </div>
              <div>
                <div className="fw-medium">{getUserDisplayName()}</div>
                <small className="text-muted">{currentUser?.email}</small>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            {/* Liste des organisations existantes */}
            <h6 className="dropdown-header">Mes organisations</h6>
            
            {userOrgs.map(org => (
              <button
                key={org.id}
                className={`dropdown-item d-flex justify-content-between ${org.id === currentOrg?.id ? 'active' : ''}`}
                onClick={() => handleOrganizationChange(org.id)}
              >
                <div>
                  <div className="fw-medium">
                    {org.name}
                    {org.userRole === 'owner' && ' (Propriétaire)'}
                    {org.userRole === 'admin' && ' (Admin)'}
                  </div>
                  <small className="text-muted">
                    {org.settings?.timezone || 'Europe/Paris'} • {org.settings?.currency || 'EUR'}
                  </small>
                </div>
                {org.id === currentOrg?.id && (
                  <i className="bi bi-check-circle-fill text-success"></i>
                )}
              </button>
            ))}
            
            <div className="dropdown-divider"></div>
            
            {/* Actions pour créer/rejoindre */}
            <h6 className="dropdown-header">Actions</h6>
            
            <button
              className="dropdown-item"
              onClick={handleCreateOrganization}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Créer une organisation
            </button>
            
            <button
              className="dropdown-item"
              onClick={handleJoinOrganization}
            >
              <i className="bi bi-people me-2"></i>
              Rejoindre une organisation
            </button>
            
            <div className="dropdown-divider"></div>
            
            <button
              className="dropdown-item"
              onClick={() => {
                setShowDropdown(false);
                window.location.href = '/parametres/organisations';
              }}
            >
              <i className="bi bi-gear me-2"></i>
              Gérer les organisations
            </button>
          </div>
        )}
      </div>

      {/* Overlay pour fermer le dropdown */}
      {showDropdown && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1000 }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default OrganizationSelector; 