import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const LieuDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lieu, setLieu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLieu = async () => {
      setLoading(true);
      try {
        const lieuDoc = await getDoc(doc(db, 'lieux', id));
        if (lieuDoc.exists()) {
          setLieu({
            id: lieuDoc.id,
            ...lieuDoc.data()
          });
        } else {
          console.error('Lieu non trouvé');
          navigate('/lieux');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du lieu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLieu();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        navigate('/lieux');
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement...</div>;
  }

  if (!lieu) {
    return <div className="alert alert-danger">Lieu non trouvé</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{lieu.nom}</h2>
        <div>
          <Link to="/lieux" className="btn btn-outline-secondary me-2">
            Retour à la liste
          </Link>
          <Link to={`/lieux/edit/${id}`} className="btn btn-outline-primary me-2">
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
            <div className="col-md-3 fw-bold">Adresse:</div>
            <div className="col-md-9">{lieu.adresse}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Code postal:</div>
            <div className="col-md-9">{lieu.codePostal}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Ville:</div>
            <div className="col-md-9">{lieu.ville}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Pays:</div>
            <div className="col-md-9">{lieu.pays}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Capacité:</div>
            <div className="col-md-9">{lieu.capacite || 'Non spécifiée'}</div>
          </div>
        </div>
      </div>

      {lieu.contact && (lieu.contact.nom || lieu.contact.telephone || lieu.contact.email) && (
        <div className="card">
          <div className="card-header">
            <h3>Contact</h3>
          </div>
          <div className="card-body">
            {lieu.contact.nom && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Personne à contacter:</div>
                <div className="col-md-9">{lieu.contact.nom}</div>
              </div>
            )}
            {lieu.contact.telephone && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Téléphone:</div>
                <div className="col-md-9">{lieu.contact.telephone}</div>
              </div>
            )}
            {lieu.contact.email && (
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Email:</div>
                <div className="col-md-9">{lieu.contact.email}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LieuDetails;
