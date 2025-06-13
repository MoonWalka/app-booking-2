import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSafeRelations from '../../hooks/common/useSafeRelations';
import { getEntityConfig, getNestedValue } from '@/config/entityConfigurations';
import Card from '../ui/Card';
import FormHeader from '../ui/FormHeader';
import LoadingSpinner from '../ui/LoadingSpinner';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import RelationCard from './RelationCard';
import styles from './GenericDetailView.module.css';

/**
 * Composant générique pour afficher les détails d'une entité
 * Utilise la configuration centralisée pour déterminer l'affichage
 * 
 * @param {string} entityType - Type de l'entité (artiste, lieu, concert, etc.)
 * @param {Object} customSections - Sections personnalisées (optionnel)
 * @param {Function} onEdit - Fonction appelée lors du clic sur Modifier
 * @param {Function} onDelete - Fonction appelée lors du clic sur Supprimer
 */
const GenericDetailView = ({ 
  entityType, 
  customSections = null,
  onEdit,
  onDelete,
  depth = 1
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Charger les données avec le hook sécurisé (doit être avant tout return)
  const { data: entity, loading, error } = useSafeRelations(entityType, id, depth, {
    includeRelations: true,
    maxRelationsPerType: 10
  });
  
  // Log pour debug
  useEffect(() => {
    console.log(`🎯 GenericDetailView - ${entityType}`, { id, entity, loading, error });
    if (entity && entityType === 'lieu') {
      console.log('📍 Lieu data:', {
        contactsAssocies: entity.contactsAssocies,
        contacts: entity.contacts,
        concerts: entity.concerts,
        presentation: entity.presentation,
        description: entity.description,
        allFields: Object.keys(entity)
      });
    }
    
    if (entity && entityType === 'structure') {
      console.log('🏢 Structure data:', {
        contacts: entity.contacts,
        contactIds: entity.contactIds, // Format harmonisé
        concerts: entity.concerts,
        concertsIds: entity.concertsIds,
        allFields: Object.keys(entity),
        fullData: entity
      });
    }
  }, [entityType, id, entity, loading, error]);
  
  // Récupérer la configuration de l'entité
  const config = getEntityConfig(entityType);
  
  if (!config) {
    console.error(`Configuration non trouvée pour le type: ${entityType}`);
    return <Alert type="error">Configuration manquante pour ce type d'entité</Alert>;
  }
  
  // Gestion des états
  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner message={`Chargement ${config.title.toLowerCase()}...`} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="page-container">
        <Alert type="error">
          Erreur lors du chargement : {error.message}
        </Alert>
      </div>
    );
  }
  
  if (!entity) {
    return (
      <div className="page-container">
        <Alert type="warning">
          {config.title} non trouvé
        </Alert>
      </div>
    );
  }
  
  // Préparer les données du header
  const getMainFieldValue = (field) => {
    if (typeof field === 'function') {
      return field(entity);
    }
    return getNestedValue(entity, field);
  };
  
  const title = getMainFieldValue(config.mainFields.title) || 'Sans nom';
  const subtitle = config.mainFields.subtitle ? getMainFieldValue(config.mainFields.subtitle) : '';
  const badge = config.mainFields.badge ? getMainFieldValue(config.mainFields.badge) : null;
  
  // Actions par défaut
  const defaultActions = [
    <button
      key="back"
      className="btn btn-secondary"
      onClick={() => navigate(`/${entityType}s`)}
    >
      <i className="bi bi-arrow-left me-2"></i>
      Retour
    </button>
  ];
  
  if (onEdit) {
    defaultActions.push(
      <button
        key="edit"
        className="btn btn-primary"
        onClick={() => onEdit(entity)}
      >
        <i className="bi bi-pencil me-2"></i>
        Modifier
      </button>
    );
  }
  
  if (onDelete) {
    defaultActions.push(
      <button
        key="delete"
        className="btn btn-danger"
        onClick={() => onDelete(entity)}
      >
        <i className="bi bi-trash me-2"></i>
        Supprimer
      </button>
    );
  }
  
  // Utiliser les sections personnalisées ou celles de la config
  const sections = customSections || config.sections;
  
  return (
    <div className={styles.genericDetailView}>
      <FormHeader
        title={title}
        icon={<i className={`bi ${config.icon}`}></i>}
        subtitle={subtitle}
        actions={defaultActions}
      />
      
      {badge && (
        <div className={styles.badgeContainer}>
          <Badge variant={badge === 'confirme' ? 'success' : 'warning'}>
            {badge}
          </Badge>
        </div>
      )}
      
      {/* Rendre chaque section */}
      {sections.map(section => (
        <DetailSection
          key={section.id}
          section={section}
          entity={entity}
          navigate={navigate}
        />
      ))}
    </div>
  );
};

/**
 * Composant pour rendre une section selon son type
 */
const DetailSection = ({ section, entity, navigate }) => {
  const renderSectionContent = () => {
    // Si la section a un renderer personnalisé, l'utiliser
    if (section.customRenderer) {
      const CustomComponent = section.customRenderer;
      return <CustomComponent entity={entity} section={section} navigate={navigate} />;
    }
    
    switch (section.type) {
      case 'info':
        return <InfoSection section={section} entity={entity} />;
      
      case 'text':
        return <TextSection section={section} entity={entity} />;
      
      case 'address':
        return <AddressSection section={section} entity={entity} />;
      
      case 'relations':
        return <RelationsSection section={section} entity={entity} navigate={navigate} />;
      
      default:
        console.warn(`Type de section non supporté: ${section.type}`);
        return null;
    }
  };
  
  const content = renderSectionContent();
  
  if (!content) return null;
  
  return (
    <Card className={`${styles.detailSection} ${section.className || ''}`}>
      <h3 className={styles.sectionTitle}>
        <i className={`bi ${section.icon} me-2`}></i>
        {section.title}
      </h3>
      {content}
    </Card>
  );
};

/**
 * Section pour afficher des informations sous forme de grille
 */
const InfoSection = ({ section, entity }) => {
  const hasAnyValue = section.fields.some(field => getNestedValue(entity, field.key));
  
  if (!hasAnyValue) {
    return <p className={styles.textMuted}>Aucune information disponible</p>;
  }
  
  return (
    <div className={styles.infoGrid}>
      {section.fields.map(field => {
        const value = getNestedValue(entity, field.key);
        
        if (!value) return null;
        
        return (
          <div key={field.key} className={styles.infoItem}>
            <label>{field.label}</label>
            <p>
              {field.type === 'email' && (
                <a href={`mailto:${value}`}>{value}</a>
              )}
              {field.type === 'phone' && (
                <a href={`tel:${value}`}>{value}</a>
              )}
              {field.type === 'url' && (
                <a href={value} target="_blank" rel="noopener noreferrer">
                  {value}
                </a>
              )}
              {field.type === 'date' && (
                new Date(value).toLocaleDateString('fr-FR')
              )}
              {field.type === 'badge' && (
                <div>
                  <Badge variant={value === 'confirme' ? 'success' : 'warning'}>
                    {value}
                  </Badge>
                </div>
              )}
              {!['email', 'phone', 'url', 'date', 'badge'].includes(field.type) && (
                <>
                  {value}
                  {field.suffix}
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Section pour afficher du texte long
 */
const TextSection = ({ section, entity }) => {
  let text = getNestedValue(entity, section.field);
  
  // Si le champ principal n'existe pas, essayer des alternatives
  if (!text && section.alternativeFields) {
    for (const altField of section.alternativeFields) {
      text = getNestedValue(entity, altField);
      if (text) break;
    }
  }
  
  if (!text) {
    return <p className={styles.textMuted}>Non renseigné</p>;
  }
  
  return (
    <div className={styles.textContent}>
      {text.split('\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
};

/**
 * Section pour afficher une adresse
 */
const AddressSection = ({ section, entity }) => {
  const hasAddress = section.fields.some(field => getNestedValue(entity, field.key));
  
  if (!hasAddress) {
    return <p className={styles.textMuted}>Adresse non renseignée</p>;
  }
  
  return (
    <div className={styles.addressContent}>
      {section.fields.map(field => {
        const value = getNestedValue(entity, field.key);
        if (!value) return null;
        
        return (
          <div key={field.key}>
            {value}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Section pour afficher des relations
 */
const RelationsSection = ({ section, entity, navigate }) => {
  const relations = entity[section.relation];
  
  console.log(`🔗 RelationsSection - ${section.relation}:`, {
    relations,
    isArray: Array.isArray(relations),
    length: Array.isArray(relations) ? relations.length : 'N/A',
    section,
    entity: entity
  });
  
  if (!relations || (Array.isArray(relations) && relations.length === 0)) {
    return (
      <p className={styles.textMuted}>
        {section.emptyMessage || 'Aucune relation'}
      </p>
    );
  }
  
  // Relation unique
  if (section.single || !Array.isArray(relations)) {
    const relation = Array.isArray(relations) ? relations[0] : relations;
    return (
      <RelationCard
        entity={relation}
        type={section.relation}
        showBadge={false}
      />
    );
  }
  
  // Relations multiples
  const displayType = section.displayType || 'cards';
  const maxItems = section.maxItems || 10;
  const itemsToShow = relations.slice(0, maxItems);
  const hasMore = relations.length > maxItems;
  
  return (
    <>
      <div className={displayType === 'cards' ? styles.relationsGrid : styles.relationsList}>
        {itemsToShow.map(relation => (
          <RelationCard
            key={relation.id}
            entity={relation}
            type={section.relation.slice(0, -1)} // Enlever le 's' final
            className={displayType === 'list' ? 'compact' : ''}
          />
        ))}
      </div>
      
      {hasMore && (
        <p className={styles.moreItems}>
          + {relations.length - maxItems} autres {section.title.toLowerCase()}
        </p>
      )}
    </>
  );
};

export default GenericDetailView;