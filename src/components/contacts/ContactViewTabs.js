import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUnifiedContact } from '@/hooks/contacts/useUnifiedContact';
import { useTabs } from '@/context/TabsContext';
import { useContactModals } from '@/context/ContactModalsContext';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import Table from '@/components/ui/Table';
import ContratsTableNew from '@/components/contrats/sections/ContratsTableNew';
import ContactFacturesTable from './ContactFacturesTable';
import ContactDatesTable from './ContactDatesTable';
import EntityViewTabs from '@/components/common/EntityViewTabs';
import EntityCard from '@/components/ui/EntityCard';
import TagsSelectionModal from '@/components/ui/TagsSelectionModal';
import AssociatePersonModal from '@/components/ui/AssociatePersonModal';
import PersonneCreationModal from '@/components/contacts/modal/PersonneCreationModal';
import CommentListModal from '@/components/common/modals/CommentListModal';
import { getTagColor, getTagCssClass } from '@/config/tagsConfig';
import { useNavigate } from 'react-router-dom';
import styles from './ContactViewTabs.module.css';

/**
 * Nouvelle vue de contact en layout 3 zones pour tests
 * Zone 1: Infos générales (haut gauche)
 * Zone 2: En construction (haut droite) 
 * Zone 3: En construction (bas, pleine largeur)
 */
function ContactViewTabs({ id, viewType = null }) {
  console.log('[ContactViewTabs] ID reçu:', id, 'viewType:', viewType);
  
  const [forcedViewType] = useState(viewType);
  const [localCommentaires, setLocalCommentaires] = useState([]);
  const [lastLocalUpdate, setLastLocalUpdate] = useState(null);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [localTags, setLocalTags] = useState([]);
  const [showAssociatePersonModal, setShowAssociatePersonModal] = useState(false);
  const [showEditPersonModal, setShowEditPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [localPersonnes, setLocalPersonnes] = useState([]);
  const [showCommentListModal, setShowCommentListModal] = useState(false);
  const [selectedPersonForComments, setSelectedPersonForComments] = useState(null);
  const [datesData, setDatesData] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);
  
  // Hook pour gérer les onglets
  const { openDateCreationTab, openContactTab, openPreContratTab, openContratTab, openTab } = useTabs();
  
  // Hook pour gérer les modals
  const { openCommentModal, openPersonneModal } = useContactModals();
  
  // Hook pour récupérer l'utilisateur actuel
  const { currentUser } = useAuth();
  
  // Hook pour récupérer l'organisation courante
  const { currentOrganization } = useOrganization();
  
  // Hook pour la navigation
  const navigate = useNavigate();
  
  // Hook unifié original (qui marchait) mais sans cache
  const { contact, loading, error, entityType } = useUnifiedContact(id);

  console.log('[ContactViewTabs] Données unifiées:', { contact, loading, error, entityType });
  
  // Synchroniser les données locales avec le contact (optimisé)
  useEffect(() => {
    if (!contact) return;
    
    // Synchroniser les tags seulement si différents
    const newTags = contact?.qualification?.tags || [];
    setLocalTags(prevTags => {
      if (JSON.stringify(prevTags) !== JSON.stringify(newTags)) {
        console.log('🏷️ [ContactViewTabs] Synchronisation tags:', newTags.length);
        return newTags;
      }
      return prevTags;
    });
    
    // Synchroniser les personnes seulement si différentes
    const newPersonnes = contact?.personnes || [];
    setLocalPersonnes(prevPersonnes => {
      if (JSON.stringify(prevPersonnes) !== JSON.stringify(newPersonnes)) {
        console.log('👥 [ContactViewTabs] Synchronisation personnes:', newPersonnes.length);
        return newPersonnes;
      }
      return prevPersonnes;
    });
  }, [contact]);

  
  // Gestion des tags (mémorisée pour éviter les boucles)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTagsChange = useCallback(async (newTags) => {
    try {
      console.log('[ContactViewTabs] handleTagsChange appelé avec:', newTags);
      console.log('[ContactViewTabs] Tags actuels:', extractedData?.tags);
      
      // Mettre à jour dans Firestore
      const contactRef = doc(db, 'contacts_unified', id);
      await updateDoc(contactRef, {
        'qualification.tags': newTags,
        updatedAt: serverTimestamp()
      });
      
      console.log('[ContactViewTabs] Tags mis à jour avec succès dans Firestore');
      
      // Plus besoin d'invalider le cache - temps réel avec onSnapshot
      
      // Mettre à jour l'état local immédiatement (pas de rechargement de page)
      setLocalTags(newTags);
      setShowTagsModal(false);
    } catch (error) {
      console.error('[ContactViewTabs] Erreur lors de la mise à jour des tags:', error);
    }
  }, [id]);

  // Gestion de l'association des personnes (mémorisée)
  const handleAssociatePersons = useCallback(async (selectedPersons) => {
    try {
      console.log('[ContactViewTabs] Association de personnes:', selectedPersons);
      
      if (!selectedPersons || selectedPersons.length === 0) {
        console.warn('Aucune personne sélectionnée');
        return;
      }
      
      // Debug: afficher la structure des données reçues
      console.log('[ContactViewTabs] Structure des données de la première personne:', selectedPersons[0]);

      // Mettre à jour la structure avec les nouvelles personnes associées
      const contactRef = doc(db, 'contacts_unified', id);
      const docSnap = await getDoc(contactRef);
      
      if (!docSnap.exists()) {
        throw new Error('Structure non trouvée');
      }

      const currentData = docSnap.data();
      const currentPersonnes = currentData.personnes || [];

      // Ajouter les nouvelles personnes (conversion du format)
      const newPersonnes = selectedPersons.map(person => {
        // La modal envoie les données complètes du document Firestore
        // incluant la structure { personne: {...} }
        const personneData = person.personne || {};
        
        return {
          id: person.id,
          prenom: personneData.prenom || person.prenom || '',
          nom: personneData.nom || person.nomFamille || '',
          fonction: personneData.fonction || person.fonction || '',
          email: personneData.email || person.email || '',
          telephone: personneData.telephone || personneData.mobile || person.telephone || '',
          mobile: personneData.mobile || '',
          mailPerso: personneData.mailPerso || '',
          telDirect: personneData.telDirect || '',
          telPerso: personneData.telPerso || '',
          adresse: personneData.adresse || '',
          codePostal: personneData.codePostal || '',
          ville: personneData.ville || '',
          pays: personneData.pays || ''
        };
      });

      // Combiner avec les personnes existantes (éviter les doublons)
      const existingIds = currentPersonnes.map(p => p.id);
      console.log('[ContactViewTabs] IDs existants:', existingIds);
      
      const uniqueNewPersonnes = newPersonnes.filter(p => !existingIds.includes(p.id));
      const duplicatePersonnes = newPersonnes.filter(p => existingIds.includes(p.id));
      
      if (duplicatePersonnes.length > 0) {
        console.warn('[ContactViewTabs] Personnes déjà associées:', duplicatePersonnes);
        const duplicateNames = duplicatePersonnes.map(p => `${p.prenom} ${p.nom}`.trim()).join(', ');
        alert(`Ces personnes sont déjà associées à cette structure : ${duplicateNames}`);
      }
      
      if (uniqueNewPersonnes.length === 0) {
        console.log('[ContactViewTabs] Aucune nouvelle personne à ajouter');
        return;
      }
      
      const updatedPersonnes = [...currentPersonnes, ...uniqueNewPersonnes];
      
      console.log('[ContactViewTabs] Personnes actuelles:', currentPersonnes);
      console.log('[ContactViewTabs] Nouvelles personnes à ajouter:', uniqueNewPersonnes);
      console.log('[ContactViewTabs] Total après fusion:', updatedPersonnes);

      // Mettre à jour dans Firestore
      await updateDoc(contactRef, {
        personnes: updatedPersonnes,
        updatedAt: serverTimestamp()
      });

      console.log('[ContactViewTabs] Personnes associées avec succès');
      
      // Plus besoin d'invalider le cache - temps réel avec onSnapshot
      
      // Mettre à jour l'état local immédiatement (pas de rechargement de page)
      setLocalPersonnes(updatedPersonnes);

    } catch (error) {
      console.error('[ContactViewTabs] Erreur lors de l\'association des personnes:', error);
      alert('Erreur lors de l\'association des personnes');
    }
  }, [id, currentOrganization]);

  // Gestion de l'édition d'une personne (mémorisée)
  const handleEditPerson = useCallback((personne) => {
    console.log('[ContactViewTabs] Ouverture de l\'édition pour:', personne);
    setEditingPerson(personne);
    setShowEditPersonModal(true);
  }, []);

  // Gestion de la sauvegarde de l'édition d'une personne (mémorisée)
  const handleUpdatePerson = useCallback(async (updatedPersonData) => {
    try {
      console.log('[ContactViewTabs] Mise à jour de la personne:', updatedPersonData);
      
      // Mettre à jour la personne dans la structure
      const contactRef = doc(db, 'contacts_unified', id);
      const docSnap = await getDoc(contactRef);
      
      if (!docSnap.exists()) {
        throw new Error('Structure non trouvée');
      }

      const currentData = docSnap.data();
      const currentPersonnes = currentData.personnes || [];

      // Trouver et mettre à jour la personne
      const updatedPersonnes = currentPersonnes.map(p => {
        if (p.id === updatedPersonData.id) {
          return {
            ...p,
            prenom: updatedPersonData.prenom,
            nom: updatedPersonData.nom,
            fonction: updatedPersonData.fonction,
            email: updatedPersonData.mailDirect,
            telephone: updatedPersonData.telDirect,
            mobile: updatedPersonData.mobile,
            mailPerso: updatedPersonData.mailPerso,
            telPerso: updatedPersonData.telPerso,
            adresse: updatedPersonData.adresse,
            codePostal: updatedPersonData.codePostal,
            ville: updatedPersonData.ville,
            departement: updatedPersonData.departement,
            region: updatedPersonData.region,
            pays: updatedPersonData.pays
          };
        }
        return p;
      });

      // Mettre à jour dans Firestore
      await updateDoc(contactRef, {
        personnes: updatedPersonnes,
        updatedAt: serverTimestamp()
      });

      console.log('[ContactViewTabs] Personne mise à jour avec succès');
      
      // Plus besoin d'invalider le cache - temps réel avec onSnapshot
      
      // Mettre à jour l'état local immédiatement
      setLocalPersonnes(updatedPersonnes);
      
      // Fermer la modal
      setShowEditPersonModal(false);
      setEditingPerson(null);

    } catch (error) {
      console.error('[ContactViewTabs] Erreur lors de la mise à jour de la personne:', error);
      alert('Erreur lors de la mise à jour de la personne');
    }
  }, [id]);

  // Gestion de la dissociation d'une personne (mémorisée)
  const handleDissociatePerson = useCallback(async (personne) => {
    try {
      console.log('[ContactViewTabs] Dissociation de la personne:', personne);
      
      // Demander confirmation
      const personDisplayName = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'cette personne';
      const confirmation = window.confirm(
        `Êtes-vous sûr de vouloir dissocier "${personDisplayName}" de cette structure ?\n\n` +
        `Cette action retirera la personne de la structure. Si c'est une personne libre, elle restera accessible dans la liste des contacts.`
      );
      
      if (!confirmation) {
        return;
      }

      // Etape 1: Retirer la personne du tableau de la structure
      const contactRef = doc(db, 'contacts_unified', id);
      const docSnap = await getDoc(contactRef);
      
      if (!docSnap.exists()) {
        throw new Error('Structure non trouvée');
      }

      const currentData = docSnap.data();
      const currentPersonnes = currentData.personnes || [];

      // Filtrer pour retirer la personne dissociée
      const updatedPersonnes = currentPersonnes.filter(p => p.id !== personne.id);
      
      console.log('[ContactViewTabs] Personnes avant dissociation:', currentPersonnes.length);
      console.log('[ContactViewTabs] Personnes après dissociation:', updatedPersonnes.length);

      // Mettre à jour la structure sans cette personne
      await updateDoc(contactRef, {
        personnes: updatedPersonnes,
        updatedAt: serverTimestamp()
      });

      // Etape 2: S'assurer que la personne existe comme personne libre
      // Chercher si elle existe déjà comme personne libre
      // Extraire prenom et nom depuis le champ "nom" si nécessaire
      let prenom = personne.prenom;
      let nom = personne.nom;
      
      // Si nom contient "prénom nom" et prenom est vide, essayer de les séparer
      if (!prenom && nom && nom.includes(' ')) {
        const parts = nom.split(' ');
        prenom = parts[0];
        nom = parts.slice(1).join(' ');
      }
      
      // Sécuriser les valeurs pour éviter undefined
      const prenomSafe = prenom || '';
      const nomSafe = nom || '';
      
      console.log('[ContactViewTabs] Recherche personne libre avec:', { prenomSafe, nomSafe });
      
      // Construire la requête seulement avec les champs non vides
      let personneLibreQuery = query(
        collection(db, 'contacts_unified'),
        where('entityType', '==', 'personne_libre'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      // Ajouter les filtres seulement si les valeurs ne sont pas vides
      if (prenomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.prenom', '==', prenomSafe));
      }
      if (nomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.nom', '==', nomSafe));
      }
      
      const personneLibreSnapshot = await getDocs(personneLibreQuery);
      
      if (personneLibreSnapshot.empty) {
        console.log('[ContactViewTabs] Création de la personne comme personne libre');
        
        // Créer un document personne libre
        const personneLibreData = {
          entityType: 'personne_libre',
          organizationId: currentOrganization.id,
          personne: {
            prenom: prenomSafe,
            nom: nomSafe,
            fonction: personne.fonction || '',
            email: personne.email || '',
            telephone: personne.telephone || '',
            mobile: personne.mobile || '',
            mailPerso: personne.mailPerso || '',
            telPerso: personne.telPerso || '',
            adresse: personne.adresse || '',
            codePostal: personne.codePostal || '',
            ville: personne.ville || '',
            departement: personne.departement || '',
            region: personne.region || '',
            pays: personne.pays || 'France'
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'contacts_unified'), personneLibreData);
        console.log('[ContactViewTabs] Personne libre créée avec succès');
      } else {
        console.log('[ContactViewTabs] La personne existe déjà comme personne libre');
      }

      console.log('[ContactViewTabs] Dissociation terminée avec succès');
      
      // Plus besoin d'invalider le cache - temps réel avec onSnapshot
      
      // Mettre à jour l'état local immédiatement
      setLocalPersonnes(updatedPersonnes);
      
      // Forcer un rechargement des données depuis Firestore après 500ms
      // pour s'assurer de la cohérence (sans risque de boucle infinie)
      setTimeout(async () => {
        try {
          const refreshedDoc = await getDoc(contactRef);
          if (refreshedDoc.exists()) {
            const refreshedData = refreshedDoc.data();
            if (refreshedData.personnes) {
              setLocalPersonnes(refreshedData.personnes);
              console.log('[ContactViewTabs] Données personnes rafraîchies depuis Firestore');
            }
          }
        } catch (error) {
          console.warn('[ContactViewTabs] Erreur lors du rafraîchissement:', error);
        }
      }, 500);
      
      // Afficher un message de succès
      alert(`"${personDisplayName}" a été dissocié(e) de la structure avec succès.\n\nLa personne reste accessible dans la liste des contacts.`);

    } catch (error) {
      console.error('[ContactViewTabs] Erreur lors de la dissociation de la personne:', error);
      
      // Afficher le message d'erreur spécifique
      let errorMessage = 'Erreur lors de la dissociation de la personne';
      if (error.message) {
        errorMessage += `:\n${error.message}`;
      }
      if (error.code) {
        errorMessage += `\nCode: ${error.code}`;
      }
      
      alert(errorMessage);
      
      // Même en cas d'erreur, essayer de mettre à jour l'affichage local
      // au cas où l'erreur viendrait de l'étape de création de personne libre
      try {
        const contactRef = doc(db, 'contacts_unified', id);
        const docSnap = await getDoc(contactRef);
        if (docSnap.exists()) {
          const currentData = docSnap.data();
          const updatedPersonnes = (currentData.personnes || []).filter(p => p.id !== personne.id);
          setLocalPersonnes(updatedPersonnes);
          console.log('[ContactViewTabs] Affichage mis à jour malgré l\'erreur');
        }
      } catch (refreshError) {
        console.warn('[ContactViewTabs] Impossible de rafraîchir l\'affichage:', refreshError);
      }
    }
  }, [id, currentOrganization]);

  // Gestion de l'ouverture de la fiche d'une personne (mémorisée)
  const handleOpenPersonFiche = useCallback(async (personne) => {
    try {
      console.log('[ContactViewTabs] Ouverture fiche personne:', personne);
      
      // Stratégie : Chercher si cette personne existe déjà comme personne libre
      // Si oui, ouvrir sa fiche directe
      // Si non, créer une personne libre temporaire et ouvrir sa fiche
      
      // Extraire prenom et nom
      let prenom = personne.prenom;
      let nom = personne.nom;
      
      // Si nom contient "prénom nom" et prenom est vide, essayer de les séparer
      if (!prenom && nom && nom.includes(' ')) {
        const parts = nom.split(' ');
        prenom = parts[0];
        nom = parts.slice(1).join(' ');
      }
      
      const prenomSafe = prenom || '';
      const nomSafe = nom || '';
      
      console.log('[ContactViewTabs] Recherche personne libre existante:', { prenomSafe, nomSafe });
      
      // Chercher si elle existe comme personne libre
      let personneLibreQuery = query(
        collection(db, 'contacts_unified'),
        where('entityType', '==', 'personne_libre'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      if (prenomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.prenom', '==', prenomSafe));
      }
      if (nomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.nom', '==', nomSafe));
      }
      
      const personneLibreSnapshot = await getDocs(personneLibreQuery);
      
      if (!personneLibreSnapshot.empty) {
        // Elle existe déjà comme personne libre, ouvrir sa fiche
        const existingPersonDoc = personneLibreSnapshot.docs[0];
        const personneLibreId = existingPersonDoc.id;
        const personneData = existingPersonDoc.data();
        const personneNom = `${personneData.personne?.prenom || ''} ${personneData.personne?.nom || ''}`.trim() || 'Personne';
        
        console.log('[ContactViewTabs] Personne libre trouvée, ouverture:', personneLibreId);
        
        // Ouvrir dans un nouvel onglet avec le système d'onglets
        openContactTab(personneLibreId, personneNom);
        
      } else {
        // Elle n'existe pas comme personne libre, la créer puis ouvrir sa fiche
        console.log('[ContactViewTabs] Création personne libre pour consultation');
        
        const personneLibreData = {
          entityType: 'personne_libre',
          organizationId: currentOrganization.id,
          personne: {
            prenom: prenomSafe,
            nom: nomSafe,
            fonction: personne.fonction || '',
            email: personne.email || '',
            telephone: personne.telephone || '',
            mobile: personne.mobile || '',
            mailPerso: personne.mailPerso || '',
            telPerso: personne.telPerso || '',
            adresse: personne.adresse || '',
            codePostal: personne.codePostal || '',
            ville: personne.ville || '',
            departement: personne.departement || '',
            region: personne.region || '',
            pays: personne.pays || 'France'
          },
          metadata: {
            createdFrom: 'structure_person_view',
            sourceStructureId: id,
            createdForViewing: true
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'contacts_unified'), personneLibreData);
        const newPersonneId = docRef.id;
        const newPersonneNom = `${prenomSafe} ${nomSafe}`.trim() || 'Nouvelle personne';
        
        console.log('[ContactViewTabs] Personne libre créée:', newPersonneId);
        
        // Ouvrir la fiche de la nouvelle personne libre dans un nouvel onglet
        openContactTab(newPersonneId, newPersonneNom);
      }
      
    } catch (error) {
      console.error('[ContactViewTabs] Erreur lors de l\'ouverture de la fiche personne:', error);
      alert('Erreur lors de l\'ouverture de la fiche de la personne');
    }
  }, [id, currentOrganization, openContactTab]);

  // Gestion de l'ajout de commentaire à une personne (mémorisée)
  const handleAddCommentToPerson = useCallback(async (personne) => {
    console.log('[ContactViewTabs] Ajout commentaire pour personne:', personne);
    
    const personneNom = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne';
    
    try {
      // Étape 1 : Trouver ou créer la fiche individuelle de la personne
      let prenom = personne.prenom;
      let nom = personne.nom;
      
      // Si nom contient "prénom nom" et prenom est vide, essayer de les séparer
      if (!prenom && nom && nom.includes(' ')) {
        const parts = nom.split(' ');
        prenom = parts[0];
        nom = parts.slice(1).join(' ');
      }
      
      const prenomSafe = prenom || '';
      const nomSafe = nom || '';
      
      console.log('[ContactViewTabs] Recherche fiche personne pour commentaire:', { prenomSafe, nomSafe });
      
      // Chercher si elle existe comme personne libre
      let personneLibreQuery = query(
        collection(db, 'contacts_unified'),
        where('entityType', '==', 'personne_libre'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      if (prenomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.prenom', '==', prenomSafe));
      }
      if (nomSafe) {
        personneLibreQuery = query(personneLibreQuery, where('personne.nom', '==', nomSafe));
      }
      
      const personneLibreSnapshot = await getDocs(personneLibreQuery);
      
      let personneLibreId;
      let existingComments = [];
      
      if (!personneLibreSnapshot.empty) {
        // Elle existe déjà comme personne libre
        const personneDoc = personneLibreSnapshot.docs[0];
        personneLibreId = personneDoc.id;
        const personneData = personneDoc.data();
        existingComments = personneData.commentaires || [];
        
        console.log('[ContactViewTabs] Fiche personne trouvée:', personneLibreId, 'avec', existingComments.length, 'commentaires');
      } else {
        // Elle n'existe pas, la créer
        console.log('[ContactViewTabs] Création fiche personne pour commentaires');
        
        const personneLibreData = {
          entityType: 'personne_libre',
          organizationId: currentOrganization.id,
          personne: {
            prenom: prenomSafe,
            nom: nomSafe,
            fonction: personne.fonction || '',
            email: personne.email || '',
            telephone: personne.telephone || '',
            mobile: personne.mobile || '',
            mailPerso: personne.mailPerso || '',
            telPerso: personne.telPerso || '',
            adresse: personne.adresse || '',
            codePostal: personne.codePostal || '',
            ville: personne.ville || '',
            departement: personne.departement || '',
            region: personne.region || '',
            pays: personne.pays || 'France'
          },
          commentaires: [], // Initialiser avec tableau vide de commentaires
          metadata: {
            createdFrom: 'structure_person_comment',
            sourceStructureId: id,
            createdForComments: true
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'contacts_unified'), personneLibreData);
        personneLibreId = docRef.id;
        existingComments = [];
        console.log('[ContactViewTabs] Fiche personne créée:', personneLibreId);
      }
      
      // Étape 2 : Décider quelle modal ouvrir selon les commentaires existants
      if (existingComments.length > 0) {
        // Il y a déjà des commentaires → Ouvrir la modal de liste
        console.log('[ContactViewTabs] Ouverture modal liste commentaires');
        setSelectedPersonForComments({
          id: personneLibreId,
          nom: personneNom,
          prenom: prenomSafe,
          nomFamille: nomSafe
        });
        setShowCommentListModal(true);
      } else {
        // Pas de commentaires → Ouvrir directement la modal de création
        console.log('[ContactViewTabs] Ouverture directe modal création commentaire');
        openCreateCommentModal(personneLibreId, personneNom);
      }
      
    } catch (error) {
      console.error('[ContactViewTabs] Erreur lors de la gestion du commentaire personne:', error);
      alert('Erreur lors de l\'ouverture du commentaire pour cette personne');
    }
  }, [id, currentOrganization]);

  // Fonction pour ouvrir la modal de création de commentaire
  const openCreateCommentModal = (personneLibreId, personneNom) => {
    openCommentModal({
      title: `Nouveau commentaire - ${personneNom}`,
      onSave: async (content) => {
        try {
          console.log('[ContactViewTabs] Sauvegarde commentaire sur fiche personne:', { personneLibreId, content });
          
          // Ajouter le commentaire à la fiche de la personne (pas la structure)
          const personneDocRef = doc(db, 'contacts_unified', personneLibreId);
          
          // Récupérer les commentaires existants de la personne
          const personneDocSnap = await getDoc(personneDocRef);
          if (!personneDocSnap.exists()) throw new Error('Fiche personne non trouvée');
          
          const personneData = personneDocSnap.data();
          const existingComments = personneData.commentaires || [];
          
          // Créer le nouveau commentaire pour la personne
          const newComment = {
            id: Date.now().toString(),
            contenu: content || '',
            auteur: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
            date: new Date(),
            modifie: false
          };
          
          // Ajouter le commentaire à la fiche de la personne
          await updateDoc(personneDocRef, {
            commentaires: [...existingComments, newComment],
            updatedAt: serverTimestamp()
          });
          
          console.log('[ContactViewTabs] Commentaire ajouté à la fiche personne avec succès');
          
        } catch (error) {
          console.error('[ContactViewTabs] Erreur lors de la sauvegarde du commentaire personne:', error);
          alert(`Erreur: ${error.message}`);
        }
      }
    });
  };

  // Fonction pour supprimer un commentaire (mémorisée)
  const handleDeleteComment = useCallback(async (commentaire) => {
    try {
      console.log('[ContactViewTabs] Suppression commentaire:', commentaire);
      
      // Demander confirmation
      const confirmation = window.confirm(
        `Êtes-vous sûr de vouloir supprimer ce commentaire ?\n\n` +
        `« ${commentaire.contenu.substring(0, 100)}${commentaire.contenu.length > 100 ? '...' : ''} »\n\n` +
        `Cette action est irréversible.`
      );
      
      if (!confirmation) {
        return;
      }

      // Utiliser la collection unifiée
      const docRef = doc(db, 'contacts_unified', id);
      
      // Récupérer les commentaires existants
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Document non trouvé');
      
      const existingData = docSnap.data();
      const existingComments = existingData.commentaires || [];
      
      // Filtrer pour supprimer le commentaire
      const updatedComments = existingComments.filter(c => c.id !== commentaire.id);
      
      console.log('[ContactViewTabs] Commentaires avant suppression:', existingComments.length);
      console.log('[ContactViewTabs] Commentaires après suppression:', updatedComments.length);

      // Mettre à jour dans Firestore
      await updateDoc(docRef, {
        commentaires: updatedComments,
        updatedAt: serverTimestamp()
      });
      
      // Plus besoin d'invalider le cache - temps réel avec onSnapshot
      
      // Mettre à jour l'état local immédiatement avec timestamp
      const now = Date.now();
      setLocalCommentaires(updatedComments);
      setLastLocalUpdate(now);
      
      console.log('Commentaire supprimé avec succès', { localUpdate: now });
      
    } catch (error) {
      console.error('[ContactViewTabs] Erreur lors de la suppression du commentaire:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  }, [id]);

  // Navigation vers les entités liées
  const navigateToEntity = (entityType, entityId, entityName) => {
    console.log(`[ContactViewTabs] Navigation vers ${entityType} avec ID:`, entityId);
    
    if (!entityId) {
      console.warn(`[ContactViewTabs] ID manquant pour ${entityType}`);
      return;
    }
    
    const routes = {
      structure: `/structures/${entityId}`,
      contact: `/contacts/${entityId}`,
      lieu: `/lieux/${entityId}`,
      concert: `/concerts/${entityId}`,
      artiste: `/artistes/${entityId}`
    };
    
    if (routes[entityType]) {
      console.log(`[ContactViewTabs] Navigation vers:`, routes[entityType]);
      navigate(routes[entityType]);
    } else {
      console.error(`[ContactViewTabs] Route inconnue pour ${entityType}`);
    }
  };
  
  // Extraire les données selon le type d'entité (avec tags locaux)
  const extractedData = useMemo(() => {
    if (!contact) return null;
    
    if (entityType === 'structure') {
      // Pour les structures : transformer les données structure+personnes vers l'ancien format
      const structureData = contact.structure || {};
      const personnes = localPersonnes; // Utiliser les personnes locales pour le rafraîchissement instantané
      
      // Créer un objet compatible avec l'ancien format
      return {
        // Données de base
        id: contact.id,
        entityType: 'structure',
        
        // Structure principale
        structureRaisonSociale: structureData.raisonSociale,
        structureNom: structureData.nom,
        structureEmail: structureData.email,
        structureTelephone1: structureData.telephone1,
        structureTelephone2: structureData.telephone2,
        structureMobile: structureData.mobile,
        structureFax: structureData.fax,
        structureSiteWeb: structureData.siteWeb,
        structureSiret: structureData.siret,
        structureType: structureData.type,
        
        // Adresse structure
        structureAdresse: structureData.adresse,
        structureSuiteAdresse1: structureData.suiteAdresse,
        structureCodePostal: structureData.codePostal,
        structureVille: structureData.ville,
        structureDepartement: structureData.departement,
        structureRegion: structureData.region,
        structurePays: structureData.pays,
        
        // Personnes (jusqu'à 3)
        ...(personnes[0] && {
          prenom: personnes[0].prenom,
          nom: personnes[0].nom,
          fonction: personnes[0].fonction,
          mailDirect: personnes[0].email,
          mailPerso: personnes[0].mailPerso,
          telDirect: personnes[0].telephone,
          telPerso: personnes[0].telPerso,
          mobile: personnes[0].mobile,
          adresse: personnes[0].adresse,
          codePostal: personnes[0].codePostal,
          ville: personnes[0].ville,
          pays: personnes[0].pays
        }),
        ...(personnes[1] && {
          prenom2: personnes[1].prenom,
          nom2: personnes[1].nom,
          fonction2: personnes[1].fonction,
          mailDirect2: personnes[1].email,
          mailPerso2: personnes[1].mailPerso,
          telDirect2: personnes[1].telephone,
          telPerso2: personnes[1].telPerso,
          mobile2: personnes[1].mobile,
          adresse2: personnes[1].adresse,
          codePostal2: personnes[1].codePostal,
          ville2: personnes[1].ville,
          pays2: personnes[1].pays
        }),
        ...(personnes[2] && {
          prenom3: personnes[2].prenom,
          nom3: personnes[2].nom,
          fonction3: personnes[2].fonction,
          mailDirect3: personnes[2].email,
          mailPerso3: personnes[2].mailPerso,
          telDirect3: personnes[2].telephone,
          telPerso3: personnes[2].telPerso,
          mobile3: personnes[2].mobile,
          adresse3: personnes[2].adresse,
          codePostal3: personnes[2].codePostal,
          ville3: personnes[2].ville,
          pays3: personnes[2].pays
        }),
        
        // Métadonnées
        tags: localTags,
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        
        // Données salle (de la structure)
        salleNom: structureData.salle?.nom,
        salleAdresse: structureData.salle?.adresse,
        salleCodePostal: structureData.salle?.codePostal,
        salleVille: structureData.salle?.ville,
        salleDepartement: structureData.salle?.departement,
        salleRegion: structureData.salle?.region,
        sallePays: structureData.salle?.pays,
        salleTelephone: structureData.salle?.telephone,
        salleJauge1: structureData.salle?.jauge1,
        salleJauge2: structureData.salle?.jauge2,
        salleJauge3: structureData.salle?.jauge3,
        salleHauteur: structureData.salle?.hauteur,
        salleProfondeur: structureData.salle?.profondeur,
        salleOuverture: structureData.salle?.ouverture,
        
        // Données festival
        nomFestival: structureData.nomFestival,
        periodeFestivalMois: structureData.periodeFestivalMois,
        periodeFestivalComplete: structureData.periodeFestivalComplete
      };
      
    } else if (entityType === 'personne_libre') {
      // Pour les personnes libres : transformer les données personne vers l'ancien format
      const personneData = contact.personne || {};
      
      return {
        // Données de base
        id: contact.id,
        entityType: 'contact',
        
        // Personne
        prenom: personneData.prenom,
        nom: personneData.nom,
        fonction: personneData.fonction,
        civilite: personneData.civilite,
        
        // Emails
        email: personneData.email,
        mailDirect: personneData.email,
        mailPerso: personneData.mailPerso,
        
        // Téléphones
        telephone: personneData.telephone,
        telDirect: personneData.telDirect,
        telPerso: personneData.telPerso,
        mobile: personneData.mobile,
        fax: personneData.fax,
        
        // Adresse
        adresse: personneData.adresse,
        suiteAdresse: personneData.suiteAdresse,
        codePostal: personneData.codePostal,
        ville: personneData.ville,
        departement: personneData.departement,
        region: personneData.region,
        pays: personneData.pays,
        
        // Commentaires
        commentaires1: personneData.commentaires1,
        commentaires2: personneData.commentaires2,
        commentaires3: personneData.commentaires3,
        
        // Métadonnées
        tags: localTags,
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      };
    }
    
    return contact;
  }, [contact, entityType, localTags, localPersonnes]);

  // Mémoriser le nom de structure pour éviter les changements de référence
  const structureName = useMemo(() => extractedData?.structureRaisonSociale, [extractedData?.structureRaisonSociale]);
  
  // Charger les données du tableau de bord filtrées par structure (optimisé)
  useEffect(() => {
    const loadStructureDates = async () => {
      const organizationId = currentOrganization?.id;
      
      if (!organizationId || !structureName) {
        if (datesData.length > 0) {
          console.log('🗂️ [ContactViewTabs] Réinitialisation dates (pas de structure)');
          setDatesData([]);
        }
        return;
      }

      // Éviter les rechargements si les données sont déjà en cours de chargement
      if (datesLoading) {
        console.log('⏳ [ContactViewTabs] Chargement dates déjà en cours');
        return;
      }

      console.log('📅 [ContactViewTabs] Chargement dates pour structure:', structureName);

      try {
        setDatesLoading(true);
        
        // Charger les concerts liés à cette structure
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('organizationId', '==', organizationId),
          where('structureNom', '==', structureName)
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        const structureConcerts = concertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ [ContactViewTabs] Dates chargées:', structureConcerts.length);
        setDatesData(structureConcerts);
      } catch (error) {
        console.error('[ContactViewTabs] Erreur chargement dates structure:', error);
        setDatesData([]);
      } finally {
        setDatesLoading(false);
      }
    };

    // Debounce pour éviter les appels multiples rapprochés
    const timeoutId = setTimeout(loadStructureDates, 100);
    return () => clearTimeout(timeoutId);
  }, [currentOrganization?.id, structureName]); // Supprimer datesLoading des dépendances
  
  // Logique intelligente pour choisir entre commentaires locaux et Firebase
  const commentaires = useMemo(() => {
    // Si on a une modification locale récente, l'utiliser en priorité
    if (lastLocalUpdate && extractedData?.updatedAt) {
      const firebaseTime = extractedData.updatedAt.toMillis ? extractedData.updatedAt.toMillis() : 0;
      if (lastLocalUpdate > firebaseTime) {
        console.log('[ContactViewTabs] Utilisation des commentaires locaux (plus récents)');
        return localCommentaires;
      }
    }
    
    // Sinon utiliser les données Firebase si disponibles, ou l'état local en fallback
    const result = extractedData?.commentaires || localCommentaires || [];
    console.log('[ContactViewTabs] Utilisation des commentaires Firebase/fallback:', result.length);
    return result;
  }, [localCommentaires, extractedData?.commentaires, extractedData?.updatedAt, lastLocalUpdate]);
  
  // Synchroniser les commentaires locaux avec les données du contact de manière intelligente
  useEffect(() => {
    if (!extractedData?.commentaires) return;
    
    // Seulement synchroniser si :
    // 1. L'état local est vide (premier chargement)
    // 2. OU si les données Firebase sont plus récentes que la dernière modification locale
    const shouldSync = localCommentaires.length === 0 || 
      !lastLocalUpdate || 
      (extractedData.updatedAt && extractedData.updatedAt.toMillis && extractedData.updatedAt.toMillis() > lastLocalUpdate);
    
    if (shouldSync && JSON.stringify(localCommentaires) !== JSON.stringify(extractedData.commentaires)) {
      console.log('💬 [ContactViewTabs] Synchronisation des commentaires depuis Firebase');
      setLocalCommentaires(extractedData.commentaires);
    }
  }, [extractedData?.commentaires, extractedData?.updatedAt, lastLocalUpdate]);

  // Tags disponibles (pour usage futur)
  // const availableTags = ['Festival', 'Bar', 'Salles'];
  
  // Fonctions pour gérer les tags (pour usage futur)
  // const handleAddTag = (e) => {
  //   const newTag = e.target.value;
  //   if (newTag && (!contact?.tags || !contact.tags.includes(newTag))) {
  //     console.log('Ajouter tag:', newTag, 'au contact:', id);
  //     alert(`Tag "${newTag}" ajouté (fonctionnalité de sauvegarde à implémenter)`);
  //   }
  //   e.target.value = '';
  // };
  
  const handleRemoveTag = useCallback(async (tagToRemove) => {
    try {
      console.log('Suppression du tag:', tagToRemove, 'du contact:', id);
      
      // Récupérer les tags actuels de l'état local
      const currentTags = localTags || [];
      
      // Supprimer le tag de la liste
      const newTags = currentTags.filter(tag => tag !== tagToRemove);
      
      // Mettre à jour dans Firestore
      const contactRef = doc(db, 'contacts_unified', id);
      await updateDoc(contactRef, {
        'qualification.tags': newTags,
        updatedAt: serverTimestamp()
      });
      
      console.log('Tag supprimé avec succès');
      
      // Plus besoin d'invalider le cache - temps réel avec onSnapshot
      
      // Mettre à jour l'état local immédiatement (pas de rechargement de page)
      setLocalTags(newTags);
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);
      alert('Erreur lors de la suppression du tag');
    }
  }, [id, localTags]);

  // Déterminer le type d'entité pour adapter la configuration
  const isStructure = extractedData && (!extractedData.prenom || extractedData.entityType === 'structure');

  // État simple pour les onglets du bas avec persistence
  const [activeBottomTab, setActiveBottomTab] = useState(() => {
    // Récupérer l'onglet persisté pour cette entité
    if (id) {
      const saved = localStorage.getItem(`bottomTab_${id}`);
      return saved || 'historique';
    }
    return 'historique';
  });

  // Fonction pour changer d'onglet avec persistence
  const handleTabChange = (tabId) => {
    setActiveBottomTab(tabId);
    if (id) {
      localStorage.setItem(`bottomTab_${id}`, tabId);
    }
  };

  // Configuration des onglets du bas (statique, mémorisée)
  const bottomTabsConfig = useMemo(() => [
    { id: 'historique', label: 'Historique', icon: 'bi-clock-history', color: '#28a745' },
    { id: 'diffusion', label: 'Diffusion', icon: 'bi-broadcast', color: '#6f42c1' },
    { id: 'salle', label: 'Salle', icon: 'bi-building', color: '#fd7e14' },
    { id: 'dates', label: 'Dates', icon: 'bi-calendar-event', color: '#dc3545' },
    { id: 'contrats', label: 'Contrats', icon: 'bi-file-earmark-text', color: '#007bff' },
    { id: 'factures', label: 'Factures', icon: 'bi-receipt', color: '#ffc107' }
  ], []);
  
  // Configuration optimisée avec useMemo - Dépendances volontairement réduites
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => ({
    defaultBottomTab: 'historique',
    notFoundIcon: isStructure ? 'bi-building-x' : 'bi-person-x',
    notFoundTitle: isStructure ? 'Structure non trouvée' : 'Contact non trouvé',
    notFoundMessage: isStructure 
      ? 'La structure demandée n\'existe pas ou n\'est plus disponible.'
      : 'Le contact demandé n\'existe pas ou n\'est plus disponible.',

    // Header avec nom et qualifications
    header: {
      render: (contact) => {
        const data = extractedData || contact;
        if (!data) return null;
        
        // Utiliser le type forcé si fourni, sinon détecter automatiquement
        const hasStructureData = data.structureRaisonSociale?.trim();
        const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
        
        // Pour les structures : afficher le nom de la structure
        // Pour les personnes : afficher prénom + nom
        const displayName = isStructure 
          ? (data.structureRaisonSociale || 'Structure sans nom')
          : `${data.prenom || ''} ${data.nom || ''}`.trim() || 'Contact sans nom';

        return (
          <div className={styles.entityHeader}>
            <div className={styles.entityNameSection}>
              <div className={styles.entityIcon}>
                {isStructure ? (
                  <i className="bi bi-building" style={{ fontSize: '1.1rem', color: '#007bff' }}></i>
                ) : (
                  <i className="bi bi-person-circle" style={{ fontSize: '1.1rem', color: '#28a745' }}></i>
                )}
              </div>
              <div className={styles.entityInfo}>
                <h1 className={styles.entityName}>{displayName}</h1>
                {isStructure && data.structureType && (
                  <span className={styles.entityType}>{data.structureType}</span>
                )}
                {!isStructure && data.fonction && (
                  <span className={styles.entityFunction}>{data.fonction}</span>
                )}
              </div>
            </div>
            
            <div className={styles.qualificationsSection}>
              <h3 className={styles.qualificationsTitle}>
                <i className="bi bi-award"></i>
                Qualifications
              </h3>
              <div className={styles.qualificationsList}>
                {data.tags && data.tags.length > 0 ? (
                  data.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className={`${styles.qualificationTag} ${styles[getTagCssClass(tag)]}`}
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      <i className="bi bi-tag-fill"></i>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className={styles.noQualifications}>
                    <i className="bi bi-info-circle"></i>
                    Aucune qualification
                  </span>
                )}
              </div>
              
              {/* Afficher les informations de création */}
              <div className={styles.metaInfo}>
                {data.createdAt && (
                  <span className={styles.createdDate}>
                    <i className="bi bi-calendar-plus"></i>
                    Créé le {data.createdAt.toDate ? 
                      data.createdAt.toDate().toLocaleDateString('fr-FR') : 
                      'Date inconnue'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    
    bottomTabs: bottomTabsConfig,

    topSections: [
      {
        className: 'topLeft',
        title: 'Informations générales',
        icon: 'bi bi-info-circle',
        render: (contact) => {
          const data = extractedData || contact;
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = data.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          
          return (
                        <div className={styles.contactInfoCard}>
              {isStructure ? (
                // Affichage Structure - Tous les champs
                <div className={styles.infoBlock}>
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Email :</span>
                    <span className={styles.value}>
                      {data.structureEmail || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Téléphone :</span>
                    <span className={styles.value}>
                      {data.structureTelephone1 || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Téléphone 2 :</span>
                    <span className={styles.value}>
                      {data.structureTelephone2 || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Adresse :</span>
                    <span className={styles.value}>
                      {(() => {
                        const adresse = [
                          data.structureAdresse,
                          data.structureSuiteAdresse1,
                          data.structureCodePostal,
                          data.structureVille,
                          data.structureDepartement,
                          data.structureRegion,
                          data.structurePays
                        ].filter(Boolean).join(', ');
                        return adresse || <span className={styles.emptyValue}>Non renseignée</span>;
                      })()}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Site web :</span>
                    <span className={styles.value}>
                      {data.structureSiteWeb || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>SIRET :</span>
                    <span className={styles.value}>
                      {data.structureSiret || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                </div>
              ) : (
                // Affichage Personne - Tous les champs
                <div className={styles.infoBlock}>
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Email direct :</span>
                    <span className={styles.value}>
                      {data.mailDirect || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Email personnel :</span>
                    <span className={styles.value}>
                      {data.mailPerso || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Téléphone direct :</span>
                    <span className={styles.value}>
                      {data.telDirect || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Mobile :</span>
                    <span className={styles.value}>
                      {data.mobile || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Téléphone personnel :</span>
                    <span className={styles.value}>
                      {data.telPerso || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Adresse :</span>
                    <span className={styles.value}>
                      {(() => {
                        const adresse = [
                          data.adresse,
                          data.suiteAdresse,
                          data.codePostal,
                          data.ville,
                          data.departement,
                          data.region,
                          data.pays
                        ].filter(Boolean).join(', ');
                        return adresse || <span className={styles.emptyValue}>Non renseignée</span>;
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        }
      },
      {
        className: 'topRight',
        title: 'Tags',
        icon: 'bi bi-tags',
        actions: [
          {
            label: 'Ajouter',
            icon: 'bi bi-plus-circle',
            tooltip: 'Ajouter un tag',
            onClick: () => {
              console.log('Ouvrir modal ajout tag');
              setShowTagsModal(true);
            }
          },
          {
            label: 'Gérer',
            icon: 'bi bi-pencil-square',
            tooltip: 'Gérer les tags',
            onClick: () => {
              console.log('Ouvrir modal gestion tags');
              // TODO: Ouvrir modal de gestion des tags
            }
          }
        ],
        render: (contact) => {
          const data = extractedData || contact;
          return (
            <div className={styles.tagsContent}>
              <div className={styles.currentTags}>
                {data?.tags && data.tags.length > 0 ? (
                  data.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className={`${styles.tag} ${styles[getTagCssClass(tag)]}`}
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      <i className="bi bi-tag"></i>
                      {tag}
                      <button 
                        className={styles.removeTag}
                        onClick={() => handleRemoveTag(tag)}
                        title="Supprimer ce tag"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </span>
                  ))
                ) : (
                  <div className={styles.noTags}>
                    <i className="bi bi-tags" style={{ fontSize: '1.2rem', color: '#6c757d' }}></i>
                    <span>Aucun tag défini</span>
                  </div>
                )}
              </div>
              
              {/* Le sélecteur de tags est maintenant remplacé par les actions dans la bulle */}
            </div>
          );
        }
      },
      {
        className: 'middleLeft',
        title: (contact) => {
          const data = extractedData || contact;
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          return isStructure ? 'Personnes' : 'Structure';
        },
        icon: (contact) => {
          const data = extractedData || contact;
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          return isStructure ? 'bi bi-people' : 'bi bi-building';
        },
        actions: (contact) => {
          const data = extractedData || contact;
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          
          if (isStructure) {
            // Pour les structures : actions sur les personnes
            return [
              {
                label: 'Ajouter',
                icon: 'bi bi-plus-circle',
                tooltip: 'Ajouter une nouvelle personne',
                onClick: () => {
                  console.log('Ajouter nouvelle personne');
                  openPersonneModal();
                }
              },
              {
                label: 'Associer',
                icon: 'bi bi-link-45deg',
                tooltip: 'Associer une personne existante',
                onClick: () => {
                  console.log('Associer personne existante');
                  setShowAssociatePersonModal(true);
                }
              }
            ];
          } else {
            // Pour les personnes : actions sur les structures
            return [
              {
                label: 'Ajouter',
                icon: 'bi bi-plus-circle',
                tooltip: 'Créer une nouvelle structure',
                onClick: () => {
                  console.log('Créer nouvelle structure');
                  // TODO: Ouvrir modal de création de structure
                }
              },
              {
                label: 'Associer',
                icon: 'bi bi-link-45deg',
                tooltip: 'Associer une structure existante',
                onClick: () => {
                  console.log('Associer structure existante');
                  // TODO: Ouvrir modal de sélection de structure
                }
              }
            ];
          }
        },
        render: (contact) => {
          const data = extractedData || contact;
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = data.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          
          if (isStructure) {
            // Pour les structures, afficher les personnes depuis localPersonnes
            return (
              <div className={styles.personnesContent}>
                {localPersonnes.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '100%', overflowY: 'auto' }}>
                    {localPersonnes.map((personne, index) => {
                      // Créer le nom complet pour l'affichage
                      const displayName = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne sans nom';
                      
                      return (
                        <EntityCard
                          key={personne.id}
                          entityType="contact"
                          name={displayName}
                          subtitle={personne.fonction || 'Contact'}
                          onClick={() => {
                            // Pour l'instant, on ne peut pas naviguer vers les personnes individuelles
                            // car elles font partie du document structure unifié
                            console.log('[ContactViewTabs] Clic sur personne:', personne);
                            // TODO: Implémenter la vue détaillée des personnes dans le contexte structure
                          }}
                          icon={<i className="bi bi-person-circle" style={{ fontSize: '1.2rem' }}></i>}
                          compact={true}
                          actions={[
                            {
                              icon: 'bi-pencil',
                              label: 'Modifier',
                              tooltip: 'Modifier cette personne',
                              variant: 'Secondary',
                              onClick: () => {
                                handleEditPerson(personne);
                              }
                            },
                            {
                              icon: 'bi-link-45deg',
                              label: 'Dissocier',
                              tooltip: 'Dissocier de la structure',
                              variant: 'Warning',
                              onClick: () => {
                                handleDissociatePerson(personne);
                              }
                            },
                            {
                              icon: 'bi-eye',
                              label: 'Ouvrir',
                              tooltip: 'Ouvrir la fiche',
                              variant: 'Primary',
                              onClick: () => {
                                console.log('[ContactViewTabs] Ouvrir personne:', personne);
                                handleOpenPersonFiche(personne);
                              }
                            },
                            {
                              icon: 'bi-chat-quote',
                              label: 'Commentaire',
                              tooltip: 'Ajouter un commentaire',
                              variant: 'Secondary',
                              onClick: () => {
                                console.log('[ContactViewTabs] Commentaire personne:', personne);
                                handleAddCommentToPerson(personne);
                              }
                            }
                        ]}
                      />
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyPersonnes}>
                    <i className="bi bi-people" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                    <p>Aucune personne définie</p>
                    <small>Les personnes associées apparaîtront ici.</small>
                  </div>
                )}
              </div>
            );
          } else {
            // Pour les personnes, afficher la structure
            return (
              <div className={styles.structureContent}>
                {data.structureRaisonSociale ? (
                  <EntityCard
                    entityType="structure"
                    name={data.structureRaisonSociale}
                    subtitle={data.structureType || 'Structure'}
                    onClick={() => {
                      console.log('Visualiser structure:', data?.structureId);
                      if (data?.structureId) {
                        // Navigation vers la structure
                        navigateToEntity('structure', data.structureId, data.structureRaisonSociale);
                      } else {
                        // Si pas de structureId spécifique, on peut essayer de retrouver la structure parente
                        // dans le cas d'un document unifié de type structure
                        console.log('Tentative navigation vers structure parente');
                        // Pour les documents unifiés de type structure, l'ID pourrait être extrait
                        const originalId = data.id?.replace('unified_structure_', '');
                        if (originalId) {
                          navigateToEntity('structure', originalId, data.structureRaisonSociale);
                        }
                      }
                    }}
                    icon={<i className="bi bi-building" style={{ fontSize: '1.2rem' }}></i>}
                  />
                ) : (
                  <div className={styles.emptyStructure}>
                    <i className="bi bi-building" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                    <p>Aucune structure associée</p>
                    <small>Les informations de la structure apparaîtront ici.</small>
                  </div>
                )}
              </div>
            );
          }
        }
      },
      {
        className: 'middleRight',
        title: 'Commentaires',
        icon: 'bi bi-chat-quote',
        actions: [
          {
            label: 'Nouveau',
            icon: 'bi bi-plus-circle',
            tooltip: 'Nouveau commentaire',
            onClick: () => {
              openCommentModal({
                title: 'Nouveau commentaire',
                onSave: async (content) => {
                  try {
                    if (!id) throw new Error('ID du contact manquant');
                    
                    // Utiliser la collection unifiée
                    const docRef = doc(db, 'contacts_unified', id);
                    
                    // Récupérer les commentaires existants
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) throw new Error('Document non trouvé');
                    
                    const existingData = docSnap.data();
                    const existingComments = existingData.commentaires || [];
                    
                    // Créer le nouveau commentaire
                    const newComment = {
                      id: Date.now().toString(),
                      contenu: content || '',
                      auteur: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
                      date: new Date(),
                      modifie: false
                    };
                    
                    // Ajouter le nouveau commentaire à la base de données
                    await updateDoc(docRef, {
                      commentaires: [...existingComments, newComment],
                      updatedAt: serverTimestamp()
                    });
                    
                    // Invalider le cache pour forcer le rechargement lors du prochain accès
                    // Plus besoin d'invalider le cache - temps réel
                    
                    // Mettre à jour l'état local immédiatement avec timestamp
                    const now = Date.now();
                    setLocalCommentaires([...existingComments, newComment]);
                    setLastLocalUpdate(now);
                    
                    console.log('Commentaire enregistré avec succès', { localUpdate: now });
                  } catch (error) {
                    console.error('Erreur lors de la sauvegarde du commentaire:', error);
                    alert(`Erreur: ${error.message}`);
                  }
                }
              });
            }
          }
        ],
        render: (contact) => {
          
          return (
            <div className={styles.commentsContent}>
              {commentaires.length > 0 ? (
                <div className={styles.commentsList}>
                  {commentaires.map((commentaire) => (
                    <div key={commentaire.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <div className={styles.commentAuthor}>
                          <i className="bi bi-person-circle"></i>
                          <span>{commentaire.auteur}</span>
                          {/* Afficher l'indicateur si c'est un commentaire sur une personne */}
                          {commentaire.type === 'personne_comment' && commentaire.personneContext && (
                            <span className={styles.commentPersonContext}>
                              <i className="bi bi-person" style={{ marginLeft: '8px', color: '#6f42c1' }}></i>
                              <span style={{ color: '#6f42c1', fontSize: '0.85rem' }}>
                                {commentaire.personneContext.prenom} {commentaire.personneContext.nom}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className={styles.commentDate}>
                          <i className="bi bi-calendar3"></i>
                          <span>
                            {commentaire.date?.toDate ? 
                              commentaire.date.toDate().toLocaleDateString('fr-FR') : 
                              new Date(commentaire.date).toLocaleDateString('fr-FR')
                            }
                          </span>
                          {commentaire.modifie && (
                            <i className="bi bi-pencil-fill" title="Modifié"></i>
                          )}
                          <button 
                            className={styles.deleteCommentButton}
                            onClick={() => handleDeleteComment(commentaire)}
                            title="Supprimer ce commentaire"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className={styles.commentContent}>
                        {commentaire.contenu}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyComments}>
                  <i className="bi bi-chat-quote" style={{ fontSize: '2rem', color: 'var(--tc-text-secondary)' }}></i>
                  <p>Aucun commentaire</p>
                  <small>Cliquez sur + pour ajouter votre premier commentaire</small>
                </div>
              )}
            </div>
          );
        }
      },
    ],

    renderBottomTabContent: () => {
      const data = extractedData;
      
      // PATTERN SIMPLE : Rendu conditionnel comme dans la colonne droite
      if (activeBottomTab === 'historique') {
        return (
          <div className={styles.tabContent}>
            <div className={`${styles.tabContentCentered} ${styles.constructionZone}`}>
              <i className="bi bi-clock-history" style={{ fontSize: '3rem', color: '#28a745' }}></i>
              <h3>Section Historique</h3>
              <p>En construction</p>
              <small>
                Cette section contiendra bientôt toutes les informations relatives à l'historique 
                de ce contact.
              </small>
            </div>
          </div>
        );
      }
      
      if (activeBottomTab === 'diffusion') {
        return (
          <div className={styles.tabContent}>
            <div className={styles.metadataSection}>
              <h3><i className="bi bi-broadcast"></i> Informations de diffusion</h3>
              <div className={styles.metadataGrid}>
                {data?.nomFestival && (
                  <div className={styles.metadataItem}>
                    <strong>Nom du festival:</strong>
                    <span>{data.nomFestival}</span>
                  </div>
                )}
                {data?.periodeFestivalMois && (
                  <div className={styles.metadataItem}>
                    <strong>Période (mois):</strong>
                    <span>{data.periodeFestivalMois}</span>
                  </div>
                )}
                {data?.periodeFestivalComplete && (
                  <div className={styles.metadataItem}>
                    <strong>Période complète:</strong>
                    <span>{data.periodeFestivalComplete}</span>
                  </div>
                )}
                {data?.bouclage && (
                  <div className={styles.metadataItem}>
                    <strong>Bouclage:</strong>
                    <span>{data.bouclage}</span>
                  </div>
                )}
                {data?.diffusionCommentaires1 && (
                  <div className={styles.metadataItem}>
                    <strong>Commentaires:</strong>
                    <span>{data.diffusionCommentaires1}</span>
                  </div>
                )}
              </div>
              {!data?.nomFestival && !data?.periodeFestivalMois && (
                <div className={styles.emptyMessage}>
                  <i className="bi bi-broadcast" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                  <p>Aucune information de diffusion</p>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      if (activeBottomTab === 'salle') {
        return (
          <div className={styles.tabContent}>
            <div className={styles.metadataSection}>
              <h3><i className="bi bi-building"></i> Informations de salle</h3>
              <div className={styles.metadataGrid}>
                {data?.salleNom && (
                  <div className={styles.metadataItem}>
                    <strong>Nom de la salle:</strong>
                    <span>{data.salleNom}</span>
                  </div>
                )}
                {(data?.salleAdresse || data?.salleVille) && (
                  <div className={styles.metadataItem}>
                    <strong>Adresse:</strong>
                    <span>
                      {[
                        data.salleAdresse,
                        data.salleSuiteAdresse,
                        data.salleCodePostal,
                        data.salleVille,
                        data.salleDepartement,
                        data.salleRegion,
                        data.sallePays
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {data?.salleTelephone && (
                  <div className={styles.metadataItem}>
                    <strong>Téléphone:</strong>
                    <span>{data.salleTelephone}</span>
                  </div>
                )}
                {(data?.salleJauge1 || data?.salleJauge2 || data?.salleJauge3) && (
                  <div className={styles.metadataItem}>
                    <strong>Jauges:</strong>
                    <span>
                      {[data.salleJauge1, data.salleJauge2, data.salleJauge3]
                        .filter(Boolean)
                        .join(' / ')}
                    </span>
                  </div>
                )}
                {data?.salleCommentaires && (
                  <div className={styles.metadataItem}>
                    <strong>Commentaires:</strong>
                    <span>{data.salleCommentaires}</span>
                  </div>
                )}
              </div>
              {!data?.salleNom && !data?.salleAdresse && (
                <div className={styles.emptyMessage}>
                  <i className="bi bi-building" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                  <p>Aucune information de salle</p>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      if (activeBottomTab === 'dates') {
        return (
          <div className={styles.tabContent}>
            <ContactDatesTable 
              contactId={id}
              concerts={datesData}
              onAddClick={() => {
                if (data?.structureRaisonSociale) {
                  openDateCreationTab(data.structureRaisonSociale);
                }
              }}
            />
          </div>
        );
      }
      
      if (activeBottomTab === 'contrats') {
        return (
          <div className={styles.tabContent}>
            <ContratsTableNew 
              contrats={[]} // TODO: Charger les contrats filtrés par structure
              onUpdateContrat={(contrat) => {
                console.log('Mise à jour contrat:', contrat);
                // TODO: Implémenter mise à jour
              }}
            />
          </div>
        );
      }
      
      if (activeBottomTab === 'factures') {
        return (
          <div className={styles.tabContent}>
            <ContactFacturesTable contactId={id} />
          </div>
        );
      }
      
      // Fallback
      return null;
    }
  }), [
    // SEULEMENT les dépendances critiques pour éviter les boucles
    isStructure,
    id,
    entityType,
    forcedViewType
    // Suppression de extractedData, localTags, etc. qui changent constamment
  ]);

  return (
    <>
      <EntityViewTabs
        entity={extractedData}
        loading={loading}
        error={error}
        entityType="contact"
        config={config}
        activeBottomTab={activeBottomTab}
        setActiveBottomTab={handleTabChange}
      />
      
      {/* Modal de sélection des tags */}
      <TagsSelectionModal
        show={showTagsModal}
        onHide={() => setShowTagsModal(false)}
        selectedTags={localTags}
        onTagsChange={handleTagsChange}
        title="Sélectionner des tags"
      />
      
      {/* Modal d'association de personne */}
      <AssociatePersonModal
        isOpen={showAssociatePersonModal}
        onClose={() => setShowAssociatePersonModal(false)}
        onAssociate={handleAssociatePersons}
        structureId={id}
        allowMultiple={true}
        existingPersonIds={localPersonnes.map(p => p.id)}
      />
      
      {/* Modal d'édition de personne */}
      <PersonneCreationModal
        show={showEditPersonModal}
        onHide={() => {
          setShowEditPersonModal(false);
          setEditingPerson(null);
        }}
        onCreated={handleUpdatePerson}
        editMode={true}
        initialData={editingPerson}
      />
      
      {/* Modal de liste des commentaires d'une personne */}
      <CommentListModal
        show={showCommentListModal}
        onHide={() => {
          setShowCommentListModal(false);
          setSelectedPersonForComments(null);
        }}
        personneId={selectedPersonForComments?.id}
        personneNom={selectedPersonForComments?.nom}
        onAddComment={() => {
          openCreateCommentModal(selectedPersonForComments?.id, selectedPersonForComments?.nom);
        }}
      />
    </>
  );
}

export default ContactViewTabs;