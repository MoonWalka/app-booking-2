// src/components/artistes/desktop/ArtisteDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import '@styles/artisteDetail.css';
import '@styles/artisteDetailsMobile.css';

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
    return <div className="loading-container-mobile">Chargement...</div>;
  }

  if (!artiste) {
    return <div className="error-container-mobile">Artiste non trouvé</div>;
  }

  return (
    <div className="artiste-detail-mobile">
      {/* En-tête avec image et infos de base */}
      <div className="mobile-header-container">
        <button 
          className="back-button" 
          onClick={() => navigate('/artistes')}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        
        <div className="mobile-edit-button">
          <button 
            className="edit-btn"
            onClick={() => navigate(`/artistes/${id}/modifier`)}
          >
            <i className="bi bi-pencil"></i>
          </button>
        </div>
      </div>
      
      <div className="mobile-artiste-profile">
        <div className="mobile-artiste-image">
          {artiste.photoPrincipale ? (
            <img src={artiste.photoPrincipale} alt={artiste.nom} />
          ) : (
            <div className="mobile-placeholder-photo">
              <i className="bi bi-music-note-beamed"></i>
            </div>
          )}
        </div>
        
        <div className="mobile-artiste-info">
          <h1>{artiste.nom}</h1>
          {artiste.genre && <p className="genre">{artiste.genre}</p>}
          
          <div className="artiste-stats-mobile">
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

      {/* Onglets pour la navigation mobile */}
      <div className="mobile-tabs">
        <button 
          className={`tab-button ${activeTab === 'infos' ? 'active' : ''}`}
          onClick={() => setActiveTab('infos')}
        >
          <i className="bi bi-info-circle"></i>
          <span>Infos</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'concerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('concerts')}
        >
          <i className="bi bi-calendar-event"></i>
          <span>Concerts</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'contrats' ? 'active' : ''}`}
          onClick={() => setActiveTab('contrats')}
        >
          <i className="bi bi-file-earmark-text"></i>
          <span>Contrats</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <i className="bi bi-graph-up"></i>
          <span>Stats</span>
        </button>
      </div>

      {/* Contenu de l'onglet sélectionné */}
      <div className="mobile-tab-content">
        {activeTab === 'infos' && (
          <div className="info-content">
            {artiste.description && (
              <div className="info-section">
                <h3>Description</h3>
                <p>{artiste.description}</p>
              </div>
            )}

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
              <div className="contacts-grid-mobile">
                {artiste.contacts?.email && (
                  <a href={`mailto:${artiste.contacts.email}`} className="contact-item">
                    <i className="bi bi-envelope"></i>
                    <span>{artiste.contacts.email}</span>
                  </a>
                )}
                {artiste.contacts?.telephone && (
                  <a href={`tel:${artiste.contacts.telephone}`} className="contact-item">
                    <i className="bi bi-telephone"></i>
                    <span>{artiste.contacts.telephone}</span>
                  </a>
                )}
                {artiste.contacts?.siteWeb && (
                  <a href={artiste.contacts.siteWeb} target="_blank" rel="noopener noreferrer" className="contact-item">
                    <i className="bi bi-globe"></i>
                    <span>Site web</span>
                  </a>
                )}
                {artiste.contacts?.instagram && (
                  <a href={`https://instagram.com/${artiste.contacts.instagram}`} target="_blank" rel="noopener noreferrer" className="contact-item">
                    <i className="bi bi-instagram"></i>
                    <span>Instagram</span>
                  </a>
                )}
                {artiste.contacts?.facebook && (
                  <a href={artiste.contacts.facebook} target="_blank" rel="noopener noreferrer" className="contact-item">
                    <i className="bi bi-facebook"></i>
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'concerts' && (
          <div className="concerts-content">
            {(!artiste.concertsAssocies || artiste.concertsAssocies.length === 0) ? (
              <div className="empty-state-mobile">
                <i className="bi bi-calendar-x"></i>
                <p>Aucun concert associé à cet artiste</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/concerts/nouveau')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Créer un concert
                </button>
              </div>
            ) : (
              <>
                <div className="concerts-header-mobile">
                  <h3>Concerts ({artiste.concertsAssocies.length})</h3>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate('/concerts/nouveau')}
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
                
                <div className="concerts-list-mobile">
                  {artiste.concertsAssocies.map(concert => (
                    <div 
                      key={concert.id}
                      className="concert-item"
                      onClick={() => navigate(`/concerts/${concert.id}`)}
                    >
                      <div className="concert-date">
                        {new Date(concert.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="concert-details">
                        <div className="concert-lieu">{concert.lieu || 'Lieu non spécifié'}</div>
                        <div className="concert-programmateur">{concert.programmateurNom || '-'}</div>
                      </div>
                      <div className="concert-montant">
                        {concert.montant ? 
                          new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant) : 
                          '-'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'contrats' && (
          <div className="contrats-content">
            {(!artiste.contrats || artiste.contrats.length === 0) ? (
              <div className="empty-state-mobile">
                <i className="bi bi-file-earmark-x"></i>
                <p>Aucun contrat associé à cet artiste</p>
              </div>
            ) : (
              <>
                <div className="contrats-header-mobile">
                  <h3>Contrats ({artiste.contrats.length})</h3>
                </div>
                
                <div className="contrats-list-mobile">
                  {artiste.contrats.map(contrat => (
                    <div 
                      key={contrat.id}
                      className="contrat-item"
                    >
                      <div className="contrat-date">
                        {new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="contrat-details">
                        <div className="contrat-concert">
                          {artiste.concertsAssocies?.find(c => c.id === contrat.concertId)?.lieu || 'Concert inconnu'}
                        </div>
                      </div>
                      <div className="contrat-actions">
                        {contrat.url ? (
                          <a href={contrat.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-file-earmark-pdf"></i>
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-content">
            <div className="stats-cards-mobile">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisteDetail;
