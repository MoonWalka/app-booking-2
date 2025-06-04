import React from 'react';
import styles from './ContactSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import CardSection from '@/components/ui/CardSection';

/**
 * ContactSearchSection - Section de recherche et sélection de contact(s)
 * Permet d'ajouter plusieurs contacts sous forme de liste
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.progSearchTerm - Terme de recherche pour le contact
 * @param {Function} props.setProgSearchTerm - Fonction pour mettre à jour le terme de recherche
 * @param {Array} props.progResults - Résultats de la recherche de contacts
 * @param {boolean} props.showProgResults - Indique si les résultats doivent être affichés
 * @param {Function} props.setShowProgResults - Fonction pour contrôler l'affichage des résultats
 * @param {boolean} props.isSearchingProgs - Indique si une recherche est en cours
 * @param {Object} props.progDropdownRef - Référence pour gérer le clic en dehors du dropdown
 * @param {Object} props.selectedContact - Contact sélectionné
 * @param {Function} props.handleSelectContact - Fonction pour sélectionner un contact
 * @param {Function} props.handleRemoveContact - Fonction pour désélectionner le contact
 * @param {Function} props.handleCreateContact - Fonction pour créer un nouveau contact
 */
const ContactSearchSection = ({ 
  progSearchTerm, 
  setProgSearchTerm,
  progResults,
  showProgResults,
  setShowProgResults,
  isSearchingProgs,
  progDropdownRef,
  selectedContact,
  handleSelectContact,
  handleRemoveContact,
  handleCreateContact
}) => {
  // État local pour gérer la liste des contacts
  const [contactsList, setContactsList] = React.useState([]);
  const [showAddContact, setShowAddContact] = React.useState(true);
  
  // Synchroniser avec le contact sélectionné passé en prop
  React.useEffect(() => {
    if (selectedContact && !contactsList.find(p => p.id === selectedContact.id)) {
      setContactsList([selectedContact]);
      setShowAddContact(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact?.id]);
  
  // Fonction pour ajouter un contact à la liste
  const handleAddContactToList = (contact) => {
    if (contact && !contactsList.find(p => p.id === contact.id)) {
      setContactsList([...contactsList, contact]);
      setProgSearchTerm('');
      setShowAddContact(false);
      // Toujours garder le premier contact comme selectedContact pour la compatibilité
      if (contactsList.length === 0) {
        handleSelectContact(contact);
      }
    }
  };
  
  // Fonction pour retirer un contact de la liste
  const handleRemoveContactFromList = (contactId) => {
    const updatedList = contactsList.filter(p => p.id !== contactId);
    setContactsList(updatedList);
    // Si on retire le contact principal, mettre à jour
    if (selectedContact && selectedContact.id === contactId) {
      if (updatedList.length > 0) {
        handleSelectContact(updatedList[0]);
      } else {
        handleRemoveContact();
        setShowAddContact(true);
      }
    }
  };
  
  return (
    <CardSection
      title="Contact(s)"
      icon={<i className="bi bi-person"></i>}
      isEditing={true}
      hasDropdown={true}
      className="contact-section"
      headerClassName="contact"
    >
      <div className={styles.cardBody} ref={progDropdownRef}>
        {/* Afficher la liste des contacts ajoutés */}
        {contactsList.length > 0 && (
          <>
            <label className={styles.formLabel}>
              {contactsList.length === 1 ? 'Contact sélectionné' : `${contactsList.length} contacts sélectionnés`}
            </label>
            <div className={styles.contactsList}>
              {contactsList.map((contact, index) => (
                <div key={contact.id} className={styles.contactItem}>
                  <SelectedEntityCard
                    entity={contact}
                    entityType="contact"
                    onRemove={() => handleRemoveContactFromList(contact.id)}
                    primaryField="nom"
                    secondaryFields={[
                      { 
                        icon: "bi-building", 
                        value: contact.structure 
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
                  {index === 0 && contactsList.length > 1 && (
                    <span className={styles.principalBadge}>Principal</span>
                  )}
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
              searchTerm={progSearchTerm}
              setSearchTerm={setProgSearchTerm}
              results={progResults}
              showResults={showProgResults}
              setShowResults={setShowProgResults}
              isSearching={isSearchingProgs}
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
                  setProgSearchTerm('');
                }}
              >
                Annuler
              </button>
            )}
          </>
        )}
      </div>
    </CardSection>
  );
};

export default ContactSearchSection;
