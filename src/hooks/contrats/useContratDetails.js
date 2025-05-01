// src/hooks/contrats/useContratDetails.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook to manage contract details data loading
 * Fetches contract and all related data (concert, template, etc.)
 */
export const useContratDetails = (contratId) => {
  const [contrat, setContrat] = useState(null);
  const [concert, setConcert] = useState(null);
  const [template, setTemplate] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [entreprise, setEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations du contrat
        const contratDoc = await getDoc(doc(db, 'contrats', contratId));
        if (!contratDoc.exists()) {
          setError('Contrat non trouvé');
          setLoading(false);
          return;
        }
        
        const contratData = { id: contratDoc.id, ...contratDoc.data() };
        setContrat(contratData);
        
        // Récupérer les informations du concert associé
        if (contratData.concertId) {
          const concertDoc = await getDoc(doc(db, 'concerts', contratData.concertId));
          if (concertDoc.exists()) {
            const concertData = { id: concertDoc.id, ...concertDoc.data() };
            setConcert(concertData);
            
            // Récupérer le programmateur
            if (concertData.programmateurId) {
              const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
              if (progDoc.exists()) {
                setProgrammateur({ id: progDoc.id, ...progDoc.data() });
              }
            }
            
            // Récupérer le lieu
            if (concertData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                setLieu({ id: lieuDoc.id, ...lieuDoc.data() });
              }
            }
            
            // Si artiste existe, récupérer les données
            if (concertData.artisteId) {
              const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
              if (artisteDoc.exists()) {
                setArtiste({ id: artisteDoc.id, ...artisteDoc.data() });
              }
            }
          }
        }
        
        // Récupérer les informations du template utilisé
        if (contratData.templateId) {
          const templateDoc = await getDoc(doc(db, 'contratTemplates', contratData.templateId));
          if (templateDoc.exists()) {
            setTemplate({ id: templateDoc.id, ...templateDoc.data() });
          }
        }
        
        // Récupérer les informations de l'entreprise
        const entrepriseDoc = await getDoc(doc(db, 'parametres', 'entreprise'));
        if (entrepriseDoc.exists()) {
          setEntreprise(entrepriseDoc.data());
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données :', err);
        setError('Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [contratId]);

  return {
    contrat,
    setContrat,
    concert,
    template,
    programmateur,
    lieu,
    artiste,
    entreprise,
    loading,
    error
  };
};

export default useContratDetails;