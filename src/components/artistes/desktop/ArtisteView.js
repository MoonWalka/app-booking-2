// src/components/artistes/desktop/ArtisteView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/firebaseInit';
import { doc, getDoc } from 'firebase/firestore';
import '@styles/index.css';
import styles from './ArtisteDetail.module.css'; // Réutilisation des styles existants

/**
 * Composant de vue pour les détails d'un artiste - Version Desktop
 * Séparé du composant d'édition pour une meilleure séparation des préoccupations
 */
const ArtisteView = () => {
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
    return <div className={styles.loadingContainerDesktop}>Chargement...</div>;
  }

  if (!artiste) {
    return <div className={styles.errorContainerDesktop}>Artiste non trouvé</div>;
  }

  return (
    <div className={styles.artisteDetailDesktop}>
      {/* En-tête avec image et infos de base */}
      <div className={styles.desktopHeaderContainer}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/artistes')}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        
        <div className={styles.desktopEditButton}>
          <button 
            className={styles.editBtn}
            onClick={() => navigate(`/artistes/${id}/modifier`)}
          >
            <i className="bi bi-pencil"></i>
          </button>
        </div>
      </div>
      
      <div className={styles.desktopArtisteProfile}>
        <div className={styles.desktopArtisteImage}>
          {artiste.photoPrincipale ? (
            <img src={artiste.photoPrincipale} alt={artiste.nom} />
          ) : (
            <div className={styles.desktopPlaceholderPhoto}>
              <i className="bi bi-music-note-beamed"></i>
            </div>
          )}
        </div>
        
        <div className={styles.desktopArtisteInfo}>
          <h1>{artiste.nom}</h1>
          {artiste.genre && <p className={styles.genre}>
            {artiste.genre}</p>}
          
          <div className={styles.artisteStatsDesktop}>
            <div className={styles.statItem}>
              <i className="bi bi-calendar-event"></i>
              <span>{artiste.concertsAssocies?.length || 0} concerts</span>
            </div>
            {artiste.cachetMoyen && (
              <div className={styles.statItem}>
                <i className="bi bi-cash"></i>
                <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onglets pour la navigation desktop */}
      <div className={styles.desktopTabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'infos' ? styles.active : ''}`}
          onClick={() => setActiveTab('infos')}
        >
          <i className="bi bi-info-circle"></i>
          <span>Infos</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'concerts' ? styles.active : ''}`}
          onClick={() => setActiveTab('concerts')}
        >
          <i className="bi bi-calendar-event"></i>
          <span>Concerts</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'contrats' ? styles.active : ''}`}
          onClick={() => setActiveTab('contrats')}
        >
          <i className="bi bi-file-earmark-text"></i>
          <span>Contrats</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <i className="bi bi-graph-up"></i>
          <span>Stats</span>
        </button>
      </div>

      {/* Contenu de l'onglet sélectionné */}
      <div className={styles.desktopTabContent}>
        {activeTab === 'infos' && (
          <div className={styles.infoContent}>
            {artiste.description && (
              <div className={styles.infoSection}>
                <h3>Description</h3>
                <p>{artiste.description}</p>
              </div>
            )}

            {artiste.membres && artiste.membres.length > 0 && (
              <div className={styles.infoSection}>
                <h3>Membres</h3>
                <ul className={styles.membresList}>
                  {artiste.membres.map((membre, index) => (
                    <li key={index}>{membre}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.infoSection}>
              <h3>Contacts</h3>
              <div className={styles.contactsGridDesktop}>
                {artiste.contacts?.email && (
                  <a href={`mailto:${artiste.contacts.email}`} className={styles.contactItem}>
                    <i className="bi bi-envelope"></i>
                    <span>{artiste.contacts.email}</span>
                  </a>
                )}
                {artiste.contacts?.telephone && (
                  <a href={`tel:${artiste.contacts.telephone}`} className={styles.contactItem}>
                    <i className="bi bi-telephone"></i>
                    <span>{artiste.contacts.telephone}</span>
                  </a>
                )}
                {artiste.contacts?.siteWeb && (
                  <a href={artiste.contacts.siteWeb} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                    <i className="bi bi-globe"></i>
                    <span>Site web</span>
                  </a>
                )}
                {artiste.contacts?.instagram && (
                  <a href={`https://instagram.com/${artiste.contacts.instagram}`} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                    <i className="bi bi-instagram"></i>
                    <span>Instagram</span>
                  </a>
                )}
                {artiste.contacts?.facebook && (
                  <a href={artiste.contacts.facebook} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                    <i className="bi bi-facebook"></i>
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'concerts' && (
          <div className={styles.concertsContent}>
            {(!artiste.concertsAssocies || artiste.concertsAssocies.length === 0) ? (
              <div className={styles.emptyStateDesktop}>
                <i className="bi bi-calendar-x"></i>
                <p>Aucun concert associé à cet artiste</p>
                <button 
                  className="tc-btn tc-btn-primary"
                  onClick={() => navigate('/concerts/nouveau')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Créer un concert
                </button>
              </div>
            ) : (
              <>
                <div className={styles.concertsHeaderDesktop}>
                  <h3>Concerts ({artiste.concertsAssocies.length})</h3>
                  <button 
                    className="tc-btn tc-btn-sm tc-btn-outline-primary"
                    onClick={() => navigate('/concerts/nouveau')}
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
                
                <div className={styles.concertsListDesktop}>
                  {artiste.concertsAssocies.map(concert => (
                    <div 
                      key={concert.id}
                      className={styles.concertItem}
                      onClick={() => navigate(`/concerts/${concert.id}`)}
                    >
                      <div className={styles.concertDate}>
                        {new Date(concert.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className={styles.concertDetails}>
                        <div className={styles.concertLieu}>{concert.lieu || 'Lieu non spécifié'}</div>
                        <div className={styles.concertProgrammateur}>{concert.programmateurNom || '-'}</div>
                      </div>
                      <div className={styles.concertMontant}>
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
          <div className={styles.contratsContent}>
            {(!artiste.contrats || artiste.contrats.length === 0) ? (
              <div className={styles.emptyStateDesktop}>
                <i className="bi bi-file-earmark-x"></i>
                <p>Aucun contrat associé à cet artiste</p>
              </div>
            ) : (
              <>
                <div className={styles.contratsHeaderDesktop}>
                  <h3>Contrats ({artiste.contrats.length})</h3>
                </div>
                
                <div className={styles.contratsListDesktop}>
                  {artiste.contrats.map(contrat => (
                    <div 
                      key={contrat.id}
                      className={styles.contratItem}
                    >
                      <div className={styles.contratDate}>
                        {new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}
                      </div>
                      <div className={styles.contratDetails}>
                        <div className={styles.contratConcert}>
                          {artiste.concertsAssocies?.find(c => c.id === contrat.concertId)?.lieu || 'Concert inconnu'}
                        </div>
                      </div>
                      <div className={styles.contratActions}>
                        {contrat.url ? (
                          <a href={contrat.url} target="_blank" rel="noopener noreferrer" className="tc-btn tc-btn-sm tc-btn-outline-primary">
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
          <div className={styles.statsContent}>
            <div className={styles.statsCardsDesktop}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div className={styles.statContent}>
                  <h4>Concerts</h4>
                  <p className={styles.statValue}>{artiste.stats?.nombreConcerts || 0}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div className={styles.statContent}>
                  <h4>Montant total</h4>
                  <p className={styles.statValue}>
                    {artiste.stats?.montantTotal 
                      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.stats.montantTotal) 
                      : '0 €'}
                  </p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <i className="bi bi-cash"></i>
                </div>
                <div className={styles.statContent}>
                  <h4>Cachet moyen</h4>
                  <p className={styles.statValue}>
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

export default ArtisteView;
