import React, { useState } from 'react';
import { Card, Alert, Table } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import { useOrganization } from '@/context/OrganizationContext';
import { db, collection, query, where, getDocs, doc, writeBatch } from '@/services/firebase-service';
import { fixRelancesLoop } from '@/utils/fixRelancesLoop';
import { convertFirebaseDate, formatDateSafely, getDateKey, getMinuteKey, makeSafeForDisplay } from '@/utils/dateConversion';
import styles from './RelancesAuditTool.module.css';

/**
 * Outil d'audit pour diagnostiquer les problèmes de relances automatiques
 */
const RelancesAuditTool = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [auditResults, setAuditResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [fixResult, setFixResult] = useState(null);
  
  // Protection contre les erreurs de rendu
  const safeRender = (fn) => {
    try {
      return fn();
    } catch (err) {
      console.error('Erreur de rendu dans RelancesAuditTool:', err);
      return <span className="text-danger">Erreur d'affichage</span>;
    }
  };

  // Corriger le problème de boucle
  const fixLoop = async () => {
    if (!currentOrganization?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }

    const confirmFix = window.confirm(
      'Cette action va :\n' +
      '- Supprimer les doublons de relances\n' +
      '- Désactiver temporairement les relances automatiques (5 minutes)\n' +
      '- Marquer les concerts comme traités\n\n' +
      'Voulez-vous continuer ?'
    );

    if (!confirmFix) return;

    setLoading(true);
    setError(null);
    setFixResult(null);
    setProgress('Correction en cours...');

    try {
      const result = await fixRelancesLoop(currentOrganization.id);
      setFixResult(result);
      setProgress('');
      
      // Relancer l'audit après correction
      setTimeout(() => runAudit(), 2000);
    } catch (err) {
      console.error('Erreur lors de la correction:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Analyser les relances
  const runAudit = async () => {
    if (!currentOrganization?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    setError(null);
    setAuditResults(null);
    setProgress('Chargement des relances...');

    try {
      // Récupérer toutes les relances de l'organisation
      const relancesRef = collection(db, 'relances');
      const q = query(relancesRef, where('organizationId', '==', currentOrganization.id));
      const snapshot = await getDocs(q);

      const relances = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Log pour déboguer
        if (data.dateEcheance && typeof data.dateEcheance === 'object' && data.dateEcheance.seconds) {
          console.log('Relance avec timestamp Firebase:', doc.id, data.dateEcheance);
        }
        relances.push({ id: doc.id, ...data });
      });

      setProgress(`${relances.length} relances trouvées. Analyse en cours...`);

      // Analyser les patterns
      const analysis = {
        total: relances.length,
        byStatus: {},
        byEntityType: {},
        byCreatedDate: {},
        duplicates: [],
        recentBurst: [],
        suspicious: []
      };

      // Grouper par status
      relances.forEach(relance => {
        const status = relance.status || 'unknown';
        analysis.byStatus[status] = (analysis.byStatus[status] || 0) + 1;
      });

      // Grouper par type d'entité
      relances.forEach(relance => {
        const entityType = relance.entityType || 'none';
        analysis.byEntityType[entityType] = (analysis.byEntityType[entityType] || 0) + 1;
      });

      // Analyser les dates de création
      const dateGroups = {};
      const now = new Date();
      const oneHourAgo = new Date(now - 60 * 60 * 1000);

      relances.forEach(relance => {
        const createdAt = convertFirebaseDate(relance.createdAt, relance.dateCreation);
        
        if (createdAt > oneHourAgo) {
          analysis.recentBurst.push(relance);
        }

        // Grouper par jour
        const dateKey = getDateKey(createdAt);
        if (!dateGroups[dateKey]) {
          dateGroups[dateKey] = [];
        }
        dateGroups[dateKey].push(relance);
      });

      analysis.byCreatedDate = Object.entries(dateGroups)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 10)
        .map(([date, items]) => ({
          date,
          count: items.length,
          items: items.slice(0, 5) // Premiers exemples
        }));

      // Détecter les doublons potentiels
      const seen = new Map();
      relances.forEach(relance => {
        // Créer une clé unique basée sur les propriétés importantes
        // Utiliser getDateKey pour éviter les problèmes avec les timestamps
        const dateEcheanceKey = relance.dateEcheance ? getDateKey(relance.dateEcheance) : 'no-date';
        const key = `${relance.entityType || 'no-type'}-${relance.entityId || 'no-id'}-${relance.titre || 'no-title'}-${dateEcheanceKey}`;
        
        if (seen.has(key)) {
          const existing = seen.get(key);
          analysis.duplicates.push({
            original: existing,
            duplicate: relance,
            key
          });
        } else {
          seen.set(key, relance);
        }
      });

      // Détecter les patterns suspects
      // 1. Plus de 10 relances créées dans la même minute
      const minuteGroups = {};
      relances.forEach(relance => {
        const minuteKey = getMinuteKey(relance.createdAt || relance.dateCreation);
        
        if (!minuteGroups[minuteKey]) {
          minuteGroups[minuteKey] = [];
        }
        minuteGroups[minuteKey].push(relance);
      });

      Object.entries(minuteGroups).forEach(([minute, items]) => {
        if (items.length > 10) {
          analysis.suspicious.push({
            type: 'burst',
            minute,
            count: items.length,
            items: items.slice(0, 5)
          });
        }
      });

      // 2. Relances avec des données manquantes ou invalides
      relances.forEach(relance => {
        const issues = [];
        if (!relance.titre) issues.push('Titre manquant');
        if (!relance.dateEcheance) issues.push('Date échéance manquante');
        if (!relance.entityType) issues.push('Type entité manquant');
        if (!relance.userId) issues.push('UserId manquant');
        
        if (issues.length > 0) {
          analysis.suspicious.push({
            type: 'invalid_data',
            relance,
            issues
          });
        }
      });

      setAuditResults(analysis);
      setProgress('');
    } catch (err) {
      console.error('Erreur lors de l\'audit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Nettoyer les doublons
  const cleanDuplicates = async () => {
    if (!auditResults?.duplicates?.length) return;

    const confirmDelete = window.confirm(
      `Voulez-vous supprimer ${auditResults.duplicates.length} doublons détectés ?`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setProgress('Suppression des doublons...');

    try {
      const batch = writeBatch(db);
      let count = 0;

      auditResults.duplicates.forEach(({ duplicate }) => {
        const docRef = doc(db, 'relances', duplicate.id);
        batch.delete(docRef);
        count++;
      });

      await batch.commit();
      setProgress(`${count} doublons supprimés avec succès`);
      
      // Relancer l'audit
      setTimeout(() => runAudit(), 1000);
    } catch (err) {
      console.error('Erreur lors du nettoyage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer les relances d'une période burst
  const cleanBurst = async (minute, count) => {
    const confirmDelete = window.confirm(
      `Voulez-vous supprimer les ${count} relances créées à ${minute} ?`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setProgress('Suppression des relances en rafale...');

    try {
      const relancesRef = collection(db, 'relances');
      const q = query(relancesRef, where('organizationId', '==', currentOrganization.id));
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      let deleteCount = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docMinute = getMinuteKey(data.createdAt || data.dateCreation);
        
        if (docMinute === minute) {
          batch.delete(doc(db, 'relances', docSnap.id));
          deleteCount++;
        }
      });

      await batch.commit();
      setProgress(`${deleteCount} relances supprimées`);
      
      // Relancer l'audit
      setTimeout(() => runAudit(), 1000);
    } catch (err) {
      console.error('Erreur lors du nettoyage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.container}>
      <Card.Header>
        <h5 className="mb-0">🔍 Audit des relances automatiques</h5>
      </Card.Header>
      <Card.Body>
        <div className={styles.info}>
          <p>Organisation : <strong>{currentOrganization?.name || 'Non sélectionnée'}</strong></p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {progress && (
          <Alert variant="info" className="mb-3">
            <span className="spinner-border spinner-border-sm me-2" />
            {progress}
          </Alert>
        )}

        {fixResult && (
          <Alert variant="success" className="mb-3">
            <i className="bi bi-check-circle me-2"></i>
            <strong>Correction effectuée avec succès !</strong>
            <ul className="mb-0 mt-2">
              <li>{fixResult.duplicatesRemoved} doublons supprimés</li>
              <li>{fixResult.concertsProcessed} concerts marqués comme traités</li>
              <li>Relances automatiques désactivées pour 5 minutes</li>
            </ul>
          </Alert>
        )}

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={runAudit}
            disabled={loading || !currentOrganization?.id}
          >
            <i className="bi bi-search me-2"></i>
            Lancer l'audit
          </Button>

          <Button
            variant="danger"
            onClick={fixLoop}
            disabled={loading || !currentOrganization?.id}
          >
            <i className="bi bi-tools me-2"></i>
            Corriger le problème de boucle
          </Button>
        </div>

        {auditResults && (
          <div className={styles.results}>
            <h6>📊 Résultats de l'audit</h6>
            
            {/* Vue d'ensemble */}
            <div className={styles.overview}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total relances</span>
                <span className={styles.statValue}>{auditResults.total}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Doublons détectés</span>
                <span className={styles.statValue}>{auditResults.duplicates.length}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Créées dernière heure</span>
                <span className={styles.statValue}>{auditResults.recentBurst.length}</span>
              </div>
            </div>

            {/* Alertes */}
            {auditResults.suspicious.filter(s => s.type === 'burst').length > 0 && (
              <Alert variant="warning" className="mt-3">
                <h6>⚠️ Création en rafale détectée</h6>
                {auditResults.suspicious
                  .filter(s => s.type === 'burst')
                  .map((burst, idx) => (
                    <div key={idx} className="mb-2">
                      <strong>{burst.count} relances</strong> créées à {burst.minute}
                      <Button
                        size="sm"
                        variant="danger"
                        className="ms-2"
                        onClick={() => cleanBurst(burst.minute, burst.count)}
                      >
                        Supprimer cette rafale
                      </Button>
                    </div>
                  ))}
              </Alert>
            )}

            {/* Doublons */}
            {auditResults.duplicates.length > 0 && (
              <div className={styles.section}>
                <h6>
                  🔄 Doublons détectés ({auditResults.duplicates.length})
                  <Button
                    size="sm"
                    variant="warning"
                    className="ms-2"
                    onClick={cleanDuplicates}
                  >
                    Nettoyer tous les doublons
                  </Button>
                </h6>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Date échéance</th>
                      <th>Créée le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditResults.duplicates.slice(0, 10).map((dup, idx) => (
                      <tr key={idx}>
                        <td>{makeSafeForDisplay(dup.duplicate.titre, 'Sans titre')}</td>
                        <td>{makeSafeForDisplay(dup.duplicate.entityType, 'Non défini')}</td>
                        <td>{formatDateSafely(dup.duplicate.dateEcheance)}</td>
                        <td>{formatDateSafely(dup.duplicate.createdAt || dup.duplicate.dateCreation)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {auditResults.duplicates.length > 10 && (
                  <p className="text-muted">... et {auditResults.duplicates.length - 10} autres</p>
                )}
              </div>
            )}

            {/* Création par jour */}
            <div className={styles.section}>
              <h6>📅 Création par jour</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Nombre</th>
                    <th>Exemples</th>
                  </tr>
                </thead>
                <tbody>
                  {auditResults.byCreatedDate.map((day, idx) => (
                    <tr key={idx} className={day.count > 100 ? styles.alertRow : ''}>
                      <td>{day.date}</td>
                      <td>{day.count}</td>
                      <td>{day.items.map(i => makeSafeForDisplay(i.titre, 'Sans titre')).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RelancesAuditTool;