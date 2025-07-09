import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import CardSection from '@/components/ui/CardSection';
import SearchDropdown from '@/components/dates/sections/SearchDropdown';
import SelectedEntityCard from '@/components/dates/sections/SelectedEntityCard';
import contactServiceRelational from '@/services/contactServiceRelational';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useNavigate } from 'react-router-dom';
import styles from './ContactSelectorRelational.module.css';

/**
 * Composant pour la sélection de contacts utilisant le système relationnel
 * Remplace UnifiedContactSelector en utilisant structures/personnes au lieu de contacts
 * 
 * @param {Object} props
 * @param {boolean} props.multiple - Si true, permet la sélection de plusieurs contacts
 * @param {string|Array} props.value - ID(s) du/des contact(s) sélectionné(s)
 * @param {Function} props.onChange - Callback appelé lors du changement (reçoit un ID ou un tableau d'IDs)
 * @param {boolean} props.isEditing - Si true, affiche en mode édition
 * @param {string} props.entityId - ID de l'entité parente (pour les relations bidirectionnelles)
 * @param {string} props.entityType - Type de l'entité parente ('date', 'lieu', etc.)
 * @param {string} props.label - Label à afficher
 * @param {boolean} props.required - Si true, au moins un contact est requis
 */
const ContactSelectorRelational = ({
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
  // État local
  const [contactsList, setContactsList] = useState([]);
  const [showAddContact, setShowAddContact] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const { currentEntreprise } = useEntreprise();
  const navigate = useNavigate();

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
          
          // Utiliser le service relationnel pour récupérer le contact
          try {
            const contact = await contactServiceRelational.getContactById(contactId);
            return contact;
          } catch (error) {
            console.error(`Erreur chargement contact ${contactId}:`, error);
            return null;
          }
        });

        const loadedContacts = (await Promise.all(contactPromises)).filter(Boolean);
        setContactsList(loadedContacts);

        // En mode mono-contact, masquer le formulaire d'ajout si un contact est chargé
        if (!multiple && loadedContacts.length > 0) {
          setShowAddContact(false);
        }
      } catch (error) {
        console.error('[ContactSelectorRelational] Erreur chargement contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingContacts();
  }, [value, multiple]);

  // Recherche de contacts avec debounce
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setShowResults(true);

      try {
        const results = await contactServiceRelational.searchContacts(
          searchTerm,
          currentEntreprise?.id
        );
        
        // Filtrer les contacts déjà sélectionnés
        const existingIds = contactsList.map(c => c.id);
        const filteredResults = results.all.filter(
          contact => !existingIds.includes(contact.id)
        );
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Erreur recherche contacts:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, currentEntreprise?.id, contactsList]);

  // Gérer l'ajout d'un contact
  const handleAddContact = useCallback((contact) => {
    if (!contact) return;

    const newContactsList = multiple 
      ? [...contactsList, contact]
      : [contact];

    setContactsList(newContactsList);
    setSearchTerm('');
    setShowResults(false);

    // En mode mono-contact, masquer le formulaire d'ajout
    if (!multiple) {
      setShowAddContact(false);
    }

    // Notifier le composant parent
    const newValue = multiple 
      ? newContactsList.map(c => c.id)
      : contact.id;
    
    onChange(newValue);
  }, [contactsList, multiple, onChange]);

  // Gérer la suppression d'un contact
  const handleRemoveContact = useCallback((contactId) => {
    const newContactsList = contactsList.filter(c => c.id !== contactId);
    setContactsList(newContactsList);

    // En mode mono-contact, réafficher le formulaire d'ajout
    if (!multiple) {
      setShowAddContact(true);
    }

    // Notifier le composant parent
    const newValue = multiple 
      ? newContactsList.map(c => c.id)
      : '';
    
    onChange(newValue);
  }, [contactsList, multiple, onChange]);

  // Gérer la création d'un nouveau contact
  const handleCreateContact = useCallback(() => {
    // Rediriger vers la page de création de structure ou personne
    navigate('/contacts/nouveau');
  }, [navigate]);

  // Gérer le clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Si non éditable, afficher simplement la liste
  if (!isEditing) {
    return (
      <CardSection
        title={label}
        icon={<i className="bi bi-person"></i>}
        className={className}
      >
        {contactsList.length > 0 ? (
          <div className={styles.contactsList}>
            {contactsList.map((contact) => (
              <div key={contact.id} className={styles.contactInfo}>
                <div className={styles.contactName}>
                  {contact.nom}
                  {contact.prenom && ` ${contact.prenom}`}
                </div>
                {contact.structures?.[0]?.nom && (
                  <div className={styles.contactStructure}>
                    {contact.structures[0].nom}
                  </div>
                )}
                {contact.email && (
                  <div className={styles.contactDetail}>
                    <i className="bi bi-envelope"></i> {contact.email}
                  </div>
                )}
                {contact.telephone && (
                  <div className={styles.contactDetail}>
                    <i className="bi bi-telephone"></i> {contact.telephone}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Aucun contact associé</p>
        )}
      </CardSection>
    );
  }

  // Mode édition
  return (
    <CardSection
      title={label}
      icon={<i className="bi bi-person"></i>}
      required={required}
      className={className}
    >
      {/* Liste des contacts sélectionnés */}
      {contactsList.length > 0 && (
        <div className={styles.selectedContacts}>
          {contactsList.map((contact) => (
            <SelectedEntityCard
              key={contact.id}
              entity={contact}
              onRemove={() => handleRemoveContact(contact.id)}
              displayInfo={[
                { label: 'Structure', value: contact.structures?.[0]?.nom },
                { label: 'Email', value: contact.email },
                { label: 'Téléphone', value: contact.telephone }
              ]}
            />
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {(multiple || showAddContact) && (
        <div ref={dropdownRef} className={styles.searchContainer}>
          <SearchDropdown
            placeholder="Rechercher un contact..."
            value={searchTerm}
            onChange={setSearchTerm}
            results={searchResults}
            showResults={showResults}
            isSearching={isSearching}
            onSelectResult={handleAddContact}
            onCreateNew={handleCreateContact}
            createLabel="Créer un nouveau contact"
            emptyMessage="Aucun contact trouvé"
            minSearchLength={2}
            renderResult={(contact) => (
              <div>
                <div className={styles.resultName}>
                  {contact.nom}
                  {contact.prenom && ` ${contact.prenom}`}
                </div>
                {contact.structures?.[0]?.nom && (
                  <small className={styles.resultDetail}>
                    {contact.structures[0].nom}
                  </small>
                )}
              </div>
            )}
          />
        </div>
      )}

      {/* Message d'aide */}
      {isEditing && (
        <small className="text-muted d-block mt-2">
          Tapez au moins 2 caractères pour rechercher un contact
        </small>
      )}
    </CardSection>
  );
};

ContactSelectorRelational.propTypes = {
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

export default ContactSelectorRelational;