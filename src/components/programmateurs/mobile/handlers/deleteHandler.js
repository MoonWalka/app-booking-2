import { useDeleteProgrammateur } from '@/hooks/programmateurs';

/**
 * Handler modernisé pour la suppression de programmateurs (mobile)
 * Utilise le hook useDeleteProgrammateur qui intègre useGenericEntityDelete
 * ⚠️ MIGRATION : Ne plus utiliser directement ce handler
 * Utilisez directement le hook useDeleteProgrammateur dans vos composants
 */
export const handleDelete = async (id) => {
  console.warn('[deleteHandler] ⚠️ Handler legacy - Utilisez directement useDeleteProgrammateur dans votre composant');
  
  // Pour compatibilité temporaire - créer une instance du hook
  const { handleDeleteProgrammateur } = useDeleteProgrammateur();
  
  try {
    return await handleDeleteProgrammateur(id);
  } catch (error) {
    console.error('Erreur lors de la suppression du programmateur:', error);
    return false;
  }
};

// Export pour migration
export { useDeleteProgrammateur } from '@/hooks/programmateurs';