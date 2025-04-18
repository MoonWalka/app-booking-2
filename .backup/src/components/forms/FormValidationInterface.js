import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

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
  const [programmateur, setProgrammateur] = useState(null);
  
  // Liste des champs à comparer et valider
  const contactFields = [
    { id: 'nom', label: 'Nom' },
    { id: 'prenom', label: 'Prénom' },
    { id: 'fonction', label: 'Fonction' },
    { id: 'email', label: 'Email' },
    { id: 'telephone', label: 'Téléphone' }
  ];
  
  const structureFields = [
    { id: 'raisonSociale', label: 'Raison sociale' },
    { id: 'type', label: 'Type de structure' },
    { id: 'adresse', label: 'Adresse' },
    { id: 'codePostal', label: 'Code postal' },
    { id: 'ville', label: 'Ville' },
    { id: 'pays', label: 'Pays' },
    { id: 'siret', label: 'SIRET' }
  ];

  const fetchData = async () => {
    try {
      console.log("Recherche de formulaire pour le concert:", id);
      
      // 1. D'abord, récupérer les données du concert
      const concertRef = doc(db, 'concerts', id);
      const concertDoc = await getDoc(concertRef);
      
      if (!concertDoc.exists()) {
        console.error("Concert non trouvé:", id);
        setError("Ce concert n'existe pas.");
        setLoading(false);
        return;
      }
      
      const concertData = {
        id: concertDoc.id,
        ...concertDoc.data()
      };
      
      console.log("Concert trouvé:", concertData);
      setConcert(concertData);
      
      // 2. Chercher la soumission de formulaire associée au concert
      let formSubmissionId = null;
      
      // Si le concert a déjà un formSubmissionId associé
      if (concertData.formSubmissionId) {
        console.log("FormSubmissionId trouvé dans le concert:", concertData.formSubmissionId);
        formSubmissionId = concertData.formSubmissionId;
      } else {
        console.log("Recherche dans formSubmissions par concertId");
        // Chercher dans la collection formSubmissions
        const submissionsQuery = query(
          collection(db, 'formSubmissions'), 
          where('concertId', '==', id)
        );
        
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        if (submissionsSnapshot.empty) {
          console.log("Aucune soumission trouvée, recherche dans formLinks");
          // Si aucune soumission, vérifier si un lien a été généré
          const linksQuery = query(
            collection(db, 'formLinks'), 
            where('concertId', '==', id)
          );
          
          const linksSnapshot = await getDocs(linksQuery);
          
          if (linksSnapshot.empty) {
            console.error("Aucun formulaire trouvé pour ce concert");
            setError("Aucun formulaire n'a été soumis pour ce concert.");
            setLoading(false);
            return;
          }
          
          console.log("Lien trouvé, mais aucune soumission");
          setError("Un lien de formulaire a été généré mais le programmateur n'a pas encore soumis de réponse.");
          setLoading(false);
          return;
        }
        
        // Prendre la soumission la plus récente
        const submissions = submissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Soumissions trouvées:", submissions.length);
        
        // Trier par date de soumission (du plus récent au plus ancien)
        submissions.sort((a, b) => {
          const dateA = a.submittedAt?.toDate() || a.createdAt?.toDate() || new Date(0);
          const dateB = b.submittedAt?.toDate() || b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        });
        
        formSubmissionId = submissions[0].id;
        
        // Mettre à jour le concert avec l'ID de la soumission
        await updateDoc(doc(db, 'concerts', id), {
          formSubmissionId: formSubmissionId
        });
        
        console.log("FormSubmissionId sélectionné:", formSubmissionId);
      }
      
      setFormId(formSubmissionId);
      
      // 3. Récupérer les données de la soumission
      const formDoc = await getDoc(doc(db, 'formSubmissions', formSubmissionId));
      
      if (formDoc.exists()) {
        const formDocData = {
          id: formDoc.id,
          ...formDoc.data()
        };
        
        console.log("Soumission trouvée:", formDocData);
        setFormData(formDocData);
        
        // MODIFICATION: Utiliser directement les données stockées dans la soumission
        if (formDocData.programmateurData) {
          // Si la soumission contient une copie complète des données du programmateur
          setProgrammateur(formDocData.programmateurData);
          
          // 5. Initialiser les valeurs finales avec les données de la soumission
          const initialValues = {};
          
          // Extraire les données de contact à partir de programmateurData
          contactFields.forEach(field => {
            initialValues[`contact.${field.id}`] = formDocData.programmateurData[field.id] || '';
          });
          
          // Extraire les données de structure à partir de programmateurData
          structureFields.forEach(field => {
            if (field.id === 'raisonSociale') {
              initialValues[`structure.${field.id}`] = formDocData.programmateurData.structure || '';
            } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field.id)) {
              initialValues[`structure.${field.id}`] = formDocData.programmateurData[`structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`] || '';
            } else {
              initialValues[`structure.${field.id}`] = formDocData.programmateurData[field.id] || '';
            }
          });
          
          // 6. Si la soumission a déjà été validée, utiliser les champs validés existants
          if (formDocData.status === 'validated' && formDocData.validatedFields) {
            setValidatedFields(formDocData.validatedFields);
            setValidated(true);
          } else {
            // Sinon, initialiser les champs validés avec les valeurs de la soumission
            setValidatedFields(initialValues);
          }
        } 
        // Compatibilité avec l'ancien format - utiliser data si programmateurData n'existe pas
        else if (formDocData.data) {
          // Construire un objet programmateur compatible à partir des données de la soumission
          const programmateurFromData = {
            nom: `${formDocData.data.nom || ''} ${formDocData.data.prenom || ''}`.trim(),
            ...formDocData.data
          };
          
          setProgrammateur(programmateurFromData);
          
          // Initialiser les valeurs avec les données disponibles
          const initialValues = {};
          
          // Traiter les champs contact
          contactFields.forEach(field => {
            initialValues[`contact.${field.id}`] = formDocData.data[field.id] || '';
          });
          
          // Traiter les champs structure
          structureFields.forEach(field => {
            initialValues[`structure.${field.id}`] = formDocData.data[field.id] || '';
          });
          
          // Si la soumission a déjà été validée
          if (formDocData.status === 'validated' && formDocData.validatedFields) {
            setValidatedFields(formDocData.validatedFields);
            setValidated(true);
          } else {
            setValidatedFields(initialValues);
          }
        }
        // Si ni programmateurData ni data n'existe, mais qu'il y a un programmateur associé
        else if (formDocData.programmId) {
          console.log("Aucune donnée complète dans la soumission, recherche du programmateur associé");
          // Récupérer les données du programmateur comme fallback
          try {
            const progDoc = await getDoc(doc(db, 'programmateurs', formDocData.programmId));
            if (progDoc.exists()) {
              const programmateurData = progDoc.data();
              setProgrammateur(programmateurData);
              
              // Initialiser les valeurs finales
              const initialValues = {};
              
              // Traiter les champs contact
              contactFields.forEach(field => {
                initialValues[`contact.${field.id}`] = programmateurData[field.id] || '';
              });
              
              // Traiter les champs structure
              structureFields.forEach(field => {
                if (field.id === 'raisonSociale') {
                  initialValues[`structure.${field.id}`] = programmateurData.structure || '';
                } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field.id)) {
                  initialValues[`structure.${field.id}`] = programmateurData[`structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`] || '';
                } else {
                  initialValues[`structure.${field.id}`] = programmateurData[field.id] || '';
                }
              });
              
              if (formDocData.status === 'validated' && formDocData.validatedFields) {
                setValidatedFields(formDocData.validatedFields);
                setValidated(true);
              } else {
                setValidatedFields(initialValues);
              }
            }
          } catch (error) {
            console.error("Erreur lors de la récupération du programmateur:", error);
          }
        }
      } else {
        console.error("Soumission non trouvée avec ID:", formSubmissionId);
        setError("La soumission de formulaire n'a pas été trouvée.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(`Impossible de charger les données du formulaire: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Modifier la fonction validateForm pour mettre à jour également le document programmateur
  const validateForm = async () => {
    if (!formId) return;
    
    try {
      setValidationInProgress(true);
      
      // 1. Mettre à jour le statut de la soumission
      await updateDoc(doc(db, 'formSubmissions', formId), {
        status: 'validated',
        validatedAt: new Date(),
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
      concertUpdates.formSubmissionId = formId;
      concertUpdates.formValidatedAt = new Date();
      
      await updateDoc(doc(db, 'concerts', id), concertUpdates);
      
      // 3. Si un programmateur est associé, mettre à jour ses informations
      if (formData.programmId) {
        const programmUpdateData = {};
        
        // Traiter les champs contact
        contactFields.forEach(field => {
          const fieldPath = `contact.${field.id}`;
          if (validatedFields[fieldPath] !== undefined) {
            programmUpdateData[field.id] = validatedFields[fieldPath];
          }
        });
        
        // Traiter les champs structure
        structureFields.forEach(field => {
          const fieldPath = `structure.${field.id}`;
          if (validatedFields[fieldPath] !== undefined) {
            if (field.id === 'raisonSociale') {
              programmUpdateData.structure = validatedFields[fieldPath];
            } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field.id)) {
              programmUpdateData[`structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`] = validatedFields[fieldPath];
            } else {
              programmUpdateData[field.id] = validatedFields[fieldPath];
            }
          }
        });
        
        // Ajouter timestamp de mise à jour
        programmUpdateData.updatedAt = Timestamp.now();
        
        await updateDoc(doc(db, 'programmateurs', formData.programmId), programmUpdateData);
      }
      
      setValidated(true);
      setValidationInProgress(false);
    } catch (err) {
      console.error("Erreur lors de la validation du formulaire:", err);
      setError("Impossible de valider le formulaire. Veuillez réessayer plus tard.");
      setValidationInProgress(false);
    }
  };

  // Le reste du code reste inchangé
  
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

  // Copier la valeur du formulaire vers la valeur finale
  const copyFormValueToFinal = (fieldPath, formValue) => {
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: formValue
    }));
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
          onClick={() => navigate(`/concerts/${id}`)}
        >
          Retour à la fiche concert
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
          onClick={() => navigate(`/concerts/${id}`)}
        >
          Retour à la fiche concert
        </button>
      </div>
    );
  }

  // Vérifier si le formulaire a déjà été validé
  const isAlreadyValidated = formData.status === 'validated';

  return (
    <div className="form-validation container mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              {isAlreadyValidated || validated ? 'Formulaire validé' : 'Validation du formulaire'}
            </h2>
            <div className="d-flex">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate(`/concerts/${id}`)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Retour au concert
              </button>
            </div>
          </div>
          <hr />
        </div>
      </div>

      {/* Message de succès si validé */}
      {(isAlreadyValidated || validated) && (
        <div className="validation-success card border-success mb-4">
          <div className="card-body text-center">
            <div className="success-icon">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
            </div>
            <h3 className="mt-3">Formulaire validé avec succès</h3>
            <p className="text-muted">Les informations validées ont été intégrées à la fiche du programmateur.</p>
          </div>
        </div>
      )}

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
          <h3 className="mb-0">Informations du contact</h3>
        </div>
        <div className="card-body">
          <div className="alert alert-info mb-4">
            <div className="d-flex">
              <i className="bi bi-info-circle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <p className="mb-0">
                  Comparez les valeurs existantes avec celles soumises par le programmateur. 
                  Utilisez la flèche (➡️) pour copier les valeurs du formulaire vers la colonne "Valeur finale". 
                  Vous pouvez également modifier directement les champs de la colonne "Valeur finale".
                </p>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered comparison-table">
              <thead className="table-light">
                <tr>
                  <th style={{width: '15%'}}>Champ</th>
                  <th style={{width: '25%'}}>Valeur existante</th>
                  <th style={{width: '25%'}}>Valeur du formulaire</th>
                  <th style={{width: '10%'}}></th>
                  <th style={{width: '25%'}}>Valeur finale</th>
                </tr>
              </thead>
              <tbody>
                {contactFields.map(field => {
                  const fieldPath = `contact.${field.id}`;
                  const existingValue = programmateur ? programmateur[field.id] || '' : '';
                  
                  // MODIFICATION: Utiliser les données de programmateurData ou de data si disponibles
                  const formValue = formData.programmateurData 
                    ? formData.programmateurData[field.id] || '' 
                    : (formData.data ? formData.data[field.id] || '' : '');
                  
                  return (
                    <tr key={field.id}>
                      <td className="field-name">{field.label}</td>
                      <td className="existing-value">{existingValue || <em className="text-muted">Non renseigné</em>}</td>
                      <td className="form-value">{formValue || <em className="text-muted">Non renseigné</em>}</td>
                      <td className="action-cell text-center">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => copyFormValueToFinal(fieldPath, formValue)}
                          title="Copier vers valeur finale"
                          disabled={isAlreadyValidated}
                        >
                          ➡️
                        </button>
                      </td>
                      <td className="final-value">
                        <input
                          type="text"
                          className="form-control"
                          value={validatedFields[fieldPath] || ''}
                          onChange={(e) => handleValidateField(fieldPath, field.id, e.target.value)}
                          disabled={isAlreadyValidated}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h3 className="mb-0">Informations de la structure</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered comparison-table">
              <thead className="table-light">
                <tr>
                  <th style={{width: '15%'}}>Champ</th>
                  <th style={{width: '25%'}}>Valeur existante</th>
                  <th style={{width: '25%'}}>Valeur du formulaire</th>
                  <th style={{width: '10%'}}></th>
                  <th style={{width: '25%'}}>Valeur finale</th>
                </tr>
              </thead>
              <tbody>
                {structureFields.map(field => {
                  const fieldPath = `structure.${field.id}`;
                  let existingValue = '';
                  let formValue = '';
                  
                  // Obtenir la valeur existante selon le type de champ
                  if (programmateur) {
                    if (field.id === 'raisonSociale') {
                      existingValue = programmateur.structure || '';
                      
                      // MODIFICATION: Utiliser programmateurData si disponible
                      if (formData.programmateurData) {
                        formValue = formData.programmateurData.structure || '';
                      } else if (formData.data) {
                        formValue = formData.data[field.id] || '';
                      }
                    } else if (['type', 'adresse', 'codePostal', 'ville', 'pays'].includes(field.id)) {
                      const fieldKey = `structure${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`;
                      existingValue = programmateur[fieldKey] || '';
                      
                      // MODIFICATION: Utiliser programmateurData si disponible
                      if (formData.programmateurData) {
                        formValue = formData.programmateurData[fieldKey] || '';
                      } else if (formData.data) {
                        formValue = formData.data[field.id] || '';
                      }
                    } else {
                      existingValue = programmateur[field.id] || '';
                      
                      // MODIFICATION: Utiliser programmateurData si disponible
                      if (formData.programmateurData) {
                        formValue = formData.programmateurData[field.id] || '';
                      } else if (formData.data) {
                        formValue = formData.data[field.id] || '';
                      }
                    }
                  }
                  
                  return (
                    <tr key={field.id}>
                      <td className="field-name">{field.label}</td>
                      <td className="existing-value">{existingValue || <em className="text-muted">Non renseigné</em>}</td>
                      <td className="form-value">{formValue || <em className="text-muted">Non renseigné</em>}</td>
                      <td className="action-cell text-center">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => copyFormValueToFinal(fieldPath, formValue)}
                          title="Copier vers valeur finale"
                          disabled={isAlreadyValidated}
                        >
                          ➡️
                        </button>
                      </td>
                      <td className="final-value">
                        <input
                          type="text"
                          className="form-control"
                          value={validatedFields[fieldPath] || ''}
                          onChange={(e) => handleValidateField(fieldPath, field.id, e.target.value)}
                          disabled={isAlreadyValidated}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bouton de validation final - seulement visible si pas encore validé */}
      {!isAlreadyValidated && !validated && (
        <div className="d-flex justify-content-center mt-4 mb-5">
          <button 
            onClick={validateForm} 
            className="btn btn-lg btn-primary"
            disabled={validationInProgress}
          >
            {validationInProgress ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Validation en cours...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Valider et enregistrer les modifications
              </>
            )}
          </button>
        </div>
      )}

      {/* Styles CSS spécifiques pour cette page */}
      <style jsx="true">{`
        .comparison-table th, .comparison-table td {
          vertical-align: middle;
        }
        .field-name {
          font-weight: 600;
        }
        .existing-value, .form-value {
          font-family: monospace;
          white-space: pre-wrap;
        }
        .action-cell {
          width: 50px;
        }
        .final-value input {
          font-family: monospace;
        }
        .table-responsive {
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}

export default FormValidationInterface;
