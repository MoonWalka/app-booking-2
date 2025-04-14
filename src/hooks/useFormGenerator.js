import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { formLinkService } from '../services/firebaseService';
import { concertService } from '../services/firebaseService';

export function useFormGenerator(concertId, programmateurId) {
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [formLink, setFormLink] = useState('');
  const [existingLink, setExistingLink] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [copied, setCopied] = useState(false);

  // Vérifier s'il existe déjà un lien pour ce concert
  const checkExistingLink = useCallback(async () => {
    try {
      setLoadingExisting(true);
      
      // Récupérer les données du concert
      const concert = await concertService.getById(concertId);
      
      if (concert && concert.formLinkId) {
        // Récupérer le lien de formulaire associé
        const formLinkData = await formLinkService.getById(concert.formLinkId);
        
        if (formLinkData) {
          // Vérifier si le lien n'est pas expiré
          const now = new Date();
          const expiryDate = formLinkData.expiryDate?.toDate();
          
          if (expiryDate && expiryDate > now) {
            // Reconstruire l'URL du formulaire
            const baseUrl = window.location.origin;
            const useHash = window.location.href.includes('#');
            let formUrl;
            
            if (useHash) {
              formUrl = `${baseUrl}/#/formulaire/${concertId}/${formLinkData.token}`;
            } else {
              formUrl = `${baseUrl}/formulaire/${concertId}/${formLinkData.token}`;
            }
            
            setFormLink(formUrl);
            setExistingLink(formLinkData);
            setExpiryDate(expiryDate);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du lien existant:', error);
    } finally {
      setLoadingExisting(false);
    }
  }, [concertId]);

  // Générer un nouveau lien de formulaire
  const generateForm = useCallback(async () => {
    setLoading(true);
    try {
      // Générer un token unique
      const token = uuidv4();
      
      // Calculer la date d'expiration (30 jours à partir de maintenant)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      setExpiryDate(expiryDate);
      
      // Générer le lien du formulaire avec le format approprié
      const baseUrl = window.location.origin;
      const useHash = window.location.href.includes('#');
      let formUrl;
      
      if (useHash) {
        formUrl = `${baseUrl}/#/formulaire/${concertId}/${token}`;
      } else {
        formUrl = `${baseUrl}/formulaire/${concertId}/${token}`;
      }
      
      // Créer un nouveau lien de formulaire
      const newFormLink = await formLinkService.create({
        concertId,
        programmateurId: programmateurId || null,
        token,
        expiryDate,
        completed: false,
        formUrl
      });
      
      // Mettre à jour le concert avec l'ID du formulaire
      await concertService.update(concertId, {
        formLinkId: newFormLink.id
      });
      
      setFormLink(formUrl);
      setExistingLink(newFormLink);
      
    } catch (error) {
      console.error('Erreur lors de la génération du formulaire:', error);
      alert('Une erreur est survenue lors de la génération du formulaire');
    } finally {
      setLoading(false);
    }
  }, [concertId, programmateurId]);

  // Copier le lien dans le presse-papiers
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(formLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err);
      });
  }, [formLink]);

  // Formater la date d'expiration
  const formatExpiryDate = useCallback((date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric'
    });
  }, []);

  // Vérifier s'il existe déjà un lien au chargement
  useEffect(() => {
    checkExistingLink();
  }, [checkExistingLink]);

  return {
    loading,
    loadingExisting,
    formLink,
    existingLink,
    expiryDate,
    copied,
    generateForm,
    copyToClipboard,
    formatExpiryDate
  };
}
