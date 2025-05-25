import { useGenericEntityDetails } from '@/hooks/common';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, db } from '@/services/firebase-service';

/**
 * Hook pour gérer les détails d'un programmateur en utilisant le hook générique
 */
export default function useProgrammateurDetails(id) {
  // État pour les lieux associés
  const [lieux, setLieux] = useState([]);
  const [loadingLieux, setLoadingLieux] = useState(false);
  const [errorLieux, setErrorLieux] = useState(null);
  
  // État pour les concerts associés
  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(false);
  const [errorConcerts, setErrorConcerts] = useState(null);
  
  const details = useGenericEntityDetails({
    entityType: 'programmateur',
    collectionName: 'programmateurs',
    id,
    onSaveSuccess: () => {},
    onSaveError: () => {},
    onDeleteSuccess: () => {},
    onDeleteError: () => {},
    navigate: () => {},
    returnPath: '/programmateurs',
    editPath: '/programmateurs/:id/edit'
  });
  
  // Charger les lieux associés au programmateur
  useEffect(() => {
    const fetchLieuxAssocies = async () => {
      if (!id || !details.entity) return;
      
      try {
        setLoadingLieux(true);
        console.log(`[DIAGNOSTIC] useProgrammateurDetails - Chargement des lieux pour programmateur ${id}`);
        
        // Vérifier d'abord si le programmateur a des lieuxIds ou lieuxAssocies dans ses données
        if (details.entity.lieuxIds?.length > 0 || details.entity.lieuxAssocies?.length > 0) {
          const lieuxRefs = details.entity.lieuxIds || details.entity.lieuxAssocies || [];
          console.log(`[DIAGNOSTIC] useProgrammateurDetails - ${lieuxRefs.length} références de lieux trouvées dans le programmateur`);
          
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
          console.log(`[DIAGNOSTIC] useProgrammateurDetails - ${validLieux.length} lieux chargés depuis les références`);
          
          setLieux(validLieux);
        } else {
          // Si pas de référence directe, chercher par référence inverse
          console.log(`[DIAGNOSTIC] useProgrammateurDetails - Pas de références directes, recherche par référence inverse`);
          
          // Méthode 1: Chercher les lieux avec ce programmateur dans 'programmateurs'
          let lieuxQuery = query(
            collection(db, 'lieux'),
            where('programmateurs', 'array-contains', id)
          );
          let querySnapshot = await getDocs(lieuxQuery);
          let lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Méthode 2: Si rien trouvé, chercher par programmateurId
          if (lieuxLoaded.length === 0) {
            console.log(`[DIAGNOSTIC] useProgrammateurDetails - Pas de résultat avec 'programmateurs', essai avec 'programmateurId'`);
            lieuxQuery = query(
              collection(db, 'lieux'),
              where('programmateurId', '==', id)
            );
            querySnapshot = await getDocs(lieuxQuery);
            lieuxLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          
          console.log(`[DIAGNOSTIC] useProgrammateurDetails - ${lieuxLoaded.length} lieux trouvés par référence inverse`, { 
            lieuxIds: lieuxLoaded.map(lieu => lieu.id) 
          });
          
          setLieux(lieuxLoaded);
        }
        
      } catch (error) {
        console.error('[ERROR] useProgrammateurDetails - Erreur lors du chargement des lieux:', error);
        setErrorLieux(error.message);
      } finally {
        setLoadingLieux(false);
      }
    };
    
    fetchLieuxAssocies();
  }, [id, details.entity]);
  
  // Charger les concerts associés au programmateur
  useEffect(() => {
    const fetchConcertsAssocies = async () => {
      if (!id || !details.entity) return;
      
      try {
        setLoadingConcerts(true);
        console.log(`[DIAGNOSTIC] useProgrammateurDetails - Chargement des concerts pour programmateur ${id}`);
        
        // Méthode 1: Vérifier si le programmateur a des concertsIds ou concertsAssocies dans ses données
        if (details.entity.concertsIds?.length > 0 || details.entity.concertsAssocies?.length > 0) {
          const concertRefs = details.entity.concertsIds || details.entity.concertsAssocies || [];
          console.log(`[DIAGNOSTIC] useProgrammateurDetails - ${concertRefs.length} références de concerts trouvées dans le programmateur`);
          
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
          console.log(`[DIAGNOSTIC] useProgrammateurDetails - ${validConcerts.length} concerts chargés depuis les références`);
          
          setConcerts(validConcerts);
        } else {
          // Méthode 2: Chercher par référence inverse dans la collection concerts
          console.log(`[DIAGNOSTIC] useProgrammateurDetails - Pas de références directes, recherche par référence inverse`);
          
          // Chercher les concerts avec ce programmateur comme programmateurId
          let concertsQuery = query(
            collection(db, 'concerts'),
            where('programmateurId', '==', id)
          );
          let querySnapshot = await getDocs(concertsQuery);
          let concertsLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Si aucun résultat, essayer avec le champ programmateurs (array-contains)
          if (concertsLoaded.length === 0) {
            console.log(`[DIAGNOSTIC] useProgrammateurDetails - Pas de résultat avec 'programmateurId', essai avec 'programmateurs'`);
            concertsQuery = query(
              collection(db, 'concerts'),
              where('programmateurs', 'array-contains', id)
            );
            querySnapshot = await getDocs(concertsQuery);
            concertsLoaded = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          
          console.log(`[DIAGNOSTIC] useProgrammateurDetails - ${concertsLoaded.length} concerts trouvés par référence inverse`, { 
            concertIds: concertsLoaded.map(concert => concert.id) 
          });
          
          setConcerts(concertsLoaded);
        }
        
      } catch (error) {
        console.error('[ERROR] useProgrammateurDetails - Erreur lors du chargement des concerts:', error);
        setErrorConcerts(error.message);
      } finally {
        setLoadingConcerts(false);
      }
    };
    
    fetchConcertsAssocies();
  }, [id, details.entity]);
  
  return {
    ...details,
    programmateur: details.entity, // mapping clé pour compatibilité UI
    lieux,
    loadingLieux,
    errorLieux,
    concerts,  // Ajouter les concerts au retour du hook
    loadingConcerts,
    errorConcerts,
    // Pour compatibilité avec le composant existant
    concertsAssocies: concerts
  };
}