import React, { useState, useEffect } from 'react';
// Import des composants UI standards de TourCraft
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import ErrorMessage from '@components/ui/ErrorMessage';
import FormField from '@components/ui/FormField';

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
    <Card 
      title="Apparence"
      icon={<i className="bi bi-palette"></i>}
      className={styles.card}
    >
      {success && (
        <ErrorMessage variant="success" className={styles.successAlert}>
          {success}
        </ErrorMessage>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formColumn}>
            <FormField
              type="select"
              label="Thème"
              name="theme"
              value={localState.theme}
              onChange={handleChange}
              className={styles.formControl}
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </FormField>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Taille de police</label>
              <div className={styles.fontSizeContainer}>
                <input
                  type="range"
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
              <span className={styles.helpText}>Ajuster la taille du texte dans l'interface</span>
            </div>
          </div>

          <div className={styles.formColumn}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Couleur principale</label>
              <div className={styles.colorPreviewContainer}>
                <div 
                  className={styles.colorPreview} 
                  style={{ backgroundColor: localState.couleurPrincipale }}
                />
                <input
                  type="color"
                  name="couleurPrincipale"
                  value={localState.couleurPrincipale}
                  onChange={handleChange}
                  className={styles.colorPicker}
                />
                <input
                  type="text"
                  value={localState.couleurPrincipale}
                  onChange={handleChange}
                  name="couleurPrincipale"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className={styles.colorInput}
                  placeholder="#1e3a5f"
                />
              </div>
              <span className={styles.helpText}>Personnaliser la couleur d'accent de l'application</span>
            </div>

            <FormField
              type="select"
              label="Position du menu"
              name="menuPosition"
              value={localState.menuPosition}
              onChange={handleChange}
              className={styles.formControl}
            >
              <option value="left">Gauche</option>
              <option value="top">Haut</option>
            </FormField>
          </div>
        </div>

        <div className={styles.switchSection}>
          <div className={styles.switchGroup}>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                name="animations"
                checked={localState.animations}
                onChange={handleChange}
                className={styles.switch}
              />
              <span className={styles.switchSlider}></span>
              <span className={styles.switchText}>Animations</span>
            </label>
            <span className={styles.helpText}>
              Activer/désactiver les animations de l'interface
            </span>
          </div>

          <div className={styles.switchGroup}>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                name="compactMode"
                checked={localState.compactMode}
                onChange={handleChange}
                className={styles.switch}
              />
              <span className={styles.switchSlider}></span>
              <span className={styles.switchText}>Mode compact</span>
            </label>
            <span className={styles.helpText}>
              Réduire l'espacement entre les éléments
            </span>
          </div>
        </div>

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
        </form>
    </Card>
  );
};

export default ParametresApparence;
