import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, ProgressBar, Badge, ListGroup, Tab, Tabs } from 'react-bootstrap';
import { FaSync, FaCloudUploadAlt, FaCloudDownloadAlt, FaSave, FaUpload, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as syncService from '../../../services/syncService';
import { IS_LOCAL_MODE, CURRENT_MODE } from '../../../firebaseInit';
import styles from './SyncManager.module.css';

/**
 * Composant de gestion de la synchronisation des données entre local et Firebase
 */
const SyncManager = () => {
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState({
    concerts: true,
    lieux: true,
    programmateurs: true,
    artistes: true,
    structures: true
  });
  const [autoSyncInterval, setAutoSyncInterval] = useState(30);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [stopAutoSync, setStopAutoSync] = useState(null);
  const [backupFile, setBackupFile] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  
  // Gérer l'arrêt de la synchronisation automatique lorsque le composant est démonté
  useEffect(() => {
    return () => {
      if (stopAutoSync) stopAutoSync();
    };
  }, [stopAutoSync]);

  // Obtenir les collections sélectionnées
  const getSelectedCollections = () => {
    return Object.entries(collections)
      .filter(([_, isSelected]) => isSelected)
      .map(([name]) => name);
  };

  // Exporter les données locales vers Firebase
  const handleExport = async () => {
    const selectedCollections = getSelectedCollections();
    
    if (selectedCollections.length === 0) {
      toast.warning('Veuillez sélectionner au moins une collection à exporter');
      return;
    }
    
    setLoading(true);
    setExportProgress(0);
    
    try {
      // Simulation de progression
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 5, 90));
      }, 300);
      
      const success = await syncService.exportLocalDataToFirebase(selectedCollections);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      if (success) {
        toast.success('Exportation réussie vers Firebase');
      } else {
        toast.error('Erreur lors de l\'exportation vers Firebase');
      }
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      toast.error('Erreur lors de l\'exportation: ' + error.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  // Importer les données depuis Firebase
  const handleImport = async () => {
    const selectedCollections = getSelectedCollections();
    
    if (selectedCollections.length === 0) {
      toast.warning('Veuillez sélectionner au moins une collection à importer');
      return;
    }
    
    setLoading(true);
    setImportProgress(0);
    
    try {
      // Simulation de progression
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 5, 90));
      }, 300);
      
      const success = await syncService.importFirebaseDataToLocal(selectedCollections);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      
      if (success) {
        toast.success('Importation réussie depuis Firebase');
      } else {
        toast.error('Erreur lors de l\'importation depuis Firebase');
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      toast.error('Erreur lors de l\'importation: ' + error.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setImportProgress(0);
      }, 1000);
    }
  };

  // Gérer la sauvegarde des données locales
  const handleBackup = () => {
    try {
      const success = syncService.backupLocalData();
      if (success) {
        toast.success('Sauvegarde des données locales réussie');
      } else {
        toast.error('Erreur lors de la sauvegarde des données locales');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde: ' + error.message);
    }
  };

  // Gérer la restauration des données locales
  const handleRestore = async () => {
    if (!backupFile) {
      toast.warning('Veuillez sélectionner un fichier de sauvegarde');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await syncService.restoreLocalData(backupFile);
      if (success) {
        toast.success('Restauration des données réussie');
        setBackupFile(null);
      } else {
        toast.error('Erreur lors de la restauration des données');
      }
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      toast.error('Erreur lors de la restauration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Activer/désactiver la synchronisation automatique
  const toggleAutoSync = () => {
    if (isAutoSyncEnabled && stopAutoSync) {
      stopAutoSync();
      setStopAutoSync(null);
      setIsAutoSyncEnabled(false);
      toast.info('Synchronisation automatique désactivée');
    } else {
      const stop = syncService.enableAutoSync(autoSyncInterval);
      setStopAutoSync(() => stop);
      setIsAutoSyncEnabled(true);
      toast.info(`Synchronisation automatique activée (${autoSyncInterval} minutes)`);
    }
  };

  // Si nous sommes en mode production, ne pas afficher cette interface
  if (CURRENT_MODE === 'production') {
    return (
      <Alert variant="warning">
        <Alert.Heading>Mode Production</Alert.Heading>
        <p>
          La gestion de synchronisation n'est pas disponible en mode production.
          Veuillez passer en mode développement pour accéder à ces fonctionnalités.
        </p>
      </Alert>
    );
  }

  return (
    <Card className="sync-manager">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <FaSync className="me-2" /> Gestion de la Synchronisation
        </div>
        <Badge bg={IS_LOCAL_MODE ? "info" : "warning"}>
          {IS_LOCAL_MODE ? "MODE LOCAL" : "MODE DÉVELOPPEMENT"}
        </Badge>
      </Card.Header>
      <Card.Body>
        <Alert variant="info">
          <p>
            Ce panneau vous permet de synchroniser les données entre votre environnement local et Firebase.
            Utilisez ces fonctionnalités avec précaution pour éviter toute perte de données.
          </p>
        </Alert>

        <Tabs defaultActiveKey="sync" id="sync-manager-tabs" className="mb-3">
          <Tab eventKey="sync" title="Synchronisation" className="p-3">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Sélectionnez les collections à synchroniser :</Form.Label>
                <ListGroup className="mt-2">
                  {Object.entries(collections).map(([name, isSelected]) => (
                    <ListGroup.Item 
                      key={name}
                      className={`d-flex justify-content-between align-items-center ${isSelected ? 'list-group-item-primary' : ''} ${styles.clickableItem}`}
                      onClick={() => setCollections({...collections, [name]: !isSelected})}
                    >
                      <div className="d-flex align-items-center">
                        <Form.Check 
                          type="checkbox"
                          id={`collection-${name}`}
                          checked={isSelected}
                          onChange={e => setCollections({...collections, [name]: e.target.checked})}
                          className={`me-3 ${styles.disabledPointer}`}
                        />
                        <div>
                          <strong>{name.charAt(0).toUpperCase() + name.slice(1)}</strong>
                          <div className="text-muted small">
                            {name === 'concerts' && 'Événements et spectacles'}
                            {name === 'lieux' && 'Salles et venues'}
                            {name === 'programmateurs' && 'Contacts et organisateurs'}
                            {name === 'artistes' && 'Musiciens et groupes'}
                            {name === 'structures' && 'Entreprises et associations'}
                          </div>
                        </div>
                      </div>
                      <Badge bg={isSelected ? 'success' : 'secondary'}>
                        {isSelected ? 'Sélectionné' : 'Non sélectionné'}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Form.Group>
            </Form>

            <div className="d-flex mb-3 gap-2">
              <Button 
                variant="primary" 
                onClick={handleExport} 
                disabled={loading}
                className="flex-grow-1"
              >
                <FaCloudUploadAlt className="me-2" /> Exporter vers Firebase
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleImport} 
                disabled={loading}
                className="flex-grow-1"
              >
                <FaCloudDownloadAlt className="me-2" /> Importer depuis Firebase
              </Button>
            </div>

            {exportProgress > 0 && (
              <div className="mb-3">
                <Form.Label>Exportation en cours...</Form.Label>
                <ProgressBar 
                  animated 
                  now={exportProgress} 
                  label={`${exportProgress}%`} 
                  variant="primary" 
                />
              </div>
            )}

            {importProgress > 0 && (
              <div className="mb-3">
                <Form.Label>Importation en cours...</Form.Label>
                <ProgressBar 
                  animated 
                  now={importProgress} 
                  label={`${importProgress}%`} 
                  variant="secondary" 
                />
              </div>
            )}
          </Tab>

          <Tab eventKey="backup" title="Sauvegarde & Restauration" className="p-3">
            <div className="mb-4">
              <h5>Sauvegarde des données locales</h5>
              <p>
                Créez une sauvegarde de vos données locales dans un fichier JSON que vous pourrez 
                restaurer ultérieurement.
              </p>
              <Button 
                variant="success" 
                onClick={handleBackup} 
                disabled={loading}
              >
                <FaSave className="me-2" /> Télécharger Sauvegarde
              </Button>
            </div>

            <div className="mb-3">
              <h5>Restauration des données</h5>
              <p>
                Restaurez vos données à partir d'un fichier de sauvegarde JSON précédemment créé.
              </p>
              <Form.Group controlId="backupFile" className="mb-3">
                <Form.Label>Sélectionner le fichier de sauvegarde</Form.Label>
                <Form.Control 
                  type="file" 
                  accept=".json" 
                  onChange={e => setBackupFile(e.target.files[0])} 
                  disabled={loading}
                />
              </Form.Group>
              <Button 
                variant="warning" 
                onClick={handleRestore} 
                disabled={loading || !backupFile}
              >
                <FaUpload className="me-2" /> Restaurer les données
              </Button>
            </div>
          </Tab>

          <Tab eventKey="autosync" title="Synchronisation Auto" className="p-3">
            <div className="mb-3">
              <h5>Synchronisation Automatique</h5>
              <p>
                Activez la synchronisation automatique pour envoyer périodiquement vos modifications 
                locales vers Firebase.
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Intervalle de synchronisation (minutes)</Form.Label>
                <Form.Control 
                  type="number" 
                  min="5" 
                  max="120"
                  value={autoSyncInterval}
                  onChange={e => setAutoSyncInterval(parseInt(e.target.value) || 30)}
                  disabled={isAutoSyncEnabled || loading}
                />
              </Form.Group>

              <Button 
                variant={isAutoSyncEnabled ? "danger" : "info"} 
                onClick={toggleAutoSync}
                disabled={loading}
              >
                <FaClock className="me-2" /> 
                {isAutoSyncEnabled ? "Désactiver" : "Activer"} la Synchronisation Auto
              </Button>

              {isAutoSyncEnabled && (
                <Alert variant="info" className="mt-3">
                  <small>La synchronisation automatique est activée. Vos données seront envoyées 
                  vers Firebase toutes les {autoSyncInterval} minutes.</small>
                </Alert>
              )}
            </div>
          </Tab>
        </Tabs>
      </Card.Body>
      <Card.Footer className="text-muted">
        <small>
          Mode actuel : <strong>{CURRENT_MODE}</strong> | 
          Le mode local permet de travailler hors ligne et de synchroniser les données lorsque vous êtes prêt.
        </small>
      </Card.Footer>
    </Card>
  );
};

export default SyncManager;