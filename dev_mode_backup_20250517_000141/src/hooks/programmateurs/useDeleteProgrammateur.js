import { useGenericEntityDelete } from '@/hooks/common';

/**
 * Hook pour supprimer un programmateur en utilisant le hook générique
 */
export default function useDeleteProgrammateur() {
  return useGenericEntityDelete({ collectionName: 'programmateurs', entityType: 'programmateur' });
}