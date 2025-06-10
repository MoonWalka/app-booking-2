import React from 'react';
import styles from './ContactSearchSection.module.css';
import SearchDropdown from '@/components/concerts/sections/SearchDropdown';
import SelectedEntityCard from '@/components/concerts/sections/SelectedEntityCard';
import Card from '@/components/ui/Card';
import { useEntitySearch } from '@/hooks/common';

/**
 * LieuContactSearchSection - Section de recherche et sélection de contacts pour un lieu
 * Utilise la recherche bidirectionnelle et permet d'associer plusieurs contacts
 */
const LieuContactSearchSection = ({ 
  lieu,
  isEditing = false,
  onContactsChange
}) => {
  // État local pour gérer la liste des contacts
  const [contactsList, setContactsList] = React.useState([]);
  const [showAddContact, setShowAddContact] = React.useState(true);
  
  // Hook de recherche de contacts avec bidirectionnalité
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
  
  // Initialiser la liste avec les contacts existants du lieu
  React.useEffect(() => {
    const loadExistingContacts = async () => {
      if (lieu.contactIds && lieu.contactIds.length > 0 && contactsList.length === 0) {
        console.log('[LieuContactSearchSection] Chargement des contacts existants:', lieu.contactIds);
        try {
          const { doc, getDoc, db } = await import('@/services/firebase-service');
          
          const contactPromises = lieu.contactIds.map(async (contactId) => {
            const contactDoc = await getDoc(doc(db, 'contacts', contactId));
            if (contactDoc.exists()) {
              return { id: contactDoc.id, ...contactDoc.data() };
            }
            return null;
          });
          
          const loadedContacts = (await Promise.all(contactPromises)).filter(Boolean);
          console.log('[LieuContactSearchSection] Contacts chargés:', loadedContacts);
          setContactsList(loadedContacts);
        } catch (error) {
          console.error('[LieuContactSearchSection] Erreur chargement contacts:', error);
        }
      }
    };
    
    loadExistingContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lieu.contactIds]); // Retirer contactsList.length pour éviter les boucles infinies
  
  // Fonction pour ajouter un contact à la liste
  const handleAddContactToList = (contact) => {
    if (contact && !contactsList.find(c => c.id === contact.id)) {
      const newList = [...contactsList, contact];
      setContactsList(newList);
      setSearchTerm('');
      setShowAddContact(false);
      
      // Notifier le parent avec les IDs des contacts
      if (onContactsChange) {
        onContactsChange(newList.map(c => c.id));
      }
    }
  };
  
  // Fonction pour retirer un contact de la liste
  const handleRemoveContactFromList = (contactId) => {
    const updatedList = contactsList.filter(c => c.id !== contactId);
    setContactsList(updatedList);
    
    // Notifier le parent
    if (onContactsChange) {
      onContactsChange(updatedList.map(c => c.id));
    }
    
    if (updatedList.length === 0) {
      setShowAddContact(true);
    }
  };
  
  return (
    <Card
      title="Contact(s)"
      icon={<i className="bi bi-person"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
    >
      {isEditing ? (
        <div ref={dropdownRef}>
          {/* Afficher la liste des contacts ajoutés */}
          {contactsList.length > 0 && (
            <>
              <label className={styles.formLabel}>
                {contactsList.length === 1 ? 'Contact sélectionné' : `${contactsList.length} contacts sélectionnés`}
              </label>
              <div className={styles.contactsList}>
                {contactsList.map((contact) => (
                  <div key={contact.id} className={styles.contactItem}>
                    <SelectedEntityCard
                      entity={contact}
                      entityType="contact"
                      onRemove={() => handleRemoveContactFromList(contact.id)}
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
              
              {/* Bouton pour ajouter un autre contact */}
              {!showAddContact && (
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
          {(contactsList.length === 0 || showAddContact) && (
            <>
              <label className={styles.formLabel}>
                {contactsList.length === 0 ? 'Rechercher un contact' : 'Ajouter un autre contact'}
              </label>
              <SearchDropdown
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                results={results}
                showResults={showResults}
                setShowResults={setShowResults}
                isSearching={isSearching}
                placeholder="Rechercher un contact par nom..."
                onSelect={handleAddContactToList}
                onCreate={() => handleCreateContact(handleAddContactToList)}
                createButtonText="Nouveau contact"
                emptyResultsText="Aucun contact trouvé"
                entityType="contact"
              />
              <small className={styles.formHelpText}>
                Tapez au moins 2 caractères pour rechercher un contact par nom.
              </small>
              
              {showAddContact && contactsList.length > 0 && (
                <button
                  type="button"
                  className={styles.cancelAddButton}
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
        </div>
      ) : (
        <div>
          {contactsList.length > 0 ? (
            <div className={styles.contactsList}>
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
            <p className={styles.fieldEmpty}>Aucun contact associé</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default LieuContactSearchSection;