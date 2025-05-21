// src/components/debug/PerformanceMonitorEnhanced.js
import React, { useState, useEffect } from 'react';
import FirestoreService from '@/services/firestoreService';
import logger from '@/services/loggerService';
import cacheService from '@/services/cacheService';
import '@styles/index.css';

/**
 * Version améliorée du moniteur de performance qui intègre le service de logging
 * À n'utiliser qu'en développement
 */
const PerformanceMonitorEnhanced = ({ enabled = true }) => {
  const [stats, setStats] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [lastRequests, setLastRequests] = useState([]);
  const [slowRequests, setSlowRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('cache');
  
  // Récupérer les statistiques du cache périodiquement
  useEffect(() => {
    // Ne pas exécuter en production ou si désactivé
    if (process.env.NODE_ENV === 'production' || !enabled) return;
    
    // Monitorer les performances via le logger
    const removeListener = logger.addListener((event) => {
      if (event.type === 'performance') {
        // Enregistrer la requête dans l'historique
        const requestDetails = {
          type: 'performance',
          collection: event.details?.collection || 'N/A',
          id: event.details?.id || 'N/A',
          duration: Math.round(event.durationMs),
          operation: event.operationName,
          timestamp: new Date().toISOString(),
          fromCache: event.details?.fromCache || false,
          slow: event.durationMs > 300 // Considérer une requête comme lente si > 300ms
        };
        
        setLastRequests(prev => {
          const updated = [requestDetails, ...prev].slice(0, 20); // Garder les 20 dernières
          return updated;
        });
        
        // Enregistrer les requêtes lentes
        if (event.durationMs > 300) {
          setSlowRequests(prev => {
            const updated = [requestDetails, ...prev].slice(0, 10); // Garder les 10 plus lentes
            return updated;
          });
        }
      }
    });
    
    // Surveiller les stats de cache
    const interval = setInterval(() => {
      // Récupérer les stats de Firestore Cache
      const firestoreStats = FirestoreService.getCacheStats ? FirestoreService.getCacheStats() : {};
      
      // Récupérer les stats du nouveau cache
      const serviceStats = cacheService.getStats ? cacheService.getStats() : {};
      
      // Combiner les statistiques
      setStats({
        ...firestoreStats,
        ...serviceStats,
        combinedHitRate: calculateCombinedHitRate(firestoreStats, serviceStats)
      });
    }, 5000);
    
    return () => {
      clearInterval(interval);
      removeListener();
    };
  }, [enabled]);
  
  // Calculer le taux de hit combiné
  const calculateCombinedHitRate = (fsStats, serviceStats) => {
    const totalHits = (fsStats.hits || 0) + (serviceStats.hits || 0);
    const totalMisses = (fsStats.misses || 0) + (serviceStats.misses || 0);
    
    if (totalHits + totalMisses === 0) return '0%';
    return `${Math.round((totalHits / (totalHits + totalMisses)) * 100)}%`;
  };
  
  // Style pour le bouton flottant
  const floatingButtonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    zIndex: 9999
  };
  
  // Style pour le panneau
  const panelStyle = {
    position: 'fixed',
    bottom: isOpen ? '80px' : '-500px',
    right: '20px',
    width: '400px',
    maxHeight: '500px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)',
    padding: '15px',
    transition: 'bottom 0.3s ease',
    overflow: 'auto',
    zIndex: 9998
  };
  
  const tabStyle = {
    padding: '8px 15px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent'
  };
  
  const activeTabStyle = {
    ...tabStyle,
    borderBottom: '2px solid #007bff',
    fontWeight: 'bold'
  };
  
  if (process.env.NODE_ENV === 'production' || !enabled) {
    return null; // Ne pas afficher en production ou si désactivé
  }
  
  return (
    <>
      <div 
        style={floatingButtonStyle}
        onClick={() => setIsOpen(!isOpen)}
        title="Moniteur de performances amélioré"
        className="tc-text-md"
      >
        {stats.combinedHitRate || stats.hitRate || '...'}
      </div>
      
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 className="tc-h3" style={{ margin: '0' }}>Moniteur de performances</h3>
          <button 
            style={{ 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer'
            }}
            className="tc-text-md"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>
        
        <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
          <div 
            style={activeTab === 'cache' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('cache')}
          >
            Cache
          </div>
          <div 
            style={activeTab === 'requests' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('requests')}
          >
            Requêtes récentes
          </div>
          <div 
            style={activeTab === 'slow' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('slow')}
          >
            Requêtes lentes
          </div>
        </div>
        
        {activeTab === 'cache' && (
          <div>
            <div style={{ marginBottom: '10px' }} className="tc-text-md">
              <strong>Taux de cache combiné:</strong> {stats.combinedHitRate || '0%'}
            </div>
            <div style={{ marginBottom: '10px' }} className="tc-text-md">
              <strong>Cache hits:</strong> {(stats.hits || 0) + (stats.serviceHits || 0)}
            </div>
            <div style={{ marginBottom: '10px' }} className="tc-text-md">
              <strong>Cache misses:</strong> {(stats.misses || 0) + (stats.serviceMisses || 0)}
            </div>
            <div style={{ marginBottom: '10px' }} className="tc-text-md">
              <strong>Taille du cache:</strong> {(stats.size || 0) + (stats.serviceSize || 0)} éléments
            </div>
            <div style={{ marginBottom: '10px' }} className="tc-text-md">
              <strong>Dernier nettoyage:</strong> il y a {stats.timeSinceCleanup || 0} secondes
            </div>
            
            <button 
              style={{ 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                padding: '8px 15px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginTop: '10px',
                marginRight: '10px'
              }}
              onClick={() => {
                if (FirestoreService.clearCache) {
                  FirestoreService.clearCache();
                }
                setStats(prev => ({ ...prev, cleared: true }));
              }}
            >
              Vider le cache Firestore
            </button>
            
            <button 
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '8px 15px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginTop: '10px'
              }}
              onClick={() => {
                if (cacheService.clear) {
                  cacheService.clear();
                }
                setStats(prev => ({ ...prev, cleared: true }));
              }}
            >
              Vider le cache Service
            </button>
          </div>
        )}
        
        {activeTab === 'requests' && (
          <div>
            <h4 className="tc-h4">20 dernières requêtes</h4>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="tc-table-header">
                    <th className="tc-text-left" style={{ padding: '5px' }}>Operation</th>
                    <th className="tc-text-left" style={{ padding: '5px' }}>Collection</th>
                    <th className="tc-text-right" style={{ padding: '5px' }}>Durée (ms)</th>
                    <th className="tc-text-center" style={{ padding: '5px' }}>Cache</th>
                  </tr>
                </thead>
                <tbody>
                  {lastRequests.map((req, index) => (
                    <tr key={index} style={{ backgroundColor: req.slow ? '#fff3f3' : 'transparent' }}>
                      <td style={{ padding: '5px' }}>{req.operation}</td>
                      <td style={{ padding: '5px' }}>{req.collection}</td>
                      <td className="tc-text-right" style={{ padding: '5px' }}>{req.duration}</td>
                      <td className="tc-text-center" style={{ padding: '5px' }}>{req.fromCache ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {lastRequests.length === 0 && (
                <p className="tc-text-center tc-text-muted">Aucune requête enregistrée</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'slow' && (
          <div>
            <h4 className="tc-h4">Requêtes lentes (&gt;300ms)</h4>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="tc-table-header">
                    <th className="tc-text-left" style={{ padding: '5px' }}>Operation</th>
                    <th className="tc-text-left" style={{ padding: '5px' }}>Collection</th>
                    <th className="tc-text-right" style={{ padding: '5px' }}>Durée (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {slowRequests.map((req, index) => (
                    <tr key={index} style={{ backgroundColor: req.duration > 1000 ? '#ffdddd' : '#fff3f3' }}>
                      <td style={{ padding: '5px' }}>{req.operation}</td>
                      <td style={{ padding: '5px' }}>{req.collection}</td>
                      <td className="tc-text-right" style={{ padding: '5px', fontWeight: req.duration > 1000 ? 'bold' : 'normal' }}>
                        {req.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {slowRequests.length === 0 && (
                <p className="tc-text-center tc-text-muted">Aucune requête lente détectée</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PerformanceMonitorEnhanced;
