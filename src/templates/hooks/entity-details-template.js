/**
 * Template pour créer un hook de détails optimisé basé sur useGenericEntityDetails
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce template représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 * 
 * Instructions:
 * 1. Copiez ce fichier et renommez-le (ex: useEntiteDetails.js)
 * 2. Remplacez les occurrences de "entite", "Entite", "ENTITE" par votre type d'entité
 * 3. Personnalisez les entités liées et les fonctions spécifiques
 * 4. Exportez le hook dans le fichier index.js de votre module
 */

import { useGenericEntityDetails } from '@/hooks/common';
import { query, collection, where, db } from '@/services/firebase-service';

/**
 * Hook optimisé pour gérer les détails d'une entité
 * Utilise directement useGenericEntityDetails comme recommandé
 * 
 * @param {string} entiteId - ID de l'entité
 * @returns {Object} - États et fonctions pour gérer les détails de l'entité
 */
export const useEntiteDetails = (entiteId) => {
  // Utilisation directe du hook générique avec configuration spécifique
  const detailsHook = useGenericEntityDetails({
    entityType: 'entite',
    id: entiteId,
    collectionName: 'entites',
    transformData: (data) => {
      // Transformations spécifiques des données pour l'affichage
      return {
        ...data,
        // Exemple: formater des dates, calculer des propriétés dérivées, etc.
        dateMiseAJourFormatee: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'
      };
    },
    relatedEntities: [
      // Entités directement liées (par ID)
      {
        name: 'parent',
        collection: 'parents',
        idField: 'parentId',
        type: 'single'
      },
      // Entités liées par query (liste)
      {
        name: 'sousEntites',
        collection: 'sousEntites',
        query: () => query(
          collection(db, 'sousEntites'), 
          where('entiteId', '==', entiteId)
        ),
        type: 'list'
      }
      // Ajoutez d'autres entités liées selon vos besoins
    ]
  });

  // Extension du hook avec des fonctionnalités spécifiques à l'entité
  const calculerStatistiques = () => {
    // Exemple : calculer des statistiques basées sur l'entité ou ses entités liées
    const sousEntites = detailsHook.relatedData?.sousEntites || [];
    const nombreSousEntites = sousEntites.length;
    const sousEntitesActives = sousEntites.filter(se => se.actif).length;
    
    return {
      total: nombreSousEntites,
      actives: sousEntitesActives,
      pourcentageActif: nombreSousEntites > 0 
        ? Math.round((sousEntitesActives / nombreSousEntites) * 100) 
        : 0
    };
  };
  
  // Fonction pour formater l'entité pour l'affichage
  const getFormattedEntity = () => {
    if (!detailsHook.entity) return null;
    
    return {
      ...detailsHook.entity,
      // Formatage et enrichissement spécifiques
      parent: detailsHook.relatedData?.parent?.nom || 'Non défini',
      // Autres propriétés formatées...
    };
  };

  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...detailsHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques à l'entité
    calculerStatistiques,
    getFormattedEntity,
    // Raccourcis pour une meilleure DX
    entite: detailsHook.entity,
    parent: detailsHook.relatedData?.parent,
    sousEntites: detailsHook.relatedData?.sousEntites || []
  };
};

export default useEntiteDetails;