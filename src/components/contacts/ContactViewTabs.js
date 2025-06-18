import React, { useState, useEffect, useMemo } from 'react';
import { useUnifiedContact } from '@/hooks/contacts/useUnifiedContact';
import { useTabs } from '@/context/TabsContext';
import { useContactModals } from '@/context/ContactModalsContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import ContactDatesTable from './ContactDatesTable';
import ContactContratsTable from './ContactContratsTable';
import ContactFacturesTable from './ContactFacturesTable';
import EntityViewTabs from '@/components/common/EntityViewTabs';
import EntityCard from '@/components/ui/EntityCard';
import { useNavigate } from 'react-router-dom';
import styles from './ContactViewTabs.module.css';

/**
 * Nouvelle vue de contact en layout 3 zones pour tests
 * Zone 1: Infos générales (haut gauche)
 * Zone 2: En construction (haut droite) 
 * Zone 3: En construction (bas, pleine largeur)
 */
function ContactViewTabs({ id, viewType = null }) {
  console.log('[ContactViewTabs] ID reçu:', id, 'viewType:', viewType);
  
  const [forcedViewType] = useState(viewType);
  const [localCommentaires, setLocalCommentaires] = useState([]);
  const [lastLocalUpdate, setLastLocalUpdate] = useState(null);
  
  // Hook pour gérer les onglets
  const { openStructureTab } = useTabs();
  
  // Hook pour gérer les modals
  const { openCommentModal } = useContactModals();
  
  // Hook pour récupérer l'utilisateur actuel
  const { currentUser } = useAuth();
  
  // Hook pour la navigation
  const navigate = useNavigate();
  
  // Utiliser le hook unifié pour charger le contact
  const { contact, loading, error, entityType } = useUnifiedContact(id);

  console.log('[ContactViewTabs] Données unifiées:', { contact, loading, error, entityType });
  
  // Navigation vers les entités liées
  const navigateToEntity = (entityType, entityId, entityName) => {
    console.log(`[ContactViewTabs] Navigation vers ${entityType} avec ID:`, entityId);
    
    if (!entityId) {
      console.warn(`[ContactViewTabs] ID manquant pour ${entityType}`);
      return;
    }
    
    const routes = {
      structure: `/structures/${entityId}`,
      contact: `/contacts/${entityId}`,
      lieu: `/lieux/${entityId}`,
      concert: `/concerts/${entityId}`,
      artiste: `/artistes/${entityId}`
    };
    
    if (routes[entityType]) {
      console.log(`[ContactViewTabs] Navigation vers:`, routes[entityType]);
      navigate(routes[entityType]);
    } else {
      console.error(`[ContactViewTabs] Route inconnue pour ${entityType}`);
    }
  };
  
  // Extraire les données selon le type d'entité
  const extractedData = useMemo(() => {
    if (!contact) return null;
    
    if (entityType === 'structure') {
      // Pour les structures : transformer les données structure+personnes vers l'ancien format
      const structureData = contact.structure || {};
      const personnes = contact.personnes || [];
      
      // Créer un objet compatible avec l'ancien format
      return {
        // Données de base
        id: contact.id,
        entityType: 'structure',
        
        // Structure principale
        structureRaisonSociale: structureData.raisonSociale,
        structureNom: structureData.nom,
        structureEmail: structureData.email,
        structureTelephone1: structureData.telephone1,
        structureTelephone2: structureData.telephone2,
        structureMobile: structureData.mobile,
        structureFax: structureData.fax,
        structureSiteWeb: structureData.siteWeb,
        structureSiret: structureData.siret,
        structureType: structureData.type,
        
        // Adresse structure
        structureAdresse: structureData.adresse,
        structureSuiteAdresse1: structureData.suiteAdresse,
        structureCodePostal: structureData.codePostal,
        structureVille: structureData.ville,
        structureDepartement: structureData.departement,
        structureRegion: structureData.region,
        structurePays: structureData.pays,
        
        // Personnes (jusqu'à 3)
        ...(personnes[0] && {
          prenom: personnes[0].prenom,
          nom: personnes[0].nom,
          fonction: personnes[0].fonction,
          mailDirect: personnes[0].email,
          mailPerso: personnes[0].mailPerso,
          telDirect: personnes[0].telephone,
          telPerso: personnes[0].telPerso,
          mobile: personnes[0].mobile,
          adresse: personnes[0].adresse,
          codePostal: personnes[0].codePostal,
          ville: personnes[0].ville,
          pays: personnes[0].pays
        }),
        ...(personnes[1] && {
          prenom2: personnes[1].prenom,
          nom2: personnes[1].nom,
          fonction2: personnes[1].fonction,
          mailDirect2: personnes[1].email,
          mailPerso2: personnes[1].mailPerso,
          telDirect2: personnes[1].telephone,
          telPerso2: personnes[1].telPerso,
          mobile2: personnes[1].mobile,
          adresse2: personnes[1].adresse,
          codePostal2: personnes[1].codePostal,
          ville2: personnes[1].ville,
          pays2: personnes[1].pays
        }),
        ...(personnes[2] && {
          prenom3: personnes[2].prenom,
          nom3: personnes[2].nom,
          fonction3: personnes[2].fonction,
          mailDirect3: personnes[2].email,
          mailPerso3: personnes[2].mailPerso,
          telDirect3: personnes[2].telephone,
          telPerso3: personnes[2].telPerso,
          mobile3: personnes[2].mobile,
          adresse3: personnes[2].adresse,
          codePostal3: personnes[2].codePostal,
          ville3: personnes[2].ville,
          pays3: personnes[2].pays
        }),
        
        // Métadonnées
        tags: contact.tags,
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        
        // Données salle (de la structure)
        salleNom: structureData.salle?.nom,
        salleAdresse: structureData.salle?.adresse,
        salleCodePostal: structureData.salle?.codePostal,
        salleVille: structureData.salle?.ville,
        salleDepartement: structureData.salle?.departement,
        salleRegion: structureData.salle?.region,
        sallePays: structureData.salle?.pays,
        salleTelephone: structureData.salle?.telephone,
        salleJauge1: structureData.salle?.jauge1,
        salleJauge2: structureData.salle?.jauge2,
        salleJauge3: structureData.salle?.jauge3,
        salleHauteur: structureData.salle?.hauteur,
        salleProfondeur: structureData.salle?.profondeur,
        salleOuverture: structureData.salle?.ouverture,
        
        // Données festival
        nomFestival: structureData.nomFestival,
        periodeFestivalMois: structureData.periodeFestivalMois,
        periodeFestivalComplete: structureData.periodeFestivalComplete
      };
      
    } else if (entityType === 'personne_libre') {
      // Pour les personnes libres : transformer les données personne vers l'ancien format
      const personneData = contact.personne || {};
      
      return {
        // Données de base
        id: contact.id,
        entityType: 'contact',
        
        // Personne
        prenom: personneData.prenom,
        nom: personneData.nom,
        fonction: personneData.fonction,
        civilite: personneData.civilite,
        
        // Emails
        email: personneData.email,
        mailDirect: personneData.email,
        mailPerso: personneData.mailPerso,
        
        // Téléphones
        telephone: personneData.telephone,
        telDirect: personneData.telDirect,
        telPerso: personneData.telPerso,
        mobile: personneData.mobile,
        fax: personneData.fax,
        
        // Adresse
        adresse: personneData.adresse,
        suiteAdresse: personneData.suiteAdresse,
        codePostal: personneData.codePostal,
        ville: personneData.ville,
        departement: personneData.departement,
        region: personneData.region,
        pays: personneData.pays,
        
        // Commentaires
        commentaires1: personneData.commentaires1,
        commentaires2: personneData.commentaires2,
        commentaires3: personneData.commentaires3,
        
        // Métadonnées
        tags: contact.tags,
        commentaires: contact.commentaires || [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      };
    }
    
    return contact;
  }, [contact, entityType]);
  
  // Logique intelligente pour choisir entre commentaires locaux et Firebase
  const commentaires = useMemo(() => {
    // Si on a une modification locale récente, l'utiliser en priorité
    if (lastLocalUpdate && extractedData?.updatedAt) {
      const firebaseTime = extractedData.updatedAt.toMillis ? extractedData.updatedAt.toMillis() : 0;
      if (lastLocalUpdate > firebaseTime) {
        console.log('[ContactViewTabs] Utilisation des commentaires locaux (plus récents)');
        return localCommentaires;
      }
    }
    
    // Sinon utiliser les données Firebase si disponibles, ou l'état local en fallback
    const result = extractedData?.commentaires || localCommentaires || [];
    console.log('[ContactViewTabs] Utilisation des commentaires Firebase/fallback:', result.length);
    return result;
  }, [localCommentaires, extractedData?.commentaires, extractedData?.updatedAt, lastLocalUpdate]);
  
  // Synchroniser les commentaires locaux avec les données du contact de manière intelligente
  useEffect(() => {
    if (extractedData?.commentaires) {
      // Seulement synchroniser si :
      // 1. L'état local est vide (premier chargement)
      // 2. OU si les données Firebase sont plus récentes que la dernière modification locale
      const shouldSync = localCommentaires.length === 0 || 
        !lastLocalUpdate || 
        (extractedData.updatedAt && extractedData.updatedAt.toMillis && extractedData.updatedAt.toMillis() > lastLocalUpdate);
      
      if (shouldSync) {
        console.log('[ContactViewTabs] Synchronisation des commentaires depuis Firebase');
        setLocalCommentaires(extractedData.commentaires);
      } else {
        console.log('[ContactViewTabs] Commentaires locaux plus récents, pas de synchronisation');
      }
    }
  }, [extractedData?.commentaires, extractedData?.updatedAt, lastLocalUpdate, localCommentaires.length]);

  // Tags disponibles (pour usage futur)
  // const availableTags = ['Festival', 'Bar', 'Salles'];
  
  // Fonctions pour gérer les tags (pour usage futur)
  // const handleAddTag = (e) => {
  //   const newTag = e.target.value;
  //   if (newTag && (!contact?.tags || !contact.tags.includes(newTag))) {
  //     console.log('Ajouter tag:', newTag, 'au contact:', id);
  //     alert(`Tag "${newTag}" ajouté (fonctionnalité de sauvegarde à implémenter)`);
  //   }
  //   e.target.value = '';
  // };
  
  const handleRemoveTag = (tagToRemove) => {
    console.log('Supprimer tag:', tagToRemove, 'du contact:', id);
    alert(`Tag "${tagToRemove}" supprimé (fonctionnalité de sauvegarde à implémenter)`);
  };

  // Déterminer le type d'entité pour adapter la configuration
  const isStructure = extractedData && (!extractedData.prenom || extractedData.entityType === 'structure');

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
        const data = extractedData || contact;
        if (!data) return null;
        
        // Utiliser le type forcé si fourni, sinon détecter automatiquement
        const hasStructureData = data.structureRaisonSociale?.trim();
        const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
        
        // Pour les structures : afficher le nom de la structure
        // Pour les personnes : afficher prénom + nom
        const displayName = isStructure 
          ? (data.structureRaisonSociale || 'Structure sans nom')
          : `${data.prenom || ''} ${data.nom || ''}`.trim() || 'Contact sans nom';

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
                {isStructure && data.structureType && (
                  <span className={styles.entityType}>{data.structureType}</span>
                )}
                {!isStructure && data.fonction && (
                  <span className={styles.entityFunction}>{data.fonction}</span>
                )}
              </div>
            </div>
            
            <div className={styles.qualificationsSection}>
              <h3 className={styles.qualificationsTitle}>
                <i className="bi bi-award"></i>
                Qualifications
              </h3>
              <div className={styles.qualificationsList}>
                {data.tags && data.tags.length > 0 ? (
                  data.tags.map((tag, index) => (
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
                {data.createdAt && (
                  <span className={styles.createdDate}>
                    <i className="bi bi-calendar-plus"></i>
                    Créé le {data.createdAt.toDate ? 
                      data.createdAt.toDate().toLocaleDateString('fr-FR') : 
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
          const data = extractedData || contact;
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = data.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          
          return (
                        <div className={styles.contactInfoCard}>
              {isStructure ? (
                // Affichage Structure - Tous les champs
                <div className={styles.infoBlock}>
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Email :</span>
                    <span className={styles.value}>
                      {data.structureEmail || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Téléphone :</span>
                    <span className={styles.value}>
                      {data.structureTelephone1 || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Téléphone 2 :</span>
                    <span className={styles.value}>
                      {data.structureTelephone2 || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Adresse :</span>
                    <span className={styles.value}>
                      {(() => {
                        const adresse = [
                          data.structureAdresse,
                          data.structureSuiteAdresse1,
                          data.structureCodePostal,
                          data.structureVille,
                          data.structureDepartement,
                          data.structureRegion,
                          data.structurePays
                        ].filter(Boolean).join(', ');
                        return adresse || <span className={styles.emptyValue}>Non renseignée</span>;
                      })()}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Site web :</span>
                    <span className={styles.value}>
                      {data.structureSiteWeb || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>SIRET :</span>
                    <span className={styles.value}>
                      {data.structureSiret || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                </div>
              ) : (
                // Affichage Personne - Tous les champs
                <div className={styles.infoBlock}>
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Email direct :</span>
                    <span className={styles.value}>
                      {data.mailDirect || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Email personnel :</span>
                    <span className={styles.value}>
                      {data.mailPerso || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Téléphone direct :</span>
                    <span className={styles.value}>
                      {data.telDirect || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Mobile :</span>
                    <span className={styles.value}>
                      {data.mobile || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Téléphone personnel :</span>
                    <span className={styles.value}>
                      {data.telPerso || <span className={styles.emptyValue}>Non renseigné</span>}
                    </span>
                  </div>
                  
                  <div className={styles.infoLine}>
                    <span className={styles.label}>Adresse :</span>
                    <span className={styles.value}>
                      {(() => {
                        const adresse = [
                          data.adresse,
                          data.suiteAdresse,
                          data.codePostal,
                          data.ville,
                          data.departement,
                          data.region,
                          data.pays
                        ].filter(Boolean).join(', ');
                        return adresse || <span className={styles.emptyValue}>Non renseignée</span>;
                      })()}
                    </span>
                  </div>
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
        actions: [
          {
            label: 'Ajouter',
            icon: 'bi bi-plus-circle',
            tooltip: 'Ajouter un tag',
            onClick: () => {
              console.log('Ouvrir modal ajout tag');
              // TODO: Ouvrir modal de sélection de tags
            }
          },
          {
            label: 'Gérer',
            icon: 'bi bi-pencil-square',
            tooltip: 'Gérer les tags',
            onClick: () => {
              console.log('Ouvrir modal gestion tags');
              // TODO: Ouvrir modal de gestion des tags
            }
          }
        ],
        render: (contact) => {
          const data = extractedData || contact;
          return (
            <div className={styles.tagsContent}>
              <div className={styles.currentTags}>
                {data?.tags && data.tags.length > 0 ? (
                  data.tags.map((tag, index) => (
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
              
              {/* Le sélecteur de tags est maintenant remplacé par les actions dans la bulle */}
            </div>
          );
        }
      },
      {
        className: 'middleLeft',
        title: (contact) => {
          const data = extractedData || contact;
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          return isStructure ? 'Personnes' : 'Structure';
        },
        icon: (contact) => {
          const data = extractedData || contact;
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          return isStructure ? 'bi bi-people' : 'bi bi-building';
        },
        actions: (contact) => {
          const data = extractedData || contact;
          const hasStructureData = data?.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          
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
          const data = extractedData || contact;
          // Utiliser le type forcé si fourni, sinon détecter automatiquement
          const hasStructureData = data.structureRaisonSociale?.trim();
          const isStructure = forcedViewType ? (forcedViewType === 'structure') : (entityType === 'structure' || hasStructureData);
          
          if (isStructure) {
            // Pour les structures, afficher les personnes avec des EntityCard
            const getPersonnes = () => {
              const personnes = [];
              
              // Personne 1
              if (data.prenom || data.nom) {
                personnes.push({
                  id: `${data.id}_personne_1`,
                  nom: `${data.prenom || ''} ${data.nom || ''}`.trim(),
                  fonction: data.fonction,
                  email: data.mailDirect || data.email,
                  telephone: data.telDirect || data.mobile
                });
              }
              
              // Personne 2  
              if (data.prenom2 || data.nom2) {
                personnes.push({
                  id: `${data.id}_personne_2`,
                  nom: `${data.prenom2 || ''} ${data.nom2 || ''}`.trim(),
                  fonction: data.fonction2,
                  email: data.mailDirect2 || data.email2,
                  telephone: data.telDirect2 || data.mobile2
                });
              }
              
              // Personne 3
              if (data.prenom3 || data.nom3) {
                personnes.push({
                  id: `${data.id}_personne_3`,
                  nom: `${data.prenom3 || ''} ${data.nom3 || ''}`.trim(),
                  fonction: data.fonction3,
                  email: data.mailDirect3 || data.email3,
                  telephone: data.telDirect3 || data.mobile3
                });
              }
              
              return personnes;
            };

            const personnes = getPersonnes();

            return (
              <div className={styles.personnesContent}>
                {personnes.length > 0 ? (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {personnes.map((personne, index) => (
                      <EntityCard
                        key={personne.id}
                        entityType="contact"
                        name={personne.nom || 'Personne sans nom'}
                        subtitle={personne.fonction || 'Contact'}
                        onClick={() => {
                          // Pour l'instant, on ne peut pas naviguer vers les personnes individuelles
                          // car elles font partie du document structure unifié
                          console.log('[ContactViewTabs] Clic sur personne:', personne);
                          // TODO: Implémenter la vue détaillée des personnes dans le contexte structure
                        }}
                        icon={<i className="bi bi-person-circle" style={{ fontSize: '1.2rem' }}></i>}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyPersonnes}>
                    <i className="bi bi-people" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                    <p>Aucune personne définie</p>
                    <small>Les personnes associées apparaîtront ici.</small>
                  </div>
                )}
              </div>
            );
          } else {
            // Pour les personnes, afficher la structure
            return (
              <div className={styles.structureContent}>
                {data.structureRaisonSociale ? (
                  <EntityCard
                    entityType="structure"
                    name={data.structureRaisonSociale}
                    subtitle={data.structureType || 'Structure'}
                    onClick={() => {
                      console.log('Visualiser structure:', data?.structureId);
                      if (data?.structureId) {
                        // Navigation vers la structure
                        navigateToEntity('structure', data.structureId, data.structureRaisonSociale);
                      } else {
                        // Si pas de structureId spécifique, on peut essayer de retrouver la structure parente
                        // dans le cas d'un document unifié de type structure
                        console.log('Tentative navigation vers structure parente');
                        // Pour les documents unifiés de type structure, l'ID pourrait être extrait
                        const originalId = data.id?.replace('unified_structure_', '');
                        if (originalId) {
                          navigateToEntity('structure', originalId, data.structureRaisonSociale);
                        }
                      }
                    }}
                    icon={<i className="bi bi-building" style={{ fontSize: '1.2rem' }}></i>}
                  />
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
        actions: [
          {
            label: 'Nouveau',
            icon: 'bi bi-plus-circle',
            tooltip: 'Nouveau commentaire',
            onClick: () => {
              openCommentModal({
                title: 'Nouveau commentaire',
                onSave: async (content) => {
                  try {
                    if (!id) throw new Error('ID du contact manquant');
                    
                    // Utiliser la collection unifiée
                    const docRef = doc(db, 'contacts_unified', id);
                    
                    // Récupérer les commentaires existants
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) throw new Error('Document non trouvé');
                    
                    const existingData = docSnap.data();
                    const existingComments = existingData.commentaires || [];
                    
                    // Créer le nouveau commentaire
                    const newComment = {
                      id: Date.now().toString(),
                      contenu: content,
                      auteur: currentUser?.displayName || currentUser?.email || 'Utilisateur inconnu',
                      date: new Date(),
                      modifie: false
                    };
                    
                    // Ajouter le nouveau commentaire à la base de données
                    await updateDoc(docRef, {
                      commentaires: [...existingComments, newComment],
                      updatedAt: serverTimestamp()
                    });
                    
                    // Mettre à jour l'état local immédiatement avec timestamp
                    const now = Date.now();
                    setLocalCommentaires([...existingComments, newComment]);
                    setLastLocalUpdate(now);
                    
                    console.log('Commentaire enregistré avec succès', { localUpdate: now });
                  } catch (error) {
                    console.error('Erreur lors de la sauvegarde du commentaire:', error);
                    alert(`Erreur: ${error.message}`);
                  }
                }
              });
            }
          }
        ],
        render: (contact) => {
          
          return (
            <div className={styles.commentsContent}>
              {commentaires.length > 0 ? (
                <div className={styles.commentsList}>
                  {commentaires.map((commentaire) => (
                    <div key={commentaire.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <div className={styles.commentAuthor}>
                          <i className="bi bi-person-circle"></i>
                          <span>{commentaire.auteur}</span>
                        </div>
                        <div className={styles.commentDate}>
                          <i className="bi bi-calendar3"></i>
                          <span>
                            {commentaire.date?.toDate ? 
                              commentaire.date.toDate().toLocaleDateString('fr-FR') : 
                              new Date(commentaire.date).toLocaleDateString('fr-FR')
                            }
                          </span>
                          {commentaire.modifie && (
                            <i className="bi bi-pencil-fill" title="Modifié"></i>
                          )}
                        </div>
                      </div>
                      <div className={styles.commentContent}>
                        {commentaire.contenu}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyComments}>
                  <i className="bi bi-chat-quote" style={{ fontSize: '2rem', color: 'var(--tc-text-secondary)' }}></i>
                  <p>Aucun commentaire</p>
                  <small>Cliquez sur + pour ajouter votre premier commentaire</small>
                </div>
              )}
            </div>
          );
        }
      },
    ],

    renderBottomTabContent: (activeBottomTab) => {
      const data = extractedData;
      switch (activeBottomTab) {
        case 'diffusion':
          return (
            <div className={styles.tabContent}>
              <div className={styles.metadataSection}>
                <h3><i className="bi bi-broadcast"></i> Informations de diffusion</h3>
                <div className={styles.metadataGrid}>
                  {data?.nomFestival && (
                    <div className={styles.metadataItem}>
                      <strong>Nom du festival:</strong>
                      <span>{data.nomFestival}</span>
                    </div>
                  )}
                  {data?.periodeFestivalMois && (
                    <div className={styles.metadataItem}>
                      <strong>Période (mois):</strong>
                      <span>{data.periodeFestivalMois}</span>
                    </div>
                  )}
                  {data?.periodeFestivalComplete && (
                    <div className={styles.metadataItem}>
                      <strong>Période complète:</strong>
                      <span>{data.periodeFestivalComplete}</span>
                    </div>
                  )}
                  {data?.bouclage && (
                    <div className={styles.metadataItem}>
                      <strong>Bouclage:</strong>
                      <span>{data.bouclage}</span>
                    </div>
                  )}
                  {data?.diffusionCommentaires1 && (
                    <div className={styles.metadataItem}>
                      <strong>Commentaires:</strong>
                      <span>{data.diffusionCommentaires1}</span>
                    </div>
                  )}
                </div>
                {!data?.nomFestival && !data?.periodeFestivalMois && (
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
                  {data?.salleNom && (
                    <div className={styles.metadataItem}>
                      <strong>Nom de la salle:</strong>
                      <span>{data.salleNom}</span>
                    </div>
                  )}
                  {(data?.salleAdresse || data?.salleVille) && (
                    <div className={styles.metadataItem}>
                      <strong>Adresse:</strong>
                      <span>
                        {[
                          data.salleAdresse,
                          data.salleSuiteAdresse,
                          data.salleCodePostal,
                          data.salleVille,
                          data.salleDepartement,
                          data.salleRegion,
                          data.sallePays
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {data?.salleTelephone && (
                    <div className={styles.metadataItem}>
                      <strong>Téléphone:</strong>
                      <span>{data.salleTelephone}</span>
                    </div>
                  )}
                  {(data?.salleJauge1 || data?.salleJauge2 || data?.salleJauge3) && (
                    <div className={styles.metadataItem}>
                      <strong>Jauges:</strong>
                      <span>
                        {[data.salleJauge1, data.salleJauge2, data.salleJauge3]
                          .filter(Boolean)
                          .join(' / ')}
                      </span>
                    </div>
                  )}
                  {data?.salleOuverture && (
                    <div className={styles.metadataItem}>
                      <strong>Ouverture:</strong>
                      <span>{data.salleOuverture}</span>
                    </div>
                  )}
                  {data?.salleProfondeur && (
                    <div className={styles.metadataItem}>
                      <strong>Profondeur:</strong>
                      <span>{data.salleProfondeur}</span>
                    </div>
                  )}
                  {data?.salleHauteur && (
                    <div className={styles.metadataItem}>
                      <strong>Hauteur:</strong>
                      <span>{data.salleHauteur}</span>
                    </div>
                  )}
                </div>
                {!data?.salleNom && !data?.salleAdresse && (
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
                concerts={data?.concertsIds || []} 
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
      entity={extractedData}
      loading={loading}
      error={error}
      entityType="contact"
      config={config}
    />
  );
}

export default ContactViewTabs;