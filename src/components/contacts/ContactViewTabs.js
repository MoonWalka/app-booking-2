import React, { useState, useEffect } from 'react';
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
function ContactViewTabs({ id, viewType = null }) {
  console.log('[ContactViewTabs] ID reçu:', id, 'viewType:', viewType);
  
  const [entityType, setEntityType] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [forcedViewType, setForcedViewType] = useState(viewType);
  
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
        
        // Utiliser le type forcé si fourni, sinon détecter automatiquement
        const hasStructureData = contact.structureRaisonSociale?.trim();
        const isStructure = forcedViewType ? (forcedViewType === 'structure') : hasStructureData;
        
        // Pour les structures : afficher le nom de la structure
        // Pour les personnes : afficher prénom + nom
        const displayName = isStructure 
          ? (contact.structureRaisonSociale || 'Structure sans nom')
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
                {isStructure && contact.structureType && (
                  <span className={styles.entityType}>{contact.structureType}</span>
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
      { id: 'diffusion', label: 'Diffusion', icon: 'bi-broadcast', color: '#6f42c1' },
      { id: 'salle', label: 'Salle', icon: 'bi-building', color: '#fd7e14' },
      { id: 'dates', label: 'Dates', icon: 'bi-calendar-event', color: '#dc3545' },
      { id: 'contrats', label: 'Contrats', icon: 'bi-file-earmark-text', color: '#007bff' },
      { id: 'factures', label: 'Factures', icon: 'bi-receipt', color: '#ffc107' }
    ],

    topSections: [
      {
        className: 'topLeft',
        title: 'Informations générales',
        icon: 'bi bi-info-circle',
        render: (contact) => {
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = contact.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : hasStructureData;
          
          // Construire l'adresse structure complète
          const formatStructureAddress = () => {
            const parts = [
              contact.structureAdresse,
              contact.structureSuiteAdresse1,
              contact.structureCodePostal,
              contact.structureVille,
              contact.structureDepartement,
              contact.structureRegion,
              contact.structurePays
            ].filter(Boolean);
            return parts.join(', ');
          };

          // Construire l'adresse personne complète
          const formatPersonneAddress = () => {
            const parts = [
              contact.adresse,
              contact.suiteAdresse,
              contact.codePostal,
              contact.ville,
              contact.departement,
              contact.region,
              contact.pays
            ].filter(Boolean);
            return parts.join(', ');
          };

          return (
            <div className={styles.contactDetails}>
              {isStructure ? (
                <>
                  {/* Titre dans la bulle uniquement, pas dans le contenu */}
                  
                  {/* Raison sociale */}
                  {contact.structureRaisonSociale && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-building"></i>
                      <span><strong>{contact.structureRaisonSociale}</strong></span>
                    </div>
                  )}
                  
                  {/* Adresse structure */}
                  {(contact.structureAdresse || contact.structureVille) && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-geo-alt"></i>
                      <span>{formatStructureAddress()}</span>
                    </div>
                  )}
                  
                  {/* Email structure */}
                  {contact.structureEmail && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-envelope"></i>
                      <span>{contact.structureEmail}</span>
                    </div>
                  )}
                  
                  {/* Téléphones structure */}
                  {contact.structureTelephone1 && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-telephone"></i>
                      <span>{contact.structureTelephone1}</span>
                    </div>
                  )}
                  
                  {contact.structureTelephone2 && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-telephone"></i>
                      <span>{contact.structureTelephone2} (2)</span>
                    </div>
                  )}
                  
                  {/* Site web structure */}
                  {contact.structureSiteWeb && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-globe"></i>
                      <span>{contact.structureSiteWeb}</span>
                    </div>
                  )}

                  {/* SIRET si disponible */}
                  {(contact.structureSiret || contact.structureId) && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-building-gear"></i>
                      <span>SIRET: {contact.structureSiret || contact.structureId}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Titre dans la bulle uniquement, pas dans le contenu */}
                  
                  {/* Fonction */}
                  {contact.fonction && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-briefcase"></i>
                      <span><strong>{contact.fonction}</strong></span>
                    </div>
                  )}
                  
                  {/* Adresse personne */}
                  {(contact.adresse || contact.ville) && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-house"></i>
                      <span>{formatPersonneAddress()}</span>
                    </div>
                  )}
                  
                  {/* Email direct */}
                  {contact.mailDirect && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-envelope"></i>
                      <span>{contact.mailDirect} (direct)</span>
                    </div>
                  )}
                  
                  {/* Email perso */}
                  {contact.mailPerso && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-envelope-at"></i>
                      <span>{contact.mailPerso} (perso)</span>
                    </div>
                  )}
                  
                  {/* Téléphone direct */}
                  {contact.telDirect && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-telephone"></i>
                      <span>{contact.telDirect} (direct)</span>
                    </div>
                  )}
                  
                  {/* Téléphone perso */}
                  {contact.telPerso && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-phone"></i>
                      <span>{contact.telPerso} (perso)</span>
                    </div>
                  )}
                  
                  {/* Mobile */}
                  {contact.mobile && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-phone-vibrate"></i>
                      <span>{contact.mobile} (mobile)</span>
                    </div>
                  )}
                  
                  {/* Source */}
                  {contact.source && (
                    <div className={styles.detailItem}>
                      <i className="bi bi-diagram-3"></i>
                      <span>Source: {contact.source}</span>
                    </div>
                  )}
                </>
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
        title: (contact) => {
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = contact?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : hasStructureData;
          return isStructure ? 'Personnes' : 'Structure';
        },
        icon: (contact) => {
          const hasStructureData = contact?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : hasStructureData;
          return isStructure ? 'bi bi-people' : 'bi bi-building';
        },
        actions: (contact) => {
          const hasStructureData = contact?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : hasStructureData;
          
          if (isStructure) {
            // Pour les structures : actions sur les personnes
            return [
              {
                label: 'Ajouter',
                icon: 'bi bi-plus-circle',
                tooltip: 'Ajouter une nouvelle personne',
                onClick: () => {
                  console.log('Ajouter nouvelle personne');
                  // TODO: Ouvrir modal de création de personne
                }
              },
              {
                label: 'Associer',
                icon: 'bi bi-link-45deg',
                tooltip: 'Associer une personne existante',
                onClick: () => {
                  console.log('Associer personne existante');
                  // TODO: Ouvrir modal de sélection de personne
                }
              }
            ];
          } else {
            // Pour les personnes : actions sur les structures
            return [
              {
                label: 'Ajouter',
                icon: 'bi bi-plus-circle',
                tooltip: 'Créer une nouvelle structure',
                onClick: () => {
                  console.log('Créer nouvelle structure');
                  // TODO: Ouvrir modal de création de structure
                }
              },
              {
                label: 'Associer',
                icon: 'bi bi-link-45deg',
                tooltip: 'Associer une structure existante',
                onClick: () => {
                  console.log('Associer structure existante');
                  // TODO: Ouvrir modal de sélection de structure
                }
              }
            ];
          }
        },
        render: (contact) => {
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = contact.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : hasStructureData;
          
          if (isStructure) {
            // Pour les structures, afficher les personnes
            // Construire l'adresse personne complète
            const formatPersonneAddress = (personneNum = '') => {
              const adresseField = personneNum ? `adresse${personneNum}` : 'adresse';
              const codePostalField = personneNum ? `codePostal${personneNum}` : 'codePostal';
              const villeField = personneNum ? `ville${personneNum}` : 'ville';
              const paysField = personneNum ? `pays${personneNum}` : 'pays';
              
              const parts = [
                contact[adresseField],
                contact[codePostalField],
                contact[villeField],
                contact[paysField]
              ].filter(Boolean);
              return parts.join(', ');
            };

            const renderPersonne = (personneNum = '') => {
              const prenomField = personneNum ? `prenom${personneNum}` : 'prenom';
              const nomField = personneNum ? `nom${personneNum}` : 'nom';
              const fonctionField = personneNum ? `fonction${personneNum}` : 'fonction';
              const telDirectField = personneNum ? `telDirect${personneNum}` : 'telDirect';
              const telPersoField = personneNum ? `telPerso${personneNum}` : 'telPerso';
              const mobileField = personneNum ? `mobile${personneNum}` : 'mobile';
              const mailDirectField = personneNum ? `mailDirect${personneNum}` : 'mailDirect';
              const mailPersoField = personneNum ? `mailPerso${personneNum}` : 'mailPerso';
              
              const prenom = contact[prenomField];
              const nom = contact[nomField];
              
              if (!prenom && !nom) return null;

              return (
                <div key={personneNum} className={styles.personneCard}>
                  <div className={styles.personneHeader}>
                    <i className="bi bi-person-circle"></i>
                    <strong>{`${prenom || ''} ${nom || ''}`.trim()}</strong>
                    {contact[fonctionField] && (
                      <span className={styles.personneFunction}>
                        - {contact[fonctionField]}
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.personneDetails}>
                    {contact[telDirectField] && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-telephone"></i>
                        <span>{contact[telDirectField]} (direct)</span>
                      </div>
                    )}
                    
                    {contact[telPersoField] && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-phone"></i>
                        <span>{contact[telPersoField]} (perso)</span>
                      </div>
                    )}
                    
                    {contact[mobileField] && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-phone-vibrate"></i>
                        <span>{contact[mobileField]} (mobile)</span>
                      </div>
                    )}
                    
                    {contact[mailDirectField] && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-envelope"></i>
                        <span>{contact[mailDirectField]} (direct)</span>
                      </div>
                    )}
                    
                    {contact[mailPersoField] && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-envelope-at"></i>
                        <span>{contact[mailPersoField]} (perso)</span>
                      </div>
                    )}
                    
                    {formatPersonneAddress(personneNum) && (
                      <div className={styles.detailItem}>
                        <i className="bi bi-house"></i>
                        <span>{formatPersonneAddress(personneNum)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            };

            return (
              <div className={styles.personnesContent}>
                {renderPersonne()} {/* Personne 1 */}
                {renderPersonne('2')} {/* Personne 2 */}
                {renderPersonne('3')} {/* Personne 3 */}
                
                {!contact.prenom && !contact.prenom2 && !contact.prenom3 && (
                  <div className={styles.emptyPersonnes}>
                    <i className="bi bi-people" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                    <p>Aucune personne définie</p>
                    <small>Les métadonnées personnes apparaîtront ici.</small>
                  </div>
                )}
              </div>
            );
          } else {
            // Pour les personnes, afficher la structure
            return (
              <div className={styles.structureContent}>
                {contact.structureRaisonSociale ? (
                  <div className={styles.structureCard}>
                    <div className={styles.structureHeader}>
                      <i className="bi bi-building"></i>
                      <strong>{contact.structureRaisonSociale}</strong>
                    </div>
                    
                    <div className={styles.structureDetails}>
                      {/* Adresse structure */}
                      {(contact.structureAdresse || contact.structureVille) && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-geo-alt"></i>
                          <span>{[
                            contact.structureAdresse,
                            contact.structureSuiteAdresse1,
                            contact.structureCodePostal,
                            contact.structureVille,
                            contact.structureDepartement,
                            contact.structureRegion,
                            contact.structurePays
                          ].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                      
                      {/* Email structure */}
                      {contact.structureEmail && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-envelope"></i>
                          <span>{contact.structureEmail}</span>
                        </div>
                      )}
                      
                      {/* Téléphones structure */}
                      {contact.structureTelephone1 && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-telephone"></i>
                          <span>{contact.structureTelephone1}</span>
                        </div>
                      )}
                      
                      {contact.structureTelephone2 && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-telephone"></i>
                          <span>{contact.structureTelephone2} (2)</span>
                        </div>
                      )}
                      
                      {/* Site web */}
                      {contact.structureSiteWeb && (
                        <div className={styles.detailItem}>
                          <i className="bi bi-globe"></i>
                          <span>{contact.structureSiteWeb}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyStructure}>
                    <i className="bi bi-building" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                    <p>Aucune structure associée</p>
                    <small>Les informations de la structure apparaîtront ici.</small>
                  </div>
                )}
              </div>
            );
          }
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
      },
    ],

    renderBottomTabContent: (activeBottomTab) => {
      switch (activeBottomTab) {
        case 'diffusion':
          return (
            <div className={styles.tabContent}>
              <div className={styles.metadataSection}>
                <h3><i className="bi bi-broadcast"></i> Informations de diffusion</h3>
                <div className={styles.metadataGrid}>
                  {contact?.nomFestival && (
                    <div className={styles.metadataItem}>
                      <strong>Nom du festival:</strong>
                      <span>{contact.nomFestival}</span>
                    </div>
                  )}
                  {contact?.periodeFestivalMois && (
                    <div className={styles.metadataItem}>
                      <strong>Période (mois):</strong>
                      <span>{contact.periodeFestivalMois}</span>
                    </div>
                  )}
                  {contact?.periodeFestivalComplete && (
                    <div className={styles.metadataItem}>
                      <strong>Période complète:</strong>
                      <span>{contact.periodeFestivalComplete}</span>
                    </div>
                  )}
                  {contact?.bouclage && (
                    <div className={styles.metadataItem}>
                      <strong>Bouclage:</strong>
                      <span>{contact.bouclage}</span>
                    </div>
                  )}
                  {contact?.diffusionCommentaires1 && (
                    <div className={styles.metadataItem}>
                      <strong>Commentaires:</strong>
                      <span>{contact.diffusionCommentaires1}</span>
                    </div>
                  )}
                </div>
                {!contact?.nomFestival && !contact?.periodeFestivalMois && (
                  <div className={styles.emptyMessage}>
                    <i className="bi bi-broadcast" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                    <p>Aucune information de diffusion</p>
                  </div>
                )}
              </div>
            </div>
          );
          
        case 'salle':
          return (
            <div className={styles.tabContent}>
              <div className={styles.metadataSection}>
                <h3><i className="bi bi-building"></i> Informations de salle</h3>
                <div className={styles.metadataGrid}>
                  {contact?.salleNom && (
                    <div className={styles.metadataItem}>
                      <strong>Nom de la salle:</strong>
                      <span>{contact.salleNom}</span>
                    </div>
                  )}
                  {(contact?.salleAdresse || contact?.salleVille) && (
                    <div className={styles.metadataItem}>
                      <strong>Adresse:</strong>
                      <span>
                        {[
                          contact.salleAdresse,
                          contact.salleSuiteAdresse,
                          contact.salleCodePostal,
                          contact.salleVille,
                          contact.salleDepartement,
                          contact.salleRegion,
                          contact.sallePays
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {contact?.salleTelephone && (
                    <div className={styles.metadataItem}>
                      <strong>Téléphone:</strong>
                      <span>{contact.salleTelephone}</span>
                    </div>
                  )}
                  {(contact?.salleJauge1 || contact?.salleJauge2 || contact?.salleJauge3) && (
                    <div className={styles.metadataItem}>
                      <strong>Jauges:</strong>
                      <span>
                        {[contact.salleJauge1, contact.salleJauge2, contact.salleJauge3]
                          .filter(Boolean)
                          .join(' / ')}
                      </span>
                    </div>
                  )}
                  {contact?.salleOuverture && (
                    <div className={styles.metadataItem}>
                      <strong>Ouverture:</strong>
                      <span>{contact.salleOuverture}</span>
                    </div>
                  )}
                  {contact?.salleProfondeur && (
                    <div className={styles.metadataItem}>
                      <strong>Profondeur:</strong>
                      <span>{contact.salleProfondeur}</span>
                    </div>
                  )}
                  {contact?.salleHauteur && (
                    <div className={styles.metadataItem}>
                      <strong>Hauteur:</strong>
                      <span>{contact.salleHauteur}</span>
                    </div>
                  )}
                </div>
                {!contact?.salleNom && !contact?.salleAdresse && (
                  <div className={styles.emptyMessage}>
                    <i className="bi bi-building" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                    <p>Aucune information de salle</p>
                  </div>
                )}
              </div>
            </div>
          );
        
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