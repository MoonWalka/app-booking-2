/**
 * Composant de debug pour diagnostiquer les organizationId manquants
 * Version panneau flottant et déplaçable
 */
import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, db, updateDoc, doc } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './OrganizationIdDebug.module.css';

const OrganizationIdDebug = ({ isVisible, onClose, initialPosition = { x: 20, y: 20 } }) => {
  const { currentOrganization } = useOrganization();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const panelRef = useRef(null);
  const headerRef = useRef(null);

  const collections = ['contacts', 'lieux', 'concerts', 'structures'];

  // Gestion du drag and drop
  const handleMouseDown = (e) => {
    if (e.target === headerRef.current || headerRef.current?.contains(e.target)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Contraintes pour garder le panneau dans la fenêtre
    const maxX = window.innerWidth - 400; // largeur approximative du panneau
    const maxY = window.innerHeight - 100;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  const checkOrganizationIds = async () => {
    setLoading(true);
    const checkResults = {};

    for (const collectionName of collections) {
      try {
        console.log(`🔍 Vérification de ${collectionName}...`);
        
        // Récupérer TOUS les documents de la collection
        const allSnapshot = await getDocs(collection(db, collectionName));
        const totalDocs = allSnapshot.docs.length;
        
        let withOrgId = 0;
        let withoutOrgId = 0;
        const samplesWithout = [];
        const samplesWithOrgId = [];
        const orgIds = new Set();

        allSnapshot.docs.forEach(docSnapshot => {
          const data = docSnapshot.data();
          
          if (data.organizationId) {
            withOrgId++;
            orgIds.add(data.organizationId);
            if (samplesWithOrgId.length < 3) {
              samplesWithOrgId.push({
                id: docSnapshot.id,
                name: data.nom || data.titre || data.raisonSociale || 'Sans nom',
                organizationId: data.organizationId
              });
            }
          } else {
            withoutOrgId++;
            if (samplesWithout.length < 5) {
              samplesWithout.push({
                id: docSnapshot.id,
                name: data.nom || data.titre || data.raisonSociale || 'Sans nom',
                createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'
              });
            }
          }
        });

        checkResults[collectionName] = {
          total: totalDocs,
          withOrgId,
          withoutOrgId,
          orgIds: Array.from(orgIds),
          samplesWithout,
          samplesWithOrgId,
          status: withoutOrgId > 0 ? 'NEEDS_FIX' : 'OK'
        };

        console.log(`📊 ${collectionName}: ${totalDocs} total, ${withOrgId} avec orgId, ${withoutOrgId} sans orgId`);
        
      } catch (error) {
        console.error(`❌ Erreur ${collectionName}:`, error);
        checkResults[collectionName] = {
          error: error.message,
          status: 'ERROR'
        };
      }
    }

    setResults(checkResults);
    setLoading(false);
  };

  const fixMissingOrganizationIds = async () => {
    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée !');
      return;
    }

    setFixing(true);
    const fixes = {};

    for (const collectionName of collections) {
      const collectionResult = results[collectionName];
      if (!collectionResult || collectionResult.withoutOrgId === 0) continue;

      try {
        console.log(`🔧 Correction de ${collectionName}...`);
        
        // Récupérer tous les documents sans organizationId
        const allSnapshot = await getDocs(collection(db, collectionName));
        const docsToFix = [];

        allSnapshot.docs.forEach(docSnapshot => {
          const data = docSnapshot.data();
          if (!data.organizationId) {
            docsToFix.push(docSnapshot.id);
          }
        });

        // Corriger chaque document
        const fixPromises = docsToFix.map(async (docId) => {
          try {
            await updateDoc(doc(db, collectionName, docId), {
              organizationId: currentOrganization.id
            });
            return { id: docId, success: true };
          } catch (error) {
            console.error(`Erreur correction ${docId}:`, error);
            return { id: docId, success: false, error: error.message };
          }
        });

        const fixResults = await Promise.all(fixPromises);
        const successCount = fixResults.filter(r => r.success).length;
        const errorCount = fixResults.filter(r => !r.success).length;

        fixes[collectionName] = {
          total: docsToFix.length,
          success: successCount,
          errors: errorCount
        };

        console.log(`✅ ${collectionName}: ${successCount} corrigés, ${errorCount} erreurs`);

      } catch (error) {
        console.error(`❌ Erreur correction ${collectionName}:`, error);
        fixes[collectionName] = {
          error: error.message
        };
      }
    }

    setFixResults(fixes);
    setFixing(false);
    
    // Refaire la vérification après correction
    setTimeout(checkOrganizationIds, 1000);
  };

  useEffect(() => {
    if (currentOrganization?.id && isVisible) {
      checkOrganizationIds();
    }
  }, [currentOrganization, isVisible]);

  if (!isVisible) return null;

  if (!currentOrganization?.id) {
    return (
      <div 
        ref={panelRef}
        className={styles.floatingPanel}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div 
          ref={headerRef}
          className={styles.panelHeader}
          onMouseDown={handleMouseDown}
        >
          <span>🔍 Debug OrganizationId</span>
          <div className={styles.headerButtons}>
            <button onClick={onClose} className={styles.closeButton}>×</button>
          </div>
        </div>
        <div className={styles.panelContent}>
          <Alert variant="warning">
            Aucune organisation sélectionnée. Impossible de faire le diagnostic.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className={`${styles.floatingPanel} ${isDragging ? styles.dragging : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div 
        ref={headerRef}
        className={styles.panelHeader}
        onMouseDown={handleMouseDown}
      >
        <span>🔍 Debug OrganizationId</span>
        <div className={styles.headerButtons}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className={styles.minimizeButton}
          >
            {isMinimized ? '□' : '_'}
          </button>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className={styles.panelContent}>
          <div className={styles.organizationInfo}>
            <strong>Organisation :</strong> {currentOrganization.nom} ({currentOrganization.id})
          </div>

          <div className={styles.actions}>
            <Button 
              onClick={checkOrganizationIds}
              disabled={loading}
              className={styles.checkButton}
              size="small"
            >
              {loading ? 'Vérification...' : '🔍 Vérifier'}
            </Button>

            {Object.keys(results).length > 0 && (
              <Button 
                onClick={fixMissingOrganizationIds}
                disabled={fixing}
                variant="primary"
                className={styles.fixButton}
                size="small"
              >
                {fixing ? 'Correction...' : '🔧 Corriger'}
              </Button>
            )}
          </div>

          {loading && (
            <div className={styles.loading}>
              <span>🔄</span>
              <span>Vérification en cours...</span>
            </div>
          )}

          {fixResults && (
            <div className={styles.fixResults}>
              <h6>✅ Résultats de la correction :</h6>
              {Object.entries(fixResults).map(([collection, result]) => (
                <div key={collection} className={styles.fixResult}>
                  <strong>{collection}:</strong>{' '}
                  {result.error ? (
                    <span className={styles.error}>Erreur - {result.error}</span>
                  ) : (
                    <span className={styles.success}>
                      {result.success} sur {result.total} corrigés
                    </span>
                  )}
                </div>
              ))}
              <Alert variant="success" className={styles.successMessage}>
                🎉 Correction terminée ! Actualisez la page (F5) pour voir les changements.
              </Alert>
            </div>
          )}

          {Object.keys(results).length > 0 && (
            <div className={styles.results}>
              {Object.entries(results).map(([collection, result]) => (
                <div key={collection} className={styles.collectionResult}>
                  <h6>
                    {collection.toUpperCase()}
                    <span className={`${styles.status} ${styles[result.status?.toLowerCase()]}`}>
                      {result.status}
                    </span>
                  </h6>
                  
                  {result.error ? (
                    <Alert variant="error">{result.error}</Alert>
                  ) : (
                    <div className={styles.collectionStats}>
                      <div className={styles.statRow}>
                        <span>Total :</span>
                        <span>{result.total}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>Avec OrganizationId :</span>
                        <span style={{ color: '#28a745' }}>{result.withOrgId}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>Sans OrganizationId :</span>
                        <span style={{ color: result.withoutOrgId > 0 ? '#dc3545' : '#28a745' }}>
                          {result.withoutOrgId}
                        </span>
                      </div>
                    </div>
                  )}

                  {result.samplesWithout && result.samplesWithout.length > 0 && (
                    <div className={styles.samples}>
                      <strong>❌ Échantillon sans OrganizationId :</strong>
                      <ul>
                        {result.samplesWithout.map(sample => (
                          <li key={sample.id}>
                            {sample.name} (créé le {sample.createdAt})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationIdDebug; 