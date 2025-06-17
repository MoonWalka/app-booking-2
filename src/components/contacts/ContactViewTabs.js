import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactDetails } from '@/hooks/contacts';
import { useStructureDetails } from '@/hooks/structures';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
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
  const [entityType, setEntityType] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);
  
  // Détecter si c'est un contact ou une structure
  useEffect(() => {
    const detectEntityType = async () => {
      setIsDetecting(true);
      
      if (!id) {
        setEntityType(null);
        setIsDetecting(false);
        return;
      }
      
      console.log('[ContactViewTabs] Détection type pour ID:', id);
      
      try {
        // Essayer d'abord dans contacts
        console.log('[ContactViewTabs] Vérification dans collection contacts...');
        const contactRef = doc(db, 'contacts', id);
        const contactSnap = await getDoc(contactRef);
        
        if (contactSnap.exists()) {
          console.log('[ContactViewTabs] Trouvé dans contacts');
          setEntityType('contact');
          setIsDetecting(false);
          return;
        }
        
        // Sinon essayer dans structures
        console.log('[ContactViewTabs] Vérification dans collection structures...');
        const structureRef = doc(db, 'structures', id);
        const structureSnap = await getDoc(structureRef);
        
        if (structureSnap.exists()) {
          console.log('[ContactViewTabs] Trouvé dans structures');
          setEntityType('structure');
          setIsDetecting(false);
          return;
        }
        
        console.log('[ContactViewTabs] Non trouvé dans aucune collection');
        setEntityType('notfound');
        setIsDetecting(false);
      } catch (error) {
        console.error('[ContactViewTabs] Erreur détection type:', error);
        setEntityType('error');
        setIsDetecting(false);
      }
    };
    
    detectEntityType();
  }, [id]);
  
  // Hooks always called to avoid conditional hooks issue
  const contactHook = useContactDetails(entityType === 'contact' && !isDetecting ? id : null);
  const structureHook = useStructureDetails(entityType === 'structure' && !isDetecting ? id : null);
  
  // Utiliser les bonnes données selon le type
  let contact, loading, error, concerts;
  
  if (isDetecting) {
    // Pendant la détection, afficher un état de chargement
    contact = null;
    loading = true;
    error = null;
    concerts = [];
  } else if (entityType === 'structure') {
    contact = structureHook.structure;
    loading = structureHook.loading;
    error = structureHook.error;
    concerts = structureHook.concerts || [];
  } else if (entityType === 'contact') {
    contact = contactHook.contact;
    loading = contactHook.loading;
    error = contactHook.error;
    concerts = contactHook.concerts || [];
  } else {
    // entityType est 'notfound' ou 'error'
    contact = null;
    loading = false;
    error = entityType === 'error' ? 'Erreur lors du chargement' : 'Contact non trouvé';
    concerts = [];
  }

  console.log('[ContactViewTabs] Type détecté:', entityType, 'Données:', { contact, loading, error });

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

  // Déterminer le type d'entité pour adapter la configuration
  const isStructure = contact && (!contact.prenom || contact.type === 'structure');

  // Configuration pour le composant générique
  const config = {
    defaultBottomTab: 'correspondance',
    notFoundIcon: isStructure ? 'bi-building-x' : 'bi-person-x',
    notFoundTitle: isStructure ? 'Structure non trouvée' : 'Contact non trouvé',
    notFoundMessage: isStructure 
      ? 'La structure demandée n\'existe pas ou n\'est plus disponible.'
      : 'Le contact demandé n\'existe pas ou n\'est plus disponible.',

    // Header avec nom et qualifications
    header: {
      render: (contact) => {
        if (!contact) return null;
        
        const isStructure = !contact.prenom || contact.type === 'structure';
        const displayName = isStructure 
          ? (contact.nom || contact.raisonSociale || 'Structure sans nom')
          : `${contact.prenom || ''} ${contact.nom || ''}`.trim() || 'Contact sans nom';

        return (
          <div className={styles.entityHeader}>
            <div className={styles.entityNameSection}>
              <div className={styles.entityIcon}>
                {isStructure ? (
                  <i className="bi bi-building" style={{ fontSize: '1.1rem', color: '#007bff' }}></i>
                ) : (
                  <i className="bi bi-person-circle" style={{ fontSize: '1.1rem', color: '#28a745' }}></i>
                )}
              </div>
              <div className={styles.entityInfo}>
                <h1 className={styles.entityName}>{displayName}</h1>
                {isStructure && contact.type && (
                  <span className={styles.entityType}>{contact.type}</span>
                )}
                {!isStructure && contact.fonction && (
                  <span className={styles.entityFunction}>{contact.fonction}</span>
                )}
              </div>
            </div>
            
            <div className={styles.qualificationsSection}>
              <h3 className={styles.qualificationsTitle}>
                <i className="bi bi-award"></i>
                Qualifications
              </h3>
              <div className={styles.qualificationsList}>
                {contact.tags && contact.tags.length > 0 ? (
                  contact.tags.map((tag, index) => (
                    <span key={index} className={`${styles.qualificationTag} ${styles[`tag${tag.toLowerCase()}`]}`}>
                      <i className="bi bi-tag-fill"></i>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className={styles.noQualifications}>
                    <i className="bi bi-info-circle"></i>
                    Aucune qualification
                  </span>
                )}
              </div>
              
              {/* Afficher les informations de création */}
              <div className={styles.metaInfo}>
                {contact.createdAt && (
                  <span className={styles.createdDate}>
                    <i className="bi bi-calendar-plus"></i>
                    Créé le {contact.createdAt.toDate ? 
                      contact.createdAt.toDate().toLocaleDateString('fr-FR') : 
                      'Date inconnue'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    
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
        title: 'Informations de contact',
        icon: 'bi bi-info-circle',
        render: (contact) => {
          // Déterminer si c'est une structure ou une personne
          const isStructure = !contact.prenom || contact.type === 'structure';
          
          // Fonction pour formater l'adresse si c'est un objet
          const formatAdresse = (adresse) => {
            if (typeof adresse === 'string') return adresse;
            if (typeof adresse === 'object' && adresse) {
              const parts = [
                adresse.adresse,
                adresse.codePostal,
                adresse.ville,
                adresse.pays
              ].filter(Boolean);
              return parts.join(', ');
            }
            return '';
          };

          return (
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

              {(contact.ville || contact.adresse) && (
                <div className={styles.detailItem}>
                  <i className="bi bi-geo-alt"></i>
                  <span>{contact.ville || formatAdresse(contact.adresse)}</span>
                </div>
              )}

              {/* SIRET pour les structures */}
              {isStructure && contact.siret && (
                <div className={styles.detailItem}>
                  <i className="bi bi-building-gear"></i>
                  <span>SIRET: {contact.siret}</span>
                </div>
              )}

              {/* Site web si disponible */}
              {contact.siteWeb && (
                <div className={styles.detailItem}>
                  <i className="bi bi-globe"></i>
                  <span>{contact.siteWeb}</span>
                </div>
              )}

              {/* Numéro de TVA pour les structures */}
              {isStructure && contact.numeroTVA && (
                <div className={styles.detailItem}>
                  <i className="bi bi-receipt"></i>
                  <span>TVA: {contact.numeroTVA}</span>
                </div>
              )}
            </div>
          );
        }
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
        title: isStructure ? 'Personnes' : 'Relations',
        icon: 'bi bi-people',
        render: (contact) => {
          const isStructure = !contact.prenom || contact.type === 'structure';
          
          return (
            <div>
              <div className={styles.personnesActions}>
                <button 
                  className={styles.actionBubble}
                  onClick={() => navigate('/contacts/nouveau')}
                  title={isStructure ? "Créer un nouveau contact" : "Créer une nouvelle relation"}
                >
                  <i className="bi bi-person-plus"></i>
                  <span>Nouveau</span>
                </button>
                
                <button 
                  className={styles.actionBubble}
                  onClick={() => {
                    console.log('Associer contact existant pour:', id);
                    alert('Fonctionnalité d\'association en cours de développement');
                  }}
                  title={isStructure ? "Associer un contact existant" : "Associer une relation existante"}
                >
                  <i className="bi bi-person-check"></i>
                  <span>Associer</span>
                </button>
              </div>
              
              <div className={styles.personnesContent}>
                <div className={styles.personnesList}>
                  <div className={styles.emptyPersonnes}>
                    <i className="bi bi-people" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                    <p>
                      {isStructure 
                        ? "Aucun contact associé à cette structure"
                        : "Aucune relation définie"
                      }
                    </p>
                    <small>
                      {isStructure 
                        ? "Ajoutez les personnes qui travaillent dans cette structure."
                        : "Ajoutez des relations avec d'autres contacts ou structures."
                      }
                    </small>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      },
      {
        className: 'middleRight',
        title: 'Commentaires',
        icon: 'bi bi-chat-quote',
        render: (contact) => {
          const isStructure = !contact.prenom || contact.type === 'structure';
          
          return (
            <div className={styles.commentsContent}>
              <textarea
                className={styles.commentsTextarea}
                placeholder={isStructure 
                  ? "Ajoutez vos notes et commentaires sur cette structure..."
                  : "Ajoutez vos notes et commentaires sur ce contact..."
                }
                defaultValue={contact?.notes || ''}
                rows={6}
                onChange={(e) => {
                  console.log('Notes modifiées:', e.target.value);
                  // TODO: Implémenter la sauvegarde des notes
                }}
              />
            </div>
          );
        }
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