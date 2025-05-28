import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import { ProgrammateurLegalSectionSchema } from '../../../schemas/ProgrammateurSchemas';
import Alert from '../../../components/ui/Alert';
import FormField from '../../../components/ui/FormField';
import styles from './ProgrammateurLegalSection.module.css';
import Card from '../../../components/ui/Card';

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
 * @param {boolean} showCardWrapper - Indique si la structure de carte doit être affichée
 */
const ProgrammateurLegalSection = ({ 
  programmateur = {}, 
  formData = {}, 
  handleChange: parentHandleChange = () => {}, 
  isEditMode = false, // Renommé pour cohérence avec les autres sections
  formatValue = (val) => val,
  structureCreated = false,
  onSubmit = () => {},
  showCardWrapper = true, // Nouvelle prop avec valeur par défaut à true
  errors = {} // Ajout des erreurs
}) => {
  // Alias pour compatibilité
  const isEditing = isEditMode;
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

  // Contenu principal de la section
  const sectionContent = (
    <>
      {structureCreated && (
        <Alert variant="success" className="mb-3">
          Structure créée et associée avec succès ! Ces informations sont maintenant disponibles dans l'espace Structures.
        </Alert>
      )}
      
      {isEditing ? (
        // Mode édition avec validation Formik
        <Formik
          initialValues={initialValues}
          validationSchema={ProgrammateurLegalSectionSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange: formikHandleChange, handleBlur, isSubmitting }) => (
            <div>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureRaisonSociale">Raison sociale</Form.Label>
                    <Field
                      id="structureRaisonSociale"
                      name="structureCache.raisonSociale"
                      type="text"
                      className={`${styles.formField} ${touched.structureCache?.raisonSociale && errors.structureCache?.raisonSociale ? 'is-invalid' : ''}`}
                      placeholder="Nom de l'organisation"
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage 
                      name="structureCache.raisonSociale" 
                      component="div" 
                      className="invalid-feedback" 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="structureType">Type de structure</Form.Label>
                    <FormField
                      type="select"
                      id="structureType"
                      name="structureCache.type"
                      value={values.structureCache?.type || ''}
                      onChange={(e) => handleFormikChange(e, formikHandleChange)}
                      onBlur={handleBlur}
                      error={touched.structureCache?.type && errors.structureCache?.type ? errors.structureCache.type : null}
                      options={[
                        { value: '', label: 'Sélectionner un type' },
                        { value: 'association', label: 'Association' },
                        { value: 'sarl', label: 'SARL' },
                        { value: 'eurl', label: 'EURL' },
                        { value: 'sas', label: 'SAS' },
                        { value: 'collectivite', label: 'Collectivité territoriale' },
                        { value: 'autre', label: 'Autre' }
                      ]}
                    />
                    <ErrorMessage 
                      name="structureCache.type" 
                      component="div" 
                      className="invalid-feedback" 
                    />
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
            </div>
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
    </>
  );

  // Si on ne veut pas le wrapper de carte, on retourne directement le contenu
  if (!showCardWrapper) {
    return sectionContent;
  }

  // Utilisation du composant Card standardisé au lieu de la structure personnalisée
  return (
    <Card
      title="Informations légales"
      icon={<i className="bi bi-building"></i>}
      className={styles.legalCard}
      isEditing={isEditing}
    >
      {sectionContent}
    </Card>
  );
};

export default ProgrammateurLegalSection;
