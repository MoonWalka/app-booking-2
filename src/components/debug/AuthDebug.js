import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';

/**
 * 🔍 Composant de Debug Authentification
 * 
 * Affiche l'état en temps réel de l'authentification pour diagnostiquer les boucles
 */
const AuthDebug = () => {
  const auth = useAuth();
  const location = useLocation();

  if (process.env.NODE_ENV === 'production') {
    return null; // Ne pas afficher en production
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#f8f9fa',
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        opacity: 0.9
      }}
    >
      <h6 style={{ margin: 0, color: '#007bff' }}>🔍 Auth Debug</h6>
      <hr style={{ margin: '5px 0' }} />
      
      <div><strong>Route:</strong> {location.pathname}</div>
      <div><strong>Initialized:</strong> {auth.initialized ? '✅' : '❌'}</div>
      <div><strong>Loading:</strong> {auth.loading ? '🔄' : '✅'}</div>
      <div><strong>Authenticated:</strong> {auth.isAuthenticated ? '✅' : '❌'}</div>
      <div><strong>User:</strong> {auth.currentUser?.email || 'None'}</div>
      <div><strong>UID:</strong> {auth.currentUser?.uid || 'None'}</div>
      <div><strong>Admin:</strong> {auth.isAdmin ? '✅' : '❌'}</div>
      
      <hr style={{ margin: '5px 0' }} />
      <div style={{ fontSize: '10px', color: '#666' }}>
        Timestamp: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AuthDebug; 