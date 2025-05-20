import React, { useState, useEffect } from 'react';
// Import des composants UI standards de TourCraft
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import ErrorMessage from '@components/ui/ErrorMessage';
// Import des composants React Bootstrap
import { Form, Row, Col } from 'react-bootstrap';

/* 
 * Note: les importations ont été mises à jour le 20/05/2025
 * Les anciens imports de @ui/... ont été remplacés par:
 * 1. @components/ui/... pour les composants UI personnalisés TourCraft
 * 2. react-bootstrap pour les composants de formulaire standards
 */

// Import de votre CSS module
import styles from './ParametresApparence.module.css';
import { useParametres } from '@/context/ParametresContext';

const ParametresApparence = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [originalAppearance, setOriginalAppearance] = useState(null);
  const [localState, setLocalState] = useState(parametres.apparence || {
    theme: 'light',
    couleurPrincipale: '#1e3a5f', // Utilisez la valeur par défaut de --tc-primary-color
    taillePolicePx: 16,
    animations: true,
    compactMode: false,
    menuPosition: 'left'
  });
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (parametres.apparence && !originalAppearance) {
      setOriginalAppearance({
        ...parametres.apparence
      });
      setLocalState(parametres.apparence);
    }
  }, [parametres.apparence, originalAppearance]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (name === 'couleurPrincipale') {
      const colorPicker = document.getElementById('colorPreview');
      if (colorPicker) {
        colorPicker.style.backgroundColor = value;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sauvegarderParametres('apparence', localState);
    if (success) {
      setSuccess('Préférences d\'apparence mises à jour avec succès');
      
      // Appliquer les changements aux variables CSS globales
      document.documentElement.style.setProperty('--tc-primary-color', localState.couleurPrincipale);
      document.documentElement.style.setProperty('--tc-font-size-base', `${localState.taillePolicePx}px`);
      document.body.setAttribute('data-theme', localState.theme);
      
      // Mettre à jour les variables dérivées
      const primaryRGB = hexToRgb(localState.couleurPrincipale);
      if (primaryRGB) {
        document.documentElement.style.setProperty('--tc-primary-color-rgb', primaryRGB);
      }
      
      setOriginalAppearance(localState);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Fonction utilitaire pour convertir HEX en RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  const handleReset = () => {
    const defaultState = {
      theme: 'light',
      couleurPrincipale: '#1e3a5f', // Valeur par défaut de --tc-primary-color
      taillePolicePx: 16,
      animations: true,
      compactMode: false,
      menuPosition: 'left'
    };
    setLocalState(defaultState);
  };
  
  const handleCancel = () => {
    if (originalAppearance) {
      setLocalState(originalAppearance);
      document.documentElement.style.setProperty('--tc-primary-color', originalAppearance.couleurPrincipale);
      document.documentElement.style.setProperty('--tc-font-size-base', `${originalAppearance.taillePolicePx}px`);
    }
  };

  if (loading) {
    return <div className="tc-loading">Chargement...</div>;
  }

  return (
    <Card className={styles.card}>
      <Card.Header className={styles.cardHeader}>
        <Card.Title className={styles.cardTitle}>Apparence</Card.Title>
      </Card.Header>
      <Card.Body className={styles.cardBody}>
        {success && <ErrorMessage variant="success" className={styles.successAlert}>{success}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit} className={styles.form}>
          <Row>
            <Col md={6}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>Thème</Form.Label>
                <Form.Select
                  name="theme"
                  value={localState.theme}
                  onChange={handleChange}
                  className={styles.formControl}
                >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </Form.Select>
          </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>Couleur principale</Form.Label>
                <div className={styles.colorPreviewContainer}>
                  <div 
                    id="colorPreview" 
                    className={styles.colorPreview} 
                    style={{ backgroundColor: localState.couleurPrincipale }}
                  />
                  <Form.Control
                    type="color"
                    name="couleurPrincipale"
                    value={localState.couleurPrincipale}
                    onChange={handleChange}
                    className={styles.colorPicker}
                  />
                  <Form.Control
                    type="text"
                    value={localState.couleurPrincipale}
                    onChange={handleChange}
                    name="couleurPrincipale"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className={styles.colorInput}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>Taille de police (px)</Form.Label>
                <div className={styles.fontSizeContainer}>
                  <Form.Range
                    name="taillePolicePx"
                    value={localState.taillePolicePx}
                    onChange={handleChange}
                    min="12"
                    max="24"
                    step="1"
                    className={styles.fontSizeSlider}
                  />
                  <span className={styles.fontSizeValue}>{localState.taillePolicePx}px</span>
                </div>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>Position du menu</Form.Label>
                <Form.Select
                  name="menuPosition"
                  value={localState.menuPosition}
                  onChange={handleChange}
                  className={styles.formControl}
                >
                  <option value="left">Gauche</option>
                  <option value="top">Haut</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className={styles.formGroup}>
            <Form.Check 
              type="switch"
              id="animations"
              label="Animations"
              name="animations"
              checked={localState.animations}
              onChange={handleChange}
              className={styles.formCheck}
            />
            <Form.Text className={styles.formText}>
              Activer/désactiver les animations de l'interface
            </Form.Text>
          </Form.Group>

          <Form.Group className={styles.formGroup}>
            <Form.Check 
              type="switch"
              id="compactMode"
              label="Mode compact"
              name="compactMode"
              checked={localState.compactMode}
              onChange={handleChange}
              className={styles.formCheck}
            />
            <Form.Text className={styles.formText}>
              Réduire l'espacement entre les éléments
            </Form.Text>
          </Form.Group>

          <div className={styles.actionButtons}>
            <div className={styles.resetButtonsGroup}>
              <Button 
                variant="secondary"
                onClick={handleReset}
                className={styles.resetButton}
              >
                Réinitialiser
              </Button>
              <Button 
                variant="secondary"
                onClick={handleCancel}
                className={styles.resetButton}
              >
                Annuler
              </Button>
            </div>
            <Button 
              type="submit" 
              variant="primary"
              className={styles.saveButton}
            >
              Enregistrer les préférences
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresApparence;
