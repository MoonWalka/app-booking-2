import React, { useState } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import styles from './StructureBillingSection.module.css';

/**
 * Section component for structure's billing information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data
 * @param {Function} props.handleChange - Change handler
 * @param {Object} props.errors - Validation errors (optional)
 * @returns {JSX.Element} - Rendered component
 */
const StructureBillingSection = ({ formData, handleChange, errors = {} }) => {
  const [useSameAddress, setUseSameAddress] = useState(!formData.adresseFacturation);
  const [copyingAddress, setCopyingAddress] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleUseSameAddressChange = async (e) => {
    const checked = e.target.checked;
    setUseSameAddress(checked);
    setCopyingAddress(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (checked) {
      // Clear billing address fields
      const updateFormData = {
        ...formData,
        adresseFacturation: '',
        codePostalFacturation: '',
        villeFacturation: '',
        paysFacturation: ''
      };
      
      // NOUVEAU: Appliquer la mise à jour des données pour vider les champs
      Object.keys(updateFormData).forEach(key => {
        if (key.includes('Facturation') && updateFormData[key] === '') {
          const event = { target: { name: key, value: '' } };
          handleChange(event);
        }
      });
    } else {
      // NOUVEAU: Fonctionnalité de copie automatique des données d'adresse principale
      const updateFormData = {
        ...formData,
        adresseFacturation: formData.adresse || '',
        codePostalFacturation: formData.codePostal || '',
        villeFacturation: formData.ville || '',
        paysFacturation: formData.pays || 'France'
      };
      
      // Appliquer automatiquement les données de l'adresse principale
      Object.keys(updateFormData).forEach(key => {
        if (key.includes('Facturation')) {
          const event = { target: { name: key, value: updateFormData[key] } };
          handleChange(event);
        }
      });
      
      // NOUVEAU: Afficher notification de succès
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 3000);
    }
    
    setCopyingAddress(false);
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-credit-card"></i>
        <h3>Facturation</h3>
      </div>
      <div className={styles.cardBody}>
        {/* NOUVEAU: Notification de succès pour la copie d'adresse */}
        {showCopySuccess && (
          <Alert variant="success" className={styles.successAlert}>
            <i className="bi bi-check-circle me-2"></i>
            Adresse copiée automatiquement depuis les informations principales
          </Alert>
        )}

        <Form.Group className={styles.formGroup}>
          <Form.Check 
            type="checkbox"
            id="useSameAddress"
            label={
              <span>
                {copyingAddress ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-house me-2"></i>
                    Utiliser la même adresse que la structure
                  </>
                )}
              </span>
            }
            checked={useSameAddress}
            onChange={handleUseSameAddressChange}
            disabled={copyingAddress} // NOUVEAU: Désactiver pendant le traitement
            className={styles.sameAddressCheck}
          />
        </Form.Group>

        {!useSameAddress && (
          <>
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Adresse de facturation</Form.Label>
              <Form.Control
                className={styles.formControl}
                type="text"
                name="adresseFacturation"
                value={formData.adresseFacturation || ''}
                onChange={handleChange}
                placeholder="Adresse de facturation"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label className={styles.formLabel}>Code postal</Form.Label>
                  <Form.Control
                    className={styles.formControl}
                    type="text"
                    name="codePostalFacturation"
                    value={formData.codePostalFacturation || ''}
                    onChange={handleChange}
                    placeholder="Code postal"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label className={styles.formLabel}>Ville</Form.Label>
                  <Form.Control
                    className={styles.formControl}
                    type="text"
                    name="villeFacturation"
                    value={formData.villeFacturation || ''}
                    onChange={handleChange}
                    placeholder="Ville"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className={styles.formGroup}>
                  <Form.Label className={styles.formLabel}>Pays</Form.Label>
                  <Form.Control
                    className={styles.formControl}
                    type="text"
                    name="paysFacturation"
                    value={formData.paysFacturation || 'France'}
                    onChange={handleChange}
                    placeholder="Pays"
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        <Row>
          <Col md={6}>
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Mode de paiement préféré</Form.Label>
              <Form.Select
                className={styles.formSelect}
                name="modePaiement"
                value={formData.modePaiement || ''}
                onChange={handleChange}
              >
                <option value="">Sélectionner un mode</option>
                <option value="virement">Virement bancaire</option>
                <option value="cheque">Chèque</option>
                <option value="especes">Espèces</option>
                <option value="carte">Carte bancaire</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>Délai de paiement (jours)</Form.Label>
              <Form.Control
                className={styles.formControl}
                type="number"
                name="delaiPaiement"
                value={formData.delaiPaiement || ''}
                onChange={handleChange}
                placeholder="Ex: 30"
                min="0"
              />
            </Form.Group>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StructureBillingSection;