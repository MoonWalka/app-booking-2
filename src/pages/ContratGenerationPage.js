import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { db } from '@/services/firebase-service';
import { doc, getDoc } from '@/services/firebase-service';
import ContratGenerator from '@/components/contrats/desktop/ContratGenerator';
import '@styles/index.css';

const ContratGenerationPage = () => {
  const { dateId } = useParams();
  const navigate = useNavigate();
  const [concert, setDate] = useState(null);
  const [contact, setContact] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les données du concert
        const dateDoc = await getDoc(doc(db, 'concerts', dateId));
        if (!dateDoc.exists()) {
          setError('Date non trouvé');
          setLoading(false);
          return;
        }
        
        const dateData = { id: dateId, ...dateDoc.data() };
        setDate(dateData);

        // Récupérer les données du contact si disponible
        if (dateData.contactId) {
          const contactDoc = await getDoc(doc(db, 'contacts', dateData.contactId));
          if (contactDoc.exists()) {
            setContact({ id: contactDoc.id, ...contactDoc.data() });
          }
        }

        // Récupérer les données de l'artiste si disponible
        if (dateData.artisteId) {
          const artisteDoc = await getDoc(doc(db, 'artistes', dateData.artisteId));
          if (artisteDoc.exists()) {
            setArtiste({ id: artisteDoc.id, ...artisteDoc.data() });
          }
        } else if (dateData.artisteNom) {
          // Si pas d'artisteId, créer un objet artiste avec les données du concert
          setArtiste({
            nom: dateData.artisteNom,
            genre: dateData.artisteGenre || '',
            contact: ''
          });
        }

        // Récupérer les données du lieu si disponible
        if (dateData.lieuId) {
          const lieuDoc = await getDoc(doc(db, 'lieux', dateData.lieuId));
          if (lieuDoc.exists()) {
            setLieu({ id: lieuDoc.id, ...lieuDoc.data() });
          }
        } else if (dateData.lieuNom) {
          // Si pas de lieuId, créer un objet lieu avec les données du concert
          setLieu({
            nom: dateData.lieuNom,
            adresse: dateData.lieuAdresse || '',
            ville: dateData.lieuVille || '',
            codePostal: dateData.lieuCodePostal || '',
            capacite: ''
          });
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        // S'assurer que l'erreur est une chaîne
        const errorMessage = error?.message || error?.toString() || 'Erreur lors de la récupération des données';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateId]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">{error}</Alert>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/concerts')}
        >
          Retour aux concerts
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">Génération de contrat</h1>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/dates/${dateId}`)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Retour au concert
            </button>
          </div>
          
          <ContratGenerator 
            concert={concert}
            contact={contact}
            programmateur={contact} // Rétrocompatibilité
            artiste={artiste}
            lieu={lieu}
          />
        </div>
      </div>
    </div>
  );
};

export default ContratGenerationPage;