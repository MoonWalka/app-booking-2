// src/components/contacts/desktop/sections/ContactHeaderV2.js
import React from 'react';
import { ActionButtons } from '@/components/ui/ActionButtons';
import StatusBadge from '@/components/ui/StatusBadge';
import styles from './ContactHeader.module.css';

/**
 * Header moderne pour les détails d'un contact
 * Basé sur ConcertHeader
 */
const ContactHeaderV2 = ({
  contact,
  onEdit,
  onDelete,
  isEditMode,
  formatDate,
  navigateToList,
  onSave,
  onCancel,
  isSubmitting,
  canSave
}) => {
  
  if (!contact && !isEditMode) {
    return null;
  }

  const contactName = contact?.prenom ? `${contact.prenom} ${contact.nom}` : contact?.nom || 'Nouveau contact';
  const contactStructure = contact?.structure || contact?.structureNom || '';

  return (
    <div className={styles.contactHeader}>
      <div className={styles.headerContent}>
        {/* Titre et informations principales */}
        <div className={styles.titleSection}>
          <div className={styles.backButton}>
            <button 
              onClick={navigateToList}
              className="tc-btn tc-btn-outline-secondary"
              aria-label="Retour à la liste"
            >
              <i className="bi bi-arrow-left"></i>
            </button>
          </div>
          
          <div className={styles.titleInfo}>
            <h1 className={styles.contactTitle}>
              {contactName}
            </h1>
            {contactStructure && (
              <div className={styles.contactSubtitle}>
                <i className="bi bi-building"></i>
                {contactStructure}
              </div>
            )}
            {contact?.email && (
              <div className={styles.contactSubtitle}>
                <i className="bi bi-envelope"></i>
                {contact.email}
              </div>
            )}
          </div>
        </div>

        {/* Badge de statut (si applicable) */}
        <div className={styles.statusSection}>
          {contact?.statut && (
            <StatusBadge 
              statut={contact.statut}
              entityType="contact"
            />
          )}
        </div>

        {/* Boutons d'action */}
        <div className={styles.actionsSection}>
          <ActionButtons
            entity={contact}
            entityType="contact"
            onEdit={onEdit}
            onDelete={onDelete}
            isEditMode={isEditMode}
            isSubmitting={isSubmitting}
            canSave={canSave}
            onSave={onSave}
            onCancel={onCancel}
            customActions={[
              {
                label: 'Voir concerts',
                icon: 'bi-music-note-list',
                onClick: () => {
                  // TODO: Naviguer vers concerts filtrés par ce contact
                },
                variant: 'outline-info',
                condition: !isEditMode && contact?.id
              }
            ]}
          />
        </div>
      </div>

      {/* Informations supplémentaires en mode lecture */}
      {!isEditMode && contact && (
        <div className={styles.headerDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              <i className="bi bi-calendar-plus"></i>
              Créé le:
            </span>
            <span className={styles.detailValue}>
              {contact.createdAt ? formatDate(contact.createdAt) : 'Non spécifié'}
            </span>
          </div>
          
          {contact.updatedAt && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>
                <i className="bi bi-pencil-square"></i>
                Modifié le:
              </span>
              <span className={styles.detailValue}>
                {formatDate(contact.updatedAt)}
              </span>
            </div>
          )}

          {contact.telephone && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>
                <i className="bi bi-telephone"></i>
                Téléphone:
              </span>
              <span className={styles.detailValue}>
                <a href={`tel:${contact.telephone}`} className="contact-link">
                  {contact.telephone}
                </a>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactHeaderV2;