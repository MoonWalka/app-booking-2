import React, { useState, useEffect } from 'react';
import { Card, Form, Alert } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import { RELANCES_CONFIG } from '@/config/relancesAutomatiquesConfig';
import styles from './RelancesAutomatiquesConfig.module.css';

/**
 * Composant de configuration des relances automatiques
 * Permet aux administrateurs de configurer le comportement des relances
 */
const RelancesAutomatiquesConfig = () => {
  const [config, setConfig] = useState(RELANCES_CONFIG);
  const [saved, setSaved] = useState(false);

  // Charger la configuration depuis le localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('relances_auto_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...RELANCES_CONFIG, ...parsed });
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Sauvegarder dans le localStorage
    localStorage.setItem('relances_auto_config', JSON.stringify(config));
    
    // Mettre à jour la configuration globale
    Object.assign(RELANCES_CONFIG, config);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaultConfig = {
      enabled: true,
      watcherEnabled: false,
      evaluationCooldown: 30000,
      evaluationDelay: 5000,
      maxRelancesPerConcert: 10,
      triggerStrategy: 'form-only'
    };
    setConfig(defaultConfig);
  };

  return (
    <Card className={styles.container}>
      <Card.Header>
        <h5 className="mb-0">⚙️ Configuration des relances automatiques</h5>
      </Card.Header>
      <Card.Body>
        {saved && (
          <Alert variant="success" dismissible onClose={() => setSaved(false)}>
            Configuration sauvegardée avec succès !
          </Alert>
        )}

        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          Ces paramètres permettent de contrôler le comportement des relances automatiques 
          pour éviter les créations en boucle.
        </Alert>

        <Form>
          {/* Activation globale */}
          <Form.Group className="mb-4">
            <Form.Check
              type="switch"
              id="enabled"
              label="Activer les relances automatiques"
              checked={config.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
            />
            <Form.Text className="text-muted">
              Désactiver complètement les relances automatiques si nécessaire
            </Form.Text>
          </Form.Group>

          {/* Stratégie de déclenchement */}
          <Form.Group className="mb-4">
            <Form.Label>Stratégie de déclenchement</Form.Label>
            <Form.Select
              value={config.triggerStrategy}
              onChange={(e) => handleChange('triggerStrategy', e.target.value)}
              disabled={!config.enabled}
            >
              <option value="form-only">Formulaire uniquement (recommandé)</option>
              <option value="watcher-only">Surveillance uniquement</option>
              <option value="both">Les deux (risque de doublons)</option>
            </Form.Select>
            <Form.Text className="text-muted">
              "Formulaire uniquement" évite les déclenchements en double
            </Form.Text>
          </Form.Group>

          {/* Watcher */}
          {config.triggerStrategy !== 'form-only' && (
            <Form.Group className="mb-4">
              <Form.Check
                type="switch"
                id="watcherEnabled"
                label="Activer la surveillance des changements (Watcher)"
                checked={config.watcherEnabled}
                onChange={(e) => handleChange('watcherEnabled', e.target.checked)}
                disabled={!config.enabled}
              />
              <Form.Text className="text-muted">
                ⚠️ Peut causer des boucles si mal configuré
              </Form.Text>
            </Form.Group>
          )}

          {/* Délais */}
          <Form.Group className="mb-3">
            <Form.Label>Délai minimum entre évaluations (secondes)</Form.Label>
            <Form.Control
              type="number"
              value={config.evaluationCooldown / 1000}
              onChange={(e) => handleChange('evaluationCooldown', parseInt(e.target.value) * 1000)}
              min="5"
              max="300"
              disabled={!config.enabled}
            />
            <Form.Text className="text-muted">
              Empêche les évaluations trop rapprochées pour le même concert
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Délai avant évaluation (secondes)</Form.Label>
            <Form.Control
              type="number"
              value={config.evaluationDelay / 1000}
              onChange={(e) => handleChange('evaluationDelay', parseInt(e.target.value) * 1000)}
              min="0"
              max="60"
              disabled={!config.enabled}
            />
            <Form.Text className="text-muted">
              Attend X secondes après une modification avant d'évaluer
            </Form.Text>
          </Form.Group>

          {/* Limites */}
          <Form.Group className="mb-4">
            <Form.Label>Maximum de relances par concert</Form.Label>
            <Form.Control
              type="number"
              value={config.maxRelancesPerConcert}
              onChange={(e) => handleChange('maxRelancesPerConcert', parseInt(e.target.value))}
              min="1"
              max="50"
              disabled={!config.enabled}
            />
            <Form.Text className="text-muted">
              Limite de sécurité pour éviter la création excessive
            </Form.Text>
          </Form.Group>

          {/* Actions */}
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={handleSave}
            >
              <i className="bi bi-check-circle me-2"></i>
              Sauvegarder
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleReset}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Réinitialiser
            </Button>
          </div>
        </Form>

        <Alert variant="warning" className="mt-4">
          <h6>⚠️ Configuration recommandée pour éviter les boucles :</h6>
          <ul className="mb-0">
            <li>Stratégie : "Formulaire uniquement"</li>
            <li>Watcher : Désactivé</li>
            <li>Délai minimum : 30 secondes</li>
            <li>Maximum par concert : 10</li>
          </ul>
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default RelancesAutomatiquesConfig;