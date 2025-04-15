import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../style/artisteDetail.css';

const ArtisteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artiste, setArtiste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');

  useEffect(() => {
    const fetchArtiste = async () => {
      try {
        const artisteDoc = await getDoc(doc(db, 'artistes', id));
        if (artisteDoc.exists()) {
          setArtiste({
            id: artisteDoc.id,
            ...artisteDoc.data()
          });
        } else {
          navigate('/artistes');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'artiste:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtiste();
    }
  }, [id, navigate]);

  if (loading) {
    return <div className="loading-container">Chargement des détails de l'artiste...</div>;
  }

  if (!artiste) {
    return <div className="error-container">Artiste non trouvé</div>;
  }

  return (
    <div className="artiste-detail-container">
      <div className="detail-header">
        <div className="header-content">
          <div className="header-image">
            {artiste.photoPrincipale ? (
              <img src={artiste.photoPrincipale} alt={artiste.nom} />
            ) : (
              <div className="placeholder-photo">
                <i className="bi bi-music-note-beamed"></i>
              </div>
            )}
          </div>
          <div className="header-info">
            <h1 className="artiste-name">{artiste.nom}</h1>
            {artiste.genre && <p className="artiste-genre">{artiste.genre}</p>}
            <div className="artiste-stats">
              <div className="stat-item">
                <i className="bi bi-calendar-event"></i>
                <span>{artiste.concertsAssocies?.length || 0} concerts</span>
              </div>
              {artiste.cachetMoyen && (
                <div className="stat-item">
                  <i className="bi bi-cash"></i>
                  <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Link to={`/artistes/${id}/modifier`} className="btn btn-primary">
            <i className="bi bi-pencil me-2"></i>
            Modifier
          </Link>
          <button 
            className="btn btn-outline-primary"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i>
            Imprimer
          </button>
        </div>
      </div>

      <div className="detail-tabs">
        <div 
          className={`tab-item ${activeTab === 'infos' ? 'active' : ''}`}
          onClick={() => setActiveTab('infos')}
        >
          <i className="bi bi-info-circle"></i>
          <span>Informations</span>
        </div>
        <div 
          className={`tab-item ${activeTab === 'concerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('concerts')}
        >
          <i className="bi bi-calendar-event"></i>
          <span>Concerts</span>
        </div>
        <div 
          className={`tab-item ${activeTab === 'contrats' ? 'active' : ''}`}
          onClick={() => setActiveTab('contrats')}
        >
          <i className="bi bi-file-earmark-text"></i>
          <span>Contrats</span>
        </div>
        <div 
          className={`tab-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <i className="bi bi-graph-up"></i>
          <span>Statistiques</span>
        </div>
      </div>

      <div className="detail-content">
        {activeTab === 'infos' && (
          <div className="tab-content">
            <div className="info-section">
              <h3>Description</h3>
              <p>{artiste.description || 'Aucune description disponible'}</p>
            </div>

            {artiste.membres && artiste.membres.length > 0 && (
              <div className="info-section">
                <h3>Membres</h3>
                <ul className="membres-list">
                  {artiste.membres.map((membre, index) => (
                    <li key={index}>{membre}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="info-section">
              <h3>Contacts</h3>
              <div className="contacts-grid">
                {artiste.contacts?.email && (
                  <div className="contact-item">
                    <i className="bi bi-envelope"></i>
                    <a href={`mailto:${artiste.contacts.email}`}>{artiste.contacts.email}</a>
                  </div>
                )}
                {artiste.contacts?.telephone && (
                  <div className="contact-item">
                    <i className="bi bi-telephone"></i>
                    <a href={`tel:${artiste.contacts.telephone}`}>{artiste.contacts.telephone}</a>
                  </div>
                )}
                {artiste.contacts?.siteWeb && (
                  <div className="contact-item">
                    <i className="bi bi-globe"></i>
                    <a href={artiste.contacts.siteWeb} target="_blank" rel="noopener noreferrer">
                      {artiste.contacts.siteWeb}
                    </a>
                  </div>
                )}
                {artiste.contacts?.instagram && (
                  <div className="contact-item">
                    <i className="bi bi-instagram"></i>
                    <a href={`https://instagram.com/${artiste.contacts.instagram}`} target="_blank" rel="noopener noreferrer">
                      @{artiste.contacts.instagram}
                    </a>
                  </div>
                )}
                {artiste.contacts?.facebook && (
                  <div className="contact-item">
                    <i className="bi bi-facebook"></i>
                    <a href={`https://facebook.com/${artiste.contacts.facebook}`} target="_blank" rel="noopener noreferrer">
                      {artiste.contacts.facebook}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'concerts' && (
          <div className="tab-content">
            <ArtisteConcertsList artiste={artiste} />
          </div>
        )}

        {activeTab === 'contrats' && (
          <div className="tab-content">
            <ArtisteContratsList artiste={artiste} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="tab-content">
            <ArtisteStats artiste={artiste} />
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour afficher la liste des concerts d'un artiste
const ArtisteConcertsList = ({ artiste }) => {
  const navigate = useNavigate();

  if (!artiste.concertsAssocies || artiste.concertsAssocies.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-calendar-x"></i>
        <p>Aucun concert associé à cet artiste</p>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate('/concerts/nouveau')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Créer un concert
        </button>
      </div>
    );
  }

  return (
    <div className="concerts-list">
      <div className="list-header">
        <h3>Concerts ({artiste.concertsAssocies.length})</h3>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate('/concerts/nouveau')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Ajouter
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover">
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
            {artiste.concertsAssocies.map(concert => (
              <tr key={concert.id}>
                <td>{new Date(concert.date).toLocaleDateString('fr-FR')}</td>
                <td>{concert.lieu}</td>
                <td>{concert.programmateurNom}</td>
                <td>{concert.montant ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant) : '-'}</td>
                <td>
                  <span className={`badge bg-${getStatusColor(concert.statut)}`}>
                    {concert.statut}
                  </span>
                </td>
                <td>
                  <Link to={`/concerts/${concert.id}`} className="btn btn-sm btn-outline-primary me-1">
                    <i className="bi bi-eye"></i>
                  </Link>
                  <Link to={`/concerts/${concert.id}/edit`} className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-pencil"></i>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant pour afficher la liste des contrats d'un artiste
const ArtisteContratsList = ({ artiste }) => {
  if (!artiste.contrats || artiste.contrats.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-file-earmark-x"></i>
        <p>Aucun contrat associé à cet artiste</p>
      </div>
    );
  }

  return (
    <div className="contrats-list">
      <div className="list-header">
        <h3>Contrats ({artiste.contrats.length})</h3>
      </div>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Date de signature</th>
              <th>Concert</th>
              <th>Montant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artiste.contrats.map(contrat => (
              <tr key={contrat.id}>
                <td>{new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}</td>
                <td>
                  <Link to={`/concerts/${contrat.concertId}`}>
                    {artiste.concertsAssocies?.find(c => c.id === contrat.concertId)?.lieu || 'Concert inconnu'}
                  </Link>
                </td>
                <td>{contrat.montant ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(contrat.montant) : '-'}</td>
                <td>
                  {contrat.url ? (
                    <a href={contrat.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-file-earmark-pdf me-1"></i>
                      Voir
                    </a>
                  ) : (
                    <span className="text-muted">Pas de PDF</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant pour afficher les statistiques d'un artiste
const ArtisteStats = ({ artiste }) => {
  return (
    <div className="stats-container">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h4>Concerts</h4>
            <p className="stat-value">{artiste.stats?.nombreConcerts || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-content">
            <h4>Montant total</h4>
            <p className="stat-value">
              {artiste.stats?.montantTotal 
                ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.stats.montantTotal) 
                : '0 €'}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-cash"></i>
          </div>
          <div className="stat-content">
            <h4>Cachet moyen</h4>
            <p className="stat-value">
              {artiste.cachetMoyen 
                ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen) 
                : '0 €'}
            </p>
          </div>
        </div>
      </div>

      <div className="stats-sections">
        {artiste.stats?.programmateursFrequents && artiste.stats.programmateursFrequents.length > 0 && (
          <div className="stats-section">
            <h3>Programmateurs fréquents</h3>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Programmateur</th>
                    <th>Nombre de concerts</th>
                  </tr>
                </thead>
                <tbody>
                  {artiste.stats.programmateursFrequents.map((prog, index) => (
                    <tr key={index}>
                      <td>{prog.nom}</td>
                      <td>{prog.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {artiste.stats?.lieuxFrequents && artiste.stats.lieuxFrequents.length > 0 && (
          <div className="stats-section">
            <h3>Lieux fréquents</h3>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Lieu</th>
                    <th>Nombre de concerts</th>
                  </tr>
                </thead>
                <tbody>
                  {artiste.stats.lieuxFrequents.map((lieu, index) => (
                    <tr key={index}>
                      <td>{lieu.nom}</td>
                      <td>{lieu.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Fonction utilitaire pour obtenir la couleur du statut
const getStatusColor = (statut) => {
  switch (statut?.toLowerCase()) {
    case 'terminé':
      return 'success';
    case 'confirmé':
      return 'primary';
    case 'en attente':
      return 'warning';
    case 'annulé':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default ArtisteDetail;
