import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import PublicContactForm from '@/components/forms/PublicContactForm';
import Card from '@/components/ui/Card';
import styles from './FormResponsePage.module.css';

// Composant pour le layout public du formulaire selon la maquette
const PublicFormLayout = ({ children }) => {
  return (
    <div className={styles.formIsolatedContainer}>
      <header className={styles.formHeader}>
        <div className={styles.formLogo}>
          <h2>TourCraft</h2>
        </div>
      </header>
      
      <main className={styles.formContent}>
        {children}
      </main>
      
      <footer className={styles.formFooter}>
        <p>© {new Date().getFullYear()} TourCraft - Formulaire sécurisé</p>
      </footer>
    </div>
  );
};

const FormResponsePage = () => {
  const { dateId, token, id } = useParams(); // Récupérer dateId, token ou id
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formLinkId, setFormLinkId] = useState(null);
  const [contactEmail, setContactEmail] = useState('');
  const [concert, setDate] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Déterminer si nous sommes en mode public ou en mode admin
  const isPublicForm = !!dateId && !!token;
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
            
            // Récupérer le date associé
            if (submissionData.dateId) {
              const dateDoc = await getDoc(doc(db, 'dates', submissionData.dateId));
              if (dateDoc.exists()) {
                setDate(dateDoc.data());
                
                // Récupérer le lieu si nécessaire
                if (dateDoc.data().lieuId) {
                  const lieuDoc = await getDoc(doc(db, 'lieux', dateDoc.data().lieuId));
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
    
    // En mode formulaire public (route /formulaire/:dateId/:token)
    if (isPublicForm) {
      const validateToken = async () => {
        setLoading(true);
        try {
          console.log("Validation du token:", token, "pour le concert:", dateId);
          
          // Vérifier si le token existe dans la collection formLinks
          const formsQuery = query(
            collection(db, 'formLinks'),
            where('token', '==', token),
            where('dateId', '==', dateId)
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
          setFormLinkId(formDoc.id);
          
          // Récupérer l'email du contact depuis formLinkData
          if (formLinkData.contactEmail || formLinkData.programmateurEmail) {
            setContactEmail(formLinkData.contactEmail || formLinkData.programmateurEmail);
          }
          
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
          
          console.log("Token validé avec succès, chargement du concert:", dateId);
          
          // Récupérer les données du concert
          const dateDoc = await getDoc(doc(db, 'dates', dateId));
          if (dateDoc.exists()) {
            const dateData = dateDoc.data();
            setDate(dateData);
            
            console.log("Date trouvé:", dateData);
            
            // Récupérer les données du lieu
            if (dateData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', dateData.lieuId));
              if (lieuDoc.exists()) {
                const lieuData = lieuDoc.data();
                setLieu(lieuData);
                console.log("Lieu trouvé:", lieuData);
              } else {
                console.log("Lieu non trouvé:", dateData.lieuId);
              }
            }
          } else {
            console.error("Date non trouvé:", dateId);
            setError("Le date associé à ce formulaire n'existe pas ou a été supprimé.");
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
  }, [dateId, token, id, isPublicForm, isAdminValidation]);

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

  // Contenu pour le formulaire public selon la maquette
  const renderPublicForm = () => {
    if (loading) {
      return (
        <div className={styles.loadingState}>
          <div className="spinner"></div>
          <p>Chargement du formulaire...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`${styles.alertPanel} ${styles.alertDanger}`}>
          <h3>Erreur</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (expired) {
      return (
        <div className={`${styles.alertPanel} ${styles.alertWarning}`}>
          <h3>Lien expiré</h3>
          <p>Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.</p>
        </div>
      );
    }

    if (completed) {
      return (
        <div className={`${styles.alertPanel} ${styles.alertSuccess}`}>
          <h3>Formulaire déjà complété</h3>
          <p>Vous avez déjà complété ce formulaire. Merci pour votre participation.</p>
          <button 
            className={styles.btnPrimary}
            onClick={() => setCompleted(false)}
          >
            <i className="bi bi-pencil-square"></i>
            Modifier vos informations
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Titre principal selon la maquette */}
        <h1 className={styles.pageTitle}>Formulaire Contact</h1>

        {/* Informations du date selon la maquette */}
        {concert && (
          <Card 
            title="Informations sur le concert"
            icon={<i className="bi bi-calendar-event"></i>}
          >
              <div className={styles.concertInfoGrid}>
                <div className={styles.concertInfoItem}>
                  <div className={styles.concertInfoLabel}>Date</div>
                  <div className={styles.concertInfoValue}>{formatDate(concert.date)}</div>
                </div>
                <div className={styles.concertInfoItem}>
                  <div className={styles.concertInfoLabel}>Lieu</div>
                  <div className={styles.concertInfoValue}>{lieu?.nom || 'Non spécifié'}</div>
                </div>
                <div className={styles.concertInfoItem}>
                  <div className={styles.concertInfoLabel}>Montant</div>
                  <div className={styles.concertInfoValue}>{formatMontant(concert.montant)}</div>
                </div>
              </div>
          </Card>
        )}

        {/* Formulaire de contact selon la maquette */}
        <Card 
          title="Vos informations de contact"
          icon={<i className="bi bi-person-lines-fill"></i>}
        >
            <p className={styles.formSubtitle}>
              Veuillez remplir le formulaire ci-dessous avec vos informations de contact.
            </p>
            
            <PublicContactForm 
              token={token} 
              dateId={dateId} 
              formLinkId={formLinkId} 
              contactEmail={contactEmail}
              lieu={lieu}
              onSubmitSuccess={() => setCompleted(true)}
            />
        </Card>

        {/* Notice légale selon la maquette */}
        <div className={styles.legalNotice}>
          <p>
            <i className="bi bi-info-circle"></i>
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
            <p>Cette interface vous permet de valider les informations soumises par le contact.</p>
            
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
