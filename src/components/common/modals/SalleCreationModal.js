import React, { useState } from 'react';
import { Modal, Tab, Tabs, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { toast } from 'react-toastify';

const SalleCreationModal = ({ show, onHide, onSalleCreated }) => {
  const { currentOrganization } = useOrganization();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Informations générales
    nom: '',
    adresse: '',
    suiteAdresse: '',
    suiteAdresse2: '',
    suiteAdresse3: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    region: '',
    departement: '',
    telephone: '',
    fax: '',
    email: '',
    siteInternet: '',
    
    // Informations techniques
    responsable: '',
    type: '',
    ouverture: '',
    profondeur: '',
    hauteur: '',
    jauges: '',
    hauteurSalleScene: '',
    hauteurSousPorteuse: '',
    bordSceneLointain: '',
    rdfLointain: '',
    largeurMurAMur: '',
    penteScene: '',
    fosse: '',
    proscenium: '',
    horaires: '',
    
    // Commentaires
    commentaires: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs obligatoires
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de la salle est obligatoire';
    }
    
    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est obligatoire';
    }
    
    // Validation de l'email si fourni
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Validation du site web si fourni
    if (formData.siteInternet && !formData.siteInternet.startsWith('http')) {
      newErrors.siteInternet = 'L\'URL doit commencer par http:// ou https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    
    setLoading(true);
    
    try {
      const salleData = {
        ...formData,
        organizationId: currentOrganization?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'salles'), salleData);
      
      toast.success('Salle créée avec succès !');
      
      if (onSalleCreated) {
        onSalleCreated({
          id: docRef.id,
          ...salleData
        });
      }
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        adresse: '',
        suiteAdresse: '',
        suiteAdresse2: '',
        suiteAdresse3: '',
        codePostal: '',
        ville: '',
        pays: 'France',
        region: '',
        departement: '',
        telephone: '',
        fax: '',
        email: '',
        siteInternet: '',
        responsable: '',
        type: '',
        ouverture: '',
        profondeur: '',
        hauteur: '',
        jauges: '',
        hauteurSalleScene: '',
        hauteurSousPorteuse: '',
        bordSceneLointain: '',
        rdfLointain: '',
        largeurMurAMur: '',
        penteScene: '',
        fosse: '',
        proscenium: '',
        horaires: '',
        commentaires: ''
      });
      setActiveTab('general');
      onHide();
      
    } catch (error) {
      console.error('Erreur lors de la création de la salle:', error);
      toast.error('Erreur lors de la création de la salle');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setActiveTab('general');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-building me-2"></i>
          Nouvelle salle
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        <Form onSubmit={handleSubmit}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-0"
            fill
          >
            {/* Onglet Informations générales */}
            <Tab eventKey="general" title="Informations générales">
              <div className="p-4">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-building me-2"></i>
                        Nom <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Nom de la salle"
                        isInvalid={!!errors.nom}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nom}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-telephone me-2"></i>
                        Tél
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="01 23 45 67 89"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-geo-alt me-2"></i>
                    Adresse
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Numéro et nom de rue"
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Suite adresse</Form.Label>
                      <Form.Control
                        type="text"
                        name="suiteAdresse"
                        value={formData.suiteAdresse}
                        onChange={handleChange}
                        placeholder="Bâtiment, étage..."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Suite adresse 2</Form.Label>
                      <Form.Control
                        type="text"
                        name="suiteAdresse2"
                        value={formData.suiteAdresse2}
                        onChange={handleChange}
                        placeholder="Complément d'adresse"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Suite adresse 3</Form.Label>
                      <Form.Control
                        type="text"
                        name="suiteAdresse3"
                        value={formData.suiteAdresse3}
                        onChange={handleChange}
                        placeholder="Complément d'adresse"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-mailbox me-2"></i>
                        Code postal
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="codePostal"
                        value={formData.codePostal}
                        onChange={handleChange}
                        placeholder="75001"
                        maxLength={5}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-building me-2"></i>
                        Ville <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
                        placeholder="Paris"
                        isInvalid={!!errors.ville}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.ville}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-globe me-2"></i>
                        Pays
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="pays"
                        value={formData.pays}
                        onChange={handleChange}
                        placeholder="France"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        Région
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="Île-de-France"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-map me-2"></i>
                        Département
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="departement"
                        value={formData.departement}
                        onChange={handleChange}
                        placeholder="Paris (75)"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-printer me-2"></i>
                        Fax
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="fax"
                        value={formData.fax}
                        onChange={handleChange}
                        placeholder="01 23 45 67 89"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-envelope me-2"></i>
                        E-mail
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@salle.com"
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-globe me-2"></i>
                        Site Internet
                      </Form.Label>
                      <Form.Control
                        type="url"
                        name="siteInternet"
                        value={formData.siteInternet}
                        onChange={handleChange}
                        placeholder="https://www.salle.com"
                        isInvalid={!!errors.siteInternet}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.siteInternet}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab>

            {/* Onglet Informations techniques */}
            <Tab eventKey="technique" title="Informations techniques">
              <div className="p-4">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-person-check me-2"></i>
                        Responsable
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="responsable"
                        value={formData.responsable}
                        onChange={handleChange}
                        placeholder="Nom du responsable technique"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-tags me-2"></i>
                        Type
                      </Form.Label>
                      <Form.Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="Salle de concert">Salle de concert</option>
                        <option value="Théâtre">Théâtre</option>
                        <option value="Opéra">Opéra</option>
                        <option value="Auditorium">Auditorium</option>
                        <option value="Centre culturel">Centre culturel</option>
                        <option value="MJC">MJC</option>
                        <option value="Café-concert">Café-concert</option>
                        <option value="Club">Club</option>
                        <option value="Plein air">Plein air</option>
                        <option value="Autre">Autre</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Dimensions */}
                <h6 className="mb-3 mt-4">
                  <i className="bi bi-rulers me-2"></i>
                  Dimensions
                </h6>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ouverture</Form.Label>
                      <Form.Control
                        type="text"
                        name="ouverture"
                        value={formData.ouverture}
                        onChange={handleChange}
                        placeholder="12m x 8m"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Profondeur</Form.Label>
                      <Form.Control
                        type="text"
                        name="profondeur"
                        value={formData.profondeur}
                        onChange={handleChange}
                        placeholder="15m"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hauteur</Form.Label>
                      <Form.Control
                        type="text"
                        name="hauteur"
                        value={formData.hauteur}
                        onChange={handleChange}
                        placeholder="6m"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-people me-2"></i>
                        Jauges
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="jauges"
                        value={formData.jauges}
                        onChange={handleChange}
                        placeholder="500 / 300 / 150"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hauteur Salle / Scène</Form.Label>
                      <Form.Control
                        type="text"
                        name="hauteurSalleScene"
                        value={formData.hauteurSalleScene}
                        onChange={handleChange}
                        placeholder="8m"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Spécifications techniques */}
                <h6 className="mb-3 mt-4">
                  <i className="bi bi-gear me-2"></i>
                  Spécifications techniques
                </h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hauteur sous porteuse</Form.Label>
                      <Form.Control
                        type="text"
                        name="hauteurSousPorteuse"
                        value={formData.hauteurSousPorteuse}
                        onChange={handleChange}
                        placeholder="7m"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bord de scène / lointain</Form.Label>
                      <Form.Control
                        type="text"
                        name="bordSceneLointain"
                        value={formData.bordSceneLointain}
                        onChange={handleChange}
                        placeholder="20m"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>R.d.f / lointain</Form.Label>
                      <Form.Control
                        type="text"
                        name="rdfLointain"
                        value={formData.rdfLointain}
                        onChange={handleChange}
                        placeholder="18m"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Largeur mur à mur</Form.Label>
                      <Form.Control
                        type="text"
                        name="largeurMurAMur"
                        value={formData.largeurMurAMur}
                        onChange={handleChange}
                        placeholder="16m"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pente scène (%)</Form.Label>
                      <Form.Control
                        type="text"
                        name="penteScene"
                        value={formData.penteScene}
                        onChange={handleChange}
                        placeholder="2%"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fosse</Form.Label>
                      <Form.Control
                        type="text"
                        name="fosse"
                        value={formData.fosse}
                        onChange={handleChange}
                        placeholder="Description de la fosse"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Proscénium</Form.Label>
                      <Form.Control
                        type="text"
                        name="proscenium"
                        value={formData.proscenium}
                        onChange={handleChange}
                        placeholder="Description du proscénium"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-clock me-2"></i>
                        Horaires
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="horaires"
                        value={formData.horaires}
                        onChange={handleChange}
                        placeholder="9h-18h du lundi au vendredi"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Tab>

            {/* Onglet Commentaires */}
            <Tab eventKey="commentaires" title="Commentaires">
              <div className="p-4">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-chat-text me-2"></i>
                    Commentaires et notes
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="commentaires"
                    value={formData.commentaires}
                    onChange={handleChange}
                    placeholder="Informations complémentaires, notes techniques, remarques particulières..."
                  />
                  <Form.Text className="text-muted">
                    Vous pouvez ajouter toutes les informations complémentaires concernant cette salle.
                  </Form.Text>
                </Form.Group>
              </div>
            </Tab>
          </Tabs>
        </Form>
      </Modal.Body>
      
      <Modal.Footer className="d-flex justify-content-between">
        <div>
          {Object.keys(errors).length > 0 && (
            <Alert variant="danger" className="mb-0 py-2">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Veuillez corriger les erreurs du formulaire
            </Alert>
          )}
        </div>
        <div>
          <Button variant="secondary" onClick={handleClose} className="me-2">
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Création...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Créer la salle
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SalleCreationModal; 