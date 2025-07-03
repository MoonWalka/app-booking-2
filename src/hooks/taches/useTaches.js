import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook pour gérer les tâches de l'organisation courante
 * Fournit un accès en temps réel aux tâches avec tri et filtrage
 */
export const useTaches = () => {
  const { currentOrganization } = useOrganization();
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshTaches = () => {
    setLoading(true);
    setError(null);
  };

  useEffect(() => {
    if (!currentOrganization?.id) {
      setTaches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Créer la requête pour les tâches de l'organisation
    // Note: orderBy temporairement retiré en attendant la création de l'index Firebase
    const tachesQuery = query(
      collection(db, 'taches'),
      where('organizationId', '==', currentOrganization.id)
    );

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      tachesQuery,
      (snapshot) => {
        try {
          const tachesData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convertir les timestamps Firebase en dates
            const tache = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
              dateEcheance: data.dateEcheance,
              dateTerminee: data.dateTerminee?.toDate?.() || data.dateTerminee,
            };
            
            tachesData.push(tache);
          });
          
          // Trier côté client en attendant l'index Firebase
          tachesData.sort((a, b) => {
            const dateA = a.createdAt || new Date(0);
            const dateB = b.createdAt || new Date(0);
            return dateB - dateA; // Tri décroissant
          });
          
          setTaches(tachesData);
          setLoading(false);
        } catch (err) {
          console.error('Erreur lors du traitement des tâches:', err);
          setError(err);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erreur lors de l\'écoute des tâches:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [currentOrganization?.id]);

  // Fonctions utilitaires pour filtrer les tâches
  const getTachesByStatut = (statut) => {
    return taches.filter(tache => tache.statut === statut);
  };

  const getTachesByPriorite = (priorite) => {
    return taches.filter(tache => tache.priorite === priorite);
  };

  const getTachesEnRetard = () => {
    const now = new Date();
    return taches.filter(tache => {
      if (tache.statut !== 'pending' || !tache.dateEcheance) return false;
      return new Date(tache.dateEcheance) < now;
    });
  };

  const getTachesByEntity = (entityType, entityId) => {
    return taches.filter(tache => 
      tache.entityType === entityType && tache.entityId === entityId
    );
  };

  // Statistiques
  const getStats = () => {
    const total = taches.length;
    const pending = getTachesByStatut('pending').length;
    const completed = getTachesByStatut('completed').length;
    const cancelled = getTachesByStatut('cancelled').length;
    const overdue = getTachesEnRetard().length;
    
    const priorityStats = {
      high: getTachesByPriorite('high').length,
      medium: getTachesByPriorite('medium').length,
      low: getTachesByPriorite('low').length
    };

    return {
      total,
      pending,
      completed,
      cancelled,
      overdue,
      priority: priorityStats
    };
  };

  return {
    taches,
    loading,
    error,
    refreshTaches,
    // Fonctions utilitaires
    getTachesByStatut,
    getTachesByPriorite,
    getTachesEnRetard,
    getTachesByEntity,
    getStats
  };
};

// Nouvelle structure de tâche (manuel + automatique)
// {
//   id: string,
//   titre: string,
//   description: string,
//   type: 'automatique' | 'manuelle',
//   workflowStep: string, // ex: 'precontrat_envoi', 'contrat_signature', etc.
//   entiteLiee: { type: 'devis'|'precontrat'|'contrat'|'facture', id: string },
//   statut: 'a_faire' | 'en_cours' | 'terminee' | 'annulee',
//   assignee: string, // id utilisateur ou rôle
//   dateCreation: Date,
//   dateEcheance: Date,
//   priorite: 'basse' | 'normale' | 'haute',
//   automatique: boolean, // true si tâche créée par le système
//   historique: [
//     { action: string, date: Date, userId: string, commentaire: string }
//   ]
// }
// Ce modèle permet d'unifier tâches manuelles et automatiques, et d'ajouter des étapes de workflow automatisées.