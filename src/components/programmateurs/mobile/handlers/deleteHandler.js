/**
 * Handler legacy pour la suppression de programmateurs (mobile)
 * ⚠️ DEPRECATED : Ce handler est obsolète
 * Utilisez directement le hook useDeleteProgrammateur dans vos composants React
 */

// Export du hook pour migration
export { useDeleteProgrammateur } from '@/hooks/programmateurs';

/**
 * @deprecated Utilisez directement useDeleteProgrammateur dans votre composant
 */
export const handleDelete = () => {
  console.error('[deleteHandler] ❌ DEPRECATED - Utilisez directement useDeleteProgrammateur dans votre composant React');
  throw new Error('Handler legacy supprimé - utilisez useDeleteProgrammateur dans un composant React');
};