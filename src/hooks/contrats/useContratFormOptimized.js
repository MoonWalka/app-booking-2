import useGenericEntityForm from '@/hooks/common/useGenericEntityForm';

/**
 * Hook optimisé pour la gestion des formulaires de contrats
 * Utilise useGenericEntityForm en interne
 */
export default function useContratFormOptimized(id) {
  return useGenericEntityForm({
    entityType: 'contrat',
    collectionName: 'contrats',
    id
  });
}