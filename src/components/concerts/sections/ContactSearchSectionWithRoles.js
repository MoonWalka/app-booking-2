import React, { useState } from 'react';
import styles from './ContactSearchSection.module.css';
import SearchDropdown from './SearchDropdown';
import SelectedEntityCard from './SelectedEntityCard';
import ContactWithRoleSelector from './ContactWithRoleSelector';
import CardSection from '@/components/ui/CardSection';

/**
 * Version améliorée de ContactSearchSection qui gère les rôles des contacts
 * Permet d'avoir plusieurs contacts avec des rôles différents (coordinateur, signataire, etc.)
 */
const ContactSearchSectionWithRoles = React.memo(({ 
  progSearchTerm, 
  setProgSearchTerm,
  progResults,
  showProgResults,
  setShowProgResults,
  isSearchingProg,
  progDropdownRef,
  selectedContact,
  handleSelectContact,
  handleRemoveContact,
  handleCreateProgrammateur,
  // Nouvelles props pour la gestion des rôles
  contactsWithRoles = [],
  onContactsWithRolesChange
}) => {
  const [showAddContact, setShowAddContact] = useState(false);
  
  // État local pour gérer la liste des contacts avec leurs rôles
  const [contactsList, setContactsList] = useState(() => {
    // Initialiser avec les contacts existants ou le contact unique
    if (contactsWithRoles && contactsWithRoles.length > 0) {
      return contactsWithRoles;
    } else if (selectedContact) {
      return [{
        ...selectedContact,
        role: 'coordinateur',
        isPrincipal: true
      }];
    }
    return [];
  });

  // Synchroniser avec les props
  React.useEffect(() => {
    if (contactsWithRoles && contactsWithRoles.length > 0) {
      setContactsList(contactsWithRoles);
    }
  }, [contactsWithRoles]);

  // Fonction pour ajouter un contact avec un rôle par défaut
  const handleAddContactToList = (contact, role = 'coordinateur') => {
    if (contact && !contactsList.find(c => c.id === contact.id)) {
      const newContact = {
        ...contact,
        role: role,
        isPrincipal: contactsList.length === 0 // Le premier est principal
      };
      
      const updatedList = [...contactsList, newContact];
      setContactsList(updatedList);
      setProgSearchTerm('');
      setShowAddContact(false);
      
      // Notifier le parent
      if (onContactsWithRolesChange) {
        onContactsWithRolesChange(updatedList);
      }
      
      // Maintenir la compatibilité avec l'ancien système
      if (contactsList.length === 0 && handleSelectContact) {
        handleSelectContact(contact);
      }
    }
  };

  // Fonction pour changer le rôle d'un contact
  const handleRoleChange = (contactId, newRole) => {
    const updatedList = contactsList.map(contact => 
      contact.id === contactId 
        ? { ...contact, role: newRole }
        : contact
    );
    setContactsList(updatedList);
    
    if (onContactsWithRolesChange) {
      onContactsWithRolesChange(updatedList);
    }
  };

  // Fonction pour retirer un contact de la liste
  const handleRemoveContactFromList = (contactId) => {
    const updatedList = contactsList.filter(c => c.id !== contactId);
    setContactsList(updatedList);
    
    // Si on retire le contact principal, promouvoir le suivant
    const removedContact = contactsList.find(c => c.id === contactId);
    if (removedContact?.isPrincipal && updatedList.length > 0) {
      updatedList[0].isPrincipal = true;
    }
    
    if (onContactsWithRolesChange) {
      onContactsWithRolesChange(updatedList);
    }
    
    // Maintenir la compatibilité
    if (selectedContact && selectedContact.id === contactId) {
      if (updatedList.length > 0 && handleSelectContact) {
        handleSelectContact(updatedList[0]);
      } else if (handleRemoveContact) {
        handleRemoveContact();
        setShowAddContact(true);
      }
    }
  };

  // Fonction spéciale pour créer un contact signataire depuis le formulaire public
  // TODO: Implémenter cette fonction quand nécessaire
  // eslint-disable-next-line no-unused-vars
  const createSignataireFromPublicForm = (signataireData) => {
    const newContact = {
      id: `temp-${Date.now()}`, // ID temporaire, sera remplacé après création
      nom: `${signataireData.prenom} ${signataireData.nom}`,
      prenom: signataireData.prenom,
      email: signataireData.email || '',
      telephone: signataireData.telephone || '',
      fonction: signataireData.fonction || '',
      role: 'signataire',
      isPrincipal: false,
      isFromPublicForm: true // Marqueur pour identifier l'origine
    };
    
    handleAddContactToList(newContact, 'signataire');
  };

  // Props pour le SearchDropdown
  const progSearchProps = {
    searchTerm: progSearchTerm,
    setSearchTerm: setProgSearchTerm,
    results: progResults,
    showResults: showProgResults,
    setShowResults: setShowProgResults,
    isSearching: isSearchingProg,
    placeholder: "Rechercher un contact par nom, email...",
    emptyResultsText: "Aucun contact trouvé",
    onSelect: (contact) => handleAddContactToList(contact),
    onCreate: handleCreateProgrammateur ? 
      () => handleCreateProgrammateur((newContact) => handleAddContactToList(newContact)) : 
      undefined,
    createButtonText: "Nouveau contact",
    entityType: "contact"
  };

  return (
    <CardSection
      title="Contacts"
      icon={<i className="bi bi-people"></i>}
      isEditing={true}
      hasDropdown={true}
      className="contact-section"
      headerClassName="contact"
    >
      <div className={styles.cardBody} ref={progDropdownRef}>
        {/* Afficher la liste des contacts avec leurs rôles */}
        {contactsList.length > 0 && (
          <>
            <label className={styles.formLabel}>
              {contactsList.length === 1 ? 'Contact' : `${contactsList.length} contacts`} - Rôles attribués
            </label>
            <div className={styles.contactsList}>
              {contactsList.map((contact, index) => (
                <div key={contact.id} className={styles.contactItemWithRole}>
                  <SelectedEntityCard
                    entity={contact}
                    entityType="contact"
                    onRemove={() => handleRemoveContactFromList(contact.id)}
                    primaryField="nom"
                    secondaryFields={[
                      { 
                        icon: "bi-briefcase", 
                        value: contact.fonction 
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
                  <div className={styles.contactRole}>
                    <ContactWithRoleSelector
                      contact={contact}
                      currentRole={contact.role}
                      onRoleChange={handleRoleChange}
                    />
                    {contact.isPrincipal && (
                      <span className={styles.principalBadge}>Principal</span>
                    )}
                    {contact.isFromPublicForm && (
                      <span className={styles.publicFormBadge}>
                        <i className="bi bi-globe"></i> Formulaire public
                      </span>
                    )}
                  </div>
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
            <SearchDropdown {...progSearchProps} />
          </>
        )}

        <div className={styles.helpSection}>
          <small className={styles.helpText}>
            <i className="bi bi-info-circle"></i>
            Les contacts peuvent avoir différents rôles : coordinateur, signataire, technique, etc.
            Le contact signataire sera utilisé pour la génération du contrat.
          </small>
        </div>
      </div>
    </CardSection>
  );
});

// Exporter aussi la fonction pour créer un signataire depuis les données du formulaire public
export const createSignataireContact = (signataireData) => {
  return {
    nom: `${signataireData.prenom} ${signataireData.nom}`,
    prenom: signataireData.prenom,
    email: signataireData.email || '',
    telephone: signataireData.telephone || '',
    fonction: signataireData.fonction || '',
    role: 'signataire',
    isPrincipal: false,
    isFromPublicForm: true
  };
};

export default ContactSearchSectionWithRoles;