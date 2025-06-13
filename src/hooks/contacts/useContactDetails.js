import { useGenericEntityDetails } from '@/hooks/common';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook pour gérer les détails d'un contact en utilisant le hook générique
 */
export default function useContactDetails(id) {
  // 🔍 DEBUG: Log du hook
  console.log('[DEBUG useContactDetails] Hook appelé avec ID:', id);
  
  const { currentOrganization } = useOrganization();
  
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
  
  // État pour les artistes associés
  const [artistes, setArtistes] = useState([]);
  const [loadingArtistes, setLoadingArtistes] = useState(false);
  const [errorArtistes, setErrorArtistes] = useState(null);
  
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
  
  // 🔍 DEBUG: Log spécifique pour l'email
  if (details.entity) {
    console.log('[DEBUG useContactDetails] Email du contact:', {
      'entity.email': details.entity.email,
      'entity.contact?.email': details.entity.contact?.email,
      'toutes les clés': Object.keys(details.entity)
    });
  }
  
  // Charger les lieux associés au contact
  useEffect(() => {
    const fetchLieuxAssocies = async () => {
      if (!id || !details.entity) return;
      
      try {
        setLoadingLieux(true);
        
        let lieuxLoaded = [];
        
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
          
          // Méthode 2: Si rien trouvé, chercher par contactId
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
          
          console.log(`[DIAGNOSTIC] useContactDetails - ${lieuxLoaded.length} lieux trouvés par référence inverse`, { 
            lieuxIds: lieuxLoaded.map(lieu => lieu.id) 
          });
        }
        
        // Méthode 3: Récupérer les lieux via les concerts du contact
        // Cette logique est importante car un contact peut être associé à des lieux via ses concerts
        console.log('[DEBUG] useContactDetails - Recherche des lieux via les concerts du contact');
        
        // Attendre que les concerts soient chargés
        if (concerts.length > 0) {
          const lieuxDesConcerts = [];
          
          // Parcourir tous les concerts pour récupérer leurs lieux
          for (const concert of concerts) {
            if (concert.lieuId) {
              lieuxDesConcerts.push(concert.lieuId);
            }
          }
          
          // Supprimer les doublons
          const uniqueLieuxIds = [...new Set(lieuxDesConcerts)];
          console.log(`[DEBUG] useContactDetails - ${uniqueLieuxIds.length} lieux uniques trouvés via ${concerts.length} concerts`);
          
          // Charger les lieux qui ne sont pas déjà dans la liste
          for (const lieuId of uniqueLieuxIds) {
            // Vérifier si ce lieu n'est pas déjà dans notre liste
            const existingLieu = lieuxLoaded.find(l => l.id === lieuId);
            if (!existingLieu) {
              try {
                const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
                if (lieuDoc.exists()) {
                  const lieuData = { id: lieuDoc.id, ...lieuDoc.data() };
                  lieuxLoaded.push(lieuData);
                  console.log(`[DEBUG] useContactDetails - Lieu trouvé via concerts: ${lieuData.nom}`);
                }
              } catch (error) {
                console.error(`[ERROR] useContactDetails - Erreur lors du chargement du lieu ${lieuId} via concerts:`, error);
              }
            }
          }
          
          console.log(`[DEBUG] useContactDetails - Total de ${lieuxLoaded.length} lieux trouvés pour ce contact`);
        }
        
        // Mettre à jour la liste finale des lieux
        setLieux(lieuxLoaded);
        
      } catch (error) {
        console.error('[ERROR] useContactDetails - Erreur lors du chargement des lieux:', error);
        setErrorLieux(error.message);
      } finally {
        setLoadingLieux(false);
      }
    };
    
    fetchLieuxAssocies();
  }, [id, details.entity, concerts, currentOrganization]); // Ajouter concerts et currentOrganization comme dépendances
  
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
  }, [id, details.entity, currentOrganization]);
  
  // Charger les artistes associés au contact
  useEffect(() => {
    const fetchArtistesAssocies = async () => {
      if (!id || !details.entity) return;
      
      try {
        setLoadingArtistes(true);
        
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
        
        console.log(`[DEBUG] useContactDetails - Artistes avec contactId=${id}:`, artistesLoaded.length);
        
        // Si aucun résultat, essayer avec l'ancien format contactId pour rétrocompatibilité
        if (artistesLoaded.length === 0) {
          const artistesConstraints2 = [where('contactId', '==', id)];
          if (currentOrganization?.id) {
            artistesConstraints2.push(where('organizationId', '==', currentOrganization.id));
          }
          artistesQuery = query(
            collection(db, 'artistes'),
            ...artistesConstraints2
          );
          querySnapshot = await getDocs(artistesQuery);
          artistesLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log(`[DEBUG] useContactDetails - Artistes avec contacts array-contains ${id}:`, artistesLoaded.length);
        }
        
        // Essayer aussi avec le champ 'contact' (au singulier) si pas de résultats
        if (artistesLoaded.length === 0) {
          const artistesConstraints3 = [where('contact', '==', id)];
          if (currentOrganization?.id) {
            artistesConstraints3.push(where('organizationId', '==', currentOrganization.id));
          }
          artistesQuery = query(
            collection(db, 'artistes'),
            ...artistesConstraints3
          );
          querySnapshot = await getDocs(artistesQuery);
          artistesLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log(`[DEBUG] useContactDetails - Artistes avec contact=${id}:`, artistesLoaded.length);
        }
        
        // Méthode 4: Si toujours aucun artiste, chercher via les concerts du contact
        if (artistesLoaded.length === 0 && concerts.length > 0) {
          console.log('[DEBUG] useContactDetails - Recherche artistes via concerts du contact');
          
          // Extraire tous les artisteId des concerts
          const artisteIdsFromConcerts = [];
          concerts.forEach(concert => {
            if (concert.artisteId) {
              artisteIdsFromConcerts.push(concert.artisteId);
            }
          });
          
          // Supprimer les doublons
          const uniqueArtisteIds = [...new Set(artisteIdsFromConcerts)];
          
          if (uniqueArtisteIds.length > 0) {
            console.log('[DEBUG] useContactDetails - Chargement des artistes:', uniqueArtisteIds);
            
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
            
            console.log(`[DEBUG] useContactDetails - ${validArtistes.length} artistes trouvés via concerts`);
          }
        }
        
        console.log(`[DIAGNOSTIC] useContactDetails - ${artistesLoaded.length} artistes trouvés au total`, { 
          artisteIds: artistesLoaded.map(artiste => artiste.id) 
        });
        
        setArtistes(artistesLoaded);
        
      } catch (error) {
        console.error('[ERROR] useContactDetails - Erreur lors du chargement des artistes:', error);
        setErrorArtistes(error.message);
      } finally {
        setLoadingArtistes(false);
      }
    };
    
    fetchArtistesAssocies();
  }, [id, details.entity, concerts, currentOrganization]);
  
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
  }, [id, details.entity, currentOrganization]);
  
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
    artistes,  // Ajouter les artistes au retour du hook
    loadingArtistes,
    errorArtistes,
    // Pour compatibilité avec le composant existant
    concertsAssocies: concerts
  };

  console.log('[HOOK RETURN] useContactDetails:', {
    contact: hookReturn.contact?.id,
    structure: hookReturn.structure?.id,
    lieux: hookReturn.lieux?.length,
    concerts: hookReturn.concerts?.length,
    artistes: hookReturn.artistes?.length,
    loadingStructure: hookReturn.loadingStructure,
    loadingLieux: hookReturn.loadingLieux,
    loadingArtistes: hookReturn.loadingArtistes,
    loadingConcerts: hookReturn.loadingConcerts
  });

  return hookReturn;
}