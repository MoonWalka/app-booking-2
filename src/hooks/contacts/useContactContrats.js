import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Hook pour récupérer les contrats associés à un contact
 * Les contrats sont liés aux contacts via les concerts
 */
export const useContactContrats = (contactId) => {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contactId) {
      setContrats([]);
      return;
    }

    const fetchContactContrats = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Récupérer tous les concerts du contact
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('contactId', '==', contactId)
        );
        const concertsSnapshot = await getDocs(concertsQuery);

        // 2. Récupérer les contrats pour chaque concert
        const contratsPromises = concertsSnapshot.docs.map(async (concertDoc) => {
          const concertData = { id: concertDoc.id, ...concertDoc.data() };
          
          const contratsQuery = query(
            collection(db, 'contrats'),
            where('concertId', '==', concertDoc.id)
          );
          const contratsSnapshot = await getDocs(contratsQuery);

          return contratsSnapshot.docs.map(contratDoc => ({
            id: contratDoc.id,
            ...contratDoc.data(),
            concert: concertData
          }));
        });

        // 3. Aplatir le tableau de résultats
        const contratsResults = await Promise.all(contratsPromises);
        const allContrats = contratsResults.flat();

        // 4. Trier par date de génération (plus récent en premier)
        allContrats.sort((a, b) => {
          const dateA = a.dateGeneration?.toDate?.() || new Date(a.dateGeneration);
          const dateB = b.dateGeneration?.toDate?.() || new Date(b.dateGeneration);
          return dateB - dateA;
        });

        setContrats(allContrats);
      } catch (err) {
        console.error('Erreur lors de la récupération des contrats du contact:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContactContrats();
  }, [contactId]);

  return { contrats, loading, error };
};