import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getCurrentOrganization, 
  setCurrentOrganization, 
  getUserOrganizations,
  clearCurrentOrganization 
} from '@/services/firebase-service';

// Créer le contexte
const OrganizationContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'organisation
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization doit être utilisé dans OrganizationProvider');
  }
  return context;
};

// Provider du contexte d'organisation
export const OrganizationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentOrg, setCurrentOrg] = useState(null);
  const [userOrgs, setUserOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les organisations de l'utilisateur
  const loadUserOrganizations = useCallback(async () => {
    if (!currentUser?.uid) {
      console.log('👤 Pas d\'utilisateur connecté, pas de chargement des organisations');
      setUserOrgs([]);
      setCurrentOrg(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🏢 Chargement des organisations pour:', currentUser.uid);
      
      const result = await getUserOrganizations(currentUser.uid);
      
      if (!result || (!result.organizations && !Array.isArray(result))) {
        console.log('ℹ️ Aucune organisation trouvée');
        setUserOrgs([]);
        setCurrentOrg(null);
        return;
      }

      // Gérer les deux formats possibles de retour
      const organizations = result.organizations || result;
      const defaultOrgId = result.defaultOrganization;
      
      setUserOrgs(organizations);
      
      // Définir l'organisation courante
      const savedOrgId = getCurrentOrganization();
      let defaultOrg = null;
      
      // Priorité : organisation sauvegardée > organisation par défaut > première organisation
      if (savedOrgId) {
        defaultOrg = organizations.find(org => org.id === savedOrgId);
      }
      
      if (!defaultOrg && defaultOrgId) {
        defaultOrg = organizations.find(org => org.id === defaultOrgId);
      }
      
      if (!defaultOrg && organizations.length > 0) {
        defaultOrg = organizations[0];
      }
      
      if (defaultOrg) {
        await switchOrganization(defaultOrg.id);
      } else {
        setCurrentOrg(null);
        clearCurrentOrganization();
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des organisations:', error);
      setError(error.message);
      setUserOrgs([]);
      setCurrentOrg(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Changer d'organisation
  const switchOrganization = useCallback(async (orgId) => {
    console.log('🔄 Changement d\'organisation vers:', orgId);
    
    const org = userOrgs.find(org => org.id === orgId);
    if (!org) {
      console.error('❌ Organisation non trouvée:', orgId);
      return false;
    }
    
    setCurrentOrganization(orgId);
    setCurrentOrg(org);
    
    // Émettre un événement personnalisé pour notifier le changement
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('organizationChanged', { 
        detail: { organizationId: orgId, organization: org } 
      }));
    }
    
    return true;
  }, [userOrgs]);

  // Rafraîchir les organisations
  const refreshOrganizations = useCallback(async () => {
    await loadUserOrganizations();
  }, [loadUserOrganizations]);

  // Charger les organisations quand l'utilisateur change
  useEffect(() => {
    loadUserOrganizations();
  }, [currentUser, loadUserOrganizations]);

  // Vérifier si l'utilisateur a accès à l'organisation courante
  const hasAccessToCurrentOrg = useCallback(() => {
    if (!currentOrg || !userOrgs.length) return false;
    return userOrgs.some(org => org.id === currentOrg.id);
  }, [currentOrg, userOrgs]);

  // Obtenir le rôle de l'utilisateur dans l'organisation courante
  const getCurrentUserRole = useCallback(() => {
    if (!currentOrg) return null;
    return currentOrg.userRole || 'member';
  }, [currentOrg]);

  // Vérifier si l'utilisateur est propriétaire de l'organisation courante
  const isOwner = useCallback(() => {
    return getCurrentUserRole() === 'owner';
  }, [getCurrentUserRole]);

  // Vérifier si l'utilisateur est admin de l'organisation courante
  const isAdmin = useCallback(() => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin';
  }, [getCurrentUserRole]);

  // Valeur du contexte
  const contextValue = {
    // État
    currentOrg,
    userOrgs,
    loading,
    error,
    
    // Actions
    switchOrganization,
    refreshOrganizations,
    loadUserOrganizations,
    
    // Helpers
    hasAccessToCurrentOrg,
    getCurrentUserRole,
    isOwner,
    isAdmin,
    
    // Indicateurs
    hasOrganizations: userOrgs.length > 0,
    needsOnboarding: !loading && userOrgs.length === 0
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}; 