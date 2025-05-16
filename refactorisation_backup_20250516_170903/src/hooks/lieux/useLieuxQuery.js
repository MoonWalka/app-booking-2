import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Custom hook to fetch and manage lieux data
 * @returns {Object} State and methods for lieux data
 */
const useLieuxQuery = () => {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0,
    festivals: 0,
    salles: 0,
    bars: 0,
    plateaux: 0
  });

  // Fetch lieux data from Firestore
  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'lieux'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate stats
        let avecConcerts = 0;
        let sansConcerts = 0;
        let festivals = 0;
        let salles = 0;
        let bars = 0;
        let plateaux = 0;
        
        lieuxData.forEach(lieu => {
          if (lieu.concertsAssocies && lieu.concertsAssocies.length > 0) {
            avecConcerts++;
          } else {
            sansConcerts++;
          }
          
          // Count venue types
          if (lieu.type === 'festival') festivals++;
          else if (lieu.type === 'salle') salles++;
          else if (lieu.type === 'bar') bars++;
          else if (lieu.type === 'plateau') plateaux++;
        });
        
        setStats({
          total: lieuxData.length,
          avecConcerts,
          sansConcerts,
          festivals,
          salles,
          bars,
          plateaux
        });
        
        setLieux(lieuxData);
      } catch (error) {
        console.error('Erreur lors de la récupération des lieux:', error);
        setError('Impossible de charger les lieux. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
  }, []);

  return {
    lieux,
    loading,
    error,
    stats,
    setLieux
  };
};

export default useLieuxQuery;