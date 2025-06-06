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
import ContactAssociationsDebug from './ContactAssociationsDebug';
import AssociationsAudit from './AssociationsAudit';
import RelancesAutomatiquesTest from './RelancesAutomatiquesTest';
import { useOrganization } from '@/context/OrganizationContext';
import { collection, query, where, getDocs, db } from '@/services/firebase-service';

const UnifiedDebugDashboard = () => {
  // États principaux
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('cache');
  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  
  // États pour Deep Analysis
  const [hookAnalysis, setHookAnalysis] = useState([]);
  const [componentTree, setComponentTree] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [errorPatterns, setErrorPatterns] = useState([]);
  
  // États pour Multi-Org Isolation Test
  const [multiOrgTestResults, setMultiOrgTestResults] = useState(null);
  const [isTestingMultiOrg, setIsTestingMultiOrg] = useState(false);
  const { currentOrganization } = useOrganization();
  
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
    const contactsElements = document.querySelectorAll('[href*="/contacts"]');
    addNavTestResult('Détection liens contacts', contactsElements.length > 0 ? 'success' : 'warning', 
      `${contactsElements.length} liens trouvés`);
    
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
      // Test 1: Navigation vers les contacts
      addNavTestResult('Navigation vers /contacts', 'running');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        navigate('/contacts');
        await new Promise(resolve => setTimeout(resolve, 500));
        addNavTestResult('Navigation vers /contacts', 'success', 'Navigation réussie');
      } catch (error) {
        addNavTestResult('Navigation vers /contacts', 'error', error.message);
      }
      
      // Test 2: Attendre le chargement
      addNavTestResult('Attente du chargement de la liste', 'running');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier si des éléments sont présents
      const listElements = document.querySelectorAll('[data-testid="contact-item"], .contact-item, .clickableRow');
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
          if (location.pathname.includes('/contacts/') && location.pathname !== '/contacts') {
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
      top: '10px',
      right: '10px',
      width: isExpanded ? 'min(95vw, 1200px)' : 'min(90vw, 800px)', // Responsive width
      maxWidth: isExpanded ? '1200px' : '800px',
      minWidth: '600px',
      height: isExpanded ? 'min(95vh, 900px)' : 'min(90vh, 800px)', // Responsive height
      maxHeight: isExpanded ? '95vh' : '90vh',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      zIndex: 9998,
      overflow: 'hidden',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease'
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
      borderBottom: '1px solid #e0e0e0',
      flexWrap: 'wrap', // Allow wrapping on small screens
      minHeight: 'auto'
    },
    tab: {
      flex: '1 1 auto',
      minWidth: '80px', // Minimum width for each tab
      padding: '8px 12px', // Reduced padding for better fit
      textAlign: 'center',
      cursor: 'pointer',
      borderBottom: '3px solid transparent',
      fontSize: '12px', // Smaller font for better fit
      fontWeight: 'bold',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    activeTab: {
      borderBottom: '3px solid #007bff',
      backgroundColor: 'white',
      color: '#007bff'
    },
    content: {
      padding: '16px',
      flex: 1, // Take remaining space
      overflow: 'auto',
      minHeight: 0 // Important for flex scrolling
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

  // 🔬 Fonctions d'analyse approfondie
  const analyzeHooks = useCallback(() => {
    const analysis = [];
    
    // Analyser les hooks React dans la page actuelle
    const reactFiberNode = document.querySelector('#root')?._reactInternalFiber || 
                          document.querySelector('#root')?._reactInternals;
    
    if (reactFiberNode) {
      analysis.push({
        type: 'React Fiber',
        status: 'detected',
        details: 'React Fiber tree accessible'
      });
    }
    
    // Analyser les erreurs de hooks
    const hookErrors = navLogs.filter(log => 
      log.message.includes('hook') || 
      log.message.includes('useEffect') || 
      log.message.includes('useCallback') ||
      log.message.includes('dependency')
    );
    
    analysis.push({
      type: 'Hook Errors',
      status: hookErrors.length > 0 ? 'warning' : 'success',
      details: `${hookErrors.length} erreurs de hooks détectées`,
      data: hookErrors
    });
    
    // Analyser les re-rendus excessifs
    const excessiveRenders = navLogs.filter(log => 
      log.type === 'render' && 
      Date.now() - new Date(`1970-01-01T${log.timestamp}`).getTime() < 10000
    );
    
    analysis.push({
      type: 'Excessive Renders',
      status: excessiveRenders.length > 20 ? 'error' : excessiveRenders.length > 10 ? 'warning' : 'success',
      details: `${excessiveRenders.length} rendus en 10 secondes`,
      data: excessiveRenders
    });
    
    setHookAnalysis(analysis);
  }, [navLogs]);

  const analyzeComponentTree = useCallback(() => {
    const tree = [];
    
    // Analyser l'arbre des composants via React DevTools si disponible
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      tree.push({
        component: 'React DevTools',
        status: 'available',
        details: 'React DevTools détecté'
      });
    }
    
    // Analyser les composants avec des erreurs
    const errorComponents = [...new Set(navLogs
      .filter(log => log.type === 'error')
      .map(log => {
        const match = log.message.match(/(\w+)@http/);
        return match ? match[1] : 'Unknown';
      })
    )];
    
    errorComponents.forEach(component => {
      tree.push({
        component,
        status: 'error',
        details: 'Composant avec erreurs détectées'
      });
    });
    
    setComponentTree(tree);
  }, [navLogs]);

  const analyzePerformance = useCallback(() => {
    const metrics = {};
    
    // Analyser les métriques de performance
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        metrics.domContentLoaded = Math.round(nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart);
        metrics.loadComplete = Math.round(nav.loadEventEnd - nav.loadEventStart);
        metrics.totalLoadTime = Math.round(nav.loadEventEnd - nav.fetchStart);
      }
      
      const resourceEntries = performance.getEntriesByType('resource');
      metrics.resourceCount = resourceEntries.length;
      metrics.slowResources = resourceEntries.filter(r => r.duration > 1000).length;
    }
    
    // Analyser les métriques de mémoire si disponibles
    if (performance.memory) {
      metrics.memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      metrics.memoryTotal = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
      metrics.memoryLimit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
    }
    
    setPerformanceMetrics(metrics);
  }, []);

  const analyzeErrorPatterns = useCallback(() => {
    const patterns = [];
    
    // Grouper les erreurs par type
    const errorGroups = {};
    navErrors.forEach(error => {
      const errorType = error.message.split(':')[0] || 'Unknown';
      if (!errorGroups[errorType]) {
        errorGroups[errorType] = [];
      }
      errorGroups[errorType].push(error);
    });
    
    Object.entries(errorGroups).forEach(([type, errors]) => {
      patterns.push({
        pattern: type,
        count: errors.length,
        frequency: errors.length / Math.max(navErrors.length, 1),
        lastOccurrence: errors[errors.length - 1]?.timestamp,
        status: errors.length > 5 ? 'critical' : errors.length > 2 ? 'warning' : 'info'
      });
    });
    
    // Analyser les patterns temporels
    const timePatterns = navLogs.reduce((acc, log) => {
      const minute = new Date(`1970-01-01T${log.timestamp}`).getMinutes();
      acc[minute] = (acc[minute] || 0) + 1;
      return acc;
    }, {});
    
    const maxActivity = Math.max(...Object.values(timePatterns));
    if (maxActivity > 50) {
      patterns.push({
        pattern: 'High Activity Burst',
        count: maxActivity,
        frequency: 1,
        status: 'warning',
        details: 'Pic d\'activité détecté'
      });
    }
    
    setErrorPatterns(patterns);
  }, [navErrors, navLogs]);

  const runDeepAnalysis = useCallback(() => {
    analyzeHooks();
    analyzeComponentTree();
    analyzePerformance();
    analyzeErrorPatterns();
  }, [analyzeHooks, analyzeComponentTree, analyzePerformance, analyzeErrorPatterns]);

  // 🔒 Test d'isolation multi-organisation
  const runMultiOrgIsolationTest = useCallback(async () => {
    setIsTestingMultiOrg(true);
    setMultiOrgTestResults(null);
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        currentOrganization: currentOrganization ? {
          id: currentOrganization.id,
          name: currentOrganization.name
        } : null,
        tests: [],
        issues: [],
        summary: {
          totalDocuments: 0,
          organizationDocuments: 0,
          leakedDocuments: 0,
          missingOrgIdDocuments: 0
        }
      };
      
      if (!currentOrganization?.id) {
        results.issues.push({
          type: 'error',
          message: 'Aucune organisation sélectionnée',
          severity: 'critical'
        });
        setMultiOrgTestResults(results);
        return;
      }
      
      // Collections à tester
      const collectionsToTest = [
        'concerts',
        'contacts',
        'artistes',
        'lieux',
        'structures',
        'contrats',
        'formulaires',
        'relances'
      ];
      
      for (const collectionName of collectionsToTest) {
        try {
          // Test 1: Requête sans filtre
          const allQuery = query(collection(db, collectionName));
          const allDocs = await getDocs(allQuery);
          
          // Test 2: Requête avec filtre organizationId
          const orgQuery = query(
            collection(db, collectionName),
            where('organizationId', '==', currentOrganization.id)
          );
          const orgDocs = await getDocs(orgQuery);
          
          // Analyser les résultats
          const organizations = new Set();
          let missingOrgId = 0;
          
          allDocs.forEach(doc => {
            const data = doc.data();
            if (data.organizationId) {
              organizations.add(data.organizationId);
            } else {
              missingOrgId++;
            }
          });
          
          const testResult = {
            collection: collectionName,
            totalDocuments: allDocs.size,
            organizationDocuments: orgDocs.size,
            leakedDocuments: allDocs.size - orgDocs.size,
            missingOrgId: missingOrgId,
            organizationsFound: Array.from(organizations),
            status: allDocs.size === orgDocs.size ? 'success' : 'warning'
          };
          
          results.tests.push(testResult);
          results.summary.totalDocuments += allDocs.size;
          results.summary.organizationDocuments += orgDocs.size;
          results.summary.leakedDocuments += testResult.leakedDocuments;
          results.summary.missingOrgIdDocuments += missingOrgId;
          
          // Détecter les problèmes
          if (testResult.leakedDocuments > 0) {
            results.issues.push({
              type: 'warning',
              collection: collectionName,
              message: `${testResult.leakedDocuments} documents d'autres organisations sont accessibles`,
              severity: 'high'
            });
          }
          
          if (missingOrgId > 0) {
            results.issues.push({
              type: 'info',
              collection: collectionName,
              message: `${missingOrgId} documents sans organizationId`,
              severity: 'medium'
            });
          }
          
          if (organizations.size > 1) {
            results.issues.push({
              type: 'error',
              collection: collectionName,
              message: `Plusieurs organisations détectées (${organizations.size})`,
              severity: 'critical',
              organizations: Array.from(organizations)
            });
          }
          
        } catch (error) {
          results.tests.push({
            collection: collectionName,
            error: error.message,
            status: 'error'
          });
          
          results.issues.push({
            type: 'error',
            collection: collectionName,
            message: `Erreur lors du test: ${error.message}`,
            severity: 'medium'
          });
        }
      }
      
      // Calculer le score de sécurité
      const securityScore = results.summary.organizationDocuments > 0 
        ? Math.round((results.summary.organizationDocuments / results.summary.totalDocuments) * 100)
        : 100;
      
      results.securityScore = securityScore;
      results.status = securityScore === 100 ? 'secure' : securityScore >= 90 ? 'warning' : 'critical';
      
      setMultiOrgTestResults(results);
      
    } catch (error) {
      console.error('Erreur lors du test multi-org:', error);
      setMultiOrgTestResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingMultiOrg(false);
    }
  }, [currentOrganization]);

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
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            style={{...styles.button, backgroundColor: isExpanded ? '#28a745' : '#6c757d'}}
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            {isExpanded ? '📉' : '📈'}
          </button>
          <button onClick={cleanup} style={styles.button}>🧹</button>
          <button onClick={resetAll} style={styles.button}>🔄</button>
          <button onClick={() => setIsVisible(false)} style={styles.closeButton}>✕</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'cache', label: '📊 Cache', shortLabel: '📊' },
          { id: 'firebase', label: '🔥 Firebase', shortLabel: '🔥' },
          { id: 'tests', label: '🧪 Tests', shortLabel: '🧪' },
          { id: 'contacts', label: '👥 Contacts', shortLabel: '👥' },
          { id: 'audit', label: '🔍 Audit', shortLabel: '🔍' },
          { id: 'requests', label: '📡 Requêtes', shortLabel: '📡' },
          { id: 'navigation', label: '🧭 Navigation', shortLabel: '🧭' },
          { id: 'navtests', label: '🧪 Nav Tests', shortLabel: '🧪²' },
          { id: 'relances', label: '🤖 Relances Auto', shortLabel: '🤖' },
          { id: 'deepanalysis', label: '🔬 Deep Analysis', shortLabel: '🔬' },
          { id: 'multiorg', label: '🔒 Multi-Org', shortLabel: '🔒' }
        ].map(tab => (
          <div
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label} // Tooltip avec le nom complet
          >
            {isExpanded ? tab.label : tab.shortLabel}
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
        {/* Onglet Contacts Debug */}
        {activeTab === 'contacts' && (
          <div>
            <ContactAssociationsDebug />
          </div>
        )}

        {/* Onglet Audit Associations */}
        {activeTab === 'audit' && (
          <div>
            <AssociationsAudit />
          </div>
        )}

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

        {/* Onglet Relances Automatiques */}
        {activeTab === 'relances' && (
          <div>
            <RelancesAutomatiquesTest />
          </div>
        )}

        {/* Onglet Deep Analysis */}
        {activeTab === 'deepanalysis' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button 
                onClick={runDeepAnalysis} 
                style={styles.button}
              >
                🔬 Lancer l'analyse approfondie
              </button>
              <button 
                onClick={() => {
                  setHookAnalysis([]);
                  setComponentTree([]);
                  setPerformanceMetrics({});
                  setErrorPatterns([]);
                }} 
                style={{...styles.button, marginLeft: '8px', backgroundColor: '#6c757d'}}
              >
                🧹 Clear
              </button>
            </div>

            {/* Analyse des Hooks */}
            {hookAnalysis.length > 0 && (
              <div style={{...styles.card, marginBottom: '16px'}}>
                <h4 style={styles.cardTitle}>🪝 Analyse des Hooks</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Statut</th>
                      <th style={styles.th}>Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hookAnalysis.map((analysis, index) => (
                      <tr key={index} style={{
                        backgroundColor: analysis.status === 'error' ? '#fff3f3' : 
                                       analysis.status === 'warning' ? '#fff8e1' :
                                       analysis.status === 'success' ? '#f3fff3' : 'transparent'
                      }}>
                        <td style={styles.td}>{analysis.type}</td>
                        <td style={styles.td}>
                          <span style={{ color: getStatusColor(analysis.status) }}>
                            {getStatusIcon(analysis.status)} {analysis.status}
                          </span>
                        </td>
                        <td style={styles.td}>{analysis.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Arbre des Composants */}
            {componentTree.length > 0 && (
              <div style={{...styles.card, marginBottom: '16px'}}>
                <h4 style={styles.cardTitle}>🌳 Arbre des Composants</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Composant</th>
                      <th style={styles.th}>Statut</th>
                      <th style={styles.th}>Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentTree.map((comp, index) => (
                      <tr key={index} style={{
                        backgroundColor: comp.status === 'error' ? '#fff3f3' : 
                                       comp.status === 'warning' ? '#fff8e1' :
                                       comp.status === 'available' ? '#f3fff3' : 'transparent'
                      }}>
                        <td style={styles.td}>{comp.component}</td>
                        <td style={styles.td}>
                          <span style={{ color: getStatusColor(comp.status) }}>
                            {getStatusIcon(comp.status)} {comp.status}
                          </span>
                        </td>
                        <td style={styles.td}>{comp.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Métriques de Performance */}
            {Object.keys(performanceMetrics).length > 0 && (
              <div style={{...styles.card, marginBottom: '16px'}}>
                <h4 style={styles.cardTitle}>⚡ Métriques de Performance</h4>
                <div style={styles.grid}>
                  {Object.entries(performanceMetrics).map(([key, value]) => (
                    <div key={key} style={styles.stat}>
                      <span style={styles.label}>{key}:</span>
                      <span style={styles.value}>
                        {typeof value === 'number' ? 
                          (key.includes('memory') ? `${value} MB` : 
                           key.includes('Time') ? `${value} ms` : value) : 
                          value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patterns d'Erreurs */}
            {errorPatterns.length > 0 && (
              <div style={{...styles.card, marginBottom: '16px'}}>
                <h4 style={styles.cardTitle}>🔍 Patterns d'Erreurs</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Pattern</th>
                      <th style={styles.th}>Occurrences</th>
                      <th style={styles.th}>Fréquence</th>
                      <th style={styles.th}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorPatterns.map((pattern, index) => (
                      <tr key={index} style={{
                        backgroundColor: pattern.status === 'critical' ? '#fff3f3' : 
                                       pattern.status === 'warning' ? '#fff8e1' :
                                       'transparent'
                      }}>
                        <td style={styles.td}>{pattern.pattern}</td>
                        <td style={styles.td}>{pattern.count}</td>
                        <td style={styles.td}>{Math.round(pattern.frequency * 100)}%</td>
                        <td style={styles.td}>
                          <span style={{ color: getStatusColor(pattern.status) }}>
                            {getStatusIcon(pattern.status)} {pattern.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {hookAnalysis.length === 0 && componentTree.length === 0 && 
             Object.keys(performanceMetrics).length === 0 && errorPatterns.length === 0 && (
              <div style={{...styles.card, textAlign: 'center', color: '#666'}}>
                <p>Aucune analyse effectuée. Cliquez sur "🔬 Lancer l'analyse approfondie" pour commencer.</p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Multi-Org Isolation */}
        {activeTab === 'multiorg' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button 
                onClick={runMultiOrgIsolationTest} 
                disabled={isTestingMultiOrg}
                style={styles.button}
              >
                {isTestingMultiOrg ? '⏳ Test en cours...' : '🔒 Lancer le test d\'isolation'}
              </button>
              <button 
                onClick={() => setMultiOrgTestResults(null)} 
                style={{...styles.button, marginLeft: '8px', backgroundColor: '#6c757d'}}
              >
                🧹 Clear
              </button>
            </div>

            {/* État de l'organisation */}
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>🏢 Organisation Courante</h4>
              {currentOrganization ? (
                <>
                  <div style={styles.stat}>
                    <span style={styles.label}>Nom:</span>
                    <span style={styles.value}>{currentOrganization.name}</span>
                  </div>
                  <div style={styles.stat}>
                    <span style={styles.label}>ID:</span>
                    <span style={styles.value}>{currentOrganization.id}</span>
                  </div>
                </>
              ) : (
                <div style={{ color: '#dc3545' }}>❌ Aucune organisation sélectionnée</div>
              )}
            </div>

            {/* Résultats du test */}
            {multiOrgTestResults && (
              <>
                {/* Score de sécurité */}
                <div style={{
                  ...styles.card, 
                  marginTop: '16px',
                  backgroundColor: multiOrgTestResults.status === 'secure' ? '#d4edda' :
                                 multiOrgTestResults.status === 'warning' ? '#fff3cd' : '#f8d7da'
                }}>
                  <h4 style={styles.cardTitle}>
                    {multiOrgTestResults.status === 'secure' ? '🛡️' :
                     multiOrgTestResults.status === 'warning' ? '⚠️' : '🚨'} 
                    Score de Sécurité
                  </h4>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>
                    {multiOrgTestResults.securityScore || 0}%
                  </div>
                  <div style={styles.grid}>
                    <div style={styles.stat}>
                      <span style={styles.label}>Documents totaux:</span>
                      <span style={styles.value}>{multiOrgTestResults.summary?.totalDocuments || 0}</span>
                    </div>
                    <div style={styles.stat}>
                      <span style={styles.label}>Documents de l'org:</span>
                      <span style={styles.value}>{multiOrgTestResults.summary?.organizationDocuments || 0}</span>
                    </div>
                    <div style={styles.stat}>
                      <span style={styles.label}>Documents exposés:</span>
                      <span style={{...styles.value, color: multiOrgTestResults.summary?.leakedDocuments > 0 ? '#dc3545' : '#28a745'}}>
                        {multiOrgTestResults.summary?.leakedDocuments || 0}
                      </span>
                    </div>
                    <div style={styles.stat}>
                      <span style={styles.label}>Sans organizationId:</span>
                      <span style={{...styles.value, color: multiOrgTestResults.summary?.missingOrgIdDocuments > 0 ? '#ffc107' : '#28a745'}}>
                        {multiOrgTestResults.summary?.missingOrgIdDocuments || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Résultats par collection */}
                {multiOrgTestResults.tests && multiOrgTestResults.tests.length > 0 && (
                  <div style={{...styles.card, marginTop: '16px'}}>
                    <h4 style={styles.cardTitle}>📊 Résultats par Collection</h4>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Collection</th>
                          <th style={styles.th}>Total</th>
                          <th style={styles.th}>Organisation</th>
                          <th style={styles.th}>Exposés</th>
                          <th style={styles.th}>Sans Org ID</th>
                          <th style={styles.th}>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {multiOrgTestResults.tests.map((test, index) => (
                          <tr key={index} style={{
                            backgroundColor: test.status === 'error' ? '#fff3f3' :
                                           test.status === 'warning' ? '#fff8e1' :
                                           test.status === 'success' ? '#f3fff3' : 'transparent'
                          }}>
                            <td style={styles.td}>{test.collection}</td>
                            <td style={styles.td}>{test.totalDocuments || '-'}</td>
                            <td style={styles.td}>{test.organizationDocuments || '-'}</td>
                            <td style={{...styles.td, color: test.leakedDocuments > 0 ? '#dc3545' : '#28a745'}}>
                              {test.leakedDocuments || 0}
                            </td>
                            <td style={{...styles.td, color: test.missingOrgId > 0 ? '#ffc107' : '#28a745'}}>
                              {test.missingOrgId || 0}
                            </td>
                            <td style={styles.td}>
                              {test.error ? (
                                <span style={{ color: '#dc3545' }}>❌ {test.error}</span>
                              ) : (
                                <span style={{ color: getStatusColor(test.status) }}>
                                  {getStatusIcon(test.status)}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Problèmes détectés */}
                {multiOrgTestResults.issues && multiOrgTestResults.issues.length > 0 && (
                  <div style={{...styles.card, marginTop: '16px', backgroundColor: '#fff3f3'}}>
                    <h4 style={styles.cardTitle}>🚨 Problèmes Détectés</h4>
                    {multiOrgTestResults.issues.map((issue, index) => (
                      <div key={index} style={{
                        padding: '8px',
                        marginBottom: '8px',
                        borderRadius: '4px',
                        backgroundColor: issue.severity === 'critical' ? '#f8d7da' :
                                       issue.severity === 'high' ? '#fff3cd' :
                                       issue.severity === 'medium' ? '#cce5ff' : '#d1ecf1',
                        color: issue.severity === 'critical' ? '#721c24' :
                               issue.severity === 'high' ? '#856404' :
                               issue.severity === 'medium' ? '#004085' : '#0c5460'
                      }}>
                        <strong>{getStatusIcon(issue.type)} {issue.collection || 'Général'}:</strong> {issue.message}
                        {issue.organizations && (
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Organisations: {issue.organizations.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommandations */}
                {multiOrgTestResults.status !== 'secure' && (
                  <div style={{...styles.card, marginTop: '16px', backgroundColor: '#d1ecf1'}}>
                    <h4 style={styles.cardTitle}>💡 Recommandations</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {multiOrgTestResults.summary?.leakedDocuments > 0 && (
                        <li>Vérifier que tous les hooks filtrent correctement par organizationId</li>
                      )}
                      {multiOrgTestResults.summary?.missingOrgIdDocuments > 0 && (
                        <li>Migrer les documents sans organizationId vers l'organisation appropriée</li>
                      )}
                      <li>Tester régulièrement l'isolation des données</li>
                      <li>Former l'équipe sur les bonnes pratiques multi-organisation</li>
                    </ul>
                  </div>
                )}
              </>
            )}

            {!multiOrgTestResults && !isTestingMultiOrg && (
              <div style={{...styles.card, marginTop: '16px', textAlign: 'center', color: '#666'}}>
                <p>Cliquez sur "🔒 Lancer le test d'isolation" pour vérifier la sécurité multi-organisation.</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Ce test vérifie que chaque utilisateur ne peut accéder qu'aux données de son organisation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDebugDashboard; 