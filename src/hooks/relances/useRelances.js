import { useState, useEffect, useCallback } from 'react';
import { 
  db,
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook pour gérer les relances
 * Fournit l'accès aux relances avec des opérations CRUD
 */
const useRelances = () => {
  const [relances, setRelances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  // Charger les relances en temps réel
  useEffect(() => {
    if (!user || !currentOrganization) {
      setRelances([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Requête pour récupérer les relances de l'organisation
      const relancesQuery = query(
        collection(db, 'relances'),
        where('organizationId', '==', currentOrganization.id),
        orderBy('dateEcheance', 'asc')
      );

      // Écouter les changements en temps réel
      const unsubscribe = onSnapshot(
        relancesQuery,
        (snapshot) => {
          const relancesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setRelances(relancesData);
          setLoading(false);
        },
        (error) => {
          console.error('Erreur lors du chargement des relances:', error);
          setError(error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Erreur lors de la configuration de la requête:', error);
      setError(error);
      setLoading(false);
    }
  }, [user, currentOrganization]);

  /**
   * Mettre à jour le statut d'une relance
   */
  const updateRelanceStatus = useCallback(async (relanceId, newStatus) => {
    try {
      const relanceRef = doc(db, 'relances', relanceId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Pour les relances automatiques, maintenir aussi le champ terminee
      if (newStatus === 'completed') {
        updateData.terminee = true;
        updateData.completedAt = new Date().toISOString();
        updateData.dateTerminee = new Date().toISOString();
      } else if (newStatus === 'pending') {
        updateData.terminee = false;
      }
      
      await updateDoc(relanceRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }, []);

  /**
   * Supprimer une relance
   */
  const deleteRelance = useCallback(async (relanceId) => {
    try {
      const relanceRef = doc(db, 'relances', relanceId);
      await deleteDoc(relanceRef);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la relance:', error);
      throw error;
    }
  }, []);

  /**
   * Fonction utilitaire pour convertir les dates Firebase
   */
  const parseFirebaseDate = useCallback((dateValue) => {
    if (!dateValue) return null;
    
    if (dateValue instanceof Date && !isNaN(dateValue)) {
      return dateValue;
    }
    
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000);
    }
    
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }, []);

  /**
   * Obtenir les relances en retard
   */
  const getOverdueRelances = useCallback(() => {
    const now = new Date();
    return relances.filter(relance => {
      const dueDate = parseFirebaseDate(relance.dateEcheance);
      const isPending = relance.status === 'pending' || (!relance.status && !relance.terminee);
      return isPending && dueDate && dueDate < now;
    });
  }, [relances, parseFirebaseDate]);

  /**
   * Obtenir les relances à venir (dans les 7 prochains jours)
   */
  const getUpcomingRelances = useCallback(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    return relances.filter(relance => {
      const dueDate = parseFirebaseDate(relance.dateEcheance);
      const isPending = relance.status === 'pending' || (!relance.status && !relance.terminee);
      return isPending && dueDate && 
             dueDate >= now && 
             dueDate <= sevenDaysFromNow;
    });
  }, [relances, parseFirebaseDate]);

  /**
   * Obtenir les relances par type d'entité
   */
  const getRelancesByEntityType = useCallback((entityType) => {
    return relances.filter(relance => relance.entityType === entityType);
  }, [relances]);

  /**
   * Obtenir les relances par entité spécifique
   */
  const getRelancesByEntity = useCallback((entityType, entityId) => {
    return relances.filter(relance => 
      relance.entityType === entityType && 
      relance.entityId === entityId
    );
  }, [relances]);

  return {
    relances,
    loading,
    error,
    updateRelanceStatus,
    deleteRelance,
    getOverdueRelances,
    getUpcomingRelances,
    getRelancesByEntityType,
    getRelancesByEntity
  };
};

export default useRelances;