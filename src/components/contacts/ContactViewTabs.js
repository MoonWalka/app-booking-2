import React, { useState } from 'react';
import { useContactDetails } from '@/hooks/contacts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './ContactViewTabs.module.css';

/**
 * Nouvelle vue de contact en layout 3 zones pour tests
 * Zone 1: Infos générales (haut gauche)
 * Zone 2: En construction (haut droite) 
 * Zone 3: En construction (bas, pleine largeur)
 */
function ContactViewTabs({ id }) {
  console.log('[ContactViewTabs] ID reçu:', id);
  
  // État pour les onglets secondaires
  const [activeBottomTab, setActiveBottomTab] = useState('contrats');
  
  // Configuration des onglets secondaires
  const bottomTabs = [
    {
      id: 'contrats',
      label: 'Contrats',
      icon: 'bi-file-earmark-text',
      color: '#007bff'
    },
    {
      id: 'correspondance',
      label: 'Correspondance',
      icon: 'bi-envelope',
      color: '#28a745'
    },
    {
      id: 'lieux',
      label: 'Lieux',
      icon: 'bi-geo-alt',
      color: '#fd7e14'
    },
    {
      id: 'diffusion',
      label: 'Diffusion',
      icon: 'bi-broadcast',
      color: '#6f42c1'
    }
  ];
  
  // Hook pour récupérer les données du contact
  const { contact, loading, error } = useContactDetails(id);

  console.log('[ContactViewTabs] Données:', { contact, loading, error });

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ErrorMessage 
          message="Erreur lors du chargement du contact" 
          details={error} 
        />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <i className="bi bi-person-x" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
          <h3>Contact non trouvé</h3>
          <p>Le contact demandé n'existe pas ou n'est plus disponible.</p>
        </div>
      </div>
    );
  }

  // Fonction pour rendre le contenu des onglets secondaires
  const renderBottomTabContent = () => {
    const activeTab = bottomTabs.find(tab => tab.id === activeBottomTab);
    
    return (
      <div className={styles.tabContent}>
        <div className={styles.constructionZone}>
          <i className={`${activeTab.icon}`} style={{ fontSize: '3rem', color: activeTab.color }}></i>
          <h3>Section {activeTab.label}</h3>
          <p>En construction</p>
          <small>
            Cette section contiendra bientôt toutes les informations relatives aux {activeTab.label.toLowerCase()} 
            de ce contact.
          </small>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Zone 1: Informations générales (haut gauche) */}
      <div className={styles.topLeft}>
        <div className={styles.sectionHeader}>
          <i className="bi bi-person-badge"></i>
          <h2>Informations générales</h2>
        </div>
        
        <div className={styles.contactInfo}>
          {/* Photo/Avatar */}
          <div className={styles.avatar}>
            {contact.photo ? (
              <img src={contact.photo} alt={`${contact.prenom} ${contact.nom}`} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <i className="bi bi-person-circle"></i>
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div className={styles.mainInfo}>
            <h1 className={styles.contactName}>
              {contact.prenom} {contact.nom}
            </h1>
            
            {contact.fonction && (
              <p className={styles.contactFunction}>{contact.fonction}</p>
            )}
          </div>

          {/* Détails de contact */}
          <div className={styles.contactDetails}>
            {contact.email && (
              <div className={styles.detailItem}>
                <i className="bi bi-envelope"></i>
                <span>{contact.email}</span>
              </div>
            )}
            
            {contact.telephone && (
              <div className={styles.detailItem}>
                <i className="bi bi-telephone"></i>
                <span>{contact.telephone}</span>
              </div>
            )}

            {contact.ville && (
              <div className={styles.detailItem}>
                <i className="bi bi-geo-alt"></i>
                <span>{contact.ville}</span>
              </div>
            )}

            {contact.createdAt && (
              <div className={styles.detailItem}>
                <i className="bi bi-calendar-plus"></i>
                <span>
                  Créé le {contact.createdAt.toDate ? 
                    contact.createdAt.toDate().toLocaleDateString('fr-FR') : 
                    'Date inconnue'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Notes si disponibles */}
          {contact.notes && (
            <div className={styles.notes}>
              <h4><i className="bi bi-journal-text"></i> Notes</h4>
              <p>{contact.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: En construction (haut droite) */}
      <div className={styles.topRight}>
        <div className={styles.constructionZone}>
          <i className="bi bi-tools" style={{ fontSize: '3rem', color: '#ffc107' }}></i>
          <h3>En construction</h3>
          <p>Relations et historique</p>
          <small>Cette zone contiendra bientôt les relations du contact (structures, lieux, concerts).</small>
        </div>
      </div>

      {/* Barre d'onglets secondaires */}
      <div className={styles.bottomTabsContainer}>
        <div className={styles.bottomTabsBar}>
          {bottomTabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.bottomTab} ${activeBottomTab === tab.id ? styles.bottomTabActive : ''}`}
              onClick={() => setActiveBottomTab(tab.id)}
              style={{ 
                '--tab-color': tab.color,
                borderBottomColor: activeBottomTab === tab.id ? tab.color : 'transparent'
              }}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone 3: Contenu des onglets secondaires (bas, pleine largeur) */}
      <div className={styles.bottom}>
        {renderBottomTabContent()}
      </div>
    </div>
  );
}

export default ContactViewTabs;