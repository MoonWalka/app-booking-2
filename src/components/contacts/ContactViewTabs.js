import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactDetails } from '@/hooks/contacts';
import ContactDatesTable from './ContactDatesTable';
import ContactContratsTable from './ContactContratsTable';
import ContactFacturesTable from './ContactFacturesTable';
import EntityViewTabs from '@/components/common/EntityViewTabs';
import styles from './ContactViewTabs.module.css';

/**
 * Nouvelle vue de contact en layout 3 zones pour tests
 * Zone 1: Infos générales (haut gauche)
 * Zone 2: En construction (haut droite) 
 * Zone 3: En construction (bas, pleine largeur)
 */
function ContactViewTabs({ id }) {
  console.log('[ContactViewTabs] ID reçu:', id);
  
  const navigate = useNavigate();
  
  // Hook pour récupérer les données du contact
  const { contact, loading, error, concerts } = useContactDetails(id);

  console.log('[ContactViewTabs] Données:', { contact, loading, error });

  // Tags disponibles
  const availableTags = ['Festival', 'Bar', 'Salles'];
  
  // Fonctions pour gérer les tags
  const handleAddTag = (e) => {
    const newTag = e.target.value;
    if (newTag && (!contact?.tags || !contact.tags.includes(newTag))) {
      console.log('Ajouter tag:', newTag, 'au contact:', id);
      alert(`Tag "${newTag}" ajouté (fonctionnalité de sauvegarde à implémenter)`);
    }
    e.target.value = '';
  };
  
  const handleRemoveTag = (tagToRemove) => {
    console.log('Supprimer tag:', tagToRemove, 'du contact:', id);
    alert(`Tag "${tagToRemove}" supprimé (fonctionnalité de sauvegarde à implémenter)`);
  };

  // Configuration pour le composant générique
  const config = {
    defaultBottomTab: 'correspondance',
    notFoundIcon: 'bi-person-x',
    notFoundTitle: 'Contact non trouvé',
    notFoundMessage: 'Le contact demandé n\'existe pas ou n\'est plus disponible.',
    
    bottomTabs: [
      { id: 'correspondance', label: 'Correspondance', icon: 'bi-envelope', color: '#28a745' },
      { id: 'lieux', label: 'Lieux', icon: 'bi-geo-alt', color: '#fd7e14' },
      { id: 'diffusion', label: 'Diffusion', icon: 'bi-broadcast', color: '#6f42c1' },
      { id: 'dates', label: 'Dates', icon: 'bi-calendar-event', color: '#dc3545' },
      { id: 'contrats', label: 'Contrats', icon: 'bi-file-earmark-text', color: '#007bff' },
      { id: 'factures', label: 'Factures', icon: 'bi-receipt', color: '#ffc107' }
    ],

    topSections: [
      {
        className: 'topLeft',
        title: 'Informations générales',
        icon: 'bi bi-person-badge',
        render: (contact) => (
          <div className={styles.contactInfo}>
            <div className={styles.avatar}>
              {contact.photo ? (
                <img src={contact.photo} alt={`${contact.prenom} ${contact.nom}`} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <i className="bi bi-person-circle"></i>
                </div>
              )}
            </div>

            <div className={styles.mainInfo}>
              <h1 className={styles.contactName}>
                {contact.prenom} {contact.nom}
              </h1>
              
              {contact.fonction && (
                <p className={styles.contactFunction}>{contact.fonction}</p>
              )}
            </div>

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

            {contact.notes && (
              <div className={styles.notes}>
                <h4><i className="bi bi-journal-text"></i> Notes</h4>
                <p>{contact.notes}</p>
              </div>
            )}
          </div>
        )
      },
      {
        className: 'topRight',
        title: 'Tags',
        icon: 'bi bi-tags',
        render: (contact) => (
          <div className={styles.tagsContent}>
            <div className={styles.currentTags}>
              {contact?.tags && contact.tags.length > 0 ? (
                contact.tags.map((tag, index) => (
                  <span key={index} className={`${styles.tag} ${styles[`tag${tag.toLowerCase()}`]}`}>
                    <i className="bi bi-tag"></i>
                    {tag}
                    <button 
                      className={styles.removeTag}
                      onClick={() => handleRemoveTag(tag)}
                      title="Supprimer ce tag"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </span>
                ))
              ) : (
                <div className={styles.noTags}>
                  <i className="bi bi-tags" style={{ fontSize: '1.2rem', color: '#6c757d' }}></i>
                  <span>Aucun tag défini</span>
                </div>
              )}
            </div>
            
            <div className={styles.tagSelector}>
              <select 
                className={styles.tagSelect}
                onChange={handleAddTag}
                value=""
              >
                <option value="">Ajouter un tag...</option>
                {availableTags
                  .filter(tag => !contact?.tags?.includes(tag))
                  .map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
        )
      },
      {
        className: 'middleLeft',
        title: 'Personnes',
        icon: 'bi bi-people',
        render: () => (
          <div>
            <div className={styles.personnesActions}>
              <button 
                className={styles.actionBubble}
                onClick={() => navigate('/contacts/nouveau')}
                title="Créer une nouvelle personne"
              >
                <i className="bi bi-person-plus"></i>
                <span>Nouvelle</span>
              </button>
              
              <button 
                className={styles.actionBubble}
                onClick={() => {
                  console.log('Associer personne existante pour contact:', id);
                  alert('Fonctionnalité d\'association en cours de développement');
                }}
                title="Associer une personne existante"
              >
                <i className="bi bi-person-check"></i>
                <span>Associer</span>
              </button>
            </div>
            
            <div className={styles.personnesContent}>
              <div className={styles.personnesList}>
                <div className={styles.emptyPersonnes}>
                  <i className="bi bi-people" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                  <p>Aucune relation personnelle définie</p>
                  <small>Utilisez les boutons ci-dessus pour ajouter des relations.</small>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        className: 'middleRight',
        title: 'Commentaires',
        icon: 'bi bi-chat-quote',
        render: () => (
          <div className={styles.constructionZone}>
            <i className="bi bi-chat-quote" style={{ fontSize: '2rem', color: '#28a745' }}></i>
            <h3>Notes et commentaires</h3>
            <p>Aucun commentaire</p>
            <small>Ajoutez des commentaires et notes sur ce contact.</small>
          </div>
        )
      }
    ],

    renderBottomTabContent: (activeBottomTab) => {
      switch (activeBottomTab) {
        case 'dates':
          return (
            <div className={styles.tabContent}>
              <ContactDatesTable 
                contactId={id} 
                concerts={concerts || []} 
              />
            </div>
          );
        
        case 'contrats':
          return (
            <div className={styles.tabContent}>
              <ContactContratsTable contactId={id} />
            </div>
          );
        
        case 'factures':
          return (
            <div className={styles.tabContent}>
              <ContactFacturesTable contactId={id} />
            </div>
          );
        
        default:
          return null;
      }
    }
  };

  return (
    <EntityViewTabs
      entity={contact}
      loading={loading}
      error={error}
      entityType="contact"
      config={config}
    />
  );
}

export default ContactViewTabs;