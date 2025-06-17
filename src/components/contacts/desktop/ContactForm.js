import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ErrorMessage from '@components/ui/ErrorMessage';
import { useEntitySearch } from '@/hooks/common';
import { updateBidirectionalRelation } from '@/services/bidirectionalRelationsService';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import FormHeader from '@/components/ui/FormHeader';
import ContactInfoSection from '@/components/contacts/sections/ContactInfoSection';
import ContactQualificationSection from '@/components/contacts/sections/ContactQualificationSection';
import ContactDiffusionSection from '@/components/contacts/sections/ContactDiffusionSection';
import StructureSearchSection from '@/components/contacts/sections/StructureSearchSection';
import LieuSearchSection from '@/components/concerts/sections/LieuSearchSection';
import ContactConcertsSection from '@/components/contacts/sections/ContactConcertsSection';
import ContactNotesSection from '@/components/contacts/desktop/sections/ContactNotesSection';
import { mapTerm } from '@/utils/terminologyMapping';
import styles from './ContactForm.module.css';

/**
 * Composant de formulaire contact - Style maquette adapté TourCraft
 * Version simplifiée pour éviter les boucles infinies
 */
const ContactForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrganization } = useOrganization();
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Détecter le mode "nouveau" via l'URL
  const isNewFromUrl = location.pathname.endsWith('/nouveau');
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    tags: [],
    source: '',
    createdAt: null,
    updatedAt: null,
    nomFestival: '',
    periodeFestivalMois: '',
    periodeFestivalComplete: '',
    bouclage: '',
    structureRaisonSociale: '',
    structureType: '',
    structureSiret: '',
    structureAdresse: '',
    structureCodePostal: '',
    structureVille: '',
    structureTva: '',
    structureNumeroIntracommunautaire: '',
    structureSiteWeb: '',
    notes: ''
  });

  // État pour les associations
  const [lieuxAssocies, setLieuxAssocies] = useState([]);
  const [concertsAssocies, setConcertsAssocies] = useState([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);

  // Callback mémorisé pour la sélection de structure
  const handleStructureSelect = useCallback((structure) => {
    if (structure) {
      setSelectedStructure(structure);
      setFormData(prev => ({
        ...prev,
        structureId: structure.id,
        structureRaisonSociale: structure.nom || '',
        structureSiret: structure.siret || '',
        structureAdresse: structure.adresse || '',
        structureCodePostal: structure.codePostal || '',
        structureVille: structure.ville || '',
        structureType: structure.type || ''
      }));
    }
  }, []);

  // Callback mémorisé pour supprimer la structure
  const handleStructureRemove = useCallback(() => {
    setSelectedStructure(null);
    setFormData(prev => ({
      ...prev,
      structureId: '',
      structureRaisonSociale: '',
      structureSiret: '',
      structureAdresse: '',
      structureCodePostal: '',
      structureVille: '',
      structureType: ''
    }));
  }, []);

  // Callback mémorisé pour la sélection de lieu (utilisé par LieuSearchSection)
  const handleLieuSelect = useCallback((lieu) => {
    if (lieu) {
      setLieuxAssocies(prev => {
        // Vérifier la duplication à l'intérieur du setter
        if (!prev.find(l => l.id === lieu.id)) {
          toast.success(`Lieu "${lieu.nom}" ajouté`);
          return [...prev, lieu];
        }
        return prev;
      });
    }
  }, []);

  // Callback pour supprimer un lieu (utilisé par LieuSearchSection)
  const handleRemoveLieuFromSection = useCallback((lieuId) => {
    if (lieuId) {
      // Supprimer un lieu spécifique par ID
      setLieuxAssocies(prev => prev.filter(lieu => lieu.id !== lieuId));
    } else {
      // Supprimer tous les lieux si aucun ID fourni
      setLieuxAssocies([]);
    }
  }, []);

  // Hook de recherche pour les structures
  const {
    searchTerm: structureSearchTerm,
    setSearchTerm: setStructureSearchTerm,
    results: structureResults,
    showResults: showStructureResults,
    setShowResults: setShowStructureResults,
    isSearching: isSearchingStructures,
    dropdownRef: structureDropdownRef,
    handleCreate: handleCreateStructure
  } = useEntitySearch({
    entityType: 'structures',
    searchField: 'nom',
    additionalSearchFields: ['type', 'siret'],
    maxResults: 10
  });

  // Hook de recherche pour les lieux
  const {
    searchTerm: lieuSearchTerm,
    setSearchTerm: setLieuSearchTerm,
    results: lieuResults,
    showResults: showLieuResults,
    setShowResults: setShowLieuResults,
    isSearching: isSearchingLieux,
    dropdownRef: lieuDropdownRef,
    handleCreate: handleCreateLieu
  } = useEntitySearch({
    entityType: 'lieux',
    searchField: 'nom',
    additionalSearchFields: ['ville', 'codePostal'],
    maxResults: 10
  });
  
  // États pour la recherche de concerts simples
  const [concertSearchTerm, setConcertSearchTerm] = useState('');
  const [concertSearchResults, setConcertSearchResults] = useState([]);
  const [isSearchingConcerts, setIsSearchingConcerts] = useState(false);
  
  // État pour la structure sélectionnée
  const [selectedStructure, setSelectedStructure] = useState(null);
  
  // Fonction pour charger les lieux et concerts associés
  const loadAssociations = useCallback(async (contact) => {
    setLoadingAssociations(true);
    try {
      // Charger les lieux associés
      if (contact.lieuxIds?.length > 0 || contact.lieuxAssocies?.length > 0) {
        const lieuxIds = contact.lieuxIds || contact.lieuxAssocies || [];
        const lieuxPromises = lieuxIds.map(async (lieuRef) => {
          const lieuId = typeof lieuRef === 'object' ? lieuRef.id : lieuRef;
          const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
          return lieuDoc.exists() ? { id: lieuDoc.id, ...lieuDoc.data() } : null;
        });
        const lieux = (await Promise.all(lieuxPromises)).filter(lieu => lieu !== null);
        setLieuxAssocies(lieux);
      } else {
        // Recherche par référence inverse - 3 méthodes comme dans useContactDetails
        let lieuxLoaded = [];
        
        // Méthode 1: Chercher les lieux avec ce contact dans 'contactIds' (format migré)
        const lieuxConstraints = [where('contactIds', 'array-contains', contact.id)];
        if (currentOrganization?.id) {
          lieuxConstraints.push(where('organizationId', '==', currentOrganization.id));
        }
        let lieuxQuery = query(collection(db, 'lieux'), ...lieuxConstraints);
        let querySnapshot = await getDocs(lieuxQuery);
        lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Méthode 2: Si rien trouvé, chercher par contactId (ancien format)
        if (lieuxLoaded.length === 0) {
          const lieuxConstraints2 = [where('contactId', '==', contact.id)];
          if (currentOrganization?.id) {
            lieuxConstraints2.push(where('organizationId', '==', currentOrganization.id));
          }
          lieuxQuery = query(collection(db, 'lieux'), ...lieuxConstraints2);
          querySnapshot = await getDocs(lieuxQuery);
          lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        console.log(`[ContactForm] ${lieuxLoaded.length} lieux trouvés par référence inverse`);
        setLieuxAssocies(lieuxLoaded);
      }

      // Charger les concerts associés
      if (contact.concertsIds?.length > 0 || contact.concertsAssocies?.length > 0) {
        const concertsIds = contact.concertsIds || contact.concertsAssocies || [];
        const concertsPromises = concertsIds.map(async (concertRef) => {
          const concertId = typeof concertRef === 'object' ? concertRef.id : concertRef;
          const concertDoc = await getDoc(doc(db, 'concerts', concertId));
          return concertDoc.exists() ? { id: concertDoc.id, ...concertDoc.data() } : null;
        });
        const concerts = (await Promise.all(concertsPromises)).filter(concert => concert !== null);
        setConcertsAssocies(concerts);
      } else {
        // Recherche par référence inverse
        const concertsQuery = query(collection(db, 'concerts'), where('contactIds', 'array-contains', contact.id)); // Format migré
        const concertsSnapshot = await getDocs(concertsQuery);
        const concerts = concertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setConcertsAssocies(concerts);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des associations:', error);
    } finally {
      setLoadingAssociations(false);
    }
  }, [currentOrganization?.id]);

  // Chargement des données du contact
  useEffect(() => {
    const loadContact = async () => {
      if (isNewFromUrl) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'contacts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const contact = { id: docSnap.id, ...data };
          
          setFormData({
            prenom: data.contact?.prenom || data.prenom || '',
            nom: data.contact?.nom || data.nom || '',
            email: data.contact?.email || data.email || '',
            telephone: data.contact?.telephone || data.telephone || '',
            adresse: data.contact?.adresse || data.adresse || '',
            codePostal: data.contact?.codePostal || data.codePostal || '',
            ville: data.contact?.ville || data.ville || '',
            structureId: data.structureId || '',
            structureRaisonSociale: data.structure?.raisonSociale || data.structureRaisonSociale || data.structureNom || '',
            structureType: data.structure?.type || data.structureType || '',
            structureSiret: data.structure?.siret || data.structureSiret || '',
            structureAdresse: data.structure?.adresse || data.structureAdresse || '',
            structureCodePostal: data.structure?.codePostal || data.structureCodePostal || '',
            structureVille: data.structure?.ville || data.structureVille || '',
            structureTva: data.structure?.tva || data.structureTva || '',
            structureNumeroIntracommunautaire: data.structure?.numeroIntracommunautaire || data.structureNumeroIntracommunautaire || '',
            structureSiteWeb: data.structure?.siteWeb || data.structureSiteWeb || '',
            notes: data.notes || ''
          });

          // Charger la structure liée si un structureId existe
          if (data.structureId) {
            try {
              const structureRef = doc(db, 'structures', data.structureId);
              const structureSnap = await getDoc(structureRef);
              if (structureSnap.exists()) {
                const structureData = { id: structureSnap.id, ...structureSnap.data() };
                setSelectedStructure(structureData);
              }
            } catch (structureError) {
              console.error('Erreur lors du chargement de la structure:', structureError);
            }
          }

          // Charger les associations
          await loadAssociations(contact);
        } else {
          setError('Contact introuvable');
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement du contact');
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id, isNewFromUrl, loadAssociations]);

  // Gestionnaire de changement des champs avec validation automatique SIRET
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour différents types de champs
    let processedValue = value;
    
    if (name === 'structureSiret') {
      // SIRET : garder seulement les chiffres, max 14
      processedValue = value.replace(/\D/g, '').slice(0, 14);
    } else if (name === 'telephone') {
      // Téléphone : formater automatiquement
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];
    
    if (!formData.prenom.trim()) {
      errors.push('Le prénom est obligatoire');
    }
    
    if (!formData.nom.trim()) {
      errors.push('Le nom est obligatoire');
    }
    
    // Email facultatif, mais si fourni, doit être valide
    if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.push('Format d\'email invalide');
    }
    
    // Validation du téléphone si fourni
    if (formData.telephone.trim() && !validatePhoneNumber(formData.telephone)) {
      errors.push('Le téléphone doit être un numéro français valide (10 chiffres)');
    }
    
    // Validation du SIRET si fourni
    if (formData.structureSiret.trim() && !validateSiret(formData.structureSiret.trim())) {
      errors.push('Le SIRET doit contenir exactement 14 chiffres');
    }
    
    return errors;
  };

  // Utilitaire de validation SIRET
  const validateSiret = (siret) => {
    // Supprimer tous les espaces et caractères non numériques
    const cleanSiret = siret.replace(/\D/g, '');
    
    // Vérifier la longueur exacte de 14 chiffres
    return cleanSiret.length === 14;
  };

  // Utilitaire de formatage téléphone français
  const formatPhoneNumber = (phone) => {
    // Supprimer tous les caractères non numériques
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Formater selon le standard français (10 chiffres)
    if (cleanPhone.length <= 10) {
      // Format: 01 23 45 67 89
      return cleanPhone.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    }
    
    return phone; // Retourner tel quel si plus de 10 chiffres
  };

  // Validation du téléphone français (optionnel)
  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return true; // Optionnel
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Téléphone français : 10 chiffres commençant par 01-09
    return cleanPhone.length === 10 && /^0[1-9]/.test(cleanPhone);
  };


  // Fonctions de gestion des concerts associés
  const handleRemoveConcert = useCallback((concertId) => {
    setConcertsAssocies(prev => prev.filter(concert => concert.id !== concertId));
    toast.info('Concert retiré de la liste');
  }, []);

  const handleSelectConcertFromSearch = useCallback((concert) => {
    if (concert) {
      setConcertsAssocies(prev => {
        // Vérifier la duplication à l'intérieur du setter
        if (!prev.find(c => c.id === concert.id)) {
          toast.success(`Concert "${concert.titre}" ajouté`);
          return [...prev, concert];
        }
        return prev;
      });
      // ✅ Nettoyer APRÈS le setState, pas dedans
      setConcertSearchTerm('');
      setConcertSearchResults([]);
    }
  }, []);

  // Fonction de recherche de concerts simplifiée
  const searchConcerts = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setConcertSearchResults([]);
      return;
    }

    setIsSearchingConcerts(true);
    try {
      const concertsQuery = query(
        collection(db, 'concerts'),
        where('titre', '>=', searchTerm),
        where('titre', '<=', searchTerm + '\uf8ff')
      );
      const querySnapshot = await getDocs(concertsQuery);
      const concerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setConcertSearchResults(concerts);
    } catch (error) {
      console.error('Erreur lors de la recherche de concerts:', error);
      setConcertSearchResults([]);
    } finally {
      setIsSearchingConcerts(false);
    }
  }, []);

  // Effet pour la recherche de concerts avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchConcerts(concertSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [concertSearchTerm, searchConcerts]);

  // Filtrer les concerts dans le rendu pour éviter la dépendance dans searchConcerts
  const filteredConcertResults = useMemo(() => 
    concertSearchResults.filter(concert => 
      !concertsAssocies.find(c => c.id === concert.id)
    ),
    [concertSearchResults, concertsAssocies]
  );

  // Gestionnaire de sauvegarde
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(', '));
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Structure plate pour éviter les objets imbriqués - Format unifié
      const contact = {
        // Marqueur de migration pour détection robuste
        migrationVersion: 'unified-v1',
        migrationDate: new Date(),
        
        // Section 1: Structure (avec données du formulaire)
        structureRaisonSociale: formData.structureRaisonSociale?.trim() || '',
        structureAdresse: formData.structureAdresse?.trim() || '',
        structureSuiteAdresse1: '',
        structureCodePostal: formData.structureCodePostal?.trim() || '',
        structureVille: formData.structureVille?.trim() || '',
        structureDepartement: '',
        structureRegion: '',
        structurePays: 'France',
        structureSiteWeb: formData.structureSiteWeb?.trim() || '',
        structureTelephone1: '',
        structureTelephone2: '',
        structureMobile: '',
        structureFax: '',
        structureEmail: '',
        structureType: formData.structureType || '',
        structureSiret: formData.structureSiret?.trim() || '',
        structureTva: formData.structureTva?.trim() || '',
        structureNumeroIntracommunautaire: formData.structureNumeroIntracommunautaire?.trim() || '',
        structureCommentaires1: '',
        structureCommentaires2: '',
        structureCommentaires3: '',
        structureCommentaires4: '',
        structureCommentaires5: '',
        structureCommentaires6: '',
        
        // Section 2: Personne 1 (données principales)
        civilite: '',
        prenom: formData.prenom.trim(),
        nom: formData.nom.trim(),
        prenomNom: `${formData.prenom.trim()} ${formData.nom.trim()}`.trim(),
        fonction: '',
        telDirect: formData.telephone.trim(),
        telPerso: '',
        mobile: '',
        mailDirect: formData.email.trim(),
        mailPerso: '',
        fax: '',
        site: '',
        adresse: formData.adresse.trim(),
        suiteAdresse: '',
        codePostal: formData.codePostal.trim(),
        ville: formData.ville.trim(),
        departement: '',
        region: '',
        pays: 'France',
        commentaires1: '',
        commentaires2: '',
        commentaires3: '',
        
        // Section 3: Personne 2 (vide)
        civilite2: '', prenom2: '', nom2: '', prenomNom2: '', fonction2: '',
        telDirect2: '', telPerso2: '', mobile2: '', mailDirect2: '', mailPerso2: '',
        fax2: '', site2: '', adresse2: '', suiteAdresse2: '', codePostal2: '',
        ville2: '', departement2: '', region2: '', pays2: 'France',
        commentaires12: '', commentaires22: '', commentaires32: '',
        
        // Section 4: Personne 3 (vide)
        civilite3: '', prenom3: '', nom3: '', prenomNom3: '', fonction3: '',
        telDirect3: '', telPerso3: '', mobile3: '', mailDirect3: '', mailPerso3: '',
        fax3: '', site3: '', adresse3: '', suiteAdresse3: '', codePostal3: '',
        ville3: '', departement3: '', region3: '', pays3: 'France',
        commentaires13: '', commentaires23: '', commentaires33: '',
        
        // Section 5: Qualifications
        tags: [],
        client: false,
        source: '',
        
        // Section 6: Diffusion (vide)
        nomFestival: '', periodeFestivalMois: '', periodeFestivalComplete: '', bouclage: '',
        diffusionCommentaires1: '', diffusionCommentaires2: '', diffusionCommentaires3: '',
        
        // Section 7: Salle (vide) 
        salleNom: '', salleAdresse: '', salleSuiteAdresse: '', salleCodePostal: '',
        salleVille: '', salleDepartement: '', salleRegion: '', sallePays: 'France',
        salleTelephone: '', salleJauge1: '', salleJauge2: '', salleJauge3: '',
        salleOuverture: '', salleProfondeur: '', salleHauteur: '',
        
        // Section 8: Associations et métadonnées
        structureId: selectedStructure?.id || formData.structureId || '',
        notes: formData.notes?.trim() || '',
        lieuxIds: lieuxAssocies.map(lieu => lieu.id),
        concertsIds: concertsAssocies.map(concert => concert.id),
        updatedAt: new Date()
      };

      let savedContactId;
      
      if (isNewFromUrl) {
        contact.createdAt = new Date();
        // ✅ FIX: Ajouter automatiquement l'organizationId
        if (currentOrganization?.id) {
          contact.organizationId = currentOrganization.id;
        }
        const docRef = await addDoc(collection(db, 'contacts'), contact);
        savedContactId = docRef.id;
        toast.success('Contact créé avec succès !');
      } else {
        const docRef = doc(db, 'contacts', id);
        await updateDoc(docRef, contact);
        savedContactId = id;
        toast.success('Contact modifié avec succès !');
      }

      // Gérer les relations bidirectionnelles
      try {
        // Relations avec les lieux
        if (contact.lieuxIds && contact.lieuxIds.length > 0) {
          console.log(`🔗 Création des relations bidirectionnelles pour ${contact.lieuxIds.length} lieux`);
          for (const lieuId of contact.lieuxIds) {
            await updateBidirectionalRelation({
              sourceType: 'contacts',
              sourceId: savedContactId,
              targetType: 'lieux',
              targetId: lieuId,
              relationName: 'lieux',
              action: 'add'
            });
          }
        }

        // Relations avec la structure
        if (selectedStructure && selectedStructure.id) {
          console.log(`🔗 Création de la relation bidirectionnelle avec la structure`);
          await updateBidirectionalRelation({
            sourceType: 'contacts',
            sourceId: savedContactId,
            targetType: 'structures',
            targetId: selectedStructure.id,
            relationName: 'structure',
            action: 'add'
          });
        }

        // Relations avec les concerts
        if (contact.concertsIds && contact.concertsIds.length > 0) {
          console.log(`🔗 Création des relations bidirectionnelles pour ${contact.concertsIds.length} concerts`);
          for (const concertId of contact.concertsIds) {
            await updateBidirectionalRelation({
              sourceType: 'contacts',
              sourceId: savedContactId,
              targetType: 'concerts',
              targetId: concertId,
              relationName: 'concerts',
              action: 'add'
            });
          }
        }
      } catch (relationError) {
        console.error('Erreur lors de la création des relations bidirectionnelles:', relationError);
        // On ne bloque pas la navigation même si les relations échouent
      }

      // Navigation après succès
      navigate(`/contacts/${savedContactId}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire d'annulation
  const handleCancel = () => {
    toast.info('Édition annulée');
    if (isNewFromUrl) {
      navigate('/contacts');
    } else {
      navigate(`/contacts/${id}`);
    }
  };

  // Gestionnaire de suppression
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // Confirmation de suppression
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const docRef = doc(db, 'contacts', id);
      await deleteDoc(docRef);
      toast.success(mapTerm('Contact supprimé avec succès'));
      navigate('/contacts');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Fermeture du modal de suppression
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner message={mapTerm("Chargement du contact...")} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <form onSubmit={handleSave}>
        <div className={styles.formContainer}>
          {/* Header - Nouveau composant FormHeader */}
          <FormHeader
            title={isNewFromUrl ? mapTerm('Nouveau Contact') : mapTerm('Modifier Contact')}
            icon={<i className="bi bi-person-badge"></i>}
            isLoading={isSubmitting}
            roundedTop={true}
            actions={[
              <button 
                key="save"
                type="submit" 
                className={`${styles.tcBtn} ${styles.tcBtnPrimary}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Enregistrer
                  </>
                )}
              </button>,
              <button 
                key="cancel"
                type="button" 
                className={`${styles.tcBtn} ${styles.tcBtnSecondary}`}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle"></i>
                Annuler
              </button>,
              ...(isNewFromUrl ? [] : [
                <button 
                  key="delete"
                  type="button" 
                  className={`${styles.tcBtn} ${styles.tcBtnDanger}`}
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-trash"></i>
                  Supprimer
                </button>
              ])
            ]}
          />

          <div className={styles.sectionBody}>
            {/* Section Contact - Utilisation du composant modulaire */}
            <ContactInfoSection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Qualification */}
            <ContactQualificationSection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
              isEditing={!isNewFromUrl}
            />

            {/* Section Diffusion */}
            <ContactDiffusionSection 
              formData={formData}
              handleChange={handleChange}
              errors={{}}
            />

            {/* Section Structure - Composant unifié */}
            <StructureSearchSection 
              structureSearchTerm={structureSearchTerm}
              setStructureSearchTerm={setStructureSearchTerm}
              structureResults={structureResults}
              showStructureResults={showStructureResults}
              setShowStructureResults={setShowStructureResults}
              isSearchingStructures={isSearchingStructures}
              structureDropdownRef={structureDropdownRef}
              selectedStructure={selectedStructure}
              handleSelectStructure={handleStructureSelect}
              handleRemoveStructure={handleStructureRemove}
              handleCreateStructure={handleCreateStructure}
            />

            {/* Section Lieux - Composant unifié */}
            <LieuSearchSection 
              lieuSearchTerm={lieuSearchTerm}
              setLieuSearchTerm={setLieuSearchTerm}
              lieuResults={lieuResults}
              showLieuResults={showLieuResults}
              setShowLieuResults={setShowLieuResults}
              isSearchingLieux={isSearchingLieux}
              lieuDropdownRef={lieuDropdownRef}
              selectedLieu={lieuxAssocies.length > 0 ? lieuxAssocies[0] : null}
              lieuxList={lieuxAssocies}
              setLieuxList={setLieuxAssocies}
              handleSelectLieu={handleLieuSelect}
              handleRemoveLieu={handleRemoveLieuFromSection}
              handleCreateLieu={handleCreateLieu}
            />

            {/* Section Concerts associés - Composant modulaire */}
            <ContactConcertsSection 
              concertSearchTerm={concertSearchTerm}
              setConcertSearchTerm={setConcertSearchTerm}
              filteredConcertResults={filteredConcertResults}
              isSearchingConcerts={isSearchingConcerts}
              concertsAssocies={concertsAssocies}
              loadingAssociations={loadingAssociations}
              handleSelectConcertFromSearch={handleSelectConcertFromSearch}
              handleRemoveConcert={handleRemoveConcert}
            />

            {/* Section Commentaires/Notes */}
            <ContactNotesSection
              notes={formData.notes}
              onChange={handleChange}
              isEditing={true}
            />
          </div>
        </div>
      </form>

      {/* Modal de suppression utilisant le composant dédié */}
      <ConfirmationModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer le contact"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce contact ?"
        entityName={`${formData.prenom} ${formData.nom}`}
        variant="danger"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isLoading={isDeleting}
        warnings={concertsAssocies.length > 0 ? ['Ce contact a des concerts associés. Ils seront également affectés.'] : undefined}
      />
    </div>
  );
};

export default ContactForm; 