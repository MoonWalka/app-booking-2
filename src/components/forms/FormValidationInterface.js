import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

function FormValidationInterface() {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. D'abord, récupérer les données du concert
        const concertRef = doc(db, 'concerts', id);
        const concertDoc = await getDoc(concertRef);
        
        if (!concertDoc.exists()) {
          setError("Ce concert n'existe pas.");
          setLoading(false);
          return;
        }
        
        const concertData = {
          id: concertDoc.id,
          ...concertDoc.data()
        };
        
        setConcert(concertData);
        
        // 2. Chercher le formulaire associé au concert
        let formDocId = null;
        
        // Si le concert a déjà un formId associé
        if (concertData.formId) {
          formDocId = concertData.formId;
        } else {
          // Sinon, chercher dans la collection formulaires par concertId
          const formsQuery = query(
            collection(db, 'formulaires'), 
            where('concertId', '==', id)
          );
          
          const formsSnapshot = await getDocs(formsQuery);
          
          if (formsSnapshot.empty) {
            setError("Aucun formulaire n'a été soumis pour ce concert.");
            setLoading(false);
            return;
          }
          
          // Prendre le formulaire le plus récent
          const forms = formsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Trier par date de création (du plus récent au plus ancien)
          forms.sort((a, b) => {
            const dateA = a.dateCreation?.toDate() || new Date(0);
            const dateB = b.dateCreation?.toDate() || new Date(0);
            return dateB - dateA;
          });
          
          formDocId = forms[0].id;
        }
        
        setFormId(formDocId);
        
        // 3. Récupérer les données du formulaire
        const formDoc = await getDoc(doc(db, 'formulaires', formDocId));
        
        if (formDoc.exists()) {
          const formDocData = {
            id: formDoc.id,
            ...formDoc.data()
          };
          
          setFormData(formDocData);
          
          // Si le formulaire a déjà des champs validés, les charger
          if (formDocData.validatedFields) {
            setValidatedFields(formDocData.validatedFields);
          }
        } else {
          setError("Le formulaire associé n'a pas été trouvé.");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données du formulaire.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Gérer la validation d'un champ spécifique
  const handleValidateField = (fieldCategory, fieldName, value) => {
    // Créer un objet qui représente le chemin complet du champ
    // Par exemple: programmateur.nom, structure.raisonSociale, etc.
    const fieldPath = `${fieldCategory}.${fieldName}`;
    
    // Mettre à jour l'état local des champs validés
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: value
    }));
  };

  // Valider le formulaire complet
  const validateForm = async () => {
    if (!formId) return;
    
    try {
      setValidationInProgress(true);
      
      // 1. Mettre à jour le statut du formulaire
      await updateDoc(doc(db, 'formulaires', formId), {
        statut: 'valide',
        dateValidation: new Date(),
        validatedFields: validatedFields
      });
      
      // 2. Mettre à jour les données du concert avec les champs validés
      // Transformer les champs validés pour qu'ils correspondent à la structure du concert
      const concertUpdates = {};
      
      // Pour chaque champ validé, créer la mise à jour correspondante
      Object.entries(validatedFields).forEach(([fieldPath, value]) => {
        const [category, field] = fieldPath.split('.');
        
        if (category === 'programmateur') {
          // Exemple: programmateur.nom => programmateurNom
          concertUpdates[`programmateur${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
        } else if (category === 'structure') {
          // Exemple: structure.raisonSociale => structureRaisonSociale
          concertUpdates[`structure${field.charAt(0).toUpperCase() + field.slice(1)}`] = value;
        } else {
          // Autres champs
          concertUpdates[field] = value;
        }
      });
      
      // Ajouter des informations de formulaire validé
      concertUpdates.formValidated = true;
      concertUpdates.formId = formId;
      concertUpdates.formValidatedAt = new Date();
      
      await updateDoc(doc(db, 'concerts', id), concertUpdates);
      
      setValidated(true);
      setValidationInProgress(false);
    } catch (err) {
      console.error("Erreur lors de la validation du formulaire:", err);
      setError("Impossible de valider le formulaire. Veuillez réessayer plus tard.");
      setValidationInProgress(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    
    // Si c'est un timestamp Firestore
    if (dateString && dateString.seconds) {
      return new Date(dateString.seconds * 1000).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }
    
    // Sinon, traiter comme une chaîne de date standard
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatCurrency = (value) => {
    if (!value) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  if (loading) {
    return (
      <div className="loading-container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement des données du formulaire...</span>
        </div>
        <p className="mt-3">Chargement des données du formulaire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center my-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate('/concerts')}
        >
          Retour à la liste des concerts
        </button>
      </div>
    );
  }

  if (!formData || !concert) {
    return (
      <div className="not-found-container text-center my-5">
        <div className="alert alert-warning">
          <i className="bi bi-question-circle-fill me-2"></i>
          Formulaire non trouvé.
        </div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate('/concerts')}
        >
          Retour à la liste des concerts
        </button>
      </div>
    );
  }

  // Vérifier si le formulaire a déjà été validé
  const isAlreadyValidated = formData.statut === 'valide';

  return (
    <div className="form-validation container mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Validation du formulaire</h2>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/concerts/${id}`)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Retour au concert
            </button>
          </div>
          <hr />
        </div>
      </div>

      {(isAlreadyValidated || validated) ? (
        <div className="validation-success card border-success mb-4">
          <div className="card-body text-center">
            <div className="success-icon">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
            </div>
            <h3 className="mt-3">Formulaire validé avec succès</h3>
            <p className="text-muted">Les informations validées ont été intégrées à la fiche du concert.</p>
            <button 
              className="btn btn-primary mt-3" 
              onClick={() => navigate(`/concerts/${id}`)}
            >
              Retourner à la fiche du concert
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="alert alert-info mb-4">
            <div className="d-flex">
              <i className="bi bi-info-circle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <h4 className="alert-heading">Instructions</h4>
                <p className="mb-0">
                  Vérifiez les informations ci-dessous soumises par le programmateur. 
                  Pour chaque champ, vous pouvez cliquer sur le bouton "Valider" pour confirmer l'information 
                  et l'intégrer à la fiche du concert.
                </p>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Informations du concert</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="fw-bold">Date</label>
                    <p>{formatDate(concert.date)}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="fw-bold">Montant</label>
                    <p>{formatCurrency(concert.montant)}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="fw-bold">Lieu</label>
                    <p>{concert.lieuNom || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-secondary text-white">
              <h3 className="mb-0">Informations du programmateur</h3>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {formData.reponses && (
                  <>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Nom</h5>
                              <p className="card-text">{formData.reponses.nom || 'Non spécifié'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['programmateur.nom'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('programmateur', 'nom', formData.reponses.nom)}
                              disabled={!!validatedFields['programmateur.nom']}
                            >
                              {validatedFields['programmateur.nom'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Prénom</h5>
                              <p className="card-text">{formData.reponses.prenom || 'Non spécifié'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['programmateur.prenom'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('programmateur', 'prenom', formData.reponses.prenom)}
                              disabled={!!validatedFields['programmateur.prenom']}
                            >
                              {validatedFields['programmateur.prenom'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Fonction</h5>
                              <p className="card-text">{formData.reponses.fonction || 'Non spécifiée'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['programmateur.fonction'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('programmateur', 'fonction', formData.reponses.fonction)}
                              disabled={!!validatedFields['programmateur.fonction']}
                            >
                              {validatedFields['programmateur.fonction'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Email</h5>
                              <p className="card-text">{formData.reponses.email || 'Non spécifié'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['programmateur.email'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('programmateur', 'email', formData.reponses.email)}
                              disabled={!!validatedFields['programmateur.email']}
                            >
                              {validatedFields['programmateur.email'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Téléphone</h5>
                              <p className="card-text">{formData.reponses.telephone || 'Non spécifié'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['programmateur.telephone'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('programmateur', 'telephone', formData.reponses.telephone)}
                              disabled={!!validatedFields['programmateur.telephone']}
                            >
                              {validatedFields['programmateur.telephone'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-secondary text-white">
              <h3 className="mb-0">Structure juridique</h3>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {formData.reponses && (
                  <>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Raison sociale</h5>
                              <p className="card-text">{formData.reponses.raisonSociale || 'Non spécifiée'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['structure.raisonSociale'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('structure', 'raisonSociale', formData.reponses.raisonSociale)}
                              disabled={!!validatedFields['structure.raisonSociale']}
                            >
                              {validatedFields['structure.raisonSociale'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Type de structure</h5>
                              <p className="card-text">{formData.reponses.typeStructure || 'Non spécifié'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['structure.typeStructure'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('structure', 'typeStructure', formData.reponses.typeStructure)}
                              disabled={!!validatedFields['structure.typeStructure']}
                            >
                              {validatedFields['structure.typeStructure'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Adresse</h5>
                              <p className="card-text">{formData.reponses.adresse || 'Non spécifiée'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['structure.adresse'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('structure', 'adresse', formData.reponses.adresse)}
                              disabled={!!validatedFields['structure.adresse']}
                            >
                              {validatedFields['structure.adresse'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Code postal</h5>
                              <p className="card-text">{formData.reponses.codePostal || 'Non spécifié'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['structure.codePostal'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('structure', 'codePostal', formData.reponses.codePostal)}
                              disabled={!!validatedFields['structure.codePostal']}
                            >
                              {validatedFields['structure.codePostal'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">Ville</h5>
                              <p className="card-text">{formData.reponses.ville || 'Non spécifiée'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['structure.ville'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('structure', 'ville', formData.reponses.ville)}
                              disabled={!!validatedFields['structure.ville']}
                            >
                              {validatedFields['structure.ville'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title">SIRET</h5>
                              <p className="card-text">{formData.reponses.siret || 'Non spécifié'}</p>
                            </div>
                            <button 
                              className={`btn ${validatedFields['structure.siret'] ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleValidateField('structure', 'siret', formData.reponses.siret)}
                              disabled={!!validatedFields['structure.siret']}
                            >
                              {validatedFields['structure.siret'] ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Validé
                                </>
                              ) : (
                                'Valider'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-4 mb-5">
            <button 
              onClick={validateForm} 
              className="btn btn-lg btn-primary"
              disabled={validationInProgress || Object.keys(validatedFields).length === 0}
            >
              {validationInProgress ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Validation en cours...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Valider le formulaire et enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default FormValidationInterface;
