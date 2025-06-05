import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ConcertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Données mockées pour l'exemple
  const concert = {
    id,
    titre: "Concert de Noël 2024",
    dateCreation: "15 nov. 2024",
    date: "25 décembre 2024",
    heure: "20h30",
    prix: "45€",
    statut: "Confirmé",
    artiste: {
      nom: "Mozart Ensemble",
      id: "123"
    },
    organisateur: {
      nom: "Jean Dupont",
      id: "456"
    },
    structure: {
      nom: "Philharmonie Paris",
      id: "789"
    },
    lieu: {
      nom: "Salle Pleyel",
      adresse: "252 Rue du Faubourg Saint-Honoré, 75008 Paris",
      ville: "Paris 8ème",
      id: "101"
    },
    notes: "Concert de Noël traditionnel avec programme de musique classique. Prévoir décoration thématique et accueil chaleureux pour les familles."
  };

  return (
    <div className="concert-details">
      {/* Header */}
      <div className="concert-header">
        <div className="header-content">
          <div className="header-info">
            <h1>{concert.titre}</h1>
            <p className="creation-date">Créé le {concert.dateCreation}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary">
              <i className="icon-edit"></i>Modifier
            </button>
            <button className="btn btn-secondary">
              <i className="icon-copy"></i>Dupliquer
            </button>
          </div>
        </div>
      </div>

      {/* Informations Générales */}
      <div className="section">
        <h2>Informations générales</h2>
        
        {/* Détails du concert */}
        <div className="concert-info-grid">
          <div className="info-item">
            <p className="label">Date</p>
            <p className="value">{concert.date}</p>
          </div>
          <div className="info-item">
            <p className="label">Heure</p>
            <p className="value">{concert.heure}</p>
          </div>
          <div className="info-item">
            <p className="label">Prix</p>
            <p className="value">{concert.prix}</p>
          </div>
          <div className="info-item">
            <p className="label">Statut</p>
            <span className="status-badge status-confirmed">
              <div className="status-dot"></div>
              {concert.statut}
            </span>
          </div>
        </div>

        {/* Entités liées */}
        <div className="entities-section">
          <p className="entities-label">Entités liées</p>
          <div className="entities-grid">
            {/* Artiste */}
            <div 
              className="entity-card entity-artiste" 
              onClick={() => navigate(`/artistes/${concert.artiste.id}`)}
            >
              <div className="entity-content">
                <div className="entity-icon entity-icon-artiste">
                  <i className="icon-microphone"></i>
                </div>
                <div className="entity-info">
                  <p className="entity-name">{concert.artiste.nom}</p>
                  <p className="entity-type">Artiste</p>
                </div>
              </div>
            </div>

            {/* Organisateur */}
            <div 
              className="entity-card entity-contact" 
              onClick={() => navigate(`/contacts/${concert.organisateur.id}`)}
            >
              <div className="entity-content">
                <div className="entity-icon entity-icon-contact">
                  <i className="icon-user"></i>
                </div>
                <div className="entity-info">
                  <p className="entity-name">{concert.organisateur.nom}</p>
                  <p className="entity-type">Organisateur</p>
                </div>
              </div>
            </div>

            {/* Structure */}
            <div 
              className="entity-card entity-structure" 
              onClick={() => navigate(`/structures/${concert.structure.id}`)}
            >
              <div className="entity-content">
                <div className="entity-icon entity-icon-structure">
                  <i className="icon-building"></i>
                </div>
                <div className="entity-info">
                  <p className="entity-name">{concert.structure.nom}</p>
                  <p className="entity-type">Structure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Lieu */}
      <div className="section lieu-section">
        <div className="lieu-header">
          <div className="lieu-info">
            <h2>Lieu</h2>
            <p className="lieu-subtitle">{concert.lieu.nom}, {concert.lieu.ville}</p>
          </div>
          <button 
            className="lieu-details-btn"
            onClick={() => navigate(`/lieux/${concert.lieu.id}`)}
          >
            Voir détails <i className="icon-arrow-right"></i>
          </button>
        </div>
        
        {/* Map */}
        <div className="map-container">
          <div className="map-content">
            <i className="map-icon icon-map"></i>
            <p className="map-title">{concert.lieu.nom}</p>
            <p className="map-address">{concert.lieu.adresse}</p>
            <button className="map-directions-btn">
              <i className="icon-directions"></i>Itinéraire
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="section">
        <h2>Notes</h2>
        <p className="notes-content">
          {concert.notes}
        </p>
      </div>
    </div>
  );
}

export default ConcertDetails;