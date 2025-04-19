// src/components/forms/mobile/FormValidationInterface.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase.js';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { Button, Badge, Spinner } from 'react-bootstrap';
import '../../../style/formsResponsive.css';

const FormValidationInterfaceMobile = () => {
  const { id } = useParams(); // Ici, id est l'ID du concert
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [formId, setFormId] = useState(null);
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [validatedFields, setValidatedFields] = useState({});
  const [programmateur, setProgrammateur] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [activeSection, setActiveSection] = useState('programmateur');

  // Charger les données du formulaire
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        
        // Récupérer le concert
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        if (!concertDoc.exists()) {
          setError('Concert non trouvé');
          setLoading(false);
          return;
        }
        
        const concertData = {
          id: concertDoc.id,
          ...concertDoc.data()
        };
        setConcert(concertData);
        
        // Récupérer le formulaire associé
        let formDoc;
        if (concertData.formId) {
          formDoc = await getDoc(doc(db, 'formulaires', concertData.formId));
          if (formDoc.exists()) {
            setFormId(formDoc.id);
            setFormData({
              id: formDoc.id,
              ...formDoc.data()
            });
          }
        } else {
          // Chercher dans la collection des formulaires
          const formsQuery = query(
            collection(db, 'formulaires'),
            where('concertId', '==', id)
          );
          const formsSnapshot = await getDocs(formsQuery);
          
          if (!formsSnapshot.empty) {
            formDoc = formsSnapshot.docs[0];
            setFormId(formDoc.id);
            setFormData({
              id: formDoc.id,
              ...formDoc.data()
            });
            
            // Mettre à jour le concert avec l'ID du formulaire
            await updateDoc(doc(db, 'concerts', id), {
              formId: formDoc.id
            });
          } else {
            setError('Aucun formulaire trouvé pour ce concert');
          }
        }
        
        // Charger les données validées si elles existent
        if (formDoc && formDoc.exists() && formDoc.data().validatedData) {
          setValidatedFields(formDoc.data().validatedData);
          setValidated(formDoc.data().statut === 'valide');
        }
        
        // Charger les données du programmateur
        if (concertData.programmateurId) {
          const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
          if (progDoc.exists()) {
            setProgrammateur({
              id: progDoc.id,
              ...progDoc.data()
            });
          }
        }
        
        // Charger les données du lieu
        if (concertData.lieuId) {
          const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
          if (lieuDoc.exists()) {
            setLieu({
              id: lieuDoc.id,
              ...lieuDoc.data()
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [id]);

  // Gérer la validation d'un champ
  const handleFieldValidation = (field, value, isValid) => {
    setValidatedFields(prev => ({
      ...prev,
      [field]: {
        value,
        isValid
      }
    }));
  };

  // Gérer la validation complète du formulaire
  const handleValidateForm = async () => {
    try {
      setValidationInProgress(true);
      
      // Mettre à jour le formulaire avec les données validées
      await updateDoc(doc(db, 'formulaires', formId), {
        validatedData: validatedFields,
        statut: 'valide',
        dateValidation: Timestamp.now()
      });
      
      // Mettre à jour le statut du concert si nécessaire
      if (concert.statut === 'contact') {
        await updateDoc(doc(db, 'concerts', id), {
          statut: 'preaccord'
        });
      }
      
      setValidated(true);
      setValidationInProgress(false);
    } catch (error) {
      console.error('Erreur lors de la validation du formulaire:', error);
      setError('Une erreur est survenue lors de la validation du formulaire');
      setValidationInProgress(false);
    }
  };

  // Formater la date
  const formatDate = (date) => {
    if (!date) return '';
    
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Chargement du formulaire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <p>{error}</p>
        <Button 
          variant="primary"
          onClick={() => navigate('/concerts')}
        >
          Retour aux concerts
        </Button>
      </div>
    );
  }

  if (!formData || !formData.reponses) {
    return (
      <div className="empty-state">
        <i className="bi bi-file-earmark-x"></i>
        <p>Le formulaire n'a pas encore été rempli par le programmateur.</p>
        <div className="action-buttons">
          <Button 
            variant="outline-secondary"
            onClick={() => navigate(`/concerts/${id}`)}
          >
            Retour au concert
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate(`/concerts/${id}?openFormGenerator=true`)}
          >
            Renvoyer le formulaire
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-validation-mobile">
      <div className="mobile-header-bar">
        <button 
          className="back-button" 
          onClick={() => navigate(`/concerts/${id}`)}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="mobile-title-container">
          <h1>Formulaire de concert</h1>
        </div>
      </div>

      <div className="form-status-container">
        <div className="form-status">
          <span className="status-label">Statut:</span>
          <Badge bg={validated ? 'success' : 'warning'}>
            {validated ? 'Validé' : 'À valider'}
          </Badge>
        </div>
        
        <div className="form-info">
          <div className="info-item">
            <span className="info-label">Date de réponse:</span>
            <span className="info-value">{formatDate(formData.dateReponse || formData.dateCreation)}</span>
          </div>
        </div>
      </div>

      <div className="form-tabs">
        <button 
          className={`tab-button ${activeSection === 'programmateur' ? 'active' : ''}`}
          onClick={() => setActiveSection('programmateur')}
        >
          <i className="bi bi-person-badge"></i>
          <span>Programmateur</span>
        </button>
        <button 
          className={`tab-button ${activeSection === 'lieu' ? 'active' : ''}`}
          onClick={() => setActiveSection('lieu')}
        >
          <i className="bi bi-geo-alt"></i>
          <span>Lieu</span>
        </button>
        <button 
          className={`tab-button ${activeSection === 'technique' ? 'active' : ''}`}
          onClick={() => setActiveSection('technique')}
        >
          <i className="bi bi-tools"></i>
          <span>Technique</span>
        </button>
      </div>

      <div className="form-content">
        {activeSection === 'programmateur' && (
          <div className="form-section">
            <h3>Informations du programmateur</h3>
            
            <div className="form-field">
              <div className="field-label">Nom</div>
              <div className="field-value">
                {formData.reponses.nom || '-'}
                <ValidationCheckbox 
                  field="nom"
                  value={formData.reponses.nom}
                  validated={validatedFields.nom?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Prénom</div>
              <div className="field-value">
                {formData.reponses.prenom || '-'}
                <ValidationCheckbox 
                  field="prenom"
                  value={formData.reponses.prenom}
                  validated={validatedFields.prenom?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Email</div>
              <div className="field-value">
                {formData.reponses.email || '-'}
                <ValidationCheckbox 
                  field="email"
                  value={formData.reponses.email}
                  validated={validatedFields.email?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Téléphone</div>
              <div className="field-value">
                {formData.reponses.telephone || '-'}
                <ValidationCheckbox 
                  field="telephone"
                  value={formData.reponses.telephone}
                  validated={validatedFields.telephone?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Structure</div>
              <div className="field-value">
                {formData.reponses.structure || '-'}
                <ValidationCheckbox 
                  field="structure"
                  value={formData.reponses.structure}
                  validated={validatedFields.structure?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">SIRET</div>
              <div className="field-value">
                {formData.reponses.siret || '-'}
                <ValidationCheckbox 
                  field="siret"
                  value={formData.reponses.siret}
                  validated={validatedFields.siret?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'lieu' && (
          <div className="form-section">
            <h3>Informations du lieu</h3>
            
            <div className="form-field">
              <div className="field-label">Nom</div>
              <div className="field-value">
                {formData.reponses.lieuNom || '-'}
                <ValidationCheckbox 
                  field="lieuNom"
                  value={formData.reponses.lieuNom}
                  validated={validatedFields.lieuNom?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Adresse</div>
              <div className="field-value">
                {formData.reponses.lieuAdresse || '-'}
                <ValidationCheckbox 
                  field="lieuAdresse"
                  value={formData.reponses.lieuAdresse}
                  validated={validatedFields.lieuAdresse?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Code postal</div>
              <div className="field-value">
                {formData.reponses.lieuCodePostal || '-'}
                <ValidationCheckbox 
                  field="lieuCodePostal"
                  value={formData.reponses.lieuCodePostal}
                  validated={validatedFields.lieuCodePostal?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Ville</div>
              <div className="field-value">
                {formData.reponses.lieuVille || '-'}
                <ValidationCheckbox 
                  field="lieuVille"
                  value={formData.reponses.lieuVille}
                  validated={validatedFields.lieuVille?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Capacité</div>
              <div className="field-value">
                {formData.reponses.lieuCapacite || '-'}
                <ValidationCheckbox 
                  field="lieuCapacite"
                  value={formData.reponses.lieuCapacite}
                  validated={validatedFields.lieuCapacite?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'technique' && (
          <div className="form-section">
            <h3>Informations techniques</h3>
            
            <div className="form-field">
              <div className="field-label">Heure d'arrivée</div>
              <div className="field-value">
                {formData.reponses.heureArrivee || '-'}
                <ValidationCheckbox 
                  field="heureArrivee"
                  value={formData.reponses.heureArrivee}
                  validated={validatedFields.heureArrivee?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Heure de balance</div>
              <div className="field-value">
                {formData.reponses.heureBalance || '-'}
                <ValidationCheckbox 
                  field="heureBalance"
                  value={formData.reponses.heureBalance}
                  validated={validatedFields.heureBalance?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Heure d'ouverture</div>
              <div className="field-value">
                {formData.reponses.heureOuverture || '-'}
                <ValidationCheckbox 
                  field="heureOuverture"
                  value={formData.reponses.heureOuverture}
                  validated={validatedFields.heureOuverture?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Heure de début</div>
              <div className="field-value">
                {formData.reponses.heureDebut || '-'}
                <ValidationCheckbox 
                  field="heureDebut"
                  value={formData.reponses.heureDebut}
                  validated={validatedFields.heureDebut?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Durée du concert</div>
              <div className="field-value">
                {formData.reponses.dureeConcert || '-'}
                <ValidationCheckbox 
                  field="dureeConcert"
                  value={formData.reponses.dureeConcert}
                  validated={validatedFields.dureeConcert?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
            
            <div className="form-field">
              <div className="field-label">Besoins techniques</div>
              <div className="field-value">
                <div className="long-text">
                  {formData.reponses.besoinsTechniques || '-'}
                </div>
                <ValidationCheckbox 
                  field="besoinsTechniques"
                  value={formData.reponses.besoinsTechniques}
                  validated={validatedFields.besoinsTechniques?.isValid}
                  onValidate={handleFieldValidation}
                  disabled={validated}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {!validated && (
        <div className="form-actions">
          <Button 
            variant="primary"
            onClick={handleValidateForm}
            disabled={validationInProgress}
          >
            {validationInProgress ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Validation en cours...
              </>
            ) : (
              'Valider le formulaire'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// Composant pour les cases à cocher de validation
const ValidationCheckbox = ({ field, value, validated, onValidate, disabled }) => {
  return (
    <div className="validation-checkbox">
      <input
        type="checkbox"
        id={`validate-${field}`}
        checked={validated || false}
        onChange={(e) => onValidate(field, value, e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={`validate-${field}`} className={disabled ? 'disabled' : ''}>
        {validated ? (
          <i className="bi bi-check-circle-fill text-success"></i>
        ) : (
          <i className="bi bi-circle"></i>
        )}
      </label>
    </div>
  );
};

export default FormValidationInterfaceMobile;