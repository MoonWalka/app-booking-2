import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import styles from './ParametresExport.module.css';
import { useParametres } from '@/context/ParametresContext';
import { db, collection, getDocs, query } from '@/firebaseInit';

const ParametresExport = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState(parametres.export || {
    formatParDefaut: 'json',
    sauvegardeAuto: true,
    frequenceSauvegarde: 'daily'
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (parametres.export) {
      setLocalState(parametres.export);
    }
  }, [parametres.export]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sauvegarderParametres('export', localState);
    if (success) {
      setSuccess('Préférences d\'export mises à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const exportData = async (collectionName) => {
    setExportProgress(0);
    setExportStatus(`Export des ${collectionName} en cours...`);
    setError('');
    
    try {
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);
      const data = [];
      let progress = 0;
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
        progress += (100 / querySnapshot.size);
        setExportProgress(Math.round(progress));
      });

      const format = localState.formatParDefaut;
      let exportData;
      let fileName;
      let mimeType;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(data, null, 2);
          fileName = `${collectionName}_${new Date().toISOString()}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          // Conversion en CSV
          const headers = Object.keys(data[0] || {}).join(',');
          const rows = data.map(item => Object.values(item).join(','));
          exportData = [headers, ...rows].join('\n');
          fileName = `${collectionName}_${new Date().toISOString()}.csv`;
          mimeType = 'text/csv';
          break;
        default:
          throw new Error('Format non supporté');
      }

      // Création et téléchargement du fichier
      const blob = new Blob([exportData], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus('Export terminé');
      setSuccess(`Export des ${collectionName} terminé avec succès`);
      setTimeout(() => {
        setExportProgress(0);
        setExportStatus('');
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(`Erreur lors de l'export: ${err.message}`);
      setExportStatus('');
      setExportProgress(0);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Export et Sauvegarde</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <div className={styles.exportSection}>
          <h5 className={styles.sectionTitle}>Export des données</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Format d'export</Form.Label>
              <Form.Select
                name="formatParDefaut"
                value={localState.formatParDefaut}
                onChange={handleChange}
                className="mb-3"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </Form.Select>
            </Form.Group>

            <div className={styles.exportButtons}>
              <Button 
                variant="outline-primary" 
                onClick={() => exportData('concerts')}
              >
                Exporter les concerts
              </Button>
              <Button 
                variant="outline-primary"
                onClick={() => exportData('contrats')}
              >
                Exporter les contrats
              </Button>
              <Button 
                variant="outline-primary"
                onClick={() => exportData('artistes')}
              >
                Exporter les artistes
              </Button>
            </div>

            {exportStatus && (
              <div className={styles.exportProgress}>
                <small className={styles.exportStatus}>{exportStatus}</small>
                <ProgressBar now={exportProgress} label={`${exportProgress}%`} />
              </div>
            )}
          </Form>
        </div>

        <div className={styles.backupSection}>
          <h5 className={styles.sectionTitle}>Sauvegarde automatique</h5>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="sauvegarde-auto"
                label="Activer la sauvegarde automatique"
                name="sauvegardeAuto"
                checked={localState.sauvegardeAuto}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fréquence de sauvegarde</Form.Label>
              <Form.Select
                name="frequenceSauvegarde"
                value={localState.frequenceSauvegarde}
                onChange={handleChange}
                disabled={!localState.sauvegardeAuto}
              >
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </Form.Select>
            </Form.Group>

            <div className={styles.formActions}>
              <Button 
                variant="warning" 
                type="button"
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir restaurer la dernière sauvegarde ?')) {
                    // Logique de restauration à implémenter
                  }
                }}
              >
                Restaurer la dernière sauvegarde
              </Button>

              <Button type="submit" variant="primary">
                Enregistrer les préférences
              </Button>
            </div>
          </Form>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ParametresExport;
