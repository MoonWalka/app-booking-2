// src/components/structures/desktop/StructureForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import '../../../style/structuresList.css';

const StructureForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const isEditMode = !!id;

  // État du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    raisonSociale: '',
    type: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    siret: '',
    tva: '',
    telephone: '',
    email: '',
    siteWeb: '',
    notes: '',
    contact: {
      nom: '',
      telephone: '',
      email: '',
      fonction: ''
    }
  });

  // Chargement des données de la structure à modifier
  useEffect(() => {
    if (isEditMode) {
      const fetchStructure = async () => {
        setLoading(true);
        try {
          const structureDoc = await getDoc(doc(db, 'structures', id));
          if (structureDoc.exists()) {
            const structureData = structureDoc.data();
            setFormData({
              nom: structureData.nom || '',
              raisonSociale: structureData.raisonSociale || '',
              type: structureData.type || '',
              adresse: structureData.adresse || '',
              codePostal: structureData.codePostal || '',
              ville: structureData.ville || '',
              pays: structureData.pays || 'France',
              siret: structureData.siret || '',
              tva: structureData.tva || '',
              telephone: structureData.telephone || '',
              email: structureData.email || '',
              siteWeb: structureData.siteWeb || '',
              notes: structureData.notes || '',
              contact: {
                nom: structureData.contact?.nom || '',
                telephone: structureData.contact?.telephone || '',
                email: structureData.contact?.email || '',
                fonction: structureData.contact?.fonction || ''
              }
            });
          } else {
            setError('Structure non trouvée');
            navigate('/structures');
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la structure:', error);
          setError('Une erreur est survenue lors du chargement des données');
        } finally {
          setLoading(false);
        }
      };

      fetchStructure();
    }
  }, [id, isEditMode, navigate]);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Gestion des champs imbriqués (comme contact.nom)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const structureData = {
        ...formData,
        updatedAt: Timestamp.now()
      };
      
      if (!isEditMode) {
        // Création d'une nouvelle structure
        const newStructureRef = doc(collection(db, 'structures'));
        structureData.createdAt = Timestamp.now();
        structureData.programmateursAssocies = [];
        
        await setDoc(newStructureRef, structureData);
        navigate(`/structures/${newStructureRef.id}`);
      } else {
        // Mise à jour d'une structure existante
        await updateDoc(doc(db, 'structures', id), structureData);
        navigate(`/structures/${id}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la structure:', error);
      setError('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="structure-form-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Modifier la structure' : 'Nouvelle structure'}</h2>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(isEditMode ? `/structures/${id}` : '/structures')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </Button>
      </div>

      {error && (
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-info-circle"></i>
            <h3>Informations de base</h3>
          </div>
          <div className="card-body">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Nom commercial ou d'usage"
                  />
                  <Form.Control.Feedback type="invalid">
                    Le nom est requis
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Raison sociale</Form.Label>
                  <Form.Control
                    type="text"
                    name="raisonSociale"
                    value={formData.raisonSociale}
                    onChange={handleChange}
                    placeholder="Dénomination légale"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de structure</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="association">Association</option>
                    <option value="entreprise">Entreprise</option>
                    <option value="administration">Administration</option>
                    <option value="collectivite">Collectivité</option>
                    <option value="autre">Autre</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Le type de structure est requis
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>SIRET</Form.Label>
                  <Form.Control
                    type="text"
                    name="siret"
                    value={formData.siret}
                    onChange={handleChange}
                    placeholder="Numéro SIRET (14 chiffres)"
                    pattern="[0-9]{14}"
                  />
                  <Form.Control.Feedback type="invalid">
                    Le SIRET doit contenir 14 chiffres
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>TVA Intracommunautaire</Form.Label>
                  <Form.Control
                    type="text"
                    name="tva"
                    value={formData.tva}
                    onChange={handleChange}
                    placeholder="N° TVA intracommunautaire"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </div>

        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-geo-alt"></i>
            <h3>Coordonnées</h3>
          </div>
          <div className="card-body">
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
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
                  <Form.Label>Code postal</Form.Label>
                  <Form.Control
                    type="text"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleChange}
                    placeholder="Code postal"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Ville</Form.Label>
                  <Form.Control
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    placeholder="Ville"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Pays</Form.Label>
                  <Form.Control
                    type="text"
                    name="pays"
                    value={formData.pays}
                    onChange={handleChange}
                    placeholder="Pays"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="Téléphone principal"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email principal"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Site web</Form.Label>
                  <Form.Control
                    type="url"
                    name="siteWeb"
                    value={formData.siteWeb}
                    onChange={handleChange}
                    placeholder="https://www.exemple.com"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </div>

        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-person"></i>
            <h3>Contact principal</h3>
          </div>
          <div className="card-body">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom et prénom</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact.nom"
                    value={formData.contact.nom}
                    onChange={handleChange}
                    placeholder="Nom complet du contact"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fonction</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact.fonction"
                    value={formData.contact.fonction}
                    onChange={handleChange}
                    placeholder="Fonction ou poste occupé"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone direct</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contact.telephone"
                    value={formData.contact.telephone}
                    onChange={handleChange}
                    placeholder="Téléphone du contact"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email direct</Form.Label>
                  <Form.Control
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleChange}
                    placeholder="Email du contact"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </div>

        <div className="form-card">
          <div className="card-header">
            <i className="bi bi-sticky"></i>
            <h3>Notes</h3>
          </div>
          <div className="card-body">
            <Form.Group className="mb-3">
              <Form.Label>Notes supplémentaires</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Informations supplémentaires sur la structure..."
              />
            </Form.Group>
          </div>
        </div>

        <div className="form-actions">
          <Button
            variant="outline-secondary"
            onClick={() => navigate(isEditMode ? `/structures/${id}` : '/structures')}
            disabled={submitting}
          >
            <i className="bi bi-x-circle me-2"></i>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default StructureForm;