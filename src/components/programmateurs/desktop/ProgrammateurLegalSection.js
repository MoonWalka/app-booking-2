import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import { ProgrammateurLegalSectionSchema } from '../../../schemas/ProgrammateurSchemas';
import styles from './ProgrammateurLegalSection.module.css';

/**
 * Section d'informations légales d'un programmateur, incluant les données de sa structure associée
 * 
 * @param {Object} programmateur - Objet programmateur avec structureCache standardisé
 * @param {Object} formData - Données du formulaire en mode édition
 * @param {Function} handleChange - Gestionnaire de changement pour les champs du formulaire
 * @param {boolean} isEditing - Mode d'édition ou de visualisation
 * @param {Function} formatValue - Fonction formatant les valeurs pour l'affichage
 * @param {boolean} structureCreated - Indique si une structure vient d'être créée
 * @param {Function} onSubmit - Fonction à appeler lors de la soumission du formulaire validé
 */
const ProgrammateurLegalSection = ({ 
  programmateur = {}, 
  formData = {}, 
  handleChange: parentHandleChange = () => {}, 
  isEditing = false,
  formatValue = (val) => val,
  structureCreated = false,
  onSubmit = () => {}
}) => {
  // Préparation des valeurs initiales pour Formik
  const initialValues = {
    structureCache: {
      raisonSociale: formData?.structureCache?.raisonSociale || '',
      type: formData?.structureCache?.type || '',
      adresse: formData?.structureCache?.adresse || '',
      codePostal: formData?.structureCache?.codePostal || '',
      ville: formData?.structureCache?.ville || '',
      pays: formData?.structureCache?.pays || 'France',
      siret: formData?.structureCache?.siret || '',
      tva: formData?.structureCache?.tva || ''
    }
  };

  // Gestion des modifications de champs pour synchroniser Formik avec le parent
  const handleFormikChange = (e, handleFormikChangeFn) => {
    // Mise à jour du state Formik
    handleFormikChangeFn(e);

    // Propagation au composant parent
    if (parentHandleChange) {
      parentHandleChange(e);
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (values, { setSubmitting }) => {
    onSubmit(values);
    setSubmitting(false);
  };

  return (
    <div className={styles.sectionContent}>
      {structureCreated && (
        <div className="alert alert-success mb-3" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          Structure créée et associée avec succès ! Ces informations sont maintenant disponibles dans l'espace Structures.
        </div>
      )}
      
      {isEditing ? (
        // Mode édition avec validation Formik
        <Formik
          initialValues={initialValues}
          validationSchema={ProgrammateurLegalSectionSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange: formikHandleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureRaisonSociale">Raison sociale</Form.Label>
                    <Form.Control
                      id="structureRaisonSociale"
                      name="structureCache.raisonSociale"
                      type="text"
                      value={values.structureCache.raisonSociale}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      placeholder="Nom de l'organisation"
                      isInvalid={touched.structureCache?.raisonSociale && errors.structureCache?.raisonSociale}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.structureCache?.raisonSociale}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureType">Type de structure</Form.Label>
                    <Form.Select
                      id="structureType"
                      name="structureCache.type"
                      value={values.structureCache.type}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      isInvalid={touched.structureCache?.type && errors.structureCache?.type}
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="association">Association</option>
                      <option value="sarl">SARL</option>
                      <option value="eurl">EURL</option>
                      <option value="sas">SAS</option>
                      <option value="collectivite">Collectivité territoriale</option>
                      <option value="autre">Autre</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.structureCache?.type}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureAdresse">Adresse</Form.Label>
                    <Form.Control
                      id="structureAdresse"
                      name="structureCache.adresse"
                      type="text"
                      value={values.structureCache.adresse}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      placeholder="Adresse complète"
                      isInvalid={touched.structureCache?.adresse && errors.structureCache?.adresse}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.structureCache?.adresse}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureCodePostal">Code postal</Form.Label>
                    <Form.Control
                      id="structureCodePostal"
                      name="structureCache.codePostal"
                      type="text"
                      value={values.structureCache.codePostal}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      placeholder="Code postal"
                      isInvalid={touched.structureCache?.codePostal && errors.structureCache?.codePostal}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.structureCache?.codePostal}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureVille">Ville</Form.Label>
                    <Form.Control
                      id="structureVille"
                      name="structureCache.ville"
                      type="text"
                      value={values.structureCache.ville}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      placeholder="Ville"
                      isInvalid={touched.structureCache?.ville && errors.structureCache?.ville}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.structureCache?.ville}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structurePays">Pays</Form.Label>
                    <Form.Control
                      id="structurePays"
                      name="structureCache.pays"
                      type="text"
                      value={values.structureCache.pays}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      placeholder="Pays"
                      isInvalid={touched.structureCache?.pays && errors.structureCache?.pays}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.structureCache?.pays}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureSiret">SIRET</Form.Label>
                    <Form.Control
                      id="structureSiret"
                      name="structureCache.siret"
                      type="text"
                      value={values.structureCache.siret}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      placeholder="Numéro SIRET"
                      isInvalid={touched.structureCache?.siret && errors.structureCache?.siret}
                      maxLength={14}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.structureCache?.siret}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureTva">TVA Intracommunautaire</Form.Label>
                    <Form.Control
                      id="structureTva"
                      name="structureCache.tva"
                      type="text"
                      value={values.structureCache.tva}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      placeholder="Numéro de TVA"
                      isInvalid={touched.structureCache?.tva && errors.structureCache?.tva}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.structureCache?.tva}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      ) : (
        // Mode visualisation - reste inchangé
        <div className={styles.infoGrid}>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Raison sociale</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.raisonSociale)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Type de structure</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.type)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Adresse</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.adresse)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Code postal</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.codePostal)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Ville</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.ville)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Pays</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.pays || 'France')}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>SIRET</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.siret)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>TVA Intracommunautaire</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.tva)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammateurLegalSection;
