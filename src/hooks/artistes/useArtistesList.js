// src/hooks/artistes/useArtistesList.js
import { useState, useEffect } from 'react';
import { 
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Custom hook to fetch and paginate artist list data
 * @param {number} pageSize - Number of artists to load per page
 * @param {string} sortByField - Field to sort by
 * @param {string} sortDirection - Sort direction ('asc' or 'desc')
 * @returns {Object} - Artists data and loading state
 */
export const useArtistesList = (pageSize = 20, sortByField = 'nom', sortDirection = 'asc') => {
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0
  });

  // Function to calculate statistics from artists data
  const calculateStats = async () => {
    try {
      const allDataQuery = query(collection(db, 'artistes'));
      const allDataSnapshot = await getDocs(allDataQuery);
      
      let avecConcerts = 0;
      let sansConcerts = 0;
      
      allDataSnapshot.forEach(doc => {
        const artisteData = doc.data();
        if (artisteData.concertsAssocies && artisteData.concertsAssocies.length > 0) {
          avecConcerts++;
        } else {
          sansConcerts++;
        }
      });
      
      setStats({
        total: allDataSnapshot.size,
        avecConcerts,
        sansConcerts
      });
    } catch (error) {
      console.error('Error calculating artist statistics:', error);
    }
  };

  // Function to load artists with pagination
  const fetchArtistes = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setLastVisible(null);
    }
    
    try {
      let q;
      if (reset || !lastVisible) {
        // Initial load or reset
        q = query(collection(db, 'artistes'), orderBy(sortByField, sortDirection), limit(pageSize));
      } else {
        // Load next page
        q = query(collection(db, 'artistes'), orderBy(sortByField, sortDirection), startAfter(lastVisible), limit(pageSize));
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        if (!reset) return; // No more results to load
      } else {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length >= pageSize);
      }
      
      const fetchedArtistes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (reset) {
        setArtistes(fetchedArtistes);
        calculateStats(); // Calculate stats on initial load
      } else {
        setArtistes(prevArtistes => [...prevArtistes, ...fetchedArtistes]);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to load more artists (pagination)
  const loadMoreArtistes = () => {
    if (hasMore && !loading) {
      fetchArtistes(false);
    }
  };

  // Effect to load artists when sort parameters change
  useEffect(() => {
    fetchArtistes();
  }, [sortByField, sortDirection]);

  return {
    artistes,
    loading,
    stats,
    hasMore,
    loadMoreArtistes,
    fetchArtistes,
    setArtistes
  };
};

export default useArtistesList;