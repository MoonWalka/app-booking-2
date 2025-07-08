import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getCurrentEntreprise, 
  setCurrentEntreprise, 
  getUserEntreprises,
  clearCurrentEntreprise 
} from '@/services/firebase-service';
import { autoMigrateRIB } from '@/utils/autoMigrateRIB';

// Créer le contexte
const EntrepriseContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'entreprise
export const useEntreprise = () => {
  const context = useContext(EntrepriseContext);
  if (!context) {
    throw new Error('useEntreprise doit être utilisé dans EntrepriseProvider');
  }
  return context;
};

// Provider du contexte d'entreprise
export const EntrepriseProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentEntreprise, setCurrentEntrepriseState] = useState(null);
  const [userEntreprises, setUserEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les entreprises de l'utilisateur
  const loadUserEntreprises = useCallback(async () => {
    if (!currentUser?.uid) {
      console.log('👤 Pas d\'utilisateur connecté, pas de chargement des entreprises');
      setUserEntreprises([]);
      setCurrentEntrepriseState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🏢 Chargement des entreprises pour:', currentUser.uid);
      console.log('[DEBUG EntrepriseContext] currentUser complet:', currentUser);
      
      const result = await getUserEntreprises(currentUser.uid);
      console.log('[DEBUG EntrepriseContext] Résultat getUserEntreprises:', result);
      
      if (!result || (!result.entreprises && !Array.isArray(result))) {
        console.log('ℹ️ Aucune entreprise trouvée');
        console.log('[DEBUG] result est:', result);
        setUserEntreprises([]);
        setCurrentEntrepriseState(null);
        return;
      }

      // Gérer les deux formats possibles de retour
      const entreprises = result.entreprises || result;
      const defaultEntrepriseId = result.defaultEntreprise;
      
      setUserEntreprises(entreprises);
      
      // Définir l'entreprise courante
      const savedEntrepriseId = getCurrentEntreprise();
      let defaultEntreprise = null;
      
      // Priorité : entreprise sauvegardée > entreprise par défaut > première entreprise
      if (savedEntrepriseId) {
        defaultEntreprise = entreprises.find(ent => ent.id === savedEntrepriseId);
      }
      
      if (!defaultEntreprise && defaultEntrepriseId) {
        defaultEntreprise = entreprises.find(ent => ent.id === defaultEntrepriseId);
      }
      
      if (!defaultEntreprise && entreprises.length > 0) {
        defaultEntreprise = entreprises[0];
      }
      
      if (defaultEntreprise) {
        // Définir l'entreprise directement ici au lieu d'appeler switchEntreprise
        console.log('🔄 Définition de l\'entreprise par défaut:', defaultEntreprise.id);
        setCurrentEntreprise(defaultEntreprise.id);
        setCurrentEntrepriseState(defaultEntreprise);
        
        // Lancer la migration RIB automatique
        autoMigrateRIB(defaultEntreprise.id).catch(err => 
          console.error('Erreur lors de la migration RIB:', err)
        );
        
        // Émettre l'événement
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('entrepriseChanged', { 
            detail: { entrepriseId: defaultEntreprise.id, entreprise: defaultEntreprise } 
          }));
        }
      } else {
        setCurrentEntrepriseState(null);
        clearCurrentEntreprise();
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des entreprises:', error);
      setError(error.message);
      setUserEntreprises([]);
      setCurrentEntrepriseState(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Changer d'entreprise
  const switchEntreprise = useCallback(async (entrepriseId) => {
    console.log('🔄 Changement d\'entreprise vers:', entrepriseId);
    
    const entreprise = userEntreprises.find(ent => ent.id === entrepriseId);
    if (!entreprise) {
      console.error('❌ Entreprise non trouvée:', entrepriseId);
      return false;
    }
    
    setCurrentEntreprise(entrepriseId);
    setCurrentEntrepriseState(entreprise);
    
    // Lancer la migration RIB automatique pour la nouvelle entreprise
    autoMigrateRIB(entrepriseId).catch(err => 
      console.error('Erreur lors de la migration RIB:', err)
    );
    
    // Émettre un événement personnalisé pour notifier le changement
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('entrepriseChanged', { 
        detail: { entrepriseId: entrepriseId, entreprise: entreprise } 
      }));
    }
    
    return true;
  }, [userEntreprises]);

  // Rafraîchir les entreprises
  const refreshEntreprises = useCallback(async () => {
    await loadUserEntreprises();
  }, [loadUserEntreprises]);

  // Charger les entreprises quand l'utilisateur change
  useEffect(() => {
    loadUserEntreprises();
  }, [currentUser, loadUserEntreprises]);

  // Vérifier si l'utilisateur a accès à l'entreprise courante
  const hasAccessToCurrentEntreprise = useCallback(() => {
    if (!currentEntreprise || !userEntreprises.length) return false;
    return userEntreprises.some(ent => ent.id === currentEntreprise.id);
  }, [currentEntreprise, userEntreprises]);

  // Obtenir le rôle de l'utilisateur dans l'entreprise courante
  const getCurrentUserRole = useCallback(() => {
    if (!currentEntreprise) return null;
    return currentEntreprise.userRole || 'member';
  }, [currentEntreprise]);

  // Vérifier si l'utilisateur est propriétaire de l'entreprise courante
  const isOwner = useCallback(() => {
    return getCurrentUserRole() === 'owner';
  }, [getCurrentUserRole]);

  // Vérifier si l'utilisateur est admin de l'entreprise courante
  const isAdmin = useCallback(() => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin';
  }, [getCurrentUserRole]);

  // Valeur du contexte
  const contextValue = {
    // État
    currentEntreprise,
    currentOrganization: currentEntreprise, // Alias pour la compatibilité
    userEntreprises,
    loading,
    error,
    
    // Actions
    switchEntreprise,
    refreshEntreprises,
    loadUserEntreprises,
    
    // Helpers
    hasAccessToCurrentEntreprise,
    getCurrentUserRole,
    isOwner,
    isAdmin,
    
    // Indicateurs
    hasEntreprises: userEntreprises.length > 0,
    needsOnboarding: !loading && userEntreprises.length === 0
  };

  return (
    <EntrepriseContext.Provider value={contextValue}>
      {children}
    </EntrepriseContext.Provider>
  );
}; 