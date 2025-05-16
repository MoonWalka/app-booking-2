// src/hooks/contrats/useContratActions.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc, Timestamp } from '@/firebaseInit';
import { db } from '@/firebaseInit';

/**
 * Hook to manage contract actions (mark as sent, signed, deletion)
 */
export const useContratActions = (contratId, contrat, setContrat) => {
  const [actionError, setActionError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const navigate = useNavigate();

  // Marquer le contrat comme envoyé
  const handleSendContrat = async () => {
    try {
      setIsActionLoading(true);
      setActionError('');
      
      // Mettre à jour le statut du contrat
      await updateDoc(doc(db, 'contrats', contratId), {
        status: 'sent',
        dateEnvoi: Timestamp.now()
      });
      
      // Mettre à jour l'état local
      setContrat(prev => ({
        ...prev,
        status: 'sent',
        dateEnvoi: Timestamp.now()
      }));
      
      alert('Le contrat a été marqué comme envoyé');
    } catch (err) {
      console.error('Erreur lors de l\'envoi du contrat :', err);
      setActionError('Une erreur est survenue lors de l\'envoi du contrat');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Marquer le contrat comme signé
  const handleMarkAsSigned = async () => {
    try {
      setIsActionLoading(true);
      setActionError('');
      
      // Mettre à jour le statut du contrat
      await updateDoc(doc(db, 'contrats', contratId), {
        status: 'signed'
      });
      
      // Mettre à jour l'état local
      setContrat(prev => ({
        ...prev,
        status: 'signed'
      }));
      
      alert('Le contrat a été marqué comme signé');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut du contrat :', err);
      setActionError('Une erreur est survenue lors de la mise à jour du statut du contrat');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Supprimer le contrat
  const handleDeleteContrat = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.')) {
      try {
        setIsActionLoading(true);
        setActionError('');
        
        // Supprimer le contrat de la base de données
        await deleteDoc(doc(db, 'contrats', contratId));
        
        // Afficher un message de confirmation
        alert('Le contrat a été supprimé avec succès');
        
        // Rediriger vers la liste des contrats
        navigate('/contrats');
      } catch (err) {
        console.error('Erreur lors de la suppression du contrat :', err);
        setActionError('Une erreur est survenue lors de la suppression du contrat');
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  return {
    handleSendContrat,
    handleMarkAsSigned,
    handleDeleteContrat,
    actionError,
    isActionLoading
  };
};

export default useContratActions;