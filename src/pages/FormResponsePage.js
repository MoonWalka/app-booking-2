import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';

const FormResponsePage = () => {
  const { concertId, token } = useParams(); // Récupérer concertId et token
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [formLinkId, setFormLinkId] = useState(null);
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      setLoading(true);
      try {
        console.log("Validation du token:", token, "pour le concert:", concertId);
        
        // Vérifier si le token existe dans la collection formLinks
        const formsQuery = query(
          collection(db, 'formLinks'), // Utilisez formLinks au lieu de forms
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

    if (concertId && token) {
      validateToken();
    } else {
      setError("Lien de formulaire invalide. Il manque des paramètres nécessaires.");
      setLoading(false);
    }
  }, [concertId, token]);

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

  if (loading) {
    return (
      <div className="form-public-container">
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du formulaire...</span>
          </div>
          <p className="mt-3">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-public-container">
        <div className="alert alert-danger">
          <h3>Erreur</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="form-public-container">
        <div className="alert alert-warning">
          <h3>Lien expiré</h3>
          <p>Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="form-public-container">
        <div className="alert alert-success">
          <h3>Formulaire déjà complété</h3>
          <p>Vous avez déjà complété ce formulaire. Merci pour votre participation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-public-container">
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
            // Passer une fonction pour gérer la soumission réussie
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
    </div>
  );
};

export default FormResponsePage;
