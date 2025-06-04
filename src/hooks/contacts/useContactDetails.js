import { useGenericEntityDetails } from '@/hooks/common';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, db } from '@/services/firebase-service';

/**
 * Hook pour gérer les détails d'un contact en utilisant le hook générique
 */
export default function useContactDetails(id) {
  // 🔍 DEBUG: Log du hook
  console.log('[DEBUG useContactDetails] Hook appelé avec ID:', id);
  
  // État pour les lieux associés
  const [lieux, setLieux] = useState([]);
  const [loadingLieux, setLoadingLieux] = useState(false);
  const [errorLieux, setErrorLieux] = useState(null);
  
  // État pour les concerts associés
  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(false);
  const [errorConcerts, setErrorConcerts] = useState(null);
  
  // État pour la structure associée
  const [structure, setStructure] = useState(null);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [errorStructure, setErrorStructure] = useState(null);
  
  const details = useGenericEntityDetails({
    entityType: 'contact',
    collectionName: 'contacts',
    id,
    onSaveSuccess: () => {},
    onSaveError: () => {},
    onDeleteSuccess: () => {},
    onDeleteError: () => {},
    navigate: () => {},
    returnPath: '/contacts',
    editPath: '/contacts/:id/edit'
  });
  
  // 🔍 DEBUG: Log des données du hook générique
  console.log('[DEBUG useContactDetails] Données hook générique:', {
    entity: details.entity?.id ? `Contact ${details.entity.id}` : 'NULL',
    loading: details.loading,
    error: details.error?.message || 'NULL'
  });
  
  // Charger les lieux associés au contact
  useEffect(() => {
    const fetchLieuxAssocies = async () => {
      if (!id || !details.entity) return;
      
      try {
        setLoadingLieux(true);
        
        // Vérifier d'abord si le contact a des lieuxIds ou lieuxAssocies dans ses données
        if (details.entity.lieuxIds?.length > 0 || details.entity.lieuxAssocies?.length > 0) {
          const lieuxRefs = details.entity.lieuxIds || details.entity.lieuxAssocies || [];
          
          const lieuxPromises = lieuxRefs.map(lieuRef => {
            const lieuId = typeof lieuRef === 'object' ? lieuRef.id : lieuRef;
            return getDoc(doc(db, 'lieux', lieuId)).then(snapshot => {
              if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() };
              }
              return null;
            });
          });
          
          const lieuxResults = await Promise.all(lieuxPromises);
          const validLieux = lieuxResults.filter(lieu => lieu !== null);
          
          setLieux(validLieux);
        } else {
          // Si pas de référence directe, chercher par référence inverse
          
          // Méthode 1: Chercher les lieux avec ce contact dans 'contacts'
          let lieuxQuery = query(
            collection(db, 'lieux'),
            where('contacts', 'array-contains', id)
          );
          let querySnapshot = await getDocs(lieuxQuery);
          let lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Méthode 2: Si rien trouvé, chercher par contactId
          if (lieuxLoaded.length === 0) {
            lieuxQuery = query(
              collection(db, 'lieux'),
              where('contactId', '==', id)
            );
            querySnapshot = await getDocs(lieuxQuery);
            lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          
          console.log(`[DIAGNOSTIC] useContactDetails - ${lieuxLoaded.length} lieux trouvés par référence inverse`, { 
            lieuxIds: lieuxLoaded.map(lieu => lieu.id) 
          });
          
          setLieux(lieuxLoaded);
        }
        
      } catch (error) {
        console.error('[ERROR] useContactDetails - Erreur lors du chargement des lieux:', error);
        setErrorLieux(error.message);
      } finally {
        setLoadingLieux(false);
      }
    };
    
    fetchLieuxAssocies();
  }, [id, details.entity]);
  
  // Charger les concerts associés au contact
  useEffect(() => {
    const fetchConcertsAssocies = async () => {
      if (!id || !details.entity) return;
      
      try {
        setLoadingConcerts(true);
        
        // Méthode 1: Vérifier si le contact a des concertsIds ou concertsAssocies dans ses données
        if (details.entity.concertsIds?.length > 0 || details.entity.concertsAssocies?.length > 0) {
          const concertRefs = details.entity.concertsIds || details.entity.concertsAssocies || [];
          
          const concertPromises = concertRefs.map(concertRef => {
            // Si c'est déjà un objet avec ID et des infos basiques, on peut l'utiliser directement
            if (typeof concertRef === 'object' && concertRef.id && concertRef.titre) {
              return Promise.resolve(concertRef);
            }
            
            // Sinon on charge les détails complets
            const concertId = typeof concertRef === 'object' ? concertRef.id : concertRef;
            return getDoc(doc(db, 'concerts', concertId)).then(snapshot => {
              if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() };
              }
              return null;
            });
          });
          
          const concertResults = await Promise.all(concertPromises);
          const validConcerts = concertResults.filter(concert => concert !== null);
          
          setConcerts(validConcerts);
        } else {
          // Méthode 2: Chercher par référence inverse dans la collection concerts
          
          // Chercher les concerts avec ce contact comme contactId
          let concertsQuery = query(
            collection(db, 'concerts'),
            where('contactId', '==', id)
          );
          let querySnapshot = await getDocs(concertsQuery);
          let concertsLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Si aucun résultat, essayer avec le champ contacts (array-contains)
          if (concertsLoaded.length === 0) {
            concertsQuery = query(
              collection(db, 'concerts'),
              where('contacts', 'array-contains', id)
            );
            querySnapshot = await getDocs(concertsQuery);
            concertsLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          
          console.log(`[DIAGNOSTIC] useContactDetails - ${concertsLoaded.length} concerts trouvés par référence inverse`, { 
            concertIds: concertsLoaded.map(concert => concert.id) 
          });
          
          setConcerts(concertsLoaded);
        }
        
      } catch (error) {
        console.error('[ERROR] useContactDetails - Erreur lors du chargement des concerts:', error);
        setErrorConcerts(error.message);
      } finally {
        setLoadingConcerts(false);
      }
    };
    
    fetchConcertsAssocies();
  }, [id, details.entity]);
  
  // Charger la structure associée au contact
  useEffect(() => {
    const fetchStructureAssociee = async () => {
      if (!id || !details.entity) return;
      
      try {
        setLoadingStructure(true);
        
        console.log(`[DEBUG] useContactDetails - Contact data:`, details.entity);
        console.log(`[DEBUG] useContactDetails - structureId:`, details.entity.structureId);
        
        // Vérifier si le contact a un structureId
        if (details.entity.structureId) {
          const structureDoc = await getDoc(doc(db, 'structures', details.entity.structureId));
          if (structureDoc.exists()) {
            const structureData = { id: structureDoc.id, ...structureDoc.data() };
            setStructure(structureData);
            console.log(`[DIAGNOSTIC] useContactDetails - Structure trouvée:`, structureData);
          } else {
            console.log(`[DIAGNOSTIC] useContactDetails - Structure ${details.entity.structureId} n'existe pas`);
            setStructure(null);
          }
        } else {
          console.log(`[DIAGNOSTIC] useContactDetails - Contact sans structureId`);
          setStructure(null);
        }
        
      } catch (error) {
        console.error('[ERROR] useContactDetails - Erreur lors du chargement de la structure:', error);
        setErrorStructure(error.message);
        setStructure(null);
      } finally {
        setLoadingStructure(false);
      }
    };
    
    fetchStructureAssociee();
  }, [id, details.entity]);
  
  const hookReturn = {
    ...details,
    contact: details.entity, // mapping clé pour compatibilité UI
    structure,
    loadingStructure,
    errorStructure,
    lieux,
    loadingLieux,
    errorLieux,
    concerts,  // Ajouter les concerts au retour du hook
    loadingConcerts,
    errorConcerts,
    // Pour compatibilité avec le composant existant
    concertsAssocies: concerts
  };

  console.log('[HOOK RETURN] useContactDetails:', {
    contact: hookReturn.contact?.id,
    structure: hookReturn.structure?.id,
    lieux: hookReturn.lieux?.length,
    concerts: hookReturn.concerts?.length,
    loadingStructure: hookReturn.loadingStructure,
    loadingLieux: hookReturn.loadingLieux,
    loadingConcerts: hookReturn.loadingConcerts
  });

  return hookReturn;
}