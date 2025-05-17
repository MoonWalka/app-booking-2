import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import styles from './StructureBillingSection.module.css';

/**
 * Section component for structure's billing information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data
 * @param {Function} props.handleChange - Change handler
 * @returns {JSX.Element} - Rendered component
 */
const StructureBillingSection = ({ formData, handleChange }) => {
  const [useSameAddress, setUseSameAddress] = useState(!formData.adresseFacturation);

  const handleUseSameAddressChange = (e) => {
    const checked = e.target.checked;
    setUseSameAddress(checked);
    
    if (checked) {
      // Clear billing address fields
      const updateFormData = {
        ...formData,
        adresseFacturation: '',
        codePostalFacturation: '',
        villeFacturation: '',
        paysFacturation: ''
      };
      
      // Simulate change event for each field
      ['adresseFacturation', 'codePostalFacturation', 'villeFacturation', 'paysFacturation'].forEach(field => {
        const event = { target: { name: field, value: '' } };
        handleChange(event);
      });
    }
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-credit-card"></i>
        <h3>Facturation</h3>
      </div>
      <div className={styles.cardBody}>
        <Form.Group className={styles.formGroup}>
          <Form.Check 
            type="checkbox"
            id="useSameAddress"
            label="Utiliser la même adresse que la structure"
            checked={useSameAddress}
            onChange={handleUseSameAddressChange}
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