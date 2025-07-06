import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStructureDetails } from '@/hooks/structures';
import { useContactModals } from '@/context/ContactModalsContext';
import { useTabs } from '@/context/TabsContext';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import ContactEntityTable from '@/components/contacts/ContactEntityTable';
import EntityViewTabs from '@/components/common/EntityViewTabs';
import styles from './StructureViewTabs.module.css';

const StructureViewTabs = ({ id: propId }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { openCommentModal } = useContactModals();
  const { openContactTab, openDateCreationTab } = useTabs();
  const { currentUser } = useAuth();
  
  // Utiliser l'ID passé en prop ou celui des params
  const id = propId || paramId;
  
  // État pour l'affichage progressif
  const [showAllDetails, setShowAllDetails] = useState(false);
  
  // État local pour les commentaires
  const [localCommentaires, setLocalCommentaires] = useState([]);
  const [lastLocalUpdate, setLastLocalUpdate] = useState(null);
  
  const {
    structure,
    loading,
    error,
    contacts,
    concerts,
    lieux
  } = useStructureDetails(id);
  
  // Logique intelligente pour choisir entre commentaires locaux et Firebase
  const commentaires = useMemo(() => {
    // Si on a une modification locale récente, l'utiliser en priorité
    if (lastLocalUpdate && structure?.updatedAt) {
      const firebaseTime = structure.updatedAt.toMillis ? structure.updatedAt.toMillis() : 0;
      if (lastLocalUpdate > firebaseTime) {
        console.log('[StructureViewTabs] Utilisation des commentaires locaux (plus récents)');
        return localCommentaires;
      }
    }
    
    // Sinon utiliser les données Firebase si disponibles, ou l'état local en fallback
    const result = structure?.commentaires || localCommentaires || [];
    console.log('[StructureViewTabs] Utilisation des commentaires Firebase/fallback:', result.length);
    return result;
  }, [localCommentaires, structure?.commentaires, structure?.updatedAt, lastLocalUpdate]);
  
  // Synchroniser les commentaires locaux avec les données de la structure de manière intelligente
  useEffect(() => {
    if (structure?.commentaires) {
      // Seulement synchroniser si :
      // 1. L'état local est vide (premier chargement)
      // 2. OU si les données Firebase sont plus récentes que la dernière modification locale
      const shouldSync = localCommentaires.length === 0 || 
        !lastLocalUpdate || 
        (structure.updatedAt && structure.updatedAt.toMillis && structure.updatedAt.toMillis() > lastLocalUpdate);
      
      if (shouldSync) {
        console.log('[StructureViewTabs] Synchronisation des commentaires depuis Firebase');
        setLocalCommentaires(structure.commentaires);
      } else {
        console.log('[StructureViewTabs] Commentaires locaux plus récents, pas de synchronisation');
      }
    }
  }, [structure?.commentaires, structure?.updatedAt, lastLocalUpdate, localCommentaires.length]);

  // Tags disponibles (pour usage futur)
  // const availableTags = ['Festival', 'Bar', 'Salles'];
  
  // Fonctions pour gérer les tags (pour usage futur)
  // const handleAddTag = (e) => {
  //   const newTag = e.target.value;
  //   if (newTag && (!structure?.tags || !structure.tags.includes(newTag))) {
  //     console.log('Ajouter tag:', newTag, 'à la structure:', id);
  //     alert(`Tag "${newTag}" ajouté (fonctionnalité de sauvegarde à implémenter)`);
  //   }
  //   e.target.value = '';
  // };
  
  const handleRemoveTag = (tagToRemove) => {
    console.log('Supprimer tag:', tagToRemove, 'de la structure:', id);
    alert(`Tag "${tagToRemove}" supprimé (fonctionnalité de sauvegarde à implémenter)`);
  };

  // Gestionnaire de navigation vers une personne
  const handlePersonAction = (action, personId) => {
    if (action === 'modifier' && personId) {
      navigate(`/contacts/${personId}/edit`);
    } else if (action === 'supprimer' && personId) {
      console.log('Supprimer personne:', personId);
    }
  };

  const renderBottomContent = (activeBottomTab) => {
    const commonTableProps = {
      showHeader: true,
      itemsPerPage: 5
    };

    switch (activeBottomTab) {
      case 'correspondance':
        return (
          <ContactEntityTable
            title="Correspondance"
            data={contacts || []}
            columns={[
              { key: 'nom', label: 'Nom' },
              { key: 'prenom', label: 'Prénom' },
              { key: 'email', label: 'Email' },
              { key: 'telephone', label: 'Téléphone' }
            ]}
            actions={[
              { 
                label: 'Modifier', 
                onClick: (item) => handlePersonAction('modifier', item.id),
                variant: 'outline-primary',
                size: 'sm'
              },
              { 
                label: 'Supprimer', 
                onClick: (item) => handlePersonAction('supprimer', item.id),
                variant: 'outline-danger',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau contact"
            onAddClick={() => navigate('/contacts/nouveau')}
            {...commonTableProps}
          />
        );

      case 'lieux':
        return (
          <ContactEntityTable
            title="Lieux"
            data={lieux || []}
            columns={[
              { key: 'nom', label: 'Nom' },
              { key: 'ville', label: 'Ville' },
              { key: 'type', label: 'Type' },
              { key: 'capacite', label: 'Capacité' }
            ]}
            actions={[
              { 
                label: 'Voir', 
                onClick: (item) => navigate(`/lieux/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau lieu"
            onAddClick={() => navigate('/lieux/nouveau')}
            {...commonTableProps}
          />
        );

      case 'diffusion':
        return (
          <ContactEntityTable
            title="Dates"
            data={concerts || []}
            columns={[
              { key: 'titre', label: 'Titre' },
              { key: 'date', label: 'Date' },
              { key: 'lieu', label: 'Lieu' },
              { key: 'statut', label: 'Statut' }
            ]}
            actions={[
              { 
                label: 'Voir', 
                onClick: (item) => navigate(`/dates/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau concert"
            onAddClick={() => navigate('/dates/nouveau')}
            {...commonTableProps}
          />
        );

      case 'dates':
        return (
          <ContactEntityTable
            title="Dates"
            data={concerts || []}
            columns={[
              { key: 'artiste', label: 'Artiste' },
              { key: 'propositionArtistique', label: 'Projet' },
              { key: 'ville', label: 'Ville' },
              { key: 'priseOption', label: 'Prise d\'option' },
              { key: 'dateDebut', label: 'Début' },
              { key: 'dateFin', label: 'Fin' },
              { key: 'montant', label: 'Montant' }
            ]}
            actions={[
              { 
                label: 'Formulaire', 
                onClick: (item) => navigate(`/dates/${item.id}/formulaire`),
                variant: 'outline-success',
                size: 'sm'
              },
              { 
                label: 'Contrat', 
                onClick: (item) => navigate(`/contrats/generate/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              },
              { 
                label: 'Facture', 
                onClick: (item) => navigate(`/factures/generate/${item.id}`),
                variant: 'outline-warning',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouvelle date"
            onAddClick={() => {
              console.log('🎯 onAddClick appelé pour dates!', { structureId: structure?.id || id, structureName: structure?.nom || structure?.structureRaisonSociale || 'Structure' });
              openDateCreationTab({
                structureId: structure?.id || id,
                structureName: structure?.nom || structure?.structureRaisonSociale || 'Structure'
              });
            }}
            {...commonTableProps}
          />
        );

      case 'contrats':
        return (
          <ContactEntityTable
            title="Contrats"
            data={[]}
            columns={[
              { key: 'numero', label: 'Numéro' },
              { key: 'concert', label: 'Date' },
              { key: 'statut', label: 'Statut' },
              { key: 'dateCreation', label: 'Date création' }
            ]}
            actions={[
              { 
                label: 'Voir', 
                onClick: (item) => navigate(`/contrats/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau contrat"
            onAddClick={() => navigate('/contrats/nouveau')}
            {...commonTableProps}
          />
        );

      case 'factures':
        return (
          <ContactEntityTable
            title="Factures"
            data={[]}
            columns={[
              { key: 'numero', label: 'Numéro' },
              { key: 'concert', label: 'Date' },
              { key: 'montant', label: 'Montant' },
              { key: 'statut', label: 'Statut' }
            ]}
            actions={[
              { 
                label: 'Voir', 
                onClick: (item) => navigate(`/factures/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouvelle facture"
            onAddClick={() => navigate('/factures/nouveau')}
            {...commonTableProps}
          />
        );

      default:
        return <div>Contenu à venir</div>;
    }
  };

  // Configuration pour le composant générique
  const config = {
    defaultBottomTab: 'correspondance',
    notFoundIcon: 'bi-building-x',
    notFoundTitle: 'Structure non trouvée',
    notFoundMessage: 'La structure demandée n\'existe pas ou n\'est plus disponible.',
    
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
        title: 'Info générale',
        icon: 'bi bi-building',
        render: (structure) => {
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

          // Fonction pour formater n'importe quel champ qui pourrait être un objet
          const formatField = (field) => {
            if (typeof field === 'string') return field;
            if (typeof field === 'object' && field) {
              return JSON.stringify(field);
            }
            return field;
          };

          // Logique d'affichage progressif pour réduire la densité
          const getEssentialDetails = () => {
            const details = [];
            
            if (structure.nom) {
              details.push({
                icon: 'bi bi-building',
                content: <strong>{structure.nom}</strong>,
                priority: 1
              });
            }
            
            if (structure.email) {
              details.push({
                icon: 'bi bi-envelope',
                content: formatField(structure.email),
                priority: 2
              });
            }
            
            if (structure.telephone) {
              details.push({
                icon: 'bi bi-telephone',
                content: formatField(structure.telephone),
                priority: 3
              });
            }
            
            if (structure.type) {
              details.push({
                icon: 'bi bi-tag',
                content: `Type: ${formatField(structure.type)}`,
                priority: 4
              });
            }
            
            return details;
          };
          
          const getSecondaryDetails = () => {
            const details = [];
            
            if (structure.adresse) {
              details.push({
                icon: 'bi bi-geo-alt',
                content: formatAdresse(structure.adresse),
              });
            }
            
            if (structure.siret) {
              details.push({
                icon: 'bi bi-building-gear',
                content: `SIRET: ${structure.siret}`,
              });
            }
            
            if (structure.secteur) {
              details.push({
                icon: 'bi bi-diagram-3',
                content: `Secteur: ${structure.secteur}`,
              });
            }
            
            return details;
          };

          const essentialDetails = getEssentialDetails();
          const secondaryDetails = getSecondaryDetails();
          const hasSecondaryDetails = secondaryDetails.length > 0;

          return (
            <div className={styles.contactDetails}>
              {/* Informations essentielles (toujours affichées) */}
              {essentialDetails.map((detail, index) => (
                <div key={`essential-${index}`} className={styles.detailItem}>
                  <i className={detail.icon}></i>
                  <span>{detail.content}</span>
                </div>
              ))}
              
              {/* Informations secondaires (affichées selon l'état) */}
              {showAllDetails && secondaryDetails.map((detail, index) => (
                <div key={`secondary-${index}`} className={styles.detailItem}>
                  <i className={detail.icon}></i>
                  <span>{detail.content}</span>
                </div>
              ))}
              
              {/* Bouton pour afficher/masquer les détails supplémentaires */}
              {hasSecondaryDetails && (
                <button 
                  className={styles.toggleDetailsBtn}
                  onClick={() => setShowAllDetails(!showAllDetails)}
                >
                  <i className={`bi bi-chevron-${showAllDetails ? 'up' : 'down'}`}></i>
                  <span>{showAllDetails ? 'Moins de détails' : `${secondaryDetails.length} détail${secondaryDetails.length > 1 ? 's' : ''} supplémentaire${secondaryDetails.length > 1 ? 's' : ''}`}</span>
                </button>
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
              console.log('Ouvrir modal ajout tag structure');
              // TODO: Ouvrir modal de sélection de tags
            }
          },
          {
            label: 'Gérer',
            icon: 'bi bi-pencil-square',
            tooltip: 'Gérer les tags',
            onClick: () => {
              console.log('Ouvrir modal gestion tags structure');
              // TODO: Ouvrir modal de gestion des tags
            }
          }
        ],
        render: (structure) => (
          <div className={styles.tagsContent}>
            <div className={styles.currentTags}>
              {structure?.tags && structure.tags.length > 0 ? (
                structure.tags.map((tag, index) => (
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
        )
      },
      {
        className: 'middleLeft',
        title: 'Contact principal',
        icon: 'bi bi-person-circle',
        render: () => {
          // Prendre le premier contact comme contact principal
          const mainContact = contacts?.[0];
          
          console.log('[DEBUG StructureViewTabs] Contacts disponibles:', contacts?.length || 0);
          console.log('[DEBUG StructureViewTabs] Premier contact:', mainContact);
          console.log('[DEBUG StructureViewTabs] Loading:', loading);
          
          return (
            <div className={styles.contactContent}>
              {loading ? (
                <div className={styles.loadingContact}>
                  <i className="bi bi-person-circle" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                  <p>Chargement du contact...</p>
                </div>
              ) : mainContact ? (
                <div className={styles.contactBusinessCard}>
                  <div className={styles.businessCardHeader}>
                    <div className={styles.businessCardTitle}>
                      <i className="bi bi-person-circle"></i>
                      <span className={styles.contactName}>
                        {`${mainContact.prenom || ''} ${mainContact.nom || ''}`.trim() || 'Contact'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.businessCardBody}>
                    <div className={styles.businessCardContent}>
                      {mainContact.fonction && (
                        <div className={styles.businessCardInfo}>
                          <i className="bi bi-briefcase"></i>
                          <span>{mainContact.fonction}</span>
                        </div>
                      )}
                      
                      {mainContact.email && (
                        <div className={styles.businessCardInfo}>
                          <i className="bi bi-envelope"></i>
                          <span>{mainContact.email}</span>
                        </div>
                      )}
                      
                      {mainContact.telephone && (
                        <div className={styles.businessCardInfo}>
                          <i className="bi bi-telephone"></i>
                          <span>{mainContact.telephone}</span>
                        </div>
                      )}
                      
                      {mainContact.ville && (
                        <div className={styles.businessCardInfo}>
                          <i className="bi bi-geo-alt"></i>
                          <span>{mainContact.ville}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.businessCardActions}>
                      <button
                        className={styles.actionButton}
                        onClick={() => {
                          console.log('Modifier contact');
                          // TODO: Ouvrir modal de modification
                        }}
                        title="Modifier ce contact"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      
                      <button
                        className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                        onClick={() => {
                          console.log('Détacher contact de la structure');
                          // TODO: Implémenter la dissociation
                        }}
                        title="Détacher ce contact"
                      >
                        <i className="bi bi-arrow-up-right text-danger"></i>
                      </button>
                      
                      <button
                        className={styles.actionButton}
                        onClick={() => {
                          console.log('Visualiser contact:', mainContact?.id);
                          if (mainContact?.id) {
                            // Ouvrir le contact dans un nouvel onglet
                            const contactName = `${mainContact.prenom || ''} ${mainContact.nom || ''}`.trim() || 'Contact';
                            openContactTab(mainContact.id, contactName);
                          }
                        }}
                        title="Visualiser ce contact"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      
                      <button
                        className={styles.actionButton}
                        onClick={() => {
                          console.log('Commentaires sur contact');
                          // TODO: Ouvrir panel commentaires
                        }}
                        title="Commentaires sur ce contact"
                      >
                        <i className="bi bi-chat-dots"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyContact}>
                  <i className="bi bi-person-circle" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                  <p>Aucun contact principal</p>
                  <small>Les informations du contact principal apparaîtront ici.</small>
                </div>
              )}
            </div>
          );
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
                    if (!id) throw new Error('ID de la structure manquant');
                    
                    const docRef = doc(db, 'structures', id);
                    
                    // Récupérer les commentaires existants
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) throw new Error('Structure non trouvée');
                    
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
                    
                    // Ajouter le nouveau commentaire
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
        render: (structure) => {
          
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
      }
    ],

    renderBottomTabContent: renderBottomContent
  };

  return (
    <EntityViewTabs
      entity={structure}
      loading={loading}
      error={error}
      entityType="structure"
      config={config}
    />
  );
};

export default StructureViewTabs;