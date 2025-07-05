import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc, db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import contactServiceRelational from '@/services/contactServiceRelational';

/**
 * Hook simplifié pour gérer les détails d'un contact sans boucles de rechargement
 * Conserve toute la logique métier complexe de useContactDetails mais avec une architecture simple
 */
export default function useSimpleContactDetails(id) {
  // 🔍 DEBUG: Log du hook
  console.log('[DEBUG useSimpleContactDetails] Hook appelé avec ID:', id);
  
  const { currentOrganization } = useOrganization();
  
  // États principaux
  const [contact, setContact] = useState(null);
  const [structure, setStructure] = useState(null);
  const [lieux, setLieux] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [artistes, setArtistes] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(true);
  const [loadingLieux, setLoadingLieux] = useState(false);
  const [loadingConcerts, setLoadingConcerts] = useState(false);
  const [loadingArtistes, setLoadingArtistes] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(false);
  
  // États d'erreur
  const [error, setError] = useState(null);
  const [errorLieux, setErrorLieux] = useState(null);
  const [errorConcerts, setErrorConcerts] = useState(null);
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
        if (currentOrganization?.id) {
          lieuxConstraints.push(where('organizationId', '==', currentOrganization.id));
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
          if (currentOrganization?.id) {
            lieuxConstraints2.push(where('organizationId', '==', currentOrganization.id));
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
  }, [currentOrganization?.id]);

  // Fonction pour charger les concerts associés (même logique complexe que l'original)
  const fetchConcertsAssocies = useCallback(async (contactEntity) => {
    try {
      setLoadingConcerts(true);
      setErrorConcerts(null);
      
      // Méthode 1: Vérifier si le contact a des concertsIds ou concertsAssocies dans ses données
      if (contactEntity.concertsIds?.length > 0 || contactEntity.concertsAssocies?.length > 0) {
        const concertRefs = contactEntity.concertsIds || contactEntity.concertsAssocies || [];
        
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
        
        // Chercher les concerts avec ce contact dans contactIds
        const concertsConstraints = [where('contactIds', 'array-contains', id)];
        if (currentOrganization?.id) {
          concertsConstraints.push(where('organizationId', '==', currentOrganization.id));
        }
        let concertsQuery = query(
          collection(db, 'concerts'),
          ...concertsConstraints
        );
        let querySnapshot = await getDocs(concertsQuery);
        let concertsLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Si aucun résultat, essayer avec l'ancien format contactId pour rétrocompatibilité
        if (concertsLoaded.length === 0) {
          const concertsConstraints2 = [where('contactId', '==', id)];
          if (currentOrganization?.id) {
            concertsConstraints2.push(where('organizationId', '==', currentOrganization.id));
          }
          concertsQuery = query(
            collection(db, 'concerts'),
            ...concertsConstraints2
          );
          querySnapshot = await getDocs(concertsQuery);
          concertsLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        console.log(`[DIAGNOSTIC] useSimpleContactDetails - ${concertsLoaded.length} concerts trouvés par référence inverse`, { 
          concertIds: concertsLoaded.map(concert => concert.id) 
        });
        
        setConcerts(concertsLoaded);
      }
      
    } catch (error) {
      console.error('[ERROR] useSimpleContactDetails - Erreur lors du chargement des concerts:', error);
      setErrorConcerts(error.message);
    } finally {
      setLoadingConcerts(false);
    }
  }, [currentOrganization?.id]);

  // Fonction pour charger les artistes associés (même logique complexe que l'original)
  const fetchArtistesAssocies = useCallback(async (contactEntity, concertsData) => {
    try {
      setLoadingArtistes(true);
      setErrorArtistes(null);
      
      // Chercher les artistes avec ce contact dans contactIds
      const artistesConstraints = [where('contactIds', 'array-contains', id)];
      if (currentOrganization?.id) {
        artistesConstraints.push(where('organizationId', '==', currentOrganization.id));
      }
      let artistesQuery = query(
        collection(db, 'artistes'),
        ...artistesConstraints
      );
      let querySnapshot = await getDocs(artistesQuery);
      let artistesLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log(`[DEBUG] useSimpleContactDetails - Artistes avec contactId=${id}:`, artistesLoaded.length);
      
      // Méthode 2: Chercher les artistes via les concerts
      if (concertsData && concertsData.length > 0) {
        // Extraire les artisteIds des concerts
        const artisteIdsFromConcerts = concertsData.flatMap(concert => {
          const artisteIds = [];
          
          // Vérifier les différents formats de stockage des artistes
          if (concert.artisteId) artisteIds.push(concert.artisteId);
          if (concert.artisteIds?.length > 0) artisteIds.push(...concert.artisteIds);
          if (concert.artistes?.length > 0) {
            concert.artistes.forEach(artiste => {
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
        const uniqueArtisteIds = [...new Set(artisteIdsFromConcerts)];
        
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
          
          console.log(`[DEBUG] useSimpleContactDetails - ${validArtistes.length} artistes trouvés via concerts`);
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
  }, [currentOrganization?.id]);

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
  }, [currentOrganization?.id]);

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
        const [, concertsPromise] = await Promise.allSettled([
          fetchLieuxAssocies(contactData),
          fetchConcertsAssocies(contactData),
          fetchStructureAssociee(contactData)
        ]);

        // 3. CHARGER LES ARTISTES APRÈS LES CONCERTS (car ils en dépendent)
        // Attendre que les concerts soient chargés puis charger les artistes
        if (concertsPromise.status === 'fulfilled') {
          // Récupérer les concerts qui viennent d'être chargés
          const concertsConstraints = [where('contactIds', 'array-contains', id)];
          if (currentOrganization?.id) {
            concertsConstraints.push(where('organizationId', '==', currentOrganization.id));
          }
          let concertsQuery = query(collection(db, 'concerts'), ...concertsConstraints);
          let querySnapshot = await getDocs(concertsQuery);
          let concertsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          await fetchArtistesAssocies(contactData, concertsData);
        }

      } catch (err) {
        console.error('[ERROR] useSimpleContactDetails - Erreur lors du chargement:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllContactData();
  }, [id, currentOrganization?.id, fetchLieuxAssocies, fetchConcertsAssocies, fetchStructureAssociee, fetchArtistesAssocies]); // DÉPENDANCES STABLES = PAS DE BOUCLES DE RECHARGEMENT

  // 🔍 DEBUG: Log du retour
  console.log('[DEBUG useSimpleContactDetails] Données retournées:', {
    contact: contact ? `Contact ${contact.id}` : 'NULL',
    structure: structure ? `Structure ${structure.id}` : 'NULL',
    lieux: `${lieux.length} lieux`,
    concerts: `${concerts.length} concerts`,
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
    concerts,
    artistes,
    
    // États de chargement
    loading,
    loadingStructure,
    loadingLieux,
    loadingConcerts,
    loadingArtistes,
    
    // États d'erreur
    error,
    errorStructure,
    errorLieux,
    errorConcerts,
    errorArtistes,
    
    // Fonctions vides pour compatibilité (si nécessaire)
    saveEntity: () => Promise.resolve(),
    deleteEntity: () => Promise.resolve(),
    
    // Meta-données
    isNew: false,
    hasUnsavedChanges: false
  };
}