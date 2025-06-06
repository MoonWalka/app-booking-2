// hooks/contacts/useHistoriqueEchanges.js
import { useState, useEffect, useCallback } from 'react';
import historiqueEchangesService, { TYPES_ECHANGES, STATUTS_ECHANGES } from '@/services/historiqueEchangesService';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { toast } from 'react-toastify';

/**
 * Hook pour gérer l'historique des échanges avec un contact
 */
export function useHistoriqueEchanges(contactId) {
  const [echanges, setEchanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddingEchange, setIsAddingEchange] = useState(false);
  
  const { currentUser: user } = useAuth();
  const { currentOrganization } = useOrganization();

  // Charger l'historique des échanges
  useEffect(() => {
    if (!contactId || !currentOrganization?.id) return;

    setLoading(true);
    setError(null);

    // S'abonner aux changements en temps réel
    const unsubscribe = historiqueEchangesService.subscribeToContactEchanges(
      contactId,
      currentOrganization.id,
      (result) => {
        if (result.success) {
          // Formater les échanges pour l'affichage
          const formattedEchanges = result.data.map(echange => 
            historiqueEchangesService.formatEchange(echange)
          );
          setEchanges(formattedEchanges);
          setLoading(false);
        } else {
          setError(result.error);
          setLoading(false);
        }
      }
    );

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [contactId, currentOrganization?.id]);

  /**
   * Ajouter un nouvel échange
   */
  const addEchange = useCallback(async (echangeData) => {
    if (!contactId || !currentOrganization?.id || !user?.uid) {
      toast.error('Impossible d\'ajouter l\'échange : données manquantes');
      return { success: false };
    }

    try {
      setIsAddingEchange(true);
      
      const newEchange = {
        ...echangeData,
        contactId,
        organizationId: currentOrganization.id,
        userId: user.uid,
        date: echangeData.date || new Date()
      };

      const result = await historiqueEchangesService.createEchange(newEchange);
      
      if (result.success) {
        toast.success('Échange ajouté avec succès');
      } else {
        toast.error('Erreur lors de l\'ajout de l\'échange');
      }
      
      return result;
    } catch (error) {
      console.error('[useHistoriqueEchanges] Erreur ajout échange:', error);
      toast.error('Erreur lors de l\'ajout de l\'échange');
      return { success: false, error: error.message };
    } finally {
      setIsAddingEchange(false);
    }
  }, [contactId, currentOrganization?.id, user?.uid]);

  /**
   * Mettre à jour un échange
   */
  const updateEchange = useCallback(async (echangeId, updates) => {
    try {
      const result = await historiqueEchangesService.updateEchange(echangeId, updates);
      
      if (result.success) {
        toast.success('Échange mis à jour');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
      
      return result;
    } catch (error) {
      console.error('[useHistoriqueEchanges] Erreur mise à jour échange:', error);
      toast.error('Erreur lors de la mise à jour');
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Supprimer un échange
   */
  const deleteEchange = useCallback(async (echangeId) => {
    try {
      const result = await historiqueEchangesService.deleteEchange(echangeId);
      
      if (result.success) {
        toast.success('Échange supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
      
      return result;
    } catch (error) {
      console.error('[useHistoriqueEchanges] Erreur suppression échange:', error);
      toast.error('Erreur lors de la suppression');
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Marquer un échange comme complété
   */
  const markAsCompleted = useCallback(async (echangeId) => {
    return updateEchange(echangeId, {
      statut: STATUTS_ECHANGES.ENVOYE,
      dateCompletion: new Date()
    });
  }, [updateEchange]);

  /**
   * Ajouter un rappel à un échange
   */
  const setRappel = useCallback(async (echangeId, dateRappel) => {
    return updateEchange(echangeId, {
      rappel: dateRappel
    });
  }, [updateEchange]);

  /**
   * Filtrer les échanges par type
   */
  const getEchangesByType = useCallback((type) => {
    return echanges.filter(echange => echange.type === type);
  }, [echanges]);

  /**
   * Filtrer les échanges avec rappel
   */
  const getEchangesAvecRappel = useCallback(() => {
    const now = new Date();
    return echanges.filter(echange => 
      echange.rappel && new Date(echange.rappel) > now
    );
  }, [echanges]);

  /**
   * Obtenir le dernier échange
   */
  const getDernierEchange = useCallback(() => {
    return echanges.length > 0 ? echanges[0] : null;
  }, [echanges]);

  /**
   * Statistiques sur les échanges
   */
  const getStatistiques = useCallback(() => {
    const stats = {
      total: echanges.length,
      parType: {},
      parStatut: {},
      avecRappel: 0
    };

    echanges.forEach(echange => {
      // Par type
      stats.parType[echange.type] = (stats.parType[echange.type] || 0) + 1;
      
      // Par statut
      stats.parStatut[echange.statut] = (stats.parStatut[echange.statut] || 0) + 1;
      
      // Avec rappel
      if (echange.rappel) {
        stats.avecRappel++;
      }
    });

    return stats;
  }, [echanges]);

  return {
    // Données
    echanges,
    loading,
    error,
    isAddingEchange,
    
    // Actions
    addEchange,
    updateEchange,
    deleteEchange,
    markAsCompleted,
    setRappel,
    
    // Filtres et helpers
    getEchangesByType,
    getEchangesAvecRappel,
    getDernierEchange,
    getStatistiques,
    
    // Constantes utiles
    TYPES_ECHANGES,
    STATUTS_ECHANGES
  };
}

export default useHistoriqueEchanges;