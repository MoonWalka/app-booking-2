# Solution pour les Re-renders Multiples de ContactViewTabs

## Problème Principal Identifié

Le composant ContactViewTabs se re-render 6 fois à cause d'une cascade de changements d'état pendant le chargement initial:
1. État initial (entityType non défini)
2. Détection du type → `setEntityType('structure')`
3. Loading terminé → `setLoading(false)`
4. Données prêtes → `setDataReady(true)`
5. Chargement des dates → `setDatesData(...)`
6. Re-render supplémentaire dû aux dépendances mal optimisées

## Solution Proposée: Refactorisation avec État Unifié

### 1. Créer un hook personnalisé pour gérer l'état du contact

```javascript
// hooks/contacts/useContactViewState.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useContactsRelational } from './useContactsRelational';

export function useContactViewState(id, forcedViewType = null) {
  // État unifié pour éviter les re-renders multiples
  const [state, setState] = useState({
    entityType: forcedViewType,
    contact: null,
    loading: true,
    error: null,
    dataReady: false,
    datesData: []
  });

  const { getStructureWithPersonnes, getPersonneWithStructures, structures, personnes } = useContactsRelational();
  
  // Ref pour éviter les doubles appels
  const initialized = useRef(false);
  const cleanId = id?.replace(/_structure$|_personne_libre$|_personne_\d+$/, '') || null;

  // Détection du type et chargement des données en une seule fois
  useEffect(() => {
    if (!cleanId || initialized.current) return;
    initialized.current = true;

    const loadContact = async () => {
      try {
        let contactData = null;
        let detectedType = forcedViewType;

        // Si pas de type forcé, détecter
        if (!detectedType) {
          // Essayer structure d'abord
          contactData = getStructureWithPersonnes(cleanId);
          if (contactData) {
            detectedType = 'structure';
          } else {
            // Essayer personne
            contactData = getPersonneWithStructures(cleanId);
            if (contactData) {
              detectedType = contactData.isPersonneLibre ? 'personne_libre' : 'personne';
            }
          }
        } else {
          // Type forcé, charger directement
          if (detectedType === 'structure') {
            contactData = getStructureWithPersonnes(cleanId);
          } else {
            contactData = getPersonneWithStructures(cleanId);
          }
        }

        // Mise à jour unique de l'état
        setState(prev => ({
          ...prev,
          entityType: detectedType,
          contact: contactData,
          loading: false,
          error: contactData ? null : 'Contact non trouvé',
          dataReady: true
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
          dataReady: true
        }));
      }
    };

    // Attendre que les données soient disponibles
    if (structures.length > 0 || personnes.length > 0) {
      loadContact();
    }
  }, [cleanId, structures.length, personnes.length, forcedViewType]);

  // Fonction pour mettre à jour les dates
  const setDatesData = useCallback((dates) => {
    setState(prev => ({ ...prev, datesData: dates }));
  }, []);

  return {
    ...state,
    cleanId,
    setDatesData
  };
}
```

### 2. Refactoriser ContactViewTabs pour utiliser le nouveau hook

```javascript
// ContactViewTabs.js - Version optimisée
function ContactViewTabs({ id, viewType = null }) {
  console.log('🔄 [ContactViewTabs] RENDER - id:', id, 'viewType:', viewType);
  
  // Utiliser le hook unifié
  const {
    entityType,
    contact,
    loading,
    error,
    dataReady,
    datesData,
    cleanId,
    setDatesData
  } = useContactViewState(id, viewType);

  // États locaux pour les modals uniquement
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showAssociatePersonModal, setShowAssociatePersonModal] = useState(false);
  const [showEditPersonModal, setShowEditPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showCommentListModal, setShowCommentListModal] = useState(false);
  const [selectedPersonForComments, setSelectedPersonForComments] = useState(null);
  
  // Hooks
  const { openDateCreationTab } = useTabs();
  const { openCommentModal, openPersonneModal } = useContactModals();
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  
  // Hook pour les actions
  const {
    handleTagsChange,
    handleRemoveTag,
    handleAssociatePersons,
    handleUpdatePerson,
    handleDissociatePerson,
    handleOpenPersonFiche,
    handleAddComment,
    handleDeleteComment,
    handleSetPrioritaire,
    handleToggleActif
  } = useContactActionsRelational(cleanId, entityType === 'structure' ? 'structure' : 'personne');

  // Extraction des données - Mémorisé uniquement sur les changements de contact
  const extractedData = useMemo(() => {
    if (!contact) return null;
    
    // Logique d'extraction simplifiée
    if (entityType === 'structure') {
      return {
        id: contact.id,
        entityType: 'structure',
        structureRaisonSociale: contact.raisonSociale,
        // ... autres champs
        tags: contact.tags || [],
        commentaires: contact.commentaires || [],
      };
    } else {
      return {
        id: contact.id,
        entityType: entityType === 'personne_libre' ? 'contact' : 'personne',
        prenom: contact.prenom,
        nom: contact.nom,
        // ... autres champs
        tags: contact.tags || [],
        commentaires: contact.commentaires || [],
      };
    }
  }, [contact, entityType]);

  // Chargement des dates avec debouncing amélioré
  const loadDatesTimeoutRef = useRef(null);
  const loadStructureDates = useCallback(async () => {
    if (!currentOrganization?.id || entityType !== 'structure' || !extractedData?.structureRaisonSociale) {
      return;
    }

    try {
      // Logique de chargement des dates
      const dates = await concertsService.getConcertsByStructureId(currentOrganization.id, cleanId);
      setDatesData(dates);
    } catch (error) {
      console.error('Erreur chargement dates:', error);
      setDatesData([]);
    }
  }, [currentOrganization?.id, entityType, cleanId, extractedData?.structureRaisonSociale, setDatesData]);

  // Effect pour charger les dates avec debouncing approprié
  useEffect(() => {
    if (!dataReady || entityType !== 'structure' || !extractedData?.structureRaisonSociale) {
      return;
    }

    // Annuler le timeout précédent
    if (loadDatesTimeoutRef.current) {
      clearTimeout(loadDatesTimeoutRef.current);
    }

    // Nouveau timeout
    loadDatesTimeoutRef.current = setTimeout(() => {
      loadStructureDates();
    }, 300);

    return () => {
      if (loadDatesTimeoutRef.current) {
        clearTimeout(loadDatesTimeoutRef.current);
      }
    };
  }, [dataReady, entityType, extractedData?.structureRaisonSociale, loadStructureDates]);

  // Configuration - Mémorisée avec dépendances minimales
  const config = useMemo(() => ({
    // ... configuration existante
  }), [
    // Dépendances réellement nécessaires uniquement
    entityType,
    extractedData?.id,
    datesData.length // Au lieu de datesData complet
  ]);

  // Le reste du composant reste identique...
}
```

### 3. Optimiser TabManagerProduction

```javascript
// TabManagerProduction.js - Retirer la key qui force le remount
case 'ContactDetailsPage':
  return <ContactViewTabs 
    // key={activeTab.id} // ❌ Retirer cette ligne
    id={activeTab.params?.contactId} 
    viewType={activeTab.params?.viewType} 
  />;
```

### 4. Optimiser useContactsRelational pour réduire les re-renders

```javascript
// useContactsRelational.js - Batch les updates
useEffect(() => {
  if (!currentOrganization?.id) {
    setLoading(false);
    return;
  }

  const unsubscribers = [];
  let isFirstLoad = true;

  try {
    // Utiliser un batch pour les premières données
    const batchUpdate = {
      structures: [],
      personnes: [],
      liaisons: [],
      loading: true
    };

    // Abonnement aux structures
    const structuresQuery = query(
      collection(db, 'structures'),
      where('entrepriseId', '==', currentOrganization.id)
    );
    
    const unsubStructures = onSnapshot(structuresQuery, (snapshot) => {
      const structuresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (isFirstLoad) {
        batchUpdate.structures = structuresData;
      } else {
        setStructures(structuresData);
      }
    });
    unsubscribers.push(unsubStructures);

    // Même chose pour personnes et liaisons...

    // Après tous les abonnements, faire une mise à jour groupée
    setTimeout(() => {
      if (isFirstLoad) {
        setStructures(batchUpdate.structures);
        setPersonnes(batchUpdate.personnes);
        setLiaisons(batchUpdate.liaisons);
        setLoading(false);
        isFirstLoad = false;
      }
    }, 100);

  } catch (err) {
    console.error('Erreur lors du chargement des contacts:', err);
    setError(err.message);
    setLoading(false);
  }

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}, [currentOrganization?.id]);
```

## Résultat Attendu

Avec ces optimisations:
1. **De 6 re-renders → 2-3 re-renders maximum**
   - 1er render: État initial (loading)
   - 2ème render: Données chargées
   - 3ème render (optionnel): Dates chargées

2. **Performance améliorée**
   - Moins de recalculs des useMemo
   - Pas de remount inutile du composant
   - Debouncing efficace pour le chargement des dates

3. **Code plus maintenable**
   - État centralisé dans un hook dédié
   - Logique de détection du type isolée
   - Dépendances des hooks optimisées

## Étapes d'Implémentation

1. Créer le hook `useContactViewState`
2. Refactoriser `ContactViewTabs` pour utiliser ce hook
3. Retirer la `key` dans `TabManagerProduction`
4. Optimiser `useContactsRelational` pour batching des updates
5. Tester et ajuster le debouncing si nécessaire