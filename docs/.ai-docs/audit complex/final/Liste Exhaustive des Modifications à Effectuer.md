# Liste Exhaustive des Modifications à Effectuer

## 1. Fusion Mobile/Desktop

### Module Artistes

#### 1.1. Créer un composant responsive ArtisteForm.js

**Fichiers à modifier :**
- Supprimer : `/src/components/artistes/mobile/ArtisteForm.js`
- Modifier : `/src/components/artistes/desktop/ArtisteForm.js` → renommer en `/src/components/artistes/ArtisteForm.js`

**Modifications concrètes :**
```javascript
// src/components/artistes/ArtisteForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ArtisteForm.module.css';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import '@styles/index.css';
import Button from '@/components/ui/Button';
import useDeleteArtiste from '@/hooks/artistes/useDeleteArtiste';
import StepNavigation from '../common/steps/StepNavigation';
import useResponsive from '@/hooks/generics/ui/useResponsive';

// Composants d'étapes inchangés...

// Composant principal ArtisteForm responsive
const ArtisteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id && id !== 'nouveau');
  const [initialData, setInitialData] = useState({});
  const { isMobile } = useResponsive();
  
  // Ajout du hook de suppression optimisé
  const {
    isDeleting,
    handleDelete
  } = useDeleteArtiste(() => navigate('/artistes'));
  
  useEffect(() => {
    const fetchArtiste = async () => {
      if (id && id !== 'nouveau') {
        try {
          const artisteDoc = await getDoc(doc(db, 'artistes', id));
          if (artisteDoc.exists()) {
            const data = artisteDoc.data();
            setInitialData(data);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'artiste:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchArtiste();
  }, [id]);
  
  const handleComplete = async (data) => {
    try {
      // Fusionner les données de toutes les étapes avec les données initiales
      const artisteData = {
        ...initialData,
        ...data,
        updatedAt: Timestamp.now()
      };
      
      if (id && id !== 'nouveau') {
        // Mise à jour d'un artiste existant
        await updateDoc(doc(db, 'artistes', id), artisteData);
      } else {
        // Création d'un nouvel artiste
        artisteData.createdAt = Timestamp.now();
        const newArtisteRef = doc(collection(db, 'artistes'));
        await setDoc(newArtisteRef, artisteData);
      }
      
      navigate('/artistes');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'artiste:', error);
      alert('Une erreur est survenue lors de l\'enregistrement de l\'artiste.');
    }
  };
  
  const handleCancel = () => {
    navigate('/artistes');
  };
  
  if (loading) {
    return <div className={styles.loadingIndicator}>Chargement...</div>;
  }
  
  // Si mobile et pas encore implémenté, afficher message temporaire
  if (isMobile) {
    return <div className={styles.mobileMessage}>
      <h2>Version mobile en cours de développement</h2>
      <p>Veuillez utiliser la version desktop pour le moment.</p>
      <Button onClick={() => navigate('/artistes')}>Retour à la liste</Button>
    </div>;
  }
  
  // Définir les étapes du formulaire
  const steps = [
    { 
      title: 'Informations de base', 
      component: BasicInfoStep 
    },
    { 
      title: 'Coordonnées', 
      component: ContactStep 
    },
    { 
      title: 'Membres', 
      component: MembersStep 
    }
  ];
  
  return (
    <div className={styles.artisteForm}>
      <div className={styles.formHeader}>
        <h1>{id !== 'nouveau' ? 'Modifier l\'artiste' : 'Nouvel artiste'}</h1>
        {id !== 'nouveau' && (
          <Button
            variant="danger"
            className="ms-3"
            onClick={() => handleDelete(id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Suppression...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Supprimer
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Navigation sophistiquée par étapes */}
      <StepNavigation 
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        initialStep={0}
        initialData={initialData}
      />
    </div>
  );
};

export default ArtisteForm;
```

#### 1.2. Créer un composant responsive ArtisteView.js

**Fichiers à modifier :**
- Supprimer : `/src/components/artistes/mobile/ArtisteView.js`
- Modifier : `/src/components/artistes/desktop/ArtisteView.js` → renommer en `/src/components/artistes/ArtisteView.js`

**Modifications concrètes :**
```javascript
// src/components/artistes/ArtisteView.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/firebase-service';
import { doc, getDoc } from 'firebase/firestore';
import '@styles/index.css';
import styles from './ArtisteDetail.module.css';
import useResponsive from '@/hooks/generics/ui/useResponsive';

/**
 * Composant de vue pour les détails d'un artiste - Version responsive
 * Séparé du composant d'édition pour une meilleure séparation des préoccupations
 */
const ArtisteView = ({ id }) => {
  const navigate = useNavigate();
  const [artiste, setArtiste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');
  const { isMobile } = useResponsive();

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
    return <div className={isMobile ? styles.loadingContainerMobile : styles.loadingContainerDesktop}>Chargement...</div>;
  }

  if (!artiste) {
    return <div className={isMobile ? styles.errorContainerMobile : styles.errorContainerDesktop}>Artiste non trouvé</div>;
  }

  // Utiliser les classes CSS appropriées selon le mode (mobile/desktop)
  const headerContainerClass = isMobile ? styles.mobileHeaderContainer : styles.desktopHeaderContainer;
  const artisteProfileClass = isMobile ? styles.mobileArtisteProfile : styles.desktopArtisteProfile;
  const artisteImageClass = isMobile ? styles.mobileArtisteImage : styles.desktopArtisteImage;
  const placeholderPhotoClass = isMobile ? styles.mobilePlaceholderPhoto : styles.desktopPlaceholderPhoto;
  const artisteInfoClass = isMobile ? styles.mobileArtisteInfo : styles.desktopArtisteInfo;
  const artisteStatsClass = isMobile ? styles.artisteStatsMobile : styles.artisteStatsDesktop;
  const tabsClass = isMobile ? styles.mobileTabs : styles.desktopTabs;
  const tabContentClass = isMobile ? styles.mobileTabContent : styles.desktopTabContent;
  const emptyStateClass = isMobile ? styles.emptyStateMobile : styles.emptyStateDesktop;
  const concertsHeaderClass = isMobile ? styles.concertsHeaderMobile : styles.concertsHeaderDesktop;
  const concertsListClass = isMobile ? styles.concertsListMobile : styles.concertsListDesktop;
  const contratsHeaderClass = isMobile ? styles.contratsHeaderMobile : styles.contratsHeaderDesktop;
  const contratsListClass = isMobile ? styles.contratsListMobile : styles.contratsListDesktop;
  const statsCardsClass = isMobile ? styles.statsCardsMobile : styles.statsCardsDesktop;
  const statCardClass = isMobile ? styles.statCardMobile : styles.statCard;
  const contactsGridClass = isMobile ? styles.contactsGridMobile : styles.contactsGridDesktop;

  return (
    <div className={isMobile ? styles.artisteDetailMobile : styles.artisteDetailDesktop}>
      {/* En-tête avec image et infos de base */}
      <div className={headerContainerClass}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/artistes')}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        
        <div className={isMobile ? styles.mobileEditButton : styles.desktopEditButton}>
          <button 
            className={styles.editBtn}
            onClick={() => navigate(`/artistes/${id}/modifier`)}
          >
            <i className="bi bi-pencil"></i>
          </button>
        </div>
      </div>
      
      <div className={artisteProfileClass}>
        <div className={artisteImageClass}>
          {artiste.photoPrincipale ? (
            <img src={artiste.photoPrincipale} alt={artiste.nom} />
          ) : (
            <div className={placeholderPhotoClass}>
              <i className="bi bi-music-note-beamed"></i>
            </div>
          )}
        </div>
        
        <div className={artisteInfoClass}>
          <h1>{artiste.nom}</h1>
          {artiste.genre && <p className={styles.genre}>
            {artiste.genre}</p>}
          
          <div className={artisteStatsClass}>
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

      {/* Onglets pour la navigation */}
      <div className={tabsClass}>
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
      <div className={tabContentClass}>
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
              <div className={contactsGridClass}>
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
              <div className={emptyStateClass}>
                <i className="bi bi-calendar-x"></i>
                <p>Aucun concert associé à cet artiste</p>
                <button 
                  className={isMobile ? "tc-btn tc-btn-primary tc-btn-sm" : "tc-btn tc-btn-primary"}
                  onClick={() => navigate('/concerts/nouveau')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Créer un concert
                </button>
              </div>
            ) : (
              <>
                <div className={concertsHeaderClass}>
                  <h3>Concerts ({artiste.concertsAssocies.length})</h3>
                  <button 
                    className="tc-btn tc-btn-sm tc-btn-outline-primary"
                    onClick={() => navigate('/concerts/nouveau')}
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
                
                <div className={concertsListClass}>
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
              <div className={emptyStateClass}>
                <i className="bi bi-file-earmark-x"></i>
                <p>Aucun contrat associé à cet artiste</p>
              </div>
            ) : (
              <>
                <div className={contratsHeaderClass}>
                  <h3>Contrats ({artiste.contrats.length})</h3>
                </div>
                
                <div className={contratsListClass}>
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
            <div className={statsCardsClass}>
              <div className={statCardClass}>
                <div className={styles.statIcon}>
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div className={styles.statContent}>
                  <h4>Concerts</h4>
                  <p className={styles.statValue}>{artiste.stats?.nombreConcerts || 0}</p>
                </div>
              </div>
              <div className={statCardClass}>
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
              <div className={statCardClass}>
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
```

#### 1.3. Créer un composant responsive ArtistesList.js

**Fichiers à modifier :**
- Supprimer : `/src/components/artistes/mobile/ArtistesList.js`
- Modifier : `/src/components/artistes/desktop/ArtistesList.js` → renommer en `/src/components/artistes/ArtistesList.js`

**Modifications concrètes :**
```javascript
// src/components/artistes/ArtistesList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ArtistesList.module.css';
import useResponsive from '@/hooks/generics/ui/useResponsive';
import useArtistes from '@/hooks/artistes/useArtistes';

const ArtistesList = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { artistes, loading, error } = useArtistes();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredArtistes = artistes.filter(artiste => 
    artiste.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleArtisteClick = (id) => {
    navigate(`/artistes/${id}`);
  };
  
  const handleAddArtiste = () => {
    navigate('/artistes/nouveau');
  };
  
  if (loading) {
    return <div className={styles.loading}>Chargement des artistes...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>Erreur: {error}</div>;
  }
  
  return (
    <div className={isMobile ? styles.artistesListMobile : styles.artistesListDesktop}>
      <div className={styles.header}>
        <h1>Artistes</h1>
        <button 
          className="tc-btn tc-btn-primary"
          onClick={handleAddArtiste}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvel artiste
        </button>
      </div>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Rechercher un artiste..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      
      {filteredArtistes.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="bi bi-music-note-list"></i>
          <p>Aucun artiste trouvé</p>
          <button 
            className="tc-btn tc-btn-primary"
            onClick={handleAddArtiste}
          >
            Ajouter un artiste
          </button>
        </div>
      ) : (
        <div className={isMobile ? styles.artistesGridMobile : styles.artistesGrid}>
          {filteredArtistes.map(artiste => (
            <div 
              key={artiste.id}
              className={styles.artisteCard}
              onClick={() => handleArtisteClick(artiste.id)}
            >
              <div className={styles.artisteImage}>
                {artiste.photoPrincipale ? (
                  <img src={artiste.photoPrincipale} alt={artiste.nom} />
                ) : (
                  <div className={styles.placeholderPhoto}>
                    <i className="bi bi-music-note-beamed"></i>
                  </div>
                )}
              </div>
              <div className={styles.artisteInfo}>
                <h3>{artiste.nom}</h3>
                {artiste.genre && <p className={styles.genre}>{artiste.genre}</p>}
                <div className={styles.artisteStats}>
                  <span>
                    <i className="bi bi-calendar-event"></i>
                    {artiste.concertsAssocies?.length || 0}
                  </span>
                  {artiste.cachetMoyen && (
                    <span>
                      <i className="bi bi-cash"></i>
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistesList;
```

#### 1.4. Fusionner les fichiers CSS

**Fichiers à modifier :**
- Créer : `/src/components/artistes/ArtisteDetail.module.css` (fusion des styles desktop et mobile)
- Créer : `/src/components/artistes/ArtisteForm.module.css` (fusion des styles desktop et mobile)
- Créer : `/src/components/artistes/ArtistesList.module.css` (fusion des styles desktop et mobile)

**Modifications concrètes pour ArtisteDetail.module.css :**
```css
/* Styles communs */
.infoSection {
  margin-bottom: 1.5rem;
}

.infoSection h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.membresList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.membresList li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.contactItem {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.contactItem:hover {
  background-color: #f5f5f5;
}

.contactItem i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
  color: #007bff;
}

.statItem {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.statItem i {
  margin-right: 0.5rem;
  color: #6c757d;
}

.tabButton {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s;
}

.tabButton i {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.tabButton.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.concertItem, .contratItem {
  display: flex;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.concertItem:hover, .contratItem:hover {
  background-color: #f8f9fa;
}

.concertDate, .contratDate {
  min-width: 100px;
  font-weight: 500;
}

.concertDetails, .contratDetails {
  flex: 1;
}

.concertLieu, .contratConcert {
  font-weight: 500;
}

.concertProgrammateur {
  font-size: 0.9rem;
  color: #6c757d;
}

.concertMontant, .contratActions {
  min-width: 100px;
  text-align: right;
  font-weight: 500;
}

.statIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9f5ff;
  color: #007bff;
  font-size: 1.2rem;
  margin-right: 1rem;
}

.statContent h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.statValue {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

/* Styles desktop */
.artisteDetailDesktop {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.desktopHeaderContainer {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.desktopArtisteProfile {
  display: flex;
  margin-bottom: 2rem;
}

.desktopArtisteImage {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 2rem;
}

.desktopArtisteImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.desktopPlaceholderPhoto {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #adb5bd;
  font-size: 3rem;
}

.desktopArtisteInfo {
  flex: 1;
}

.desktopArtisteInfo h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.artisteStatsDesktop {
  display: flex;
  margin-top: 1rem;
}

.desktopTabs {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 1.5rem;
}

.desktopTabContent {
  min-height: 300px;
}

.emptyStateDesktop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.emptyStateDesktop i {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.concertsHeaderDesktop, .contratsHeaderDesktop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.concertsHeaderDesktop h3, .contratsHeaderDesktop h3 {
  margin: 0;
}

.concertsListDesktop, .contratsListDesktop {
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.statsCardsDesktop {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.statCard {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.contactsGridDesktop {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.loadingContainerDesktop, .errorContainerDesktop {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
}

/* Styles mobile */
.artisteDetailMobile {
  padding: 1rem;
}

.mobileHeaderContainer {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.mobileArtisteProfile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.mobileArtisteImage {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.mobileArtisteImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobilePlaceholderPhoto {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #adb5bd;
  font-size: 2.5rem;
}

.mobileArtisteInfo {
  width: 100%;
  text-align: center;
}

.mobileArtisteInfo h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.artisteStatsMobile {
  display: flex;
  justify-content: center;
  margin-top: 0.75rem;
}

.mobileTabs {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 1rem;
}

.mobileTabContent {
  min-height: 200px;
}

.emptyStateMobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.emptyStateMobile i {
  font-size: 2.5rem;
  color: #dee2e6;
  margin-bottom: 0.75rem;
}

.concertsHeaderMobile, .contratsHeaderMobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.concertsHeaderMobile h3, .contratsHeaderMobile h3 {
  margin: 0;
  font-size: 1.1rem;
}

.concertsListMobile, .contratsListMobile {
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.statsCardsMobile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.statCardMobile {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.contactsGridMobile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loadingContainerMobile, .errorContainerMobile {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40vh;
  font-size: 1rem;
}
```

#### 1.5. Mettre à jour les imports dans les fichiers qui utilisent ces composants

**Fichiers à modifier :**
- Tous les fichiers qui importent les composants artistes/mobile ou artistes/desktop

**Exemple de modification :**
```javascript
// Avant
import ArtisteForm from '@/components/artistes/desktop/ArtisteForm';
// ou
import ArtisteForm from '@/components/artistes/mobile/ArtisteForm';

// Après
import ArtisteForm from '@/components/artistes/ArtisteForm';
```

### Module Concerts

#### 1.6. Créer un composant responsive ConcertForm.js

**Fichiers à modifier :**
- Supprimer : `/src/components/concerts/mobile/ConcertForm.js`
- Modifier : `/src/components/concerts/desktop/ConcertForm.js` → renommer en `/src/components/concerts/ConcertForm.js`

**Modifications concrètes :**
```javascript
// src/components/concerts/ConcertForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ConcertForm.module.css';
import useResponsive from '@/hooks/generics/ui/useResponsive';
// Autres imports...

const ConcertForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  // État et logique...
  
  // Si mobile et pas encore implémenté, afficher message temporaire
  if (isMobile) {
    return <div className={styles.mobileMessage}>
      <h2>Version mobile en cours de développement</h2>
      <p>Veuillez utiliser la version desktop pour le moment.</p>
      <button onClick={() => navigate('/concerts')}>Retour à la liste</button>
    </div>;
  }
  
  // Rendu desktop existant...
};

export default ConcertForm;
```

### Module Lieux

#### 1.7. Créer un composant responsive LieuForm.js

**Fichiers à modifier :**
- Supprimer : `/src/components/lieux/mobile/LieuForm.js`
- Modifier : `/src/components/lieux/desktop/LieuForm.js` → renommer en `/src/components/lieux/LieuForm.js`

**Modifications concrètes :**
```javascript
// src/components/lieux/LieuForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './LieuForm.module.css';
import useResponsive from '@/hooks/generics/ui/useResponsive';
// Autres imports...

const LieuForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  // État et logique...
  
  // Si mobile et pas encore implémenté, afficher message temporaire
  if (isMobile) {
    return <div className={styles.mobileMessage}>
      <h2>Version mobile en cours de développement</h2>
      <p>Veuillez utiliser la version desktop pour le moment.</p>
      <button onClick={() => navigate('/lieux')}>Retour à la liste</button>
    </div>;
  }
  
  // Rendu desktop existant...
};

export default LieuForm;
```

### Module Programmateurs

#### 1.8. Créer un composant responsive ProgrammateurForm.js

**Fichiers à modifier :**
- Supprimer : `/src/components/programmateurs/mobile/ProgrammateurForm.js`
- Modifier : `/src/components/programmateurs/desktop/ProgrammateurForm.js` → renommer en `/src/components/programmateurs/ProgrammateurForm.js`

**Modifications concrètes :**
```javascript
// src/components/programmateurs/ProgrammateurForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ProgrammateurForm.module.css';
import useResponsive from '@/hooks/generics/ui/useResponsive';
// Autres imports...

const ProgrammateurForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  // État et logique...
  
  // Si mobile et pas encore implémenté, afficher message temporaire
  if (isMobile) {
    return <div className={styles.mobileMessage}>
      <h2>Version mobile en cours de développement</h2>
      <p>Veuillez utiliser la version desktop pour le moment.</p>
      <button onClick={() => navigate('/programmateurs')}>Retour à la liste</button>
    </div>;
  }
  
  // Rendu desktop existant...
};

export default ProgrammateurForm;
```

### Module Structures

#### 1.9. Créer un composant responsive StructureForm.js

**Fichiers à modifier :**
- Supprimer : `/src/components/structures/mobile/StructureForm.js`
- Modifier : `/src/components/structures/desktop/StructureForm.js` → renommer en `/src/components/structures/StructureForm.js`

**Modifications concrètes :**
```javascript
// src/components/structures/StructureForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './StructureForm.module.css';
import useResponsive from '@/hooks/generics/ui/useResponsive';
// Autres imports...

const StructureForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  // État et logique...
  
  // Si mobile et pas encore implémenté, afficher message temporaire
  if (isMobile) {
    return <div className={styles.mobileMessage}>
      <h2>Version mobile en cours de développement</h2>
      <p>Veuillez utiliser la version desktop pour le moment.</p>
      <button onClick={() => navigate('/structures')}>Retour à la liste</button>
    </div>;
  }
  
  // Rendu desktop existant...
};

export default StructureForm;
```

## 2. Nettoyage des Fichiers .bak

### 2.1. Supprimer les fichiers .bak

**Fichiers à modifier :**
- Supprimer tous les fichiers .bak dans `/tools/logs/backup/`

**Commande à exécuter :**
```bash
find /tools/logs/backup/ -name "*.bak" -type f -delete
```

## 3. Réduction de l'Abstraction Excessive

### 3.1. Simplifier useGenericEntityDetails.js

**Fichiers à modifier :**
- `/src/hooks/generics/data/useGenericEntityDetails.js`

**Modifications concrètes :**
```javascript
// src/hooks/generics/data/useGenericEntityDetails.js
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase-service';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Hook générique pour récupérer les détails d'une entité
 * Version simplifiée avec moins d'abstraction
 * 
 * @param {string} entityType - Type d'entité (collection Firestore)
 * @param {string} entityId - ID de l'entité
 * @param {Object} options - Options additionnelles
 * @returns {Object} - Données et état
 */
const useGenericEntityDetails = (entityType, entityId, options = {}) => {
  const {
    onSuccess,
    onError,
    transform,
    includeId = true,
    autoFetch = true
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!entityId || !entityType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, entityType, entityId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rawData = docSnap.data();
        const resultData = includeId 
          ? { id: docSnap.id, ...rawData }
          : rawData;
        
        const transformedData = transform ? transform(resultData) : resultData;
        
        setData(transformedData);
        if (onSuccess) onSuccess(transformedData);
      } else {
        setData(null);
        setError(`${entityType} non trouvé`);
        if (onError) onError(`${entityType} non trouvé`);
      }
    } catch (err) {
      console.error(`Erreur lors de la récupération de ${entityType}:`, err);
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, includeId, transform, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export default useGenericEntityDetails;
```

### 3.2. Simplifier useGenericEntityList.js

**Fichiers à modifier :**
- `/src/hooks/generics/data/useGenericEntityList.js`

**Modifications concrètes :**
```javascript
// src/hooks/generics/data/useGenericEntityList.js
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/services/firebase-service';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

/**
 * Hook générique pour récupérer une liste d'entités
 * Version simplifiée avec moins d'abstraction
 * 
 * @param {string} entityType - Type d'entité (collection Firestore)
 * @param {Object} options - Options additionnelles
 * @returns {Object} - Données et état
 */
const useGenericEntityList = (entityType, options = {}) => {
  const {
    filters = [],
    sort = { field: 'createdAt', direction: 'desc' },
    pageSize = 100,
    onSuccess,
    onError,
    transform,
    includeIds = true,
    autoFetch = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!entityType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construire la requête
      let queryConstraints = [];
      
      // Ajouter les filtres
      filters.forEach(filter => {
        if (filter.field && filter.operator && filter.value !== undefined) {
          queryConstraints.push(where(filter.field, filter.operator, filter.value));
        }
      });
      
      // Ajouter le tri
      if (sort && sort.field) {
        queryConstraints.push(orderBy(sort.field, sort.direction || 'asc'));
      }
      
      // Ajouter la limite
      if (pageSize) {
        queryConstraints.push(limit(pageSize));
      }
      
      // Exécuter la requête
      const q = query(collection(db, entityType), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      // Traiter les résultats
      const results = [];
      querySnapshot.forEach(doc => {
        const item = includeIds 
          ? { id: doc.id, ...doc.data() }
          : doc.data();
        results.push(item);
      });
      
      // Transformer les données si nécessaire
      const transformedData = transform ? transform(results) : results;
      
      setData(transformedData);
      if (onSuccess) onSuccess(transformedData);
    } catch (err) {
      console.error(`Erreur lors de la récupération de la liste ${entityType}:`, err);
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entityType, filters, sort, pageSize, includeIds, transform, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export default useGenericEntityList;
```

## 4. Nettoyage des Logs de Débogage

### 4.1. Supprimer les logs de débogage dans AuthContext.js

**Fichiers à modifier :**
- `/src/context/AuthContext.js`

**Modifications concrètes :**
```javascript
// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, IS_LOCAL_MODE, CURRENT_MODE } from '@/services/firebase-service';
import useGenericCachedData from '@/hooks/generics/data/useGenericCachedData';

// Créer le contexte
export const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Provider du contexte d'authentification simplifié
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Utilisation du cache générique pour l'état d'authentification
  const { 
    setCacheData, 
    getCacheData, 
    invalidate: clearAuthCache 
  } = useGenericCachedData('auth', {
    cacheKey: 'currentUser',
    strategy: 'ttl',
    ttl: 5 * 60 * 1000, // 5 minutes
    levels: ['memory', 'session'] // Cache en mémoire et session
  }, {
    enableStats: true,
    enableAutoCleanup: true
  });

  useEffect(() => {
    // Vérifier d'abord le cache
    const cachedUser = getCacheData('currentUser');
    if (cachedUser && cachedUser !== 'null') {
      setCurrentUser(cachedUser);
      setLoading(false);
      
      // Vérifier en arrière-plan si l'état a changé
      setTimeout(() => {
        checkAuthState();
      }, 100);
      return;
    }

    // Vérification immédiate si pas de cache
    checkAuthState();

    function checkAuthState() {
      // Mode développement avec bypass d'authentification
      if (IS_LOCAL_MODE || process.env.REACT_APP_BYPASS_AUTH === 'true') {
        const devUser = { uid: 'dev-user', email: 'dev@example.com' };
        setCurrentUser(devUser);
        setCacheData('currentUser', devUser);
        setLoading(false);
        return;
      }

      // Une seule souscription, sans compteurs ni timeouts
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Créer un objet utilisateur simplifié pour le cache
          const userCache = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          };
          setCurrentUser(userCache);
          setCacheData('currentUser', userCache);
        } else {
          setCurrentUser(null);
          setCacheData('currentUser', null);
        }
        
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [getCacheData, setCacheData]);

  // Fonctions de connexion/déconnexion simplifiées
  const login = async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Le cache sera mis à jour automatiquement par onAuthStateChanged
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // Nettoyer le cache d'authentification
      clearAuthCache();
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    clearAuthCache
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### 4.2. Supprimer les logs de débogage dans firebase-service.js

**Fichiers à modifier :**
- `/src/services/firebase-service.js`

**Modifications concrètes :**
```javascript
// Supprimer tous les console.log, console.warn et console.error
// Exemple :
// Avant
console.log('Initialisation de Firebase en mode:', MODE_LOCAL ? 'LOCAL' : 'PRODUCTION');

// Après
// (Supprimer la ligne)
```

## 5. Documentation des Abstractions Maintenues

### 5.1. Documenter useGenericCachedData.js

**Fichiers à modifier :**
- `/src/hooks/generics/data/useGenericCachedData.js`

**Modifications concrètes :**
```javascript
/**
 * @fileoverview Hook générique pour la gestion avancée du cache de données
 * 
 * Ce hook implémente un système de cache sophistiqué avec plusieurs stratégies
 * et niveaux de stockage. Il est utilisé pour optimiser les performances en
 * réduisant les appels réseau et en améliorant la réactivité de l'application.
 * 
 * @author TourCraft Team
 * @since 2024
 */

// Reste du code inchangé...

/**
 * Hook générique pour la gestion avancée du cache de données
 * 
 * @description
 * Ce hook fournit une interface unifiée pour gérer le cache de données avec
 * différentes stratégies et niveaux de stockage. Il est particulièrement utile
 * pour les données qui changent peu fréquemment ou qui sont coûteuses à récupérer.
 * 
 * Fonctionnalités principales :
 * - Cache multi-niveaux (mémoire, session, local)
 * - Stratégies de cache avancées (TTL, LRU, tags)
 * - Invalidation intelligente du cache
 * - Préchauffage du cache
 * - Statistiques de performance
 * 
 * Cas d'utilisation typiques :
 * - Mise en cache des données d'authentification
 * - Mise en cache des listes d'entités
 * - Mise en cache des configurations et préférences
 * 
 * @param {string} entityType - Type d'entité à mettre en cache
 * @param {Object} cacheConfig - Configuration du cache
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 */

// Reste du code inchangé...
```

## 6. Standardisation CSS

### 6.1. Convertir les derniers styles inline

**Fichiers à modifier :**
- `/src/components/debug/UnifiedDebugDashboard.jsx`

**Modifications concrètes :**
```javascript
// src/components/debug/UnifiedDebugDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import FirestoreService from '@/services/firestoreService';
import persistenceService, { CACHE_STRATEGIES } from '@/services/persistenceService';
import { utilityCache } from '@/utils/networkStabilizer';
import styles from './UnifiedDebugDashboard.module.css';

const UnifiedDebugDashboard = () => {
  // État et logique inchangés...
  
  return (
    <div>
      {!isVisible ? (
        <div className={styles.toggleButton}>
          <button 
            onClick={() => setIsVisible(true)}
            className={styles.showButton}
            title="Ouvrir le Dashboard de Debug"
          >
            🚀 Debug Dashboard
          </button>
        </div>
      ) : (
        <div className={styles.dashboard}>
          {/* Header */}
          <div className={styles.header}>
            <h3 className={styles.title}>🚀 Debug Dashboard</h3>
            <div className={styles.controls}>
              <select 
                value={refreshInterval} 
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className={styles.select}
              >
                <option value={500}>0.5s</option>
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
              </select>
              <button onClick={cleanup} className={styles.button}>🧹</button>
              <button onClick={resetAll} className={styles.button}>🔄</button>
              <button onClick={() => setIsVisible(false)} className={styles.closeButton}>✕</button>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {[
              { id: 'cache', label: '📊 Cache', icon: '📊' },
              { id: 'firebase', label: '🔥 Firebase', icon: '🔥' },
              { id: 'tests', label: '🧪 Tests', icon: '🧪' },
              { id: 'requests', label: '📡 Requêtes', icon: '📡' }
            ].map(tab => (
              <div
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Contenu des onglets... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDebugDashboard;
```

**Créer le fichier CSS correspondant :**
```css
/* src/components/debug/UnifiedDebugDashboard.module.css */
.toggleButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.showButton {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
  font-size: 14px;
  font-weight: bold;
}

.dashboard {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 500px;
  max-height: 80vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  z-index: 9998;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.header {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 12px;
}

.button {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.closeButton {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.tabs {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
}

.activeTab {
  border-bottom: 3px solid #007bff;
  background-color: white;
  color: #007bff;
}

.content {
  padding: 20px;
  max-height: 60vh;
  overflow: auto;
}

/* Autres styles... */
```
