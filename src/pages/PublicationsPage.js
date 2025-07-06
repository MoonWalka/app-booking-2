import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PublicationsList from '@/components/dates/PublicationsList.js';

function PublicationsPage() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('PublicationsPage rendered at:', location.pathname);
    return () => {
    };
  }, [location.pathname]);
  
  return (
    <div className="publications-page">
      <PublicationsList />
    </div>
  );
}

export default PublicationsPage;