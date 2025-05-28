import React, { useState, useEffect, useRef } from 'react';
import './ProfilerMonitor.css';

// Stockage global des données du profiler
window.PROFILER_STATS = window.PROFILER_STATS || {
  renders: {},
  durations: {},
  timestamps: {}
};

const ProfilerMonitor = () => {
  const [stats, setStats] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    // Mettre à jour les stats toutes les secondes
    const updateStats = () => {
      const currentStats = {};
      const now = Date.now();
      
      Object.keys(window.PROFILER_STATS.renders).forEach(componentId => {
        const renders = window.PROFILER_STATS.renders[componentId] || 0;
        const durations = window.PROFILER_STATS.durations[componentId] || [];
        const timestamps = window.PROFILER_STATS.timestamps[componentId] || [];
        
        // Calculer les rendus dans les 5 dernières secondes
        const recentTimestamps = timestamps.filter(t => now - t < 5000);
        const rendersPerSecond = recentTimestamps.length / 5;
        
        // Calculer les statistiques de durée
        const avgDuration = durations.length > 0 
          ? durations.reduce((a, b) => a + b, 0) / durations.length 
          : 0;
        const maxDuration = durations.length > 0 
          ? Math.max(...durations) 
          : 0;
        
        currentStats[componentId] = {
          totalRenders: renders,
          rendersPerSecond: rendersPerSecond.toFixed(2),
          avgDuration: avgDuration.toFixed(2),
          maxDuration: maxDuration.toFixed(2),
          status: renders > 100 ? 'critical' : renders > 50 ? 'warning' : 'ok'
        };
      });
      
      setStats(currentStats);
    };

    updateStats();
    intervalRef.current = setInterval(updateStats, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Fonction pour réinitialiser les stats
  const resetStats = () => {
    window.PROFILER_STATS = {
      renders: {},
      durations: {},
      timestamps: {}
    };
    setStats({});
  };

  // Fonction pour exporter les stats
  const exportStats = () => {
    const data = {
      timestamp: new Date().toISOString(),
      stats: window.PROFILER_STATS,
      summary: stats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profiler-stats-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`profiler-monitor ${isMinimized ? 'minimized' : ''}`}>
      <div className="profiler-header">
        <h3>🎭 React Profiler Monitor</h3>
        <div className="profiler-controls">
          <button onClick={resetStats} title="Réinitialiser">🔄</button>
          <button onClick={exportStats} title="Exporter">💾</button>
          <button onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? '📊' : '➖'}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="profiler-content">
          {Object.keys(stats).length === 0 ? (
            <p className="no-data">Aucune donnée de profiling disponible</p>
          ) : (
            <div className="stats-grid">
              {Object.entries(stats)
                .sort((a, b) => b[1].totalRenders - a[1].totalRenders)
                .map(([componentId, data]) => (
                  <div key={componentId} className={`stat-card ${data.status}`}>
                    <h4>{componentId.replace('ConcertForm-', '')}</h4>
                    <div className="stat-row">
                      <span>Total:</span>
                      <strong>{data.totalRenders}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Par sec:</span>
                      <strong>{data.rendersPerSecond}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Moy:</span>
                      <strong>{data.avgDuration}ms</strong>
                    </div>
                    <div className="stat-row">
                      <span>Max:</span>
                      <strong>{data.maxDuration}ms</strong>
                    </div>
                  </div>
                ))}
            </div>
          )}
          
          <div className="profiler-legend">
            <span className="legend-item ok">✅ OK (&lt;50)</span>
            <span className="legend-item warning">⚠️ Attention (50-100)</span>
            <span className="legend-item critical">🔴 Critique (&gt;100)</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction helper pour enregistrer les données du profiler
export const recordProfilerData = (id, phase, actualDuration) => {
  if (!window.PROFILER_STATS.renders[id]) {
    window.PROFILER_STATS.renders[id] = 0;
    window.PROFILER_STATS.durations[id] = [];
    window.PROFILER_STATS.timestamps[id] = [];
  }
  
  window.PROFILER_STATS.renders[id]++;
  window.PROFILER_STATS.durations[id].push(actualDuration);
  window.PROFILER_STATS.timestamps[id].push(Date.now());
  
  // Limiter l'historique à 100 entrées pour éviter les fuites mémoire
  if (window.PROFILER_STATS.durations[id].length > 100) {
    window.PROFILER_STATS.durations[id].shift();
    window.PROFILER_STATS.timestamps[id].shift();
  }
};

// Exposer globalement pour faciliter le debug
if (process.env.NODE_ENV === 'development') {
  window.recordProfilerData = recordProfilerData;
}

export default ProfilerMonitor; 