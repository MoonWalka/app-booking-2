// src/hooks/contrats/useContratActions.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc, getDoc, Timestamp } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
// import brevoTemplateService from '@/services/brevoTemplateService'; // TEMPORAIREMENT DÉSACTIVÉ
import { debugLog } from '@/utils/logUtils';

/**
 * Hook to manage contract actions (mark as sent, signed, deletion)
 */
export const useContratActions = (contratId, contrat, setContrat, concert, contact, refreshData) => {
  const [actionError, setActionError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const navigate = useNavigate();
  const { currentEntreprise } = useEntreprise();

  // Vérifier l'appartenance du contrat à l'entreprise
  const verifyContratOwnership = async () => {
    if (!currentEntreprise?.id) {
      throw new Error('Aucune entreprise sélectionnée');
    }
    
    const contratDoc = await getDoc(doc(db, 'contrats', contratId));
    if (!contratDoc.exists()) {
      throw new Error('Contrat introuvable');
    }
    
    const contratData = contratDoc.data();
    if (contratData.entrepriseId !== currentEntreprise.id) {
      throw new Error('Accès non autorisé à ce contrat');
    }
    
    return contratData;
  };

  // Marquer le contrat comme envoyé manuellement ou annuler l'envoi
  // TEMPORAIRE: L'envoi d'email par API est désactivé. Cette fonction marque seulement le statut.
  // TODO: Réactiver l'envoi d'email une fois la solution API trouvée
  const handleSendContrat = async () => {
    try {
      setIsActionLoading(true);
      setActionError('');
      
      // Vérifier l'appartenance du contrat
      await verifyContratOwnership();
      
      const isCurrentlySent = contrat.status === 'sent';
      
      if (isCurrentlySent) {
        // Annuler l'envoi - revenir au statut "généré"
        await updateDoc(doc(db, 'contrats', contratId), {
          status: 'generated',
          dateEnvoi: null,
          sentManually: false,
          emailSent: false
        });
        
        // Mettre à jour l'état local
        if (setContrat && typeof setContrat === 'function') {
          setContrat({
            ...contrat,
            status: 'generated',
            dateEnvoi: null,
            sentManually: false,
            emailSent: false
          });
        }
        
        alert('Envoi annulé. Le contrat est maintenant marqué comme généré.');
        
        // Forcer le rechargement des données pour mettre à jour l'affichage
        if (refreshData && typeof refreshData === 'function') {
          refreshData();
        }
        
        return;
      }
      
      // COMMENTÉ TEMPORAIREMENT: Vérifications pour l'envoi d'email
      // if (!contact?.email) {
      //   throw new Error('Email du contact manquant pour l\'envoi du contrat');
      // }
      // 
      // if (!concert) {
      //   throw new Error('Données du date manquantes pour l\'envoi du contrat');
      // }
      
      debugLog('[useContratActions] Marquage manuel du contrat comme envoyé:', {
        contratId,
        contactEmail: contact?.email || 'N/A',
        dateTitle: concert?.nom || concert?.titre || 'N/A',
        contratType: contrat?.type || 'N/A'
      });
      
      // COMMENTÉ TEMPORAIREMENT: Envoi d'email via Brevo
      // L'envoi d'email est désactivé en attendant une solution API stable
      /*
      try {
        debugLog('[useContratActions] === AUDIT COMPLET ENVOI CONTRAT ===');
        debugLog('[useContratActions] 1. Données du concert:', concert);
        debugLog('[useContratActions] 2. Données du contact:', contact);
        debugLog('[useContratActions] 3. Données du contrat:', contrat);
        debugLog('[useContratActions] 4. Avant appel brevoTemplateService.sendContratEmail');
        
        try {
          const result = await brevoTemplateService.sendContratEmail(concert, contact, contrat);
          debugLog('[useContratActions] 5. Résultat sendContratEmail:', result);
        } catch (sendError) {
          debugLog('[useContratActions] 6. ERREUR dans sendContratEmail:', {
            message: sendError.message,
            code: sendError.code,
            details: sendError.details,
            stack: sendError.stack
          });
          throw sendError;
        }
        debugLog('[useContratActions] Email contrat envoyé avec succès via Brevo');
      } catch (emailError) {
        console.error('Erreur envoi email Brevo:', emailError);
        
        // Continuer même si l'email échoue, mais avertir l'utilisateur
        setActionError(`Le contrat a été marqué comme envoyé, mais l'email n'a pas pu être envoyé: ${emailError.message}`);
        
        // Mettre à jour le statut même si l'email échoue
        await updateDoc(doc(db, 'contrats', contratId), {
          status: 'sent',
          dateEnvoi: Timestamp.now(),
          emailError: emailError.message
        });
        
        // Mettre à jour l'état local seulement si setContrat est disponible
        if (setContrat && typeof setContrat === 'function') {
          setContrat(prev => ({
            ...prev,
            status: 'sent',
            dateEnvoi: Timestamp.now(),
            emailError: emailError.message
          }));
        }
        
        return; // Sortir ici pour éviter le message de succès
      }
      */
      
      // Mettre à jour le statut du contrat comme envoyé manuellement
      await updateDoc(doc(db, 'contrats', contratId), {
        status: 'sent',
        dateEnvoi: Timestamp.now(),
        sentManually: true, // Indicateur d'envoi manuel
        emailSent: false // Pas d'email envoyé automatiquement
      });
      
      // Mettre à jour l'état local seulement si setContrat est disponible
      if (setContrat && typeof setContrat === 'function') {
        setContrat({
          ...contrat,
          status: 'sent',
          dateEnvoi: Timestamp.now(),
          sentManually: true,
          emailSent: false
        });
      }
      
      alert('Le contrat a été marqué comme envoyé. N\'oubliez pas de l\'envoyer manuellement au contact.');
      
      // Forcer le rechargement des données pour mettre à jour l'affichage
      if (refreshData && typeof refreshData === 'function') {
        refreshData();
      }
    } catch (err) {
      console.error('Erreur lors du marquage du contrat comme envoyé :', err);
      setActionError(`Une erreur est survenue: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Marquer le contrat comme signé ou annuler la signature
  const handleMarkAsSigned = async () => {
    try {
      setIsActionLoading(true);
      setActionError('');
      
      // Vérifier l'appartenance du contrat
      await verifyContratOwnership();
      
      const isCurrentlySigned = contrat.status === 'signed';
      
      if (isCurrentlySigned) {
        // Annuler la signature - revenir au statut "envoyé"
        await updateDoc(doc(db, 'contrats', contratId), {
          status: 'sent',
          dateSignature: null // Supprimer la date de signature
        });
        
        // Mettre à jour l'état local
        if (setContrat && typeof setContrat === 'function') {
          setContrat({
            ...contrat,
            status: 'sent',
            dateSignature: null
          });
        }
        
        alert('Signature annulée. Le contrat est maintenant marqué comme envoyé.');
        
        // Forcer le rechargement des données
        if (refreshData && typeof refreshData === 'function') {
          refreshData();
        }
      } else {
        // Marquer comme signé
        await updateDoc(doc(db, 'contrats', contratId), {
          status: 'signed',
          dateSignature: Timestamp.now()
        });
        
        // Mettre à jour l'état local
        if (setContrat && typeof setContrat === 'function') {
          setContrat({
            ...contrat,
            status: 'signed',
            dateSignature: Timestamp.now()
          });
        }
        
        alert('Le contrat a été marqué comme signé');
        
        // Forcer le rechargement des données
        if (refreshData && typeof refreshData === 'function') {
          refreshData();
        }
      }
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
        
        // Vérifier l'appartenance du contrat
        await verifyContratOwnership();
        
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