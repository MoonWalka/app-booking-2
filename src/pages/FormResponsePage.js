import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';

const PublicFormLayout = ({ children }) => {
  return (
    <div className="form-isolated-container">
      <header className="form-header">
        <div className="form-logo">
          <h2>Label Musical</h2>
        </div>
      </header>
      
      <main className="form-content">
        {children}
      </main>
      
      <footer className="form-footer">
        <p>© {new Date().getFullYear()} Label Musical - Formulaire sécurisé</p>
      </footer>
    </div>
  );
};

const FormResponsePage = () => {
  const { concertId, token, id } = useParams(); // Récupérer concertId, token ou id
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [formLinkId, setFormLinkId] = useState(null);
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Déterminer si nous sommes en mode public ou en mode admin
  const isPublicForm = !!concertId && !!token;
  const isAdminValidation = !!id;

  useEffect(() => {
    // En mode validation admin (route /formulaire/validation/:id)
    if (isAdminValidation) {
      const fetchFormSubmission = async () => {
        try {
          setLoading(true);
          // Logique pour récupérer et afficher les données soumises à valider
          // Cette partie dépend de votre implémentation spécifique
          
          // Exemple simplifié :
          const submissionDoc = await getDoc(doc(db, 'formSubmissions', id));
          if (submissionDoc.exists()) {
            const submissionData = submissionDoc.data();
            setFormData(submissionData);
            
            // Récupérer le concert associé
            if (submissionData.concertId) {
              const concertDoc = await getDoc(doc(db, 'concerts', submissionData.concertId));
              if (concertDoc.exists()) {
                setConcert(concertDoc.data());
                
                // Récupérer le lieu si nécessaire
                if (concertDoc.data().lieuId) {
                  const lieuDoc = await getDoc(doc(db, 'lieux', concertDoc.data().lieuId));
                  if (lieuDoc.exists()) {
                    setLieu(lieuDoc.data());
                  }
                }
              }
            }
          } else {
            setError("La soumission demandée n'existe pas.");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de la soumission:", error);
          setError("Impossible de charger les données de la soumission.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchFormSubmission();
      return;
    }
    
    // En mode formulaire public (route /formulaire/:concertId/:token)
    if (isPublicForm) {
      const validateToken = async () => {
        setLoading(true);
        try {
          console.log("Validation du token:", token, "pour le concert:", concertId);
          
          // Vérifier si le token existe dans la collection formLinks
          const formsQuery = query(
            collection(db, 'formLinks'),
            where('token', '==', token),
            where('concertId', '==', concertId)
          );
          
          const formsSnapshot = await getDocs(formsQuery);
          
          if (formsSnapshot.empty) {
            console.error("Token non trouvé dans formLinks");
            setError('Formulaire non trouvé. Le lien est peut-être incorrect.');
            setLoading(false);
            return;
          }
          
          const formDoc = formsSnapshot.docs[0];
          const formLinkData = formDoc.data();
          setFormData(formLinkData);
          setFormLinkId(formDoc.id);
          
          console.log("Données du lien trouvées:", formLinkData);
          
          // Vérifier si le formulaire est déjà complété
          if (formLinkData.completed) {
            console.log("Formulaire déjà complété");
            setCompleted(true);
            setLoading(false);
            return;
          }
          
          // Vérifier si le token n'est pas expiré
          const now = new Date();
          const expiryDate = formLinkData.expiryDate ? formLinkData.expiryDate.toDate() : null;
          
          if (expiryDate && now > expiryDate) {
            console.log("Lien expiré:", expiryDate);
            setExpired(true);
            setLoading(false);
            return;
          }
          

          console.log("Récupération des données du concert:", concertId);
          
          // Récupérer les données du concert
          const concertDoc = await getDoc(doc(db, 'concerts', concertId));
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            setConcert(concertData);
            
            console.log("Concert trouvé:", concertData);
            
            // Récupérer les données du lieu
            if (concertData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                const lieuData = lieuDoc.data();
                setLieu(lieuData);
                console.log("Lieu trouvé:", lieuData);
              } else {
                console.log("Lieu non trouvé:", concertData.lieuId);
              }
            }
          } else {
            console.error("Concert non trouvé:", concertId);
            setError("Le concert associé à ce formulaire n'existe pas ou a été supprimé.");
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erreur lors de la validation du token:', error);
          setError(`Une erreur est survenue lors du chargement du formulaire: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      validateToken();
    } else {
      setError("Lien de formulaire invalide. Il manque des paramètres nécessaires.");
      setLoading(false);
    }
  }, [concertId, token, id, isPublicForm, isAdminValidation]);

  // Fonction pour formater la date
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

  // Fonction pour formater le montant
  const formatMontant = (montant) => {
    if (!montant) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  // Contenu pour le formulaire public
  const renderPublicForm = () => {
    if (loading) {
      return (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du formulaire...</span>
          </div>
          <p className="mt-3">Chargement du formulaire...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <h3>Erreur</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (expired) {
      return (
        <div className="alert alert-warning">
          <h3>Lien expiré</h3>
          <p>Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.</p>
        </div>
      );
    }

    if (completed) {
      return (
        <div className="alert alert-success">
          <h3>Formulaire déjà complété</h3>
          <p>Vous avez déjà complété ce formulaire. Merci pour votre participation.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => setCompleted(false)} // Permet de revenir au formulaire
          >
            <i className="bi bi-pencil-square me-2"></i>
            Modifier vos informations
          </button>
        </div>
      );
    }
    

    return (
      <>
        <div className="form-header">
          <h1>Formulaire programmateur</h1>
        </div>
        
        {concert && lieu && (
          <div className="concert-info card mb-4">
            <div className="card-header">
              <h3>Informations sur le concert</h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Date:</div>
                <div className="col-md-9">{formatDate(concert.date)}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Lieu:</div>
                <div className="col-md-9">{lieu.nom}, {lieu.ville}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Adresse:</div>
                <div className="col-md-9">{lieu.adresse}, {lieu.codePostal} {lieu.ville}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Montant:</div>
                <div className="col-md-9">{formatMontant(concert.montant)}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="form-content card">
          <div className="card-header">
            <h3>Vos informations</h3>
          </div>
          <div className="card-body">
            <p>Veuillez remplir le formulaire ci-dessous avec vos informations de contact.</p>
            <ProgrammateurForm 
              token={token} 
              concertId={concertId} 
              formLinkId={formLinkId} 
              onSubmitSuccess={() => setCompleted(true)}
            />
          </div>
        </div>
        
        <div className="form-footer mt-4">
          <p className="text-muted text-center">
            Les informations recueillies sur ce formulaire sont enregistrées dans un fichier informatisé 
            à des fins de gestion des concerts. Conformément à la loi « informatique et libertés », 
            vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier.
          </p>
        </div>
      </>
    );
  };

  // Contenu pour l'interface admin de validation
  const renderAdminValidation = () => {
    if (loading) {
      return <div className="text-center my-5">Chargement des données...</div>;
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <h3>Erreur</h3>
          <p>{error}</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/concerts')}>
            Retour à la liste des concerts
          </button>
        </div>
      );
    }

    return (
      <>
        <h2>Validation des informations soumises</h2>
        
        {/* Interface d'administration pour la validation des données */}
        {/* Cette partie dépend de votre implémentation spécifique */}
        
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">Validation du formulaire</h3>
          </div>
          <div className="card-body">
            <p>Cette interface vous permet de valider les informations soumises par le programmateur.</p>
            
            {/* Affichez ici les données à valider selon votre implémentation */}
            {/* ... */}
            
            <div className="mt-4">
              <button className="btn btn-secondary me-2" onClick={() => navigate('/concerts')}>
                Retour
              </button>
              <button className="btn btn-primary">
                Valider les informations
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Rendu final basé sur le mode (public ou admin)
  if (isPublicForm) {
    return <PublicFormLayout>{renderPublicForm()}</PublicFormLayout>;
  }
  
  // En mode admin (dans le layout principal)
  return renderAdminValidation();
};

export default FormResponsePage;