import React, { useState } from 'react';
import { Button, Alert, Card, ProgressBar, Table, Badge } from 'react-bootstrap';
import { collection, getDocs, doc, setDoc, updateDoc, deleteField, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
// Utilisation de styles inline pour éviter les problèmes de module CSS

/**
 * Outil de migration concerts → dates
 * Permet de migrer la collection concerts vers dates et mettre à jour toutes les références
 */
const MigrationConcertToDate = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('dry-run'); // 'dry-run' ou 'production'
  
  const BATCH_SIZE = 500;

  /**
   * Étape 1: Copier tous les documents de concerts vers dates
   */
  const migrateConcertsCollection = async (dryRun = true) => {
    setStatus('Migration de la collection concerts → dates...');
    
    const concertsRef = collection(db, 'concerts');
    const datesRef = collection(db, 'dates');
    
    const snapshot = await getDocs(concertsRef);
    console.log(`Nombre de documents à migrer: ${snapshot.size}`);
    
    if (snapshot.empty) {
      return { migrated: 0, total: 0 };
    }
    
    let migrated = 0;
    const batch = writeBatch(db);
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      if (!dryRun) {
        batch.set(doc(datesRef, docSnap.id), {
          ...data,
          _migratedFrom: 'concerts',
          _migrationDate: serverTimestamp()
        });
      }
      
      migrated++;
      setProgress((migrated / snapshot.size) * 33); // 33% pour cette étape
      
      // Commit par batch
      if (migrated % BATCH_SIZE === 0 && !dryRun) {
        await batch.commit();
      }
    }
    
    // Commit final
    if (!dryRun && migrated % BATCH_SIZE !== 0) {
      await batch.commit();
    }
    
    return { migrated, total: snapshot.size };
  };

  /**
   * Étape 2: Mettre à jour les références dans les autres collections
   */
  const updateReferences = async (dryRun = true) => {
    setStatus('Mise à jour des références dans les autres collections...');
    
    const collectionsToUpdate = [
      {
        name: 'artistes',
        fields: ['concertsIds', 'concertsAssocies'],
        newFields: ['datesIds', 'datesAssociees']
      },
      {
        name: 'lieux',
        fields: ['concertsIds', 'concertsAssocies'],
        newFields: ['datesIds', 'datesAssociees']
      },
      {
        name: 'structures',
        fields: ['concertsIds'],
        newFields: ['datesIds']
      },
      {
        name: 'contacts',
        fields: ['concertsIds'],
        newFields: ['datesIds']
      }
    ];
    
    const updateStats = {};
    let totalUpdated = 0;
    let totalChecked = 0;
    
    for (const [index, collectionConfig] of collectionsToUpdate.entries()) {
      const snapshot = await getDocs(collection(db, collectionConfig.name));
      let updated = 0;
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let needsUpdate = false;
        const updates = {};
        
        // Vérifier chaque champ
        collectionConfig.fields.forEach((field, fieldIndex) => {
          if (data[field] !== undefined) {
            needsUpdate = true;
            updates[collectionConfig.newFields[fieldIndex]] = data[field];
            updates[field] = deleteField();
          }
        });
        
        if (needsUpdate) {
          if (!dryRun) {
            await updateDoc(doc(db, collectionConfig.name, docSnap.id), updates);
          }
          updated++;
          totalUpdated++;
        }
        
        totalChecked++;
        setProgress(33 + ((index + 1) / collectionsToUpdate.length) * 33); // 33-66%
      }
      
      updateStats[collectionConfig.name] = {
        checked: snapshot.size,
        updated
      };
    }
    
    return { updateStats, totalUpdated, totalChecked };
  };

  /**
   * Étape 3: Vérification post-migration
   */
  const verifyMigration = async () => {
    setStatus('Vérification de la migration...');
    
    const concertsCount = (await getDocs(collection(db, 'concerts'))).size;
    const datesCount = (await getDocs(collection(db, 'dates'))).size;
    
    setProgress(100);
    
    return {
      concertsCount,
      datesCount,
      status: concertsCount === datesCount ? 'success' : 
              concertsCount === 0 && datesCount > 0 ? 'already_done' : 
              'verification_needed'
    };
  };

  /**
   * Exécuter la migration complète
   */
  const executeMigration = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    setProgress(0);
    
    const isDryRun = mode === 'dry-run';
    
    try {
      // Confirmation pour le mode production
      if (!isDryRun) {
        const confirmed = window.confirm(
          '⚠️ ATTENTION: Vous êtes sur le point de migrer définitivement la collection concerts vers dates.\n\n' +
          'Cette action est IRRÉVERSIBLE.\n\n' +
          'Avez-vous fait un BACKUP complet de votre base de données ?\n\n' +
          'Cliquez OK pour continuer ou Annuler pour arrêter.'
        );
        
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }
      
      const startTime = new Date();
      
      // Étape 1: Migration des documents
      const migrationResult = await migrateConcertsCollection(isDryRun);
      
      // Étape 2: Mise à jour des références
      const referencesResult = await updateReferences(isDryRun);
      
      // Étape 3: Vérification
      const verificationResult = await verifyMigration();
      
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);
      
      // Créer le rapport
      setReport({
        mode: isDryRun ? 'Test (Dry Run)' : 'Production',
        timestamp: new Date().toISOString(),
        duration: `${duration} secondes`,
        migration: migrationResult,
        references: referencesResult,
        verification: verificationResult
      });
      
    } catch (err) {
      console.error('Erreur lors de la migration:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-3">
      <Card.Header>
        <h5>🔄 Migration concerts → dates</h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="warning">
          <strong>⚠️ Important :</strong>
          <ul className="mb-0">
            <li>Cette migration transforme la collection "concerts" en "dates"</li>
            <li>Met à jour toutes les références dans les autres collections</li>
            <li>Faites un <strong>BACKUP COMPLET</strong> avant la migration en production</li>
          </ul>
        </Alert>

        {!report && (
          <>
            <div className="mb-3">
              <h6>Mode de migration :</h6>
              <div className="btn-group" role="group">
                <Button
                  variant={mode === 'dry-run' ? 'primary' : 'outline-primary'}
                  onClick={() => setMode('dry-run')}
                  disabled={loading}
                >
                  Test (Dry Run)
                </Button>
                <Button
                  variant={mode === 'production' ? 'danger' : 'outline-danger'}
                  onClick={() => setMode('production')}
                  disabled={loading}
                >
                  Production
                </Button>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {mode === 'dry-run' 
                    ? '✅ Mode test : aucune modification ne sera effectuée'
                    : '⚠️ Mode production : les modifications seront définitives'}
                </small>
              </div>
            </div>

            <Button
              variant={mode === 'dry-run' ? 'info' : 'danger'}
              onClick={executeMigration}
              disabled={loading}
              className="mb-3"
            >
              {loading ? 'Migration en cours...' : `Lancer la migration (${mode === 'dry-run' ? 'Test' : 'Production'})`}
            </Button>
          </>
        )}

        {loading && (
          <div className="mb-3">
            <ProgressBar 
              animated 
              now={progress} 
              label={`${Math.round(progress)}%`}
              variant="info"
            />
            <p className="mt-2 text-center">{status}</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            <strong>Erreur :</strong> {error}
          </Alert>
        )}

        {report && (
          <div>
            <Alert variant={report.mode.includes('Test') ? 'info' : 'success'}>
              <h6>📊 Rapport de migration - {report.mode}</h6>
              <small>Généré le : {new Date(report.timestamp).toLocaleString('fr-FR')}</small>
              <br />
              <small>Durée : {report.duration}</small>
            </Alert>

            <h6>📂 Migration des documents</h6>
            <Table striped bordered size="sm" className="mb-3">
              <tbody>
                <tr>
                  <td>Documents à migrer</td>
                  <td>{report.migration.total}</td>
                </tr>
                <tr>
                  <td>Documents {report.mode.includes('Test') ? 'qui seraient migrés' : 'migrés'}</td>
                  <td>
                    <Badge bg="success">{report.migration.migrated}</Badge>
                  </td>
                </tr>
              </tbody>
            </Table>

            <h6>📝 Mise à jour des références</h6>
            <Table striped bordered size="sm" className="mb-3">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Documents vérifiés</th>
                  <th>Documents {report.mode.includes('Test') ? 'à mettre à jour' : 'mis à jour'}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.references.updateStats).map(([collection, stats]) => (
                  <tr key={collection}>
                    <td>{collection}</td>
                    <td>{stats.checked}</td>
                    <td>
                      <Badge bg={stats.updated > 0 ? 'warning' : 'secondary'}>
                        {stats.updated}
                      </Badge>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{report.references.totalChecked}</strong></td>
                  <td>
                    <Badge bg="warning">
                      <strong>{report.references.totalUpdated}</strong>
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </Table>

            <h6>🔍 Vérification</h6>
            <Table striped bordered size="sm" className="mb-3">
              <tbody>
                <tr>
                  <td>Documents dans "concerts"</td>
                  <td>{report.verification.concertsCount}</td>
                </tr>
                <tr>
                  <td>Documents dans "dates"</td>
                  <td>{report.verification.datesCount}</td>
                </tr>
                <tr>
                  <td>Statut</td>
                  <td>
                    <Badge bg={
                      report.verification.status === 'success' ? 'success' :
                      report.verification.status === 'already_done' ? 'info' :
                      'warning'
                    }>
                      {report.verification.status === 'success' ? 'Migration réussie' :
                       report.verification.status === 'already_done' ? 'Déjà migrée' :
                       'Vérification requise'}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </Table>

            {report.mode.includes('Production') && (
              <Alert variant="success">
                <h6>✅ Prochaines étapes :</h6>
                <ol className="mb-0">
                  <li>Testez l'application complètement</li>
                  <li>Mettez à jour les règles de sécurité Firebase</li>
                  <li>Une fois validé, supprimez l'ancienne collection "concerts"</li>
                </ol>
              </Alert>
            )}

            <Button 
              variant="secondary" 
              onClick={() => {
                setReport(null);
                setProgress(0);
                setStatus('');
              }}
            >
              Nouvelle migration
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MigrationConcertToDate;