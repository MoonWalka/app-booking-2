import { db, doc, deleteDoc } from '../../../../services/firebase-service';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Handler pour la suppression directe d'un concert (mobile)
 * Suppression immédiate sans confirmation window.confirm()
 */
export const handleDelete = async (id) => {
  // SUPPRESSION : Plus de window.confirm(), suppression directe
  try {
    console.log('[deleteHandler] Suppression directe du concert:', id);
    const docRef = doc(db, 'concerts', id);
    await deleteDoc(docRef);
    
    // Notification de succès
    showSuccessToast('Concert supprimé avec succès');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du concert:', error);
    
    // Notification d'erreur
    showErrorToast('Erreur lors de la suppression du concert');
    
    return false;
  }
};