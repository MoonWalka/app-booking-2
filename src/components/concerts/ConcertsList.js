import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function ConcertsList() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const q = query(collection(db, 'concerts'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const concertsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date // Garder la date au format ISO pour le tri
        }));
        
        setConcerts(concertsData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des concerts:", err);
        setError("Impossible de charger les concerts. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Formater le statut pour l'affichage
  const getStatusLabel = (status) => {
    switch (status) {
      case 'option':
        return 'Option';
      case 'confirme':
        return 'Confirmé';
      case 'annule':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Obtenir la classe CSS pour le statut
  const getStatusClass = (status) => {
    switch (status) {
      case 'option':
        return 'status-option';
      case 'confirme':
        return 'status-confirmed';
      case 'annule':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Chargement des concerts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="concerts-list">
      <div className="list-header">
        <h2>Liste des concerts</h2>
        <Link to="/concerts/nouveau" className="btn-primary">
          <span>+</span> Nouveau concert
        </Link>
      </div>

      {concerts.length === 0 ? (
        <div className="empty-list">
          <p>Aucun concert n'a été créé pour le moment.</p>
          <Link to="/concerts/nouveau" className="btn-primary">
            Créer votre premier concert
          </Link>
        </div>
      ) : (
        <table className="data-table">
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
                <td>{concert.lieuNom || 'Non spécifié'}</td>
                <td>{concert.programmateurNom || 'Non spécifié'}</td>
                <td>{concert.montant} €</td>
                <td>
                  <span className={`status-badge ${getStatusClass(concert.statut)}`}>
                    {getStatusLabel(concert.statut)}
                  </span>
                </td>
                <td>
                  <Link to={`/concerts/${concert.id}`} className="btn-action">
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ConcertsList;
