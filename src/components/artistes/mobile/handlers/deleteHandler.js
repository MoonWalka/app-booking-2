import { useDeleteArtiste } from '@/hooks/artistes';

/**
 * Handler modernisé pour la suppression d'artistes (mobile)
 * Utilise le hook useDeleteArtiste qui intègre useGenericEntityDelete
 * ⚠️ MIGRATION : Ne plus utiliser directement ce handler
 * Utilisez directement le hook useDeleteArtiste dans vos composants
 */
export const handleDelete = async (id) => {
  console.warn('[deleteHandler] ⚠️ Handler legacy - Utilisez directement useDeleteArtiste dans votre composant');
  
  // Pour compatibilité temporaire - créer une instance du hook
  const { handleDeleteArtiste } = useDeleteArtiste();
  
  try {
    return await handleDeleteArtiste(id);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'artiste:', error);
    return false;
  }
};

// Export pour migration
export { useDeleteArtiste } from '@/hooks/artistes';
