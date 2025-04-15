import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, deleteDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import FormGenerator from '../forms/FormGenerator';

const ConcertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFormGenerator, setShowFormGenerator] = useState(false);
  const [formData, setFormData] = useState(null);
  const [generatedFormLink, setGeneratedFormLink] = useState(null);

  useEffect(() => {
    const fetchConcert = async () => {
      setLoading(true);
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        if (concertDoc.exists()) {
          const concertData = {
            id: concertDoc.id,
            ...concertDoc.data()
          };
          setConcert(concertData);
          
          // Récupérer les données du lieu
          if (concertData.lieuId) {
            const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
            if (lieuDoc.exists()) {
              setLieu({
                id: lieuDoc.id,
                ...lieuDoc.data()
              });
            }
          }
          
          // Récupérer les données du programmateur
          if (concertData.programmateurId) {
            const progDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
            if (progDoc.exists()) {
              setProgrammateur({
                id: progDoc.id,
                ...progDoc.data()
              });
            }
          }
          
          // Vérifier si un formulaire existe déjà pour ce concert
          if (concertData.formId) {
            try {
              const formDoc = await getDoc(doc(db, 'formulaires', concertData.formId));
              if (formDoc.exists()) {
                setFormData({
                  id: formDoc.id,
                  ...formDoc.data()
                });
              }
            } catch (error) {
              console.error('Erreur lors de la récupération du formulaire:', error);
            }
          } else {
            // Si pas de formId, chercher dans la collection formulaires
            const formsQuery = query(
              collection(db, 'formulaires'), 
              where('concertId', '==', id)
            );
            const formsSnapshot = await getDocs(formsQuery);
            
            if (!formsSnapshot.empty) {
              const formDoc = formsSnapshot.docs[0];
              setFormData({
                id: formDoc.id,
                ...formDoc.data()
              });
              
              // Mettre à jour le concert avec l'ID du formulaire
              await updateDoc(doc(db, 'concerts', id), {
                formId: formDoc.id
              });
            }
          }
        } else {
          console.error('Concert non trouvé');
          navigate('/concerts');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du concert:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcert();
    
    // Vérifier si on doit afficher le générateur de formulaire
    const queryParams = new URLSearchParams(location.search);
    const shouldOpenFormGenerator = queryParams.get('openFormGenerator') === 'true';
    
    if (shouldOpenFormGenerator) {
      setShowFormGenerator(true);
    }
  }, [id, navigate, location.search]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concert ?')) {
      try {
        await deleteDoc(doc(db, 'concerts', id));
        navigate('/concerts');
      } catch (error) {
        console.error('Erreur lors de la suppression du concert:', error);
        alert('Une erreur est survenue lors de la suppression du concert');
      }
    }
  };

  const handleFormGenerated = async (formId, formUrl) => {
    console.log('Formulaire généré:', formId, formUrl);
    
    // Stocker le lien généré
    setGeneratedFormLink(formUrl);
    
    // Mettre à jour le concert avec l'ID du formulaire
    try {
      await updateDoc(doc(db, 'concerts', id), {
        formId: formId
      });
      
      // Recharger les données du formulaire
      const formDoc = await getDoc(doc(db, 'formulaires', formId));
      if (formDoc.exists()) {
        setFormData({
          id: formDoc.id,
          ...formDoc.data()
        });
      }
      
      // NE PAS masquer le générateur de formulaire
      // setShowFormGenerator(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du concert:', error);
    }
  };

  // Fonction pour copier le lien dans le presse-papiers
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Lien copié dans le presse-papiers !');
      })
      .catch(err => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err);
      });
  };

  // Formater la date pour l'affichage
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date non spécifiée';
    
    // Si c'est un timestamp Firestore
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    // Si c'est une chaîne de date
    try {
      return new Date(dateValue).toLocaleDateString('fr-FR');
    } catch (e) {
      return dateValue;
    }
  };

  // Formater le montant
  const formatMontant = (montant) => {
    if (!montant) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  if (loading) {
    return <div className="text-center my-5">Chargement...</div>;
  }

  if (!concert) {
    return <div className="alert alert-danger">Concert non trouvé</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Concert du {formatDate(concert.date)}</h2>
        <div>
          <Link to="/concerts" className="btn btn-outline-secondary me-2">
            Retour à la liste
          </Link>
          <Link to={`/concerts/${id}/edit`} className="btn btn-outline-primary me-2">
            Modifier
          </Link>
          <button onClick={handleDelete} className="btn btn-outline-danger">
            Supprimer
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>Informations générales</h3>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Date:</div>
            <div className="col-md-9">{formatDate(concert.date)}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Montant:</div>
            <div className="col-md-9">{formatMontant(concert.montant)}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Statut:</div>
            <div className="col-md-9">
              <span className={`badge ${
                concert.statut === 'confirmé' ? 'bg-success' :
                concert.statut === 'option' ? 'bg-warning' :
                'bg-secondary'
              }`}>
                {concert.statut || 'Non défini'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {lieu && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Lieu</h3>
            <Link to={`/lieux/${lieu.id}`} className="btn btn-sm btn-outline-primary">
              Voir détails
            </Link>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Nom:</div>
              <div className="col-md-9">{lieu.nom}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Adresse:</div>
              <div className="col-md-9">
                {lieu.adresse}, {lieu.codePostal} {lieu.ville}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Capacité:</div>
              <div className="col-md-9">{lieu.capacite || 'Non spécifiée'}</div>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>Programmateur</h3>
          {programmateur && (
            <Link to={`/programmateurs/${programmateur.id}`} className="btn btn-sm btn-outline-primary">
              Voir détails
            </Link>
          )}
        </div>
        <div className="card-body">
          {programmateur ? (
            <>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Nom:</div>
                <div className="col-md-9">{programmateur.nom}</div>
              </div>
              {programmateur.structure && (
                <div className="row mb-3">
                  <div className="col-md-3 fw-bold">Structure:</div>
                  <div className="col-md-9">{programmateur.structure}</div>
                </div>
              )}
              {programmateur.email && (
                <div className="row mb-3">
                  <div className="col-md-3 fw-bold">Email:</div>
                  <div className="col-md-9">{programmateur.email}</div>
                </div>
              )}
              {programmateur.telephone && (
                <div className="row mb-3">
                  <div className="col-md-3 fw-bold">Téléphone:</div>
                  <div className="col-md-9">{programmateur.telephone}</div>
                </div>
              )}
              
              {/* Section pour le formulaire */}
              <div className="row mt-4">
                <div className="col-12">
                  {formData && !showFormGenerator ? (
                    <div className="alert alert-info">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <i className="bi bi-info-circle me-2"></i>
                          Un formulaire a été envoyé au programmateur 
                          {formData.dateCreation && (
                            <span> le {formatDate(formData.dateCreation)}</span>
                          )}
                        </div>
                        <div>
                          {formData.statut === 'valide' ? (
                            <span className="badge bg-success me-2">Validé</span>
                          ) : (
                            <Link to={`/concerts/${id}/form`} className="btn btn-sm btn-primary">
                              {formData.reponses ? 'Voir les réponses' : 'Voir le formulaire'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {(showFormGenerator || generatedFormLink) ? (
                    <div className="p-3 border rounded mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0">
                          {generatedFormLink ? 'Formulaire généré avec succès' : 'Envoyer un formulaire au programmateur'}
                        </h4>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setShowFormGenerator(false);
                            setGeneratedFormLink(null);
                          }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                      
                      {generatedFormLink ? (
                        <div>
                          <p>Voici le lien du formulaire à envoyer au programmateur :</p>
                          <div className="input-group mb-3">
                            <input
                              type="text"
                              className="form-control"
                              value={generatedFormLink}
                              readOnly
                            />
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={() => copyToClipboard(generatedFormLink)}
                            >
                              <i className="bi bi-clipboard me-1"></i> Copier
                            </button>
                          </div>
                          <p className="text-muted">
                            Ce lien est valable pendant 30 jours. Une fois que le programmateur aura rempli le formulaire, 
                            vous pourrez valider les informations depuis la fiche du concert.
                          </p>
                          <div className="d-flex justify-content-between mt-3">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                setShowFormGenerator(false);
                                setGeneratedFormLink(null);
                              }}
                            >
                              Fermer
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                setGeneratedFormLink(null);
                                setShowFormGenerator(true);
                              }}
                            >
                              Générer un nouveau lien
                            </button>
                          </div>
                        </div>
                      ) : (
                        <FormGenerator
                          concertId={id}
                          programmateurId={concert.programmateurId}
                          onFormGenerated={handleFormGenerated}
                        />
                      )}
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowFormGenerator(true)}
                    >
                      <i className="bi bi-envelope me-2"></i>
                      {formData ? 'Générer un nouveau formulaire' : 'Envoyer un formulaire au programmateur'}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Aucun programmateur n'est associé à ce concert.
            </div>
          )}
        </div>
      </div>

      {concert.notes && (
        <div className="card">
          <div className="card-header">
            <h3>Notes</h3>
          </div>
          <div className="card-body">
            <p>{concert.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcertDetails;
