import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DatesList from '@/components/dates/desktop/DatesList.js';

function DatesPage() {
  console.log('[DatesPage] ========= COMPOSANT DATES PAGE MONTÉ =========');
  const location = useLocation();
  
  // Log pour suivre chaque rendu de DatesPage et l'URL active
  useEffect(() => {
    console.log('[DatesPage] useEffect - rendered at:', location.pathname);
    return () => {
      console.log('[DatesPage] useEffect cleanup');
    };
  }, [location.pathname]);
  
  return (
    <div className="dates-page">
      <DatesList />
    </div>
  );
}

export default DatesPage;
