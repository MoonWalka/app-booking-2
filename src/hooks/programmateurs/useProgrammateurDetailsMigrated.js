import { useGenericEntityDetails } from '@/hooks/common';

/**
 * Hook pour gérer les détails d'un programmateur en utilisant le hook générique
 */
export default function useProgrammateurDetailsMigrated(id) {
  const details = useGenericEntityDetails({
    entityType: 'programmateur',
    collectionName: 'programmateurs',
    id,
    onSaveSuccess: () => {},
    onSaveError: () => {},
    onDeleteSuccess: () => {},
    onDeleteError: () => {},
    navigate: () => {},
    returnPath: '/programmateurs',
    editPath: '/programmateurs/:id/edit'
  });
  return {
    ...details,
    programmateur: details.entity // mapping clé pour compatibilité UI
  };
}