import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import { migrateToMultiOrg } from '@/utils/migrationHelper';
import './MigrationPage.css';

const MigrationPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const { refreshEntreprises } = useEntreprise();
  
  const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, running, success, error
  const [migrationResult, setMigrationResult] = useState(null);
  const [logs, setLogs] = useState([]);

  // Intercepter console.log pendant la migration
  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const handleMigration = async () => {
    if (!window.confirm('⚠️ Cette action va migrer toutes vos données vers le modèle multi-organisation. Êtes-vous sûr de vouloir continuer ?')) {
      return;
    }

    setMigrationStatus('running');
    setLogs([]);
    setMigrationResult(null);

    // Intercepter les logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      addLog(args.join(' '), 'info');
    };
    
    console.error = (...args) => {
      originalError(...args);
      addLog(args.join(' '), 'error');
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      addLog(args.join(' '), 'warning');
    };

    try {
      const result = await migrateToMultiOrg(currentUser.uid);
      setMigrationResult(result);
      
      if (result.success) {
        setMigrationStatus('success');
        // Rafraîchir les organisations après la migration
        await refreshEntreprises();
      } else {
        setMigrationStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      setMigrationStatus('error');
      setMigrationResult({
        success: false,
        error: error.message
      });
    } finally {
      // Restaurer les fonctions console
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };

  // Vérifier les permissions
  if (!isAdmin) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Accès refusé</h4>
          <p>Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="migration-page">
      <div className="container">
        <h1 className="mb-4">
          <i className="bi bi-arrow-repeat me-2"></i>
          Migration Multi-Organisation
        </h1>

        <div className="alert alert-info mb-4">
          <h5><i className="bi bi-info-circle me-2"></i>À propos de cette migration</h5>
          <p>Cette migration va :</p>
          <ul className="mb-0">
            <li>Créer une organisation par défaut pour vos données existantes</li>
            <li>Migrer toutes vos collections (dates, contacts, etc.) vers des collections organisationnelles</li>
            <li>Configurer les permissions et accès pour le modèle multi-organisation</li>
          </ul>
        </div>

        {migrationStatus === 'idle' && (
          <div className="text-center">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleMigration}
            >
              <i className="bi bi-play-circle me-2"></i>
              Démarrer la migration
            </button>
          </div>
        )}

        {migrationStatus === 'running' && (
          <div className="migration-running">
            <div className="text-center mb-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Migration en cours...</span>
              </div>
              <h3 className="mt-3">Migration en cours...</h3>
              <p className="text-muted">Ne fermez pas cette page</p>
            </div>
          </div>
        )}

        {migrationStatus === 'success' && migrationResult && (
          <div className="migration-success">
            <div className="alert alert-success">
              <h4><i className="bi bi-check-circle me-2"></i>Migration réussie !</h4>
              <p>Votre application est maintenant configurée pour le multi-organisation.</p>
              {migrationResult.orgId && (
                <p><strong>Organisation créée :</strong> ID {migrationResult.orgId}</p>
              )}
            </div>

            {migrationResult.stats && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Résumé de la migration</h5>
                </div>
                <div className="card-body">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Collection</th>
                        <th>Documents migrés</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(migrationResult.stats).map(([collection, count]) => (
                        <tr key={collection}>
                          <td>{collection}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <button 
                className="btn btn-success"
                onClick={() => window.location.href = '/'}
              >
                <i className="bi bi-house me-2"></i>
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        {migrationStatus === 'error' && (
          <div className="migration-error">
            <div className="alert alert-danger">
              <h4><i className="bi bi-x-circle me-2"></i>Erreur lors de la migration</h4>
              {migrationResult?.error && (
                <p><strong>Erreur :</strong> {migrationResult.error}</p>
              )}
              <p>Veuillez vérifier les logs ci-dessous et contacter le support si nécessaire.</p>
            </div>

            <div className="mt-4 text-center">
              <button 
                className="btn btn-secondary me-2"
                onClick={() => {
                  setMigrationStatus('idle');
                  setLogs([]);
                  setMigrationResult(null);
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Réessayer
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => window.location.href = '/'}
              >
                <i className="bi bi-house me-2"></i>
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        {/* Logs de migration */}
        {logs.length > 0 && (
          <div className="migration-logs mt-5">
            <h4>Logs de migration</h4>
            <div className="log-container">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`log-entry log-${log.type}`}
                >
                  <span className="log-time">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationPage; 