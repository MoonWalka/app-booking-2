import React from 'react';
import EntityCard from '@/components/ui/EntityCard';
import { formatActivityTags, getPersonDisplayType } from '@/utils/contactUtils';
import styles from '../ContactViewTabs.module.css';

/**
 * Section d'affichage et de gestion des personnes associées à une structure
 * Ou de la structure associée à une personne
 */
function ContactPersonsSection({ 
  isStructure,
  personnes = [],
  structureData,
  onEditPerson,
  onDissociatePerson,
  onOpenPersonFiche,
  onAddCommentToPerson,
  navigateToEntity,
  onEditStructure,
  onOpenStructureFiche,
  onAddCommentToStructure
}) {
  if (isStructure) {
    // Pour les structures, afficher les personnes associées
    return (
      <div className={styles.personnesContent}>
        {personnes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '100%', overflowY: 'auto' }}>
            {personnes.map((personne) => {
              const displayName = `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne sans nom';
              
              return (
                <EntityCard
                  key={personne.id}
                  entityType="contact"
                  name={displayName}
                  subtitle={(() => {
                    // Afficher les tags d'activité, ou la fonction, ou "Indépendant"
                    const tags = personne.tags || [];
                    const activityDisplay = getPersonDisplayType({ tags });
                    
                    if (activityDisplay !== 'Indépendant') {
                      return activityDisplay; // Tags d'activité
                    } else if (personne.fonction) {
                      return personne.fonction; // Fonction si définie
                    } else {
                      return 'Indépendant'; // Par défaut
                    }
                  })()}
                  onClick={() => {
                    console.log('[ContactPersonsSection] Clic sur personne:', personne);
                  }}
                  icon={<i className="bi bi-person-circle" style={{ fontSize: '1.2rem' }}></i>}
                  compact={true}
                  actions={[
                    {
                      icon: 'bi-eye',
                      label: 'Ouvrir',
                      tooltip: 'Ouvrir la fiche',
                      variant: 'Primary',
                      onClick: () => onOpenPersonFiche(personne)
                    },
                    {
                      icon: 'bi-pencil',
                      label: 'Modifier',
                      tooltip: 'Modifier cette personne',
                      variant: 'Secondary',
                      onClick: () => onEditPerson(personne)
                    },
                    {
                      icon: 'bi-chat-quote',
                      label: 'Commentaire',
                      tooltip: 'Ajouter un commentaire',
                      variant: 'Secondary',
                      onClick: () => onAddCommentToPerson(personne)
                    },
                    {
                      icon: 'bi-link-45deg',
                      label: 'Dissocier',
                      tooltip: 'Dissocier de la structure',
                      variant: 'Warning',
                      onClick: () => onDissociatePerson(personne)
                    }
                  ]}
                />
              );
            })}
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
    // Pour les personnes, afficher la structure associée - VERSION ENRICHIE
    return (
      <div className={styles.structureContent}>
        {structureData?.structureRaisonSociale ? (
          <div style={{ maxWidth: '350px' }}>
            <EntityCard
            entityType="structure"
            name={structureData.structureRaisonSociale}
            subtitle={formatActivityTags(structureData.tags || [], 'Structure')}
            onClick={() => {
              if (structureData?.structureId) {
                navigateToEntity('structure', structureData.structureId, structureData.structureRaisonSociale);
              } else if (structureData.id) {
                const originalId = structureData.id?.replace('unified_structure_', '');
                if (originalId) {
                  navigateToEntity('structure', originalId, structureData.structureRaisonSociale);
                }
              }
            }}
            icon={<i className="bi bi-building" style={{ fontSize: '1.2rem' }}></i>}
            compact={true}
            actions={[
              {
                icon: 'bi-eye',
                label: 'Ouvrir',
                tooltip: 'Ouvrir la fiche structure',
                variant: 'Primary',
                onClick: () => onOpenStructureFiche && onOpenStructureFiche(structureData)
              },
              {
                icon: 'bi-pencil',
                label: 'Modifier',
                tooltip: 'Modifier cette structure',
                variant: 'Secondary',
                onClick: () => onEditStructure && onEditStructure(structureData)
              },
              {
                icon: 'bi-chat-quote',
                label: 'Commentaire',
                tooltip: 'Ajouter un commentaire',
                variant: 'Secondary',
                onClick: () => onAddCommentToStructure && onAddCommentToStructure(structureData)
              }
            ].filter(action => action.onClick)}
          />
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

export default ContactPersonsSection;