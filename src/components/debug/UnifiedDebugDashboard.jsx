/**
 * 🚀 Dashboard de Debug Unifié TourCraft
 * Combine tous les outils de monitoring et debug en une interface unique
 * - Performance Firebase
 * - Cache de persistance
 * - Tests et diagnostics
 * - Monitoring temps réel
 */

import React, { useState, useEffect, useCallback } from 'react';
import FirestoreService from '@/services/firestoreService';
import persistenceService, { CACHE_STRATEGIES } from '@/services/persistenceService';
import { utilityCache } from '@/utils/networkStabilizer';

const UnifiedDebugDashboard = () => {
  // États principaux
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('cache');
  const [refreshInterval, setRefreshInterval] = useState(1000);
  
  // États pour Firebase Performance
  const [firebaseStats, setFirebaseStats] = useState({});
  const [lastRequests, setLastRequests] = useState([]);
  const [slowRequests, setSlowRequests] = useState([]);
  
  // États pour Cache Persistance
  const [persistenceStats, setPersistenceStats] = useState({});
  const [testResults, setTestResults] = useState([]);
  
  // États pour Utility Cache
  const [utilityStats, setUtilityStats] = useState({});

  // 🔄 Mise à jour des statistiques Firebase
  const updateFirebaseStats = useCallback(() => {
    if (FirestoreService.getCacheStats) {
      setFirebaseStats(FirestoreService.getCacheStats());
    }
  }, []);

  // 🔄 Mise à jour des statistiques de persistance
  const updatePersistenceStats = useCallback(() => {
    const stats = persistenceService.getStats();
    setPersistenceStats({
      ...stats,
      timestamp: Date.now()
    });
  }, []);

  // 🔄 Mise à jour des statistiques utilitaires
  const updateUtilityStats = useCallback(() => {
    setUtilityStats({
      size: utilityCache.cache?.size || 0,
      timestamp: Date.now()
    });
  }, []);

  // 🔄 Mise à jour globale
  const updateAllStats = useCallback(() => {
    updateFirebaseStats();
    updatePersistenceStats();
    updateUtilityStats();
  }, [updateFirebaseStats, updatePersistenceStats, updateUtilityStats]);

  // 📊 Monitoring des requêtes Firebase
  useEffect(() => {
    if (!isVisible || process.env.NODE_ENV === 'production') return;

    // Patch Firebase pour monitoring
    const originalGetDocument = FirestoreService.getDocument;
    const originalGetDocuments = FirestoreService.getDocuments;

    const monitorRequest = async (type, collection, id, func, ...args) => {
      const start = performance.now();
      let result;
      
      try {
        result = await func(...args);
        const end = performance.now();
        const duration = end - start;
        
        const requestDetails = {
          type,
          collection,
          id: id || 'N/A',
          duration: Math.round(duration),
          timestamp: new Date().toISOString(),
          fromCache: false, // TODO: détecter cache hit
          slow: duration > 300
        };
        
        setLastRequests(prev => [requestDetails, ...prev].slice(0, 20));
        
        if (duration > 300) {
          setSlowRequests(prev => [requestDetails, ...prev].slice(0, 10));
        }
        
        return result;
      } catch (error) {
        console.error(`Erreur dans ${type}:`, error);
        throw error;
      }
    };

    // Remplacer les méthodes
    if (originalGetDocument) {
      FirestoreService.getDocument = async (collectionName, documentId, ...args) => {
        return monitorRequest('getDocument', collectionName, documentId, originalGetDocument.bind(FirestoreService), collectionName, documentId, ...args);
      };
    }

    if (originalGetDocuments) {
      FirestoreService.getDocuments = async (collectionName, queryOptions, ...args) => {
        return monitorRequest('getDocuments', collectionName, null, originalGetDocuments.bind(FirestoreService), collectionName, queryOptions, ...args);
      };
    }

    return () => {
      // Restaurer les fonctions originales
      if (originalGetDocument) FirestoreService.getDocument = originalGetDocument;
      if (originalGetDocuments) FirestoreService.getDocuments = originalGetDocuments;
    };
  }, [isVisible]);

  // ⏰ Auto-refresh
  useEffect(() => {
    if (!isVisible) return;

    updateAllStats();
    const interval = setInterval(updateAllStats, refreshInterval);
    return () => clearInterval(interval);
  }, [isVisible, refreshInterval, updateAllStats]);

  // 🧪 Tests de performance
  const runPerformanceTest = useCallback(async () => {
    const testName = `Test ${new Date().toLocaleTimeString()}`;
    const iterations = 1000;
    
    persistenceService.resetStats();
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      persistenceService.set(`test_${i}`, { data: i, timestamp: Date.now() }, CACHE_STRATEGIES.MEMORY_ONLY);
      persistenceService.get(`test_${i}`, CACHE_STRATEGIES.MEMORY_ONLY);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const finalStats = persistenceService.getStats();
    
    const result = {
      name: testName,
      duration: Math.round(duration * 100) / 100,
      iterations,
      opsPerSecond: Math.round((iterations * 2 / duration) * 1000),
      hitRate: finalStats.hitRate,
      memorySize: finalStats.memorySize
    };
    
    setTestResults(prev => [result, ...prev.slice(0, 9)]);
    persistenceService.cleanup();
  }, []);

  // 🧪 Test des stratégies
  const testAllStrategies = useCallback(() => {
    const strategies = [
      { strategy: CACHE_STRATEGIES.MEMORY_ONLY, name: 'MEMORY_ONLY' },
      { strategy: CACHE_STRATEGIES.SESSION_ONLY, name: 'SESSION_ONLY' },
      { strategy: CACHE_STRATEGIES.LOCAL_ONLY, name: 'LOCAL_ONLY' },
      { strategy: CACHE_STRATEGIES.MEMORY_SESSION, name: 'MEMORY_SESSION' },
      { strategy: CACHE_STRATEGIES.MEMORY_LOCAL, name: 'MEMORY_LOCAL' },
      { strategy: CACHE_STRATEGIES.TTL, name: 'TTL' }
    ];
    
    const results = strategies.map(({ strategy, name }) => {
      const testData = { test: name, timestamp: Date.now() };
      const key = `strategy_test_${name}`;
      
      const setResult = persistenceService.set(key, testData, strategy);
      const getResult = persistenceService.get(key, strategy);
      
      return {
        strategy: name,
        setSuccess: setResult,
        getSuccess: getResult !== null,
        dataIntegrity: JSON.stringify(getResult) === JSON.stringify(testData)
      };
    });
    
    console.log('🧪 Tests de stratégies:', results);
    return results;
  }, []);

  // 🧹 Nettoyage
  const cleanup = useCallback(() => {
    const cleaned = persistenceService.cleanup();
    if (FirestoreService.clearCache) {
      FirestoreService.clearCache();
    }
    console.log(`🧹 Nettoyage: ${cleaned} entrées supprimées`);
    updateAllStats();
  }, [updateAllStats]);

  // 🔄 Reset
  const resetAll = useCallback(() => {
    persistenceService.resetStats();
    setTestResults([]);
    setLastRequests([]);
    setSlowRequests([]);
    updateAllStats();
  }, [updateAllStats]);

  // 🎨 Styles
  const styles = {
    toggleButton: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999
    },
    showButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '12px 16px',
      borderRadius: '25px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    dashboard: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '500px',
      maxHeight: '80vh',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      zIndex: 9998,
      overflow: 'hidden',
      border: '1px solid #e0e0e0'
    },
    header: {
      padding: '16px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      margin: 0,
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333'
    },
    controls: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    select: {
      padding: '4px 8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '12px'
    },
    button: {
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#007bff',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    closeButton: {
      padding: '4px 8px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: '#dc3545',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px'
    },
    tabs: {
      display: 'flex',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e0e0e0'
    },
    tab: {
      flex: 1,
      padding: '12px 16px',
      textAlign: 'center',
      cursor: 'pointer',
      borderBottom: '3px solid transparent',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.2s'
    },
    activeTab: {
      borderBottom: '3px solid #007bff',
      backgroundColor: 'white',
      color: '#007bff'
    },
    content: {
      padding: '20px',
      maxHeight: '60vh',
      overflow: 'auto'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    card: {
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    },
    cardTitle: {
      margin: '0 0 12px 0',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#333'
    },
    stat: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '13px'
    },
    label: {
      color: '#666'
    },
    value: {
      fontWeight: 'bold',
      color: '#333'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12px'
    },
    th: {
      padding: '8px',
      textAlign: 'left',
      borderBottom: '2px solid #e0e0e0',
      backgroundColor: '#f8f9fa',
      fontWeight: 'bold'
    },
    td: {
      padding: '6px 8px',
      borderBottom: '1px solid #e0e0e0'
    },
    slowRow: {
      backgroundColor: '#fff3f3'
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isVisible) {
    return (
      <div style={styles.toggleButton}>
        <button 
          onClick={() => setIsVisible(true)}
          style={styles.showButton}
          title="Ouvrir le Dashboard de Debug"
        >
          🚀 Debug Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>🚀 Debug Dashboard</h3>
        <div style={styles.controls}>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={styles.select}
          >
            <option value={500}>0.5s</option>
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
          </select>
          <button onClick={cleanup} style={styles.button}>🧹</button>
          <button onClick={resetAll} style={styles.button}>🔄</button>
          <button onClick={() => setIsVisible(false)} style={styles.closeButton}>✕</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'cache', label: '📊 Cache', icon: '📊' },
          { id: 'firebase', label: '🔥 Firebase', icon: '🔥' },
          { id: 'tests', label: '🧪 Tests', icon: '🧪' },
          { id: 'requests', label: '📡 Requêtes', icon: '📡' }
        ].map(tab => (
          <div
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Onglet Cache */}
        {activeTab === 'cache' && (
          <div>
            <div style={styles.grid}>
              <div style={styles.card}>
                <h4 style={styles.cardTitle}>📊 Persistance Service</h4>
                <div style={styles.stat}>
                  <span style={styles.label}>Hits:</span>
                  <span style={styles.value}>{persistenceStats.hits || 0}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.label}>Misses:</span>
                  <span style={styles.value}>{persistenceStats.misses || 0}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.label}>Hit Rate:</span>
                  <span style={styles.value}>
                    {((persistenceStats.hitRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.label}>Memory Size:</span>
                  <span style={styles.value}>{persistenceStats.memorySize || 0}</span>
                </div>
              </div>

              <div style={styles.card}>
                <h4 style={styles.cardTitle}>🔧 Utility Cache</h4>
                <div style={styles.stat}>
                  <span style={styles.label}>Size:</span>
                  <span style={styles.value}>{utilityStats.size || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Firebase */}
        {activeTab === 'firebase' && (
          <div>
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>🔥 Firebase Cache</h4>
              <div style={styles.stat}>
                <span style={styles.label}>Hit Rate:</span>
                <span style={styles.value}>{firebaseStats.hitRate || '0%'}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.label}>Hits:</span>
                <span style={styles.value}>{firebaseStats.hits || 0}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.label}>Misses:</span>
                <span style={styles.value}>{firebaseStats.misses || 0}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.label}>Size:</span>
                <span style={styles.value}>{firebaseStats.size || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Tests */}
        {activeTab === 'tests' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button onClick={runPerformanceTest} style={styles.button}>
                🚀 Test Performance (1000 ops)
              </button>
              <button onClick={testAllStrategies} style={{...styles.button, marginLeft: '8px'}}>
                🧪 Test Stratégies
              </button>
            </div>

            {testResults.length > 0 && (
              <div style={styles.card}>
                <h4 style={styles.cardTitle}>📈 Résultats Tests</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Test</th>
                      <th style={styles.th}>Durée (ms)</th>
                      <th style={styles.th}>Ops/sec</th>
                      <th style={styles.th}>Hit Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{result.name}</td>
                        <td style={styles.td}>{result.duration}</td>
                        <td style={styles.td}>{result.opsPerSecond}</td>
                        <td style={styles.td}>{(result.hitRate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Onglet Requêtes */}
        {activeTab === 'requests' && (
          <div>
            {/* Requêtes récentes */}
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>📡 Requêtes Récentes</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Collection</th>
                    <th style={styles.th}>Durée (ms)</th>
                    <th style={styles.th}>Cache</th>
                  </tr>
                </thead>
                <tbody>
                  {lastRequests.slice(0, 10).map((req, index) => (
                    <tr key={index} style={req.slow ? styles.slowRow : {}}>
                      <td style={styles.td}>{req.type}</td>
                      <td style={styles.td}>{req.collection}</td>
                      <td style={styles.td}>{req.duration}</td>
                      <td style={styles.td}>{req.fromCache ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Requêtes lentes */}
            {slowRequests.length > 0 && (
              <div style={{...styles.card, marginTop: '16px'}}>
                <h4 style={styles.cardTitle}>🐌 Requêtes Lentes (&gt;300ms)</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Collection</th>
                      <th style={styles.th}>Durée (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slowRequests.map((req, index) => (
                      <tr key={index} style={styles.slowRow}>
                        <td style={styles.td}>{req.type}</td>
                        <td style={styles.td}>{req.collection}</td>
                        <td style={styles.td}>
                          {req.duration}
                          {req.duration > 1000 && <span style={{marginLeft: '5px'}}>🔥</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDebugDashboard; 