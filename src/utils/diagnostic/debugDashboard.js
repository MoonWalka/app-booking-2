import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Badge, Button, Alert, Table } from 'react-bootstrap';

/**
 * Hook pour détecter les re-renders excessifs
 */
const useRenderTracker = (componentName, threshold = 10) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const renderTimes = useRef([]);
  const [isExcessive, setIsExcessive] = useState(false);
  
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Garder les 20 derniers temps de render
    renderTimes.current.push(timeSinceLastRender);
    if (renderTimes.current.length > 20) {
      renderTimes.current.shift();
    }
    
    lastRenderTime.current = now;
    
    // Détecter les re-renders excessifs (plus de threshold en 1 seconde)
    const recentRenders = renderTimes.current.filter(time => time < 50); // Renders très rapides
    if (recentRenders.length > threshold) {
      setIsExcessive(true);
      console.warn(`🚨 [RENDER_LOOP] ${componentName} a eu ${renderCount.current} renders (${recentRenders.length} très rapides)`);
    }
    
    // Reset après 5 secondes de calme
    const resetTimer = setTimeout(() => {
      if (Date.now() - lastRenderTime.current > 5000) {
        setIsExcessive(false);
        renderCount.current = 0;
        renderTimes.current = [];
      }
    }, 5000);
    
    return () => clearTimeout(resetTimer);
  }, [threshold, componentName]);
  
  return {
    renderCount: renderCount.current,
    isExcessive,
    averageRenderTime: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0
  };
};

/**
 * Hook pour surveiller les logs excessifs
 */
const useLogMonitor = () => {
  const [logStats, setLogStats] = useState({});
  const logCounts = useRef({});
  const logTimestamps = useRef({});
  
  useEffect(() => {
    // Intercepter console.log
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    const trackLog = (level, args) => {
      const message = args.join(' ');
      const key = message.substring(0, 100); // Première partie du message
      
      if (!logCounts.current[key]) {
        logCounts.current[key] = { count: 0, level, lastSeen: Date.now(), message };
        logTimestamps.current[key] = [];
      }
      
      logCounts.current[key].count++;
      logCounts.current[key].lastSeen = Date.now();
      logTimestamps.current[key].push(Date.now());
      
      // Garder seulement les 100 derniers timestamps
      if (logTimestamps.current[key].length > 100) {
        logTimestamps.current[key] = logTimestamps.current[key].slice(-100);
      }
      
      // Détecter les logs excessifs (plus de 50 fois en 10 secondes)
      const now = Date.now();
      const recentLogs = logTimestamps.current[key].filter(time => now - time < 10000);
      
      if (recentLogs.length > 50) {
        console.warn(`🚨 [LOG_SPAM] Message répété ${recentLogs.length} fois: ${key.substring(0, 50)}...`);
      }
      
      // Mettre à jour les stats
      setLogStats(prev => ({
        ...prev,
        [key]: {
          ...logCounts.current[key],
          recentCount: recentLogs.length
        }
      }));
    };
    
    console.log = (...args) => {
      trackLog('log', args);
      originalLog.apply(console, args);
    };
    
    console.warn = (...args) => {
      trackLog('warn', args);
      originalWarn.apply(console, args);
    };
    
    console.error = (...args) => {
      trackLog('error', args);
      originalError.apply(console, args);
    };
    
    // Nettoyage périodique
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(logCounts.current).forEach(key => {
        if (now - logCounts.current[key].lastSeen > 60000) { // 1 minute
          delete logCounts.current[key];
          delete logTimestamps.current[key];
        }
      });
      
      setLogStats(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (now - updated[key].lastSeen > 60000) {
            delete updated[key];
          }
        });
        return updated;
      });
    }, 30000);
    
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      clearInterval(cleanupInterval);
    };
  }, []);
  
  return { logStats, setLogStats };
};

/**
 * Composant principal du Debug Dashboard amélioré
 */
const DebugDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('renders');
  const { logStats, setLogStats } = useLogMonitor();
  const dashboardRenderTracker = useRenderTracker('DebugDashboard', 5);
  
  // Statistiques des logs excessifs
  const excessiveLogs = Object.entries(logStats)
    .filter(([_, stats]) => stats.recentCount > 10)
    .sort((a, b) => b[1].recentCount - a[1].recentCount);
  
  const totalLogCount = Object.values(logStats).reduce((sum, stats) => sum + stats.count, 0);
  const recentLogCount = Object.values(logStats).reduce((sum, stats) => sum + stats.recentCount, 0);
  
  const clearLogStats = useCallback(() => {
    setLogStats({});
  }, [setLogStats]);
  
  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999
      }}>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={() => setIsVisible(true)}
        >
          🐛 Debug
        </Button>
      </div>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 9999,
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>🐛 Debug Dashboard</span>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </Button>
        </Card.Header>
        
        <Card.Body>
          {/* Onglets */}
          <div className="mb-3">
            <Button 
              variant={activeTab === 'renders' ? 'primary' : 'outline-primary'}
              size="sm"
              className="me-2"
              onClick={() => setActiveTab('renders')}
            >
              Re-renders
            </Button>
            <Button 
              variant={activeTab === 'logs' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setActiveTab('logs')}
            >
              Logs {recentLogCount > 0 && <Badge bg="danger">{recentLogCount}</Badge>}
            </Button>
          </div>
          
          {/* Onglet Re-renders */}
          {activeTab === 'renders' && (
            <div>
              <Alert variant={dashboardRenderTracker.isExcessive ? 'danger' : 'info'}>
                <strong>Dashboard:</strong> {dashboardRenderTracker.renderCount} renders
                {dashboardRenderTracker.isExcessive && (
                  <div className="mt-2">
                    <Badge bg="danger">⚠️ Re-renders excessifs détectés!</Badge>
                  </div>
                )}
              </Alert>
              
              <div className="mb-3">
                <small className="text-muted">
                  Temps moyen entre renders: {dashboardRenderTracker.averageRenderTime.toFixed(1)}ms
                </small>
              </div>
              
              <Alert variant="warning">
                <strong>🔍 Conseils de débogage:</strong>
                <ul className="mb-0 mt-2">
                  <li>Vérifiez les logs dans la console</li>
                  <li>Cherchez les fonctions non mémorisées</li>
                  <li>Vérifiez les dépendances instables dans useEffect/useMemo</li>
                  <li>Utilisez React DevTools Profiler</li>
                </ul>
              </Alert>
            </div>
          )}
          
          {/* Onglet Logs */}
          {activeTab === 'logs' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Badge bg="primary">{totalLogCount} logs total</Badge>
                  {recentLogCount > 0 && (
                    <Badge bg="warning" className="ms-2">{recentLogCount} récents</Badge>
                  )}
                </div>
                <Button variant="outline-danger" size="sm" onClick={clearLogStats}>
                  Effacer
                </Button>
              </div>
              
              {excessiveLogs.length > 0 && (
                <Alert variant="danger">
                  <strong>🚨 Logs excessifs détectés!</strong>
                  <div className="mt-2">
                    {excessiveLogs.slice(0, 3).map(([key, stats]) => (
                      <div key={key} className="mb-2">
                        <Badge bg="danger">{stats.recentCount}x</Badge>
                        <small className="ms-2 text-truncate d-inline-block" style={{maxWidth: '250px'}}>
                          {stats.message}
                        </small>
                      </div>
                    ))}
                  </div>
                </Alert>
              )}
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Count</th>
                      <th>Level</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(logStats)
                      .sort((a, b) => b[1].count - a[1].count)
                      .slice(0, 20)
                      .map(([key, stats]) => (
                        <tr key={key} className={stats.recentCount > 10 ? 'table-danger' : ''}>
                          <td>
                            <Badge bg={stats.recentCount > 10 ? 'danger' : 'secondary'}>
                              {stats.count}
                            </Badge>
                            {stats.recentCount > 0 && (
                              <Badge bg="warning" className="ms-1">{stats.recentCount}</Badge>
                            )}
                          </td>
                          <td>
                            <Badge bg={
                              stats.level === 'error' ? 'danger' : 
                              stats.level === 'warn' ? 'warning' : 'info'
                            }>
                              {stats.level}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
                              {stats.message}
                            </small>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DebugDashboard;
export { useRenderTracker, useLogMonitor }; 