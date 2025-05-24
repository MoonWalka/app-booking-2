import React, { useState, useEffect } from 'react';
import FirestoreService from '../../services/firestoreService';
import '@styles/index.css';; // Importer les styles typographiques standards

/**
 * Composant pour surveiller les performances des requêtes et l'utilisation du cache
 * À n'utiliser qu'en développement
 */
const PerformanceMonitor = () => {
  const [stats, setStats] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [lastRequests, setLastRequests] = useState([]);
  const [slowRequests, setSlowRequests] = useState([]);
  
  // Récupérer les statistiques du cache périodiquement
  useEffect(() => {
    // Ne pas exécuter en production
    if (process.env.NODE_ENV === 'production') return;
    
    // Monitorer les performances de Firebase
    const startMonitoring = () => {
      // Patch des méthodes Firebase pour surveiller les temps de requête
      const originalGetDocument = FirestoreService.getDocument;
      const originalGetDocuments = FirestoreService.getDocuments;
      
      // Wrapper pour mesurer le temps des requêtes
      const monitorRequest = async (type, collection, id, func, ...args) => {
        const start = performance.now();
        let isCached = false;
        let result;
        
        try {
          // Avant la requête, vérifier si c'est un cache hit
          if (type === 'getDocument') {
            isCached = !!FirestoreService.getCacheStats().hits;
          }
          
          result = await func(...args);
          
          const end = performance.now();
          const duration = end - start;
          
          // Enregistrer la requête dans l'historique
          const requestDetails = {
            type,
            collection,
            id: id || 'N/A',
            duration: Math.round(duration),
            timestamp: new Date().toISOString(),
            fromCache: isCached,
            slow: duration > 300 // Considérer une requête comme lente si > 300ms
          };
          
          setLastRequests(prev => {
            const updated = [requestDetails, ...prev].slice(0, 20); // Garder les 20 dernières
            return updated;
          });
          
          // Enregistrer les requêtes lentes
          if (duration > 300) {
            setSlowRequests(prev => {
              const updated = [requestDetails, ...prev].slice(0, 10); // Garder les 10 plus lentes
              return updated;
            });
          }
          
          return result;
        } catch (error) {
          console.error(`Erreur dans ${type}:`, error);
          throw error;
        }
      };
      
      // Remplacer les méthodes originales par des versions monitorées
      FirestoreService.getDocument = async (collectionName, documentId, ...args) => {
        return monitorRequest('getDocument', collectionName, documentId, originalGetDocument.bind(FirestoreService), collectionName, documentId, ...args);
      };
      
      FirestoreService.getDocuments = async (collectionName, queryOptions, ...args) => {
        return monitorRequest('getDocuments', collectionName, null, originalGetDocuments.bind(FirestoreService), collectionName, queryOptions, ...args);
      };
      
      return () => {
        // Restaurer les fonctions originales lors du nettoyage
        FirestoreService.getDocument = originalGetDocument;
        FirestoreService.getDocuments = originalGetDocuments;
      };
    };
    
    const cleanup = startMonitoring();
    
    // Récupérer les statistiques du cache toutes les 5 secondes
    const interval = setInterval(() => {
      setStats(FirestoreService.getCacheStats());
    }, 5000);
    
    return () => {
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, []);
  
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
  
  // États pour les onglets
  const [activeTab, setActiveTab] = useState('cache');
  
  if (process.env.NODE_ENV === 'production') {
    return null; // Ne pas afficher en production
  }
  
  return (
    <>
      <div 
        style={floatingButtonStyle}
        onClick={() => setIsOpen(!isOpen)}
        title="Moniteur de performances"
        className="tc-text-md"
      >
        {stats.hitRate || '...'}
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
              <strong>Taux de cache:</strong> {stats.hitRate || '0%'}
            </div>
            <div style={{ marginBottom: '10px' }} className="tc-text-md">
              <strong>Cache hits:</strong> {stats.hits || 0}
            </div>
            <div style={{ marginBottom: '10px' }} className="tc-text-md">
              <strong>Cache misses:</strong> {stats.misses || 0}
            </div>
            <div style={{ marginBottom: '10px' }} className="tc-text-md">
              <strong>Taille du cache:</strong> {stats.size || 0} éléments
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
                marginTop: '10px'
              }}
              onClick={() => {
                FirestoreService.clearCache();
                setStats(FirestoreService.getCacheStats());
              }}
            >
              Vider le cache
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
                    <th className="tc-text-left" style={{ padding: '5px' }}>Type</th>
                    <th className="tc-text-left" style={{ padding: '5px' }}>Collection</th>
                    <th className="tc-text-right" style={{ padding: '5px' }}>Durée (ms)</th>
                    <th className="tc-text-center" style={{ padding: '5px' }}>Cache</th>
                  </tr>
                </thead>
                <tbody>
                  {lastRequests.map((req, index) => (
                    <tr key={index} style={{ backgroundColor: req.slow ? '#fff3f3' : 'transparent' }}>
                      <td style={{ padding: '5px' }}>{req.type}</td>
                      <td style={{ padding: '5px' }}>{req.collection}</td>
                      <td className="tc-text-right" style={{ padding: '5px' }}>{req.duration}</td>
                      <td className="tc-text-center" style={{ padding: '5px' }}>{req.fromCache ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th className="tc-text-left" style={{ padding: '5px' }}>Type</th>
                    <th className="tc-text-left" style={{ padding: '5px' }}>Collection</th>
                    <th className="tc-text-left" style={{ padding: '5px' }}>ID</th>
                    <th className="tc-text-right" style={{ padding: '5px' }}>Durée (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {slowRequests.map((req, index) => (
                    <tr key={index} style={{ backgroundColor: req.duration > 1000 ? '#ffdddd' : '#fff3f3' }}>
                      <td style={{ padding: '5px' }}>{req.type}</td>
                      <td style={{ padding: '5px' }}>{req.collection}</td>
                      <td style={{ padding: '5px' }}>{req.id}</td>
                      <td 
                        className={`tc-text-right ${req.duration > 1000 ? 'tc-font-bold tc-text-danger' : 'tc-font-normal'}`}
                        style={{ padding: '5px' }}
                        title={`Durée: ${req.duration}ms ${req.duration > 1000 ? '(TRÈS LENT)' : req.duration > 500 ? '(Lent)' : ''}`}
                      >
                        {req.duration}ms
                        {req.duration > 1000 && <span style={{ marginLeft: '5px', color: 'red' }}>🔥</span>}
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

export default PerformanceMonitor;