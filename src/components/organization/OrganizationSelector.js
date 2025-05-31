import React from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import './OrganizationSelector.css';

const OrganizationSelector = ({ className = '' }) => {
  const { 
    currentOrg, 
    userOrgs, 
    switchOrganization, 
    loading 
  } = useOrganization();

  // Si l'utilisateur n'a pas d'organisations
  if (!userOrgs || userOrgs.length === 0) {
    return null;
  }

  const handleOrganizationChange = async (e) => {
    const orgId = e.target.value;
    if (orgId && orgId !== currentOrg?.id) {
      await switchOrganization(orgId);
      // Recharger la page pour s'assurer que toutes les données sont mises à jour
      window.location.reload();
    }
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

  // Si une seule organisation, afficher en lecture seule
  if (userOrgs.length === 1) {
    const org = userOrgs[0];
    return (
      <div className={`organization-selector ${className}`}>
        <div className="d-flex align-items-center">
          <i className="bi bi-building me-2"></i>
          <span className="text-light fw-medium">
            {org.name}
            {org.userRole === 'owner' && ' (Propriétaire)'}
            {org.userRole === 'admin' && ' (Admin)'}
          </span>
        </div>
        
        {org && (
          <small className="text-muted d-block mt-1">
            {org.settings?.timezone || 'Europe/Paris'} • {org.settings?.currency || 'EUR'}
          </small>
        )}
      </div>
    );
  }

  // Plusieurs organisations, afficher le sélecteur
  return (
    <div className={`organization-selector ${className}`}>
      <div className="d-flex align-items-center">
        <i className="bi bi-building me-2"></i>
        <select 
          value={currentOrg?.id || ''} 
          onChange={handleOrganizationChange}
          className="form-select form-select-sm"
          disabled={loading}
        >
          {!currentOrg && (
            <option value="">Sélectionner une organisation</option>
          )}
          {userOrgs.map(org => (
            <option key={org.id} value={org.id}>
              {org.name}
              {org.userRole === 'owner' && ' (Propriétaire)'}
              {org.userRole === 'admin' && ' (Admin)'}
            </option>
          ))}
        </select>
      </div>
      
      {currentOrg && (
        <small className="text-muted d-block mt-1">
          {currentOrg.settings?.timezone || 'Europe/Paris'} • {currentOrg.settings?.currency || 'EUR'}
        </small>
      )}
    </div>
  );
};

export default OrganizationSelector; 