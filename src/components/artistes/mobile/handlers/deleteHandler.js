/**
 * Handler legacy pour la suppression d'artistes (mobile)
 * ⚠️ DEPRECATED : Ce handler est obsolète
 * Utilisez directement le hook useDeleteArtiste dans vos composants React
 */

// Export du hook pour migration
export { useDeleteArtiste } from '@/hooks/artistes';

/**
 * @deprecated Utilisez directement useDeleteArtiste dans votre composant
 */
export const handleDelete = () => {
  console.error('[deleteHandler] ❌ DEPRECATED - Utilisez directement useDeleteArtiste dans votre composant React');
  throw new Error('Handler legacy supprimé - utilisez useDeleteArtiste dans un composant React');
};
