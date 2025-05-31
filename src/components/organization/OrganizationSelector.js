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

  // Ne pas afficher si l'utilisateur n'a qu'une seule organisation
  if (!userOrgs || userOrgs.length <= 1) {
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