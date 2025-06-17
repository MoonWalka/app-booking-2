import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStructureDetails } from '@/hooks/structures';
import Button from '@/components/ui/Button';
import ContactEntityTable from '@/components/contacts/ContactEntityTable';
import EntityViewTabs from '@/components/common/EntityViewTabs';
import styles from './StructureViewTabs.module.css';

const StructureViewTabs = ({ id: propId }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  
  // Utiliser l'ID passé en prop ou celui des params
  const id = propId || paramId;
  
  const {
    structure,
    loading,
    error,
    contacts,
    concerts,
    lieux
  } = useStructureDetails(id);

  // Tags disponibles
  const availableTags = ['Festival', 'Bar', 'Salles'];
  
  // Fonctions pour gérer les tags
  const handleAddTag = (e) => {
    const newTag = e.target.value;
    if (newTag && (!structure?.tags || !structure.tags.includes(newTag))) {
      console.log('Ajouter tag:', newTag, 'à la structure:', id);
      alert(`Tag "${newTag}" ajouté (fonctionnalité de sauvegarde à implémenter)`);
    }
    e.target.value = '';
  };
  
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
            onAdd={() => navigate('/contacts/nouveau')}
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
            onAdd={() => navigate('/lieux/nouveau')}
            {...commonTableProps}
          />
        );

      case 'diffusion':
        return (
          <ContactEntityTable
            title="Concerts"
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
                onClick: (item) => navigate(`/concerts/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau concert"
            onAdd={() => navigate('/concerts/nouveau')}
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
              { key: 'propositionArtistique', label: 'Proposition artistique' },
              { key: 'ville', label: 'Ville' },
              { key: 'priseOption', label: 'Prise d\'option' },
              { key: 'dateDebut', label: 'Début' },
              { key: 'dateFin', label: 'Fin' },
              { key: 'montant', label: 'Montant' }
            ]}
            actions={[
              { 
                label: 'Formulaire', 
                onClick: (item) => navigate(`/concerts/${item.id}/formulaire`),
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
            onAdd={() => navigate('/concerts/nouveau')}
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
              { key: 'concert', label: 'Concert' },
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
            onAdd={() => navigate('/contrats/nouveau')}
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
              { key: 'concert', label: 'Concert' },
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
            onAdd={() => navigate('/factures/nouveau')}
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

          return (
            <div className={styles.structureInfo}>
              <h2>{structure.nom || 'Structure sans nom'}</h2>
              <p><strong>Type:</strong> {formatField(structure.type) || 'Non spécifié'}</p>
              {structure.email && <p><strong>Email:</strong> {formatField(structure.email)}</p>}
              {structure.telephone && <p><strong>Téléphone:</strong> {formatField(structure.telephone)}</p>}
              {structure.adresse && <p><strong>Adresse:</strong> {formatAdresse(structure.adresse)}</p>}
            </div>
          );
        }
      },
      {
        className: 'topRight',
        title: 'Tags',
        icon: 'bi bi-tags',
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
            
            <div className={styles.tagSelector}>
              <select 
                className={styles.tagSelect}
                onChange={handleAddTag}
                value=""
              >
                <option value="">Ajouter un tag...</option>
                {availableTags
                  .filter(tag => !structure?.tags?.includes(tag))
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
          <div className={styles.personsList}>
            {contacts?.slice(0, 3).map((contact, index) => (
              <div key={contact.id || index} className={styles.personItem}>
                <div className={styles.personInfo}>
                  <span className={styles.personName}>
                    {contact.nom} {contact.prenom}
                  </span>
                  <span className={styles.personEmail}>{contact.email}</span>
                </div>
                <div className={styles.personActions}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handlePersonAction('modifier', contact.id)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handlePersonAction('supprimer', contact.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
            {(!contacts || contacts.length === 0) && (
              <p className={styles.emptyMessage}>Aucune personne associée</p>
            )}
          </div>
        )
      },
      {
        className: 'middleRight',
        title: 'Commentaires',
        icon: 'bi bi-chat-quote',
        render: (structure) => (
          <div className={styles.commentsContent}>
            <textarea
              className={styles.commentsTextarea}
              placeholder="Ajoutez vos notes et commentaires sur cette structure..."
              defaultValue={structure?.notes || ''}
              rows={6}
              onChange={(e) => {
                console.log('Notes modifiées:', e.target.value);
                // TODO: Implémenter la sauvegarde des notes
              }}
            />
          </div>
        )
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