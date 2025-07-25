import React, { useState, useMemo, useCallback } from 'react';
import { useContactsRelational } from '@/hooks/contacts/useContactsRelational';
import { useContactActionsRelational } from '@/hooks/contacts/useContactActionsRelational';
import { useTabs } from '@/context/TabsContext';
import { useContactModals } from '@/context/ContactModalsContext';
import { personnesService } from '@/services/contacts/personnesService';
import { datesService } from '@/services/dateService';
import { getPreContratsByDate } from '@/services/preContratService';
import contratService from '@/services/contratService';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import EntityViewTabs from '@/components/common/EntityViewTabs';
import TagsSelectionModal from '@/components/ui/TagsSelectionModal';
import AssociatePersonModal from '@/components/ui/AssociatePersonModal';
import PersonneCreationModal from '@/components/contacts/modal/PersonneCreationModal';
import StructureCreationModal from '@/components/contacts/modal/StructureCreationModal';
import CommentListModal from '@/components/common/modals/CommentListModal';
import { getTagColor, getTagCssClass } from '@/config/tagsConfig';
import { formatActivityTags, getPersonDisplayType } from '@/utils/contactUtils';
import { useNavigate } from 'react-router-dom';
// import debug from '@/utils/debugTagsComments'; // Fichier supprimé

// Import des nouvelles sections
import ContactInfoSection from './sections/ContactInfoSection';
import ContactTagsSection from './sections/ContactTagsSection';
import ContactPersonsSection from './sections/ContactPersonsSection';
import ContactCommentsSection from './sections/ContactCommentsSection';
import ContactBottomTabs from './sections/ContactBottomTabs';

import styles from './ContactViewTabs.module.css';

/**
 * Composant refactorisé pour l'affichage des détails d'un contact
 * Utilise des sous-composants modulaires pour une meilleure maintenabilité
 */
function ContactViewTabs({ id, viewType = null }) {
  // Log de debug pour tracker les re-renders
  const renderCount = React.useRef(0);
  renderCount.current++;
  console.log(`🔄 [ContactViewTabs] RENDER #${renderCount.current} - id:`, id, 'viewType:', viewType, 'timestamp:', new Date().toISOString());
  console.log('✅ [ContactViewTabs] useMemo corrigé - Plus de setState dans useMemo!');
  // Nettoyer l'ID en enlevant les suffixes ajoutés par la liste (_structure, _personne_libre, etc.)
  // Amélioration: gérer aussi les cas comme _in_structureId
  let cleanId = id;
  if (id) {
    // D'abord, gérer le cas spécial _in_structureId pour les personnes dans une structure
    const inMatch = id.match(/^(.+?)_in_/);
    if (inMatch) {
      cleanId = inMatch[1];
    } else {
      // Sinon, nettoyer les suffixes habituels
      cleanId = id.replace(/_structure$|_personne_libre$|_personne_\d+$/, '');
    }
  }
  
  console.log('[ContactViewTabs] ID reçu:', id, '→ ID nettoyé:', cleanId, 'viewType:', viewType);
  const [forcedViewType] = useState(viewType);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showAssociatePersonModal, setShowAssociatePersonModal] = useState(false);
  const [showEditPersonModal, setShowEditPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showEditStructureModal, setShowEditStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [showCommentListModal, setShowCommentListModal] = useState(false);
  const [selectedPersonForComments, setSelectedPersonForComments] = useState(null);
  const [datesData, setDatesData] = useState([]);
  
  // Hooks
  const { openDateCreationTab, openContactTab, openStructureTab } = useTabs();
  const { openCommentModal, openPersonneModal } = useContactModals();
  const { currentUser } = useAuth();
  const { currentEntreprise } = useEntreprise();
  const navigate = useNavigate();
  
  // Hook relationnel direct
  const { getStructureWithPersonnes, getPersonneWithStructures, structures, personnes, invalidateContactCache } = useContactsRelational();
  
  // Vérifier si les données sont déjà disponibles pour éviter le flash blanc
  const hasDataInCache = React.useMemo(() => {
    if (!cleanId) return false;
    // Vérifier si on a déjà les données en cache
    const structureData = getStructureWithPersonnes(cleanId);
    const personneData = getPersonneWithStructures(cleanId);
    return !!(structureData || personneData);
  }, [cleanId, getStructureWithPersonnes, getPersonneWithStructures]);
  
  // États locaux - loading initialisé selon la présence de données en cache
  const [entityType, setEntityType] = useState(forcedViewType);
  const [loading, setLoading] = useState(!hasDataInCache); // false si déjà en cache
  const [error, setError] = useState(null);
  
  // Récupération directe des données - SANS setState !
  const contact = useMemo(() => {
    if (!cleanId || !currentEntreprise?.id) {
      return null;
    }
    
    // Détection du type et récupération des données
    let data = null;
    
    // Si le type est fourni ou déjà déterminé
    if (entityType === 'structure') {
      data = getStructureWithPersonnes(cleanId);
      if (data) {
        return data;
      }
    } else if (entityType === 'personne' || entityType === 'personne_libre') {
      data = getPersonneWithStructures(cleanId);
      if (data) {
        return data;
      }
    } else {
      // Type non déterminé, essayer les deux
      console.log('🔍 [ContactViewTabs] Appel getStructureWithPersonnes pour:', cleanId);
      data = getStructureWithPersonnes(cleanId);
      if (data) {
        console.log('✅ [ContactViewTabs] Structure trouvée:', data.id);
        return data;
      }
      
      data = getPersonneWithStructures(cleanId);
      if (data) {
        return data;
      }
    }
    
    return null;
  }, [cleanId, currentEntreprise?.id, entityType, getStructureWithPersonnes, getPersonneWithStructures]);
  
  // Effet pour gérer le type d'entité automatiquement
  React.useEffect(() => {
    if (!entityType && contact) {
      // Déterminer le type basé sur les données
      if (contact.raisonSociale !== undefined) {
        setEntityType('structure');
      } else if (!contact.structures || contact.structures.length === 0) {
        setEntityType('personne_libre');
      } else {
        setEntityType('personne');
      }
    }
  }, [contact, entityType]);
  
  // Effet pour gérer loading et error
  React.useEffect(() => {
    if (!cleanId || !currentEntreprise?.id) {
      setLoading(false);
      setError(!cleanId ? 'ID manquant' : 'Organisation manquante');
      return;
    }
    
    // Si on a un contact, pas de loading
    if (contact) {
      setLoading(false);
      setError(null);
    } else if (structures.length > 0 || personnes.length > 0) {
      // Les données sont chargées mais contact non trouvé
      setLoading(false);
      setError('Contact non trouvé');
    }
    // Sinon, on est toujours en loading
  }, [cleanId, currentEntreprise?.id, contact, structures.length, personnes.length]);
  
  // Effet pour écouter les événements de rafraîchissement de structure
  React.useEffect(() => {
    const handleRefreshStructure = (event) => {
      const { structureId } = event.detail;
      console.log('📨 [ContactViewTabs] Événement refresh-structure reçu pour:', structureId);
      
      // Si c'est notre structure, invalider le cache pour forcer le rechargement
      if (structureId === cleanId && entityType === 'structure') {
        console.log('🔄 [ContactViewTabs] Rafraîchissement de la structure:', cleanId);
        invalidateContactCache();
      }
    };
    
    window.addEventListener('refresh-structure', handleRefreshStructure);
    
    return () => {
      window.removeEventListener('refresh-structure', handleRefreshStructure);
    };
  }, [cleanId, entityType, invalidateContactCache]);
  
  
  // Déterminer le type de contact
  const contactType = entityType === 'structure' ? 'structure' : 'personne';
  
  // DEBUG: Analyser la structure des données quand elles changent
  React.useEffect(() => {
    if (contact && !loading) {
      console.log('🔍 [ContactViewTabs] Données chargées pour:', cleanId);
      console.log('[ContactViewTabs] Type détecté:', entityType);
      console.log('[ContactViewTabs] Contact:', contact);
    }
  }, [contact?.id, loading, entityType, cleanId]); // FIX: Ajout de cleanId manquant
  
  // Hook pour les actions avec le modèle relationnel
  const {
    handleTagsChange: handleTagsChangeBase,
    handleRemoveTag: handleRemoveTagBase,
    handleAssociatePersons,
    handleUpdatePerson,
    handleDissociatePerson,
    handleOpenPersonFiche,
    handleAddComment,
    handleDeleteComment,
    handleEditComment,
    handleSetPrioritaire,
    handleToggleActif
  } = useContactActionsRelational(cleanId, contactType);
  
  // Les données se mettent à jour automatiquement via les listeners Firebase
  // Plus besoin de forcer le rechargement
  const handleTagsChange = handleTagsChangeBase;
  const handleRemoveTag = handleRemoveTagBase;

  // Fonction pour ouvrir la modal de création de commentaire
  const openCreateCommentModal = useCallback((personneId, personneNom) => {
    openCommentModal({
      title: `Nouveau commentaire - ${personneNom}`,
      onSave: async (content) => {
        try {
          const personneData = await personnesService.getPersonne(personneId, currentEntreprise.id);
          
          if (!personneData) throw new Error('Fiche personne non trouvée');
          
          const existingComments = personneData.commentaires || [];
          
          const newComment = {
            id: Date.now().toString(),
            contenu: content,
            date: new Date(),
            auteur: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
            modifie: false,
            type: 'general'
          };
          
          const updatedComments = [...existingComments, newComment];
          
          await personnesService.updatePersonne(personneId, {
            commentaires: updatedComments
          }, currentUser?.uid);
          
          console.log('Commentaire ajouté avec succès à la personne');
          // Les listeners Firebase mettront à jour automatiquement
        } catch (error) {
          console.error('Erreur lors de l\'ajout du commentaire:', error);
          throw error;
        }
      }
    });
  }, [openCommentModal, currentEntreprise?.id, currentUser?.uid, currentUser?.displayName, currentUser?.email]);

  // Gestion des personnes
  const handleEditPerson = useCallback((personne) => {
    setEditingPerson(personne);
    setShowEditPersonModal(true);
  }, []);

  const handleAddCommentToPersonWithModal = useCallback(async (personne) => {
    const personneNom = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne';
    
    try {
      // Dans le modèle relationnel, utiliser directement l'ID de la personne
      if (personne.id) {
        // Récupérer la personne via le service relationnel
        const personneData = await personnesService.getPersonne(personne.id, currentEntreprise.id);
        
        if (personneData) {
          const existingComments = personneData.commentaires || [];
          
          if (existingComments.length > 0) {
            setSelectedPersonForComments({
              id: personne.id,
              nom: personneNom,
              prenom: personne.prenom || '',
              nomFamille: personne.nom || ''
            });
            setShowCommentListModal(true);
          } else {
            openCreateCommentModal(personne.id, personneNom);
          }
        } else {
          throw new Error('Personne non trouvée dans le modèle relationnel');
        }
      } else {
        throw new Error('ID de personne manquant');
      }
      
    } catch (error) {
      console.error('Erreur lors de la gestion du commentaire personne:', error);
      alert('Erreur lors de l\'ouverture du commentaire pour cette personne');
    }
  }, [currentEntreprise?.id, openCreateCommentModal]);

  const navigateToEntity = useCallback((entityType, entityId, entityName) => {
    if (!entityId) return;
    
    const routes = {
      structure: `/structures/${entityId}`,
      contact: `/contacts/${entityId}`,
      lieu: `/lieux/${entityId}`,
      date: `/dates/${entityId}`,
      artiste: `/artistes/${entityId}`
    };
    
    if (routes[entityType]) {
      navigate(routes[entityType]);
    }
  }, [navigate]);

  // Wrapper pour handleAssociatePersons qui recharge les données après association
  const handleAssociatePersonsWithReload = useCallback(async (selectedPersons) => {
    try {
      const result = await handleAssociatePersons(selectedPersons);
      if (result) {
        // Recharger les données pour afficher les personnes nouvellement associées
        // Les listeners Firebase mettront à jour automatiquement
        console.log('✅ [ContactViewTabs] Personnes associées avec succès');
      }
      return result;
    } catch (error) {
      console.error('❌ [ContactViewTabs] Erreur lors de l\'association:', error);
      throw error;
    }
  }, [handleAssociatePersons]);

  // Gestionnaires pour les actions sur la structure
  const handleEditStructure = useCallback((structureData) => {
    console.log('[ContactViewTabs] Édition de la structure:', structureData);
    setEditingStructure(structureData);
    setShowEditStructureModal(true);
  }, []);

  const handleOpenStructureFiche = useCallback((structureData) => {
    console.log('[ContactViewTabs] Ouverture de la fiche structure:', structureData);
    let structureId = null;
    let structureName = '';
    
    if (structureData?.structureId) {
      structureId = structureData.structureId;
      structureName = structureData.structureRaisonSociale || structureData.structureNom || 'Structure';
    } else if (structureData.id) {
      structureId = structureData.id?.replace('unified_structure_', '');
      structureName = structureData.raisonSociale || structureData.nom || 'Structure';
    }
    
    if (structureId) {
      // Utiliser openStructureTab au lieu de navigateToEntity pour rester dans le contexte des tabs
      openStructureTab(structureId, structureName);
    }
  }, [openStructureTab]);

  const handleAddCommentToStructure = useCallback((structureData) => {
    console.log('[ContactViewTabs] Ajout commentaire à la structure:', structureData);
    // Logique pour ajouter un commentaire à la structure
    // À implémenter selon vos besoins
  }, []);

  // Adaptation des données pour maintenir la compatibilité
  const extractedData = useMemo(() => {
    if (!contact) return null;
    
    // Si on veut afficher une personne spécifique dans une structure
    if (forcedViewType === 'personne' && entityType === 'structure' && contact.personnes) {
      // Trouver la personne dans le tableau des personnes
      // Par défaut, prendre la première personne
      const personneIndex = 0; // TODO: on pourrait passer l'index via viewType
      const personneData = contact.personnes[personneIndex];
      
      if (personneData) {
        return {
          id: contact.id,
          entityType: 'contact',
          prenom: personneData.prenom,
          nom: personneData.nom,
          fonction: personneData.fonction,
          civilite: personneData.civilite,
          email: personneData.mailDirect || personneData.email,
          mailDirect: personneData.mailDirect || personneData.email,
          mailPerso: personneData.mailPerso,
          telephone: personneData.telDirect || personneData.telephone,
          telDirect: personneData.telDirect,
          telPerso: personneData.telPerso,
          mobile: personneData.mobile,
          fax: personneData.fax,
          adresse: personneData.adresse,
          suiteAdresse: personneData.suiteAdresse,
          codePostal: personneData.codePostal,
          ville: personneData.ville,
          departement: personneData.departement,
          region: personneData.region,
          pays: personneData.pays,
          tags: contact?.tags || [],
          commentaires: contact.commentaires || [],
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
          // Ajouter les infos de la structure associée
          structureId: contact.id,
          structureRaisonSociale: contact.raisonSociale,
          structureNom: contact.nom,
          structureTags: contact.tags || [],
          structureData: {
            structureRaisonSociale: contact.raisonSociale,
            tags: contact.tags || [],
            id: contact.id
          }
        };
      }
    }
    
    if (entityType === 'structure' && forcedViewType !== 'personne') {
      // Données directes de la structure
      
      return {
        id: contact.id,
        entityType: 'structure',
        structureRaisonSociale: contact.raisonSociale,
        structureNom: contact.nom,
        structureEmail: contact.email,
        structureTelephone1: contact.telephone1,
        structureTelephone2: contact.telephone2,
        structureMobile: contact.mobile,
        structureFax: contact.fax,
        structureSiteWeb: contact.siteWeb,
        structureSiret: contact.siret,
        structureType: contact.type,
        structureAdresse: contact.adresse || '',
        structureSuiteAdresse1: contact.suiteAdresse || '',
        structureCodePostal: contact.codePostal || '',
        structureVille: contact.ville || '',
        structureDepartement: contact.departement || '',
        structureRegion: contact.region || '',
        structurePays: contact.pays || '',
        tags: contact.tags || [],
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        salleNom: contact.salle?.nom,
        salleAdresse: contact.salle?.adresse,
        salleCodePostal: contact.salle?.codePostal,
        salleVille: contact.salle?.ville,
        salleDepartement: contact.salle?.departement,
        salleRegion: contact.salle?.region,
        sallePays: contact.salle?.pays,
        salleTelephone: contact.salle?.telephone,
        salleJauge1: contact.salle?.jauge1,
        salleJauge2: contact.salle?.jauge2,
        salleJauge3: contact.salle?.jauge3,
        nomFestival: contact.nomFestival,
        periodeFestivalMois: contact.periodeFestivalMois,
        periodeFestivalComplete: contact.periodeFestivalComplete
      };
    } else if (entityType === 'personne') {
      // Cas d'une personne liée à des structures
      
      return {
        id: contact.id,
        entityType: 'personne',
        prenom: contact.prenom,
        nom: contact.nom,
        fonction: contact.fonction,
        civilite: contact.civilite,
        email: contact.email,
        mailDirect: contact.email,
        mailPerso: contact.mailPerso,
        telephone: contact.telephone,
        telDirect: contact.telDirect,
        telPerso: contact.telPerso,
        mobile: contact.telephone2,
        fax: contact.fax,
        adresse: contact.adresse,
        suiteAdresse: contact.suiteAdresse,
        codePostal: contact.codePostal,
        ville: contact.ville,
        departement: contact.departement,
        region: contact.region,
        pays: contact.pays,
        tags: contact.tags || [],
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        // Ajouter les structures associées
        structures: contact.structures || []
      };
    } else if (entityType === 'personne_libre') {
      
      return {
        id: contact.id,
        entityType: 'contact',
        prenom: contact.prenom,
        nom: contact.nom,
        fonction: contact.fonction,
        civilite: contact.civilite,
        email: contact.email,
        mailDirect: contact.email,
        mailPerso: contact.mailPerso,
        telephone: contact.telephone,
        telDirect: contact.telDirect,
        telPerso: contact.telPerso,
        mobile: contact.telephone2,
        fax: contact.fax,
        adresse: contact.adresse,
        suiteAdresse: contact.suiteAdresse,
        codePostal: contact.codePostal,
        ville: contact.ville,
        departement: contact.departement,
        region: contact.region,
        pays: contact.pays,
        tags: contact.tags || [],
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      };
    }
    
    return contact;
  }, [contact, entityType, forcedViewType]);

  const structureName = useMemo(() => {
    if (entityType === 'structure' && contact) {
      return contact.raisonSociale;
    }
    return extractedData?.structureRaisonSociale;
  }, [entityType, contact?.raisonSociale, extractedData?.structureRaisonSociale]);
  
  // Charger les dates pour les structures
  const loadStructureDates = useCallback(async () => {
    console.log('🔍 [ContactViewTabs] DÉBUT loadStructureDates');
    console.log('  - currentEntreprise?.id:', currentEntreprise?.id);
    console.log('  - cleanId:', cleanId);
    console.log('  - entityType:', entityType);
    console.log('  - structureName:', structureName);
    
    if (!currentEntreprise?.id) {
      console.log('❌ [ContactViewTabs] Pas d\'organisation, arrêt du chargement');
      setDatesData([]);
      return;
    }

    try {
      let dates = [];
      
      // Essayer d'abord avec l'ID de la structure si disponible
      if (cleanId && entityType === 'structure') {
        console.log('🔎 [ContactViewTabs] Tentative 1: Chargement par structureId:', cleanId);
        dates = await datesService.getDatesByStructureId(currentEntreprise.id, cleanId);
        console.log(`  → Résultat: ${dates.length} dates trouvées`);
      }
      
      // Si pas de résultats ou pas d'ID, essayer avec le nom
      if (dates.length === 0 && structureName) {
        console.log('🔎 [ContactViewTabs] Tentative 2: Chargement par structureName:', structureName);
        dates = await datesService.getDatesByStructure(currentEntreprise.id, structureName);
        console.log(`  → Résultat: ${dates.length} dates trouvées`);
      }
      
      console.log(`📊 [ContactViewTabs] TOTAL: ${dates.length} dates trouvées avant enrichissement`);
      
      // Enrichir les dates avec les données de pré-contrat et contrat
      const datesWithPreContrat = await Promise.all(
        (dates || []).map(async (date) => {
          let enrichedDate = { ...date };
          
          try {
            // 1. Charger les données de pré-contrat
            const preContrats = await getPreContratsByDate(date.id);
            if (preContrats && preContrats.length > 0) {
              // Prendre le pré-contrat confirmé en priorité, sinon le plus récent
              const latestPreContrat = preContrats.sort((a, b) => {
                // Priorité 1: Si l'un est confirmé et pas l'autre
                if (a.confirmationValidee && !b.confirmationValidee) return -1;
                if (!a.confirmationValidee && b.confirmationValidee) return 1;
                
                // Priorité 2: Par date de confirmation si les deux sont confirmés
                if (a.confirmationValidee && b.confirmationValidee) {
                  const dateA = a.confirmationDate?.toDate() || a.createdAt?.toDate() || new Date(0);
                  const dateB = b.confirmationDate?.toDate() || b.createdAt?.toDate() || new Date(0);
                  return dateB - dateA;
                }
                
                // Priorité 3: Par date de création pour les non-confirmés
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
              })[0];
              
              // Ajouter les infos de pré-contrat
              enrichedDate = {
                ...enrichedDate,
                preContratId: latestPreContrat.id,
                publicFormData: latestPreContrat.publicFormData,
                publicFormCompleted: latestPreContrat.publicFormCompleted,
                confirmationValidee: latestPreContrat.confirmationValidee
              };
            }
            
            // 2. Charger les données de contrat et facture
            const contrat = await contratService.getContratByDate(date.id);
            if (contrat) {
              enrichedDate.contratId = contrat.id;
              enrichedDate.contratStatus = contrat.status;
              enrichedDate.contratStatut = contrat.contratStatut;
              
              // Si le contrat a une facture
              if (contrat.factureId) {
                console.log('[ContactViewTabs] Facture trouvée dans contrat pour date', date.id, ':', {
                  contratId: contrat.id,
                  factureId: contrat.factureId,
                  factureStatus: contrat.factureStatus
                });
                enrichedDate.factureId = contrat.factureId;
                enrichedDate.factureStatus = contrat.factureStatus || 'generated';
                enrichedDate.hasFacture = true;
              }
            }
          } catch (error) {
            console.error('Erreur chargement données enrichies pour date', date.id, error);
          }
          
          return enrichedDate;
        })
      );
      
      console.log(`[ContactViewTabs] Définition finale de ${datesWithPreContrat.length} dates dans l'état`);
      setDatesData(datesWithPreContrat);
    } catch (error) {
      console.error('Erreur chargement dates structure:', error);
      setDatesData([]);
    }
  }, [currentEntreprise?.id, structureName, cleanId, entityType]);

  // Charger les dates au changement de structure avec debouncing
  React.useEffect(() => {
    // Éviter rechargements si pas de structure
    if (entityType !== 'structure' || !structureName) {
      console.log('📅 [ContactViewTabs] Pas de structure, skip chargement dates');
      return;
    }
    
    // Debouncing pour éviter les appels multiples
    const timeoutId = setTimeout(() => {
      console.log('📅 [ContactViewTabs] Déclenchement chargement dates après debounce');
      loadStructureDates();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [entityType, structureName, loadStructureDates]);
  
  // Utiliser directement les commentaires du contact avec normalisation du format
  const commentaires = useMemo(() => {
    const rawCommentaires = extractedData?.commentaires || [];
    
    console.log('[DEBUG ContactViewTabs] Commentaires bruts:', rawCommentaires);
    console.log('[DEBUG ContactViewTabs] extractedData complet:', extractedData);
    console.log('[DEBUG ContactViewTabs] contact complet:', contact);
    console.log('[DEBUG ContactViewTabs] entityType:', entityType);
    console.log('[DEBUG ContactViewTabs] cleanId:', cleanId);
    
    // Normaliser le format des commentaires pour gérer les anciens et nouveaux formats
    const normalized = rawCommentaires.map(comment => {
      // Si le commentaire a déjà le bon format, le retourner tel quel
      if (comment.contenu !== undefined && comment.auteur !== undefined && comment.date !== undefined) {
        return comment;
      }
      
      // Sinon, transformer depuis l'ancien format (content, createdBy, createdAt)
      return {
        id: comment.id,
        contenu: comment.contenu || comment.content || '',
        auteur: comment.auteur || comment.createdBy || 'Utilisateur inconnu',
        date: comment.date || comment.createdAt || new Date(),
        modifie: comment.modifie || false,
        type: comment.type || 'general',
        personneContext: comment.personneContext
      };
    });
    
    console.log('[DEBUG ContactViewTabs] Commentaires normalisés:', normalized);
    return normalized;
  }, [extractedData?.commentaires, contact, entityType, cleanId]);

  const isStructure = extractedData && (!extractedData.prenom || extractedData.entityType === 'structure');

  // État pour les onglets du bas
  const [activeBottomTab, setActiveBottomTab] = useState(() => {
    if (id) {
      const saved = localStorage.getItem(`bottomTab_${id}`);
      return saved || 'historique';
    }
    return 'historique';
  });

  const handleTabChange = (tabId) => {
    setActiveBottomTab(tabId);
    if (id) {
      localStorage.setItem(`bottomTab_${id}`, tabId);
    }
  };

  // Configuration des onglets du bas
  const bottomTabsConfig = useMemo(() => {
    console.log('📋 [ContactViewTabs] Recalcul bottomTabsConfig');
    const tabs = [
      { id: 'historique', label: 'Historique', icon: 'bi-clock-history', color: '#28a745' },
      { id: 'diffusion', label: 'Diffusion', icon: 'bi-broadcast', color: '#6f42c1' },
      { id: 'salle', label: 'Salle', icon: 'bi-building', color: '#fd7e14' }
    ];
    
    // Ajouter l'onglet Festival uniquement si le contact a le tag "diffuseur"
    const tags = extractedData?.tags || contact?.tags || [];
    console.log('[ContactViewTabs] Vérification tag diffuseur:', {
      tags,
      hasDiffuseur: tags.includes('diffuseur'),
      extractedDataTags: extractedData?.tags,
      contactTags: contact?.tags
    });
    if (tags.some(tag => tag.toLowerCase() === 'diffuseur')) {
      tabs.push({ id: 'festival', label: 'Festival', icon: 'bi-calendar2-week', color: '#17a2b8' });
    }
    
    // Ajouter les autres onglets
    tabs.push(
      { id: 'dates', label: 'Dates', icon: 'bi-calendar-event', color: '#dc3545' },
      { id: 'contrats', label: 'Contrats', icon: 'bi-file-earmark-text', color: '#007bff' },
      { id: 'factures', label: 'Factures', icon: 'bi-receipt', color: '#ffc107' }
    );
    
    return tabs;
  }, [extractedData?.tags, contact?.tags]);
  
  // IDs des personnes existantes - mémorisé pour éviter de recréer l'array
  const existingPersonIds = useMemo(() => {
    const personnesFromContact = contact?.personnes || [];
    return personnesFromContact.map(p => p.id);
  }, [contact?.personnes]);
  
  // Configuration STATIQUE - ne dépend que du type d'entité
  const staticConfig = useMemo(() => {
    console.log('⚙️ [ContactViewTabs] Recalcul config statique');
    return {
      defaultBottomTab: 'historique',
      notFoundIcon: isStructure ? 'bi-building-x' : 'bi-person-x',
      notFoundTitle: isStructure ? 'Structure non trouvée' : 'Contact non trouvé',
      notFoundMessage: isStructure 
        ? 'La structure demandée n\'existe pas ou n\'est plus disponible.'
        : 'Le contact demandé n\'existe pas ou n\'est plus disponible.',
      bottomTabs: bottomTabsConfig

    };
  }, [isStructure, bottomTabsConfig]); // Seulement 2 dépendances !
  
  // Props dynamiques pour EntityViewTabs - passées directement, pas dans la config
  const dynamicProps = {
    header: {
      render: (contactFromRender) => {
        const data = extractedData || contactFromRender;
        if (!data) return null;
        // Garder une référence au contact original pour l'édition
        const originalContact = contact || contactFromRender;
        
        const hasStructureData = data.structureRaisonSociale?.trim();
        const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
        
        const displayName = isStructure 
          ? (data.structureRaisonSociale || data.structure?.raisonSociale || 'Structure sans nom')
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
                {isStructure && data.tags && data.tags.length > 0 && (() => {
                  const activityDisplay = formatActivityTags(data.tags);
                  return activityDisplay ? (
                    <span className={styles.entityType}>{activityDisplay}</span>
                  ) : null;
                })()}
                {!isStructure && (
                  <span className={styles.entityFunction}>
                    {(() => {
                      // Afficher les tags d'activité, ou la fonction, ou "Indépendant"
                      const activityDisplay = getPersonDisplayType(data);
                      if (activityDisplay !== 'Indépendant') {
                        return activityDisplay; // Tags d'activité
                      } else if (data.fonction) {
                        return data.fonction; // Fonction si définie
                      } else {
                        return 'Indépendant'; // Par défaut
                      }
                    })()}
                  </span>
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
              
              <div className={styles.metaInfo}>
                {data.createdAt && (
                  <span className={styles.createdDate}>
                    <i className="bi bi-calendar-plus"></i>
                    Créé le {data.createdAt.toDate ? 
                      data.createdAt.toDate().toLocaleDateString('fr-FR') : 
                      'Date inconnue'}
                  </span>
                )}
                <button
                  className={styles.editButton}
                  onClick={() => {
                    const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || data.raisonSociale);
                    if (isStructure) {
                      // Pour les structures, passer l'objet contact original complet
                      console.log('[ContactViewTabs] Edit structure - originalContact:', originalContact);
                      handleEditStructure(originalContact);
                    } else {
                      // Pour les personnes, passer l'objet contact original complet
                      console.log('[ContactViewTabs] Edit person - originalContact:', originalContact);
                      handleEditPerson(originalContact);
                    }
                  }}
                  title="Modifier"
                  style={{
                    marginLeft: '1rem',
                    padding: '0.375rem 0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.25rem',
                    backgroundColor: 'transparent',
                    color: '#6c757d',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.color = '#495057';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6c757d';
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
            </div>
          </div>
        );
      }
    },
    
    topSections: [
      {
        className: 'topLeft',
        title: 'Informations générales',
        icon: 'bi bi-info-circle',
        render: (contact) => (
          <ContactInfoSection 
            data={extractedData || contact}
            entityType={entityType}
            isStructure={forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || extractedData?.structureRaisonSociale)}
          />
        )
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
            onClick: () => setShowTagsModal(true)
          }
        ],
        render: () => {
          const tags = extractedData?.tags || contact?.tags || [];
          // debug.tags.componentRender(tags); // Debug supprimé
          return (
            <ContactTagsSection 
              tags={tags}
              onRemoveTag={handleRemoveTag}
            />
          );
        }
      },
      {
        className: 'middleLeft',
        title: () => {
          const data = extractedData;
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          return isStructure ? 'Personnes' : 'Structure';
        },
        icon: () => {
          const data = extractedData;
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          return isStructure ? 'bi bi-people' : 'bi bi-building';
        },
        actions: () => {
          const data = extractedData;
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          
          if (isStructure) {
            return [
              {
                label: 'Ajouter',
                icon: 'bi bi-plus-circle',
                tooltip: 'Ajouter une nouvelle personne',
                onClick: () => openPersonneModal({ structureId: cleanId })
              },
              {
                label: 'Associer',
                icon: 'bi bi-link-45deg',
                tooltip: 'Associer une personne existante',
                onClick: () => setShowAssociatePersonModal(true)
              }
            ];
          } else {
            return [];
          }
        },
        render: () => {
          console.log('[DEBUG ContactPersonsSection] Données passées:', {
            isStructure: forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || extractedData?.structureRaisonSociale),
            personnes: contact?.personnes || [],
            contactData: contact,
            entityType,
            forcedViewType
          });
          
          return (
            <ContactPersonsSection 
              isStructure={forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || extractedData?.structureRaisonSociale)}
              personnes={contact?.personnes || []}
              structureData={extractedData}
              onEditPerson={handleEditPerson}
              onDissociatePerson={handleDissociatePerson}
              onOpenPersonFiche={handleOpenPersonFiche}
              onAddCommentToPerson={handleAddCommentToPersonWithModal}
              navigateToEntity={navigateToEntity}
              onEditStructure={handleEditStructure}
              onOpenStructureFiche={handleOpenStructureFiche}
              onAddCommentToStructure={handleAddCommentToStructure}
              onTogglePrioritaire={handleSetPrioritaire}
              onToggleActif={handleToggleActif}
            />
          );
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
                onSave: handleAddComment
              });
            }
          }
        ],
        render: () => {
          // debug.comments.componentRender(commentaires); // Debug supprimé
          return (
            <ContactCommentsSection 
              commentaires={commentaires}
              onDeleteComment={handleDeleteComment}
              onEditComment={(commentaire) => {
                openCommentModal({
                  title: 'Modifier le commentaire',
                  comment: commentaire,
                  onSave: async (newContent) => {
                    await handleEditComment(commentaire.id, newContent);
                  }
                });
              }}
            />
          );
        }
      },
    ]
  };


  return (
    <>
      <EntityViewTabs
        entity={extractedData}
        loading={loading}
        error={error}
        entityType="contact"
        config={staticConfig}
        activeBottomTab={activeBottomTab}
        setActiveBottomTab={handleTabChange}
        header={dynamicProps.header.render(extractedData)}
        topSections={dynamicProps.topSections}
        bottomTabContent={
          <ContactBottomTabs 
            activeTab={activeBottomTab}
            contactId={id}
            viewType={viewType}
            extractedData={extractedData}
            datesData={datesData}
            openDateCreationTab={openDateCreationTab}
            onDatesUpdate={loadStructureDates}
          />
        }
      />
      
      <TagsSelectionModal
        show={showTagsModal}
        onHide={() => setShowTagsModal(false)}
        selectedTags={extractedData?.tags || contact?.tags || []}
        onTagsChange={handleTagsChange}
        title="Sélectionner des tags"
      />
      
      <AssociatePersonModal
        isOpen={showAssociatePersonModal}
        onClose={() => setShowAssociatePersonModal(false)}
        onAssociate={handleAssociatePersonsWithReload}
        structureId={id}
        allowMultiple={true}
        existingPersonIds={existingPersonIds}
      />
      
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
      
      <StructureCreationModal
        show={showEditStructureModal}
        onHide={() => {
          setShowEditStructureModal(false);
          setEditingStructure(null);
        }}
        onCreated={() => {
          // Rafraîchir les données après la mise à jour
          invalidateContactCache(cleanId);
          setShowEditStructureModal(false);
          setEditingStructure(null);
        }}
        editMode={true}
        initialData={editingStructure}
      />
    </>
  );
}

// Optimisation avec React.memo pour éviter les re-renders inutiles
export default React.memo(ContactViewTabs);