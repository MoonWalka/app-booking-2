import React from 'react';
import Button from '@/components/ui/Button';
import styles from '../LieuForm.module.css';

const LieuContactSection = ({ contactSearch }) => {
  // Defensive: fallback to empty array and no-op if undefined
  const {
    query = '',
    setQuery = () => {},
    contacts = [],
    isLoading = false,
    handleSearch = () => {},
    selectContact = () => {},
    removeContact = () => {}
  } = contactSearch || {};

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>Contact associé</h3>
      
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher un contact..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        {isLoading && <div className={styles.spinner}></div>}
        
        {contacts.length > 0 && (
          <ul className={styles.searchSuggestions}>
            {contacts.map(contact => (
              <li 
                key={contact.id}
                onClick={() => selectContact(contact)}
                className={styles.suggestionItem}
              >
                {contact.nom}
                <span className={styles.suggestionSubtext}>
                  {contact.structure || 'Aucune structure'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {contactSearch.contactId && (
        <div className={styles.selectedContact}>
          <div className={styles.selectedContactInfo}>
            <h4>{contactSearch.contactNom}</h4>
          </div>
          <Button 
            type="button"
            variant="danger"
            size="small"
            onClick={removeContact}
          >
            <i className="bi bi-x-circle"></i> Retirer
          </Button>
        </div>
      )}
    </div>
  );
};

export default LieuContactSection;
