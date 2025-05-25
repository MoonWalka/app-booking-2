import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';

/**
 * Hook optimisé pour la gestion des formulaires de contrats
 * Utilise useGenericEntityForm en interne
 */
export default function useContratForm(id) {
  return useGenericEntityForm({
    entityType: 'contrat',
    collectionName: 'contrats',
    id
  });
}