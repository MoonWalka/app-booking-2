// src/components/common/PerformanceMonitor.js
import React, { useState, useEffect } from 'react';
import logger from '@/services/loggerService';

/**
 * Composant pour afficher des informations de performance dans l'interface utilisateur
 * pendant le développement
 * Version améliorée utilisant le service de logging centralisé
 */
const PerformanceMonitor = ({ enabled = true }) => {
  const [metrics, setMetrics] = useState({
    loadTime: null,
    requestCount: 0,
    completedRequests: 0,
    lastOperationTime: null,
    operationName: null,
    slowRequests: [] // Ajout d'un suivi des requêtes lentes
  });

  useEffect(() => {
    if (!enabled) return;

    // S'abonner aux événements de logs de performance
    const removeListener = logger.addListener((event) => {
      if (event.type === 'performance') {
        setMetrics(prev => ({ 
          ...prev, 
          lastOperationTime: event.durationMs,
          operationName: event.operationName,
          completedRequests: prev.completedRequests + 1,
          // Ajouter aux requêtes lentes si > 300ms
          slowRequests: event.durationMs > 300 
            ? [...prev.slowRequests.slice(-4), {
                operation: event.operationName,
                duration: event.durationMs,
                timestamp: new Date().toLocaleTimeString()
              }]
            : prev.slowRequests
        }));
      }
      
      else if (event.type === 'startLoading') {
        setMetrics(prev => ({
          ...prev,
          requestCount: prev.requestCount + 1
        }));
      }
      
      else if (event.type === 'endLoading') {
        setMetrics(prev => ({
          ...prev,
          loadTime: event.durationMs
        }));
      }
    });
    
    return () => {
      removeListener();
    };
  }, [enabled]);
  
  const [expanded, setExpanded] = useState(false);
  
  if (!enabled) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: expanded ? '400px' : '300px',
        fontFamily: 'monospace',
        transition: 'all 0.3s ease'
      }}
    >
      <div 
        style={{ 
          marginBottom: '5px', 
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span>Performance Monitor</span>
        <span>{expanded ? '−' : '+'}</span>
      </div>
      
      <div>Temps total: {metrics.loadTime?.toFixed(0) || '-'} ms</div>
      <div>Requêtes: {metrics.completedRequests}/{metrics.requestCount}</div>
      
      {metrics.operationName && (
        <div>
          Dernière opération: {metrics.operationName} (
          <span style={{ color: metrics.lastOperationTime > 300 ? '#ff6b6b' : '#7bed9f' }}>
            {metrics.lastOperationTime?.toFixed(0)} ms
          </span>)
        </div>
      )}
      
      {/* Afficher les requêtes lentes si le panneau est développé */}
      {expanded && metrics.slowRequests.length > 0 && (
        <>
          <div style={{ marginTop: '8px', borderTop: '1px solid #555', paddingTop: '5px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Requêtes lentes (&gt;300ms):</div>
            {metrics.slowRequests.map((req, index) => (
              <div key={index} style={{ 
                fontSize: '11px', 
                marginBottom: '3px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{req.operation}</span>
                <span style={{ color: req.duration > 1000 ? '#ff6b6b' : '#ffab76' }}>
                  {req.duration.toFixed(0)} ms
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceMonitor;
