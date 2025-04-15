import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const ProgrammateurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [programmateur, setProgrammateur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgrammateur = async () => {
      setLoading(true);
      try {
        const progDoc = await getDoc(doc(db, 'programmateurs', id));
        if (progDoc.exists()) {
          setProgrammateur({
            id: progDoc.id,
            ...progDoc.data()
          });
        } else {
          console.error('Programmateur non trouvé');
          navigate('/programmateurs');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du programmateur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateur();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
      try {
        await deleteDoc(doc(db, 'programmateurs', id));
        navigate('/programmateurs');
      } catch (error) {
        console.error('Erreur lors de la suppression du programmateur:', error);
        alert('Une erreur est survenue lors de la suppression du programmateur');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement...</div>;
  }

  if (!programmateur) {
    return <div className="alert alert-danger">Programmateur non trouvé</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{programmateur.nom}</h2>
        <div>
          <Link to="/programmateurs" className="btn btn-outline-secondary me-2">
            Retour à la liste
          </Link>
          <Link to={`/programmateurs/edit/${id}`} className="btn btn-outline-primary me-2">
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
            <div className="col-md-3 fw-bold">Structure:</div>
            <div className="col-md-9">{programmateur.structure || 'Non spécifiée'}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Email:</div>
            <div className="col-md-9">{programmateur.email || 'Non spécifié'}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Téléphone:</div>
            <div className="col-md-9">{programmateur.telephone || 'Non spécifié'}</div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3 fw-bold">Adresse:</div>
            <div className="col-md-9">{programmateur.adresse || 'Non spécifiée'}</div>
          </div>
        </div>
      </div>

      {programmateur.notes && (
        <div className="card">
          <div className="card-header">
            <h3>Notes</h3>
          </div>
          <div className="card-body">
            <p>{programmateur.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammateurDetails;
