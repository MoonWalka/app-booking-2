import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Alert } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import { useEntreprise } from '@/context/EntrepriseContext';
import { doc, getDoc, setDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Composant de configuration des paramètres de facturation
 */
const ParametresFactures = () => {
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [parameters, setParameters] = useState({
    // Numérotation
    numeroPrefix: 'FAC',
    numeroFormat: 'YYYY-MM-XXXX',
    numeroSeparator: '-',
    
    // Affichage
    showLogo: true,
    afficherTva: true,
    tauxTva: 20,
    afficherNumeroTva: true,
    afficherSiret: true,
    afficherMentionsLegales: true,
    afficherIban: true,
    afficherBic: true,
    afficherSignature: false,
    afficherPiedDePage: true,
    
    // Textes
    titreFacture: 'FACTURE',
    mentionTva: 'TVA non applicable, article 293B du CGI',
    conditionsPaiement: 'Paiement à réception de facture',
    penalitesRetard: 'En cas de retard de paiement, des pénalités de retard sont exigibles (taux légal en vigueur).',
    escompte: 'Pas d\'escompte pour paiement anticipé',
    textePiedDePage: '',
    
    // Coordonnées bancaires
    iban: '',
    bic: '',
    nomBanque: '',
    
    // Apparence
    couleurPrimaire: '#3b82f6',
    couleurSecondaire: '#1f2937'
  });

  // Charger les paramètres existants
  useEffect(() => {
    const loadParameters = async () => {
      if (!currentEntreprise?.id) return;
      
      try {
        const parametersRef = doc(db, 'organizations', currentEntreprise.id, 'settings', 'factureParameters');
        const parametersDoc = await getDoc(parametersRef);
        
        if (parametersDoc.exists()) {
          const data = parametersDoc.data();
          setParameters(prev => ({
            ...prev,
            ...data.parameters
          }));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres:', err);
      }
    };

    loadParameters();
  }, [currentEntreprise?.id]);

  // Gestion des changements
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParameters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Sauvegarde
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntreprise?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const parametersRef = doc(db, 'organizations', currentEntreprise.id, 'settings', 'factureParameters');
      await setDoc(parametersRef, {
        parameters,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess('Paramètres de facturation sauvegardés avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <Card.Header>
          <h5 className="mb-0">Paramètres de Facturation</h5>
        </Card.Header>
        <Card.Body>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            {/* SECTION AFFICHAGE */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">🎨 Options d'Affichage</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      id="showLogo"
                      name="showLogo"
                      label="Afficher le logo"
                      checked={parameters.showLogo}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    
                    <Form.Check
                      type="checkbox"
                      id="afficherSiret"
                      name="afficherSiret"
                      label="🎯 Afficher le numéro SIRET"
                      checked={parameters.afficherSiret}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    
                    <Form.Check
                      type="checkbox"
                      id="afficherNumeroTva"
                      name="afficherNumeroTva"
                      label="Afficher le numéro de TVA"
                      checked={parameters.afficherNumeroTva}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    
                    <Form.Check
                      type="checkbox"
                      id="afficherTva"
                      name="afficherTva"
                      label="Afficher la TVA"
                      checked={parameters.afficherTva}
                      onChange={handleChange}
                      className="mb-3"
                    />
                  </Col>
                  
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      id="afficherIban"
                      name="afficherIban"
                      label="Afficher l'IBAN"
                      checked={parameters.afficherIban}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    
                    <Form.Check
                      type="checkbox"
                      id="afficherBic"
                      name="afficherBic"
                      label="Afficher le BIC"
                      checked={parameters.afficherBic}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    
                    <Form.Check
                      type="checkbox"
                      id="afficherMentionsLegales"
                      name="afficherMentionsLegales"
                      label="Afficher les mentions légales"
                      checked={parameters.afficherMentionsLegales}
                      onChange={handleChange}
                      className="mb-3"
                    />
                    
                    <Form.Check
                      type="checkbox"
                      id="afficherPiedDePage"
                      name="afficherPiedDePage"
                      label="Afficher le pied de page"
                      checked={parameters.afficherPiedDePage}
                      onChange={handleChange}
                      className="mb-3"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* SECTION COORDONNÉES BANCAIRES */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">🏦 Coordonnées Bancaires</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>IBAN</Form.Label>
                      <Form.Control
                        type="text"
                        name="iban"
                        value={parameters.iban}
                        onChange={handleChange}
                        placeholder="FR76 1234 5678 9012 3456 7890 123"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>BIC</Form.Label>
                      <Form.Control
                        type="text"
                        name="bic"
                        value={parameters.bic}
                        onChange={handleChange}
                        placeholder="BNPAFRPP"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom de la banque</Form.Label>
                      <Form.Control
                        type="text"
                        name="nomBanque"
                        value={parameters.nomBanque}
                        onChange={handleChange}
                        placeholder="BNP Paribas"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* SECTION TEXTES */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">📝 Textes Personnalisés</h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Titre de la facture</Form.Label>
                  <Form.Control
                    type="text"
                    name="titreFacture"
                    value={parameters.titreFacture}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Mention TVA</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="mentionTva"
                    value={parameters.mentionTva}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Conditions de paiement</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="conditionsPaiement"
                    value={parameters.conditionsPaiement}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2" />
                    Sauvegarder les paramètres
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ParametresFactures; 