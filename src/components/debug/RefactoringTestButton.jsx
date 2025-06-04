import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Bouton de test pour basculer entre l'ancienne et la nouvelle version de ConcertDetails
 */
const RefactoringTestButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRefactored, setIsRefactored] = useState(location.pathname.includes('/refactored'));
  
  // Détecter le type de page actuel
  const concertMatch = location.pathname.match(/^\/concerts\/([^/]+)(\/refactored)?$/);
  const artisteMatch = location.pathname.match(/^\/artistes\/([^/]+)(\/refactored)?$/);
  const lieuMatch = location.pathname.match(/^\/lieux\/([^/]+)(\/refactored)?$/);
  const contactMatch = location.pathname.match(/^\/contacts\/([^/]+)(\/refactored)?$/);
  const structureMatch = location.pathname.match(/^\/structures\/([^/]+)(\/refactored)?$/);
  
  const isDetailsPage = concertMatch || artisteMatch || lieuMatch || contactMatch || structureMatch;
  
  // Afficher un message si pas sur une page de détails
  if (!isDetailsPage) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: '#f3f4f6',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          color: '#4b5563'
        }}
      >
        <i className="bi bi-info-circle me-2"></i>
        Naviguez vers une page de détails pour tester le refactoring
      </div>
    );
  }
  
  const handleToggle = () => {
    const pathParts = location.pathname.split('/');
    const entityType = pathParts[1]; // concerts ou artistes
    const entityId = pathParts[2];
    
    if (isRefactored) {
      navigate(`/${entityType}/${entityId}`);
    } else {
      navigate(`/${entityType}/${entityId}/refactored`);
    }
    
    setIsRefactored(!isRefactored);
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 9999
      }}
    >
      <button
        onClick={handleToggle}
        style={{
          padding: '12px 20px',
          backgroundColor: isRefactored ? '#22c55e' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
      >
        <i className={`bi ${isRefactored ? 'bi-check-circle' : 'bi-arrow-repeat'}`}></i>
        {isRefactored ? 'Version Refactorisée' : 'Version Originale'}
      </button>
      
      {isRefactored && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '0',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#16a34a',
            whiteSpace: 'nowrap'
          }}
        >
          ✨ Nouvelle version sans boucles infinies
        </div>
      )}
    </div>
  );
};

export default RefactoringTestButton;