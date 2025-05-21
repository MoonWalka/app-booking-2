import { useState, useEffect } from 'react';
import { formatDateFr } from '@/utils/dateUtils';

/**
 * Hook to manage concert filtering functionality
 */
export const useConcertFilters = (concerts) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredConcerts, setFilteredConcerts] = useState([]);

  // Effect to filter concerts based on search term and status
  useEffect(() => {
    if (!concerts) {
      setFilteredConcerts([]);
      return;
    }
    
    let results = [...concerts];
    
    // Filter by status (ignore accents, case-insensitive), treat 'all' as no filter
    if (statusFilter && statusFilter !== 'all') {
      const normalize = str => str
        ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        : '';
      results = results.filter(concert => normalize(concert.statut) === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(concert => 
        concert.titre?.toLowerCase().includes(term) ||
        concert.lieuNom?.toLowerCase().includes(term) ||
        concert.programmateurNom?.toLowerCase().includes(term) ||
        concert.artisteNom?.toLowerCase().includes(term) ||
        (concert.lieuVille && concert.lieuVille.toLowerCase().includes(term)) ||
        (concert.lieuCodePostal && concert.lieuCodePostal.includes(term)) ||
        formatDateFr(concert.date).includes(term)
      );
    }
    
    setFilteredConcerts(results);
  }, [searchTerm, statusFilter, concerts]);

  // Helper function to check if a concert date is in the past
  const isDatePassed = (date) => {
    if (!date) return false;
    const today = new Date();
    const concertDate = new Date(date.seconds ? date.seconds * 1000 : date);
    return concertDate < today;
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredConcerts,
    isDatePassed
  };
};

export default useConcertFilters;