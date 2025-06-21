import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUnifiedContact } from '@/hooks/contacts/useUnifiedContact';
import { useContactActions } from '@/hooks/contacts/useContactActions';
import { useTabs } from '@/context/TabsContext';
import { useContactModals } from '@/context/ContactModalsContext';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import EntityViewTabs from '@/components/common/EntityViewTabs';
import TagsSelectionModal from '@/components/ui/TagsSelectionModal';
import AssociatePersonModal from '@/components/ui/AssociatePersonModal';
import PersonneCreationModal from '@/components/contacts/modal/PersonneCreationModal';
import CommentListModal from '@/components/common/modals/CommentListModal';
import { getTagColor, getTagCssClass } from '@/config/tagsConfig';
import { useNavigate } from 'react-router-dom';

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
  const [forcedViewType] = useState(viewType);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showAssociatePersonModal, setShowAssociatePersonModal] = useState(false);
  const [showEditPersonModal, setShowEditPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showCommentListModal, setShowCommentListModal] = useState(false);
  const [selectedPersonForComments, setSelectedPersonForComments] = useState(null);
  const [datesData, setDatesData] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);
  
  // Hooks
  const { openDateCreationTab } = useTabs();
  const { openCommentModal, openPersonneModal } = useContactModals();
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  
  // Hook unifié pour les données
  const { contact, loading, error, entityType } = useUnifiedContact(id);
  
  // Hook personnalisé pour toute la logique métier
  const {
    localTags,
    setLocalTags,
    localPersonnes,
    setLocalPersonnes,
    localCommentaires,
    setLocalCommentaires,
    lastLocalUpdate,
    handleTagsChange,
    handleRemoveTag,
    handleAssociatePersons,
    handleUpdatePerson,
    handleDissociatePerson,
    handleOpenPersonFiche,
    handleAddComment,
    handleDeleteComment
  } = useContactActions(id);

  // Synchronisation initiale uniquement
  useEffect(() => {
    if (!contact) return;
    
    // Synchroniser seulement si les états locaux sont vides (première charge)
    if (localTags.length === 0) {
      const newTags = contact?.qualification?.tags || [];
      setLocalTags(newTags);
    }
    
    if (localPersonnes.length === 0) {
      const newPersonnes = contact?.personnes || [];
      setLocalPersonnes(newPersonnes);
    }
  }, [contact?.id]); // Dépendance sur l'ID uniquement

  // Gestion des personnes
  const handleEditPerson = useCallback((personne) => {
    setEditingPerson(personne);
    setShowEditPersonModal(true);
  }, []);

  const handleAddCommentToPersonWithModal = useCallback(async (personne) => {
    const personneNom = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne';
    
    try {
      // Chercher ou créer la fiche personne
      let prenom = personne.prenom;
      let nom = personne.nom;
      
      if (!prenom && nom && nom.includes(' ')) {
        const parts = nom.split(' ');
        prenom = parts[0];
        nom = parts.slice(1).join(' ');
      }
      
      const prenomSafe = prenom || '';
      const nomSafe = nom || '';
      
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
        const personneDoc = personneLibreSnapshot.docs[0];
        personneLibreId = personneDoc.id;
        const personneData = personneDoc.data();
        existingComments = personneData.commentaires || [];
      } else {
        // Créer la personne libre
        const personneLibreData = {
          entityType: 'personne_libre',
          organizationId: currentOrganization.id,
          personne: {
            prenom: prenomSafe,
            nom: nomSafe,
            fonction: personne.fonction || '',
            email: personne.email || '',
            telephone: personne.telephone || '',
            mobile: personne.mobile || ''
          },
          commentaires: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'contacts_unified'), personneLibreData);
        personneLibreId = docRef.id;
      }
      
      if (existingComments.length > 0) {
        setSelectedPersonForComments({
          id: personneLibreId,
          nom: personneNom,
          prenom: prenomSafe,
          nomFamille: nomSafe
        });
        setShowCommentListModal(true);
      } else {
        openCreateCommentModal(personneLibreId, personneNom);
      }
      
    } catch (error) {
      console.error('Erreur lors de la gestion du commentaire personne:', error);
      alert('Erreur lors de l\'ouverture du commentaire pour cette personne');
    }
  }, [id, currentOrganization, openCommentModal, currentUser]);

  // Fonction pour ouvrir la modal de création de commentaire
  const openCreateCommentModal = (personneLibreId, personneNom) => {
    openCommentModal({
      title: `Nouveau commentaire - ${personneNom}`,
      onSave: async (content) => {
        try {
          const personneDocRef = doc(db, 'contacts_unified', personneLibreId);
          const personneDocSnap = await getDoc(personneDocRef);
          
          if (!personneDocSnap.exists()) throw new Error('Fiche personne non trouvée');
          
          const personneData = personneDocSnap.data();
          const existingComments = personneData.commentaires || [];
          
          const newComment = {
            id: Date.now().toString(),
            contenu: content || '',
            auteur: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
            date: new Date(),
            modifie: false
          };
          
          await updateDoc(personneDocRef, {
            commentaires: [...existingComments, newComment],
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du commentaire personne:', error);
          alert(`Erreur: ${error.message}`);
        }
      }
    });
  };

  const navigateToEntity = useCallback((entityType, entityId, entityName) => {
    if (!entityId) return;
    
    const routes = {
      structure: `/structures/${entityId}`,
      contact: `/contacts/${entityId}`,
      lieu: `/lieux/${entityId}`,
      concert: `/concerts/${entityId}`,
      artiste: `/artistes/${entityId}`
    };
    
    if (routes[entityType]) {
      navigate(routes[entityType]);
    }
  }, [navigate]);

  // Extraction des données selon le type d'entité
  const extractedData = useMemo(() => {
    if (!contact) return null;
    
    if (entityType === 'structure') {
      const structureData = contact.structure || {};
      
      return {
        id: contact.id,
        entityType: 'structure',
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
        structureAdresse: structureData.adresse,
        structureSuiteAdresse1: structureData.suiteAdresse,
        structureCodePostal: structureData.codePostal,
        structureVille: structureData.ville,
        structureDepartement: structureData.departement,
        structureRegion: structureData.region,
        structurePays: structureData.pays,
        tags: localTags,
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
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
        nomFestival: structureData.nomFestival,
        periodeFestivalMois: structureData.periodeFestivalMois,
        periodeFestivalComplete: structureData.periodeFestivalComplete
      };
    } else if (entityType === 'personne_libre') {
      const personneData = contact.personne || {};
      
      return {
        id: contact.id,
        entityType: 'contact',
        prenom: personneData.prenom,
        nom: personneData.nom,
        fonction: personneData.fonction,
        civilite: personneData.civilite,
        email: personneData.email,
        mailDirect: personneData.email,
        mailPerso: personneData.mailPerso,
        telephone: personneData.telephone,
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
        tags: localTags,
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      };
    }
    
    return contact;
  }, [contact, entityType, localTags, localPersonnes]);

  const structureName = useMemo(() => extractedData?.structureRaisonSociale, [extractedData?.structureRaisonSociale]);
  
  // Chargement des dates pour les structures
  useEffect(() => {
    const loadStructureDates = async () => {
      const organizationId = currentOrganization?.id;
      
      if (!organizationId || !structureName) {
        if (datesData.length > 0) {
          setDatesData([]);
        }
        return;
      }

      if (datesLoading) return;

      try {
        setDatesLoading(true);
        
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
        
        setDatesData(structureConcerts);
      } catch (error) {
        console.error('Erreur chargement dates structure:', error);
        setDatesData([]);
      } finally {
        setDatesLoading(false);
      }
    };

    const timeoutId = setTimeout(loadStructureDates, 100);
    return () => clearTimeout(timeoutId);
  }, [currentOrganization?.id, structureName]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Utiliser directement les commentaires locaux après modification, sinon Firebase
  const commentaires = useMemo(() => {
    // Si on a des modifications locales récentes, les utiliser
    if (localCommentaires.length > 0 || lastLocalUpdate) {
      return localCommentaires;
    }
    // Sinon utiliser les données Firebase
    return extractedData?.commentaires || [];
  }, [localCommentaires, lastLocalUpdate, extractedData?.commentaires]);
  
  // Synchronisation initiale des commentaires
  useEffect(() => {
    if (!extractedData?.commentaires || localCommentaires.length > 0) return;
    setLocalCommentaires(extractedData.commentaires);
  }, [extractedData?.id]); // Dépendance sur l'ID uniquement

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
  const bottomTabsConfig = useMemo(() => [
    { id: 'historique', label: 'Historique', icon: 'bi-clock-history', color: '#28a745' },
    { id: 'diffusion', label: 'Diffusion', icon: 'bi-broadcast', color: '#6f42c1' },
    { id: 'salle', label: 'Salle', icon: 'bi-building', color: '#fd7e14' },
    { id: 'dates', label: 'Dates', icon: 'bi-calendar-event', color: '#dc3545' },
    { id: 'contrats', label: 'Contrats', icon: 'bi-file-earmark-text', color: '#007bff' },
    { id: 'factures', label: 'Factures', icon: 'bi-receipt', color: '#ffc107' }
  ], []);
  
  // Configuration principale - Dépendances minimales
  const config = useMemo(() => ({
    defaultBottomTab: 'historique',
    notFoundIcon: isStructure ? 'bi-building-x' : 'bi-person-x',
    notFoundTitle: isStructure ? 'Structure non trouvée' : 'Contact non trouvé',
    notFoundMessage: isStructure 
      ? 'La structure demandée n\'existe pas ou n\'est plus disponible.'
      : 'Le contact demandé n\'existe pas ou n\'est plus disponible.',

    header: {
      render: (contact) => {
        const data = extractedData || contact;
        if (!data) return null;
        
        const hasStructureData = data.structureRaisonSociale?.trim();
        const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
        
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
        render: () => (
          <ContactTagsSection 
            tags={extractedData?.tags || []}
            onRemoveTag={handleRemoveTag}
          />
        )
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
                onClick: () => openPersonneModal()
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
        render: () => (
          <ContactPersonsSection 
            isStructure={forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || extractedData?.structureRaisonSociale)}
            personnes={localPersonnes}
            structureData={extractedData}
            onEditPerson={handleEditPerson}
            onDissociatePerson={handleDissociatePerson}
            onOpenPersonFiche={handleOpenPersonFiche}
            onAddCommentToPerson={handleAddCommentToPersonWithModal}
            navigateToEntity={navigateToEntity}
          />
        )
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
        render: () => (
          <ContactCommentsSection 
            commentaires={commentaires}
            onDeleteComment={handleDeleteComment}
          />
        )
      },
    ],

    renderBottomTabContent: () => (
      <ContactBottomTabs 
        activeTab={activeBottomTab}
        contactId={id}
        extractedData={extractedData}
        datesData={datesData}
        openDateCreationTab={openDateCreationTab}
      />
    )
  }), [
    // Dépendances vraiment nécessaires uniquement
    isStructure,
    entityType,
    forcedViewType,
    activeBottomTab,
    extractedData?.tags,
    extractedData?.structureRaisonSociale,
    extractedData?.prenom,
    extractedData?.nom,
    extractedData?.fonction,
    extractedData?.createdAt
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
      
      <TagsSelectionModal
        show={showTagsModal}
        onHide={() => setShowTagsModal(false)}
        selectedTags={localTags}
        onTagsChange={handleTagsChange}
        title="Sélectionner des tags"
      />
      
      <AssociatePersonModal
        isOpen={showAssociatePersonModal}
        onClose={() => setShowAssociatePersonModal(false)}
        onAssociate={handleAssociatePersons}
        structureId={id}
        allowMultiple={true}
        existingPersonIds={localPersonnes.map(p => p.id)}
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
    </>
  );
}

export default ContactViewTabs;