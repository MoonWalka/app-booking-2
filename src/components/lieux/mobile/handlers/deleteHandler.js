/**
 * Handler legacy pour la suppression de lieux (mobile)
 * ⚠️ DEPRECATED : Ce handler est obsolète
 * Utilisez directement le hook useLieuDelete dans vos composants React
 */

// Export du hook pour migration
export { useLieuDelete } from '@/hooks/lieux';

/**
 * @deprecated Utilisez directement useLieuDelete dans votre composant
 */
export const handleDelete = () => {
  console.error('[deleteHandler] ❌ DEPRECATED - Utilisez directement useLieuDelete dans votre composant React');
  throw new Error('Handler legacy supprimé - utilisez useLieuDelete dans un composant React');
};