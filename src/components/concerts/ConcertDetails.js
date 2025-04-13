import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import FormGenerator from '../forms/FormGenerator';

const ConcertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFormGenerator, setShowFormGenerator] = useState(false);

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
  }, [id, navigate]);

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

  const handleFormGenerated = (formId, formUrl) => {
    console.log('Formulaire généré:', formId, formUrl);
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
        <h2>Concert du {concert.date}</h2>
        <div>
          <Link to="/concerts" className="btn btn-outline-secondary me-2">
            Retour à la liste
          </Link>
          <Link to={`/concerts/edit/${id}`} className="btn btn-outline-primary me-2">
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
            <div className="col-md-9">{concert.date}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Montant:</div>
            <div className="col-md-9">{concert.montant} €</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Statut:</div>
            <div className="col-md-9">
              <span className={`badge ${
                concert.statut === 'confirmé' ? 'bg-success' :
                concert.statut === 'option' ? 'bg-warning' :
                'bg-danger'
              }`}>
                {concert.statut}
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
              <div className="col-md-9">{lieu.adresse}, {lieu.codePostal} {lieu.ville}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3 fw-bold">Capacité:</div>
              <div className="col-md-9">{lieu.capacite || 'Non spécifiée'}</div>
            </div>
          </div>
        </div>
      )}

      {programmateur ? (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Programmateur</h3>
            <Link to={`/programmateurs/${programmateur.id}`} className="btn btn-sm btn-outline-primary">
              Voir détails
            </Link>
          </div>
          <div className="card-body">
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
          </div>
        </div>
      ) : (
        <FormGenerator
          concertId={id}
          programmateurId={concert.programmateurId}
          onFormGenerated={handleFormGenerated}
        />
      )}

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
