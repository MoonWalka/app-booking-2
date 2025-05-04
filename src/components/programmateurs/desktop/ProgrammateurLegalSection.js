import React from 'react';
import { Form, Row, Col, Badge } from 'react-bootstrap';
import styles from './ProgrammateurLegalSection.module.css';

const ProgrammateurLegalSection = ({ 
  programmateur = {}, 
  formData = {}, 
  handleChange = () => {}, 
  isEditing = false,
  formatValue = (val) => val,
  structureCreated = false
}) => {
  // Forcer l'affichage sans condition (pour déboguer)
  // Avant: const hasStructure = isEditing ? !!formData?.structureId : !!programmateur?.structureId;
  const hasStructure = true; // Forcer à true pour voir si la section s'affiche

  console.log("[DIAGNOSTIC] ProgrammateurLegalSection - isEditing:", isEditing);
  console.log("[DIAGNOSTIC] ProgrammateurLegalSection - programmateur:", programmateur);
  console.log("[DIAGNOSTIC] ProgrammateurLegalSection - formData:", formData);
  console.log("[DIAGNOSTIC] ProgrammateurLegalSection - structureId:", isEditing ? formData?.structureId : programmateur?.structureId);
  console.log("[DIAGNOSTIC] ProgrammateurLegalSection - hasStructure forcé à:", hasStructure);

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Informations juridiques</h3>
        {hasStructure && (
          <Badge bg="info" className="ms-2">
            <i className="bi bi-link-45deg me-1"></i>
            Structure associée
          </Badge>
        )}
      </div>

      {structureCreated && (
        <div className="alert alert-success mb-3" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          Structure créée et associée avec succès ! Ces informations sont maintenant disponibles dans l'espace Structures.
        </div>
      )}
      
      <div className={styles.cardBody}>
        {isEditing ? (
          // Edit Mode
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="structureRaisonSociale">Raison sociale</Form.Label>
                  <Form.Control
                    id="structureRaisonSociale"
                    name="structure.raisonSociale"
                    type="text"
                    value={formData?.structure?.raisonSociale || ''}
                    onChange={handleChange}
                    placeholder="Nom de l'organisation"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="structureType">Type de structure</Form.Label>
                  <Form.Select
                    id="structureType"
                    name="structure.type"
                    value={formData?.structure?.type || ''}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="association">Association</option>
                    <option value="sarl">SARL</option>
                    <option value="eurl">EURL</option>
                    <option value="sas">SAS</option>
                    <option value="collectivite">Collectivité territoriale</option>
                    <option value="autre">Autre</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="structureAdresse">Adresse</Form.Label>
                  <Form.Control
                    id="structureAdresse"
                    name="structure.adresse"
                    type="text"
                    value={formData?.structure?.adresse || ''}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="structureCodePostal">Code postal</Form.Label>
                  <Form.Control
                    id="structureCodePostal"
                    name="structure.codePostal"
                    type="text"
                    value={formData?.structure?.codePostal || ''}
                    onChange={handleChange}
                    placeholder="Code postal"
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="structureVille">Ville</Form.Label>
                  <Form.Control
                    id="structureVille"
                    name="structure.ville"
                    type="text"
                    value={formData?.structure?.ville || ''}
                    onChange={handleChange}
                    placeholder="Ville"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="structurePays">Pays</Form.Label>
                  <Form.Control
                    id="structurePays"
                    name="structure.pays"
                    type="text"
                    value={formData?.structure?.pays || 'France'}
                    onChange={handleChange}
                    placeholder="Pays"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="structureSiret">SIRET</Form.Label>
                  <Form.Control
                    id="structureSiret"
                    name="structure.siret"
                    type="text"
                    value={formData?.structure?.siret || ''}
                    onChange={handleChange}
                    placeholder="Numéro SIRET"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="structureTva">TVA Intracommunautaire</Form.Label>
                  <Form.Control
                    id="structureTva"
                    name="structure.tva"
                    type="text"
                    value={formData?.structure?.tva || ''}
                    onChange={handleChange}
                    placeholder="Numéro de TVA"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        ) : (
          // View Mode
          <div className={styles.infoGrid}>
            <div className={styles.infoGroup}>
              <p className={styles.cardLabel}>Raison sociale</p>
              <p className={styles.fieldValue}>{formatValue(programmateur?.structure)}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.cardLabel}>Type de structure</p>
              <p className={styles.fieldValue}>{formatValue(programmateur?.structureType)}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.cardLabel}>Adresse</p>
              <p className={styles.fieldValue}>{formatValue(programmateur?.structureAdresse)}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.cardLabel}>Code postal</p>
              <p className={styles.fieldValue}>{formatValue(programmateur?.structureCodePostal)}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.cardLabel}>Ville</p>
              <p className={styles.fieldValue}>{formatValue(programmateur?.structureVille)}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.cardLabel}>Pays</p>
              <p className={styles.fieldValue}>{formatValue(programmateur?.structurePays || 'France')}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.cardLabel}>SIRET</p>
              <p className={styles.fieldValue}>{formatValue(programmateur?.structureSiret)}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.cardLabel}>TVA Intracommunautaire</p>
              <p className={styles.fieldValue}>{formatValue(programmateur?.structureTva)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammateurLegalSection;
