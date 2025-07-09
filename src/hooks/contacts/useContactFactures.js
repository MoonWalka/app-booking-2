import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';

/**
 * Hook pour récupérer les factures associées à un contact ou une structure
 * Les factures sont liées via les dates
 */
export const useContactFactures = (entityId, entityType = 'contact') => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { currentEntreprise } = useEntreprise();
  const entrepriseId = currentEntreprise?.id;

  useEffect(() => {
    console.log('[useContactFactures] Hook appelé avec:', { entityId, entityType, entrepriseId });
    
    if (!entityId || !entrepriseId) {
      console.log('[useContactFactures] Pas d\'entityId ou entrepriseId, arrêt');
      setFactures([]);
      return;
    }

    const fetchContactFactures = async () => {
      setLoading(true);
      setError(null);

      try {
        let structureId = entityId;
        
        // Si c'est un contact, récupérer sa structure
        if (entityType === 'contact') {
          const contactRef = doc(db, 'contacts', entityId);
          const contactSnap = await getDoc(contactRef);
          
          if (!contactSnap.exists()) {
            console.warn('Contact non trouvé:', entityId);
            setFactures([]);
            return;
          }

          const contactData = contactSnap.data();
          structureId = contactData.structureId || contactData.structureReference;
          
          if (!structureId) {
            console.log('Contact sans structure associée');
            setFactures([]);
            return;
          }
        }

        // 2. Récupérer toutes les dates de la structure
        console.log('[useContactFactures] Recherche des dates pour la structure:', structureId);
        const datesQuery = query(
          collection(db, 'dates'),
          where('structureId', '==', structureId)
        );
        const datesSnapshot = await getDocs(datesQuery);
        console.log('[useContactFactures] Nombre de dates trouvées:', datesSnapshot.size);

        // 3. Récupérer les factures pour chaque date
        const facturesPromises = datesSnapshot.docs.map(async (dateDoc) => {
          const dateData = { id: dateDoc.id, ...dateDoc.data() };
          
          const facturesQuery = query(
            collection(db, 'entreprises', entrepriseId, 'factures'),
            where('dateId', '==', dateDoc.id)
          );
          const facturesSnapshot = await getDocs(facturesQuery);
          
          console.log(`[useContactFactures] Date ${dateDoc.id}: ${facturesSnapshot.size} factures trouvées`);

          return facturesSnapshot.docs.map(factureDoc => ({
            id: factureDoc.id,
            ...factureDoc.data(),
            date: dateData
          }));
        });

        // 4. Aplatir le tableau de résultats
        const facturesResults = await Promise.all(facturesPromises);
        const allFactures = facturesResults.flat();
        console.log('[useContactFactures] Nombre total de factures trouvées:', allFactures.length);

        // 5. Trier par date de facture (plus récent en premier)
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
  }, [entityId, entityType, entrepriseId, refreshKey]);

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { factures, loading, error, refetch };
};