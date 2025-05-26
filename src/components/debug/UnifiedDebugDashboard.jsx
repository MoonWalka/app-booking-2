/**
 * 🚀 Dashboard de Debug Unifié TourCraft
 * Combine tous les outils de monitoring et debug en une interface unique
 * - Performance Firebase
 * - Cache de persistance
 * - Tests et diagnostics
 * - Monitoring temps réel
 * - Diagnostic de navigation
 * - Tests de navigation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigationType, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  
  // États pour Navigation Diagnostic
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  
  const [navLogs, setNavLogs] = useState([]);
  const [navRenderCount, setNavRenderCount] = useState(0);
  const [navAuthRenderCount, setNavAuthRenderCount] = useState(0);
  const [navLocationChanges, setNavLocationChanges] = useState(0);
  const [navErrors, setNavErrors] = useState([]);
  const [navTestResults, setNavTestResults] = useState([]);
  const [isRunningNavTests, setIsRunningNavTests] = useState(false);
  
  const navRenderCountRef = useRef(0);
  const navAuthRenderCountRef = useRef(0);
  const lastLocationRef = useRef(null);
  const lastAuthStateRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  
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

  // 🧭 Fonctions de diagnostic de navigation
  // Fonction helper pour créer des logs de navigation de manière stable
  const createNavLogEntry = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    return {
      id: Date.now() + Math.random(),
      timestamp,
      message,
      type,
      location: location.pathname
    };
  }, [location.pathname]);

  const addNavLog = useCallback((message, type = 'info') => {
    const logEntry = createNavLogEntry(message, type);
    
    setNavLogs(prev => [...prev.slice(-49), logEntry]); // Garder seulement les 50 derniers logs
    
    if (type === 'error') {
      setNavErrors(prev => [...prev.slice(-9), logEntry]); // Garder les 10 dernières erreurs
    }
  }, [createNavLogEntry]);

  const clearNavLogs = useCallback(() => {
    setNavLogs([]);
    setNavErrors([]);
    setNavRenderCount(0);
    setNavAuthRenderCount(0);
    setNavLocationChanges(0);
    navRenderCountRef.current = 0;
    navAuthRenderCountRef.current = 0;
    startTimeRef.current = Date.now();
  }, []);

  const getNavDiagnostic = useCallback(() => {
    const issues = [];
    
    if (navRenderCount > 30) {
      issues.push(`🚨 Trop de rendus (${navRenderCount}) - Possible boucle infinie`);
    }
    
    if (navAuthRenderCount > 15) {
      issues.push(`🚨 Auth instable (${navAuthRenderCount} changements) - Problème dans AuthContext`);
    }
    
    if (navErrors.length > 5) {
      issues.push(`🚨 Trop d'erreurs (${navErrors.length}) - Vérifier la console`);
    }
    
    const recentRenders = navLogs.filter(log => 
      log.type === 'render' && 
      Date.now() - new Date(`1970-01-01T${log.timestamp}`).getTime() < 5000
    ).length;
    
    if (recentRenders > 10) {
      issues.push(`🚨 Rendus trop fréquents (${recentRenders} en 5s)`);
    }
    
    return issues;
  }, [navRenderCount, navAuthRenderCount, navErrors.length, navLogs]);

  // 🧪 Tests de navigation
  const addNavTestResult = useCallback((test, status, details = '') => {
    const result = {
      id: Date.now(),
      test,
      status, // 'success', 'error', 'warning', 'running'
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setNavTestResults(prev => [...prev, result]);
    return result;
  }, []);

  const runQuickNavTest = useCallback(() => {
    setNavTestResults([]);
    
    // Test rapide de détection d'éléments
    const programmateursElements = document.querySelectorAll('[href*="/programmateurs"]');
    addNavTestResult('Détection liens programmateurs', programmateursElements.length > 0 ? 'success' : 'warning', 
      `${programmateursElements.length} liens trouvés`);
    
    const clickableElements = document.querySelectorAll('.clickableRow, [data-testid*="item"]');
    addNavTestResult('Détection éléments cliquables', clickableElements.length > 0 ? 'success' : 'warning', 
      `${clickableElements.length} éléments trouvés`);
    
    const tableElements = document.querySelectorAll('table, .table');
    addNavTestResult('Détection tables', tableElements.length > 0 ? 'success' : 'warning', 
      `${tableElements.length} tables trouvées`);
    
    // Test de la console pour les erreurs
    const hasConsoleErrors = window.console._errors && window.console._errors.length > 0;
    addNavTestResult('Vérification erreurs console', hasConsoleErrors ? 'error' : 'success', 
      hasConsoleErrors ? 'Erreurs détectées' : 'Pas d\'erreurs');
  }, [addNavTestResult]);

  const runFullNavTest = useCallback(async () => {
    setIsRunningNavTests(true);
    setNavTestResults([]);
    
    try {
      // Test 1: Navigation vers les programmateurs
      addNavTestResult('Navigation vers /programmateurs', 'running');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        navigate('/programmateurs');
        await new Promise(resolve => setTimeout(resolve, 500));
        addNavTestResult('Navigation vers /programmateurs', 'success', 'Navigation réussie');
      } catch (error) {
        addNavTestResult('Navigation vers /programmateurs', 'error', error.message);
      }
      
      // Test 2: Attendre le chargement
      addNavTestResult('Attente du chargement de la liste', 'running');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier si des éléments sont présents
      const listElements = document.querySelectorAll('[data-testid="programmateur-item"], .programmateur-item, .clickableRow');
      if (listElements.length > 0) {
        addNavTestResult('Chargement de la liste', 'success', `${listElements.length} éléments trouvés`);
        
        // Test 3: Clic sur le premier élément
        addNavTestResult('Test de clic sur un élément', 'running');
        try {
          const firstElement = listElements[0];
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          
          firstElement.dispatchEvent(clickEvent);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Vérifier si la navigation a eu lieu
          if (location.pathname.includes('/programmateurs/') && location.pathname !== '/programmateurs') {
            addNavTestResult('Test de clic sur un élément', 'success', `Navigation vers ${location.pathname}`);
          } else {
            addNavTestResult('Test de clic sur un élément', 'warning', 'Pas de navigation détectée');
          }
        } catch (error) {
          addNavTestResult('Test de clic sur un élément', 'error', error.message);
        }
      } else {
        addNavTestResult('Chargement de la liste', 'error', 'Aucun élément de liste trouvé');
      }
      
      // Test 4: Navigation vers d'autres modules
      const modules = [
        { path: '/concerts', name: 'Concerts' },
        { path: '/artistes', name: 'Artistes' },
        { path: '/lieux', name: 'Lieux' }
      ];
      
      for (const module of modules) {
        addNavTestResult(`Navigation vers ${module.name}`, 'running');
        try {
          navigate(module.path);
          await new Promise(resolve => setTimeout(resolve, 300));
          addNavTestResult(`Navigation vers ${module.name}`, 'success', `Route: ${location.pathname}`);
        } catch (error) {
          addNavTestResult(`Navigation vers ${module.name}`, 'error', error.message);
        }
      }
      
      // Test 5: Retour au dashboard
      addNavTestResult('Retour au dashboard', 'running');
      try {
        navigate('/');
        await new Promise(resolve => setTimeout(resolve, 300));
        addNavTestResult('Retour au dashboard', 'success', 'Navigation réussie');
      } catch (error) {
        addNavTestResult('Retour au dashboard', 'error', error.message);
      }
      
    } catch (error) {
      addNavTestResult('Test général', 'error', `Erreur globale: ${error.message}`);
    } finally {
      setIsRunningNavTests(false);
    }
  }, [navigate, location.pathname, addNavTestResult]);

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

  // 🧭 Monitoring de navigation - Compteur de rendus
  useEffect(() => {
    if (!isVisible) return;
    
    navRenderCountRef.current += 1;
    setNavRenderCount(navRenderCountRef.current);
    
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    
    addNavLog(`🔄 Rendu #${navRenderCountRef.current} (${elapsed}ms depuis le début)`, 'render');
    
    // Détecter les boucles de rendu
    if (navRenderCountRef.current > 50) {
      addNavLog(`🚨 ALERTE: Plus de 50 rendus détectés! Possible boucle infinie`, 'error');
    }
  }, [isVisible, addNavLog]);

  // 🧭 Surveillance des changements d'authentification
  useEffect(() => {
    if (!isVisible) return;
    
    navAuthRenderCountRef.current += 1;
    setNavAuthRenderCount(navAuthRenderCountRef.current);
    
    const authState = { currentUser: !!currentUser, loading };
    const authStateStr = JSON.stringify(authState);
    
    if (lastAuthStateRef.current !== authStateStr) {
      addNavLog(`🔐 Auth changé: ${authStateStr}`, 'auth');
      lastAuthStateRef.current = authStateStr;
      
      // Détecter les boucles d'auth
      if (navAuthRenderCountRef.current > 20) {
        addNavLog(`🚨 ALERTE: Plus de 20 changements d'auth! Possible boucle`, 'error');
      }
    }
  }, [currentUser, loading, isVisible, addNavLog]);

  // 🧭 Surveillance des changements de location
  useEffect(() => {
    if (!isVisible) return;
    
    const locationStr = `${location.pathname}${location.search}${location.hash}`;
    
    if (lastLocationRef.current !== locationStr) {
      setNavLocationChanges(prev => prev + 1);
      addNavLog(`🧭 Navigation: ${locationStr} (${navigationType})`, 'navigation');
      lastLocationRef.current = locationStr;
    }
  }, [location, navigationType, isVisible, addNavLog]);

  // 🧭 Surveillance des erreurs console
  useEffect(() => {
    if (!isVisible) return;
    
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      addNavLog(`❌ Erreur: ${args.join(' ')}`, 'error');
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Maximum update depth') || message.includes('boucle')) {
        addNavLog(`⚠️ Warning critique: ${message}`, 'error');
      } else {
        addNavLog(`⚠️ Warning: ${message}`, 'warning');
      }
      originalWarn.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [isVisible, addNavLog]);

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
    // const cleaned = await cleanupService.performCleanup(); // Résultat de débogage - logs supprimés
    persistenceService.cleanup();
    if (FirestoreService.clearCache) {
      FirestoreService.clearCache();
    }
    updateAllStats();
  }, [updateAllStats]);

  // 🔄 Reset
  const resetAll = useCallback(() => {
    persistenceService.resetStats();
    setTestResults([]);
    setLastRequests([]);
    setSlowRequests([]);
    // Reset navigation data
    clearNavLogs();
    setNavTestResults([]);
    updateAllStats();
  }, [updateAllStats, clearNavLogs]);

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

  // Fonction utilitaire pour les couleurs de statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#00ff00';
      case 'error': return '#ff0000';
      case 'warning': return '#ffaa00';
      case 'running': return '#00aaff';
      default: return '#ffffff';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'running': return '⏳';
      default: return '📝';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return '#ff4444';
      case 'warning': return '#ffaa00';
      case 'auth': return '#4444ff';
      case 'navigation': return '#44ff44';
      case 'render': return '#888888';
      default: return '#000000';
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
          { id: 'requests', label: '📡 Requêtes', icon: '📡' },
          { id: 'navigation', label: '🧭 Navigation', icon: '🧭' },
          { id: 'navtests', label: '🧪 Nav Tests', icon: '🧪' }
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

        {/* Onglet Navigation */}
        {activeTab === 'navigation' && (
          <div>
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>🧭 Navigation Diagnostic</h4>
              <div style={styles.stat}>
                <span style={styles.label}>Navigations:</span>
                <span style={styles.value}>{navRenderCount}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.label}>Erreurs:</span>
                <span style={styles.value}>{navErrors.length}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.label}>Changements de location:</span>
                <span style={styles.value}>{navLocationChanges}</span>
              </div>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>🧭 Logs de Navigation</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Message</th>
                    <th style={styles.th}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {navLogs.map((log, index) => (
                    <tr key={index} style={{backgroundColor: getLogColor(log.type)}}>
                      <td style={styles.td}>{getStatusIcon(log.type)}</td>
                      <td style={styles.td}>{log.message}</td>
                      <td style={styles.td}>{log.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>🧭 Erreurs de Navigation</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Erreur</th>
                    <th style={styles.th}>Message</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {navErrors.map((error, index) => (
                    <tr key={index} style={{backgroundColor: getStatusColor('error')}}>
                      <td style={styles.td}>{getStatusIcon('error')}</td>
                      <td style={styles.td}>{error.message}</td>
                      <td style={styles.td}>{error.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Onglet Nav Tests */}
        {activeTab === 'navtests' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button 
                onClick={runQuickNavTest} 
                disabled={isRunningNavTests}
                style={styles.button}
              >
                🚀 Test Rapide
              </button>
              <button 
                onClick={runFullNavTest} 
                disabled={isRunningNavTests}
                style={{...styles.button, marginLeft: '8px'}}
              >
                {isRunningNavTests ? '⏳ En cours...' : '🧪 Test Complet'}
              </button>
              <button 
                onClick={() => setNavTestResults([])} 
                style={{...styles.button, marginLeft: '8px', backgroundColor: '#6c757d'}}
              >
                🧹 Clear
              </button>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>📍 État Actuel</h4>
              <div style={styles.stat}>
                <span style={styles.label}>Route actuelle:</span>
                <span style={styles.value}>{location.pathname}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.label}>User connecté:</span>
                <span style={styles.value}>{currentUser ? '✅' : '❌'}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.label}>Loading:</span>
                <span style={styles.value}>{loading ? '⏳' : '✅'}</span>
              </div>
            </div>

            {/* Diagnostic automatique */}
            {getNavDiagnostic().length > 0 && (
              <div style={{...styles.card, backgroundColor: '#fff3f3', marginTop: '16px'}}>
                <h4 style={styles.cardTitle}>🚨 PROBLÈMES DÉTECTÉS</h4>
                {getNavDiagnostic().map((issue, index) => (
                  <div key={index} style={{ color: '#dc3545', marginBottom: '8px' }}>
                    {issue}
                  </div>
                ))}
              </div>
            )}

            {/* Résultats des tests */}
            {navTestResults.length > 0 && (
              <div style={{...styles.card, marginTop: '16px'}}>
                <h4 style={styles.cardTitle}>📋 Résultats des Tests</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Test</th>
                      <th style={styles.th}>Statut</th>
                      <th style={styles.th}>Détails</th>
                      <th style={styles.th}>Heure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {navTestResults.map((result, index) => (
                      <tr key={index} style={{
                        backgroundColor: result.status === 'error' ? '#fff3f3' : 
                                       result.status === 'warning' ? '#fff8e1' :
                                       result.status === 'success' ? '#f3fff3' : 'transparent'
                      }}>
                        <td style={styles.td}>{result.test}</td>
                        <td style={styles.td}>
                          <span style={{ color: getStatusColor(result.status) }}>
                            {getStatusIcon(result.status)} {result.status}
                          </span>
                        </td>
                        <td style={styles.td}>{result.details}</td>
                        <td style={styles.td}>{result.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {navTestResults.length === 0 && (
              <div style={{...styles.card, marginTop: '16px', textAlign: 'center', color: '#666'}}>
                <p>Aucun test exécuté. Cliquez sur "Test Rapide" pour un diagnostic rapide ou "Test Complet" pour une analyse complète de la navigation.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDebugDashboard; 