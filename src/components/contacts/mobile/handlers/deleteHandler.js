/**
 * Handler legacy pour la suppression de contacts (mobile)
 * ⚠️ DEPRECATED : Ce handler est obsolète
 * Utilisez directement le hook useDeleteContact dans vos composants React
 */

// Export du hook pour migration
export { useDeleteContact } from '@/hooks/contacts';

/**
 * @deprecated Utilisez directement useDeleteContact dans votre composant
 */
export const handleDelete = () => {
  console.error('[deleteHandler] ❌ DEPRECATED - Utilisez directement useDeleteContact dans votre composant React');
  throw new Error('Handler legacy supprimé - utilisez useDeleteContact dans un composant React');
};