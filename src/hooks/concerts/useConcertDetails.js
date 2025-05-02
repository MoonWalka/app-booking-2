import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useNavigate } from 'react-router-dom';

// Import des hooks personnalisés
import { useEntitySearch } from '@/hooks/common/useEntitySearch';
import useConcertStatus from '@/hooks/concerts/useConcertStatus';
import useConcertFormsManagement from '@/hooks/concerts/useConcertFormsManagement';
import useConcertAssociations from '@/hooks/concerts/useConcertAssociations';

// Import des utilitaires
import { formatDate, formatMontant, isDatePassed, copyToClipboard, getCacheKey } from '@/utils/formatters';

/**
 * Hook refactorisé pour gérer les détails d'un concert
 */
export const useConcertDetails = (id, location) => {
  const navigate = useNavigate();
  
  // États pour les données
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cacheKey, setCacheKey] = useState(getCacheKey(id));
  
  // États pour le mode d'édition
  const [isEditMode, setIsEditMode] = useState(false);
  const [formState, setFormState] = useState({
    date: '',
    montant: '',
    statut: 'En attente',
    titre: '',
    notes: ''
  });

  // Gestion des entités associées (pour la mise à jour des relations)
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);

  // Utilisation des hooks personnalisés
  const concertForms = useConcertFormsManagement(id);
  const concertStatus = useConcertStatus();
  const concertAssociations = useConcertAssociations();
  
  /**
   * Hooks pour la recherche d'entités
   */
  const lieuSearch = useEntitySearch({
    entityType: 'lieux',
    searchField: 'nom',
    additionalSearchFields: ['ville', 'codePostal', 'adresse']
  });

  const programmateurSearch = useEntitySearch({
    entityType: 'programmateurs',
    searchField: 'nom',
    additionalSearchFields: ['structure', 'email']
  });

  const artisteSearch = useEntitySearch({
    entityType: 'artistes',
    searchField: 'nom',
    additionalSearchFields: ['genre', 'description']
  });

  // Accesseurs pour les entités sélectionnées
  const lieu = lieuSearch.selectedEntity;
  const programmateur = programmateurSearch.selectedEntity;
  const artiste = artisteSearch.selectedEntity;
  
  // Setters pour les entités sélectionnées
  const setLieu = lieuSearch.setSelectedEntity;
  const setProgrammateur = programmateurSearch.setSelectedEntity;
  const setArtiste = artisteSearch.setSelectedEntity;

  /**
   * Sous-fonctions pour la récupération des données
   */

  // Récupération des données de base du concert avec cache-busting
  const fetchConcertData = async () => {
    try {
      console.log(`Récupération des données du concert ${id} (cache key: ${cacheKey})`);
      const concertDoc = await getDoc(doc(db, 'concerts', id));
      if (concertDoc.exists()) {
        const concertData = {
          id: concertDoc.id,
          ...concertDoc.data()
        };
        
        console.log('Données du concert récupérées:', concertData);
        setConcert(concertData);
        
        // Initialiser le formulaire d'édition avec les données du concert
        setFormState({
          date: concertData.date || '',
          montant: concertData.montant || '',
          statut: concertData.statut || 'En attente',
          titre: concertData.titre || '',
          notes: concertData.notes || ''
        });
        
        // Stocker les IDs initiaux pour la gestion des relations bidirectionnelles
        if (concertData.programmateurId) {
          setInitialProgrammateurId(concertData.programmateurId);
        }
        
        if (concertData.artisteId) {
          setInitialArtisteId(concertData.artisteId);
        }
        
        return concertData;
      } else {
        console.error('Concert non trouvé');
        navigate('/concerts');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du concert:', error);
      return null;
    }
  };

  // Récupération des données du lieu associé
  const fetchLieuData = async (concertData) => {
    if (!concertData || !concertData.lieuId) return;
    
    try {
      const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
      if (lieuDoc.exists()) {
        const lieuData = {
          id: lieuDoc.id,
          ...lieuDoc.data()
        };
        setLieu(lieuData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du lieu:', error);
    }
  };

  // Récupération des données du programmateur associé
  const fetchProgrammateurData = async (concertData) => {
    if (!concertData || !concertData.programmateurId) return;
    
    try {
      const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
      if (progDoc.exists()) {
        const progData = {
          id: progDoc.id,
          ...progDoc.data()
        };
        setProgrammateur(progData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du programmateur:', error);
    }
  };

  // Récupération des données de l'artiste associé
  const fetchArtisteData = async (concertData) => {
    if (!concertData || !concertData.artisteId) return;
    
    try {
      const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
      if (artisteDoc.exists()) {
        const artisteData = {
          id: artisteDoc.id,
          ...artisteDoc.data()
        };
        setArtiste(artisteData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'artiste:', error);
    }
  };

  // Fonction pour forcer le rafraîchissement des données
  const refreshConcert = useCallback(async () => {
    // Mise à jour du cacheKey pour éviter la mise en cache
    setCacheKey(getCacheKey(id));
    
    // Refetch all data
    await fetchConcert();
    
    // Émettre un événement personnalisé pour informer d'autres composants
    try {
      const event = new CustomEvent('concertDataRefreshed', { 
        detail: { id, timestamp: Date.now() } 
      });
      window.dispatchEvent(event);
      console.log('Événement concertDataRefreshed émis pour concert', id);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de rafraîchissement', e);
    }
  }, [id]);

  // Fonction principale pour charger toutes les données
  const fetchConcert = async () => {
    setLoading(true);
    try {
      const concertData = await fetchConcertData();
      if (!concertData) return;
      
      // Chargement parallèle des données associées
      await Promise.all([
        fetchLieuData(concertData),
        fetchProgrammateurData(concertData),
        fetchArtisteData(concertData),
        concertForms.fetchFormData(concertData)
      ]);
      
    } catch (error) {
      console.error('Erreur lors de la récupération du concert:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestion du formulaire et des modifications
   */

  // Changement de valeur dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    return formState.date && formState.montant && lieu;
  };

  // Sauvegarde des modifications
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires (date, montant, lieu).');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer l'objet de données du concert
      const concertData = {
        ...formState,
        lieuId: lieu?.id || null,
        lieuNom: lieu?.nom || null,
        lieuAdresse: lieu?.adresse || null,
        lieuCodePostal: lieu?.codePostal || null,
        lieuVille: lieu?.ville || null,
        lieuCapacite: lieu?.capacite || null,
        
        programmateurId: programmateur?.id || null,
        programmateurNom: programmateur?.nom || null,
        
        artisteId: artiste?.id || null,
        artisteNom: artiste?.nom || null,
        
        updatedAt: new Date().toISOString()
      };
      
      console.log('Mise à jour du concert avec les données:', concertData);
      
      // Mise à jour du concert
      await updateDoc(doc(db, 'concerts', id), concertData);
      console.log('Concert mis à jour dans Firestore, id:', id);
      
      // Mises à jour bidirectionnelles en utilisant le hook d'associations
      if (programmateur?.id || initialProgrammateurId) {
        await concertAssociations.updateProgrammateurAssociation(
          id,
          concertData,
          programmateur?.id || null,
          initialProgrammateurId,
          lieu
        );
      }
      
      if (artiste?.id || initialArtisteId) {
        await concertAssociations.updateArtisteAssociation(
          id,
          concertData,
          artiste?.id || null,
          initialArtisteId,
          lieu
        );
      }
      
      // Mettre à jour les données locales en récupérant les données fraîches
      console.log('Rafraîchissement des données après mise à jour...');
      await refreshConcert();
      
      // Retour au mode vue
      setIsEditMode(false);
      
      // Mettre à jour les IDs initiaux pour la prochaine édition
      setInitialProgrammateurId(programmateur?.id || null);
      setInitialArtisteId(artiste?.id || null);
      
      // Émettre un événement personnalisé pour notifier les autres composants
      try {
        const event = new CustomEvent('concertUpdated', { 
          detail: { 
            id, 
            status: concertData.statut,
            data: concertData
          } 
        });
        window.dispatchEvent(event);
        console.log('Événement concertUpdated émis pour concert', id);
      } catch (e) {
        console.warn('Impossible de déclencher l\'événement de mise à jour', e);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du concert:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du concert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression du concert
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      
      // Mise à jour du programmateur
      if (programmateur?.id) {
        await concertAssociations.updateProgrammateurAssociation(
          id,
          concert,
          null,
          programmateur.id,
          lieu
        );
      }
      
      // Mise à jour de l'artiste
      if (artiste?.id) {
        await concertAssociations.updateArtisteAssociation(
          id,
          concert,
          null,
          artiste.id,
          lieu
        );
      }
      
      // Supprimer le concert
      await deleteDoc(doc(db, 'concerts', id));
      
      // Notifier les autres composants
      try {
        const event = new CustomEvent('concertDeleted', { detail: { id } });
        window.dispatchEvent(event);
        console.log('Événement concertDeleted émis pour concert', id);
      } catch (e) {
        console.warn('Impossible de déclencher l\'événement de suppression', e);
      }
      
      navigate('/concerts');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du concert:', error);
      alert('Une erreur est survenue lors de la suppression du concert.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour basculer en mode édition
  const toggleEditMode = () => {
    if (isEditMode) {
      // Annuler les modifications et revenir au mode vue
      setFormState({
        date: concert.date || '',
        montant: concert.montant || '',
        statut: concert.statut || 'En attente',
        titre: concert.titre || '',
        notes: concert.notes || ''
      });
    }
    
    setIsEditMode(!isEditMode);
  };

  // Fonction pour obtenir les informations sur le statut et les actions requises
  const getStatusInfo = () => {
    if (!concert) return { message: '', actionNeeded: false };
    
    const isPastDate = isDatePassed(concert.date);
    const { formData, formDataStatus } = concertForms;
    
    switch (concert.statut) {
      case 'contact':
        if (!formData) return { message: 'Formulaire à envoyer', actionNeeded: true, action: 'form' };
        if (formData && (!formData.programmateurData && (!formData.data || Object.keys(formData.data).length === 0))) 
          return { message: 'Formulaire envoyé, en attente de réponse', actionNeeded: false };
        if (formData && (formData.programmateurData || (formData.data && Object.keys(formData.data).length > 0)) && formData.status !== 'validated') 
          return { message: 'Formulaire à valider', actionNeeded: true, action: 'validate_form' };
        if (formData && formData.status === 'validated')
          return { message: 'Contrat à préparer', actionNeeded: true, action: 'prepare_contract' };
        return { message: 'Contact établi', actionNeeded: false };
        
      case 'preaccord':
        if (formData && formData.status === 'validated')
          return { message: 'Contrat à envoyer', actionNeeded: true, action: 'send_contract' };
        return { message: 'Contrat à préparer', actionNeeded: true, action: 'contract' };
        
      case 'contrat':
        return { message: 'Facture acompte à envoyer', actionNeeded: true, action: 'invoice' };
        
      case 'acompte':
        return { message: 'En attente du concert', actionNeeded: false };
        
      case 'solde':
        if (isPastDate) return { message: 'Concert terminé', actionNeeded: false };
        return { message: 'Facture solde envoyée', actionNeeded: false };
        
      default:
        return { message: 'Statut non défini', actionNeeded: false };
    }
  };

  // Effet pour charger les données initiales et écouter les événements
  useEffect(() => {
    fetchConcert();
    
    // Vérifier si on doit afficher le générateur de formulaire
    const queryParams = new URLSearchParams(location?.search || '');
    const shouldOpenFormGenerator = queryParams.get('openFormGenerator') === 'true';
    
    if (shouldOpenFormGenerator) {
      concertForms.setShowFormGenerator(true);
    }
    
    // Écouter les événements pour rafraîchir les données si nécessaire
    const handleConcertUpdate = (event) => {
      if (event.detail && event.detail.id === id) {
        console.log(`Événement de mise à jour reçu pour le concert ${id}, rafraîchissement des données...`);
        refreshConcert();
      }
    };
    
    window.addEventListener('concertUpdated', handleConcertUpdate);
    
    return () => {
      window.removeEventListener('concertUpdated', handleConcertUpdate);
    };
  }, [id, navigate, location, cacheKey, refreshConcert]);

  // API publique du hook
  return {
    // Données principales
    concert,
    lieu,
    programmateur,
    artiste,
    loading,
    isSubmitting,
    
    // États du formulaire
    formData: concertForms.formData,
    formDataStatus: concertForms.formDataStatus,
    showFormGenerator: concertForms.showFormGenerator,
    setShowFormGenerator: concertForms.setShowFormGenerator,
    generatedFormLink: concertForms.generatedFormLink,
    setGeneratedFormLink: concertForms.setGeneratedFormLink,
    
    // Mode d'édition
    isEditMode,
    formState,
    
    // Recherche d'entités
    lieuSearch,
    programmateurSearch,
    artisteSearch,
    
    // Fonctions de gestion
    handleChange,
    handleSubmit,
    handleDelete,
    toggleEditMode,
    validateForm,
    handleFormGenerated: concertForms.handleFormGenerated,
    validateProgrammatorForm: concertForms.validateForm,
    refreshConcert,
    
    // Fonctions utilitaires
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    getStatusInfo
  };
};

export default useConcertDetails;