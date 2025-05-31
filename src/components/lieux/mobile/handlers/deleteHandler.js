import { useLieuDelete } from '@/hooks/lieux';

/**
 * Handler modernisé pour la suppression de lieux (mobile)
 * Utilise le hook useLieuDelete qui intègre useGenericEntityDelete
 * ⚠️ MIGRATION : Ne plus utiliser directement ce handler
 * Utilisez directement le hook useLieuDelete dans vos composants
 */
export const handleDelete = async (id) => {
  console.warn('[deleteHandler] ⚠️ Handler legacy - Utilisez directement useLieuDelete dans votre composant');
  
  // Pour compatibilité temporaire - créer une instance du hook
  const { handleDeleteLieu } = useLieuDelete();
  
  try {
    return await handleDeleteLieu(id);
  } catch (error) {
    console.error('Erreur lors de la suppression du lieu:', error);
    return false;
  }
};

// Export pour migration
export { useLieuDelete } from '@/hooks/lieux';