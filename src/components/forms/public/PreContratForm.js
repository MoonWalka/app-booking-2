import React, { useState } from 'react';
import { Card, Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import FormPageHeader from './FormPageHeader';
import FormContentWrapper from './FormContentWrapper';
import preContratService from '@/services/preContratService';
import { debugLog } from '@/utils/logUtils';
import styles from './PreContratForm.module.css';

/**
 * Formulaire de pré-contrat public
 */
function PreContratForm({ 
  concertId, 
  token, 
  concertData, 
  formLinkData, 
  existingSubmission, 
  onSubmissionComplete 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  // État du formulaire avec les données existantes
  const [formData, setFormData] = useState({
    // Initialiser avec les données existantes ou les données du pré-contrat
    raisonSociale: existingSubmission?.raisonSociale || formLinkData?.raisonSociale || '',
    suiteAdresse: existingSubmission?.suiteAdresse || formLinkData?.suiteAdresse || '',
    adresse: existingSubmission?.adresse || formLinkData?.adresse || '',
    ville: existingSubmission?.ville || formLinkData?.ville || '',
    cp: existingSubmission?.cp || formLinkData?.cp || '',
    pays: existingSubmission?.pays || formLinkData?.pays || 'France',
    tel: existingSubmission?.tel || formLinkData?.tel || '',
    email: existingSubmission?.email || formLinkData?.email || '',
    nomSignataire: existingSubmission?.nomSignataire || formLinkData?.nomSignataire || '',
    qualiteSignataire: existingSubmission?.qualiteSignataire || formLinkData?.qualiteSignataire || '',
    siret: existingSubmission?.siret || formLinkData?.siret || '',
    numeroLicence: existingSubmission?.numeroLicence || formLinkData?.numeroLicence || '',
    acceptation: existingSubmission?.acceptation || false,
    commentaires: existingSubmission?.commentaires || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.acceptation) {
      setAlertType('warning');
      setAlertMessage('Veuillez accepter les conditions du pré-contrat');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (!formData.email || !formData.raisonSociale) {
      setAlertType('warning');
      setAlertMessage('Veuillez remplir tous les champs obligatoires');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Valider le pré-contrat
      await preContratService.validatePreContrat(formLinkData.id, formData);
      
      setAlertType('success');
      setAlertMessage('Pré-contrat validé avec succès ! Vous allez recevoir une confirmation par email.');
      setShowAlert(true);
      
      // Notifier le parent
      if (onSubmissionComplete) {
        onSubmissionComplete('completed');
      }
      
      debugLog('[PreContratForm] Validation réussie', { preContratId: formLinkData.id }, 'success');
      
    } catch (error) {
      debugLog('[PreContratForm] Erreur validation:', error, 'error');
      setAlertType('danger');
      setAlertMessage('Erreur lors de la validation: ' + error.message);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className={styles.container}>
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          {/* Header du formulaire */}
          <FormPageHeader
            title="Formulaire de Pré-contrat"
            subtitle="Merci de remplir ce formulaire pour finaliser votre pré-contrat"
            concertInfo={concertData}
          />

          {/* Contenu principal */}
          <FormContentWrapper>
            {showAlert && (
              <Alert 
                variant={alertType} 
                dismissible 
                onClose={() => setShowAlert(false)}
                className="mb-4"
              >
                {alertMessage}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Informations de la structure */}
              <Card className="mb-4">
                <Card.Header>
                  <h4>Informations de la structure</h4>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Raison sociale *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.raisonSociale}
                          onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SIRET</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.siret}
                          onChange={(e) => handleInputChange('siret', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Adresse</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.adresse}
                          onChange={(e) => handleInputChange('adresse', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Complément d'adresse</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.suiteAdresse}
                          onChange={(e) => handleInputChange('suiteAdresse', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Code postal</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.cp}
                          onChange={(e) => handleInputChange('cp', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ville</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.ville}
                          onChange={(e) => handleInputChange('ville', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Pays</Form.Label>
                        <Form.Select
                          value={formData.pays}
                          onChange={(e) => handleInputChange('pays', e.target.value)}
                          disabled={isSubmitting}
                        >
                          <option value="France">France</option>
                          <option value="Belgique">Belgique</option>
                          <option value="Suisse">Suisse</option>
                          <option value="Autre">Autre</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Téléphone</Form.Label>
                        <Form.Control
                          type="tel"
                          value={formData.tel}
                          onChange={(e) => handleInputChange('tel', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom du signataire</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.nomSignataire}
                          onChange={(e) => handleInputChange('nomSignataire', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Qualité du signataire</Form.Label>
                        <Form.Select
                          value={formData.qualiteSignataire}
                          onChange={(e) => handleInputChange('qualiteSignataire', e.target.value)}
                          disabled={isSubmitting}
                        >
                          <option value="">Sélectionner...</option>
                          <option value="Directeur">Directeur</option>
                          <option value="Gérant">Gérant</option>
                          <option value="Président">Président</option>
                          <option value="Autre">Autre</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>N° de licence</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.numeroLicence}
                          onChange={(e) => handleInputChange('numeroLicence', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Récapitulatif du pré-contrat */}
              <Card className="mb-4">
                <Card.Header>
                  <h4>Récapitulatif du pré-contrat</h4>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Concert :</strong> {concertData?.titre || concertData?.nom || 'Sans titre'}
                  </div>
                  {concertData?.artiste && (
                    <div className="mb-3">
                      <strong>Artiste :</strong> {concertData.artiste.nom}
                    </div>
                  )}
                  {concertData?.lieu && (
                    <div className="mb-3">
                      <strong>Lieu :</strong> {concertData.lieu.nom}
                    </div>
                  )}
                  {concertData?.dateDebut && (
                    <div className="mb-3">
                      <strong>Date :</strong> {new Date(concertData.dateDebut).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  {formLinkData?.montantHT && (
                    <div className="mb-3">
                      <strong>Montant HT :</strong> {formLinkData.montantHT} {formLinkData.devise || 'EUR'}
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Commentaires et validation */}
              <Card className="mb-4">
                <Card.Header>
                  <h4>Validation</h4>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Commentaires (optionnel)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.commentaires}
                      onChange={(e) => handleInputChange('commentaires', e.target.value)}
                      placeholder="Vos remarques ou questions éventuelles..."
                      disabled={isSubmitting}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="acceptation"
                      label="J'accepte les conditions du pré-contrat telles que présentées ci-dessus"
                      checked={formData.acceptation}
                      onChange={(e) => handleInputChange('acceptation', e.target.checked)}
                      disabled={isSubmitting}
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="success" 
                      size="lg"
                      type="submit"
                      disabled={isSubmitting || !formData.acceptation}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" animation="border" className="me-2" />
                          Validation en cours...
                        </>
                      ) : (
                        'Valider le pré-contrat'
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Form>
          </FormContentWrapper>
        </Col>
      </Row>
    </Container>
  );
}

export default PreContratForm;