import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import styles from './StructureLegalSection.module.css';

/**
 * Section d'informations légales d'une structure
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.structure - Objet structure à afficher en mode visualisation
 * @param {Object} props.formData - Données du formulaire en mode édition
 * @param {Function} props.handleChange - Gestionnaire de changement pour les champs du formulaire
 * @param {boolean} props.isEditing - Mode d'édition ou de visualisation
 * @param {Function} props.formatValue - Fonction formatant les valeurs pour l'affichage
 */
const StructureLegalSection = ({ 
  structure = {}, 
  formData = {}, 
  handleChange = () => {}, 
  isEditing = false,
  formatValue = (val) => val
}) => {
  return (
    <div className={styles.sectionContent}>
      {isEditing ? (
        // Mode édition
        <>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureSiret">SIRET</Form.Label>
                <Form.Control
                  id="structureSiret"
                  name="siret"
                  type="text"
                  value={formData?.siret || ''}
                  onChange={handleChange}
                  maxLength={14}
                  placeholder="Numéro d'identification (14 chiffres)"
                />
                <Form.Text className="text-muted">
                  Numéro d'identification de l'entreprise (14 chiffres)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureCodeAPE">Code APE</Form.Label>
                <Form.Control
                  id="structureCodeAPE"
                  name="codeAPE"
                  type="text"
                  value={formData?.codeAPE || ''}
                  onChange={handleChange}
                  placeholder="Code d'activité"
                />
                <Form.Text className="text-muted">
                  Code d'activité principale de l'entreprise
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureMentionsLegales">Mentions légales</Form.Label>
            <Form.Control
              id="structureMentionsLegales"
              as="textarea"
              name="mentionsLegales"
              value={formData?.mentionsLegales || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Mentions légales de la structure"
            />
            <Form.Text className="text-muted">
              Ce texte apparaîtra en pied de page de vos documents et contrats
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureTva">TVA Intracommunautaire</Form.Label>
                <Form.Control
                  id="structureTva"
                  name="tva"
                  type="text"
                  value={formData?.tva || ''}
                  onChange={handleChange}
                  placeholder="Numéro de TVA"
                />
              </Form.Group>
            </Col>
          </Row>
        </>
      ) : (
        // Mode visualisation
        <div className={styles.infoGrid}>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>SIRET</p>
            <p className={styles.fieldValue}>{formatValue(structure?.siret)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Code APE</p>
            <p className={styles.fieldValue}>{formatValue(structure?.codeAPE)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>TVA Intracommunautaire</p>
            <p className={styles.fieldValue}>{formatValue(structure?.tva)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Mentions légales</p>
            <p className={styles.fieldValue}>{formatValue(structure?.mentionsLegales)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructureLegalSection;