import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { formatDate } from '../../utils/dateUtils';

const ConcertsList = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const querySnapshot = await db.collection('concerts').orderBy('date', 'desc').get();
        
        const concertsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setConcerts(concertsData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des concerts:', error);
        setError('Impossible de charger les concerts. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  if (concerts.length === 0) {
    return (
      <div className="text-center mt-4">
        <p>Aucun concert n'a été créé pour le moment.</p>
        <Link to="/concerts/nouveau" className="btn btn-primary">
          Créer votre premier concert
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Lieu</th>
              <th>Programmateur</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {concerts.map(concert => (
              <tr key={concert.id}>
                <td>{formatDate(concert.date)}</td>
                <td>{concert.lieuNom}</td>
                <td>{concert.programmateurNom}</td>
                <td>{concert.montant} €</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(concert.statut)}`}>
                    {concert.statut}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <Link to={`/concerts/${concert.id}`} className="btn btn-sm btn-outline-primary">
                      Détails
                    </Link>
                    <Link to={`/concerts/${concert.id}/edit`} className="btn btn-sm btn-outline-secondary">
                      Modifier
                    </Link>
                    <Link to={`/concerts/${concert.id}/form`} className="btn btn-sm btn-outline-info">
                      Formulaire
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Fonction utilitaire pour obtenir la classe de badge en fonction du statut
const getStatusBadgeClass = (statut) => {
  switch (statut) {
    case 'Confirmé':
      return 'bg-success';
    case 'En attente':
      return 'bg-warning text-dark';
    case 'Annulé':
      return 'bg-danger';
    case 'Terminé':
      return 'bg-secondary';
    default:
      return 'bg-light text-dark';
  }
};

export default ConcertsList;
