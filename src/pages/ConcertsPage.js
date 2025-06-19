import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DatesList from '@/components/concerts/DatesList.js';

function ConcertsPage() {
  const location = useLocation();
  
  // Log pour suivre chaque rendu de ConcertsPage et l'URL active
  useEffect(() => {
    console.log('ConcertsPage rendered at:', location.pathname);
    return () => {
    };
  }, [location.pathname]);
  
  return (
    <div className="concerts-page">
      <DatesList />
    </div>
  );
}

export default ConcertsPage;
