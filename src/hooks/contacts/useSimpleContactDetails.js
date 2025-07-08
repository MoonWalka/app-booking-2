import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc, db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import contactServiceRelational from '@/services/contactServiceRelational';

/**
 * Hook simplifié pour gérer les détails d'un contact sans boucles de rechargement
 * Conserve toute la logique métier complexe de useContactDetails mais avec une architecture simple
 */
export default function useSimpleContactDetails(id) {
  // 🔍 DEBUG: Log du hook
  console.log('[DEBUG useSimpleContactDetails] Hook appelé avec ID:', id);
  
  const { currentEntreprise } = useEntreprise();
  
  // États principaux
  const [contact, setContact] = useState(null);
  const [structure, setStructure] = useState(null);
  const [lieux, setLieux] = useState([]);
  const [dates, setDates] = useState([]);
  const [artistes, setArtistes] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(true);
  const [loadingLieux, setLoadingLieux] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingArtistes, setLoadingArtistes] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(false);
  
  // États d'erreur
  const [error, setError] = useState(null);
  const [errorLieux, setErrorLieux] = useState(null);
  const [errorDates, setErrorDates] = useState(null);
  const [errorArtistes, setErrorArtistes] = useState(null);
  const [errorStructure, setErrorStructure] = useState(null);

  // Fonction pour charger les lieux associés (même logique complexe que l'original)
  const fetchLieuxAssocies = useCallback(async (contactEntity) => {
    try {
      setLoadingLieux(true);
      setErrorLieux(null);
      
      let lieuxLoaded = [];
      
      // Vérifier d'abord si le contact a des lieuxIds ou lieuxAssocies dans ses données
      if (contactEntity.lieuxIds?.length > 0 || contactEntity.lieuxAssocies?.length > 0) {
        const lieuxRefs = contactEntity.lieuxIds || contactEntity.lieuxAssocies || [];
        
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
        lieuxLoaded = lieuxResults.filter(lieu => lieu !== null);
        
      } else {
        // Si pas de référence directe, chercher par référence inverse
        
        // Méthode 1: Chercher les lieux avec ce contact dans 'contactIds'
        const lieuxConstraints = [where('contactIds', 'array-contains', id)];
        if (currentEntreprise?.id) {
          lieuxConstraints.push(where('entrepriseId', '==', currentEntreprise.id));
        }
        let lieuxQuery = query(
          collection(db, 'lieux'),
          ...lieuxConstraints
        );
        let querySnapshot = await getDocs(lieuxQuery);
        lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Si aucun résultat, essayer avec l'ancien format contactId pour rétrocompatibilité
        if (lieuxLoaded.length === 0) {
          const lieuxConstraints2 = [where('contactId', '==', id)];
          if (currentEntreprise?.id) {
            lieuxConstraints2.push(where('entrepriseId', '==', currentEntreprise.id));
          }
          lieuxQuery = query(
            collection(db, 'lieux'),
            ...lieuxConstraints2
          );
          querySnapshot = await getDocs(lieuxQuery);
          lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      }
      
      console.log(`[DIAGNOSTIC] useSimpleContactDetails - ${lieuxLoaded.length} lieux trouvés`, { 
        lieuIds: lieuxLoaded.map(lieu => lieu.id) 
      });
      
      setLieux(lieuxLoaded);
      
    } catch (error) {
      console.error('[ERROR] useSimpleContactDetails - Erreur lors du chargement des lieux:', error);
      setErrorLieux(error.message);
    } finally {
      setLoadingLieux(false);
    }
  }, [currentEntreprise?.id, id]);

  // Fonction pour charger les dates associés (même logique complexe que l'original)
  const fetchDatesAssocies = useCallback(async (contactEntity) => {
    try {
      setLoadingDates(true);
      setErrorDates(null);
      
      // Méthode 1: Vérifier si le contact a des datesIds ou datesAssocies dans ses données
      if (contactEntity.datesIds?.length > 0 || contactEntity.datesAssocies?.length > 0) {
        const dateRefs = contactEntity.datesIds || contactEntity.datesAssocies || [];
        
        const datePromises = dateRefs.map(dateRef => {
          // Si c'est déjà un objet avec ID et des infos basiques, on peut l'utiliser directement
          if (typeof dateRef === 'object' && dateRef.id && dateRef.titre) {
            return Promise.resolve(dateRef);
          }
          
          // Sinon on charge les détails complets
          const dateId = typeof dateRef === 'object' ? dateRef.id : dateRef;
          return getDoc(doc(db, 'dates', dateId)).then(snapshot => {
            if (snapshot.exists()) {
              return { id: snapshot.id, ...snapshot.data() };
            }
            return null;
          });
        });
        
        const dateResults = await Promise.all(datePromises);
        const validDates = dateResults.filter(date => date !== null);
        
        setDates(validDates);
      } else {
        // Méthode 2: Chercher par référence inverse dans la collection dates
        
        // Chercher les dates avec ce contact dans contactIds
        const datesConstraints = [where('contactIds', 'array-contains', id)];
        if (currentEntreprise?.id) {
          datesConstraints.push(where('entrepriseId', '==', currentEntreprise.id));
        }
        let datesQuery = query(
          collection(db, 'dates'),
          ...datesConstraints
        );
        let querySnapshot = await getDocs(datesQuery);
        let datesLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Si aucun résultat, essayer avec l'ancien format contactId pour rétrocompatibilité
        if (datesLoaded.length === 0) {
          const datesConstraints2 = [where('contactId', '==', id)];
          if (currentEntreprise?.id) {
            datesConstraints2.push(where('entrepriseId', '==', currentEntreprise.id));
          }
          datesQuery = query(
            collection(db, 'dates'),
            ...datesConstraints2
          );
          querySnapshot = await getDocs(datesQuery);
          datesLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        console.log(`[DIAGNOSTIC] useSimpleContactDetails - ${datesLoaded.length} dates trouvés par référence inverse`, { 
          dateIds: datesLoaded.map(dateItem => dateItem.id) 
        });
        
        setDates(datesLoaded);
      }
      
    } catch (error) {
      console.error('[ERROR] useSimpleContactDetails - Erreur lors du chargement des dates:', error);
      setErrorDates(error.message);
    } finally {
      setLoadingDates(false);
    }
  }, [currentEntreprise?.id, id]);

  // Fonction pour charger les artistes associés (même logique complexe que l'original)
  const fetchArtistesAssocies = useCallback(async (contactEntity, datesData) => {
    try {
      setLoadingArtistes(true);
      setErrorArtistes(null);
      
      // Chercher les artistes avec ce contact dans contactIds
      const artistesConstraints = [where('contactIds', 'array-contains', id)];
      if (currentEntreprise?.id) {
        artistesConstraints.push(where('entrepriseId', '==', currentEntreprise.id));
      }
      let artistesQuery = query(
        collection(db, 'artistes'),
        ...artistesConstraints
      );
      let querySnapshot = await getDocs(artistesQuery);
      let artistesLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log(`[DEBUG] useSimpleContactDetails - Artistes avec contactId=${id}:`, artistesLoaded.length);
      
      // Méthode 2: Chercher les artistes via les dates
      if (datesData && datesData.length > 0) {
        // Extraire les artisteIds des dates
        const artisteIdsFromDates = datesData.flatMap(dateItem => {
          const artisteIds = [];
          
          // Vérifier les différents formats de stockage des artistes
          if (dateItem.artisteId) artisteIds.push(dateItem.artisteId);
          if (dateItem.artisteIds?.length > 0) artisteIds.push(...dateItem.artisteIds);
          if (dateItem.artistes?.length > 0) {
            dateItem.artistes.forEach(artiste => {
              if (typeof artiste === 'string') {
                artisteIds.push(artiste);
              } else if (artiste.id) {
                artisteIds.push(artiste.id);
              }
            });
          }
          
          return artisteIds;
        });
        
        // Supprimer les doublons
        const uniqueArtisteIds = [...new Set(artisteIdsFromDates)];
        
        if (uniqueArtisteIds.length > 0) {
          console.log('[DEBUG] useSimpleContactDetails - Chargement des artistes:', uniqueArtisteIds);
          
          // Charger tous les artistes
          const artistePromises = uniqueArtisteIds.map(async (artisteId) => {
            try {
              const artisteDoc = await getDoc(doc(db, 'artistes', artisteId));
              if (artisteDoc.exists()) {
                return { id: artisteDoc.id, ...artisteDoc.data() };
              }
              return null;
            } catch (error) {
              console.error(`Erreur chargement artiste ${artisteId}:`, error);
              return null;
            }
          });
          
          const results = await Promise.all(artistePromises);
          const validArtistes = results.filter(artiste => artiste !== null);
          
          // Fusionner avec les artistes déjà trouvés (éviter les doublons)
          const existingIds = new Set(artistesLoaded.map(a => a.id));
          validArtistes.forEach(artiste => {
            if (!existingIds.has(artiste.id)) {
              artistesLoaded.push(artiste);
            }
          });
          
          console.log(`[DEBUG] useSimpleContactDetails - ${validArtistes.length} artistes trouvés via dates`);
        }
      }
      
      console.log(`[DIAGNOSTIC] useSimpleContactDetails - ${artistesLoaded.length} artistes trouvés au total`, { 
        artisteIds: artistesLoaded.map(artiste => artiste.id) 
      });
      
      setArtistes(artistesLoaded);
      
    } catch (error) {
      console.error('[ERROR] useSimpleContactDetails - Erreur lors du chargement des artistes:', error);
      setErrorArtistes(error.message);
    } finally {
      setLoadingArtistes(false);
    }
  }, [currentEntreprise?.id, id]);

  // Fonction pour charger la structure associée (même logique que l'original)
  const fetchStructureAssociee = useCallback(async (contactEntity) => {
    try {
      setLoadingStructure(true);
      setErrorStructure(null);
      
      console.log(`[DEBUG] useSimpleContactDetails - Contact data:`, contactEntity);
      console.log(`[DEBUG] useSimpleContactDetails - structureId:`, contactEntity.structureId);
      
      // Vérifier si le contact a un structureId (pour les personnes)
      if (contactEntity.structureId) {
        const structureDoc = await getDoc(doc(db, 'structures', contactEntity.structureId));
        if (structureDoc.exists()) {
          const structureData = { id: structureDoc.id, ...structureDoc.data() };
          setStructure(structureData);
          console.log(`[DIAGNOSTIC] useSimpleContactDetails - Structure trouvée:`, structureData);
        } else {
          console.log(`[DIAGNOSTIC] useSimpleContactDetails - Structure ${contactEntity.structureId} n'existe pas`);
          setStructure(null);
        }
      } else if (contactEntity.structures && contactEntity.structures.length > 0) {
        // Pour la compatibilité avec le nouveau système relationnel
        const structureId = typeof contactEntity.structures[0] === 'string' 
          ? contactEntity.structures[0] 
          : contactEntity.structures[0]?.id;
        
        if (structureId) {
          const structureDoc = await getDoc(doc(db, 'structures', structureId));
          if (structureDoc.exists()) {
            const structureData = { id: structureDoc.id, ...structureDoc.data() };
            setStructure(structureData);
            console.log(`[DIAGNOSTIC] useSimpleContactDetails - Structure trouvée via array:`, structureData);
          }
        }
      } else {
        console.log(`[DIAGNOSTIC] useSimpleContactDetails - Contact sans structure associée`);
        setStructure(null);
      }
      
    } catch (error) {
      console.error('[ERROR] useSimpleContactDetails - Erreur lors du chargement de la structure:', error);
      setErrorStructure(error.message);
      setStructure(null);
    } finally {
      setLoadingStructure(false);
    }
  }, []);

  // EFFET PRINCIPAL - UNE SEULE DÉPENDANCE STABLE POUR ÉVITER LES BOUCLES
  useEffect(() => {
    const loadAllContactData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. CHARGER LE CONTACT PRINCIPAL
        console.log('[DEBUG] useSimpleContactDetails - Chargement du contact:', id);
        
        // Utiliser le service relationnel qui gère structures/personnes et rétrocompatibilité
        const contactData = await contactServiceRelational.getContactById(id);
        
        if (!contactData) {
          throw new Error('Contact non trouvé');
        }
        setContact(contactData);

        console.log('[DEBUG] useSimpleContactDetails - Contact chargé:', {
          id: contactData.id,
          nom: contactData.nom,
          prenom: contactData.prenom,
          email: contactData.email,
          structureId: contactData.structureId,
          allKeys: Object.keys(contactData)
        });

        // 2. CHARGER LES DONNÉES LIÉES EN PARALLÈLE (sauf artistes)
        const [, datesPromise] = await Promise.allSettled([
          fetchLieuxAssocies(contactData),
          fetchDatesAssocies(contactData),
          fetchStructureAssociee(contactData)
        ]);

        // 3. CHARGER LES ARTISTES APRÈS LES DATES (car ils en dépendent)
        // Attendre que les dates soient chargées puis charger les artistes
        if (datesPromise.status === 'fulfilled') {
          // Récupérer les dates qui viennent d'être chargées
          const datesConstraints = [where('contactIds', 'array-contains', id)];
          if (currentEntreprise?.id) {
            datesConstraints.push(where('entrepriseId', '==', currentEntreprise.id));
          }
          let datesQuery = query(collection(db, 'dates'), ...datesConstraints);
          let querySnapshot = await getDocs(datesQuery);
          let datesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          await fetchArtistesAssocies(contactData, datesData);
        }

      } catch (err) {
        console.error('[ERROR] useSimpleContactDetails - Erreur lors du chargement:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllContactData();
  }, [id, currentEntreprise?.id, fetchLieuxAssocies, fetchDatesAssocies, fetchStructureAssociee, fetchArtistesAssocies]); // DÉPENDANCES STABLES = PAS DE BOUCLES DE RECHARGEMENT

  // 🔍 DEBUG: Log du retour
  console.log('[DEBUG useSimpleContactDetails] Données retournées:', {
    contact: contact ? `Contact ${contact.id}` : 'NULL',
    structure: structure ? `Structure ${structure.id}` : 'NULL',
    lieux: `${lieux.length} lieux`,
    dates: `${dates.length} dates`,
    artistes: `${artistes.length} artistes`,
    loading,
    error: error || 'NULL'
  });

  // Retourner la même interface que useContactDetails pour compatibilité
  return {
    // Données principales
    entity: contact, // Pour compatibilité avec useGenericEntityDetails
    contact,
    structure,
    lieux,
    dates,
    artistes,
    
    // États de chargement
    loading,
    loadingStructure,
    loadingLieux,
    loadingDates,
    loadingArtistes,
    
    // États d'erreur
    error,
    errorStructure,
    errorLieux,
    errorDates,
    errorArtistes,
    
    // Fonctions vides pour compatibilité (si nécessaire)
    saveEntity: () => Promise.resolve(),
    deleteEntity: () => Promise.resolve(),
    
    // Meta-données
    isNew: false,
    hasUnsavedChanges: false
  };
}