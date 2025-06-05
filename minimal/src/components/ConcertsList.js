import React from 'react';
import { useNavigate } from 'react-router-dom';

function ConcertsList() {
  const navigate = useNavigate();

  // Données mockées pour l'exemple
  const concerts = [
    {
      id: '1',
      titre: 'Concert de Noël 2024',
      date: '2024-12-25',
      lieu: 'Salle Pleyel',
      artiste: 'Mozart Ensemble',
      statut: 'confirme'
    },
    {
      id: '2',
      titre: 'Jazz Festival',
      date: '2024-11-15',
      lieu: 'Le Duc des Lombards',
      artiste: 'Miles Davis Tribute',
      statut: 'contact'
    },
    {
      id: '3',
      titre: 'Soirée Classique',
      date: '2024-10-30',
      lieu: 'Opéra Bastille',
      artiste: 'Orchestre de Paris',
      statut: 'contrat'
    }
  ];

  const getStatusDisplay = (statut) => {
    const statusMap = {
      'contact': { label: 'Contact établi', color: '#6c757d' },
      'preaccord': { label: 'Pré-accord', color: '#ffc107' },
      'contrat': { label: 'Contrat signé', color: '#fd7e14' },
      'confirme': { label: 'Confirmé', color: '#28a745' },
      'annule': { label: 'Annulé', color: '#dc3545' },
      'reporte': { label: 'Reporté', color: '#6f42c1' }
    };
    return statusMap[statut] || statusMap.contact;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="concerts-list">
      <div className="list-header">
        <div>
          <h2>Liste des concerts</h2>
          <p className="list-subtitle">{concerts.length} concert(s)</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/concerts/nouveau')}
        >
          <i className="icon-plus"></i>Nouveau concert
        </button>
      </div>

      <div className="concerts-table">
        <div className="table-header">
          <div className="header-cell">Titre</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Lieu</div>
          <div className="header-cell">Artiste</div>
          <div className="header-cell">Statut</div>
        </div>
        
        <div className="table-body">
          {concerts.map(concert => (
            <div 
              key={concert.id}
              className="table-row"
              onClick={() => navigate(`/concerts/${concert.id}`)}
            >
              <div className="table-cell">
                <span className="concert-title">{concert.titre}</span>
              </div>
              <div className="table-cell">
                {formatDate(concert.date)}
              </div>
              <div className="table-cell">
                {concert.lieu}
              </div>
              <div className="table-cell">
                {concert.artiste}
              </div>
              <div className="table-cell">
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: getStatusDisplay(concert.statut).color,
                    color: 'white'
                  }}
                >
                  {getStatusDisplay(concert.statut).label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConcertsList;