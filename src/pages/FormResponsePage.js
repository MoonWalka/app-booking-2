import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';

const FormResponsePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      setLoading(true);
      try {
        // Vérifier si le token existe dans la collection forms
        const formsQuery = query(collection(db, 'forms'), where('token', '==', token));
        const formsSnapshot = await getDocs(formsQuery);
        
        if (formsSnapshot.empty) {
          setError('Formulaire non trouvé. Le lien est peut-être incorrect.');
          return;
        }
        
        const formDoc = formsSnapshot.docs[0];
        const formData = formDoc.data();
        setFormData(formData);
        
        // Vérifier si le formulaire est déjà complété
        if (formData.completed) {
          setCompleted(true);
          return;
        }
        
        // Vérifier si le token n'est pas expiré
        const now = new Date();
        const expiryDate = formData.expiryDate ? formData.expiryDate.toDate() : null;
        
        if (expiryDate && now > expiryDate) {
          setExpired(true);
          return;
        }
        
        // Récupérer les données du concert
        if (formData.concertId) {
          const concertDoc = await getDoc(doc(db, 'concerts', formData.concertId));
          if (concertDoc.exists()) {
            const concertData = concertDoc.data();
            setConcert(concertData);
            
            // Récupérer les données du lieu
            if (concertData.lieuId) {
              const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
              if (lieuDoc.exists()) {
                setLieu(lieuDoc.data());
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la validation du token:', error);
        setError('Une erreur est survenue lors du chargement du formulaire.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (loading) {
    return <div className="text-center my-5">Chargement du formulaire...</div>;
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          <h3>Erreur</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">
          <h3>Lien expiré</h3>
          <p>Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="container my-5">
        <div className="alert alert-success">
          <h3>Formulaire déjà complété</h3>
          <p>Vous avez déjà complété ce formulaire. Merci pour votre participation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1>Formulaire programmateur</h1>
      
      {concert && lieu && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Informations sur le concert</h3>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Date:</div>
              <div className="col-md-9">{concert.date}</div>
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
              <div className="col-md-9">{concert.montant} €</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3>Vos informations</h3>
        </div>
        <div className="card-body">
          <p>Veuillez remplir le formulaire ci-dessous avec vos informations de contact.</p>
          <ProgrammateurForm token={token} />
        </div>
      </div>
    </div>
  );
};

export default FormResponsePage;
