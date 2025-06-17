import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook pour récupérer les factures associées à un contact
 * Les factures sont liées aux contacts via les concerts
 */
export const useContactFactures = (contactId) => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { organizationId } = useOrganization();

  useEffect(() => {
    if (!contactId || !organizationId) {
      setFactures([]);
      return;
    }

    const fetchContactFactures = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Récupérer tous les concerts du contact
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('contactId', '==', contactId)
        );
        const concertsSnapshot = await getDocs(concertsQuery);

        // 2. Récupérer les factures pour chaque concert
        const facturesPromises = concertsSnapshot.docs.map(async (concertDoc) => {
          const concertData = { id: concertDoc.id, ...concertDoc.data() };
          
          const facturesQuery = query(
            collection(db, 'organizations', organizationId, 'factures'),
            where('concertId', '==', concertDoc.id)
          );
          const facturesSnapshot = await getDocs(facturesQuery);

          return facturesSnapshot.docs.map(factureDoc => ({
            id: factureDoc.id,
            ...factureDoc.data(),
            concert: concertData
          }));
        });

        // 3. Aplatir le tableau de résultats
        const facturesResults = await Promise.all(facturesPromises);
        const allFactures = facturesResults.flat();

        // 4. Trier par date de facture (plus récent en premier)
        allFactures.sort((a, b) => {
          const dateA = a.dateFacture?.toDate?.() || new Date(a.dateFacture);
          const dateB = b.dateFacture?.toDate?.() || new Date(b.dateFacture);
          return dateB - dateA;
        });

        setFactures(allFactures);
      } catch (err) {
        console.error('Erreur lors de la récupération des factures du contact:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContactFactures();
  }, [contactId, organizationId]);

  return { factures, loading, error };
};