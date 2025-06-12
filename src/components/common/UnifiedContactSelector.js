import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Card from '@/components/ui/Card';
import SearchDropdown from '@/components/concerts/sections/SearchDropdown';
import SelectedEntityCard from '@/components/concerts/sections/SelectedEntityCard';
import { useEntitySearch } from '@/hooks/common';
import { doc, getDoc, db } from '@/services/firebase-service';
import styles from './UnifiedContactSelector.module.css';

/**
 * Composant unifié pour la sélection de contacts
 * Gère à la fois le mode mono-contact et multi-contacts
 * 
 * @param {Object} props
 * @param {boolean} props.multiple - Si true, permet la sélection de plusieurs contacts
 * @param {string|Array} props.value - ID(s) du/des contact(s) sélectionné(s)
 * @param {Function} props.onChange - Callback appelé lors du changement (reçoit un ID ou un tableau d'IDs)
 * @param {boolean} props.isEditing - Si true, affiche en mode édition
 * @param {string} props.entityId - ID de l'entité parente (pour les relations bidirectionnelles)
 * @param {string} props.entityType - Type de l'entité parente ('concert', 'lieu', etc.)
 * @param {string} props.label - Label à afficher
 * @param {boolean} props.required - Si true, au moins un contact est requis
 */
const UnifiedContactSelector = ({
  multiple = false,
  value,
  onChange,
  isEditing = false,
  entityId,
  entityType,
  label = 'Contact(s)',
  required = false,
  className = ''
}) => {
  // État local pour la liste des contacts
  const [contactsList, setContactsList] = useState([]);
  const [showAddContact, setShowAddContact] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Hook de recherche de contacts
  const {
    searchTerm,
    setSearchTerm,
    results,
    showResults,
    setShowResults,
    isSearching,
    dropdownRef,
    handleCreate: handleCreateContact
  } = useEntitySearch({
    entityType: 'contacts',
    searchField: 'nom',
    additionalSearchFields: ['email', 'telephone', 'structureNom'],
    maxResults: 10
  });

  // Charger les contacts existants au montage
  useEffect(() => {
    const loadExistingContacts = async () => {
      // Normaliser la valeur en tableau pour simplifier la logique
      const normalizedValue = Array.isArray(value) 
        ? value 
        : (value ? [value] : []);

      if (normalizedValue.length === 0) {
        setContactsList([]);
        return;
      }

      setIsLoading(true);
      try {
        const contactPromises = normalizedValue.map(async (contactId) => {
          if (!contactId) return null;
          const contactDoc = await getDoc(doc(db, 'contacts', contactId));
          if (contactDoc.exists()) {
            return { id: contactDoc.id, ...contactDoc.data() };
          }
          return null;
        });

        const loadedContacts = (await Promise.all(contactPromises)).filter(Boolean);
        setContactsList(loadedContacts);

        // En mode mono-contact, masquer le formulaire d'ajout si un contact est chargé
        if (!multiple && loadedContacts.length > 0) {
          setShowAddContact(false);
        }
      } catch (error) {
        console.error('[UnifiedContactSelector] Erreur chargement contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingContacts();
  }, [value, multiple]);

  // Gérer l'ajout d'un contact
  const handleAddContact = useCallback((contact) => {
    if (!contact) return;

    let newList;
    if (multiple) {
      // Mode multi-contacts : ajouter à la liste
      if (contactsList.find(c => c.id === contact.id)) return; // Éviter les doublons
      newList = [...contactsList, contact];
    } else {
      // Mode mono-contact : remplacer
      newList = [contact];
    }

    setContactsList(newList);
    setSearchTerm('');
    setShowAddContact(false);

    // Notifier le parent
    const newValue = multiple 
      ? newList.map(c => c.id)
      : newList[0]?.id || null;
    
    onChange(newValue);
  }, [contactsList, multiple, onChange, setSearchTerm]);

  // Gérer la suppression d'un contact
  const handleRemoveContact = useCallback((contactId) => {
    const newList = contactsList.filter(c => c.id !== contactId);
    setContactsList(newList);

    // Notifier le parent
    const newValue = multiple 
      ? newList.map(c => c.id)
      : null;
    
    onChange(newValue);

    // Réafficher le formulaire d'ajout si nécessaire
    if (newList.length === 0 || (!multiple && newList.length === 0)) {
      setShowAddContact(true);
    }
  }, [contactsList, multiple, onChange]);

  // Gérer la création d'un nouveau contact
  const handleNewContact = useCallback(() => {
    handleCreateContact((newContact) => {
      if (newContact) {
        handleAddContact(newContact);
      }
    });
  }, [handleCreateContact, handleAddContact]);

  // Affichage en mode lecture
  if (!isEditing) {
    return (
      <Card
        title={label}
        icon={<i className="bi bi-person"></i>}
        isHoverable={true}
        className={className}
      >
        {contactsList.length > 0 ? (
          <div className={styles.readOnlyList}>
            {contactsList.map((contact) => (
              <div key={contact.id} className={styles.contactItem}>
                <div className={styles.contactInfo}>
                  <strong>{contact.nom}</strong>
                  {contact.structureNom && (
                    <span className={styles.structure}> - {contact.structureNom}</span>
                  )}
                </div>
                {(contact.email || contact.telephone) && (
                  <div className={styles.contactDetails}>
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className={styles.contactLink}>
                        <i className="bi bi-envelope"></i> {contact.email}
                      </a>
                    )}
                    {contact.telephone && (
                      <a href={`tel:${contact.telephone}`} className={styles.contactLink}>
                        <i className="bi bi-telephone"></i> {contact.telephone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noContact}>Aucun contact associé</p>
        )}
      </Card>
    );
  }

  // Affichage en mode édition
  return (
    <Card
      title={label}
      icon={<i className="bi bi-person"></i>}
      isEditing={true}
      className={className}
    >
      <div ref={dropdownRef}>
        {/* Liste des contacts sélectionnés */}
        {contactsList.length > 0 && (
          <>
            <label className={styles.selectedLabel}>
              {multiple 
                ? `${contactsList.length} contact${contactsList.length > 1 ? 's' : ''} sélectionné${contactsList.length > 1 ? 's' : ''}`
                : 'Contact sélectionné'
              }
            </label>
            <div className={styles.selectedList}>
              {contactsList.map((contact) => (
                <div key={contact.id} className={styles.selectedItem}>
                  <SelectedEntityCard
                    entity={contact}
                    entityType="contact"
                    onRemove={() => handleRemoveContact(contact.id)}
                    primaryField="nom"
                    secondaryFields={[
                      { 
                        icon: "bi-building", 
                        value: contact.structureNom || contact.structure
                      },
                      { 
                        icon: "bi-envelope", 
                        value: contact.email 
                      },
                      { 
                        icon: "bi-telephone", 
                        value: contact.telephone 
                      }
                    ]}
                  />
                </div>
              ))}
            </div>

            {/* Bouton pour ajouter un autre contact (mode multi uniquement) */}
            {multiple && !showAddContact && (
              <button
                type="button"
                className={styles.addAnotherButton}
                onClick={() => setShowAddContact(true)}
              >
                <i className="bi bi-plus-circle"></i>
                Ajouter un autre contact
              </button>
            )}
          </>
        )}

        {/* Formulaire de recherche/ajout */}
        {(contactsList.length === 0 || (multiple && showAddContact)) && (
          <>
            <label className={styles.searchLabel}>
              {contactsList.length === 0 
                ? `Rechercher un contact${required ? ' *' : ''}`
                : 'Ajouter un autre contact'
              }
            </label>
            <SearchDropdown
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              results={results}
              showResults={showResults}
              setShowResults={setShowResults}
              isSearching={isSearching}
              placeholder="Rechercher un contact par nom..."
              onSelect={handleAddContact}
              onCreate={handleNewContact}
              createButtonText="Nouveau contact"
              emptyResultsText="Aucun contact trouvé"
              entityType="contact"
            />
            <small className={styles.helpText}>
              Tapez au moins 2 caractères pour rechercher un contact par nom.
            </small>

            {/* Bouton annuler (mode multi avec contacts existants) */}
            {multiple && showAddContact && contactsList.length > 0 && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setShowAddContact(false);
                  setSearchTerm('');
                }}
              >
                Annuler
              </button>
            )}
          </>
        )}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className={styles.loading}>
            <i className="bi bi-arrow-repeat spin"></i> Chargement...
          </div>
        )}
      </div>
    </Card>
  );
};

UnifiedContactSelector.propTypes = {
  multiple: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  entityId: PropTypes.string,
  entityType: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string
};

export default UnifiedContactSelector;