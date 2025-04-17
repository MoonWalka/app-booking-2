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
  const [artiste, setArtiste] = useState(null);
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
          
          // Récupérer les données de l'artiste
          if (concertData.artisteId) {
            const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
            if (artisteDoc.exists()) {
              setArtiste({
                id: artisteDoc.id,
                ...artisteDoc.data()
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

  // Vérifier si la date est passée
  const isDatePassed = (dateValue) => {
    if (!dateValue) return false;
    
    const today = new Date();
    const concertDate = dateValue.seconds ? 
      new Date(dateValue.seconds * 1000) : 
      new Date(dateValue);
    
    return concertDate < today;
  };

  // Fonction pour obtenir les informations sur le statut et les actions requises
  const getStatusInfo = () => {
    const isPastDate = isDatePassed(concert.date);
    
    switch (concert.statut) {
      case 'contact':
        if (!formData) return { message: 'Formulaire à envoyer', actionNeeded: true, action: 'form' };
        return { message: 'Contact établi', actionNeeded: false };
        
      case 'preaccord':
        return { message: 'Contrat à préparer', actionNeeded: true, action: 'contract' };
        
      case 'contrat':
        return { message: 'Facture acompte à envoyer', actionNeeded: true, action: 'invoice' };
        
      case 'acompte':
        return { message: 'En attente du concert', actionNeeded: false };
        
      case 'solde':
        if (isPastDate) return { message: 'Concert terminé', actionNeeded: false };
        return { message: 'Facture solde envoyée', actionNeeded: false };
        
      default:
        return { message: 'Statut non défini', actionNeeded: false };
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement...</div>;
  }

  if (!concert) {
    return <div className="alert alert-danger">Concert non trouvé</div>;
  }

  const statusInfo = getStatusInfo();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{concert.titre || `Concert du ${formatDate(concert.date)}`}</h2>
          <div className="breadcrumb-container mb-2">
            <span className="breadcrumb-item" onClick={() => navigate('/concerts')}>Concerts</span>
            <i className="bi bi-chevron-right"></i>
            <span className="breadcrumb-item active">{concert.titre || formatDate(concert.date)}</span>
          </div>
        </div>
        <div>
          <Link to="/concerts" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-1"></i>
            Retour
          </Link>
          <Link to={`/concerts/${id}/edit`} className="btn btn-outline-primary me-2">
            <i className="bi bi-pencil me-1"></i>
            Modifier
          </Link>
          <button onClick={handleDelete} className="btn btn-outline-danger">
            <i className="bi bi-trash me-1"></i>
            Supprimer
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>Informations générales</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <div className="fw-bold">Titre:</div>
                <div>{concert.titre || "Sans titre"}</div>
              </div>
              <div className="mb-3">
                <div className="fw-bold">Date:</div>
                <div className={isDatePassed(concert.date) ? "text-muted" : ""}>
                  {formatDate(concert.date)}
                  {isDatePassed(concert.date) && <span className="badge bg-secondary ms-2">Passé</span>}
                </div>
              </div>
              <div className="mb-3">
                <div className="fw-bold">Montant:</div>
                <div>{formatMontant(concert.montant)}</div>
              </div>
              {concert.notes && (
                <div className="mb-3">
                  <div className="fw-bold">Notes:</div>
                  <div className="mt-2 p-2 bg-light rounded">
                    {concert.notes}
                  </div>
                </div>
              )}
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <div className="fw-bold">Artiste:</div>
                <div>
                  {artiste ? (
                    <Link to={`/artistes/${artiste.id}`} className="artiste-link">
                      <i className="bi bi-music-note me-1"></i>
                      {artiste.nom}
                    </Link>
                  ) : (
                    concert.artisteNom ? concert.artisteNom : <span className="text-muted">Non spécifié</span>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <div className="fw-bold">Statut:</div>
                <div className="status-display d-flex align-items-center">
                  <span className={`badge ${
                    concert.statut === 'contrat' ? 'bg-success' :
                    concert.statut === 'preaccord' ? 'bg-primary' :
                    concert.statut === 'acompte' ? 'bg-warning' :
                    concert.statut === 'solde' ? 'bg-info' :
                    concert.statut === 'annule' ? 'bg-danger' :
                    'bg-secondary'
                  } me-2`}>
                    {concert.statut || 'Non défini'}
                  </span>
                  {statusInfo.actionNeeded && (
                    <div className="action-needed ms-2">
                      <i className="bi bi-exclamation-circle text-warning me-1"></i>
                      {statusInfo.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <div className="fw-bold">Formulaire:</div>
                <div>
                  {formData ? (
                    <span className="badge bg-success me-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Envoyé
                    </span>
                  ) : (
                    <span className="badge bg-warning me-2">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Non envoyé
                    </span>
                  )}
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lieu && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Lieu</h3>
            <Link to={`/lieux/${lieu.id}`} className="btn btn-sm btn-outline-primary">
              <i className="bi bi-geo-alt me-1"></i>
              Voir détails
            </Link>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{lieu.nom}</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold">Adresse:</div>
                  <div>{lieu.adresse}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Ville:</div>
                  <div>{lieu.codePostal} {lieu.ville}</div>
                </div>
                {lieu.capacite && (
                  <div className="mb-3">
                    <div className="fw-bold">Capacité:</div>
                    <div>{lieu.capacite} personnes</div>
                  </div>
                )}
              </div>
            </div>
           {/* Intégration de la carte Google Maps */}
           <div className="mt-2">
              <div className="map-container mb-3">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}&z=6&output=embed`}
                  width="100%" 
                  height="250" 
                  style={{border: '1px solid #ddd', borderRadius: '4px'}}
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <a 
                href={`https://maps.google.com/maps?q=${encodeURIComponent(`${lieu.adresse}, ${lieu.codePostal} ${lieu.ville}`)}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="btn btn-sm btn-outline-info"
              >
                <i className="bi bi-map me-1"></i>
                Voir en plein écran
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>Programmateur</h3>
          {programmateur && (
            <Link to={`/programmateurs/${programmateur.id}`} className="btn btn-sm btn-outline-primary">
              <i className="bi bi-person me-1"></i>
              Voir détails
            </Link>
          )}
        </div>
        <div className="card-body">
          {programmateur ? (
            <>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <div className="fw-bold">Nom:</div>
                    <div>{programmateur.nom}</div>
                  </div>
                  {programmateur.structure && (
                    <div className="mb-3">
                      <div className="fw-bold">Structure:</div>
                      <div>{programmateur.structure}</div>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  {programmateur.email && (
                    <div className="mb-3">
                      <div className="fw-bold">Email:</div>
                      <div>
                        <a href={`mailto:${programmateur.email}`} className="contact-link">
                          <i className="bi bi-envelope me-1"></i>
                          {programmateur.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {programmateur.telephone && (
                    <div className="mb-3">
                      <div className="fw-bold">Téléphone:</div>
                      <div>
                        <a href={`tel:${programmateur.telephone}`} className="contact-link">
                          <i className="bi bi-telephone me-1"></i>
                          {programmateur.telephone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
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
                          <div className="form-sharing-options mt-3 mb-3">
                            <div className="d-flex gap-2">
                              <a 
                                href={`mailto:${programmateur?.email || ''}?subject=Formulaire pour le concert du ${formatDate(concert.date)}&body=Bonjour,%0D%0A%0D%0AVeuillez remplir le formulaire pour le concert prévu le ${formatDate(concert.date)} en cliquant sur ce lien : ${generatedFormLink}%0D%0A%0D%0AMerci.`} 
                                className="btn btn-outline-secondary"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <i className="bi bi-envelope"></i> Envoyer par email
                              </a>
                              <a 
                                href={`https://wa.me/?text=Formulaire pour le concert du ${formatDate(concert.date)} : ${generatedFormLink}`} 
                                className="btn btn-outline-success"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <i className="bi bi-whatsapp"></i> WhatsApp
                              </a>
                            </div>
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
                    !formData && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowFormGenerator(true)}
                      >
                        <i className="bi bi-envelope me-2"></i>
                        Envoyer un formulaire au programmateur
                      </button>
                    )
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

      {artiste && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Artiste</h3>
            <Link to={`/artistes/${artiste.id}`} className="btn btn-sm btn-outline-primary">
              <i className="bi bi-music-note me-1"></i>
              Voir détails
            </Link>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="fw-bold">Nom:</div>
                  <div>{artiste.nom}</div>
                </div>
                {artiste.genre && (
                  <div className="mb-3">
                    <div className="fw-bold">Genre:</div>
                    <div>{artiste.genre}</div>
                  </div>
                )}
                {artiste.description && (
                  <div className="mb-3">
                    <div className="fw-bold">Description:</div>
                    <div className="mt-2 p-2 bg-light rounded">
                      {artiste.description}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                {artiste.contacts && (
                  <>
                    {artiste.contacts.email && (
                      <div className="mb-3">
                        <div className="fw-bold">Email:</div>
                        <div>
                          <a href={`mailto:${artiste.contacts.email}`} className="contact-link">
                            <i className="bi bi-envelope me-1"></i>
                            {artiste.contacts.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {artiste.contacts.telephone && (
                      <div className="mb-3">
                        <div className="fw-bold">Téléphone:</div>
                        <div>
                          <a href={`tel:${artiste.contacts.telephone}`} className="contact-link">
                            <i className="bi bi-telephone me-1"></i>
                            {artiste.contacts.telephone}
                          </a>
                        </div>
                      </div>
                    )}
                    {(artiste.contacts.instagram || artiste.contacts.facebook || artiste.contacts.siteWeb) && (
                      <div className="mb-3">
                        <div className="fw-bold">Réseaux sociaux:</div>
                        <div className="mt-2 d-flex gap-2">
                          {artiste.contacts.siteWeb && (
                            <a href={artiste.contacts.siteWeb} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-globe me-1"></i>
                              Site web
                            </a>
                          )}
                          {artiste.contacts.instagram && (
                            <a href={`https://instagram.com/${artiste.contacts.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger">
                              <i className="bi bi-instagram me-1"></i>
                              Instagram
                            </a>
                          )}
                          {artiste.contacts.facebook && (
                            <a href={artiste.contacts.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-facebook me-1"></i>
                              Facebook
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {concert.notes && (
        <div className="card">
          <div className="card-header">
            <h3>Notes</h3>
          </div>
          <div className="card-body">
            <p className="notes-content">{concert.notes}</p>
          </div>
        </div>
      )}

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        .action-needed {
          color: #856404;
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 0.85rem;
        }
        
        .contact-link {
          color: #007bff;
          text-decoration: none;
        }
        
        .contact-link:hover {
          text-decoration: underline;
        }
        
        .artiste-link {
          color: #6610f2;
          text-decoration: none;
          font-weight: 500;
        }
        
        .artiste-link:hover {
          text-decoration: underline;
        }
        
        .notes-content {
          white-space: pre-line;
        }
        
        .breadcrumb-container {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        .breadcrumb-item {
          cursor: pointer;
        }
        
        .breadcrumb-item:hover {
          color: #007bff;
          text-decoration: underline;
        }
        
        .breadcrumb-item.active {
          color: #343a40;
          font-weight: 500;
        }
        
        .breadcrumb-container i {
          margin: 0 0.5rem;
          font-size: 0.75rem;
        }
        
        .form-sharing-options .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ConcertDetails;
