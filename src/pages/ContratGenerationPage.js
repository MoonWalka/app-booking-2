import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { db } from '@/services/firebase-service';
import { doc, getDoc } from '@/services/firebase-service';
import ContratGenerator from '@/components/contrats/desktop/ContratGenerator';
import '@styles/index.css';

const ContratGenerationPage = () => {
  const { concertId } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les données du concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (!concertDoc.exists()) {
          setError('Concert non trouvé');
          setLoading(false);
          return;
        }
        
        const concertData = { id: concertId, ...concertDoc.data() };
        setConcert(concertData);

        // Récupérer les données du programmateur si disponible
        if (concertData.programmateurId) {
          const programmateurDoc = await getDoc(doc(db, 'programmateurs', concertData.programmateurId));
          if (programmateurDoc.exists()) {
            setProgrammateur({ id: programmateurDoc.id, ...programmateurDoc.data() });
          }
        }

        // Récupérer les données de l'artiste si disponible
        if (concertData.artisteId) {
          const artisteDoc = await getDoc(doc(db, 'artistes', concertData.artisteId));
          if (artisteDoc.exists()) {
            setArtiste({ id: artisteDoc.id, ...artisteDoc.data() });
          }
        } else if (concertData.artisteNom) {
          // Si pas d'artisteId, créer un objet artiste avec les données du concert
          setArtiste({
            nom: concertData.artisteNom,
            genre: concertData.artisteGenre || '',
            contact: ''
          });
        }

        // Récupérer les données du lieu si disponible
        if (concertData.lieuId) {
          const lieuDoc = await getDoc(doc(db, 'lieux', concertData.lieuId));
          if (lieuDoc.exists()) {
            setLieu({ id: lieuDoc.id, ...lieuDoc.data() });
          }
        } else if (concertData.lieuNom) {
          // Si pas de lieuId, créer un objet lieu avec les données du concert
          setLieu({
            nom: concertData.lieuNom,
            adresse: concertData.lieuAdresse || '',
            ville: concertData.lieuVille || '',
            codePostal: concertData.lieuCodePostal || '',
            capacite: ''
          });
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [concertId]);

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
              onClick={() => navigate(`/concerts/${concertId}`)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Retour au concert
            </button>
          </div>
          
          <ContratGenerator 
            concert={concert}
            programmateur={programmateur}
            artiste={artiste}
            lieu={lieu}
          />
        </div>
      </div>
    </div>
  );
};

export default ContratGenerationPage;